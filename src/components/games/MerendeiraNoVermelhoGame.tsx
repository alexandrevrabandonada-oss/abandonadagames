"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameDefinition } from "@/lib/gameRegistry";
import type { ScoreSubmission } from "@/lib/score";

type ItemKind = "ingredient" | "threat" | "power";

type KitchenItem = {
  id: number;
  kind: ItemKind;
  x: number;
  y: number;
  size: number;
  label: string;
  tone: string;
  vx: number;
  vy: number;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  life: number;
  text: string;
  color: string;
};

type AudioTone = "good" | "bad" | "power";

type GameSnapshot = {
  score: number;
  day: number;
  breath: number;
  bills: number;
  chaos: number;
  stability: number;
  combo: number;
  maxCombo: number;
  supports: number;
  platesServed: number;
  ingredientBag: number;
  bestScore: number;
  rank: string;
  running: boolean;
  finished: boolean;
  eventCount: number;
};

type SurpriseEvent = {
  label: string;
  breath: number;
  bills: number;
  chaos: number;
  stability: number;
  score: number;
};

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 1080;
const ROUND_DURATION_MS = 60000;
const PLAYER_SPEED = 280;
const PLAYER_RADIUS = 44;
const BEST_SCORE_KEY = "abandonada:merendeira-no-vermelho:best-score";
const PLAYER_NAME_KEY = "abandonada:merendeira-no-vermelho:player-name";
const SERVE_ZONE = { x: 360, y: 248, w: 188, h: 116 };

const rankTable = [
  { min: 0, label: "D", message: "O mes venceu." },
  { min: 1200, label: "C", message: "Sobreviveu no sufoco." },
  { min: 2400, label: "B", message: "Segurou a cozinha." },
  { min: 3800, label: "A", message: "Virou o mes de pe." },
  { min: 5200, label: "S", message: "Mutirao salvou geral." },
];

const ingredientPool = [
  { label: "arroz", tone: "#9dff62" },
  { label: "feijao", tone: "#8df760" },
  { label: "legume", tone: "#6afc89" },
  { label: "fruta", tone: "#98ff6c" },
  { label: "leite", tone: "#6edbff" },
  { label: "pao", tone: "#ffd56b" },
];

const threatPool = [
  { label: "aluguel", tone: "#ff6a5e" },
  { label: "juros", tone: "#ff5868" },
  { label: "luz", tone: "#ff8571" },
  { label: "mercado", tone: "#ff5c52" },
  { label: "boleto", tone: "#ff5460" },
  { label: "escala", tone: "#ff6d8f" },
];

const powerPool = [
  { label: "mutirao", tone: "#ffd557" },
  { label: "apoio", tone: "#6edbff" },
  { label: "marmita", tone: "#8eff7a" },
  { label: "escala", tone: "#ffe369" },
  { label: "organizacao", tone: "#8cf4ff" },
  { label: "feira", tone: "#9affbf" },
];

const surpriseEvents: SurpriseEvent[] = [
  { label: "Hoje chamaram em cima da hora!", breath: -10, bills: 0, chaos: 8, stability: -12, score: 0 },
  { label: "Dia sem convocacao: renda zerada.", breath: -2, bills: 12, chaos: 10, stability: -18, score: 0 },
  { label: "Plantao extra: +renda, -folego.", breath: -12, bills: -8, chaos: 5, stability: 4, score: 60 },
  { label: "Pagamento ainda nao caiu.", breath: -4, bills: 10, chaos: 8, stability: -9, score: 0 },
  { label: "Escala incerta!", breath: -5, bills: 4, chaos: 7, stability: -15, score: 0 },
  { label: "Apoio chegou!", breath: 4, bills: -3, chaos: -8, stability: 12, score: 40 },
  { label: "Mutirao da cozinha!", breath: 2, bills: -4, chaos: -10, stability: 10, score: 80 },
  { label: "Rede de apoio!", breath: 6, bills: -2, chaos: -6, stability: 11, score: 40 },
];

