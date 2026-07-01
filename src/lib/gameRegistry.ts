import fs from "node:fs";
import path from "node:path";
import type { RankingEntry } from "@/lib/score";

export type GameDefinition = {
  slug: string;
  title: string;
  template: string;
  tagline: string;
  summary: string;
  subtitle?: string;
  ctaLabel?: string;
  sharePrompt?: string;
  coverImage?: string;
  socialImage?: string;
  tags?: string[];
  obstacles: string[];
  powerUps: string[];
};

const catalogDir = path.join(process.cwd(), "games", "catalog");
const GAME_ORDER = [
  "cidade-de-aco-cartas-vr",
  "merendeira-no-vermelho",
  "plantaono-vermelho",
  "onibus-zero",
  "fila-invisivel",
] as const;

export function getAllGames(): GameDefinition[] {
  const slugs = fs
    .readdirSync(catalogDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => {
      const leftIndex = GAME_ORDER.indexOf(left as (typeof GAME_ORDER)[number]);
      const rightIndex = GAME_ORDER.indexOf(right as (typeof GAME_ORDER)[number]);

      if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right, "pt-BR");
      if (leftIndex === -1) return 1;
      if (rightIndex === -1) return -1;
      return leftIndex - rightIndex;
    });

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

  if (slug === "merendeira-no-vermelho") {
    return [
      { player: "Mutirão Quente", score: 4280, createdAt: "19/06/2026 14:32" },
      { player: "Panela Firme", score: 3960, createdAt: "19/06/2026 13:58" },
      { player: "Dia Virado", score: 3540, createdAt: "19/06/2026 13:17" },
      { player: "Merenda Viva", score: 3180, createdAt: "19/06/2026 12:41" },
    ];
  }

  if (slug === "cidade-de-aco-cartas-vr") {
    return [
      { player: "Praca Viva", score: 1910, createdAt: "29/06/2026 18:22" },
      { player: "Rio de Volta", score: 1760, createdAt: "29/06/2026 18:07" },
      { player: "Memoria em Luta", score: 1625, createdAt: "29/06/2026 17:54" },
    ];
  }

  return [
    { player: "Bia", score: 4820, createdAt: "18/06/2026 10:10" },
    { player: "Jota", score: 4390, createdAt: "18/06/2026 09:42" },
    { player: "Nina", score: 3975, createdAt: "18/06/2026 09:15" },
  ];
}
