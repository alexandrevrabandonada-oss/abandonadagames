import { NextResponse } from "next/server";
import { scoreSubmissionSchema } from "@/lib/score";
import { validateScoreSubmission } from "@/lib/antiCheat";
import { appendMockScore } from "@/lib/server/mockRankingStore";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = scoreSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "payload invalido", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const antiCheat = validateScoreSubmission(parsed.data);

  if (!antiCheat.ok) {
    return NextResponse.json({ error: antiCheat.reason }, { status: 422 });
  }

  const saved = appendMockScore(parsed.data);
  return NextResponse.json({ ok: true, entry: saved });
}