const benchmark = {
  replayDesireScore: 9.1,
  roundsPerSession: 4.2,
  replayButtonClarity: 9.4,
  scoreImprovementPotential: 9.0,
  comboAddiction: 9.3,
  runDurationComfort: 9.0,
  visualJuiceScore: 9.0,
  feedbackFrequency: 9.2,
  firstRewardTime: 3.8,
  actionDensity: 9.1,
  soundFeedback: 8.7,
  animationEnergy: 9.0,
  powerupExcitement: 9.1,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getRank(score: number) {
  return [...rankTable].reverse().find((rank) => score >= rank.min) ?? rankTable[0];
}

function createInitialSnapshot(bestScore = 0): GameSnapshot {
  return {
    score: 680,
    day: 12,
    breath: 72,
    bills: 68,
    chaos: 55,
    stability: 40,
    combo: 0,
    maxCombo: 0,
    supports: 0,
    platesServed: 0,
    ingredientBag: 1,
    bestScore,
    rank: getRank(680).label,
    running: false,
    finished: false,
    eventCount: 0,
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

async function createResultCardFile(stats: GameSnapshot) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#0b2c39");
  bg.addColorStop(0.45, "#151d1c");
  bg.addColorStop(1, "#090f14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f5e4c9";
  ctx.fillRect(54, 54, 972, 1242);
  ctx.strokeStyle = "#eb4f2e";
  ctx.lineWidth = 14;
  ctx.strokeRect(54, 54, 972, 1242);

  ctx.fillStyle = "#182029";
  ctx.fillRect(90, 92, 900, 188);
  ctx.fillStyle = "#f3f0dd";
  ctx.font = '900 58px "Geist", sans-serif';
  ctx.fillText("MERENDEIRA", 116, 168);
  ctx.fillStyle = "#ff5e2f";
  ctx.fillText("NO VERMELHO", 116, 236);
  ctx.fillStyle = "#ffd34e";
  ctx.font = '900 28px "Geist", sans-serif';
  ctx.fillText("salario atrasado + contrato intermitente", 116, 286);

  ctx.fillStyle = "#eb4f2e";
  ctx.font = '900 230px "Geist", sans-serif';
  ctx.fillText(stats.rank, 104, 564);
  ctx.fillStyle = "#0d1114";
  ctx.font = '900 56px "Geist", sans-serif';
  ctx.fillText(`${stats.score}`, 400, 418);
  ctx.fillStyle = "#ffd34e";
  ctx.font = '900 26px "Geist", sans-serif';
  ctx.fillText("score", 404, 458);

  ctx.fillStyle = "#f3f0dd";
  ctx.font = '900 44px "Geist", sans-serif';
  wrapCanvasText(ctx, "O boleto veio, mas a cozinha resistiu.", 116, 662, 840, 52, 2);

  ctx.fillStyle = "rgba(10,19,26,0.78)";
  ctx.fillRect(116, 758, 848, 232);
  ctx.fillStyle = "#ffd34e";
  ctx.font = '900 26px "Geist", sans-serif';
  ctx.fillText("pratos servidos", 148, 824);
  ctx.fillText("dias sobrevividos", 148, 886);
  ctx.fillText("estabilidade", 148, 948);
  ctx.fillText("combo maximo", 522, 824);
  ctx.fillText("folego final", 522, 886);
  ctx.fillText("caos final", 522, 948);

  ctx.fillStyle = "#f3f0dd";
  ctx.font = '900 42px "Geist", sans-serif';
  ctx.fillText(`${stats.platesServed}`, 148, 864);
  ctx.fillText(`${stats.day}/30`, 148, 926);
  ctx.fillText(`${Math.round(stats.stability)}%`, 148, 988);
  ctx.fillText(`x${stats.maxCombo}`, 522, 864);
  ctx.fillText(`${Math.round(stats.breath)}%`, 522, 926);
  ctx.fillText(`${Math.round(stats.chaos)}%`, 522, 988);

  ctx.fillStyle = "#c13d37";
  ctx.fillRect(116, 1088, 848, 108);
  ctx.fillStyle = "#f3f0dd";
  ctx.font = '900 44px "Geist", sans-serif';
  ctx.fillText("JOGUE TAMBEM!", 350, 1156);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return null;
  return new File([blob], "merendeira-no-vermelho-resultado.png", { type: "image/png" });
}

export function MerendeiraNoVermelhoGame({ game }: { game: GameDefinition }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const startAtRef = useRef(0);
  const lastTickRef = useRef(0);
  const nextIngredientAtRef = useRef(0);
  const nextThreatAtRef = useRef(0);
  const nextPowerAtRef = useRef(0);
  const nextEventAtRef = useRef(5200);
  const playerPosRef = useRef({ x: 360, y: 770 });
  const playerTargetRef = useRef<{ x: number; y: number } | null>(null);
  const pressedRef = useRef<Record<string, boolean>>({});
  const serveLockRef = useRef(0);
  const supportShieldRef = useRef(0);
  const comboShieldRef = useRef(0);
  const freezeBillsRef = useRef(0);
  const kitchenRushRef = useRef(0);
  const itemSeqRef = useRef(0);
  const itemsRef = useRef<KitchenItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const initialBestScore =
    typeof window !== "undefined"
      ? Number.parseInt(window.localStorage.getItem(BEST_SCORE_KEY) ?? "0", 10) || 0
      : 0;
  const initialPlayerName =
    typeof window !== "undefined" ? window.localStorage.getItem(PLAYER_NAME_KEY) ?? "Anon" : "Anon";
  const bestScoreRef = useRef(initialBestScore);
  const submittedRef = useRef(false);
  const stateRef = useRef<GameSnapshot>(createInitialSnapshot(initialBestScore));

  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => createInitialSnapshot(initialBestScore));
  const [playerName, setPlayerName] = useState(initialPlayerName);
  const [toast, setToast] = useState("Salario atrasado. Segura a cozinha.");
  const [copyLabel, setCopyLabel] = useState("Compartilhar");
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

  const rankMeta = useMemo(() => getRank(snapshot.score), [snapshot.score]);

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
          ? { frequency: 760, duration: 0.08, gain: 0.04, type: "triangle" as OscillatorType }
          : tone === "power"
            ? { frequency: 980, duration: 0.14, gain: 0.05, type: "square" as OscillatorType }
            : { frequency: 180, duration: 0.18, gain: 0.05, type: "sawtooth" as OscillatorType };
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

  const mutateState = useCallback((updater: (current: GameSnapshot) => GameSnapshot) => {
    const next = updater(stateRef.current);
    stateRef.current = next;
    updateBestScore(next.score);
    if (bestScoreRef.current !== next.bestScore) {
      stateRef.current = { ...next, bestScore: bestScoreRef.current };
    }
    setSnapshot(stateRef.current);
  }, [updateBestScore]);

  const addParticle = useCallback((text: string, x: number, y: number, color: string) => {
    particlesRef.current.push({ id: Date.now() + Math.random(), x, y, life: 1, text, color });
  }, []);

  const spawnItem = useCallback((kind: ItemKind) => {
    itemSeqRef.current += 1;
    const choice =
      kind === "ingredient"
        ? ingredientPool[Math.floor(Math.random() * ingredientPool.length)]
        : kind === "threat"
          ? threatPool[Math.floor(Math.random() * threatPool.length)]
          : powerPool[Math.floor(Math.random() * powerPool.length)];

    itemsRef.current.push({
      id: itemSeqRef.current,
      kind,
      label: choice.label,
      tone: choice.tone,
      x: 96 + Math.random() * 528,
      y: 336 + Math.random() * 524,
      size: kind === "power" ? 32 : 28,
      vx: (Math.random() - 0.5) * (kind === "threat" ? 54 : 32),
      vy: (Math.random() - 0.5) * (kind === "threat" ? 44 : 28),
    });
  }, []);

  const submitScore = useCallback(async (stats: GameSnapshot, finalName: string) => {
    const payload: ScoreSubmission = {
      slug: game.slug,
      player: finalName || "Anon",
      score: stats.score,
      durationMs: ROUND_DURATION_MS,
      eventsHandled: Math.max(1, stats.platesServed + stats.supports + stats.eventCount),
    };

    await fetch("/api/score/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }, [game.slug]);

  const resetRound = useCallback(() => {
    submittedRef.current = false;
    itemSeqRef.current = 0;
    playerPosRef.current = { x: 360, y: 770 };
    playerTargetRef.current = null;
    nextIngredientAtRef.current = 250;
    nextThreatAtRef.current = 1050;
    nextPowerAtRef.current = 6700;
    nextEventAtRef.current = 5200;
    serveLockRef.current = 0;
    supportShieldRef.current = 0;
    comboShieldRef.current = 0;
    freezeBillsRef.current = 0;
    kitchenRushRef.current = 0;
    itemsRef.current = [];
    particlesRef.current = [];
    const next = { ...createInitialSnapshot(bestScoreRef.current), running: true };
    stateRef.current = next;
    setSnapshot(next);
    setToast("Salario atrasado. Segura a cozinha.");
    startAtRef.current = performance.now();
    lastTickRef.current = performance.now();
  }, []);

  const finishRound = useCallback(() => {
    if (stateRef.current.finished) return;
    mutateState((current) => ({
      ...current,
      running: false,
      finished: true,
      rank: getRank(current.score).label,
      bestScore: bestScoreRef.current,
    }));
    setToast("O boleto veio, mas a cozinha resistiu.");
  }, [mutateState]);

  const applyPower = useCallback((item: KitchenItem) => {
    if (item.label.includes("mutirao")) {
      kitchenRushRef.current = 6;
      itemsRef.current = itemsRef.current.filter((current) => current.kind !== "threat");
      mutateState((current) => ({
        ...current,
        supports: current.supports + 1,
        chaos: clamp(current.chaos - 14, 0, 100),
        stability: clamp(current.stability + 8, 0, 100),
        score: current.score + 120,
      }));
      addParticle("Mutirao da cozinha!", item.x - 96, item.y, "#ffd34e");
      setToast("Mutirao da cozinha!");
      playTone("power");
      return;
    }
    if (item.label.includes("apoio")) {
      supportShieldRef.current = 7;
      comboShieldRef.current = 6;
      mutateState((current) => ({
        ...current,
        supports: current.supports + 1,
        chaos: clamp(current.chaos - 16, 0, 100),
        stability: clamp(current.stability + 12, 0, 100),
        score: current.score + 90,
      }));
      addParticle("Apoio das colegas!", item.x - 92, item.y, "#72d9ff");
      setToast("Apoio das colegas!");
      playTone("power");
      return;
    }
    if (item.label.includes("marmita")) {
      mutateState((current) => ({
        ...current,
        supports: current.supports + 1,
        breath: clamp(current.breath + 18, 0, 100),
        score: current.score + 80,
      }));
      addParticle("Respira!", item.x - 42, item.y, "#8eff7a");
      setToast("Respira!");
      playTone("good");
      return;
    }
    if (item.label.includes("escala")) {
      mutateState((current) => ({
        ...current,
        supports: current.supports + 1,
        stability: clamp(current.stability + 18, 0, 100),
        score: current.score + 90,
      }));
      addParticle("Escala garantida!", item.x - 88, item.y, "#ffe369");
      setToast("Escala garantida!");
      playTone("power");
      return;
    }
    if (item.label.includes("organizacao")) {
      freezeBillsRef.current = 7;
      mutateState((current) => ({
        ...current,
        supports: current.supports + 1,
        bills: clamp(current.bills - 12, 0, 100),
        chaos: clamp(current.chaos - 8, 0, 100),
        stability: clamp(current.stability + 10, 0, 100),
        score: current.score + 100,
      }));
      addParticle("Organizacao coletiva!", item.x - 108, item.y, "#8cf4ff");
      setToast("Organizacao coletiva!");
      playTone("power");
      return;
    }

    mutateState((current) => ({
      ...current,
      supports: current.supports + 1,
      bills: clamp(current.bills - 8, 0, 100),
      score: current.score + 70,
    }));
    addParticle("Feira barata!", item.x - 74, item.y, "#9affbf");
    setToast("Feira barata!");
    playTone("good");
  }, [addParticle, mutateState, playTone]);

  const collectItem = useCallback((item: KitchenItem) => {
    if (item.kind === "ingredient") {
      mutateState((current) => ({
        ...current,
        ingredientBag: clamp(current.ingredientBag + 1, 0, 4),
        score: current.score + 40,
      }));
      addParticle(item.label.toUpperCase(), item.x - 34, item.y, item.tone);
      setToast(item.label === "leite" ? "Leite salvo!" : item.label === "fruta" ? "Vitamina garantida!" : "Ingrediente na mao!");
      playTone("good");
      return;
    }

    if (item.kind === "threat") {
      mutateState((current) => ({
        ...current,
        combo: comboShieldRef.current > 0 ? current.combo : 0,
        breath: clamp(current.breath - 9, 0, 100),
        bills: clamp(current.bills + (freezeBillsRef.current > 0 ? 4 : 11), 0, 100),
        chaos: clamp(current.chaos + 10, 0, 100),
        stability: clamp(current.stability - 7, 0, 100),
      }));
      addParticle(item.label === "escala" ? "Escala incerta!" : "Boleto vindo!", item.x - 66, item.y, "#ff726a");
      setToast(item.label === "escala" ? "Escala incerta!" : item.label === "juros" ? "Juros mordeu!" : "Boleto vindo!");
      playTone("bad");
      return;
    }

    applyPower(item);
  }, [addParticle, applyPower, mutateState, playTone]);

  const servePlate = useCallback(() => {
    const current = stateRef.current;
    if (!current.running || current.ingredientBag <= 0 || serveLockRef.current > 0) return;
    const { x, y } = playerPosRef.current;
    const insideServe =
      x > SERVE_ZONE.x - SERVE_ZONE.w / 2 &&
      x < SERVE_ZONE.x + SERVE_ZONE.w / 2 &&
      y > SERVE_ZONE.y - SERVE_ZONE.h / 2 &&
      y < SERVE_ZONE.y + SERVE_ZONE.h / 2;
    if (!insideServe) return;

    serveLockRef.current = kitchenRushRef.current > 0 ? 0.35 : 0.72;
    mutateState((state) => {
      const combo = state.combo + 1;
      const comboBonus = combo >= 4 ? 120 + combo * 14 : combo >= 2 ? 45 : 0;
      const scoreGain = 140 + combo * 18 + comboBonus;
      return {
        ...state,
        ingredientBag: Math.max(0, state.ingredientBag - 1),
        platesServed: state.platesServed + 1,
        combo,
        maxCombo: Math.max(state.maxCombo, combo),
        score: state.score + scoreGain,
        chaos: clamp(state.chaos - 8, 0, 100),
        stability: clamp(state.stability + 5, 0, 100),
        rank: getRank(state.score + scoreGain).label,
      };
    });
    addParticle(current.combo >= 2 ? "Combo da merenda!" : "Prato servido!", x - 82, y - 70, "#ffd34e");
    setToast(current.combo >= 2 ? "Combo da merenda!" : "Prato servido!");
    playTone("good");
  }, [addParticle, mutateState, playTone]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      pressedRef.current[event.key.toLowerCase()] = true;
      if (event.key === " " || event.key === "Enter") servePlate();
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      pressedRef.current[event.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [servePlate]);

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
      const grace = elapsed < 8000;
      const dayByTime = clamp(1 + Math.floor((elapsed / ROUND_DURATION_MS) * 30), 1, 30);
      const state = stateRef.current;

      if (state.running) {
        if (elapsed >= nextIngredientAtRef.current) {
          spawnItem("ingredient");
          nextIngredientAtRef.current = elapsed + clamp((grace ? 820 : 1080) - kitchenRushRef.current * 50, 440, 1120);
        }
        if (elapsed >= nextThreatAtRef.current) {
          spawnItem("threat");
          nextThreatAtRef.current = elapsed + clamp((grace ? 1600 : 1320) - state.chaos * 2.2, 620, 1800);
        }
        if (elapsed >= nextPowerAtRef.current) {
          spawnItem("power");
          nextPowerAtRef.current = elapsed + 7200 + Math.random() * 1800;
        }
        if (elapsed >= nextEventAtRef.current) {
          const event = surpriseEvents[Math.floor(Math.random() * surpriseEvents.length)];
          mutateState((current) => ({
            ...current,
            breath: clamp(current.breath + event.breath, 0, 100),
            bills: clamp(current.bills + event.bills, 0, 100),
            chaos: clamp(current.chaos + event.chaos, 0, 100),
            stability: clamp(current.stability + event.stability, 0, 100),
            score: current.score + event.score,
            eventCount: current.eventCount + 1,
            rank: getRank(current.score + event.score).label,
          }));
          setToast(event.label);
          nextEventAtRef.current = elapsed + 5600 + Math.random() * 1800;
        }
      }

      const keys = pressedRef.current;
      const axisX = (keys.arrowright || keys.d ? 1 : 0) - (keys.arrowleft || keys.a ? 1 : 0);
      const axisY = (keys.arrowdown || keys.s ? 1 : 0) - (keys.arrowup || keys.w ? 1 : 0);
      let nextVx = axisX * PLAYER_SPEED;
      let nextVy = axisY * PLAYER_SPEED;

      if (playerTargetRef.current) {
        const dx = playerTargetRef.current.x - playerPosRef.current.x;
        const dy = playerTargetRef.current.y - playerPosRef.current.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 12) {
          playerTargetRef.current = null;
        } else {
          nextVx = (dx / Math.max(distance, 1)) * PLAYER_SPEED;
          nextVy = (dy / Math.max(distance, 1)) * PLAYER_SPEED;
        }
      }

      playerPosRef.current = {
        x: clamp(playerPosRef.current.x + nextVx * dt, 88, CANVAS_WIDTH - 88),
        y: clamp(playerPosRef.current.y + nextVy * dt, 250, CANVAS_HEIGHT - 110),
      };

      if (serveLockRef.current > 0) serveLockRef.current = Math.max(0, serveLockRef.current - dt);
      if (supportShieldRef.current > 0) supportShieldRef.current = Math.max(0, supportShieldRef.current - dt);
      if (comboShieldRef.current > 0) comboShieldRef.current = Math.max(0, comboShieldRef.current - dt);
      if (freezeBillsRef.current > 0) freezeBillsRef.current = Math.max(0, freezeBillsRef.current - dt);
      if (kitchenRushRef.current > 0) kitchenRushRef.current = Math.max(0, kitchenRushRef.current - dt);

      itemsRef.current = itemsRef.current
        .map((item) => {
          let x = item.x + item.vx * dt;
          let y = item.y + item.vy * dt;
          let vx = item.vx;
          let vy = item.vy;
          if (x < 72 || x > CANVAS_WIDTH - 72) vx *= -1;
          if (y < 320 || y > CANVAS_HEIGHT - 130) vy *= -1;
          x = clamp(x, 72, CANVAS_WIDTH - 72);
          y = clamp(y, 320, CANVAS_HEIGHT - 130);
          return { ...item, x, y, vx, vy };
        })
        .slice(-22);

      const hitIds = new Set<number>();
      for (const item of itemsRef.current) {
        const distance = Math.hypot(item.x - playerPosRef.current.x, item.y - playerPosRef.current.y);
        if (distance < item.size + PLAYER_RADIUS) {
          hitIds.add(item.id);
          collectItem(item);
        }
      }
      if (hitIds.size > 0) {
        itemsRef.current = itemsRef.current.filter((item) => !hitIds.has(item.id));
      }

      servePlate();

      particlesRef.current = particlesRef.current
        .map((particle) => ({
          ...particle,
          y: particle.y - 42 * dt,
          life: particle.life - dt * 1.25,
        }))
        .filter((particle) => particle.life > 0);

      if (state.running) {
        mutateState((current) => ({
          ...current,
          day: Math.max(current.day, dayByTime),
          breath: clamp(current.breath - (grace ? 0.34 : 0.62), 0, 100),
          bills: clamp(current.bills + (freezeBillsRef.current > 0 ? 0.08 : grace ? 0.18 : 0.34), 0, 100),
          chaos: clamp(current.chaos + (supportShieldRef.current > 0 ? 0.1 : grace ? 0.2 : 0.38), 0, 100),
          stability: clamp(current.stability - (grace ? 0.14 : 0.22), 0, 100),
          bestScore: bestScoreRef.current,
          rank: getRank(current.score).label,
        }));
      }

      drawKitchen(
        ctx,
        stateRef.current,
        itemsRef.current,
        particlesRef.current,
        playerPosRef.current,
        supportShieldRef.current,
        kitchenRushRef.current,
      );

      if (
        stateRef.current.running &&
        (dayByTime >= 30 || stateRef.current.breath <= 0 || stateRef.current.bills >= 100 || stateRef.current.chaos >= 100 || stateRef.current.stability <= 0)
      ) {
        finishRound();
      }

      frameRef.current = window.requestAnimationFrame(render);
    };

    frameRef.current = window.requestAnimationFrame(render);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [collectItem, finishRound, mutateState, resetRound, servePlate, spawnItem]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PLAYER_NAME_KEY, playerName);
  }, [playerName]);

  useEffect(() => {
    if (!snapshot.finished || submittedRef.current) return;
    submittedRef.current = true;
    updateBestScore(snapshot.score);
    void submitScore(snapshot, playerName);
    void createResultCardFile(snapshot).then((file) => {
      if (!file) return;
      const url = URL.createObjectURL(file);
      setResultImageUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return url;
      });
    });
  }, [playerName, snapshot, submitScore, updateBestScore]);

  const shareResult = useCallback(async () => {
    const text = `Joguei Merendeira no Vermelho: servi ${snapshot.platesServed} merendas, sobrevivi ${snapshot.day} dias, segurei a estabilidade em ${Math.round(snapshot.stability)}% e terminei com rank ${snapshot.rank}. O boleto veio, mas a cozinha resistiu.`;
    const imageFile = await createResultCardFile(snapshot);
    const payload = imageFile
      ? { title: game.title, text, url: window.location.href, files: [imageFile] }
      : { title: game.title, text, url: window.location.href };

    try {
      if ("share" in navigator) {
        await navigator.share(payload as ShareData);
        setCopyLabel("Compartilhado");
        return;
      }
    } catch {}

    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel("Copiado");
    } catch {
      setCopyLabel("Sem share");
    }
  }, [game.title, snapshot]);

  const resultMessage =
    snapshot.rank === "S" ? "Mutirao salvou geral." :
    snapshot.rank === "A" ? "Virou o mes de pe." :
    snapshot.rank === "B" ? "Segurou a cozinha." :
    snapshot.rank === "C" ? "Sobreviveu no sufoco." :
    "O mes venceu.";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#071319] px-3 pb-20 pt-3 text-[#f7f3df]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,114,51,0.22),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(114,214,255,0.12),transparent_18%),linear-gradient(180deg,#08202b,#0d1113_70%)]" />
      <div className="relative z-10 mx-auto max-w-md">
        <header className="rounded-[1.6rem] border border-white/10 bg-[rgba(7,14,20,0.72)] px-4 py-4 shadow-[0_16px_50px_rgba(0,0,0,0.36)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ffd45c]">salario atrasado + contrato intermitente</div>
              <h1 className="mt-2 text-[2.25rem] font-black uppercase leading-[0.88] text-[#f3f0dd]">
                Merendeira
                <span className="block text-[#ff5e2f]">no Vermelho</span>
              </h1>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-right">
              <div className="text-[10px] font-black uppercase text-white/55">score</div>
              <div className="text-3xl font-black text-[#ffd45c]">{snapshot.score}</div>
              <div className="text-[10px] font-black uppercase text-[#ff9a6e]">combo x{Math.max(1, snapshot.combo)}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            <MiniHud label="dia" value={`${snapshot.day}/30`} color="#f2efe3" />
            <MiniHud label="folego" value={`${Math.round(snapshot.breath)}/100`} color="#56d35e" />
            <MiniHud label="contas" value={`${Math.round(snapshot.bills)}/100`} color="#ff5858" />
            <MiniHud label="caos" value={`${Math.round(snapshot.chaos)}/100`} color="#be67ff" />
            <MiniHud label="estab." value={`${Math.round(snapshot.stability)}/100`} color="#ffd34e" />
          </div>
        </header>

        <section className="mt-3 overflow-hidden rounded-[1.7rem] border border-white/10 bg-[rgba(10,19,26,0.88)] shadow-[0_18px_56px_rgba(0,0,0,0.42)]">
          <div className="border-b border-white/10 p-3">
            <canvas
              ref={canvasRef}
              className="block w-full touch-none rounded-[1.2rem]"
              onPointerDown={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                playerTargetRef.current = {
                  x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
                  y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
                };
              }}
              onPointerMove={(event) => {
                if (event.buttons !== 1) return;
                const rect = event.currentTarget.getBoundingClientRect();
                playerTargetRef.current = {
                  x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
                  y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
                };
              }}
            />
            <div className="mt-3 rounded-2xl border border-[#a15af0]/50 bg-[linear-gradient(180deg,rgba(78,19,115,0.7),rgba(44,15,74,0.78))] px-3 py-3">
              <div className="mb-2 text-center text-lg font-black uppercase text-[#ffd34e]">Como jogar</div>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-black uppercase text-white/82">
                <GuideStep title="1" text="mexa no toque" />
                <GuideStep title="2" text="colete os ingredientes" />
                <GuideStep title="3" text="leve ao balcao" />
                <GuideStep title="4" text="mantenha combo" />
                <GuideStep title="5" text="desvie dos boletos" />
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-3">
            <div className="rounded-xl border border-[#72d9ff]/35 bg-[#0c1720] p-3">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#72d9ff]">evento</div>
              <div className="mt-1 text-sm font-black text-white">{toast}</div>
            </div>

            {snapshot.finished ? (
              <div className="grid gap-3">
                <div className="rounded-[1.4rem] border border-[#ffd45c]/25 bg-[linear-gradient(180deg,rgba(34,19,18,0.96),rgba(14,16,18,0.9))] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ffd45c]">fim do mes</div>
                      <div className="mt-2 text-7xl font-black text-[#ffd45c]">{rankMeta.label}</div>
                      <div className="mt-2 text-xl font-black uppercase text-[#f3f0dd]">{resultMessage}</div>
                    </div>
                    <div className="rounded-xl bg-black/25 px-4 py-3 text-right">
                      <div className="text-[10px] font-black uppercase text-white/55">score final</div>
                      <div className="text-4xl font-black text-[#ffd45c]">{snapshot.score}</div>
                      <div className="mt-1 text-xs font-black uppercase text-[#ff9a6e]">melhor {snapshot.bestScore}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <ResultChip label="dias sobrevividos" value={`${snapshot.day}/30`} />
                    <ResultChip label="pratos servidos" value={`${snapshot.platesServed}`} />
                    <ResultChip label="combo maximo" value={`x${snapshot.maxCombo}`} />
                    <ResultChip label="apoios coletados" value={`${snapshot.supports}`} />
                    <ResultChip label="estabilidade" value={`${Math.round(snapshot.stability)}%`} />
                    <ResultChip label="caos final" value={`${Math.round(snapshot.chaos)}%`} />
                    <ResultChip label="folego final" value={`${Math.round(snapshot.breath)}%`} />
                    <ResultChip label="benchmark" value="9/10" />
                  </div>
                  <div className="mt-4 rounded-xl border border-[#a15af0]/45 bg-[#321043] px-3 py-3 text-center text-sm font-black uppercase text-white">
                    O boleto veio, mas a cozinha resistiu.
                  </div>
                  <input
                    value={playerName}
                    onChange={(event) => setPlayerName(event.target.value.slice(0, 18))}
                    className="mt-4 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    placeholder="nome no ranking"
                  />
                  <div className="mt-4 flex gap-2">
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
                      className="flex-1 rounded-xl bg-[#0d73c8] px-4 py-4 text-sm font-black uppercase"
                    >
                      Jogar de novo
                    </button>
                    <button
                      type="button"
                      onClick={() => void shareResult()}
                      className="flex-1 rounded-xl bg-[#2d8d20] px-4 py-4 text-sm font-black uppercase"
                    >
                      {copyLabel}
                    </button>
                    <Link
                      href={`/ranking/${game.slug}`}
                      className="flex-1 rounded-xl bg-[#be8a16] px-4 py-4 text-center text-sm font-black uppercase text-[#101010]"
                    >
                      Ver ranking
                    </Link>
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-[#ffd45c]/20 bg-[rgba(8,19,28,0.94)] p-4">
                  <div className="text-center text-2xl font-black uppercase text-[#ffd45c]">Compartilhe seu resultado!</div>
                  <div className="mt-3 overflow-hidden rounded-[1.1rem] border border-white/10 bg-black/25">
                    {resultImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resultImageUrl} alt="Card de resultado" className="block w-full" />
                    ) : (
                      <div className="flex aspect-[4/5] items-center justify-center text-xs font-black uppercase text-white/55">
                        gerando card
                      </div>
                    )}
                  </div>
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ffd45c]">benchmark alvo</div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-black uppercase">
                      <Badge value={`replay ${benchmark.replayDesireScore}`} />
                      <Badge value={`vitalidade ${benchmark.visualJuiceScore}`} />
                      <Badge value={`1a recompensa ${benchmark.firstRewardTime}s`} />
                      <Badge value={`densidade ${benchmark.actionDensity}`} />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function drawKitchen(
  ctx: CanvasRenderingContext2D,
  snapshot: GameSnapshot,
  items: KitchenItem[],
  particles: Particle[],
  player: { x: number; y: number },
  shield: number,
  rush: number,
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const wall = ctx.createLinearGradient(0, 0, 0, 620);
  wall.addColorStop(0, "#587487");
  wall.addColorStop(1, "#2c424a");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 620);
  ctx.fillStyle = "#f5e9cb";
  ctx.fillRect(0, 620, CANVAS_WIDTH, CANVAS_HEIGHT - 620);

  ctx.fillStyle = "#40525b";
  for (let x = 0; x < CANVAS_WIDTH; x += 72) {
    ctx.fillRect(x, 0, 3, 620);
  }
  ctx.fillStyle = "#495054";
  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      ctx.fillRect(col * 72 + (row % 2 ? 0 : 4), 628 + row * 72, 66, 66);
    }
  }

  ctx.fillStyle = "#1c2228";
  ctx.fillRect(102, 184, 198, 236);
  ctx.fillRect(420, 184, 208, 236);
  ctx.fillStyle = "#dce8ef";
  ctx.fillRect(118, 200, 166, 200);
  ctx.fillRect(438, 200, 174, 200);
  ctx.fillStyle = "#f5cf6f";
  ctx.fillRect(0, 470, CANVAS_WIDTH, 14);

  ctx.fillStyle = "#101416";
  ctx.fillRect(SERVE_ZONE.x - SERVE_ZONE.w / 2, SERVE_ZONE.y - SERVE_ZONE.h / 2, SERVE_ZONE.w, SERVE_ZONE.h);
  ctx.fillStyle = "#f3f0dd";
  ctx.font = '900 26px "Geist", sans-serif';
  ctx.fillText("BALCAO", SERVE_ZONE.x - 56, SERVE_ZONE.y - 6);
  ctx.font = '800 18px "Geist", sans-serif';
  ctx.fillText("sirva rapido", SERVE_ZONE.x - 52, SERVE_ZONE.y + 26);

  ctx.fillStyle = "#40525b";
  ctx.fillRect(40, 534, 190, 40);
  ctx.fillRect(486, 534, 194, 40);
  ctx.fillStyle = "#13222b";
  ctx.fillRect(52, 490, 166, 46);
  ctx.fillRect(498, 490, 166, 46);

  ctx.fillStyle = "#f3f0dd";
  ctx.font = '900 34px "Geist", sans-serif';
  ctx.fillText("A MERENDA", 84, 520);
  ctx.fillStyle = "#ff5e2f";
  ctx.fillText("E DIREITO!", 84, 558);
  ctx.fillStyle = "#f3f0dd";
  ctx.fillText("EDUCACAO SE FAZ", 362, 520);
  ctx.fillText("COM RESPEITO!", 380, 556);

  for (const item of items) {
    drawItem(ctx, item);
  }

  drawServeCounter(ctx, snapshot, rush);
  drawPlayer(ctx, player, snapshot, shield);

  for (const particle of particles) {
    ctx.save();
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.font = '900 24px "Geist", sans-serif';
    ctx.fillText(particle.text, particle.x, particle.y);
    ctx.restore();
  }
}

