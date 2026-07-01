import Link from "next/link";
import type { ReactNode } from "react";
import { PORTAL_GAME_LINKS } from "@/lib/gamePresentation";

export function GameHomeLink() {
  return (
    <Link
      href="/"
      prefetch={false}
      className="rounded-lg border border-[var(--accent)] px-3 py-2 text-[11px] font-black uppercase text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-black"
    >
      Início
    </Link>
  );
}

type PortalTrailProps = {
  currentLabel: string;
  currentHref?: string;
};

export function PortalTrail({ currentLabel, currentHref }: PortalTrailProps) {
  return (
    <nav className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
      <Link href="/" prefetch={false} className="transition-colors hover:text-[var(--accent)]">
        portal
      </Link>
      <span>/</span>
      {currentHref ? (
        <Link href={currentHref} prefetch={false} className="transition-colors hover:text-[var(--accent)]">
          {currentLabel}
        </Link>
      ) : (
        <span className="text-[var(--accent)]">{currentLabel}</span>
      )}
    </nav>
  );
}

type PortalGameRailProps = {
  currentSlug?: string;
  mode?: "play" | "ranking";
};

export function PortalGameRail({ currentSlug, mode = "play" }: PortalGameRailProps) {
  return (
    <section className="mt-4 rounded-xl border border-white/10 bg-[rgba(28,28,26,0.9)] p-4 shadow-[4px_4px_0px_#000000]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">
          {mode === "ranking" ? "trocar ranking" : "trocar de rota"}
        </div>
        <Link
          href="/"
          prefetch={false}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] transition-colors hover:text-[var(--sand)]"
        >
          ver portal
        </Link>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {PORTAL_GAME_LINKS.map((entry) => {
          const href = mode === "ranking" ? `/ranking/${entry.slug}` : `/jogar/${entry.slug}`;
          const active = entry.slug === currentSlug;

          return (
            <Link
              key={`${mode}-${entry.slug}`}
              href={href}
              prefetch={false}
              className={`rounded-xl border px-3 py-3 text-xs font-black uppercase tracking-[0.12em] transition-transform duration-150 ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent)] text-black shadow-[3px_3px_0px_#000000]"
                  : "border-white/10 bg-black/35 text-[var(--text)] hover:-translate-y-[1px] hover:border-[var(--accent)]"
              }`}
            >
              {entry.shortTitle}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

type GamePageHeaderProps = {
  eyebrow: string;
  title: string;
  action?: ReactNode;
};

export function GamePageHeader({ eyebrow, title, action }: GamePageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase leading-none">{title}</h1>
      </div>
      {action ?? <GameHomeLink />}
    </div>
  );
}

export function CampaignCard() {
  return (
    <div className="relative mt-4 overflow-hidden rounded-[1.25rem] border border-[#f15a24]/30 bg-gradient-to-br from-[#1e3c34]/95 to-[rgba(28,28,26,0.98)] p-5 text-center shadow-[0_12px_40px_rgba(241,90,36,0.15)]">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#f15a24] via-[#ffd554] to-[#f15a24]" />
      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ffd554]">Pré-campanha</div>
      <h3 className="mt-1 text-lg font-black uppercase tracking-wide text-white">Alexandre VR Abandonada</h3>
      <p className="mt-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-[#ff7c52]">Candidato a Deputado Estadual</p>
      <p className="mt-3 text-xs font-semibold leading-relaxed text-[#d4e8d8]/90">
        &ldquo;Volta Redonda e o estado do Rio de Janeiro precisam de dignidade: merenda escolar de qualidade, valorização profissional, saúde eficiente e transporte público que realmente funcione. Vamos juntos mudar essa realidade!&rdquo;
      </p>
      <div className="mt-3.5 flex items-center justify-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#f15a24] animate-pulse" />
        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9ee8c1]">Pelo resgate da nossa dignidade</span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#f15a24] animate-pulse" />
      </div>
    </div>
  );
}

type ResultActionsProps = {
  copyLabel: string;
  rankingHref: string;
  onReplay: () => void;
  onShare: () => void;
  rankingLabel?: string;
};

export function ResultActions({
  copyLabel,
  rankingHref,
  onReplay,
  onShare,
  rankingLabel = "Ver ranking",
}: ResultActionsProps) {
  return (
    <>
      <div className="mt-4 flex gap-3 flex-wrap xs:flex-nowrap">
        <button
          type="button"
          onClick={onReplay}
          className="flex-[1.2] btn-primary !p-3 text-[10px] xs:text-xs"
        >
          Jogar de novo
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex-1 btn-secondary !p-3 text-[10px] xs:text-xs"
        >
          {copyLabel}
        </button>
      </div>
      <Link
        href={rankingHref}
        className="mt-3 block btn-secondary !p-3 text-center text-[10px] xs:text-xs"
      >
        {rankingLabel}
      </Link>
    </>
  );
}

type ResultPreviewCardProps = {
  alt: string;
  imageUrl: string | null;
  loadingLabel?: string;
  tone?: "default" | "highlight";
};

export function ResultPreviewCard({
  alt,
  imageUrl,
  loadingLabel = "gerando card",
  tone = "default",
}: ResultPreviewCardProps) {
  return (
    <div
      className={`mt-4 overflow-hidden rounded-xl border ${
        tone === "highlight"
          ? "border-[#ffd45c]/20 bg-[rgba(8,19,28,0.94)]"
          : "border-white/10 bg-black/45"
      }`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={alt} className="block w-full" />
      ) : (
        <div
          className={`flex aspect-[4/5] items-center justify-center text-xs font-black uppercase ${
            tone === "highlight" ? "text-white/55" : "text-[var(--text-soft)]"
          }`}
        >
          {loadingLabel}
        </div>
      )}
    </div>
  );
}

export function ResultNotice({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.14em] text-[var(--text-soft)]">
      {text}
    </div>
  );
}

