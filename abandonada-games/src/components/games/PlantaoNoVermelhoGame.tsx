"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameDefinition } from "@/lib/gameRegistry";
import type { ScoreSubmission } from "@/lib/score";

type ItemKind = "good" | "bad" | "power";

type FallingItem = {
  id: number;
  kind: ItemKind;
  x: number;
  y: number;
  size: number;
  label: string;
  nearMissed?: boolean;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
  tone: ItemKind;
};

type GameSnapshot = {
  score: number;
  day: number;
  breath: number;
  bills: number;
  chaos: number;
  combo: number;
  maxCombo: number;
  supports: number;
  billsDodged: number;
  shiftsWorked: number;
  essentialsBought: number;
  extraCostsAvoided: number;
  mentalCare: number;
  actionCount: number;
  decisionStreak: number;
  maxDecisionStreak: number;
  lastActionAt: number;
  bestScore: number;
  rank: string;
  running: boolean;
  finished: boolean;
};

type AudioTone = "good" | "bad" | "power";

type GameSprites = {
  hospital: HTMLImageElement | null;
  nurse: HTMLImageElement | null;
};

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 1080;
const ROUND_DURATION_MS = 60000;
const PLAYER_Y = 850;
const BEST_SCORE_KEY = "abandonada:plantaono-vermelho:best-score";
const PLAYER_NAME_KEY = "abandonada:plantaono-vermelho:player-name";

const rankTable = [
  { min: 0, label: "D", message: "O mes venceu." },
  { min: 1300, label: "C", message: "Sobreviveu no sufoco." },
  { min: 3100, label: "B", message: "Segurou a onda." },
  { min: 5200, label: "A", message: "Virou o mes de pe." },
  { min: 7600, label: "S", message: "Mutirao salvou geral." },
];

const events = [
  "Salario atrasou!",
  "Mercado subiu!",
  "Conta venceu!",
  "Plantao extra!",
  "Apoio chegou!",
  "Boleto surpresa!",
  "Dia pesado!",
  "Organizacao ajuda!",
  "Cafe virou almoco!",
  "Escala mudou sem avisar!",
  "Pix da vaquinha pingou!",
  "Chefe mandou aguardar!",
  "Transporte comeu o saldo!",
  "Grupo do plantao ferveu!",
];

const viralEvents = [
  "Mercado subiu: energia custa caro.",
  "Escala virou roleta: descanso foi cortado.",
  "Conta venceu: o boleto nao negocia com cansaco.",
  "Cafe virou almoco: folego comprado no fiado.",
  "Grupo do plantao ferveu: todo mundo no limite.",
  "Transporte comeu o saldo antes do turno.",
] as const;

const survivalActions = [
  {
    id: "trabalhar",
    title: "Trabalhar",
    subtitle: "+ dinheiro",
    icon: "/games/plantaono-vermelho/icon-work.png",
    tone: "bg-[#c96f08]",
    score: 220,
    breath: -14,
    bills: -5,
    chaos: 7,
    tradeoff: "+R$ / -energia",
    toast: "Plantao pago em migalha.",
  },
  {
    id: "bico",
    title: "Fazer bico",
    subtitle: "+ renda extra",
    icon: "/games/plantaono-vermelho/icon-tools.png",
    tone: "bg-[#086aa0]",
    score: 170,
    breath: -18,
    bills: -8,
    chaos: 12,
    tradeoff: "+renda / +caos",
    toast: "Virou noite no bico.",
  },
  {
    id: "economizar",
    title: "Economizar",
    subtitle: "- gastos",
    icon: "/games/plantaono-vermelho/icon-pig.png",
    tone: "bg-[#6f2aa8]",
    score: 120,
    breath: -7,
    bills: -6,
    chaos: 5,
    tradeoff: "-contas / -conforto",
    toast: "Cortou o minimo do minimo.",
  },
  {
    id: "saude",
    title: "Cuidar da saude",
    subtitle: "+ energia",
    icon: "/games/plantaono-vermelho/icon-health.png",
    tone: "bg-[#247a26]",
    score: 90,
    breath: 10,
    bills: 7,
    chaos: -5,
    tradeoff: "+energia / +conta",
    toast: "Respirou antes do colapso.",
  },
];

const needBars = [
  { label: "alimentacao", icon: "/games/plantaono-vermelho/icon-food.png", color: "#ffd554", getValue: (snapshot: GameSnapshot) => clamp(100 - snapshot.bills * 0.65, 8, 100) },
  { label: "transporte", icon: "/games/plantaono-vermelho/icon-bus.png", color: "#62d6ff", getValue: (snapshot: GameSnapshot) => clamp(92 - snapshot.bills * 0.45, 10, 100) },
  { label: "saude", icon: "/games/plantaono-vermelho/icon-health.png", color: "#9ee8c1", getValue: (snapshot: GameSnapshot) => clamp(snapshot.breath, 0, 100) },
  { label: "lazer", icon: "/games/plantaono-vermelho/icon-gamepad.png", color: "#ff9a62", getValue: (snapshot: GameSnapshot) => clamp(70 - snapshot.chaos * 0.7, 5, 100) },
  { label: "sono", icon: "/games/plantaono-vermelho/icon-sleep.png", color: "#62d6ff", getValue: (snapshot: GameSnapshot) => clamp(snapshot.breath - snapshot.chaos * 0.22, 5, 100) },
  { label: "saude mental", icon: "/games/plantaono-vermelho/icon-brain.png", color: "#d778ff", getValue: (snapshot: GameSnapshot) => clamp(105 - snapshot.chaos, 4, 100) },
];

const dueBills = [
  ["aluguel", 400],
  ["agua", 45],
  ["luz", 120],
  ["internet", 89.9],
  ["mercado", 300],
  ["transporte", 120],
] as const;

