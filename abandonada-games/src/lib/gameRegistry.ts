import fs from "node:fs";
import path from "node:path";
import type { RankingEntry } from "@/lib/score";

export type GameDefinition = {
  slug: string;
  title: string;
  template: string;
  tagline: string;
  summary: string;
  obstacles: string[];
  powerUps: string[];
};

const catalogDir = path.join(process.cwd(), "games", "catalog");

export function getAllGames(): GameDefinition[] {
  const slugs = fs
    .readdirSync(catalogDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return slugs.map((slug) => getGameBySlug(slug)).filter(Boolean) as GameDefinition[];
}

export function getGameBySlug(slug: string) {
  const filePath = path.join(catalogDir, slug, "game.json");
  if (!fs.existsSync(filePath)) return null;

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as GameDefinition;
}

export function getGameSlugs() {
  return getAllGames().map((game) => game.slug);
}

export function getRankingForGame(slug: string): RankingEntry[] {
  const ranking = getGameBySlug(slug);
  if (!ranking) return [];

  return [
    { player: "Bia", score: 4820, createdAt: "18/06/2026 10:10" },
    { player: "Jota", score: 4390, createdAt: "18/06/2026 09:42" },
    { player: "Nina", score: 3975, createdAt: "18/06/2026 09:15" },
  ];
}
