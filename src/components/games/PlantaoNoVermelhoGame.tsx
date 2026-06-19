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
];

const survivalActions = [
  {
    id: "trabalhar",
    title: "Trabalhar",
    subtitle: "+ dinheiro",
    icon: "/games/plantaono-vermelho/icon-work.png",
    tone: "bg-[#c96f08]",
    score: 220,
    breath: -10,
    bills: -8,
    chaos: 4,
    toast: "Plantao pago em migalha.",
  },
  {
    id: "bico",
    title: "Fazer bico",
    subtitle: "+ renda extra",
    icon: "/games/plantaono-vermelho/icon-tools.png",
    tone: "bg-[#086aa0]",
    score: 170,
    breath: -13,
    bills: -12,
    chaos: 7,
    toast: "Virou noite no bico.",
  },
  {
    id: "economizar",
    title: "Economizar",
    subtitle: "- gastos",
    icon: "/games/plantaono-vermelho/icon-pig.png",
    tone: "bg-[#6f2aa8]",
    score: 120,
    breath: -4,
    bills: -10,
    chaos: 2,
    toast: "Cortou o minimo do minimo.",
  },
  {
    id: "saude",
    title: "Cuidar da saude",
    subtitle: "+ energia",
    icon: "/games/plantaono-vermelho/icon-health.png",
    tone: "bg-[#247a26]",
    score: 90,
    breath: 16,
    bills: 2,
    chaos: -8,
    toast: "Respirou antes do colapso.",
  },
];

const needBars = [
  { label: "alimentacao", icon: "/games/plantaono-vermelho/icon-pig.png", color: "#ffd554", getValue: (snapshot: GameSnapshot) => clamp(100 - snapshot.bills * 0.65, 8, 100) },
  { label: "transporte", icon: "/games/plantaono-vermelho/icon-money.png", color: "#62d6ff", getValue: (snapshot: GameSnapshot) => clamp(92 - snapshot.bills * 0.45, 10, 100) },
  { label: "saude", icon: "/games/plantaono-vermelho/icon-health.png", color: "#9ee8c1", getValue: (snapshot: GameSnapshot) => clamp(snapshot.breath, 0, 100) },
  { label: "lazer", icon: "◇", color: "#ff9a62", getValue: (snapshot: GameSnapshot) => clamp(70 - snapshot.chaos * 0.7, 5, 100) },
  { label: "sono", icon: "▰", color: "#62d6ff", getValue: (snapshot: GameSnapshot) => clamp(snapshot.breath - snapshot.chaos * 0.22, 5, 100) },
  { label: "saude mental", icon: "/games/plantaono-vermelho/icon-energy.png", color: "#d778ff", getValue: (snapshot: GameSnapshot) => clamp(105 - snapshot.chaos, 4, 100) },
];

