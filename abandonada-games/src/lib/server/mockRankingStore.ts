import fs from "node:fs";
import path from "node:path";
import type { RankingEntry, ScoreSubmission } from "@/lib/score";
import { getRankingForGame } from "@/lib/gameRegistry";

const dataFile = path.join(process.cwd(), "tmp", "mock-ranking.json");

function ensureFile() {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "{}", "utf8");
}

function readStore() {
  ensureFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf8")) as Record<string, RankingEntry[]>;
}

function writeStore(store: Record<string, RankingEntry[]>) {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2), "utf8");
}

export function appendMockScore(payload: ScoreSubmission) {
  const store = readStore();
  const current = store[payload.slug] ?? getRankingForGame(payload.slug);
  const entry = {
    player: payload.player,
    score: payload.score,
    createdAt: new Date().toLocaleString("pt-BR"),
  };

  store[payload.slug] = [...current, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  writeStore(store);
  return entry;
}

export function getApiRankingForGame(slug: string) {
  const store = readStore();
  return store[slug] ?? getRankingForGame(slug);
}
