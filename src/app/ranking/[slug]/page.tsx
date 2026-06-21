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
    <main className="min-h-screen bg-concrete px-5 py-6 text-[var(--text)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(242,169,0,0.04),_transparent_35%)]" />
      <div className="relative z-10 mx-auto max-w-md">
        <Link
          href={`/jogar/${slug}`}
          className="mb-6 btn-secondary !py-2 !px-4 text-[10px]"
        >
          Voltar ao jogo
        </Link>
        <h1 className="text-4xl font-black uppercase leading-none mt-2">{game.title}</h1>
        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {subtitle}
        </p>

        <div className="mt-8 space-y-4">
          {ranking.map((entry, index) => (
            <article
              key={`${entry.player}-${entry.score}-${index}`}
              className="flex items-center justify-between card-brutal"
            >
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
                  #{index + 1} LUGAR
                </div>
                <h2 className="mt-1.5 text-lg font-black uppercase text-white">
                  {entry.player}
                </h2>
                <p className="mt-1 text-[10px] font-medium text-[var(--text-muted)]">
                  {entry.createdAt}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[var(--accent)]">
                  {entry.score}
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
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
