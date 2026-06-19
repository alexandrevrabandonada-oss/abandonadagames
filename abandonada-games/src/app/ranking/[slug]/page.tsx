import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameBySlug, getRankingForGame } from "@/lib/gameRegistry";

export default async function RankingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) notFound();

  const ranking = getRankingForGame(slug);
  const leader = ranking[0];
  const targetScore = leader ? Math.ceil((leader.score + 180) / 10) * 10 : 5000;

  return (
    <main className="min-h-screen overflow-hidden bg-[#071018] px-5 py-6 text-[#f7f1df]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,213,84,0.18),transparent_34%),linear-gradient(135deg,rgba(11,67,104,0.75),rgba(36,16,21,0.92))]" />
      <div className="pointer-events-none fixed -right-24 top-16 size-72 rounded-full bg-[#ff3b30]/20 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-md">
        <Link
          href={`/jogar/${slug}`}
          className="mb-6 inline-flex rounded-full border border-white/15 bg-black/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/80"
        >
          Voltar ao jogo
        </Link>
        <div className="rounded-[1.75rem] border border-[#ffd554]/35 bg-[rgba(3,14,22,0.78)] p-5 shadow-[0_16px_60px_rgba(0,0,0,0.42)]">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#9ee8c1]">ranking publico</div>
          <h1 className="mt-2 text-4xl font-black uppercase leading-none">{game.title}</h1>
          <p className="mt-3 text-sm font-bold uppercase leading-5 text-white/70">
            Quem aguenta mais dias sem salario e ainda segura o ritmo?
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#ffd554] p-4 text-[#130d10]">
              <div className="text-[10px] font-black uppercase">alvo para viralizar</div>
              <div className="mt-1 text-3xl font-black">{targetScore}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-4">
              <div className="text-[10px] font-black uppercase text-[#9ee8c1]">lider agora</div>
              <div className="mt-1 text-lg font-black uppercase text-[#ffd554]">{leader?.player ?? "vazio"}</div>
            </div>
          </div>
          <Link
            href={`/jogar/${slug}`}
            className="mt-4 block rounded-xl bg-[#ff3b30] px-4 py-4 text-center text-sm font-black uppercase shadow-[0_6px_0_rgba(0,0,0,0.42)]"
          >
            jogar de novo e passar geral
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {ranking.map((entry, index) => (
            <article
              key={`${entry.player}-${entry.score}-${index}`}
              className={`flex items-center justify-between rounded-[1.35rem] border p-4 shadow-[0_8px_24px_rgba(0,0,0,0.28)] ${
                index === 0
                  ? "border-[#ffd554]/60 bg-[linear-gradient(135deg,rgba(255,213,84,0.22),rgba(255,59,48,0.14))]"
                  : "border-white/10 bg-[rgba(3,14,22,0.78)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex size-12 items-center justify-center rounded-xl text-lg font-black ${
                  index === 0 ? "bg-[#ffd554] text-[#130d10]" : "bg-black/35 text-[#ffd554]"
                }`}>
                  #{index + 1}
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase">{entry.player}</h2>
                  <p className="mt-1 text-xs font-bold uppercase text-white/45">{entry.createdAt}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#ffd554]">{entry.score}</div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-white/45">
                  pontos
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-center text-xs font-black uppercase text-white/55">
          Mock local hoje. Pronto para Supabase quando a disputa abrir de verdade.
        </div>
      </div>
    </main>
  );
}
