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
    <main className="relative min-h-screen overflow-hidden bg-[#d8d2c3] text-[#151512]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,111,45,0.24),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(31,63,54,0.2),transparent_24%),linear-gradient(180deg,rgba(244,238,219,0.88),rgba(193,186,170,0.82)_30%,rgba(28,31,28,0.98)_70%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(90deg,rgba(21,21,18,0.24)_1px,transparent_1px),linear-gradient(0deg,rgba(21,21,18,0.2)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute left-[-20%] top-20 h-56 w-[140%] rotate-[-6deg] bg-[#f15a24]/90 shadow-[0_18px_50px_rgba(0,0,0,0.24)]" />
      <div className="pointer-events-none absolute right-[-18%] top-10 h-28 w-[85%] rotate-[10deg] bg-[#1e3c34]/90" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-24 pt-6">
        <div className="mb-5 rounded-full border border-[#151512]/15 bg-[#f7f1df]/80 px-4 py-2 text-center text-[11px] font-black uppercase tracking-[0.16em] text-[#1e3c34] shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur">
          Pré-campanha Alexandre VR Abandonada
        </div>

        <header className="relative mb-8 overflow-hidden rounded-[2rem] border border-[#151512]/10 bg-[#ece5d2]/82 p-5 shadow-[0_18px_0_rgba(21,21,18,0.12),0_28px_80px_rgba(0,0,0,0.22)] backdrop-blur">
          <div className="pr-16">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-[#506158]">
              Concreto zen arcade
            </p>
            <h1 className="mt-2 max-w-72 text-[2.65rem] font-black uppercase leading-[0.9] text-[#151512]">
              Abandonada Games
            </h1>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-[#5b4b39]">
              jogo curto, rua viva, critica no reflexo
            </p>
          </div>
          </div>
          <div className="absolute right-4 top-4 rounded-full border border-[#151512]/15 bg-[#1e3c34] px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#f7f1df]">
            Beta
          </div>
        </header>

        <div className="mb-6 rounded-[2rem] border border-[#f7f1df]/16 bg-[#151512]/94 p-5 text-[#f7f1df] shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full bg-[#f15a24] px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#151512]">
              Em destaque
            </span>
            <span className="text-xs font-medium text-[#c8b891]">
              rodada 30-90s
            </span>
          </div>

          <h2 className="text-3xl font-black uppercase leading-none drop-shadow-[3px_3px_0_rgba(241,90,36,0.55)]">
            {featuredGame.title}
          </h2>
          <p className="mt-3 max-w-72 text-sm leading-6 text-[#e1d4b9]">
            {featuredGame.tagline}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-[#f7f1df]/12 bg-[#242824] p-3">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#a99b82]">
                Tema
              </div>
              <div className="mt-2 font-semibold text-[#ffca74]">
                {featuredMeta.theme}
              </div>
            </div>
            <div className="rounded-2xl border border-[#f7f1df]/12 bg-[#242824] p-3">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#a99b82]">
                Acao
              </div>
              <div className="mt-2 font-semibold text-[#ffca74]">
                {featuredMeta.action}
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <Link
              href={`/jogar/${featuredGame.slug}`}
              className="flex-1 rounded-2xl bg-[#f15a24] px-5 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-[#151512] transition-transform hover:-translate-y-0.5"
            >
              Jogar agora
            </Link>
            <Link
              href={`/ranking/${featuredGame.slug}`}
              className="rounded-2xl border border-[#f7f1df]/20 px-5 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#f7f1df]"
            >
              Ranking
            </Link>
          </div>
        </div>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.22em] text-[#ffca74]">
              Jogos no ar
            </h2>
            <span className="text-xs text-[#c8b891]">
              dados via game.json
            </span>
          </div>
          <div className="space-y-3">
            {games.map((game) => (
              <Link
                key={game.slug}
                href={`/jogar/${game.slug}`}
                className="block rounded-[1.25rem] border border-[#f7f1df]/12 bg-[#151512]/92 p-4 text-[#f7f1df] shadow-[0_12px_36px_rgba(0,0,0,0.28)] transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black uppercase leading-tight">
                      {game.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#d9ccb0]">
                      {game.summary}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.14em]">
                      <span className="rounded-lg bg-[#242824] px-3 py-2 text-[#ffca74]">
                        {game.slug === "plantaono-vermelho" ? "1 min" : "45-60s"}
                      </span>
                      <span className="rounded-lg bg-[#242824] px-3 py-2 text-[#d9ccb0]">
                        {game.slug === "onibus-zero"
                          ? "3 faixas"
                          : game.slug === "plantaono-vermelho"
                            ? "arcade survival"
                            : "toque rapido"}
                      </span>
                      {game.slug === "plantaono-vermelho" ? (
                        <span className="rounded-lg bg-[#242824] px-3 py-2 text-[#f15a24]">
                          sobreviva ao mes
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="shrink-0 rounded-lg border border-[#f7f1df]/12 bg-[#242824] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f15a24]">
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
