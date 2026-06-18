import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2];

if (!slug) {
  console.error("uso: npm run game:validate -- fila-invisivel");
  process.exit(1);
}

const filePath = path.join(process.cwd(), "games", "catalog", slug, "game.json");
if (!fs.existsSync(filePath)) {
  console.error("game.json nao encontrado");
  process.exit(1);
}

const game = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
const requiredKeys = ["slug", "title", "template", "tagline", "summary", "obstacles", "powerUps"];

for (const key of requiredKeys) {
  if (!(key in game)) {
    console.error(`campo obrigatorio ausente: ${key}`);
    process.exit(1);
  }
}

console.log(`jogo ${slug} validado com sucesso`);
