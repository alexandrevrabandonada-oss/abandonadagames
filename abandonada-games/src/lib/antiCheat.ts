import type { ScoreSubmission } from "@/lib/score";

export function validateScoreSubmission(payload: ScoreSubmission) {
  const maxScorePerSecond = 220;
  const pointsPerSecond = payload.score / Math.max(1, payload.durationMs / 1000);

  if (pointsPerSecond > maxScorePerSecond) {
    return { ok: false as const, reason: "pontuacao acima do ritmo esperado" };
  }

  if (payload.eventsHandled * 3 > payload.score) {
    return { ok: false as const, reason: "eventos nao batem com a pontuacao" };
  }

  return { ok: true as const };
}
