import fs from "node:fs";
import path from "node:path";

type Brief = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  template: string;
  obstacles: string[];
  powerUps: string[];
};

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("uso: npm run game:create -- ./brief.json");
  process.exit(1);
}

const brief = JSON.parse(fs.readFileSync(inputPath, "utf8")) as Brief;
const gameDir = path.join(process.cwd(), "games", "catalog", brief.slug);
fs.mkdirSync(gameDir, { recursive: true });
fs.writeFileSync(
  path.join(gameDir, "game.json"),
  JSON.stringify(brief, null, 2),
  "utf8",
);

console.log(`jogo criado em ${gameDir}`);
