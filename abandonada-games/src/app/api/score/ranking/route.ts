import { NextResponse } from "next/server";
import { getApiRankingForGame } from "@/lib/server/mockRankingStore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug obrigatorio" }, { status: 400 });
  }

  return NextResponse.json({ ranking: getApiRankingForGame(slug) });
}
