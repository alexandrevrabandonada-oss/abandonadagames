"use client";

import { CidadeDeAcoCardView } from "@/components/games/cidade-de-aco/CidadeDeAcoCardView";
import type { BattleCard } from "@/lib/cidadeDeAcoCards";

type TerritoryPreviewCard = {
  id: string;
  card: BattleCard;
  power: number;
  isBuffed?: boolean;
};

type CidadeDeAcoTerritoryViewProps = {
  testId?: string;
  name: string;
  subtitle: string;
  upgradeName: string;
  upgradeText: string;
  upgradedFor: "player" | "bot" | null;
  playerWins: number;
  botWins: number;
  playerCrisis: number;
  botCrisis: number;
  playerPower: number;
  botPower: number;
  playerCards: TerritoryPreviewCard[];
  botCards: TerritoryPreviewCard[];
  selected?: boolean;
  blocked?: boolean;
  feedbackTone?: "impact" | "warning" | null;
  disabled?: boolean;
  lastWinner?: "player" | "bot" | "tie" | null;
  leaderText?: string;
  playHint?: string | null;
  onClick?: () => void;
};

function renderPlayedCard(entry: TerritoryPreviewCard, side: "player" | "bot") {
  return (
    <div key={entry.id} className="shrink-0">
      <CidadeDeAcoCardView
        card={entry.card}
        compact
        mini
        computedPower={entry.power}
        statusText={entry.isBuffed ? "buff ativo" : side === "player" ? "presenca sua" : "pressao rival"}
      />
    </div>
  );
}

