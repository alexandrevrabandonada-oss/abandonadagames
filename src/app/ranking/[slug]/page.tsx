import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameBySlug } from "@/lib/gameRegistry";
import { getApiRankingForGame } from "@/lib/server/mockRankingStore";

export const dynamic = "force-dynamic";

export default async function RankingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) notFound();

  const ranking = await getApiRankingForGame(slug);
  const subtitle =
    slug === "merendeira-no-vermelho"
      ? "Quem segura a cozinha, serve mais pratos e ainda dribla o contrato intermitente?"
      : "Ranking oficial. Dispute os melhores tempos e pontuações da comunidade.";

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 py-6 text-[var(--text)]">
      <div className="mx-auto max-w-md">
        <Link
          href={`/jogar/${slug}`}
          className="mb-6 inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-soft)]"
        >
          Voltar ao jogo
        </Link>
        <h1 className="text-4xl font-black uppercase">{game.title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
          {subtitle}
        </p>

        <div className="mt-6 space-y-3">
          {ranking.map((entry, index) => (
            <article
              key={`${entry.player}-${entry.score}-${index}`}
              className="flex items-center justify-between rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  #{index + 1}
                </div>
                <h2 className="mt-1 text-lg font-black uppercase">
                  {entry.player}
                </h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {entry.createdAt}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[var(--accent)]">
                  {entry.score}
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  pontos
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
