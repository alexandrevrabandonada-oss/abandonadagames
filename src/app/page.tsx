import Image from "next/image";
import Link from "next/link";
import { getAllGames } from "@/lib/gameRegistry";
import { getGamePresentation } from "@/lib/gamePresentation";

function focusToPoints(focus: string) {
  return focus
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function getPortalTags(game: ReturnType<typeof getAllGames>[number], focus: string) {
  return game.tags?.slice(0, 4) ?? focusToPoints(focus);
}

export default function Home() {
  const games = getAllGames();
  const featuredGame = games[0];
  const featuredMeta = featuredGame ? getGamePresentation(featuredGame.slug) : null;
  const campaignThemes = Array.from(new Set(games.map((game) => getGamePresentation(game.slug).theme))).length;
  const quickLaunchGames = games.slice(0, 3);

  if (!featuredGame || !featuredMeta) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-concrete px-5 py-8 text-[var(--text)] lg:px-8">
        <div className="mx-auto max-w-3xl card-brutal text-center">
          <div className="text-sm font-black uppercase tracking-[0.22em] text-[var(--accent)]">
            Catálogo em atualização
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
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--text-muted)]">
                Concreto por fora. Respiração por dentro.
              </p>
              <h1 className="mt-2 text-4xl font-black uppercase leading-[0.95] text-[var(--text)] sm:text-5xl">
                Abandonada <span className="text-[var(--accent)]">Games</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] leading-relaxed">
                Calma para organizar, não para aceitar.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/jogar/${featuredGame.slug}`} className="btn-primary text-[10px]">
                  {featuredGame.ctaLabel ?? "Jogar destaque"}
                </Link>
                <Link href="#jogos-no-ar" className="btn-secondary text-[10px]">
                  Ver jogos
                </Link>
              </div>
            </header>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="card-brutal">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Jogos ativos
                </div>
                <div className="mt-2 text-4xl font-black text-[var(--accent)]">{games.length}</div>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-soft)]">
                  rotas jogáveis no portal
                </p>
              </div>
              <div className="card-brutal">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Frentes
                </div>
                <div className="mt-2 text-4xl font-black text-[var(--accent)]">{campaignThemes}</div>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-soft)]">
                  temas de pressão social
                </p>
              </div>
              <div className="card-brutal">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Ritmo
                </div>
                <div className="mt-2 text-2xl font-black text-[var(--accent)]">45-60s</div>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-soft)]">
                  partidas curtas, repetição alta
                </p>
              </div>
            </div>

            <section className="relative overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[#1C1C1A]/90 p-4 shadow-[4px_4px_0px_#000000] backdrop-blur">
              <div className="absolute inset-y-0 right-0 w-24 bg-[radial-gradient(circle_at_center,rgba(242,169,0,0.08),transparent_70%)]" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--accent)]">
                    entrada rápida
                  </div>
                  <div className="mt-1 text-lg font-black uppercase text-white">
                    escolha uma pressão e entre jogando
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-right">
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    rota ativa
                  </div>
                  <div className="mt-1 text-sm font-black text-[var(--accent)]">{featuredGame.title}</div>
                  {featuredGame.subtitle ? (
                    <div className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--text-soft)]">
                      {featuredGame.subtitle}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {quickLaunchGames.map((game, index) => {
                  const meta = getGamePresentation(game.slug);

                  return (
                    <article
                      key={`quick-${game.slug}`}
                      className={`rounded-xl border p-4 ${
                        index === 0
                          ? "border-[var(--accent)]/40 bg-[linear-gradient(180deg,rgba(242,169,0,0.08),rgba(0,0,0,0.18))]"
                          : "border-white/10 bg-black/30"
                      }`}
                    >
                      {game.coverImage ? (
                        <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl border border-white/10">
                          <Image
                            src={game.coverImage}
                            alt={`Capa de ${game.title}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 320px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,12,0.04),rgba(8,10,12,0.5)_72%,rgba(8,10,12,0.82))]" />
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between gap-2">
                        <span className="stamp-badge border-[var(--accent)] bg-black/25 text-[var(--accent)]">
                          {meta.theme}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          {meta.duration}
                        </span>
                      </div>
                      <h2 className="mt-3 text-lg font-black uppercase leading-tight text-white">
                        {game.title}
                      </h2>
                      {game.subtitle ? (
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent)]">
                          {game.subtitle}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {getPortalTags(game, meta.focus).map((point) => (
                          <span
                            key={`quick-${game.slug}-${point}`}
                            className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--text-soft)]"
                          >
                            {point}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link href={`/jogar/${game.slug}`} className="btn-primary flex-1 text-[10px]">
                          {game.ctaLabel ?? "Jogar"}
                        </Link>
                        <Link href={`/ranking/${game.slug}`} className="btn-secondary text-[10px]">
                          Ranking
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

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
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
                      compromisso
                    </div>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-[var(--text-soft)]">
                      Voz popular e independente para saúde, educação, transporte, trabalho digno, moradia e meio ambiente.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
                      origem
                    </div>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-[var(--text-soft)]">
                      Caminhada feita de denúncia, escuta e organização com quem sente o abandono do poder público no dia a dia.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-black/20 p-4 md:col-span-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
                      direção
                    </div>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-[var(--text-soft)]">
                      Pré-campanha coletiva para fortalecer quem luta todos os dias. Essa caminhada é nossa.
                    </p>
                  </div>
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
                {featuredGame.slug === "cidade-de-aco-cartas-vr" ? "Lançamento" : "Destaque"}
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                {featuredMeta.duration}
              </span>
            </div>

            <h2 className="text-3xl font-black uppercase leading-[0.95] text-white">
              {featuredGame.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--text-soft)]">
              {featuredGame.tagline}
            </p>
            {featuredGame.subtitle ? (
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--accent)]">
                {featuredGame.subtitle}
              </p>
            ) : null}

            {featuredGame.coverImage ? (
              <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-xl border border-white/10">
                <Image
                  src={featuredGame.coverImage}
                  alt={`Capa de ${featuredGame.title}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,12,0.06),rgba(8,10,12,0.42)_60%,rgba(8,10,12,0.82))]" />
              </div>
            ) : null}

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

            <div className="mt-5 rounded-xl border border-white/10 bg-black/35 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">
                foco político
              </div>
              <p className="mt-2 text-sm font-bold uppercase leading-relaxed tracking-[0.08em] text-[var(--text-soft)]">
                {featuredMeta.focus}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {getPortalTags(featuredGame, featuredMeta.focus).map((tag) => (
                  <span
                    key={`featured-tag-${tag}`}
                    className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--accent)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/35 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">
                outras rotas agora
              </div>
              <div className="mt-3 space-y-2">
                {games.slice(1, 4).map((game) => {
                  const meta = getGamePresentation(game.slug);

                  return (
                    <Link
                      key={`aside-${game.slug}`}
                      href={`/jogar/${game.slug}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 px-3 py-3 transition-colors hover:border-[var(--accent)]/40 hover:bg-black/40"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-xs font-black uppercase text-[var(--text)]">
                          {game.title}
                        </div>
                        <div className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          {meta.theme} • {meta.action.toLowerCase()}
                        </div>
                      </div>
                      <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--accent)]">
                        entrar
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Link
                href={`/jogar/${featuredGame.slug}`}
                className="flex-1 btn-primary text-center"
              >
                {featuredGame.ctaLabel ?? "Jogar agora"}
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

        <section id="jogos-no-ar" className="mb-8 scroll-mt-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Jogos no ar
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
              dados via `game.json`
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {games.map((game, index) => {
              const presentation = getGamePresentation(game.slug);

              return (
                <article
                  key={game.slug}
                  className={`card-brutal group relative flex h-full flex-col overflow-hidden ${
                    index === 0 ? "border-[var(--accent)]/35" : ""
                  }`}
                >
                  <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,169,0,0.08),transparent_30%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  {game.coverImage ? (
                    <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl border border-white/10">
                      <Image
                        src={game.coverImage}
                        alt={`Capa de ${game.title}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 520px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,12,0.04),rgba(8,10,12,0.5)_72%,rgba(8,10,12,0.82))]" />
                    </div>
                  ) : null}
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="stamp-badge border-[var(--accent)] bg-black/30 text-[var(--accent)]">
                          {presentation.theme}
                        </span>
                        <span className="rounded border border-[var(--border-strong)] bg-black/40 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--text)]">
                          {presentation.duration}
                        </span>
                        <span className="rounded border border-[var(--border-strong)] bg-black/40 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--text-soft)]">
                          {presentation.action.toLowerCase()}
                        </span>
                        {presentation.badge ? (
                          <span className="rounded border border-[var(--border-strong)] bg-black/40 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--accent)]">
                            {presentation.badge}
                          </span>
                        ) : null}
                        {index === 0 ? (
                          <span className="rounded border border-[var(--accent)]/35 bg-[rgba(242,169,0,0.08)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--accent)]">
                            destaque
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-4 text-xl font-black uppercase leading-tight text-white">
                        {game.title}
                      </h3>
                      {game.subtitle ? (
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent)]">
                          {game.subtitle}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-soft)]">
                        {game.summary}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {getPortalTags(game, presentation.focus).map((point) => (
                          <span
                            key={`${game.slug}-focus-${point}`}
                            className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--text-soft)]"
                          >
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 stamp-badge border-[var(--border-strong)] bg-black/20 rotate-0 self-start text-[var(--text-muted)]">
                      {game.template}
                    </div>
                  </div>

                  <div className="relative mt-4 flex gap-3">
                    <Link href={`/jogar/${game.slug}`} className="btn-primary flex-1 text-[10px]">
                      {game.ctaLabel ?? "Entrar"}
                    </Link>
                    <Link href={`/ranking/${game.slug}`} className="btn-secondary text-[10px]">
                      Ranking
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[#1C1C1A]/90 p-5 shadow-[4px_4px_0px_#000000] backdrop-blur">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(242,169,0,0.08),transparent_25%)]" />
          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">
                manifesto jogável
              </div>
              <h2 className="mt-2 text-3xl font-black uppercase leading-[0.95] text-white sm:text-4xl">
                o portal transforma abandono em memória jogável
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)]">lembrar</div>
                  <p className="mt-2 text-xs font-bold uppercase leading-relaxed tracking-[0.08em] text-[var(--text-soft)]">
                    cada partida parte de uma pressão concreta.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)]">circular</div>
                  <p className="mt-2 text-xs font-bold uppercase leading-relaxed tracking-[0.08em] text-[var(--text-soft)]">
                    score, ranking e compartilhamento viram conversa pública.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)]">organizar</div>
                  <p className="mt-2 text-xs font-bold uppercase leading-relaxed tracking-[0.08em] text-[var(--text-soft)]">
                    a ideia não é anestesiar. é acender memória e ação.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/35 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">
                próxima entrada
              </div>
              <div className="mt-2 text-lg font-black uppercase text-white">
                {featuredGame.title}
              </div>
              <p className="mt-2 text-xs font-bold uppercase leading-relaxed tracking-[0.08em] text-[var(--text-soft)]">
                {featuredMeta.focus}
              </p>
              <div className="mt-4 flex gap-3">
                <Link href={`/jogar/${featuredGame.slug}`} className="btn-primary flex-1 text-[10px]">
                  Jogar agora
                </Link>
                <Link href={`/ranking/${featuredGame.slug}`} className="btn-secondary text-[10px]">
                  Ver ranking
                </Link>
              </div>
            </div>
          </div>
        </section>

      </section>
    </main>
  );
}
