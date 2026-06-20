import fs from "node:fs";
import path from "node:path";
import type { RankingEntry, ScoreSubmission } from "@/lib/score";
import { getRankingForGame } from "@/lib/gameRegistry";
import { getSupabase } from "@/lib/supabase";

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

export async function appendMockScore(payload: ScoreSubmission): Promise<RankingEntry> {
  const entry = {
    player: payload.player,
    score: payload.score,
    createdAt: new Date().toLocaleString("pt-BR"),
  };

  // Try saving to Supabase first
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from("scores").insert({
        slug: payload.slug,
        player: payload.player,
        score: payload.score,
        duration_ms: payload.durationMs,
        events_handled: payload.eventsHandled,
      });
      if (error) {
        console.error("Erro ao inserir no Supabase, usando backup local:", error.message);
      } else {
        console.log("Salvo no Supabase com sucesso.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Excecao ao inserir no Supabase:", msg);
    }
  }

  // Backup write to local file store
  try {
    const store = readStore();
    const current = store[payload.slug] ?? getRankingForGame(payload.slug);
    store[payload.slug] = [...current, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    writeStore(store);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Erro ao salvar backup local:", msg);
  }

  return entry;
}

export async function getApiRankingForGame(slug: string): Promise<RankingEntry[]> {
  // Try reading from Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("scores")
        .select("player, score, created_at")
        .eq("slug", slug)
        .order("score", { ascending: false })
        .limit(10);

      if (!error && data) {
        return (data as Array<{ player: string; score: number; created_at: string }>).map((row) => ({
          player: row.player,
          score: row.score,
          createdAt: new Date(row.created_at).toLocaleString("pt-BR"),
        }));
      }
      if (error) {
        console.error("Erro ao ler do Supabase, usando backup local:", error.message);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Excecao ao ler do Supabase:", msg);
    }
  }

  // Fallback to local store
  const store = readStore();
  return store[slug] ?? getRankingForGame(slug);
}
