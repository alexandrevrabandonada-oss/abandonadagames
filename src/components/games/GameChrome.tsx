import Link from "next/link";
import type { ReactNode } from "react";

export function GameHomeLink() {
  return (
    <Link
      href="/"
      prefetch={false}
      className="rounded-lg border border-[var(--accent)] px-3 py-2 text-[11px] font-black uppercase text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-black"
    >
      Inicio
    </Link>
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
      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ffd554]">Pre-campanha</div>
      <h3 className="mt-1 text-lg font-black uppercase tracking-wide text-white">Alexandre VR Abandonada</h3>
      <p className="mt-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-[#ff7c52]">Candidato a Deputado Estadual</p>
      <p className="mt-3 text-xs font-semibold leading-relaxed text-[#d4e8d8]/90">
        &ldquo;Volta Redonda e o estado do Rio de Janeiro precisam de dignidade: merenda escolar de qualidade, valorizacao profissional, saude eficiente e transporte publico que realmente funcione. Vamos juntos mudar essa realidade!&rdquo;
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
    <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-center justify-between rounded-xl border border-white/5 bg-[rgba(28,28,26,0.9)] px-4 py-3 text-xs font-black uppercase text-[var(--text)] backdrop-blur-sm">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}