export function CidadeDeAcoTerritoryView({
  testId,
  name,
  subtitle,
  upgradeName,
  upgradeText,
  upgradedFor,
  playerWins,
  botWins,
  playerCrisis,
  botCrisis,
  playerPower,
  botPower,
  playerCards,
  botCards,
  selected = false,
  blocked = false,
  feedbackTone = null,
  disabled = false,
  lastWinner,
  leaderText,
  playHint,
  onClick,
}: CidadeDeAcoTerritoryViewProps) {
  const glowClassName =
    upgradedFor === "player"
      ? "shadow-[0_0_0_1px_rgba(42,199,196,0.24),0_0_28px_rgba(42,199,196,0.14)]"
      : upgradedFor === "bot"
        ? "shadow-[0_0_0_1px_rgba(255,126,78,0.24),0_0_28px_rgba(255,126,78,0.14)]"
        : "";

  return (
    <div
      data-testid={testId}
      className={`relative min-w-[308px] snap-center overflow-hidden rounded-[1.35rem] border text-left transition-all duration-150 sm:min-w-[344px] ${
        disabled
          ? "opacity-60"
          : blocked
            ? "border-[#ff7e4e]/24 opacity-80"
            : selected
              ? "border-[#f2a900] -translate-y-[2px]"
            : "border-white/10 hover:border-[#f2a900]/35"
      } ${feedbackTone === "impact" ? "city-territory-impact" : feedbackTone === "warning" ? "city-territory-warning" : ""} ${glowClassName} bg-[linear-gradient(180deg,rgba(19,21,24,0.98),rgba(10,11,13,0.98))]`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,169,0,0.08),transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#f2a900] via-[#ff7e4e] to-[#2ac7c4]" />
      <div className="relative p-4">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`block w-full rounded-[1.1rem] text-left ${disabled ? "cursor-not-allowed" : ""}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b9b1a6]">
                territorio
              </div>
              <div className="mt-1 text-lg font-black uppercase leading-tight text-[#f7f1df]">
                {upgradedFor ? upgradeName : name}
              </div>
              <p className="mt-1 text-[11px] font-bold leading-snug text-[#d8d0c4]">
                {upgradedFor ? upgradeText : subtitle}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-right">
              <div className="text-[9px] font-black uppercase tracking-[0.12em] text-[#9c9488]">
                cidade viva
              </div>
              <div className="mt-1 flex gap-1">
                <span className="rounded-full bg-[#2ac7c4]/12 px-2 py-1 text-[10px] font-black text-[#9debea]">
                  J {playerWins}
                </span>
                <span className="rounded-full bg-[#ff7e4e]/12 px-2 py-1 text-[10px] font-black text-[#ffc0a5]">
                  B {botWins}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-[1.1rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.08))]">
            <div className="aspect-[16/5] border-b border-white/8 bg-[radial-gradient(circle_at_30%_20%,rgba(242,169,0,0.12),transparent_32%),linear-gradient(180deg,rgba(28,33,37,0.6),rgba(8,9,12,0.92))] p-3 sm:aspect-[5/3]">
              <div className="flex h-full items-end justify-between gap-3">
                <div className="max-w-[140px] text-[11px] font-black uppercase leading-[1.1] text-[#f2d8a0]/75">
                  {upgradedFor ? "territorio reforcado" : "disputa aberta"}
                </div>
                <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-right">
                  <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#8f877a]">
                    saldo
                  </div>
                  <div className="mt-1 text-lg font-black text-[#f7f1df]">{playerPower} x {botPower}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3">
              <div className="rounded-2xl border border-[#2ac7c4]/16 bg-[#122026] p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-black uppercase tracking-[0.12em] text-[#7fd8d8]">
                    jogador
                  </div>
                  <div className="rounded-full border border-[#2ac7c4]/25 bg-black/20 px-2 py-0.5 text-xs font-black text-[#dff9f8]">
                    {playerPower}
                  </div>
                </div>
                <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#93c9c9]">
                  crise {playerCrisis}
                </div>
              </div>
              <div className="rounded-2xl border border-[#ff7e4e]/16 bg-[#261713] p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-black uppercase tracking-[0.12em] text-[#ffb293]">
                    bot
                  </div>
                  <div className="rounded-full border border-[#ff7e4e]/25 bg-black/20 px-2 py-0.5 text-xs font-black text-[#ffe5d7]">
                    {botPower}
                  </div>
                </div>
                <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#e2a18a]">
                  crise {botCrisis}
                </div>
              </div>
            </div>
          </div>

          {leaderText ? (
            <div className="mt-3 rounded-xl border border-[#f2a900]/18 bg-[#201911] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#f2d8a0]">
              {leaderText}
            </div>
          ) : null}

          {playHint && (selected || blocked) ? (
            <div className={`mt-3 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${
              disabled || blocked
                ? "border-[#ff7e4e]/22 bg-[#291613] text-[#ffb39b]"
                : "border-[#2ac7c4]/22 bg-[#122126] text-[#baf5f2]"
            }`}>
              {playHint}
            </div>
          ) : null}

          {lastWinner ? (
            <div className={`mt-3 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${
              lastWinner === "player"
                ? "border-[#2ac7c4]/30 bg-[#2ac7c4]/10 text-[#a7ecec]"
                : lastWinner === "bot"
                  ? "border-[#ff7e4e]/30 bg-[#ff7e4e]/10 text-[#ffc3ad]"
                  : "border-white/10 bg-white/5 text-[#d7d1c6]"
            }`}>
              {lastWinner === "player"
                ? "voce venceu este ponto"
                : lastWinner === "bot"
                  ? "o bot segurou este territorio"
                  : "ultimo confronto terminou empatado"}
            </div>
          ) : null}
        </button>

        <div className="mt-4 grid gap-3">
          <div className="space-y-2">
            <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#7fd8d8]">
              sua presenca
            </div>
            {playerCards.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {playerCards.map((entry) => renderPlayedCard(entry, "player"))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/8 bg-black/15 px-3 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8e8a84]">
                nenhum card aqui
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#ffb293]">
              pressao do bot
            </div>
            {botCards.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {botCards.map((entry) => renderPlayedCard(entry, "bot"))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/8 bg-black/15 px-3 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8e8a84]">
                sem ocupacao rival
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