const achievementDefs = [
  {
    id: "plantao",
    title: "Plantao cumprido",
    description: "Trabalhe ao menos um plantao.",
    unlocked: (snapshot: GameSnapshot) => snapshot.shiftsWorked >= 1,
  },
  {
    id: "respiro",
    title: "Respiro coletivo",
    description: "Cuide da saude mental.",
    unlocked: (snapshot: GameSnapshot) => snapshot.mentalCare >= 1 || snapshot.chaos < 35,
  },
  {
    id: "contas",
    title: "Boleto contido",
    description: "Baixe as contas abaixo de 35%.",
    unlocked: (snapshot: GameSnapshot) => snapshot.bills < 35,
  },
  {
    id: "mes",
    title: "Chegou ao fim",
    description: "Alcance o dia 30.",
    unlocked: (snapshot: GameSnapshot) => snapshot.day >= 30,
  },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getRank(score: number) {
  return [...rankTable].reverse().find((rank) => score >= rank.min) ?? rankTable[0];
}

function getViralHeadline(stats: GameSnapshot) {
  if (stats.day >= 30) return "Virei o mes sem salario. O sistema perdeu no detalhe.";
  if (stats.maxDecisionStreak >= 7) return `Segurei ${stats.maxDecisionStreak} decisoes no reflexo e ainda faltou mes.`;
  if (stats.breath <= 18) return `Cheguei ao dia ${stats.day} com ${Math.round(stats.breath)}% de folego.`;
  if (stats.bills >= 92) return `O boleto encostou no pescoco no dia ${stats.day}.`;
  if (stats.chaos >= 92) return `Caos em ${Math.round(stats.chaos)}%. Quem segura esse plantao?`;
  return `Sobrevivi ${stats.day} dias com salario atrasado.`;
}

function getViralChallenge(stats: GameSnapshot) {
  const missingDays = Math.max(0, 30 - stats.day);
  if (missingDays === 0) return "Desafio: fecha o mes com mais ritmo que eu.";
  return `Desafio: falta so ${missingDays} dias. Voce vira esse mes?`;
}

function getResultMessage(stats: GameSnapshot) {
  if (stats.day < 30 && stats.rank === "A") return "Quase virou o mes.";
  if (stats.day < 30 && stats.rank === "S") return "Pontuou alto, mas o mes esmagou.";
  return getRank(stats.score).message;
}

function getSocialChallenge(stats: GameSnapshot) {
  const targetScore = Math.ceil((stats.score + Math.max(420, (30 - stats.day) * 95)) / 10) * 10;
  const position =
    stats.score >= 7600 ? 1 :
    stats.score >= 6200 ? 3 :
    stats.score >= 5200 ? 7 :
    stats.score >= 4200 ? 13 :
    stats.score >= 3100 ? 21 :
    34;
  const percentile =
    position <= 3 ? "top 3%" :
    position <= 7 ? "top 8%" :
    position <= 13 ? "top 15%" :
    position <= 21 ? "top 30%" :
    "sobreviventes do sufoco";
  return {
    position,
    percentile,
    targetScore,
    defeated: Math.max(12, 58 - position),
    callout: `Bata ${targetScore} pts e passe meu plantao.`,
  };
}

function createInitialSnapshot(bestScore = 0): GameSnapshot {
  return {
    score: 3200,
    day: 12,
    breath: 60,
    bills: 84,
    chaos: 62,
    combo: 0,
    maxCombo: 0,
    supports: 0,
    billsDodged: 0,
    shiftsWorked: 0,
    essentialsBought: 0,
    extraCostsAvoided: 0,
    mentalCare: 0,
    actionCount: 0,
    decisionStreak: 0,
    maxDecisionStreak: 0,
    lastActionAt: 0,
    bestScore,
    rank: getRank(3200).label,
    running: false,
    finished: false,
  };
}

function resizeCanvas(canvas: HTMLCanvasElement, containerWidth: number) {
  const width = Math.min(containerWidth, 560);
  const height = width * (CANVAS_HEIGHT / CANVAS_WIDTH);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = CANVAS_WIDTH * window.devicePixelRatio;
  canvas.height = CANVAS_HEIGHT * window.devicePixelRatio;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  return ctx;
}

async function createResultCardFile(stats: GameSnapshot) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const headline = getViralHeadline(stats);
  const challenge = getViralChallenge(stats);
  const social = getSocialChallenge(stats);

  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#114569");
  bg.addColorStop(0.42, "#241015");
  bg.addColorStop(1, "#071414");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,213,84,0.1)";
  ctx.fillRect(54, 58, 972, 1234);
  ctx.strokeStyle = "#ff3b30";
  ctx.lineWidth = 14;
  ctx.strokeRect(54, 58, 972, 1234);
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.fillRect(88, 92, 904, 150);

  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 62px "Geist", sans-serif';
  ctx.fillText("PLANTAO NO VERMELHO", 112, 162);
  ctx.fillStyle = "#ffd554";
  ctx.font = '900 34px "Geist", sans-serif';
  ctx.fillText("como sobreviver com salario atrasado", 112, 212);

  ctx.fillStyle = "#ff3b30";
  ctx.font = '900 240px "Geist", sans-serif';
  ctx.fillText(stats.rank, 108, 475);
  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 56px "Geist", sans-serif';
  ctx.fillText(`${stats.score} pts`, 355, 390);
  ctx.fillStyle = "#ffd554";
  ctx.fillRect(356, 424, 432, 72);
  ctx.fillStyle = "#130d10";
  ctx.font = '900 24px "Geist", sans-serif';
  ctx.fillText(`#${social.position} RANKING LOCAL`, 382, 454);
  ctx.fillText(`ALVO ${social.targetScore}`, 382, 486);
  ctx.fillStyle = "#ffd554";
  ctx.font = '900 46px "Geist", sans-serif';
  wrapCanvasText(ctx, headline, 112, 610, 840, 58, 3);

  ctx.fillStyle = "rgba(255,255,255,0.09)";
  ctx.fillRect(112, 775, 856, 218);
  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 50px "Geist", sans-serif';
  ctx.fillText(`${stats.day}/30`, 150, 875);
  ctx.fillText(`${stats.maxDecisionStreak}x`, 405, 875);
  ctx.fillText(`${Math.round(stats.bills)}%`, 690, 875);
  ctx.fillStyle = "#9ee8c1";
  ctx.font = '800 25px "Geist", sans-serif';
  ctx.fillText("dias", 150, 925);
  ctx.fillText("ritmo", 405, 925);
  ctx.fillText("contas", 690, 925);

  ctx.fillStyle = "#ffd554";
  ctx.font = '900 44px "Geist", sans-serif';
  wrapCanvasText(ctx, challenge, 112, 1080, 820, 52, 2);
  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 34px "Geist", sans-serif';
  wrapCanvasText(ctx, `#${social.position} no ranking local - ${social.callout}`, 112, 1194, 830, 42, 2);
  ctx.fillText("jogue, printe e desafie outro plantao", 112, 1270);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return null;
  return new File([blob], "plantaono-vermelho-resultado.png", { type: "image/png" });
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineCount * lineHeight);
      line = word;
      lineCount += 1;
      if (lineCount >= maxLines) return;
    } else {
      line = testLine;
    }
  }
  if (line && lineCount < maxLines) ctx.fillText(line, x, y + lineCount * lineHeight);
}