type ResultHeaderProps = {
  rank: string;
  summary: string;
  score: string;
  accentClassName?: string;
  scoreLabel?: string;
};

export function ResultHeader({
  rank,
  summary,
  score,
  accentClassName = "text-[var(--accent)]",
  scoreLabel = "score final",
}: ResultHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-soft)]">resultado</p>
        <h2 className={`mt-1 text-6xl font-black leading-none sm:text-7xl ${accentClassName}`}>{rank}</h2>
        <p className="mt-2 text-sm font-bold uppercase text-[var(--text)]">{summary}</p>
      </div>
      <div className="rounded-xl border border-white/5 bg-black/45 px-4 py-3 text-left sm:shrink-0 sm:text-right">
        <div className="text-[10px] font-bold uppercase text-[var(--text-soft)]">{scoreLabel}</div>
        <div className={`mt-1 text-3xl font-black sm:text-4xl ${accentClassName}`}>{score}</div>
      </div>
    </div>
  );
}

type AssetImageProps = {
  src: string;
  alt?: string;
  className?: string;
  decorative?: boolean;
};

export function AssetImage({
  src,
  alt = "",
  className,
  decorative = true,
}: AssetImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={decorative ? "" : alt} className={className} />
  );
}

type GameObjectivePanelProps = {
  text: string;
  badge?: string;
};

export function GameObjectivePanel({ text, badge }: GameObjectivePanelProps) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/45 px-4 py-3">
      <div>
        <div className="text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
          objetivo
        </div>
        <div className="mt-1 text-sm font-black uppercase text-[var(--sand)]">
          {text}
        </div>
      </div>
      {badge ? (
        <div className="rounded-xl border border-black bg-[var(--accent)] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[2px_2px_0px_#000000]">
          {badge}
        </div>
      ) : null}
    </div>
  );
}

type PlayfieldStatusBarProps = {
  left: string;
  right: string;
};

export function PlayfieldStatusBar({ left, right }: PlayfieldStatusBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-[rgba(28,28,26,0.9)] px-3 py-2 text-[10px] font-black uppercase text-[var(--text)] backdrop-blur-sm sm:inset-x-5 sm:bottom-5 sm:px-4 sm:py-3 sm:text-xs">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}
