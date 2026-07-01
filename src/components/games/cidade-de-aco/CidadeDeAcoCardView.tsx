"use client";

import Image from "next/image";

import type { BattleCard, ForceLine } from "@/lib/cidadeDeAcoCards";

type CidadeDeAcoCardViewProps = {
  card: BattleCard;
  testId?: string;
  computedCost?: number;
  computedPower?: number;
  selected?: boolean;
  dimmed?: boolean;
  affordable?: boolean;
  feedbackTone?: "selected" | "warning" | "played" | null;
  statusText?: string | null;
  compact?: boolean;
  mini?: boolean;
  onClick?: () => void;
};

const FORCE_LABELS: Record<ForceLine, string> = {
  aco: "Aco",
  rio: "Rio",
  rua: "Rua",
  memoria: "Memoria",
  verde: "Verde",
  sombra: "Sombra",
};

const FORCE_STYLES: Record<ForceLine, string> = {
  aco: "border-[#f2a900]/60 bg-[#f2a900]/10 text-[#ffd86a]",
  rio: "border-[#2ac7c4]/60 bg-[#2ac7c4]/10 text-[#9cebea]",
  rua: "border-[#ff7e4e]/60 bg-[#ff7e4e]/10 text-[#ffc1a8]",
  memoria: "border-[#c8b07e]/60 bg-[#c8b07e]/10 text-[#efe1c0]",
  verde: "border-[#4fbb6f]/60 bg-[#4fbb6f]/10 text-[#b8e7c5]",
  sombra: "border-[#7a728e]/60 bg-[#7a728e]/10 text-[#d7d0ea]",
};

const TYPE_LABELS: Record<BattleCard["type"], string> = {
  personagem: "Personagem",
  lugar: "Lugar",
  simbolo: "Simbolo",
  "acao-coletiva": "Acao Coletiva",
  memoria: "Memoria",
  crise: "Crise",
};

const DEFAULT_ART_FILTER = "sepia(0.12) saturate(0.88) contrast(1.05) brightness(0.93)";
const CRISIS_ART_FILTER = "sepia(0.08) saturate(0.9) contrast(1.04) brightness(1.02)";
const MINI_ART_SOURCE_LABEL: Record<NonNullable<BattleCard["artSource"]>, string> = {
  "VR real": "real",
  "Composicao real": "comp.",
};

function getCardAccent(forces: ForceLine[]) {
  if (forces.includes("aco")) return "from-[#3d3527] via-[#574523] to-[#1b1712]";
  if (forces.includes("rio")) return "from-[#10242a] via-[#163844] to-[#081417]";
  if (forces.includes("verde")) return "from-[#11241c] via-[#183428] to-[#08120d]";
  if (forces.includes("rua")) return "from-[#2c1812] via-[#47231a] to-[#140b08]";
  if (forces.includes("memoria")) return "from-[#2c2417] via-[#46361f] to-[#151008]";
  return "from-[#26252a] via-[#2f2c36] to-[#131217]";
}

function getCardArtTone(card: BattleCard) {
  if (card.type === "crise") return "from-[#5a1821] via-[#2d1118] to-[#15080d]";
  if (card.type === "acao-coletiva") return "from-[#69461a] via-[#38240f] to-[#1a120a]";
  if (card.type === "lugar") return "from-[#17313a] via-[#15252d] to-[#0a1215]";
  if (card.type === "memoria") return "from-[#4e3518] via-[#2a1d0f] to-[#151008]";
  return "from-[#3b3b36] via-[#24231f] to-[#151412]";
}

function getCardArtFilter(card: BattleCard) {
  return card.type === "crise" ? CRISIS_ART_FILTER : DEFAULT_ART_FILTER;
}

