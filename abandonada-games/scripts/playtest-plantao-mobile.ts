import fs from "node:fs/promises";
import { chromium, devices, type Page } from "@playwright/test";

const baseUrl = process.env.PLAYTEST_BASE_URL ?? "http://localhost:3094";
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const route = `${baseUrl}/jogar/plantaono-vermelho`;
const mobile = devices["Pixel 7"];

async function readState(page: Page) {
  const text = await page.locator("body").innerText();
  return {
    day: text.match(/DIA\s+(\d+\s*\/\s*30)/i)?.[1]?.replace(/\s+/g, " ") ?? "missing",
    energy: text.match(/ENERGIA\s+(\d+\s*\/\s*100)/i)?.[1]?.replace(/\s+/g, " ") ?? "missing",
    money: text.match(/SALDO\s+(R\$\s*-?[\d.,]+)/i)?.[1]?.replace(/\s+/g, " ") ?? "missing",
    resultVisible: /RESULTADO|JOGAR DE NOVO/i.test(text),
    viralHook: /DESAFIO PUBLICO|RANKING LOCAL|COMPARTILHAR DESAFIO|SEGUREI|VIREI O MES/i.test(text),
    rankingCta: /JOGAR DE NOVO E PASSAR GERAL|ALVO PARA VIRALIZAR/i.test(text),
    actionButtons: await page.locator("button").evaluateAll((buttons) =>
      buttons
        .map((button) => button.textContent?.replace(/\s+/g, " ").trim() ?? "")
        .filter((label) => /TRABALHAR|FAZER BICO|ECONOMIZAR|CUIDAR DA SAUDE/i.test(label)),
    ),
  };
}

async function clickAction(page: Page, label: RegExp) {
  await page.getByRole("button", { name: label }).first().click({ timeout: 2500 });
}

async function saveRawCard(page: Page) {
  const card = page.getByAltText("Card de resultado").first();
  if (!(await card.isVisible().catch(() => false))) return false;
  await card.screenshot({ path: "reports/mobile-plantao-share-card-inline.png" });
  const cardBase64 = await card.evaluate(async (image) => {
    const response = await fetch((image as HTMLImageElement).src);
    const buffer = await response.arrayBuffer();
    let binary = "";
    for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
    return btoa(binary);
  });
  await fs.writeFile("reports/mobile-plantao-share-card-raw.png", Buffer.from(cardBase64, "base64"));
  return true;
}

async function run() {
  const browser = await chromium.launch({ executablePath: edgePath, headless: true });
  const page = await browser.newPage({ ...mobile });
  const browserEvents: string[] = [];
  page.on("console", (message) => browserEvents.push(`console:${message.type()}:${message.text()}`));
  page.on("pageerror", (error) => browserEvents.push(`pageerror:${error.message}`));

  await page.goto(route, { waitUntil: "networkidle" });
  await page.screenshot({ path: "reports/mobile-plantao-start.png", fullPage: false });
  const start = await readState(page);

  const actions = [/ECONOMIZAR/i, /TRABALHAR/i, /CUIDAR DA SAUDE/i, /FAZER BICO/i, /ECONOMIZAR/i, /TRABALHAR/i, /CUIDAR DA SAUDE/i, /FAZER BICO/i, /TRABALHAR/i, /CUIDAR DA SAUDE/i];
  let clicks = 0;
  for (const action of actions) {
    if ((await readState(page)).resultVisible) break;
    await clickAction(page, action);
    clicks += 1;
    await page.waitForTimeout(850);
  }
  await page.screenshot({ path: "reports/mobile-plantao-after-loop.png", fullPage: false });
  const afterLoop = await readState(page);
  await saveRawCard(page);

  await page.goto(`${baseUrl}/ranking/plantaono-vermelho`, { waitUntil: "networkidle" });
  await page.screenshot({ path: "reports/mobile-plantao-ranking.png", fullPage: false });
  const ranking = await readState(page);

  console.log(JSON.stringify({ route, clicks, start, afterLoop, ranking, browserEvents }, null, 2));
  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
