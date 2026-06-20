import { createClient } from "@supabase/supabase-js";

const url = "https://jesbdtdkqxjiehqtmggd.supabase.co";
const serviceRole = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Implc2JkdGRrcXhqaWVocXRtZ2dkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk3Nzg1NiwiZXhwIjoyMDk3NTUzODU2fQ.XB_uiB-JghpIX4CnWTsXE6mSX0OgaYb1wqnpRIM1s4Q";

const client = createClient(url, serviceRole);

async function testTable(name: string) {
  const { data, error } = await client.from(name).select("*").limit(1);
  if (error) {
    console.log(`Tabela '${name}' nao encontrada ou deu erro: ${error.message}`);
    return false;
  } else {
    console.log(`Tabela '${name}' encontrada! Dados:`, data);
    return true;
  }
}

async function main() {
  await testTable("scores");
  await testTable("ranking");
  await testTable("highscores");
  await testTable("score");
}

main().catch(console.error);