export function CidadeDeAcoCardView({
  card,
  testId,
  computedCost,
  computedPower,
  selected = false,
  dimmed = false,
  affordable = true,
  feedbackTone = null,
  statusText,
  compact = false,
  mini = false,
  onClick,
}: CidadeDeAcoCardViewProps) {
  const cost = computedCost ?? card.cost;
  const power = computedPower ?? card.power;
  const artFitClassName = card.artFit === "contain" ? "object-contain" : "object-cover";
  const wrapperClassName = mini
    ? compact
      ? "w-[118px] min-w-[118px]"
      : "w-[132px] min-w-[132px]"
    : compact
      ? "w-[134px] min-w-[134px]"
      : "w-[158px] min-w-[158px]";
  const artHeightClassName = mini
    ? compact
      ? "h-[76px]"
      : "h-[88px]"
    : compact
      ? "h-[84px]"
      : "h-[100px]";
  const tokenSizeClassName = mini ? "h-8 w-8 text-[12px]" : "h-9 w-9 text-sm";
  const effectClassName = mini
    ? "mt-2 min-h-[22px] text-[9px] font-bold leading-snug text-[#dfd7c8]"
    : "mt-3 min-h-[34px] text-[10px] font-bold leading-snug text-[#dfd7c8]";
  const sourceLabel = mini ? MINI_ART_SOURCE_LABEL[card.artSource] : card.artSource;
  const body = (
    <>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${getCardAccent(card.forces)}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,169,0,0.08),transparent_34%)]" />
      <div className={`relative ${mini ? "p-2.5" : "p-3"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b6ada0]">
              {TYPE_LABELS[card.type]}
            </div>
            <div className={`mt-1 font-black uppercase leading-tight text-[#f7f1df] ${mini ? "line-clamp-2 text-[12px]" : "line-clamp-2 text-[13px]"}`}>
              {card.name}
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className={`flex shrink-0 items-center justify-center rounded-full border font-black ${
              affordable
                ? "border-[#f2a900]/55 bg-[#1b1710] text-[#ffd86a]"
                : "border-[#ff7e4e]/45 bg-[#241411] text-[#ffb39b]"
            } ${tokenSizeClassName}`}>
              {cost}
            </div>
            <div className={`flex shrink-0 items-center justify-center rounded-full border border-[#7be0d7]/35 bg-[#11191c] font-black text-[#b6fff8] ${tokenSizeClassName}`}>
              {power}
            </div>
          </div>
        </div>

        <div
          className={`mt-3 overflow-hidden rounded-[0.95rem] border border-white/8 bg-gradient-to-br p-2 ${artHeightClassName} ${getCardArtTone(card)}`}
        >
          {card.artPath ? (
            <div className="relative h-full overflow-hidden rounded-[0.8rem] border border-white/10 bg-black/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),inset_0_-22px_28px_rgba(0,0,0,0.18)]">
              <Image
                src={card.artPath}
                alt={`Arte da carta ${card.name}`}
                fill
                sizes={mini ? (compact ? "118px" : "132px") : compact ? "134px" : "158px"}
                className={artFitClassName}
                style={{
                  objectPosition: card.artPosition ?? "center center",
                  filter: getCardArtFilter(card),
                }}
              />
              <div className={`absolute inset-0 ${mini
                ? "bg-[linear-gradient(180deg,rgba(6,8,10,0.01),rgba(6,8,10,0.05)_40%,rgba(6,8,10,0.18)_72%,rgba(6,8,10,0.3))]"
                : "bg-[linear-gradient(180deg,rgba(6,8,10,0.03),rgba(6,8,10,0.08)_42%,rgba(6,8,10,0.34))]"}`} />
              <div className={`absolute ${mini ? "bottom-1.5 right-1.5" : "inset-x-0 top-0"} flex ${mini ? "justify-end" : "items-start justify-between gap-2 p-2"}`}>
                {!mini ? (
                  <div className="rounded-full border border-white/10 bg-black/28 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.18em] text-white/68">
                    arte
                  </div>
                ) : null}
                <div className={`rounded-full border border-white/10 ${mini ? "bg-black/45 px-1.5 py-0.5 text-[6px] tracking-[0.16em] text-white/78" : "bg-black/35 px-2 py-0.5 text-[7px] tracking-[0.12em] text-white/75"} font-black uppercase`}>
                  {sourceLabel}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col justify-between rounded-[0.8rem] border border-dashed border-white/10 bg-black/10 p-2">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[8px] font-black uppercase tracking-[0.22em] text-white/45">
                  arte
                </div>
                <div className="rounded-full border border-white/10 bg-black/15 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.12em] text-white/55">
                  {card.artSource}
                </div>
              </div>
              <div className="mt-1 line-clamp-2 text-[8px] font-black uppercase tracking-[0.14em] text-[#f2d8a0]">
                {card.artAnchor}
              </div>
              <div className="line-clamp-3 text-[9px] font-bold leading-snug text-white/82">
                {card.artDirection}
              </div>
            </div>
          )}
        </div>

        <div className={`flex flex-wrap gap-1.5 ${mini ? "mt-2" : "mt-3"}`}>
          {!affordable ? (
            <span className="rounded-full border border-[#ff7e4e]/40 bg-[#ff7e4e]/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[#ffb39b]">
              sem folego
            </span>
          ) : null}
          {card.forces.map((force) => (
            <span
              key={`${card.id}-${force}`}
              className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] ${FORCE_STYLES[force]}`}
            >
              {FORCE_LABELS[force]}
            </span>
          ))}
        </div>

        <p className={effectClassName}>
          {card.effect}
        </p>
        {statusText ? (
          <div className={`mt-2 rounded-lg border px-2.5 ${mini ? "py-1.5 text-[8px]" : "py-2 text-[9px]"} font-black uppercase tracking-[0.12em] ${
            affordable
              ? "border-white/8 bg-black/15 text-[#9e9788]"
              : "border-[#ff7e4e]/20 bg-[#2a1612] text-[#ffb39b]"
          }`}>
            {statusText}
          </div>
        ) : null}
      </div>
    </>
  );

  const className = `${wrapperClassName} relative overflow-hidden rounded-[1.2rem] border text-left transition-all duration-150 ${
    dimmed
      ? "border-white/8 opacity-70"
      : selected
        ? "border-[#f2a900] shadow-[0_0_0_1px_rgba(242,169,0,0.2),0_18px_40px_rgba(0,0,0,0.32)] -translate-y-1"
        : onClick
          ? "border-white/10 hover:-translate-y-[2px] hover:border-[#f2a900]/55"
          : "border-white/10"
  } ${!affordable && onClick ? "cursor-not-allowed" : ""} ${
    feedbackTone === "selected"
      ? "city-card-selected-loop"
      : feedbackTone === "warning"
        ? "city-card-warning-shake"
        : feedbackTone === "played"
          ? "city-card-played-pop"
          : ""
  } bg-[linear-gradient(180deg,rgba(9,11,13,0.98),rgba(21,20,18,0.98))]`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} data-testid={testId}>
        {body}
      </button>
    );
  }

  return <div className={className} data-testid={testId}>{body}</div>;
}
