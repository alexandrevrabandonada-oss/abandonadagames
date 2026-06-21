import Link from "next/link";
import { getAllGames } from "@/lib/gameRegistry";

export default function Home() {
  const allGames = getAllGames();
  const games = [
    ...allGames.filter((g) => g.slug === "merendeira-no-vermelho"),
    ...allGames.filter((g) => g.slug !== "merendeira-no-vermelho"),
  ];
  const featuredGame = games[0];
  const featuredMeta =
    featuredGame.slug === "onibus-zero"
      ? { theme: "Transporte", action: "3 faixas" }
      : featuredGame.slug === "merendeira-no-vermelho"
        ? { theme: "Merenda", action: "Arcade survival" }
      : featuredGame.slug === "plantaono-vermelho"
        ? { theme: "Salario", action: "Survival" }
      : { theme: "Saude publica", action: "Toque rapido" };

  return (
    <main className="relative min-h-screen overflow-hidden bg-concrete text-[var(--text)]">
      {/* Subtle brand color highlight in top background overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(242,169,0,0.06),_transparent_40%)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-24 pt-6">
        {/* Stamp Style Header Banner */}
        <div className="mb-6 rounded border-2 border-[var(--accent)] bg-black/60 px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)] shadow-[3px_3px_0px_rgba(0,0,0,0.8)] rotate-[-1deg]">
          Pré-campanha Alexandre VR Abandonada
        </div>

        <header className="mb-8 relative overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[#1C1C1A]/90 p-5 shadow-[4px_4px_0px_#000000] backdrop-blur">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent)]" />
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--text-muted)]">
            Concreto por fora. Respiração por dentro.
          </p>
          <h1 className="mt-2 text-4xl font-black uppercase leading-[0.95] text-[var(--text)]">
            Abandonada <span className="text-[var(--accent)]">Games</span>
          </h1>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-soft)] leading-relaxed">
            Calma para organizar, não para aceitar.
          </p>
        </header>

        {/* Featured Game Card */}
        <div className="mb-8 card-brutal relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]" />
          <div className="mb-4 flex items-center justify-between">
            <span className="stamp-badge border-[var(--accent)] text-[var(--accent)] rotate-[-2deg] bg-black/40">
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
          <div className="space-y-4">
            {games.map((game) => (
              <Link
                key={game.slug}
                href={`/jogar/${game.slug}`}
                className="block card-brutal hover:translate-y-[-2px] transition-transform duration-200"
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
                        {game.slug === "onibus-zero"
                          ? "3 faixas"
                          : game.slug === "merendeira-no-vermelho"
                            ? "arcade survival"
                          : game.slug === "plantaono-vermelho"
                            ? "arcade survival"
                            : "toque rápido"}
                      </span>
                      {game.slug === "merendeira-no-vermelho" ? (
                        <span className="rounded border border-[var(--border-strong)] bg-black/40 px-2.5 py-1 text-[var(--accent)]">
                          repetitividade 9
                        </span>
                      ) : null}
                      {game.slug === "plantaono-vermelho" ? (
                        <span className="rounded border border-[var(--border-strong)] bg-black/40 px-2.5 py-1 text-[var(--accent)]">
                          sobreviva ao mês
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
