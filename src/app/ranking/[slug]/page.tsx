import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameBySlug } from "@/lib/gameRegistry";
import { getApiRankingForGame } from "@/lib/server/mockRankingStore";

export const dynamic = "force-dynamic";

const EMPTY_MESSAGE_BY_SLUG: Record<string, { title: string; subtitle: string }> = {
  "merendeira-no-vermelho": {
    title: "Ranking abrindo agora",
    subtitle: "Seja a primeira a segurar a cozinha e marcar pontos.",
  },
  "plantaono-vermelho": {
    title: "Plantao esperando recordes",
    subtitle: "Publique a primeira corrida ate o fim do mes.",
  },
  "onibus-zero": {
    title: "Linha sem lider ainda",
    subtitle: "Seja o primeiro a fechar a rota com pontuacao alta.",
  },
  "fila-invisivel": {
    title: "Fila sem campeao ainda",
    subtitle: "Organize a fila e abra o ranking desta crise.",
  },
};

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

  const ranking = await getApiRankingForGame(slug);
  const subtitle =
    slug === "merendeira-no-vermelho"
      ? "Quem segura a cozinha, serve mais pratos e ainda dribla o contrato intermitente?"
      : "Ranking oficial. Dispute os melhores tempos e pontuações da comunidade.";
  const emptyState = EMPTY_MESSAGE_BY_SLUG[slug] ?? {
    title: "Ranking abrindo agora",
    subtitle: "Seja o primeiro a marcar pontos neste jogo.",
  };

  return (
    <main className="min-h-screen bg-concrete px-5 py-6 text-[var(--text)] lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(242,169,0,0.04),_transparent_35%)]" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <Link
          href={`/jogar/${slug}`}
          prefetch={false}
          className="mb-6 btn-secondary !py-2 !px-4 text-[10px]"
        >
          Voltar ao jogo
        </Link>
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <h1 className="mt-2 text-4xl font-black uppercase leading-none sm:text-5xl">{game.title}</h1>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {subtitle}
            </p>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-[var(--accent)] lg:mt-0">
            ranking comunitario
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {ranking.length > 0 ? (
            ranking.map((entry, index) => (
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
            ))
          ) : (
            <article className="card-brutal text-center">
              <div className="text-sm font-black uppercase text-[var(--accent)]">
                {emptyState.title}
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                {emptyState.subtitle}
              </p>
            </article>
          )}
        </div>
      </div>
    </main>
  );
}
