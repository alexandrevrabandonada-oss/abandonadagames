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

  if (slug === "plantaono-vermelho") {
    return [
      { player: "Enf. Luana", score: 9120, createdAt: "19/06/2026 07:40" },
      { player: "Plantao 12h", score: 8760, createdAt: "19/06/2026 06:18" },
      { player: "Marmita Fria", score: 7420, createdAt: "18/06/2026 23:52" },
      { player: "Sem Folego", score: 6810, createdAt: "18/06/2026 22:31" },
      { player: "Fila Do Sus", score: 6130, createdAt: "18/06/2026 21:04" },
      { player: "Boleto Vivo", score: 5440, createdAt: "18/06/2026 19:45" },
      { player: "Turno Duplo", score: 4820, createdAt: "18/06/2026 10:10" },
    ];
  }

  return [
    { player: "Bia", score: 4820, createdAt: "18/06/2026 10:10" },
    { player: "Jota", score: 4390, createdAt: "18/06/2026 09:42" },
    { player: "Nina", score: 3975, createdAt: "18/06/2026 09:15" },
  ];
}