const dueBills = [
  ["aluguel", 400],
  ["agua", 45],
  ["luz", 120],
  ["internet", 89.9],
  ["mercado", 300],
  ["transporte", 120],
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getRank(score: number) {
  return [...rankTable].reverse().find((rank) => score >= rank.min) ?? rankTable[0];
}

function createInitialSnapshot(bestScore = 0): GameSnapshot {
  return {
    score: 0,
    day: 1,
    breath: 88,
    bills: 12,
    chaos: 10,
    combo: 0,
    maxCombo: 0,
    supports: 0,
    billsDodged: 0,
    shiftsWorked: 0,
    essentialsBought: 0,
    extraCostsAvoided: 0,
    mentalCare: 0,
    actionCount: 0,
    bestScore,
    rank: "D",
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

  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#2a0d12");
  bg.addColorStop(0.55, "#141414");
  bg.addColorStop(1, "#071414");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,213,84,0.12)";
  ctx.fillRect(70, 76, 940, 1198);
  ctx.strokeStyle = "#ff3b30";
  ctx.lineWidth = 12;
  ctx.strokeRect(70, 76, 940, 1198);

  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 78px "Geist", sans-serif';
  ctx.fillText("Plantao no", 112, 210);
  ctx.fillText("Vermelho", 112, 300);
  ctx.fillStyle = "#ffd554";
  ctx.font = '800 34px "Geist", sans-serif';
  ctx.fillText("Como sobreviver com salario atrasado", 112, 365);

  ctx.fillStyle = "#ff3b30";
  ctx.font = '900 300px "Geist", sans-serif';
  ctx.fillText(stats.rank, 112, 680);
  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 76px "Geist", sans-serif';
  ctx.fillText(`${stats.score} pts`, 112, 805);

  ctx.fillStyle = "rgba(255,255,255,0.09)";
  ctx.fillRect(112, 875, 856, 190);
  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 44px "Geist", sans-serif';
  ctx.fillText(`${stats.day}`, 150, 970);
  ctx.fillText(`${stats.supports}`, 405, 970);
  ctx.fillText(`${Math.round(stats.chaos)}%`, 690, 970);
  ctx.fillStyle = "#9ee8c1";
  ctx.font = '800 25px "Geist", sans-serif';
  ctx.fillText("dias", 150, 1018);
  ctx.fillText("apoios", 405, 1018);
  ctx.fillText("caos", 690, 1018);

  ctx.fillStyle = "#ffd554";
  ctx.font = '900 48px "Geist", sans-serif';
  ctx.fillText("O boleto veio, mas a gente resistiu.", 112, 1160);
  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 38px "Geist", sans-serif';
  ctx.fillText("Jogue tambem", 112, 1225);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return null;
  return new File([blob], "plantaono-vermelho-resultado.png", { type: "image/png" });
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
            bills: clamp(current.bills + (grace ? 1.1 : 1.75), 0, 100),
            chaos: clamp(current.chaos + (interestFrozenRef.current > 0 ? 0.25 : grace ? 0.75 : 1.2), 0, 100),
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
    const text = `Joguei Plantao no Vermelho: sobrevivi ${snapshot.day} dias com salario atrasado, coletei ${snapshot.supports} apoios e terminei com rank ${snapshot.rank}. O boleto veio, mas a gente resistiu.`;
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
      mutateState((current) => {
        const nextScore = current.score + action.score;
        const dayBoost = action.id === "trabalhar" ? 2 : 1;
        return {
          ...current,
          score: nextScore,
          day: clamp(current.day + dayBoost, 1, 30),
          breath: clamp(current.breath + action.breath, 0, 100),
          bills: clamp(current.bills + action.bills, 0, 100),
          chaos: clamp(current.chaos + action.chaos, 0, 100),
          shiftsWorked: current.shiftsWorked + (action.id === "trabalhar" ? 1 : 0),
          essentialsBought: current.essentialsBought + (action.id === "economizar" || action.id === "trabalhar" ? 1 : 0),
          extraCostsAvoided: current.extraCostsAvoided + (action.id === "economizar" ? 1 : 0),
          mentalCare: current.mentalCare + (action.id === "saude" ? 1 : 0),
          actionCount: current.actionCount + 1,
          rank: getRank(nextScore).label,
        };
      });
      reliefRef.current = action.id === "saude" ? 0.75 : reliefRef.current;
      shakeRef.current = action.breath < -8 ? 0.18 : shakeRef.current;
      addParticle(action.title, playerXRef.current - 56, PLAYER_Y - 112, action.id === "saude" ? "good" : "power");
      setToast(action.toast);
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

  const salaryLeft = clamp(950 - snapshot.bills * 8.6 + snapshot.supports * 24 + snapshot.score * 0.025, -1400, 950);
  const debtTotal = dueBills.reduce((total, [, value]) => total + value, 0);
  const paidRatio = clamp((100 - snapshot.bills) / 100, 0, 1);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#071018] px-3 py-3 text-[#f7f1df] sm:px-5 sm:py-5 lg:h-screen lg:px-4 lg:py-4"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(8,18,27,0.08), rgba(6,8,10,0.58)), url('/games/plantaono-vermelho/hospital-facade.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.05),rgba(0,0,0,0.46)_72%)]" />
      <div className="pointer-events-none absolute left-[38%] top-[41%] hidden -translate-x-1/2 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/games/plantaono-vermelho/nurse-back.png"
          alt=""
          className="h-[51vh] min-h-[470px] max-h-[660px] drop-shadow-[0_24px_30px_rgba(0,0,0,0.7)]"
        />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1520px] gap-3 lg:h-full lg:grid-cols-[280px_minmax(430px,1fr)_292px] lg:grid-rows-[auto_1fr_auto] lg:items-start">
        <section className="rounded-[1.25rem] border border-[#0b2e4b] bg-[linear-gradient(180deg,rgba(8,44,70,0.96),rgba(3,15,25,0.94))] p-3 shadow-[0_10px_0_rgba(0,0,0,0.35),0_18px_60px_rgba(0,0,0,0.42)] lg:row-span-2">
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

        <section className="pointer-events-auto relative min-h-[520px] overflow-hidden rounded-[1.25rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.12)] p-2 lg:col-start-2 lg:row-span-2 lg:min-h-0 lg:h-full lg:border-0 lg:bg-transparent lg:p-0">
          <div className="pointer-events-none absolute inset-x-4 top-1 z-20 text-center lg:top-0">
            <div className="mx-auto inline-block rotate-[-2deg] text-balance rounded-[1.1rem] px-4 py-1 text-4xl font-black uppercase leading-[0.9] text-white drop-shadow-[0_6px_0_#09294c] [-webkit-text-stroke:2px_#09294c] sm:text-5xl lg:text-6xl">
              Como sobreviver
              <span className="block text-[#ffd554] [-webkit-text-stroke:2px_#09294c]">com salario atrasado</span>
            </div>
            <div className="mx-auto mt-1 w-fit rounded-lg bg-[#062d70] px-5 py-2 text-sm font-black uppercase tracking-[0.08em] shadow-[0_5px_0_#041b40]">
              Missao: chegar ao fim do mes!
            </div>
          </div>
          <canvas
            ref={canvasRef}
            className="mx-auto block w-full max-w-[420px] touch-none rounded-lg opacity-70 mix-blend-screen lg:absolute lg:bottom-[4vh] lg:left-1/2 lg:max-w-[390px] lg:-translate-x-1/2 lg:opacity-0"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
          />
          {!snapshot.finished ? (
            <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-center justify-between rounded-lg bg-[rgba(19,13,16,0.78)] px-4 py-3 text-xs font-black uppercase backdrop-blur-sm">
              <span>arraste</span>
              <span>{toast}</span>
            </div>
          ) : null}
        </section>

        <section className="grid gap-3 lg:col-start-3 lg:row-span-2">
          <div className="hidden justify-end gap-3 lg:flex">
            <CircleMenu label="opcoes" icon="⚙" />
            <CircleMenu label="conquistas" icon="🏆" />
          </div>
          <div className="rounded-xl border-[3px] border-[#30343c] bg-[#f7f1df] px-4 py-3 text-center text-[#130d10] shadow-[0_5px_0_rgba(0,0,0,0.45)]">
            <div className="rounded-t-lg bg-[#b9231d] py-1 text-xs font-black uppercase text-white">Dia</div>
            <div className="text-4xl font-black">{snapshot.day} / 30</div>
            <div className="text-[10px] font-black uppercase">sobreviver ate o dia 30</div>
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.18)] bg-[rgba(3,14,22,0.82)] px-4 py-3 shadow-[0_5px_0_rgba(0,0,0,0.35)]">
            <div className="text-xs font-black uppercase text-[#9ee8c1]">decisoes tomadas</div>
            <div className="mt-1 text-3xl font-black text-[#ffd554]">{snapshot.actionCount}</div>
            <div className="mt-1 text-[10px] font-black uppercase text-white/70">
              cada escolha cobra do corpo ou das contas
            </div>
          </div>
          {survivalActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => applySurvivalAction(action)}
              className={`${action.tone} flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.22)] px-4 py-4 text-left shadow-[0_10px_22px_rgba(0,0,0,0.32)] transition active:scale-[0.98]`}
            >
              <span className="flex size-12 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.18)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={action.icon} alt="" className="size-10 object-contain drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]" />
              </span>
              <span>
                <span className="block text-lg font-black uppercase leading-none">{action.title}</span>
                <span className="mt-1 block text-xs font-black uppercase text-white/80">{action.subtitle}</span>
              </span>
            </button>
          ))}
        </section>

        <section className="lg:col-start-2 lg:row-start-3">
          <NeedsPanel snapshot={snapshot} />
        </section>

        <div className="grid grid-cols-2 gap-3 lg:col-start-2 lg:hidden">
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
                <p className="mt-2 text-sm font-bold uppercase text-[#f7f1df]">{rankMeta.message}</p>
              </div>
              <div className="rounded-lg bg-[rgba(255,255,255,0.08)] px-4 py-3 text-right">
                <div className="text-[10px] font-bold uppercase text-[#9ee8c1]">score</div>
                <div className="mt-1 text-4xl font-black text-[#ffd554]">{snapshot.score}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ResultMetric label="dias" value={`${snapshot.day}`} />
              <ResultMetric label="folego final" value={`${Math.round(snapshot.breath)}%`} />
              <ResultMetric label="caos final" value={`${Math.round(snapshot.chaos)}%`} />
              <ResultMetric label="boletos desviados" value={`${snapshot.billsDodged}`} />
              <ResultMetric label="apoios" value={`${snapshot.supports}`} />
              <ResultMetric label="combo max" value={`${snapshot.maxCombo}x`} />
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
                {copyLabel}
              </button>
            </div>
            <Link href={`/ranking/${game.slug}`} className="mt-3 block rounded-lg bg-[#130d10] px-4 py-3 text-center text-sm font-black uppercase">
              Ver ranking
            </Link>
          </section>
        ) : null}
      </div>
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