export function PlantaoNoVermelhoGame({ game }: { game: GameDefinition }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const startAtRef = useRef(0);
  const lastTickRef = useRef(0);
  const nextSpawnAtRef = useRef(0);
  const nextEventAtRef = useRef(6500);
  const nextDayAtRef = useRef(2000);
  const itemSeqRef = useRef(0);
  const playerXRef = useRef(CANVAS_WIDTH / 2);
  const targetXRef = useRef(CANVAS_WIDTH / 2);
  const shakeRef = useRef(0);
  const reliefRef = useRef(0);
  const mutiraoPulseRef = useRef(0);
  const interestFrozenRef = useRef(0);
  const itemsRef = useRef<FallingItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const spritesRef = useRef<GameSprites>({ hospital: null, nurse: null });
  const initialBestScore =
    typeof window !== "undefined"
      ? Number.parseInt(window.localStorage.getItem(BEST_SCORE_KEY) ?? "0", 10) || 0
      : 0;
  const initialPlayerName =
    typeof window !== "undefined" ? window.localStorage.getItem(PLAYER_NAME_KEY) ?? "Anon" : "Anon";
  const bestScoreRef = useRef(initialBestScore);
  const submittedRef = useRef(false);
  const stateRef = useRef<GameSnapshot>(createInitialSnapshot(initialBestScore));
  const audioContextRef = useRef<AudioContext | null>(null);

  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => createInitialSnapshot(initialBestScore));
  const [playerName, setPlayerName] = useState(initialPlayerName);
  const [toast, setToast] = useState("Segura o mes!");
  const [copyLabel, setCopyLabel] = useState("Compartilhar");
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [decisionFlash, setDecisionFlash] = useState<{ title: string; subtitle: string; tone: string } | null>(null);

  const rankMeta = useMemo(() => getRank(snapshot.score), [snapshot.score]);

  useEffect(() => {
    const hospital = new Image();
    const nurse = new Image();
    hospital.src = "/games/plantaono-vermelho/hospital-bg.png";
    nurse.src = "/games/plantaono-vermelho/nurse-player.png";
    hospital.onload = () => {
      spritesRef.current = { ...spritesRef.current, hospital };
    };
    nurse.onload = () => {
      spritesRef.current = { ...spritesRef.current, nurse };
    };
  }, []);

  const playTone = useCallback((tone: AudioTone) => {
    try {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      const config =
        tone === "good"
          ? { frequency: 720, duration: 0.08, gain: 0.04, type: "triangle" as OscillatorType }
          : tone === "power"
            ? { frequency: 920, duration: 0.14, gain: 0.055, type: "square" as OscillatorType }
            : { frequency: 150, duration: 0.16, gain: 0.05, type: "sawtooth" as OscillatorType };
      oscillator.type = config.type;
      oscillator.frequency.value = config.frequency;
      gain.gain.value = config.gain;
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);
      oscillator.stop(ctx.currentTime + config.duration);
    } catch {}
  }, []);

  const updateBestScore = useCallback((score: number) => {
    if (score <= bestScoreRef.current) return;
    bestScoreRef.current = score;
    try {
      window.localStorage.setItem(BEST_SCORE_KEY, String(score));
    } catch {}
  }, []);

  const mutateState = useCallback(
    (updater: (current: GameSnapshot) => GameSnapshot) => {
      const next = updater(stateRef.current);
      stateRef.current = next;
      updateBestScore(next.score);
      if (bestScoreRef.current !== next.bestScore) {
        stateRef.current = { ...next, bestScore: bestScoreRef.current };
      }
      setSnapshot(stateRef.current);
    },
    [updateBestScore],
  );

  const addParticle = useCallback((text: string, x: number, y: number, tone: ItemKind) => {
    particlesRef.current.push({ id: Date.now() + Math.random(), x, y, text, life: 1, tone });
  }, []);

  const spawnItem = useCallback(
    (kind: ItemKind, elapsed: number) => {
      itemSeqRef.current += 1;
      const pool =
        kind === "bad"
          ? game.obstacles
          : kind === "power"
            ? ["Mutirao", "Marmita garantida", "Carona", "Organizacao", "Apoio dos colegas"]
            : game.powerUps;
      itemsRef.current.push({
        id: itemSeqRef.current + Math.floor(elapsed),
        kind,
        x: 90 + Math.random() * (CANVAS_WIDTH - 180),
        y: -70,
        size: kind === "power" ? 54 : 46,
        label: pool[Math.floor(Math.random() * pool.length)],
      });
    },
    [game.obstacles, game.powerUps],
  );

  const resetRound = useCallback(() => {
    submittedRef.current = false;
    itemSeqRef.current = 0;
    playerXRef.current = CANVAS_WIDTH / 2;
    targetXRef.current = CANVAS_WIDTH / 2;
    nextSpawnAtRef.current = 300;
    nextEventAtRef.current = 6500;
    nextDayAtRef.current = 2000;
    shakeRef.current = 0;
    reliefRef.current = 0;
    mutiraoPulseRef.current = 0;
    interestFrozenRef.current = 0;
    itemsRef.current = [];
    particlesRef.current = [];
    const next = { ...createInitialSnapshot(bestScoreRef.current), running: true };
    stateRef.current = next;
    setSnapshot(next);
    setToast("Segura o mes!");
    startAtRef.current = performance.now();
    lastTickRef.current = performance.now();
  }, []);

  const finishRound = useCallback(() => {
    if (stateRef.current.finished) return;
    const rank = getRank(stateRef.current.score).label;
    mutateState((current) => ({
      ...current,
      running: false,
      finished: true,
      rank,
      bestScore: bestScoreRef.current,
    }));
    setToast(rank === "D" ? "O mes venceu." : "Virou o mes!");
  }, [mutateState]);

  const collectItem = useCallback(
    (item: FallingItem) => {
      if (item.kind === "bad") {
        const isPlantao = item.label.includes("plantao");
        const isJuros = item.label.includes("juros") || item.label.includes("cobranca") || item.label.includes("cartao");
        const currentDay = stateRef.current.day;
        mutateState((current) => ({
          ...current,
          combo: 0,
          breath: clamp(current.breath - (isPlantao ? 9 : currentDay < 7 ? 4 : 6), 0, 100),
          bills: clamp(current.bills + (isPlantao ? 2 : currentDay < 7 ? 5 : isJuros ? 9 : 7), 0, 100),
          chaos: clamp(current.chaos + (interestFrozenRef.current > 0 ? 3 : currentDay < 7 ? 5 : isJuros ? 9 : 7), 0, 100),
          score: current.score + (isPlantao ? 120 : 0),
          rank: getRank(current.score + (isPlantao ? 120 : 0)).label,
        }));
        shakeRef.current = 0.38;
        addParticle(isPlantao ? "Plantao pesado!" : isJuros ? "Juros apertou!" : "Caos subiu!", item.x - 60, item.y, "bad");
        setToast(isPlantao ? "Plantao pesado!" : isJuros ? "Juros apertou!" : "Boleto vindo!");
        playTone("bad");
        return;
      }

      const isPower = item.kind === "power";
      const label = item.label.toLowerCase();
      if (label.includes("mutirao")) {
        const cleared = itemsRef.current.filter((falling) => falling.kind === "bad" && falling.y < CANVAS_HEIGHT * 0.78).length;
        itemsRef.current = itemsRef.current.filter((falling) => falling.kind !== "bad" || falling.y > CANVAS_HEIGHT * 0.78);
        mutiraoPulseRef.current = 0.85;
        addParticle(cleared > 1 ? "Mutirao limpou!" : "Mutirao!", item.x - 70, item.y, "power");
      }
      if (label.includes("organizacao")) interestFrozenRef.current = 5;
      if (label.includes("marmita")) reliefRef.current = 0.6;

      mutateState((current) => {
        const combo = current.combo + 1;
        const gain = isPower ? 260 + combo * 24 : 150 + combo * 16;
        const breathGain = label.includes("marmita") || label.includes("descanso") ? 16 : 8;
        const billRelief = label.includes("carona") || label.includes("vaquinha") || label.includes("pix") ? 11 : 5;
        const chaosRelief = label.includes("apoio") || label.includes("organizacao") || label.includes("mutirao") ? 14 : 7;
        return {
          ...current,
          score: current.score + gain,
          combo,
          maxCombo: Math.max(current.maxCombo, combo),
          supports: current.supports + 1,
          breath: clamp(current.breath + breathGain, 0, 100),
          bills: clamp(current.bills - billRelief, 0, 100),
          chaos: clamp(current.chaos - chaosRelief, 0, 100),
          rank: getRank(current.score + gain).label,
        };
      });
      addParticle(isPower ? "Organizacao ajuda!" : label.includes("marmita") ? "Respira!" : "Apoio!", item.x - 80, item.y, item.kind);
      setToast(stateRef.current.combo >= 3 ? "Combo de apoio!" : label.includes("marmita") ? "Respira!" : "Apoio chegou!");
      playTone(isPower ? "power" : "good");
    },
    [addParticle, mutateState, playTone],
  );

  const movePlayer = useCallback((direction: -1 | 1) => {
    targetXRef.current = clamp(targetXRef.current + direction * 92, 68, CANVAS_WIDTH - 68);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") movePlayer(-1);
      if (key === "arrowright" || key === "d") movePlayer(1);
      if (key === "arrowup" || key === "w") {
        mutateState((current) => ({ ...current, breath: clamp(current.breath - 2, 0, 100), score: current.score + 8 }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer, mutateState]);

  useEffect(() => {
    resetRound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const ctx = resizeCanvas(canvas, parent?.clientWidth ?? 420);
    if (!ctx) return;

    const render = (now: number) => {
      const dt = Math.min(0.033, (now - lastTickRef.current) / 1000);
      lastTickRef.current = now;
      const elapsed = now - startAtRef.current;
      const phase = elapsed / ROUND_DURATION_MS;
      const grace = elapsed < 10000;
      const timeDay = clamp(1 + Math.floor((elapsed / ROUND_DURATION_MS) * 30), 1, 30);
      const day = Math.max(stateRef.current.day, timeDay);
      const speed = (grace ? 165 : 190) + phase * 165 + stateRef.current.chaos * (grace ? 0.45 : 0.72);

      if (stateRef.current.running) {
        if (elapsed >= nextSpawnAtRef.current) {
          const roll = Math.random();
          const badChance = grace ? 0.43 : 0.5 + phase * 0.14;
          const goodChance = grace ? 0.86 : 0.82;
          spawnItem(roll < badChance ? "bad" : roll < goodChance ? "good" : "power", elapsed);
          nextSpawnAtRef.current = elapsed + clamp((grace ? 1180 : 1040) - phase * 360, 540, 1180);
        }
        if (elapsed >= nextEventAtRef.current) {
          const message = events[Math.floor(Math.random() * events.length)];
          setToast(message);
          if (message.includes("Juros") || message.includes("Mercado") || message.includes("Conta")) {
            mutateState((current) => ({
              ...current,
              bills: clamp(current.bills + 4, 0, 100),
              chaos: clamp(current.chaos + 4, 0, 100),
            }));
          }
          if (message.includes("Apoio") || message.includes("Colegas")) spawnItem("power", elapsed);
          nextEventAtRef.current = elapsed + 5200 + Math.random() * 1600;
        }
        if (elapsed >= nextDayAtRef.current) {
          mutateState((current) => ({
            ...current,
            day,
            breath: clamp(current.breath - (grace ? 0.8 : 1.55), 0, 100),
          bills: clamp(current.bills + (grace ? 0.82 : 1.28), 0, 100),
          chaos: clamp(current.chaos + (interestFrozenRef.current > 0 ? 0.18 : grace ? 0.58 : 0.92), 0, 100),
          }));
          if (day === 10 || day === 20) setToast("O salario nao caiu!");
          nextDayAtRef.current = elapsed + 2000;
        }
      }

      playerXRef.current += (targetXRef.current - playerXRef.current) * 0.2;
      if (shakeRef.current > 0) shakeRef.current = Math.max(0, shakeRef.current - dt);
      if (reliefRef.current > 0) reliefRef.current = Math.max(0, reliefRef.current - dt);
      if (mutiraoPulseRef.current > 0) mutiraoPulseRef.current = Math.max(0, mutiraoPulseRef.current - dt * 1.8);
      if (interestFrozenRef.current > 0) interestFrozenRef.current = Math.max(0, interestFrozenRef.current - dt);

      const hitIds = new Set<number>();
      itemsRef.current = itemsRef.current
        .map((item) => ({ ...item, y: item.y + speed * dt }))
        .filter((item) => {
          if (item.y > CANVAS_HEIGHT + 80) {
            if (item.kind === "bad") {
              mutateState((current) => ({ ...current, billsDodged: current.billsDodged + 1, score: current.score + 18 }));
            }
            return false;
          }
          if (item.kind === "bad" && !item.nearMissed && item.y > PLAYER_Y + 38 && Math.abs(item.x - playerXRef.current) < 82) {
            item.nearMissed = true;
            addParticle("Passou raspando!", item.x - 78, PLAYER_Y - 70, "good");
            mutateState((current) => ({ ...current, score: current.score + 36 }));
          }
          return true;
        });

      for (const item of itemsRef.current) {
        const distance = Math.hypot(item.x - playerXRef.current, item.y - PLAYER_Y);
        if (distance < item.size + 38) {
          hitIds.add(item.id);
          collectItem(item);
        }
      }
      if (hitIds.size > 0) {
        itemsRef.current = itemsRef.current.filter((item) => !hitIds.has(item.id));
      }

      particlesRef.current = particlesRef.current
        .map((particle) => ({ ...particle, y: particle.y - 46 * dt, life: particle.life - dt * 1.25 }))
        .filter((particle) => particle.life > 0);

      if (stateRef.current.running) {
        mutateState((current) => ({
          ...current,
          day,
          bestScore: bestScoreRef.current,
          rank: getRank(current.score).label,
        }));
      }
      if ((day >= 30 || stateRef.current.breath <= 0 || stateRef.current.chaos >= 100 || stateRef.current.bills >= 100) && stateRef.current.running) {
        finishRound();
      }

      drawGame(
        ctx,
        stateRef.current,
        itemsRef.current,
        particlesRef.current,
        playerXRef.current,
        shakeRef.current,
        reliefRef.current,
        interestFrozenRef.current,
        mutiraoPulseRef.current,
        spritesRef.current,
      );
      frameRef.current = window.requestAnimationFrame(render);
    };

    frameRef.current = window.requestAnimationFrame(render);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [addParticle, collectItem, finishRound, mutateState, resetRound, spawnItem]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    resizeCanvas(canvas, parent.clientWidth);
    const handleResize = () => resizeCanvas(canvas, parent.clientWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!snapshot.finished || submittedRef.current) return;
    submittedRef.current = true;
    const payload: ScoreSubmission = {
      slug: game.slug,
      player: playerName || "Anon",
      score: snapshot.score,
      durationMs: Math.round((snapshot.day / 30) * ROUND_DURATION_MS),
      eventsHandled: Math.max(1, snapshot.supports + snapshot.billsDodged),
    };
    void fetch("/api/score/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }, [game.slug, playerName, snapshot]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PLAYER_NAME_KEY, playerName);
    } catch {}
  }, [playerName]);

  useEffect(() => {
    if (!snapshot.finished) return;
    let cancelled = false;
    void createResultCardFile(snapshot).then((file) => {
      if (!file || cancelled) return;
      setResultImageUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(file);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [snapshot]);

  const shareResult = useCallback(async () => {
    const social = getSocialChallenge(snapshot);
    const text = `${getViralHeadline(snapshot)} ${social.callout} ${getViralChallenge(snapshot)} Jogue Plantao no Vermelho.`;
    const imageFile = await createResultCardFile(snapshot);
    const filePayload = imageFile ? { title: game.title, text, url: window.location.href, files: [imageFile] } : null;

    if (filePayload && navigator.canShare?.({ files: filePayload.files })) {
      await navigator.share(filePayload);
      setCopyLabel("Compartilhado");
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: game.title, text, url: window.location.href });
      setCopyLabel("Compartilhado");
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopyLabel("Copiado");
    window.setTimeout(() => setCopyLabel("Compartilhar"), 1200);
  }, [game.title, snapshot]);

  const applySurvivalAction = useCallback(
    (action: (typeof survivalActions)[number]) => {
      if (!stateRef.current.running || stateRef.current.finished) return;
      const now = performance.now();
      let streakForFlash = 1;
      mutateState((current) => {
        const keepsStreak = current.lastActionAt > 0 && now - current.lastActionAt < 2400;
        const decisionStreak = keepsStreak ? clamp(current.decisionStreak + 1, 1, 9) : 1;
        streakForFlash = decisionStreak;
        const streakBonus = decisionStreak >= 3 ? 90 + decisionStreak * 18 : decisionStreak >= 2 ? 42 : 0;
        const nextScore = current.score + action.score + streakBonus;
        const dayBoost = action.id === "trabalhar" ? 2 : 1;
        return {
          ...current,
          score: nextScore,
          day: clamp(current.day + dayBoost, 1, 30),
          breath: clamp(current.breath + action.breath + (decisionStreak >= 3 ? 3 : 0), 0, 100),
          bills: clamp(current.bills + action.bills - (decisionStreak >= 4 ? 2 : 0), 0, 100),
          chaos: clamp(current.chaos + action.chaos - (decisionStreak >= 3 ? 2 : 0), 0, 100),
          shiftsWorked: current.shiftsWorked + (action.id === "trabalhar" ? 1 : 0),
          essentialsBought: current.essentialsBought + (action.id === "economizar" || action.id === "trabalhar" ? 1 : 0),
          extraCostsAvoided: current.extraCostsAvoided + (action.id === "economizar" ? 1 : 0),
          mentalCare: current.mentalCare + (action.id === "saude" ? 1 : 0),
          actionCount: current.actionCount + 1,
          decisionStreak,
          maxDecisionStreak: Math.max(current.maxDecisionStreak, decisionStreak),
          lastActionAt: now,
          rank: getRank(nextScore).label,
        };
      });
      reliefRef.current = action.id === "saude" ? 0.75 : reliefRef.current;
      shakeRef.current = action.breath < -8 ? 0.18 : shakeRef.current;
      const streakText = streakForFlash >= 3 ? `Sequencia ${streakForFlash}x!` : action.title;
      addParticle(streakText, playerXRef.current - 64, PLAYER_Y - 112, action.id === "saude" || streakForFlash >= 3 ? "good" : "power");
      setToast(streakForFlash >= 3 ? `${action.toast} Ritmo ${streakForFlash}x.` : action.toast);
      setDecisionFlash({ title: streakText, subtitle: streakForFlash >= 3 ? "Decidiu rapido, respirou pouco." : action.toast, tone: action.tone });
      window.setTimeout(() => setDecisionFlash(null), 1300);
      playTone(action.id === "saude" ? "good" : "power");
      if (stateRef.current.day >= 30 || stateRef.current.breath <= 0 || stateRef.current.chaos >= 100 || stateRef.current.bills >= 100) {
        window.setTimeout(() => finishRound(), 80);
      }
    },
    [addParticle, finishRound, mutateState, playTone],
  );

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    targetXRef.current = clamp(((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH, 68, CANVAS_WIDTH - 68);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (event.buttons !== 1 || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    targetXRef.current = clamp(((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH, 68, CANVAS_WIDTH - 68);
  }

  const lateMonthCrush = Math.max(0, snapshot.day - 22) ** 2 * 8;
  const salaryLeft = clamp(520 - snapshot.bills * 5.8 - snapshot.day * 7.8 - lateMonthCrush + snapshot.supports * 10 + snapshot.score * 0.0032, -1400, 620);
  const debtTotal = dueBills.reduce((total, [, value]) => total + value, 0);
  const paidRatio = clamp((100 - snapshot.bills) / 100, 0, 1);
  const pressure = clamp((snapshot.chaos + Math.max(0, 55 - snapshot.breath)) / 145, 0, 1);
  const unlockedAchievements = achievementDefs.filter((achievement) => achievement.unlocked(snapshot));
  const viralHeadline = getViralHeadline(snapshot);
  const viralChallenge = getViralChallenge(snapshot);
  const resultMessage = getResultMessage(snapshot);
  const socialChallenge = getSocialChallenge(snapshot);
  const eventIndex = Math.abs(snapshot.day + snapshot.actionCount + Math.floor(snapshot.score / 900)) % viralEvents.length;
  const dayEvent = snapshot.day >= 24 ? "Fim do mes: qualquer erro vira colapso." : viralEvents[eventIndex];
  const recommendedAction =
    snapshot.breath < 42
      ? "saude"
      : snapshot.bills > 62
        ? "economizar"
        : snapshot.chaos > 64
          ? "saude"
          : snapshot.day > 18 && salaryLeft < 120
            ? "bico"
            : "trabalhar";
  const recommendationText =
    recommendedAction === "saude"
      ? "Recomendado: recuperar energia antes do proximo plantao."
      : recommendedAction === "economizar"
        ? "Recomendado: conter contas antes que virem colapso."
        : recommendedAction === "bico"
          ? "Recomendado: renda extra para fechar o mes."
          : "Recomendado: fazer plantao enquanto ainda ha folego.";

  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-[#071018] px-3 pb-52 pt-3 text-[#f7f1df] sm:px-5 sm:py-5 lg:h-screen lg:overflow-hidden lg:px-4 lg:py-4"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(8,18,27,0.02), rgba(6,8,10,0.24)), url('/games/plantaono-vermelho/hospital-facade.png')",
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.05),rgba(0,0,0,0.14)_78%)]" />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: pressure,
          background: "radial-gradient(circle at 50% 48%, rgba(255,59,48,0.06), rgba(90,0,0,0.38) 72%)",
        }}
      />
      {snapshot.breath < 36 ? (
        <div className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_50%,transparent_42%,rgba(0,0,0,0.42)_100%)]" />
      ) : null}
      <div className="pointer-events-none absolute left-[37%] top-[28%] hidden -translate-x-1/2 lg:block">
        <div className="absolute left-1/2 top-[92%] h-10 w-56 -translate-x-1/2 rounded-full bg-black/55 blur-md" />
        <div className="absolute left-1/2 top-[84%] h-28 w-40 -translate-x-1/2 rounded-full bg-[#62d6ff]/10 blur-2xl" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/games/plantaono-vermelho/nurse-back.png"
          alt=""
          className="h-[61vh] min-h-[540px] max-h-[720px] drop-shadow-[0_24px_30px_rgba(0,0,0,0.7)]"
        />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1520px] gap-3 lg:h-full lg:grid-cols-[280px_minmax(430px,1fr)_292px] lg:grid-rows-[auto_1fr_auto] lg:items-start">
        <section className="order-4 rounded-[1.25rem] border border-[#0b2e4b] bg-[linear-gradient(180deg,rgba(8,44,70,0.96),rgba(3,15,25,0.94))] p-3 shadow-[0_10px_0_rgba(0,0,0,0.35),0_18px_60px_rgba(0,0,0,0.42)] lg:order-none lg:row-span-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full border-[5px] border-[#43b5ff] bg-[#1f3448] text-4xl font-black shadow-[0_0_0_4px_rgba(0,0,0,0.45)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/games/plantaono-vermelho/portrait-nurse.png" alt="" className="size-full rounded-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9ee8c1]">
                Enfermeiro
              </p>
              <h1 className="mt-1 text-xl font-black uppercase leading-none">Nivel {Math.max(1, Math.floor(snapshot.score / 1600) + 1)}</h1>
              <div className="mt-2">
                <MeterBar label="xp" value={clamp((snapshot.score % 1600) / 16, 0, 100)} color="#29d443" />
              </div>
            </div>
            <Link href="/" className="rounded-lg border border-[rgba(255,255,255,0.14)] px-2 py-2 text-[10px] font-bold uppercase">
              Inicio
            </Link>
          </div>
          <div className="mt-4 grid gap-2">
            <StatusStrip
              label="energia"
              value={`${Math.round(snapshot.breath)}/100`}
              color="#ff3b30"
              icon="/games/plantaono-vermelho/icon-energy.png"
            />
            <MoneyStrip value={`R$ ${salaryLeft.toFixed(2).replace(".", ",")}`} />
          </div>
          <SurvivalChecklist snapshot={snapshot} />
          <BillPanel paidRatio={paidRatio} total={debtTotal} />
        </section>

        <section className="pointer-events-auto relative order-1 min-h-[34vh] overflow-hidden rounded-[1.25rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.12)] p-2 sm:min-h-[46vh] lg:order-none lg:col-start-2 lg:row-span-2 lg:min-h-0 lg:h-full lg:border-0 lg:bg-transparent lg:p-0">
          <div
            className="pointer-events-none absolute inset-0 bg-contain bg-center bg-no-repeat lg:hidden"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(8,18,27,0.04), rgba(6,8,10,0.18)), url('/games/plantaono-vermelho/hospital-facade.png')",
            }}
          />
          <div className="pointer-events-none absolute inset-x-12 top-[29%] z-[1] rounded-sm bg-white/80 px-3 py-1 text-center text-[clamp(0.72rem,3.7vw,1rem)] font-black uppercase leading-tight tracking-[0.12em] text-[#1d3047] shadow-[0_3px_10px_rgba(0,0,0,0.18)] lg:hidden">
            Hospital Regional<br />
            Zilda Arns
          </div>
          <div className="pointer-events-none absolute bottom-[22vh] left-1/2 hidden w-[min(58vw,560px)] -translate-x-1/2 rounded-xl border border-white/10 bg-[rgba(3,14,22,0.52)] px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-[2px] lg:block">
            Entrada do hospital: escolha como atravessar mais um dia sem salario
          </div>
          <LivingQueue chaos={snapshot.chaos} day={snapshot.day} />
          <div className="pointer-events-none absolute inset-x-4 top-3 z-20 text-center lg:top-2">
            <div
              className="mx-auto w-fit rotate-[-2deg] text-center font-black uppercase leading-[0.82] tracking-tight text-white"
              style={{
                textShadow: "0 5px 0 #041b40, 0 9px 16px rgba(0,0,0,0.45)",
                WebkitTextStroke: "2px #061a34",
              }}
            >
              <div className="text-[clamp(1.12rem,6.2vw,4.15rem)] lg:text-[clamp(2rem,3.7vw,4.15rem)]">Como sobreviver</div>
              <div className="text-[clamp(0.92rem,5.1vw,3.55rem)] text-[#ffd02d] lg:text-[clamp(1.75rem,3.15vw,3.55rem)]">com salario atrasado</div>
            </div>
            <div className="mx-auto mt-1.5 w-fit rounded-lg bg-[#062d70] px-3 py-1 text-[9px] font-black uppercase tracking-[0.08em] shadow-[0_4px_0_#041b40] lg:px-5 lg:py-1.5 lg:text-xs">
              Missao: chegar ao fim do mes!
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-9 left-1/2 z-10 -translate-x-1/2 lg:hidden">
            <div className="absolute left-1/2 top-[90%] h-8 w-44 -translate-x-1/2 rounded-full bg-black/60 blur-md" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/games/plantaono-vermelho/nurse-back.png"
              alt=""
              className="h-[23vh] max-h-[260px] min-h-[170px] drop-shadow-[0_22px_28px_rgba(0,0,0,0.72)] sm:h-[32vh]"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-3 bottom-2 z-20 grid grid-cols-3 gap-2 lg:hidden">
            <MiniStatus label="dia" value={`${snapshot.day}/30`} />
            <MiniStatus label="energia" value={`${Math.round(snapshot.breath)}%`} danger={snapshot.breath < 36} />
            <MiniStatus label="saldo" value={`R$ ${Math.round(salaryLeft)}`} />
          </div>
          <canvas
            ref={canvasRef}
            className="mx-auto block w-full max-w-[420px] touch-none rounded-lg opacity-0 mix-blend-screen lg:absolute lg:bottom-[4vh] lg:left-1/2 lg:max-w-[390px] lg:-translate-x-1/2"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
          />
          {!snapshot.finished ? (
            <div className="pointer-events-none absolute inset-x-5 bottom-5 hidden items-center justify-between rounded-lg bg-[rgba(19,13,16,0.78)] px-4 py-3 text-xs font-black uppercase backdrop-blur-sm lg:flex">
              <span>arraste</span>
              <span>{toast}</span>
            </div>
          ) : null}
          {decisionFlash ? (
            <div className="pointer-events-none absolute left-1/2 top-[34%] z-30 w-[min(86vw,420px)] -translate-x-1/2 rounded-2xl border border-white/25 bg-[rgba(3,14,22,0.9)] p-4 text-center shadow-[0_12px_0_rgba(0,0,0,0.28),0_24px_60px_rgba(0,0,0,0.45)]">
              <div className={`mx-auto mb-2 h-2 w-28 rounded-full ${decisionFlash.tone}`} />
              <div className="text-3xl font-black uppercase text-[#ffd554]">{decisionFlash.title}</div>
              <div className="mt-1 text-sm font-black uppercase text-white">{decisionFlash.subtitle}</div>
            </div>
          ) : null}
        </section>

        <section className="order-2 grid grid-cols-2 gap-3 lg:order-none lg:col-start-3 lg:row-span-2 lg:grid-cols-1 lg:gap-2">
          <div className="hidden justify-end gap-3 lg:flex">
            <CircleMenu label="opcoes" icon="/games/plantaono-vermelho/icon-options.png" />
            <CircleMenu label={`${unlockedAchievements.length}/4`} icon="/games/plantaono-vermelho/icon-trophy.png" />
          </div>
          <div className="col-span-2 rounded-xl border-[3px] border-[#30343c] bg-[#f7f1df] px-4 py-3 text-center text-[#130d10] shadow-[0_5px_0_rgba(0,0,0,0.45)] lg:col-span-1 lg:py-2">
            <div className="rounded-t-lg bg-[#b9231d] py-1 text-xs font-black uppercase text-white">Dia</div>
            <div className="text-4xl font-black lg:text-3xl">{snapshot.day} / 30</div>
            <div className="text-[10px] font-black uppercase">sobreviver ate o dia 30</div>
          </div>
          <div className="col-span-2 rounded-xl border border-[#ffd554]/30 bg-[rgba(3,14,22,0.82)] px-4 py-3 shadow-[0_5px_0_rgba(0,0,0,0.35)] lg:col-span-1 lg:py-2">
            <div className="text-xs font-black uppercase text-[#ffd554]">evento do dia</div>
            <div className="mt-1 text-sm font-black uppercase text-white">{dayEvent}</div>
          </div>
          <div className="col-span-2 rounded-xl border border-[#62d6ff]/30 bg-[rgba(3,14,22,0.82)] px-4 py-3 shadow-[0_5px_0_rgba(0,0,0,0.35)] lg:col-span-1 lg:py-2">
            <div className="text-xs font-black uppercase text-[#62d6ff]">plano rapido</div>
            <div className="mt-1 text-sm font-black uppercase text-white">{recommendationText}</div>
          </div>
          <div className="col-span-2 rounded-xl border border-[#ffd554]/30 bg-[rgba(3,14,22,0.82)] px-4 py-2 shadow-[0_5px_0_rgba(0,0,0,0.35)] lg:col-span-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase text-[#ffd554]">ritmo</div>
                <div className="text-[10px] font-black uppercase text-white/70">decisoes rapidas</div>
              </div>
              <div className="rounded-lg bg-[#ffd554] px-3 py-1 text-2xl font-black text-[#130d10]">{snapshot.decisionStreak}x</div>
            </div>
          </div>
          <div className="col-span-2 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(3,14,22,0.82)] px-4 py-3 shadow-[0_5px_0_rgba(0,0,0,0.35)] lg:col-span-1 lg:hidden">
            <div className="text-xs font-black uppercase text-[#9ee8c1]">decisoes tomadas</div>
            <div className="mt-1 text-3xl font-black text-[#ffd554]">{snapshot.actionCount}</div>
            <div className="mt-1 text-[10px] font-black uppercase text-white/70">
              cada escolha cobra do corpo ou das contas
            </div>
          </div>
          <AchievementPanel snapshot={snapshot} compact />
          {!snapshot.finished
            ? survivalActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => applySurvivalAction(action)}
                  className={`${action.tone} hidden min-h-28 items-center gap-3 rounded-xl border px-3 py-3 text-left shadow-[0_10px_22px_rgba(0,0,0,0.32)] transition active:scale-[0.98] lg:flex lg:min-h-[76px] lg:px-4 lg:py-2 ${
                    action.id === recommendedAction ? "border-[#ffd554] ring-2 ring-[#ffd554]/70" : "border-[rgba(255,255,255,0.22)]"
                  }`}
                >
                  <span className="flex size-12 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.18)] lg:size-11">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={action.icon} alt="" className="size-10 object-contain drop-shadow-[0_2px_0_rgba(0,0,0,0.35)] lg:size-9" />
                  </span>
                  <span>
                    <span className="block text-base font-black uppercase leading-none lg:text-[1.05rem]">{action.title}</span>
                    <span className="mt-1 block text-xs font-black uppercase text-white/80">{action.subtitle}</span>
                    <span className="mt-2 inline-block rounded-full bg-black/25 px-2 py-1 text-[10px] font-black uppercase text-white/75 lg:mt-1">
                      {action.tradeoff}
                    </span>
                  </span>
                </button>
              ))
            : (
                <div className="col-span-2 rounded-xl border border-[#ffd554]/35 bg-[rgba(3,14,22,0.84)] px-4 py-4 text-center shadow-[0_8px_24px_rgba(0,0,0,0.28)] lg:col-span-1">
                  <div className="text-sm font-black uppercase text-[#ffd554]">Rodada encerrada</div>
                  <div className="mt-1 text-xs font-black uppercase text-white/75">Tente virar o mes com outra rota.</div>
                </div>
              )}
        </section>

        <section className="order-3 lg:order-none lg:col-start-2 lg:row-start-3">
          <NeedsPanel snapshot={snapshot} />
        </section>

        <div className="order-5 grid grid-cols-2 gap-3 lg:col-start-2 lg:hidden">
          <button
            type="button"
            onClick={() => movePlayer(-1)}
            className="rounded-lg border border-[rgba(255,255,255,0.14)] bg-[#241015] px-4 py-4 text-xl font-black"
          >
            &lt;
          </button>
          <button
            type="button"
            onClick={() => movePlayer(1)}
            className="rounded-lg border border-[rgba(255,255,255,0.14)] bg-[#241015] px-4 py-4 text-xl font-black"
          >
            &gt;
          </button>
        </div>

        {snapshot.finished ? (
          <section className="rounded-[1.25rem] border border-[rgba(255,213,84,0.24)] bg-[#241015] p-5 lg:col-start-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9ee8c1]">resultado</p>
                <h2 className="mt-1 text-7xl font-black leading-none text-[#ff3b30]">{rankMeta.label}</h2>
                <p className="mt-2 text-sm font-bold uppercase text-[#f7f1df]">{resultMessage}</p>
                <p className="mt-3 max-w-[560px] text-xl font-black uppercase leading-tight text-[#ffd554]">{viralHeadline}</p>
                <p className="mt-1 text-sm font-black uppercase text-[#9ee8c1]">{viralChallenge}</p>
              </div>
              <div className="rounded-lg bg-[rgba(255,255,255,0.08)] px-4 py-3 text-right">
                <div className="text-[10px] font-bold uppercase text-[#9ee8c1]">score</div>
                <div className="mt-1 text-4xl font-black text-[#ffd554]">{snapshot.score}</div>
                <div className="mt-3 rounded-md bg-[#ffd554] px-2 py-1 text-center text-[#130d10]">
                  <div className="text-[9px] font-black uppercase">ranking local</div>
                  <div className="text-xl font-black">#{socialChallenge.position}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-[#ffd554]/35 bg-[linear-gradient(135deg,rgba(255,213,84,0.16),rgba(255,59,48,0.08))] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-black uppercase text-white">
                  {socialChallenge.percentile} · passou {socialChallenge.defeated} plantoes
                </div>
                <div className="shrink-0 rounded-lg bg-[#ffd554] px-3 py-1 text-sm font-black uppercase text-[#130d10]">
                  alvo {socialChallenge.targetScore}
                </div>
              </div>
              <div className="mt-1 text-xs font-black uppercase text-[#9ee8c1]">{socialChallenge.callout}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ResultMetric label="dias" value={`${snapshot.day}`} />
              <ResultMetric label="folego final" value={`${Math.round(snapshot.breath)}%`} />
              <ResultMetric label="caos final" value={`${Math.round(snapshot.chaos)}%`} />
              <ResultMetric label="boletos desviados" value={`${snapshot.billsDodged}`} />
              <ResultMetric label="apoios" value={`${snapshot.supports}`} />
              <ResultMetric label="combo max" value={`${snapshot.maxCombo}x`} />
              <ResultMetric label="ritmo max" value={`${snapshot.maxDecisionStreak}x`} />
              <ResultMetric label="melhor score" value={`${snapshot.bestScore}`} />
              <ResultMetric label="contas" value={`${Math.round(snapshot.bills)}%`} />
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-[rgba(255,213,84,0.22)] bg-[#130d10]">
              {resultImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resultImageUrl} alt="Card de resultado" className="block w-full" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center text-xs font-black uppercase text-[#9ee8c1]">
                  gerando card
                </div>
              )}
            </div>
            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value.slice(0, 18))}
              className="mt-4 w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#130d10] px-4 py-3 text-sm text-[#f7f1df] outline-none"
              placeholder="nome no ranking"
            />
            <div className="mt-3 rounded-xl border border-[#ffd554]/35 bg-[linear-gradient(135deg,rgba(255,213,84,0.16),rgba(255,59,48,0.08))] p-4 lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-[#9ee8c1]">desafio publico</div>
                  <div className="mt-1 text-lg font-black uppercase text-[#ffd554]">#{socialChallenge.position} no ranking local</div>
                  <div className="mt-1 text-xs font-black uppercase text-white/70">
                    {socialChallenge.percentile} · passou {socialChallenge.defeated} plantoes
                  </div>
                </div>
                <div className="rounded-lg bg-[#ffd554] px-3 py-2 text-right text-[#130d10]">
                  <div className="text-[10px] font-black uppercase">alvo</div>
                  <div className="text-2xl font-black">{socialChallenge.targetScore}</div>
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-black/25 px-3 py-2 text-sm font-black uppercase text-white">
                {socialChallenge.callout}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setCopyLabel("Compartilhar");
                  setResultImageUrl((current) => {
                    if (current) URL.revokeObjectURL(current);
                    return null;
                  });
                  resetRound();
                }}
                className="flex-[1.2] rounded-lg bg-[#ffd554] px-4 py-4 text-sm font-black uppercase text-[#130d10]"
              >
                Jogar de novo
              </button>
              <button
                type="button"
                onClick={() => void shareResult()}
                className="flex-1 rounded-lg border border-[rgba(255,255,255,0.16)] px-4 py-4 text-sm font-black uppercase"
              >
                {copyLabel === "Compartilhar" ? "Compartilhar desafio" : copyLabel}
              </button>
            </div>
            <Link href={`/ranking/${game.slug}`} className="mt-3 block rounded-lg bg-[#130d10] px-4 py-3 text-center text-sm font-black uppercase">
              Abrir ranking e provocar geral
            </Link>
          </section>
        ) : null}
      </div>
      {!snapshot.finished ? (
        <div className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 gap-2 rounded-2xl border border-[#ffd554]/30 bg-[rgba(3,14,22,0.9)] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md lg:hidden">
          {survivalActions.map((action) => (
            <button
              key={`dock-${action.id}`}
              type="button"
              onClick={() => applySurvivalAction(action)}
              className={`min-h-20 rounded-xl border px-1 py-2 text-center shadow-[0_4px_0_rgba(0,0,0,0.28)] active:scale-[0.98] ${action.tone} ${
                action.id === recommendedAction ? "border-[#ffd554] ring-2 ring-[#ffd554]/70" : "border-white/15"
              }`}
            >
              <span className="mx-auto flex size-8 items-center justify-center rounded-lg bg-white/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={action.icon} alt="" className="size-7 object-contain" />
              </span>
              <span className="mt-1 block text-[10px] font-black uppercase leading-tight">{action.title}</span>
            </button>
          ))}
        </div>
      ) : null}
    </main>
  );
}

