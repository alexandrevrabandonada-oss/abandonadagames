import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalGameRail, PortalTrail } from "@/components/games/GameChrome";
import { getAllGames, getGameBySlug } from "@/lib/gameRegistry";
import { getGamePresentation } from "@/lib/gamePresentation";
import { getApiRankingForGame } from "@/lib/server/mockRankingStore";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    return {
      title: "Ranking não encontrado",
    };
  }

  return {
    title: `Ranking ${game.title}`,
    description: `Ranking oficial de ${game.title} na Abandonada Games.`,
    openGraph: {
      title: `Ranking ${game.title}`,
      description: `Veja a classificação oficial de ${game.title}.`,
      url: `https://www.abandonadagames.online/ranking/${game.slug}`,
    },
  };
}

export default async function RankingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) notFound();

  const presentation = getGamePresentation(slug);
  const otherGames = getAllGames().filter((entry) => entry.slug !== slug).slice(0, 3);
  const ranking = await getApiRankingForGame(slug);
  const subtitle = presentation.rankingSubtitle;
  const topScore = ranking[0]?.score ?? 0;
  const topPlayer = ranking[0]?.player ?? null;
  const podiumCount = Math.min(3, ranking.length);

  return (
    <main className="min-h-screen bg-concrete px-5 py-6 text-[var(--text)] lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(242,169,0,0.04),_transparent_35%)]" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <PortalTrail currentLabel={`${game.title} ranking`} currentHref={`/ranking/${slug}`} />
        <Link
          href={`/jogar/${slug}`}
          prefetch={false}
          className="mb-6 btn-secondary !py-2 !px-4 text-[10px]"
        >
          Voltar ao jogo
        </Link>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="stamp-badge border-[var(--accent)] bg-black/25 text-[var(--accent)]">
                {presentation.theme}
              </span>
              <span className="rounded border border-white/10 bg-black/30 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--text-soft)]">
                {presentation.duration}
              </span>
              <span className="rounded border border-white/10 bg-black/30 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--text-soft)]">
                {presentation.action.toLowerCase()}
              </span>
            </div>
            <h1 className="mt-2 text-4xl font-black uppercase leading-none sm:text-5xl">{game.title}</h1>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] leading-relaxed">
              {subtitle}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/jogar/${slug}`} className="btn-primary text-[10px]">
                Jogar agora
              </Link>
              <Link href="/" className="btn-secondary text-[10px]">
                Ver portal
              </Link>
            </div>
          </div>
          <aside className="rounded-xl border border-[var(--accent)]/25 bg-[linear-gradient(180deg,rgba(242,169,0,0.08),rgba(0,0,0,0.22))] px-5 py-4 shadow-[4px_4px_0px_#000000]">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--accent)]">
              ranking comunitário
            </div>
            <div className="mt-3 text-4xl font-black text-white">{ranking.length > 0 ? topScore : "--"}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-soft)]">
              melhor marca do portal agora
            </div>
            <div className="mt-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">
                líder atual
              </div>
              <div className="mt-1 truncate text-sm font-black text-[var(--text)]">
                {topPlayer ?? "aguardando primeira rodada"}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">top ativo</span>
              <span className="text-sm font-black text-[var(--accent)]">{podiumCount}/3</span>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <article className="card-brutal">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">
              líder atual
            </div>
            <div className="mt-2 text-3xl font-black text-[var(--accent)]">{ranking.length > 0 ? topScore : "--"}</div>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] leading-relaxed">
              melhor pontuação registrada
            </p>
          </article>
          <article className="card-brutal">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">
              entradas
            </div>
            <div className="mt-2 text-3xl font-black text-[var(--accent)]">{ranking.length}</div>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] leading-relaxed">
              partidas publicadas
            </p>
          </article>
          <article className="card-brutal">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">
              formato
            </div>
            <div className="mt-2 text-2xl font-black text-[var(--accent)]">{presentation.duration}</div>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] leading-relaxed">
              {presentation.action.toLowerCase()}
            </p>
          </article>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {ranking.length > 0 ? (
            ranking.map((entry, index) => (
              <article
                key={`${entry.player}-${entry.score}-${index}`}
                className={`card-brutal flex items-center justify-between gap-4 ${
                  index === 0 ? "border-[var(--accent)]/35 bg-[linear-gradient(180deg,rgba(242,169,0,0.08),rgba(0,0,0,0.18))]" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-lg font-black ${
                    index === 0
                      ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                      : "border-white/10 bg-black/30 text-[var(--text)]"
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
                      {index === 0 ? "líder da rodada" : `${index + 1}º lugar`}
                    </div>
                    <h2 className="mt-1.5 truncate text-lg font-black uppercase text-white">
                      {entry.player}
                    </h2>
                    <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
                      {entry.createdAt}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-black text-[var(--accent)]">
                    {entry.score}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    pontos
                  </div>
                </div>
              </article>
            ))
          ) : (
            <article className="card-brutal text-center">
              <div className="text-sm font-black uppercase text-[var(--accent)]">
                {presentation.rankingEmptyTitle}
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                {presentation.rankingEmptySubtitle}
              </p>
            </article>
          )}
        </div>

        {otherGames.length > 0 ? (
          <section className="mt-10">
            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.26em] text-[var(--text-muted)]">
              continuar no portal
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {otherGames.map((entry) => {
                const meta = getGamePresentation(entry.slug);

                return (
                  <article key={entry.slug} className="card-brutal">
                    <div className="flex items-center justify-between gap-2">
                      <span className="stamp-badge border-[var(--accent)] bg-black/20 text-[var(--accent)]">
                        {meta.theme}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                        {meta.duration}
                      </span>
                    </div>
                    <h2 className="mt-4 text-lg font-black uppercase text-white">{entry.title}</h2>
                    <p className="mt-2 text-sm font-bold uppercase leading-relaxed tracking-[0.08em] text-[var(--text-soft)]">
                      {meta.focus}
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Link href={`/jogar/${entry.slug}`} className="btn-primary flex-1 text-[10px]">
                        Jogar
                      </Link>
                      <Link href={`/ranking/${entry.slug}`} className="btn-secondary text-[10px]">
                        Ranking
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
        <PortalGameRail currentSlug={slug} mode="ranking" />
      </div>
    </main>
  );
}
