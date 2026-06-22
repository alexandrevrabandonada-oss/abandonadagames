import Image from "next/image";
import Link from "next/link";
import { getAllGames } from "@/lib/gameRegistry";

const HOME_META_BY_SLUG: Record<string, { theme: string; action: string; badge?: string }> = {
  "onibus-zero": { theme: "Transporte", action: "3 faixas" },
  "merendeira-no-vermelho": { theme: "Merenda", action: "Arcade survival", badge: "repetitividade 9" },
  "plantaono-vermelho": { theme: "Salario", action: "Arcade survival", badge: "sobreviva ao mes" },
  "fila-invisivel": { theme: "Saude publica", action: "Toque rapido" },
};

export default function Home() {
  const allGames = getAllGames();
  const games = [
    ...allGames.filter((g) => g.slug === "merendeira-no-vermelho"),
    ...allGames.filter((g) => g.slug !== "merendeira-no-vermelho"),
  ];
  const featuredGame = games[0];
  const featuredMeta = featuredGame ? HOME_META_BY_SLUG[featuredGame.slug] ?? HOME_META_BY_SLUG["fila-invisivel"] : null;

  if (!featuredGame || !featuredMeta) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-concrete px-5 py-8 text-[var(--text)] lg:px-8">
        <div className="mx-auto max-w-3xl card-brutal text-center">
          <div className="text-sm font-black uppercase tracking-[0.22em] text-[var(--accent)]">
            Catalogo em atualizacao
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Nenhum jogo foi encontrado no portal agora.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-concrete text-[var(--text)]">
      {/* Subtle brand color highlight in top background overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(242,169,0,0.06),_transparent_40%)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-24 pt-6 lg:px-8">
        {/* Stamp Style Header Banner */}
        <div className="mb-6 w-full max-w-md rounded border-2 border-[var(--accent)] bg-black/60 px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)] shadow-[3px_3px_0px_rgba(0,0,0,0.8)] rotate-[-1deg]">
          Pré-campanha Alexandre VR Abandonada
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <div className="space-y-8">
            <header className="relative overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[#1C1C1A]/90 p-5 shadow-[4px_4px_0px_#000000] backdrop-blur">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent)]" />
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--text-muted)]">
                Concreto por fora. Respiração por dentro.
              </p>
              <h1 className="mt-2 text-4xl font-black uppercase leading-[0.95] text-[var(--text)] sm:text-5xl">
                Abandonada <span className="text-[var(--accent)]">Games</span>
              </h1>
              <p className="mt-3 max-w-xl text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-soft)] leading-relaxed">
                Calma para organizar, não para aceitar.
              </p>
            </header>

            <div className="card-brutal relative overflow-hidden p-0">
              <div className="absolute top-0 left-0 z-10 h-1 w-full bg-[var(--accent)]" />
              <div className="relative aspect-[4/5] w-full overflow-hidden lg:aspect-[16/10]">
                <Image
                  src="/alexandre-vr.jpg"
                  alt="Alexandre VR Abandonada"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 720px"
                  className="object-cover grayscale contrast-125 brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1A] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <span className="stamp-badge rotate-[-1.5deg] border-[var(--accent)] bg-black/70 text-[var(--accent)]">
                    Pré-Candidato
                  </span>
                  <h2 className="mt-2 text-3xl font-black uppercase leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-4xl">
                    Alexandre VR <br />
                    <span className="text-[var(--accent)]">Abandonada</span>
                  </h2>
                </div>
              </div>
              <div className="border-t border-white/5 bg-[#1C1C1A] p-5">
                <div className="space-y-3 text-xs font-bold leading-relaxed tracking-[0.08em] text-[var(--text-soft)]">
                  <p>
                    &ldquo;Meu nome é Alexandre, sou pré-candidato a deputado estadual porque acredito que o Sul Fluminense precisa de uma voz firme, popular e independente.
                  </p>
                  <p>
                    Minha caminhada nasce das ruas, das denúncias, da escuta dos trabalhadores, das comunidades esquecidas e de todos que sentem na pele o abandono do poder público.
                  </p>
                  <p>
                    Quero construir uma pré-campanha coletiva, feita com coragem, verdade e organização popular. Não para representar os de cima, mas para fortalecer quem luta todos os dias por saúde, educação, transporte, trabalho digno, moradia e meio ambiente.
                  </p>
                  <p>
                    Essa caminhada não é só minha. É nossa.
                    <br />
                    Vamos organizar a esperança.&rdquo;
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-end border-t border-white/5 pt-3">
                  <div className="flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--accent)]">DIGNIDADE JÁ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="card-brutal relative overflow-hidden lg:sticky lg:top-6">
            <div className="absolute top-0 left-0 h-1 w-full bg-[var(--accent)]" />
            <div className="mb-4 flex items-center justify-between">
              <span className="stamp-badge rotate-[-2deg] border-[var(--accent)] bg-black/40 text-[var(--accent)]">
                Destaque
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                1 min
              </span>
            </div>

            <h2 className="text-3xl font-black uppercase leading-[0.95] text-white">
              {featuredGame.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-soft)]">
              {featuredGame.tagline}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-[var(--border-strong)] bg-black/40 p-3">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Tema
                </div>
                <div className="mt-1 font-bold text-[var(--text)]">
                  {featuredMeta.theme}
                </div>
              </div>
              <div className="rounded-lg border border-[var(--border-strong)] bg-black/40 p-3">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Ação
                </div>
                <div className="mt-1 font-bold text-[var(--text)]">
                  {featuredMeta.action}
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Link
                href={`/jogar/${featuredGame.slug}`}
                className="flex-1 btn-primary text-center"
              >
                Jogar agora
              </Link>
              <Link
                href={`/ranking/${featuredGame.slug}`}
                className="btn-secondary text-center"
              >
                Ranking
              </Link>
            </div>
          </aside>
        </div>

        {/* Games List Section */}
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Jogos no ar
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
              dados via game.json
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {games.map((game) => (
              <Link
                key={game.slug}
                href={`/jogar/${game.slug}`}
                className="block card-brutal h-full hover:translate-y-[-2px] transition-transform duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-black uppercase leading-tight text-white">
                      {game.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--text-soft)]">
                      {game.summary}
                    </p>
                    <div className="mt-3.5 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-[0.14em]">
                      <span className="rounded border border-[var(--border-strong)] bg-black/40 px-2.5 py-1 text-[var(--text)]">
                        {game.slug === "plantaono-vermelho" || game.slug === "merendeira-no-vermelho" ? "1 min" : "45-60s"}
                      </span>
                      <span className="rounded border border-[var(--border-strong)] bg-black/40 px-2.5 py-1 text-[var(--text-soft)]">
                        {HOME_META_BY_SLUG[game.slug]?.action?.toLowerCase() ?? "toque rapido"}
                      </span>
                      {HOME_META_BY_SLUG[game.slug]?.badge ? (
                        <span className="rounded border border-[var(--border-strong)] bg-black/40 px-2.5 py-1 text-[var(--accent)]">
                          {HOME_META_BY_SLUG[game.slug]?.badge}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="shrink-0 stamp-badge border-[var(--border-strong)] text-[var(--text-muted)] bg-black/20 rotate-0 self-start">
                    {game.template}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </section>
    </main>
  );
}