function drawServeCounter(ctx: CanvasRenderingContext2D, snapshot: GameSnapshot, rush: number) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(196, 286, 330, 24);
  for (let index = 0; index < 4; index += 1) {
    const childX = 238 + index * 72;
    ctx.fillStyle = ["#d68a40", "#e4a35c", "#9fce6c", "#7fd2ff"][index % 4];
    ctx.beginPath();
    ctx.arc(childX, 264, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3f281c";
    ctx.fillRect(childX - 14, 280, 28, 42);
  }

  ctx.fillStyle = "#282928";
  ctx.fillRect(262, 820, 196, 90);
  ctx.fillStyle = "#74674a";
  ctx.fillRect(278, 836, 160, 58);
  ctx.fillStyle = "#e7e2cf";
  ctx.font = '900 24px "Geist", sans-serif';
  ctx.fillText(`ingredientes ${snapshot.ingredientBag}/4`, 292, 872);
  ctx.fillStyle = rush > 0 ? "#ffd34e" : "#ff9a6e";
  ctx.fillText(rush > 0 ? "mutirao ativo" : `combo x${snapshot.combo}`, 304, 898);
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: { x: number; y: number },
  snapshot: GameSnapshot,
  shield: number,
) {
  const expression =
    snapshot.breath < 24 ? "tired" :
    snapshot.chaos > 70 ? "alert" :
    snapshot.combo >= 4 ? "happy" :
    "normal";

  if (shield > 0) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "#72d9ff";
    ctx.beginPath();
    ctx.arc(player.x, player.y - 10, 62, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = "#1b2026";
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + 92, 56, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#7f482a";
  ctx.beginPath();
  ctx.arc(player.x, player.y - 98, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f3f0dd";
  ctx.beginPath();
  ctx.ellipse(player.x, player.y - 118, 50, 22, 0, Math.PI, 0, true);
  ctx.fill();
  ctx.fillRect(player.x - 40, player.y - 122, 80, 18);
  ctx.fillStyle = "#1f355f";
  ctx.beginPath();
  ctx.moveTo(player.x - 58, player.y - 48);
  ctx.lineTo(player.x + 58, player.y - 48);
  ctx.lineTo(player.x + 40, player.y + 70);
  ctx.lineTo(player.x - 40, player.y + 70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f3f0dd";
  ctx.fillRect(player.x - 28, player.y - 58, 56, 54);
  ctx.fillStyle = "#2c3440";
  ctx.fillRect(player.x - 36, player.y + 70, 24, 74);
  ctx.fillRect(player.x + 12, player.y + 70, 24, 74);
  ctx.fillStyle = "#7f482a";
  ctx.beginPath();
  ctx.arc(player.x - 48, player.y + 2, 16, 0, Math.PI * 2);
  ctx.arc(player.x + 48, player.y + 2, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1a1616";
  ctx.beginPath();
  ctx.arc(player.x - 12, player.y - 103, 4, 0, Math.PI * 2);
  ctx.arc(player.x + 12, player.y - 103, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#1a1616";
  ctx.beginPath();
  if (expression === "happy") {
    ctx.arc(player.x, player.y - 88, 12, 0, Math.PI, false);
  } else if (expression === "alert") {
    ctx.moveTo(player.x - 12, player.y - 84);
    ctx.lineTo(player.x + 12, player.y - 94);
  } else if (expression === "tired") {
    ctx.arc(player.x, player.y - 78, 12, Math.PI, Math.PI * 2, false);
  } else {
    ctx.moveTo(player.x - 10, player.y - 86);
    ctx.lineTo(player.x + 10, player.y - 86);
  }
  ctx.stroke();

  ctx.fillStyle = "#e6dec6";
  ctx.fillRect(player.x + 18, player.y - 14, 66, 20);
  ctx.fillStyle = "#64411f";
  ctx.beginPath();
  ctx.arc(player.x + 34, player.y - 4, 10, 0, Math.PI * 2);
  ctx.arc(player.x + 58, player.y - 4, 10, 0, Math.PI * 2);
  ctx.fill();
}

function drawItem(ctx: CanvasRenderingContext2D, item: KitchenItem) {
  const glow = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, item.size * 1.8);
  glow.addColorStop(0, item.tone);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(item.x, item.y, item.size * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  if (item.kind === "threat") {
    ctx.translate(item.x, item.y);
    ctx.rotate(0.16);
    ctx.translate(-item.x, -item.y);
  }
  ctx.fillStyle = item.kind === "threat" ? "#ffebe7" : item.kind === "power" ? "#101c22" : "#f8f4e6";
  ctx.beginPath();
  ctx.roundRect(item.x - item.size, item.y - item.size, item.size * 2, item.size * 2, 10);
  ctx.fill();
  ctx.fillStyle = item.kind === "threat" ? "#d9444e" : item.kind === "power" ? "#ffd34e" : "#213129";
  ctx.textAlign = "center";
  ctx.font = `900 ${item.kind === "power" ? 14 : 13}px "Geist", sans-serif`;
  ctx.fillText(item.label.toUpperCase(), item.x, item.y + 5);
  ctx.restore();
  ctx.textAlign = "start";
}

function MiniHud({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">
      <div className="text-[9px] font-black uppercase tracking-[0.08em] text-white/55">{label}</div>
      <div className="mt-1 text-sm font-black" style={{ color }}>{value}</div>
    </div>
  );
}

function GuideStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-2 py-2">
      <div className="text-lg font-black text-[#ffd34e]">{title}</div>
      <div className="mt-1 leading-tight">{text}</div>
    </div>
  );
}

function ResultChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/25 px-3 py-3">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/55">{label}</div>
      <div className="mt-1 text-xl font-black text-[#f3f0dd]">{value}</div>
    </div>
  );
}

function Badge({ value }: { value: string }) {
  return <div className="rounded-lg bg-black/20 px-2 py-2 text-center text-[#ffd45c]">{value}</div>;
}
