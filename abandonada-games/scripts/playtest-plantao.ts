import fs from "node:fs/promises";
import { chromium, type Page } from "@playwright/test";

const baseUrl = process.env.PLAYTEST_BASE_URL ?? "http://localhost:3082";
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const route = `${baseUrl}/jogar/plantaono-vermelho`;

type HudState = {
  day: string;
  energy: string;
  money: string;
  resultVisible: boolean;
  actionButtons: string[];
  rhythm: string;
  viralHook: boolean;
  toast: string;
};

type RankingState = {
  hasViralCta: boolean;
  hasTarget: boolean;
  entries: number;
};

async function readHud(page: Page): Promise<HudState> {
  const text = await page.locator("body").innerText();
  const day = text.match(/DIA\s+(\d+\s*\/\s*30)/i)?.[1]?.replace(/\s+/g, " ") ?? "missing";
  const energy = text.match(/ENERGIA\s+(\d+\s*\/\s*100)/i)?.[1]?.replace(/\s+/g, " ") ?? "missing";
  const money = text.match(/SALDO\s+(R\$\s*-?[\d.,]+)/i)?.[1]?.replace(/\s+/g, " ") ?? "missing";
  const resultVisible = /RESULTADO/i.test(text) || /JOGAR DE NOVO/i.test(text);
  const rhythm = text.match(/RITMO\s+DECISOES RAPIDAS\s+(\d+x)/i)?.[1] ?? "missing";
  const viralHook = /DESAFIO:|DESAFIO PUBLICO|RANKING LOCAL|COMPARTILHAR DESAFIO|SOBREVIVI|SEGUREI|BOLETO ENCOSTOU|JOGUE, PRINTE E DESAFIE/i.test(text);
  const actionButtons = await page.locator("button").evaluateAll((buttons) =>
    buttons
      .map((button) => button.textContent?.replace(/\s+/g, " ").trim() ?? "")
      .filter((label) => /TRABALHAR|FAZER BICO|ECONOMIZAR|CUIDAR DA SAUDE/i.test(label)),
  );
  const toast = text.match(/ARRASTE\s+([\s\S]+?)\s*(SUAS NECESSIDADES|RESULTADO|$)/i)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
  return { day, energy, money, resultVisible, actionButtons, rhythm, viralHook, toast };
}

async function clickAction(page: Page, label: RegExp) {
  const button = page.getByRole("button", { name: label }).first();
  await button.click({ timeout: 2000 });
}

async function readRanking(page: Page): Promise<RankingState> {
  const text = await page.locator("body").innerText();
  return {
    hasViralCta: /JOGAR DE NOVO E PASSAR GERAL|QUEM AGUENTA MAIS/i.test(text),
    hasTarget: /ALVO PARA VIRALIZAR/i.test(text),
    entries: (text.match(/PONTOS/gi) ?? []).length,
  };
}

async function run() {
  const browser = await chromium.launch({
    executablePath: edgePath,
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1536, height: 994 }, deviceScaleFactor: 1 });
  const events: string[] = [];
  page.on("console", (message) => events.push(`console:${message.type()}:${message.text()}`));
  page.on("pageerror", (error) => events.push(`pageerror:${error.message}`));

  await page.goto(route, { waitUntil: "networkidle" });
  await page.screenshot({ path: "reports/playtest-plantao-start.png", fullPage: false });
  const start = await readHud(page);

  const sequence = [/ECONOMIZAR/i, /TRABALHAR/i, /CUIDAR DA SAUDE/i, /FAZER BICO/i, /ECONOMIZAR/i, /TRABALHAR/i, /CUIDAR DA SAUDE/i, /ECONOMIZAR/i];
  const states: HudState[] = [start];
  const startedAt = Date.now();
  let clicks = 0;

  for (const action of sequence) {
    if ((await readHud(page)).resultVisible) break;
    await clickAction(page, action);
    clicks += 1;
    await page.waitForTimeout(900);
    states.push(await readHud(page));
  }

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const current = await readHud(page);
    if (current.resultVisible) break;
    const pressureAction = attempt % 3 === 0 ? /FAZER BICO/i : attempt % 3 === 1 ? /TRABALHAR/i : /CUIDAR DA SAUDE/i;
    await clickAction(page, pressureAction);
    clicks += 1;
    await page.waitForTimeout(950);
  }
  const final = await readHud(page);
  await page.screenshot({ path: "reports/playtest-plantao-after-loop.png", fullPage: false });
  const card = page.getByAltText("Card de resultado").first();
  const cardVisible = await card.isVisible().catch(() => false);
  if (cardVisible) {
    await card.screenshot({ path: "reports/playtest-plantao-share-card.png" });
    const cardBase64 = await card.evaluate(async (image) => {
      const src = (image as HTMLImageElement).src;
      const response = await fetch(src);
      const buffer = await response.arrayBuffer();
      let binary = "";
      for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
      return btoa(binary);
    });
    await fs.writeFile("reports/playtest-plantao-share-card-raw.png", Buffer.from(cardBase64, "base64"));
  }
  await page.goto(`${baseUrl}/ranking/plantaono-vermelho`, { waitUntil: "networkidle" });
  const ranking = await readRanking(page);
  await page.screenshot({ path: "reports/playtest-plantao-ranking.png", fullPage: false });

  const elapsedMs = Date.now() - startedAt;
  const report = {
    route,
    elapsedMs,
    clicks,
    start,
    states,
    final,
    ranking,
    browserEvents: events,
  };
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
