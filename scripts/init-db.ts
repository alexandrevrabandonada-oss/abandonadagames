import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

// Manually parse .env.local to load DATABASE_URL
const envPath = path.join(process.cwd(), ".env.local");
let databaseUrl = process.env.DATABASE_URL;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("DATABASE_URL=")) {
      databaseUrl = trimmed.substring("DATABASE_URL=".length).trim();
      // Remove surrounding quotes if present
      if ((databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) || 
          (databaseUrl.startsWith("'") && databaseUrl.endsWith("'"))) {
        databaseUrl = databaseUrl.slice(1, -1);
      }
      break;
    }
  }
}

async function main() {
  if (!databaseUrl) {
    console.error("DATABASE_URL nao encontrada em .env.local ou nas variaveis de ambiente.");
    process.exit(1);
  }

  console.log("Conectando ao banco de dados Supabase via DATABASE_URL...");
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }, // Necessary for hosted DB providers
  });

  try {
    await client.connect();
    console.log("Conexao estabelecida com sucesso.");

    const sqlPath = path.join(process.cwd(), "scripts", "create_scores_table.sql");
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Arquivo SQL nao encontrado em: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, "utf8");
    console.log("Executando criacao de tabelas e politicas RLS...");
    await client.query(sql);

    console.log("Operacao concluida: Tabela 'scores' e RLS inicializados.");
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Erro durante a inicializacao do banco:", msg);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