function CircleMenu({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full border-[3px] border-[#2a3b47] bg-[linear-gradient(180deg,#3b4b54,#111820)] text-3xl shadow-[0_5px_0_rgba(0,0,0,0.55)]">
        {icon}
      </div>
      <div className="mt-1 rounded-full bg-[#071724] px-3 py-1 text-[10px] font-black uppercase shadow-[0_3px_0_rgba(0,0,0,0.45)]">
        {label}
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
    <section className="rounded-[1.25rem] border border-[rgba(98,214,255,0.26)] bg-[rgba(6,26,39,0.9)] p-3 shadow-[0_14px_50px_rgba(0,0,0,0.35)]">
      <div className="text-center text-xs font-black uppercase tracking-[0.18em] text-[#f7f1df]">Suas necessidades</div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {needBars.map((need) => {
          const value = need.getValue(snapshot);
          return (
            <div key={need.label} className="rounded-lg bg-[rgba(19,13,16,0.62)] px-3 py-2">
              <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase">
                <span>{need.label}</span>
                <span className="text-[#ffd554]">{Math.round(value)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded bg-[rgba(255,255,255,0.12)] text-[10px] font-black">
                  {need.icon.endsWith(".png") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={need.icon} alt="" className="size-7 object-contain" />
                  ) : (
                    need.icon
                  )}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40">
                  <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: need.color }} />
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