function StatusStrip({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[rgba(3,14,22,0.78)] px-3 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
      <span className="flex size-11 shrink-0 items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" className="size-11 object-contain drop-shadow-[0_2px_0_rgba(0,0,0,0.45)]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between text-sm font-black uppercase">
          <span>{label}</span>
          <span>{value}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-black/50">
          <div className="h-full rounded-full" style={{ width: value.split("/")[0] + "%", backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

function MoneyStrip({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[rgba(3,14,22,0.78)] px-3 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/games/plantaono-vermelho/icon-money.png" alt="" className="size-11 object-contain" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-black uppercase">saldo</div>
        <div className="text-2xl font-black text-white">{value}</div>
      </div>
    </div>
  );
}

function MiniStatus({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={`rounded-xl border px-2 py-2 text-center shadow-[0_5px_0_rgba(0,0,0,0.35)] backdrop-blur-sm ${danger ? "border-[#ff3b30] bg-[rgba(80,0,0,0.72)]" : "border-white/15 bg-[rgba(3,14,22,0.78)]"}`}>
      <div className="text-[9px] font-black uppercase tracking-[0.12em] text-[#9ee8c1]">{label}</div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
    </div>
  );
}

function LivingQueue({ chaos, day }: { chaos: number; day: number }) {
  const crowd = Math.min(10, 4 + Math.floor(chaos / 14) + Math.floor(day / 10));
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      <div className="absolute bottom-[24vh] left-[16%] h-9 w-28 rounded-md border border-white/20 bg-white/70 shadow-[0_8px_18px_rgba(0,0,0,0.32)]">
        <div className="absolute inset-x-0 top-4 h-2 bg-[#b9231d]" />
        <div className="absolute left-4 top-2 h-5 w-6 bg-[#0c6b42]" />
        <div className="absolute -bottom-2 left-5 size-4 rounded-full bg-black" />
        <div className="absolute -bottom-2 right-5 size-4 rounded-full bg-black" />
      </div>
      {Array.from({ length: crowd }).map((_, index) => {
        const row = index % 2;
        const left = 39 + (index % 5) * 5.4 + row * 2;
        const bottom = 31 + row * 4 + Math.sin((day + index) * 0.8) * 0.5;
        const shirt = ["#2f8a52", "#9a6d2d", "#2f6fa8", "#7b4a2a", "#325f7a"][index % 5];
        return (
          <div
            key={index}
            className="absolute transition-all duration-500"
            style={{
              left: `${left}%`,
              bottom: `${bottom}vh`,
              opacity: 0.58 + Math.min(0.32, chaos / 180),
              transform: `scale(${0.72 + index * 0.015})`,
            }}
          >
            <div className="mx-auto size-3 rounded-full bg-[#3b271d]" />
            <div className="h-8 w-4 rounded-sm shadow-[0_5px_0_rgba(0,0,0,0.22)]" style={{ backgroundColor: shirt }} />
          </div>
        );
      })}
      {chaos > 62 ? (
        <div className="absolute bottom-[37vh] left-[45%] rounded-lg bg-[#b9231d] px-3 py-2 text-[10px] font-black uppercase text-white shadow-[0_5px_0_rgba(0,0,0,0.35)]">
          fila aumentando
        </div>
      ) : null}
    </div>
  );
}

function CircleMenu({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full border-[3px] border-[#2a3b47] bg-[linear-gradient(180deg,#3b4b54,#111820)] shadow-[0_5px_0_rgba(0,0,0,0.55)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" className="size-12 object-contain" />
      </div>
      <div className="mt-1 rounded-full bg-[#071724] px-3 py-1 text-[10px] font-black uppercase shadow-[0_3px_0_rgba(0,0,0,0.45)]">
        {label}
      </div>
    </div>
  );
}

function AchievementPanel({ snapshot, compact = false }: { snapshot: GameSnapshot; compact?: boolean }) {
  const unlockedCount = achievementDefs.filter((achievement) => achievement.unlocked(snapshot)).length;
  return (
    <div className={`col-span-2 rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(3,14,22,0.82)] shadow-[0_5px_0_rgba(0,0,0,0.35)] lg:col-span-1 ${compact ? "p-2" : "p-3"}`}>
      <div className={`${compact ? "mb-1" : "mb-2"} flex items-center justify-between`}>
        <div className="text-xs font-black uppercase text-[#ffd554]">Conquistas</div>
        <div className="text-[10px] font-black uppercase text-white/70">
          {unlockedCount}/{achievementDefs.length}
        </div>
      </div>
      <div className={compact ? "grid grid-cols-4 gap-1.5" : "grid gap-2"}>
        {achievementDefs.map((achievement) => {
          const unlocked = achievement.unlocked(snapshot);
          return (
            <div
              key={achievement.id}
              title={`${achievement.title}: ${achievement.description}`}
              className={`rounded-lg border ${compact ? "px-2 py-1.5 text-center" : "px-3 py-2"} ${unlocked ? "border-[#ffd554]/50 bg-[#ffd554]/12" : "border-white/10 bg-black/20 opacity-70"}`}
            >
              {compact ? (
                <div className={unlocked ? "text-lg font-black text-[#ffd554]" : "text-lg font-black text-white/45"}>{unlocked ? "✓" : "□"}</div>
              ) : (
                <>
                  <div className={unlocked ? "text-xs font-black uppercase text-[#ffd554]" : "text-xs font-black uppercase text-white/55"}>
                    {unlocked ? "✓ " : "□ "}
                    {achievement.title}
                  </div>
                  <div className="mt-1 text-[10px] font-bold uppercase text-white/55">{achievement.description}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[rgba(19,13,16,0.64)] px-4 py-3">
      <div className="text-[10px] font-bold uppercase text-[#9ee8c1]">{label}</div>
      <div className="mt-1 text-xl font-black text-[#f7f1df]">{value}</div>
    </div>
  );
}

function MeterBar({ label, value, color, danger = false }: { label: string; value: number; color: string; danger?: boolean }) {
  const width = clamp(value, 0, 100);
  const alert = danger ? value >= 72 : value <= 28;
  return (
    <div className="rounded-lg bg-[#130d10] px-3 py-2">
      <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em]">
        <span className={alert ? "text-[#ff6b5f]" : "text-[#9ee8c1]"}>{label}</span>
        <span className="text-[#f7f1df]">{Math.round(value)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.1)]">
        <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SurvivalChecklist({ snapshot }: { snapshot: GameSnapshot }) {
  const goals = [
    { label: "trabalhar 1 plantao", done: snapshot.shiftsWorked >= 1 },
    { label: "comprar o essencial", done: snapshot.essentialsBought >= 1 || snapshot.bills < 40 },
    { label: "evitar gastos extras", done: snapshot.extraCostsAvoided >= 1 || snapshot.billsDodged >= 4 },
    { label: "manter a saude mental", done: snapshot.mentalCare >= 1 || snapshot.chaos < 42 },
  ];

  return (
    <div className="mt-4 rounded-xl border border-[rgba(255,255,255,0.16)] bg-[rgba(3,14,22,0.72)] p-3">
      <div className="text-xs font-black uppercase text-[#f7f1df]">Objetivos do dia</div>
      <div className="mt-3 grid gap-2">
        {goals.map((goal) => (
          <div key={goal.label} className="flex items-center gap-2 text-sm font-bold uppercase">
            <span className={`flex size-5 items-center justify-center rounded border ${goal.done ? "border-[#29d443] bg-[#29d443] text-[#061a27]" : "border-white/50"}`}>
              {goal.done ? "✓" : ""}
            </span>
            <span className={goal.done ? "text-[#9ee8c1]" : "text-[#f7f1df]"}>{goal.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BillPanel({ paidRatio, total }: { paidRatio: number; total: number }) {
  return (
    <div className="mt-3 rounded-xl border border-[rgba(255,255,255,0.16)] bg-[rgba(3,14,22,0.72)] p-3">
      <div className="text-xs font-black uppercase text-[#f7f1df]">Contas a pagar</div>
      <div className="mt-2 grid gap-1">
        {dueBills.map(([label, value]) => {
          const openValue = value * (1 - paidRatio);
          return (
            <div key={label} className="flex justify-between text-xs font-black uppercase">
              <span>{label}</span>
              <span className={openValue > value * 0.55 ? "text-[#ff3b30]" : "text-[#ffd554]"}>
                - R$ {openValue.toFixed(2).replace(".", ",")}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 rounded-lg bg-[#b9231d] px-3 py-2 text-center text-sm font-black uppercase">
        Total: -R$ {(total * (1 - paidRatio)).toFixed(2).replace(".", ",")}
      </div>
    </div>
  );
}

function NeedsPanel({ snapshot }: { snapshot: GameSnapshot }) {
  return (
    <section className="rounded-[1.15rem] border border-[rgba(98,214,255,0.34)] bg-[linear-gradient(180deg,rgba(8,48,74,0.94),rgba(3,13,20,0.9))] px-3 py-2 shadow-[0_10px_0_rgba(0,0,0,0.3),0_18px_54px_rgba(0,0,0,0.34)]">
      <div className="text-center text-sm font-black uppercase tracking-[0.1em] text-[#f7f1df]">Suas necessidades</div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {needBars.map((need) => {
          const value = need.getValue(snapshot);
          return (
            <div key={need.label} className="rounded-lg border border-white/5 bg-[rgba(5,12,18,0.68)] px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="mb-1 flex items-center justify-between text-[9px] font-black uppercase">
                <span>{need.label}</span>
                <span className="text-[#ffd554]">{Math.round(value)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[rgba(255,255,255,0.12)] text-[10px] font-black shadow-[0_3px_0_rgba(0,0,0,0.3)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={need.icon} alt="" className="size-8 object-contain" />
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full border border-black/35 bg-black/50">
                  <div className="h-full rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" style={{ width: `${value}%`, backgroundColor: need.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function drawGame(
  ctx: CanvasRenderingContext2D,
  snapshot: GameSnapshot,
  items: FallingItem[],
  particles: Particle[],
  playerX: number,
  shake: number,
  relief: number,
  frozen: number,
  mutiraoPulse: number,
  sprites: GameSprites,
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.save();
  if (shake > 0) ctx.translate(Math.sin(Date.now() / 24) * shake * 16, Math.cos(Date.now() / 31) * shake * 16);

  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bg.addColorStop(0, snapshot.chaos > 70 ? "#330b12" : "#221016");
  bg.addColorStop(1, "#0f1110");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (sprites.hospital?.complete) {
    ctx.drawImage(sprites.hospital, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.035)";
    for (let y = 90; y < CANVAS_HEIGHT; y += 90) ctx.fillRect(0, y, CANVAS_WIDTH, 1);
    ctx.fillStyle = "rgba(255,213,84,0.08)";
    ctx.fillRect(46, 150, CANVAS_WIDTH - 92, 760);
    ctx.strokeStyle = "rgba(255,213,84,0.22)";
    ctx.lineWidth = 5;
    ctx.strokeRect(46, 150, CANVAS_WIDTH - 92, 760);
  }

  ctx.fillStyle = "rgba(19,13,16,0.18)";
  ctx.fillRect(46, 130, CANVAS_WIDTH - 92, 780);
  ctx.strokeStyle = "rgba(255,213,84,0.3)";
  ctx.lineWidth = 4;
  ctx.strokeRect(46, 130, CANVAS_WIDTH - 92, 780);
  if (mutiraoPulse > 0) {
    ctx.save();
    ctx.globalAlpha = mutiraoPulse;
    ctx.strokeStyle = "#62d6ff";
    ctx.lineWidth = 10;
    ctx.strokeRect(58, 162, CANVAS_WIDTH - 116, 736);
    ctx.fillStyle = "rgba(98,214,255,0.09)";
    ctx.fillRect(58, 162, CANVAS_WIDTH - 116, 736);
    ctx.restore();
  }

  for (const item of items) {
    drawItem(ctx, item);
  }

  drawPlayer(ctx, playerX, PLAYER_Y, relief, frozen, snapshot, sprites.nurse);

  for (const particle of particles) {
    ctx.save();
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.tone === "bad" ? "#ff3b30" : particle.tone === "power" ? "#62d6ff" : "#9ee8c1";
    ctx.font = '900 25px "Geist", sans-serif';
    ctx.fillText(particle.text, particle.x, particle.y);
    ctx.restore();
  }

  ctx.fillStyle = "rgba(19,13,16,0.82)";
  ctx.fillRect(26, 24, CANVAS_WIDTH - 52, 94);
  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 30px "Geist", sans-serif';
  ctx.fillText(`Dia ${snapshot.day}`, 48, 80);
  ctx.fillStyle = "#ffd554";
  ctx.fillText(`Score ${snapshot.score}`, 460, 80);
  ctx.restore();
}

function drawItem(ctx: CanvasRenderingContext2D, item: FallingItem) {
  ctx.save();
  ctx.translate(item.x, item.y);
  if (item.kind === "bad") {
    const label = item.label.toLowerCase();
    const tag = label.includes("aluguel")
      ? "ALUGUEL"
      : label.includes("luz")
        ? "LUZ"
        : label.includes("mercado") || label.includes("geladeira")
          ? "MERCADO"
          : label.includes("juros") || label.includes("cobranca") || label.includes("cartao")
            ? "JUROS"
            : label.includes("plantao")
              ? "PLANTAO"
              : "BOLETO";
    ctx.shadowColor = "rgba(255,59,48,0.55)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#f7f1df";
    ctx.fillRect(-38, -32, 76, 64);
    ctx.fillStyle = "#ff3b30";
    ctx.fillRect(-38, -32, 76, 12);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(19,13,16,0.12)";
    ctx.fillRect(-25, -10, 50, 5);
    ctx.fillRect(-25, 4, 50, 5);
    ctx.fillStyle = "#130d10";
    ctx.font = '900 14px "Geist", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(tag, 0, 24);
  } else {
    const label = item.label.toLowerCase();
    const color = item.kind === "power" ? "#62d6ff" : label.includes("marmita") || label.includes("feira") ? "#9ee8c1" : "#ffd554";
    ctx.shadowColor = color;
    ctx.shadowBlur = item.kind === "power" ? 26 : 16;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, item.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#130d10";
    ctx.font = '900 16px "Geist", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(item.kind === "power" ? "MUTIRAO" : label.includes("marmita") ? "MARMITA" : "APOIO", 0, 6);
  }
  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  relief: number,
  frozen: number,
  snapshot: GameSnapshot,
  nurse: HTMLImageElement | null,
) {
  ctx.save();
  ctx.translate(x, y);
  if (relief > 0 || frozen > 0) {
    ctx.strokeStyle = relief > 0 ? `rgba(158,232,193,${relief})` : "rgba(98,214,255,0.62)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 68 + relief * 26, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (nurse?.complete) {
    ctx.drawImage(nurse, -72, -118, 144, 144);
    if (snapshot.breath < 25 || snapshot.chaos > 75) {
      ctx.fillStyle = "rgba(255,59,48,0.22)";
      ctx.beginPath();
      ctx.arc(0, -48, 76, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(0, 62, 48, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = snapshot.breath < 25 || snapshot.chaos > 75 ? "#ffb04f" : "#ffd554";
  ctx.fillRect(-34, -48, 68, 96);
  ctx.fillStyle = "#f7f1df";
  ctx.beginPath();
  ctx.arc(0, -68, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#130d10";
  ctx.beginPath();
  ctx.arc(-9, -73, 4, 0, Math.PI * 2);
  ctx.arc(9, -73, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#130d10";
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (snapshot.breath < 25 || snapshot.chaos > 75) {
    ctx.moveTo(-12, -58);
    ctx.lineTo(12, -58);
  } else {
    ctx.arc(0, -60, 10, 0.1, Math.PI - 0.1);
  }
  ctx.stroke();
  ctx.restore();
}
