import Link from "next/link";
import { getAllGames } from "@/lib/gameRegistry";

export default function Home() {
  const games = getAllGames();
  const featuredGame = games[0];
  const featuredMeta =
    featuredGame.slug === "onibus-zero"
      ? { theme: "Transporte", action: "3 faixas" }
      : featuredGame.slug === "plantaono-vermelho"
        ? { theme: "Salario", action: "Survival" }
      : { theme: "Saude publica", action: "Toque rapido" };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,109,43,0.18),_transparent_28%),linear-gradient(180deg,_rgba(13,15,14,0.72),_rgba(13,15,14,0.98))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(90deg,transparent,rgba(255,196,109,0.18),transparent)] opacity-70" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-24 pt-6">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">
              PWA de mini-jogos
            </p>
            <h1 className="mt-2 max-w-56 text-4xl font-black uppercase leading-none text-[var(--text)]">
              Abandonada Games
            </h1>
          </div>
          <div className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">
            Beta
          </div>
        </header>

        <div className="mb-6 rounded-[2rem] border border-[var(--border-strong)] bg-[var(--surface)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-[var(--accent)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--bg)]">
              Em destaque
            </span>
            <span className="text-xs font-medium text-[var(--text-muted)]">
              rodada 30-90s
            </span>
          </div>

          <h2 className="text-3xl font-black uppercase leading-none">
            {featuredGame.title}
          </h2>
          <p className="mt-3 max-w-72 text-sm leading-6 text-[var(--text-soft)]">
            {featuredGame.tagline}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Tema
              </div>
              <div className="mt-2 font-semibold text-[var(--sand)]">
                {featuredMeta.theme}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Acao
              </div>
              <div className="mt-2 font-semibold text-[var(--sand)]">
                {featuredMeta.action}
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <Link
              href={`/jogar/${featuredGame.slug}`}
              className="flex-1 rounded-2xl bg-[var(--accent)] px-5 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-[var(--bg)] transition-transform hover:-translate-y-0.5"
            >
              Jogar agora
            </Link>
            <Link
              href={`/ranking/${featuredGame.slug}`}
              className="rounded-2xl border border-[var(--border-strong)] px-5 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[var(--text)]"
            >
              Ranking
            </Link>
          </div>
        </div>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.22em] text-[var(--sand)]">
              Jogos no ar
            </h2>
            <span className="text-xs text-[var(--text-muted)]">
              dados via game.json
            </span>
          </div>
          <div className="space-y-3">
            {games.map((game) => (
              <Link
                key={game.slug}
                href={`/jogar/${game.slug}`}
                className="block rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] p-4 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black uppercase leading-tight">
                      {game.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
                      {game.summary}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.14em]">
                      <span className="rounded-lg bg-[var(--surface-soft)] px-3 py-2 text-[var(--sand)]">
                        45-60s
                      </span>
                      <span className="rounded-lg bg-[var(--surface-soft)] px-3 py-2 text-[var(--text-soft)]">
                        {game.slug === "onibus-zero"
                          ? "3 faixas"
                          : game.slug === "plantaono-vermelho"
                            ? "arcade survival"
                            : "toque rapido"}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
                    {game.template}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.22em] text-[var(--sand)]">
              Como viraliza
            </h2>
            <span className="text-xs text-[var(--text-muted)]">3 passos</span>
          </div>
          <div className="mt-4 grid gap-3">
            {[
              "abre em segundos",
              "joga rapido",
              "compartilha o resultado",
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-sm uppercase tracking-[0.12em] text-[var(--text-soft)]"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-[var(--sand)] text-xs font-black text-[var(--bg)]">
                  0{index + 1}
                </span>
                {item}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
