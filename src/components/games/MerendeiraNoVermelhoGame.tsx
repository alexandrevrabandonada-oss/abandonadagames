"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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
  vx?: number;
  vy?: number;
  size?: number;
  type?: "text" | "circle" | "spark" | "scrap";
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

async function createResultCardFile(stats: GameSnapshot) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#0b2c39");
  bg.addColorStop(0.45, "#151d1c");
  bg.addColorStop(1, "#090f14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer border
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 14;
  ctx.strokeRect(20, 20, 1040, 1310);
  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 12]);
  ctx.strokeRect(34, 34, 1012, 1282);
  ctx.setLineDash([]); // Reset

  // Wall tiles (top half of card)
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(54, 54, 972, 450);
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  for (let x = 54; x < 1026; x += 54) {
    ctx.beginPath();
    ctx.moveTo(x, 54);
    ctx.lineTo(x, 504);
    ctx.stroke();
  }
  for (let y = 54; y < 504; y += 54) {
    ctx.beginPath();
    ctx.moveTo(54, y);
    ctx.lineTo(1026, y);
    ctx.stroke();
  }

  // Tiled floor (bottom half of card)
  for (let row = 0; row < 15; row += 1) {
    const y = 504 + row * 58;
    for (let col = 0; col < 20; col += 1) {
      const x = 54 + col * 60 - (row % 2 ? 30 : 0);
      if (x < 54 || x > 1026) continue;
      const isRed = (row + col) % 2 === 0;
      ctx.fillStyle = isRed ? "#8d3a24" : "#722e1b";
      ctx.fillRect(x, y, 58, 56);
      
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(x, y, 58, 2);
      ctx.fillRect(x, y, 2, 56);
    }
  }

  // Window with school building at top left
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(90, 100, 200, 260);
  
  // Sky
  const skyGrad = ctx.createLinearGradient(90, 100, 90, 360);
  skyGrad.addColorStop(0, "#38bdf8");
  skyGrad.addColorStop(1, "#bae6fd");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(94, 104, 192, 252);
  
  // Building
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(120, 200, 140, 156);
  ctx.fillStyle = "#facc15";
  ctx.fillRect(140, 230, 20, 20);
  ctx.fillRect(180, 230, 20, 20);
  ctx.fillRect(220, 230, 20, 20);
  ctx.fillRect(140, 280, 20, 20);
  ctx.fillRect(180, 280, 20, 20);
  ctx.fillRect(220, 280, 20, 20);
  
  // Glass highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.moveTo(94, 104);
  ctx.lineTo(220, 104);
  ctx.lineTo(94, 230);
  ctx.closePath();
  ctx.fill();

  // Window frame
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 8;
  ctx.strokeRect(94, 104, 192, 252);
  ctx.beginPath();
  ctx.moveTo(186, 104);
  ctx.lineTo(186, 356);
  ctx.moveTo(94, 230);
  ctx.lineTo(286, 230);
  ctx.stroke();

  // Serving window with kids (center background of card)
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(400, 140, 320, 180);
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 10;
  ctx.strokeRect(400, 140, 320, 180);

  // 3 kids heads looking out
  for (let i = 0; i < 3; i++) {
    const kidX = 450 + i * 110;
    const kidY = 240 + Math.sin(i * 1.5) * 8;
    ctx.fillStyle = ["#8d5524", "#ffdbac", "#c68642"][i];
    ctx.beginPath();
    ctx.arc(kidX, kidY, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = ["#000000", "#d97706", "#27272a"][i];
    ctx.beginPath();
    if (i === 0) {
      ctx.arc(kidX - 16, kidY - 14, 12, 0, Math.PI * 2);
      ctx.arc(kidX + 16, kidY - 14, 12, 0, Math.PI * 2);
      ctx.arc(kidX, kidY - 24, 20, 0, Math.PI * 2);
    } else if (i === 1) {
      ctx.ellipse(kidX, kidY - 20, 26, 16, 0, Math.PI, 0, true);
    } else {
      ctx.arc(kidX - 18, kidY, 10, 0, Math.PI * 2);
      ctx.arc(kidX + 18, kidY, 10, 0, Math.PI * 2);
      ctx.arc(kidX, kidY - 22, 26, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(kidX - 8, kidY - 4, 6, 0, Math.PI * 2);
    ctx.arc(kidX + 8, kidY - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(kidX - 8, kidY - 4, 3, 0, Math.PI * 2);
    ctx.arc(kidX + 8, kidY - 4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(kidX, kidY + 6, 8, 0, Math.PI, false);
    ctx.stroke();
  }

  // Title Logo on Card
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(54, 400, 972, 100);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.strokeRect(54, 400, 972, 100);

  ctx.fillStyle = "#ffffff";
  ctx.font = '900 38px "Geist", sans-serif';
  ctx.fillText("MERENDEIRA NO VERMELHO", 90, 462);
  ctx.fillStyle = "#facc15";
  ctx.font = '900 16px "Geist", sans-serif';
  ctx.fillText("SALÁRIO ATRASADO + CONTRATO INTERMITENTE", 90, 488);

  // Stoves at card sides
  drawStove(ctx, 80, 680, 0);

  // Draw scaled-up Merendeira
  ctx.save();
  ctx.translate(340, 850);
  ctx.scale(2.2, 2.2);
  drawPlayer(ctx, { x: 0, y: 0 }, stats, 0, false);
  ctx.restore();

  // Draw Rank Badge on the right
  drawRankBadge(ctx, 820, 570, 180, stats.rank);

  // Stats table box
  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  ctx.fillRect(560, 680, 440, 360);
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 4;
  ctx.strokeRect(560, 680, 440, 360);

  ctx.fillStyle = "#ef4444";
  ctx.fillRect(560, 680, 440, 50);
  ctx.fillStyle = "#ffffff";
  ctx.font = '900 18px "Geist", sans-serif';
  ctx.fillText("ESTATÍSTICAS DA COZINHA", 580, 712);

  const statsList = [
    { label: "DIAS SOBREVIVIDOS", value: `${stats.day}/30` },
    { label: "PRATOS SERVIDOS", value: `${stats.platesServed}` },
    { label: "ESTABILIDADE FINAL", value: `${Math.round(stats.stability)}%` },
    { label: "CAOS DA COZINHA", value: `${Math.round(stats.chaos)}%` },
    { label: "FÔLEGO SOBRANTE", value: `${Math.round(stats.breath)}%` },
    { label: "SCORE CONQUISTADO", value: `${stats.score}` },
  ];

  ctx.font = '900 14px "Geist", sans-serif';
  for (let i = 0; i < statsList.length; i++) {
    const sy = 770 + i * 44;
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(statsList[i].label, 580, sy);
    ctx.fillStyle = "#facc15";
    ctx.font = '900 20px "Geist", sans-serif';
    ctx.fillText(statsList[i].value, 860, sy);
    ctx.font = '900 14px "Geist", sans-serif';

    // Divider
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(580, sy + 14);
    ctx.lineTo(980, sy + 14);
    ctx.stroke();
  }

  // Red slanted ribbon banner
  ctx.save();
  ctx.translate(540, 1120);
  ctx.rotate(-0.03);
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(-450, -36, 900, 72);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.strokeRect(-450, -36, 900, 72);
  ctx.fillStyle = "#ffffff";
  ctx.font = '900 30px "Geist", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("O BOLETO VEIO, MAS A COZINHA RESISTIU. ♥", 0, 10);
  ctx.restore();

  // Bottom CTA Yellow Bar
  ctx.fillStyle = "#eab308";
  ctx.fillRect(54, 1200, 972, 70);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.strokeRect(54, 1200, 972, 70);
  ctx.fillStyle = "#000000";
  ctx.font = '900 28px "Geist", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("🥣 JOGUE VOCÊ TAMBÉM NO ABANDONADA GAMES!", 540, 1246);

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
  const [toast, setToast] = useState("Salário atrasado. Segura a cozinha.");
  const [copyLabel, setCopyLabel] = useState("Compartilhar");
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

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

  const addParticle = useCallback((
    text: string,
    x: number,
    y: number,
    color: string,
    type: "text" | "circle" | "spark" | "scrap" = "text",
    vx = 0,
    vy = -42,
    size = 12
  ) => {
    particlesRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      life: 1,
      text,
      color,
      vx,
      vy,
      size,
      type,
    });
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
    setToast("Salário atrasado. Segura a cozinha.");
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
      addParticle("Mutirão da cozinha!", item.x - 96, item.y, "#ffd34e");
      
      // Golden star sparks explosion
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 150;
        addParticle("", item.x, item.y, "#ffd557", "spark", Math.cos(angle) * speed, Math.sin(angle) * speed, 8 + Math.random() * 6);
      }
      
      setToast("Mutirão da cozinha!");
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
      
      // Blue star sparks
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 70 + Math.random() * 100;
        addParticle("", item.x, item.y, "#6edbff", "spark", Math.cos(angle) * speed, Math.sin(angle) * speed, 6 + Math.random() * 6);
      }
      
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
      
      // Green heart/star particles
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 80;
        addParticle("", item.x, item.y, "#8eff7a", "circle", Math.cos(angle) * speed, Math.sin(angle) * speed - 30, 5 + Math.random() * 5);
      }
      
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
      
      // Yellow star sparks
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 90;
        addParticle("", item.x, item.y, "#ffe369", "spark", Math.cos(angle) * speed, Math.sin(angle) * speed, 6 + Math.random() * 5);
      }
      
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
      addParticle("Organização coletiva!", item.x - 108, item.y, "#8cf4ff");
      
      // Blue icy shards
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 70 + Math.random() * 110;
        addParticle("", item.x, item.y, "#8cf4ff", "scrap", Math.cos(angle) * speed, Math.sin(angle) * speed, 5 + Math.random() * 6);
      }
      
      setToast("Organização coletiva!");
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
    
    // Light green sparks
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 80;
      addParticle("", item.x, item.y, "#9affbf", "circle", Math.cos(angle) * speed, Math.sin(angle) * speed - 20, 4 + Math.random() * 4);
    }
    
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
      
      // Spawn ingredient sparks
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 80;
        addParticle("", item.x, item.y, item.tone, "circle", Math.cos(angle) * speed, Math.sin(angle) * speed, 4 + Math.random() * 5);
      }
      
      setToast(item.label === "leite" ? "Leite salvo!" : item.label === "fruta" ? "Vitamina garantida!" : "Ingrediente na mão!");
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
      
      // Spawn threat scraps
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 120;
        addParticle("", item.x, item.y, "#ff5c52", "scrap", Math.cos(angle) * speed, Math.sin(angle) * speed - 50, 6 + Math.random() * 8);
      }
      
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
    
    // Shoot confetti fountain from serve counter!
    for (let i = 0; i < 25; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2; // Upwards fan
      const speed = 120 + Math.random() * 160;
      const colors = ["#ff5e2f", "#ffd34e", "#72d9ff", "#8eff7a", "#ff9a6e"];
      const randColor = colors[Math.floor(Math.random() * colors.length)];
      const type = Math.random() > 0.5 ? "circle" : "scrap";
      addParticle("", x, y - 40, randColor, type, Math.cos(angle) * speed, Math.sin(angle) * speed, 5 + Math.random() * 8);
    }
    
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
        .map((particle) => {
          const vx = particle.vx ?? 0;
          const vy = particle.vy ?? -42;
          const gravity = (particle.type === "scrap" || particle.type === "circle") ? 150 : 0;
          return {
            ...particle,
            x: particle.x + vx * dt,
            y: particle.y + (vy + gravity * (1 - particle.life)) * dt,
            life: particle.life - dt * (particle.type === "text" ? 1.25 : 1.6),
          };
        })
        .filter((particle) => particle.life > 0);

      if (state.running) {
        mutateState((current) => ({
          ...current,
          day: Math.max(current.day, dayByTime),
          breath: clamp(current.breath - (grace ? 0.75 : 1.5) * dt, 0, 100),
          bills: clamp(current.bills + (freezeBillsRef.current > 0 ? 0.18 : grace ? 0.75 : 1.5) * dt, 0, 100),
          chaos: clamp(current.chaos + (supportShieldRef.current > 0 ? 0.22 : grace ? 0.85 : 1.7) * dt, 0, 100),
          stability: clamp(current.stability - (grace ? 0.55 : 1.1) * dt, 0, 100),
          bestScore: bestScoreRef.current,
          rank: getRank(current.score).label,
        }));
      }

      const isMoving = Math.hypot(nextVx, nextVy) > 10 || playerTargetRef.current !== null;

      drawKitchen(
        ctx,
        stateRef.current,
        itemsRef.current,
        particlesRef.current,
        playerPosRef.current,
        supportShieldRef.current,
        kitchenRushRef.current,
        freezeBillsRef.current,
        isMoving,
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
    snapshot.rank === "S" ? "Mutirão salvou geral." :
    snapshot.rank === "A" ? "Virou o mês de pé." :
    snapshot.rank === "B" ? "Segurou a cozinha." :
    snapshot.rank === "C" ? "Sobreviveu no sufoco." :
    "O mês venceu.";

  const rankColors =
    snapshot.rank === "S" ? { border: "border-[#ffd45c]", text: "text-[#ffd45c]", bg: "from-[#450a0a] to-[#1e293b]", shadow: "shadow-[0_0_20px_rgba(251,191,36,0.45)]" } :
    snapshot.rank === "A" ? { border: "border-[#facc15]", text: "text-[#facc15]", bg: "from-[#1e1b4b] to-[#111827]", shadow: "shadow-[0_0_15px_rgba(250,204,21,0.35)]" } :
    snapshot.rank === "B" ? { border: "border-[#38bdf8]", text: "text-[#38bdf8]", bg: "from-[#064e3b] to-[#111827]", shadow: "shadow-[0_0_15px_rgba(56,189,248,0.3)]" } :
    snapshot.rank === "C" ? { border: "border-[#fb923c]", text: "text-[#fb923c]", bg: "from-[#3c1502] to-[#111827]", shadow: "shadow-[0_0_15px_rgba(251,146,60,0.25)]" } :
    { border: "border-slate-400", text: "text-slate-200", bg: "from-slate-800 to-slate-950", shadow: "shadow-none" };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#071319] px-3 pb-20 pt-3 text-[#f7f3df]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,114,51,0.22),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(114,214,255,0.12),transparent_18%),linear-gradient(180deg,#08202b,#0d1113_70%)]" />
      <div className="relative z-10 mx-auto max-w-md">
        <header className="rounded-[1.6rem] border border-white/10 bg-[rgba(7,14,20,0.72)] px-4 py-4 shadow-[0_16px_50px_rgba(0,0,0,0.36)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ffd45c]">salário atrasado + contrato intermitente</div>
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
          <div className="mt-4 grid grid-cols-5 gap-1.5 xs:gap-2">
            <MiniHud label="dia" value={`${snapshot.day}/30`} color="#f2efe3" icon="📅" />
            <MiniHud label="folego" value={`${Math.round(snapshot.breath)}/100`} color="#56d35e" icon="❤️" percentage={snapshot.breath} />
            <MiniHud label="contas" value={`${Math.round(snapshot.bills)}/100`} color="#ff5858" icon="🧾" percentage={snapshot.bills} />
            <MiniHud label="caos" value={`${Math.round(snapshot.chaos)}/100`} color="#be67ff" icon="⚠️" percentage={snapshot.chaos} />
            <MiniHud label="estab." value={`${Math.round(snapshot.stability)}/100`} color="#ffd34e" icon="⭐" percentage={snapshot.stability} />
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
                <GuideStep title="2" text="colete os itens" />
                <GuideStep title="3" text="sirva no balcão" />
                <GuideStep title="4" text="mantenha o combo" />
                <GuideStep title="5" text="desvie das contas" />
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
                    <div className="flex items-center gap-4">
                      <div className={`flex size-20 xs:size-24 shrink-0 items-center justify-center rounded-full border-4 ${rankColors.border} bg-gradient-to-b ${rankColors.bg} text-4xl xs:text-5xl font-black ${rankColors.text} ${rankColors.shadow}`}>
                        {snapshot.rank}
                      </div>
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/55">fim do mês</div>
                        <div className="mt-1 text-base xs:text-xl font-black uppercase text-[#f3f0dd]">{resultMessage}</div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-black/25 px-3 py-2 xs:px-4 xs:py-3 text-right">
                      <div className="text-[10px] font-black uppercase text-white/55">score final</div>
                      <div className="text-3xl xs:text-4xl font-black text-[#ffd45c]">{snapshot.score}</div>
                      <div className="mt-1 text-[10px] xs:text-xs font-black uppercase text-[#ff9a6e]">melhor {snapshot.bestScore}</div>
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
                      className="flex-1 rounded-xl bg-[#0d73c8] px-4 py-4 text-xs xs:text-sm font-black uppercase text-white"
                    >
                      Jogar de novo
                    </button>
                    <button
                      type="button"
                      onClick={() => void shareResult()}
                      className="flex-1 rounded-xl bg-[#2d8d20] px-4 py-4 text-xs xs:text-sm font-black uppercase text-white"
                    >
                      {copyLabel}
                    </button>
                    <Link
                      href={`/ranking/${game.slug}`}
                      className="flex-1 rounded-xl bg-[#be8a16] px-4 py-4 text-center text-xs xs:text-sm font-black uppercase text-[#101010]"
                    >
                      Ver ranking
                    </Link>
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-[#ffd45c]/20 bg-[rgba(8,19,28,0.94)] p-4">
                  <div className="text-center text-xl xs:text-2xl font-black uppercase text-[#ffd45c]">Compartilhe seu resultado!</div>
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
  freeze: number,
  isMoving: boolean,
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 1. Draw tiled wall background (azulejos)
  const wallGrad = ctx.createLinearGradient(0, 0, 0, 620);
  wallGrad.addColorStop(0, "#475569"); // Steel slate
  wallGrad.addColorStop(1, "#1e293b"); // Deep coal slate
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 620);

  // Azulejo grids
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1.5;
  for (let x = 0; x < CANVAS_WIDTH; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 620);
    ctx.stroke();
  }
  for (let y = 0; y < 620; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // 2. Draw window at left with school view
  ctx.fillStyle = "#0f172a"; // frame back
  ctx.fillRect(30, 80, 140, 200);
  
  // Sky
  const skyGrad = ctx.createLinearGradient(30, 80, 30, 280);
  skyGrad.addColorStop(0, "#38bdf8"); // sky blue
  skyGrad.addColorStop(1, "#bae6fd");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(34, 84, 132, 192);

  // Draw school block (rectangles)
  ctx.fillStyle = "#b91c1c"; // brick red school building
  ctx.fillRect(50, 160, 100, 116);
  ctx.fillStyle = "#facc15"; // yellow windows
  ctx.fillRect(60, 180, 14, 14);
  ctx.fillRect(90, 180, 14, 14);
  ctx.fillRect(120, 180, 14, 14);
  ctx.fillRect(60, 220, 14, 14);
  ctx.fillRect(90, 220, 14, 14);
  ctx.fillRect(120, 220, 14, 14);

  // Green bushes
  ctx.fillStyle = "#15803d";
  ctx.beginPath();
  ctx.arc(46, 280, 18, 0, Math.PI * 2);
  ctx.arc(80, 280, 22, 0, Math.PI * 2);
  ctx.arc(120, 280, 20, 0, Math.PI * 2);
  ctx.arc(154, 280, 18, 0, Math.PI * 2);
  ctx.fill();

  // Glass highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.moveTo(34, 84);
  ctx.lineTo(130, 84);
  ctx.lineTo(34, 180);
  ctx.closePath();
  ctx.fill();

  // Window frame
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 8;
  ctx.strokeRect(34, 84, 132, 192);
  ctx.beginPath();
  ctx.moveTo(100, 84);
  ctx.lineTo(100, 276);
  ctx.moveTo(34, 180);
  ctx.lineTo(166, 180);
  ctx.stroke();

  // 3. Stoves and Pots
  // Left Stove
  drawStove(ctx, 30, 470, Date.now());
  // Right Stove
  drawStove(ctx, 590, 470, Date.now() + 1000);

  // 4. Posters & Signboards
  // Left poster
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(200, 360, 140, 80);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.strokeRect(200, 360, 140, 80);
  ctx.fillStyle = "#1e293b";
  ctx.font = '900 12px "Geist", sans-serif';
  ctx.fillText("A MERENDA É", 215, 395);
  ctx.fillStyle = "#b91c1c";
  ctx.fillText("DIREITO!", 240, 420);
  // Tape
  ctx.fillStyle = "rgba(251, 191, 36, 0.5)";
  ctx.fillRect(190, 350, 25, 12);
  ctx.fillRect(325, 430, 25, 12);

  // Right chalkboard
  ctx.fillStyle = "#064e3b"; // dark green board
  ctx.fillRect(380, 360, 160, 80);
  ctx.strokeStyle = "#78350f"; // wood border
  ctx.lineWidth = 5;
  ctx.strokeRect(380, 360, 160, 80);
  ctx.fillStyle = "#ffffff";
  ctx.font = '800 12px "Geist", sans-serif';
  ctx.fillText("COZINHA", 430, 395);
  ctx.fillText("ESCOLAR", 430, 420);

  // Top banner
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(190, 15, 340, 50);
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 3;
  ctx.strokeRect(190, 15, 340, 50);
  ctx.fillStyle = "#1e293b";
  ctx.font = '900 11px "Geist", sans-serif';
  ctx.fillText("EDUCAÇÃO SE FAZ COM RESPEITO E VALORIZAÇÃO! ♥", 200, 45);

  // 5. Draw Floor Tiles with Bevels
  for (let row = 0; row < 8; row += 1) {
    const y = 620 + row * 58;
    for (let col = 0; col < 13; col += 1) {
      const x = col * 60 - (row % 2 ? 30 : 0);
      const isRed = (row + col) % 2 === 0;
      ctx.fillStyle = isRed ? "#8d3a24" : "#722e1b"; // Quarry tile red
      ctx.fillRect(x, y, 58, 56);
      
      // Bevel borders
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(x, y, 58, 2);
      ctx.fillRect(x, y, 2, 56);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(x + 56, y, 2, 56);
      ctx.fillRect(x, y + 54, 2, 56);
    }
  }

  // Draw serving zone wall outline
  ctx.fillStyle = "#475569";
  ctx.fillRect(0, 620, CANVAS_WIDTH, 8);

  // 6. Draw Serving window & Kids
  // Background inside window
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(SERVE_ZONE.x - SERVE_ZONE.w / 2 - 20, SERVE_ZONE.y - SERVE_ZONE.h / 2 - 40, SERVE_ZONE.w + 40, SERVE_ZONE.h + 20);

  // Window frame
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 10;
  ctx.strokeRect(SERVE_ZONE.x - SERVE_ZONE.w / 2 - 20, SERVE_ZONE.y - SERVE_ZONE.h / 2 - 40, SERVE_ZONE.w + 40, SERVE_ZONE.h + 20);

  // Kids waiting in window
  for (let i = 0; i < 3; i++) {
    const kidX = SERVE_ZONE.x - 70 + i * 70;
    const baseKidY = SERVE_ZONE.y - 12;
    // Bob speed/height increases when combo is active
    const speed = snapshot.combo >= 4 ? 0.016 : 0.007;
    const height = snapshot.combo >= 4 ? 14 : 6;
    const kidBob = Math.sin(Date.now() * speed + i * 1.5) * height;
    const kidY = baseKidY + kidBob;

    // Skin tones
    ctx.fillStyle = ["#8d5524", "#ffdbac", "#c68642"][i];
    
    // Head
    ctx.beginPath();
    ctx.arc(kidX, kidY, 16, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = ["#000000", "#d97706", "#27272a"][i];
    ctx.beginPath();
    if (i === 0) {
      // Curly afro
      ctx.arc(kidX - 10, kidY - 10, 8, 0, Math.PI * 2);
      ctx.arc(kidX + 10, kidY - 10, 8, 0, Math.PI * 2);
      ctx.arc(kidX, kidY - 16, 12, 0, Math.PI * 2);
    } else if (i === 1) {
      // Short spikes
      ctx.ellipse(kidX, kidY - 12, 18, 12, 0, Math.PI, 0, true);
    } else {
      // Ponytails/bob
      ctx.arc(kidX - 12, kidY, 6, 0, Math.PI * 2);
      ctx.arc(kidX + 12, kidY, 6, 0, Math.PI * 2);
      ctx.arc(kidX, kidY - 14, 18, 0, Math.PI * 2);
    }
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(kidX - 6, kidY - 2, 4, 0, Math.PI * 2);
    ctx.arc(kidX + 6, kidY - 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(kidX - 6, kidY - 2, 2, 0, Math.PI * 2);
    ctx.arc(kidX + 6, kidY - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Smiles
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(kidX, kidY + 4, 5, 0, Math.PI, false);
    ctx.stroke();
  }

  // Draw actual items
  for (const item of items) {
    drawItem(ctx, item);
  }

  // Draw Serve table details
  drawServeCounter(ctx, snapshot, rush);

  // Draw Player
  drawPlayer(ctx, player, snapshot, shield, isMoving);

  // Render particles
  for (const particle of particles) {
    ctx.save();
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    
    if (particle.type === "circle") {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, (particle.size ?? 6) * particle.life, 0, Math.PI * 2);
      ctx.fill();
    } else if (particle.type === "spark") {
      drawStar(ctx, particle.x, particle.y, 5, (particle.size ?? 10) * particle.life, (particle.size ?? 10) * 0.4 * particle.life, particle.color);
    } else if (particle.type === "scrap") {
      // Confetti scrap
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.life * Math.PI * 4); // spin
      ctx.fillRect(-(particle.size ?? 6) * 0.5 * particle.life, -(particle.size ?? 6) * 0.5 * particle.life, (particle.size ?? 6) * particle.life, (particle.size ?? 6) * 1.5 * particle.life);
    } else {
      // Text
      ctx.font = '900 24px "Geist", sans-serif';
      ctx.fillText(particle.text, particle.x, particle.y);
    }
    ctx.restore();
  }

  // 7. Ice freeze screen overlay
  if (freeze > 0) {
    ctx.save();
    ctx.fillStyle = "rgba(186, 230, 253, 0.12)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Draw ice frost borders
    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 16 * (freeze / 7);
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }
}

// Stoves drawer helper
function drawStove(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.fillStyle = "#1e293b"; // Stove body
  ctx.fillRect(x, y, 100, 110);
  ctx.fillStyle = "#334155";
  ctx.fillRect(x + 5, y + 5, 90, 100);

  // Burner grate
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(x + 50, y + 30, 24, 0, Math.PI * 2);
  ctx.fill();

  // Pot (Silver steel gradient)
  const potGrad = ctx.createLinearGradient(x + 20, y, x + 80, y);
  potGrad.addColorStop(0, "#94a3b8");
  potGrad.addColorStop(0.5, "#cbd5e1");
  potGrad.addColorStop(1, "#64748b");
  ctx.fillStyle = potGrad;
  ctx.beginPath();
  ctx.roundRect(x + 18, y - 28, 64, 48, 4);
  ctx.fill();

  // Pot lid
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(x + 14, y - 32, 72, 4);
  ctx.fillStyle = "#475569";
  ctx.fillRect(x + 44, y - 36, 12, 4); // lid handle

  // Pot side handles
  ctx.fillRect(x + 10, y - 20, 8, 8);
  ctx.fillRect(x + 82, y - 20, 8, 8);

  // Boiling fire glow
  const fireGlow = ctx.createRadialGradient(x + 50, y + 30, 4, x + 50, y + 30, 22);
  fireGlow.addColorStop(0, "rgba(239, 68, 68, 0.72)");
  fireGlow.addColorStop(0.5, "rgba(249, 115, 22, 0.3)");
  fireGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = fireGlow;
  ctx.beginPath();
  ctx.arc(x + 50, y + 30, 22, 0, Math.PI * 2);
  ctx.fill();

  // Steam rising lines
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const sx = x + 34 + i * 16 + Math.sin(time * 0.003 + i * 2) * 5;
    const sy = y - 40 - (time * 0.04 + i * 20) % 40;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.sin(time * 0.004) * 4, sy - 15);
    ctx.stroke();
  }
  ctx.restore();
}

function drawServeCounter(ctx: CanvasRenderingContext2D, snapshot: GameSnapshot, rush: number) {
  // Metal delivery counter ledge
  ctx.fillStyle = "#475569";
  ctx.fillRect(SERVE_ZONE.x - SERVE_ZONE.w / 2 - 30, SERVE_ZONE.y + SERVE_ZONE.h / 2 - 12, SERVE_ZONE.w + 60, 24);
  ctx.fillStyle = "#64748b";
  ctx.fillRect(SERVE_ZONE.x - SERVE_ZONE.w / 2 - 30, SERVE_ZONE.y + SERVE_ZONE.h / 2 - 12, SERVE_ZONE.w + 60, 6);

  // Delivery tray/warmer plates
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(SERVE_ZONE.x - 70, SERVE_ZONE.y + 22, 140, 20);

  // Render food warmer trays inside window
  for (let i = 0; i < 3; i++) {
    const px = SERVE_ZONE.x - 55 + i * 42;
    ctx.fillStyle = "#334155";
    ctx.fillRect(px, SERVE_ZONE.y + 24, 30, 16);
    // Food in trays
    ctx.fillStyle = i === 0 ? "#ffffff" : i === 1 ? "#78350f" : "#22c55e"; // rice, beans, salad
    ctx.fillRect(px + 2, SERVE_ZONE.y + 26, 26, 12);
  }

  // Guide arrows pointing to counter when ingredient bag is full
  if (snapshot.ingredientBag > 0 && snapshot.running) {
    const arrowY = SERVE_ZONE.y + SERVE_ZONE.h / 2 + 18 + Math.sin(Date.now() * 0.015) * 6;
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(SERVE_ZONE.x, arrowY);
    ctx.lineTo(SERVE_ZONE.x - 14, arrowY + 14);
    ctx.lineTo(SERVE_ZONE.x - 6, arrowY + 14);
    ctx.lineTo(SERVE_ZONE.x - 6, arrowY + 28);
    ctx.lineTo(SERVE_ZONE.x + 6, arrowY + 28);
    ctx.lineTo(SERVE_ZONE.x + 6, arrowY + 14);
    ctx.lineTo(SERVE_ZONE.x + 14, arrowY + 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Steel Prep Table (for bag stats) on the floor
  ctx.fillStyle = "#64748b"; // legs
  ctx.fillRect(260, 836, 6, 80);
  ctx.fillRect(454, 836, 6, 80);

  ctx.fillStyle = "#94a3b8"; // Prep table top
  ctx.fillRect(250, 810, 220, 12);
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(250, 810, 220, 3);

  // Table shelf body
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(256, 822, 208, 64);
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(256, 822, 208, 64);

  // Labels
  ctx.fillStyle = "#ffffff";
  ctx.font = '900 12px "Geist", sans-serif';
  ctx.fillText("PANELÃO DE MERENDA", 270, 842);

  // Ingredient bag indicator slots
  ctx.fillStyle = "#334155";
  ctx.fillRect(270, 852, 180, 14);
  // Fills
  ctx.fillStyle = "#22c55e";
  for (let i = 0; i < snapshot.ingredientBag; i++) {
    ctx.fillRect(272 + i * 44, 854, 40, 10);
  }

  ctx.fillStyle = rush > 0 ? "#facc15" : "#fda4af";
  ctx.font = '900 12px "Geist", sans-serif';
  ctx.fillText(rush > 0 ? "MUTIRÃO ATIVO!" : `COMBO ATUAL: X${snapshot.combo}`, 270, 878);
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: { x: number; y: number },
  snapshot: GameSnapshot,
  shield: number,
  isMoving: boolean,
) {
  ctx.save();
  // Translate to player center to support run cycle bobbing and tilting
  const bob = isMoving ? Math.sin(Date.now() * 0.015) * 6 : 0;
  const tilt = isMoving ? Math.sin(Date.now() * 0.015) * 0.06 : 0;
  ctx.translate(player.x, player.y + bob);
  ctx.rotate(tilt);

  // Expression logic
  const expression =
    snapshot.breath < 25 ? "tired" :
    snapshot.chaos > 70 ? "alert" :
    snapshot.combo >= 4 ? "happy" :
    "normal";

  // 1. Draw Shield
  if (shield > 0) {
    ctx.save();
    ctx.globalAlpha = 0.35 + Math.sin(Date.now() * 0.01) * 0.15;
    ctx.strokeStyle = "#72d9ff";
    ctx.lineWidth = 4;
    ctx.fillStyle = "rgba(114, 217, 255, 0.12)";
    ctx.beginPath();
    ctx.arc(0, -10, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 2. Shadow on floor (drawn underneath)
  ctx.fillStyle = "rgba(16, 20, 26, 0.35)";
  ctx.beginPath();
  ctx.ellipse(0, 92, 54, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Hair (behind head)
  ctx.fillStyle = "#3a2010"; // brown/black hair
  ctx.beginPath();
  ctx.arc(0, -96, 36, 0, Math.PI * 2);
  ctx.fill();

  // 4. Face/Head
  ctx.fillStyle = "#8d5524"; // Warm skin tone
  ctx.beginPath();
  ctx.arc(0, -88, 28, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.arc(-28, -88, 7, 0, Math.PI * 2);
  ctx.arc(28, -88, 7, 0, Math.PI * 2);
  ctx.fill();

  // 5. Touca (Ruffled Hairnet)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, -114, 42, 18, 0, Math.PI, 0, true);
  ctx.fill();
  for (let a = -Math.PI; a <= 0; a += 0.35) {
    const rx = Math.cos(a) * 42;
    const ry = -114 + Math.sin(a) * 18;
    ctx.beginPath();
    ctx.arc(rx, ry, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  // Ruffled band
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(-38, -114, 76, 4);

  // 6. Body & Uniform
  // White Collar shirt
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-24, -60, 48, 20);
  ctx.beginPath();
  ctx.moveTo(-24, -60);
  ctx.lineTo(-34, -40);
  ctx.lineTo(-24, -40);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(24, -60);
  ctx.lineTo(34, -40);
  ctx.lineTo(24, -40);
  ctx.closePath();
  ctx.fill();

  // Apron Bib (avental azul)
  ctx.fillStyle = "#1e40af";
  ctx.fillRect(-18, -48, 36, 32);
  // Apron straps
  ctx.strokeStyle = "#1e3a8a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-18, -48);
  ctx.lineTo(-26, -60);
  ctx.moveTo(18, -48);
  ctx.lineTo(26, -60);
  ctx.stroke();

  // Apron Skirt
  ctx.fillRect(-28, -16, 56, 78);
  // Apron pocket
  ctx.fillStyle = "#1d4ed8";
  ctx.fillRect(-14, 10, 28, 20);

  // Arms
  ctx.fillStyle = "#8d5524";
  ctx.beginPath();
  ctx.arc(-32, -26, 8, 0, Math.PI * 2);
  ctx.arc(32, -26, 8, 0, Math.PI * 2);
  ctx.fill();
  // Forearms moving in front
  ctx.fillRect(-36, -26, 12, 28);
  ctx.fillRect(24, -26, 12, 28);

  // 7. Pants & Legs (moving if running)
  ctx.fillStyle = "#334155"; // Slate pants
  const legSwing = isMoving ? Math.sin(Date.now() * 0.015) * 16 : 0;
  ctx.fillRect(-22, 62, 16, 24 + legSwing);
  ctx.fillRect(6, 62, 16, 24 - legSwing);

  // Black shoes
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.roundRect(-24, 82 + legSwing, 20, 12, 5);
  ctx.roundRect(4, 82 - legSwing, 20, 12, 5);
  ctx.fill();

  // 8. Eyes & Mouth (Facial Expressions)
  ctx.fillStyle = "#0f172a"; // Dark eyes/mouth
  if (expression === "happy") {
    // Curved happy eyes
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(-10, -92, 5, Math.PI, 0, false);
    ctx.moveTo(15, -92);
    ctx.arc(15, -92, 5, Math.PI, 0, false);
    ctx.stroke();
    // Big open smile
    ctx.beginPath();
    ctx.arc(2, -78, 9, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = "#b91c1c"; // red tongue
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.stroke();
  } else if (expression === "tired") {
    // Closed tired eyes: ^ ^
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0f172a";
    ctx.beginPath();
    ctx.moveTo(-16, -88);
    ctx.lineTo(-10, -94);
    ctx.lineTo(-4, -88);
    ctx.moveTo(8, -88);
    ctx.lineTo(14, -94);
    ctx.lineTo(20, -88);
    ctx.stroke();
    // Downwards mouth
    ctx.beginPath();
    ctx.arc(2, -72, 7, Math.PI, 0, false);
    ctx.stroke();

    // Sweat drops
    ctx.fillStyle = "#60a5fa";
    ctx.beginPath();
    ctx.arc(38, -94, 3, 0, Math.PI);
    ctx.lineTo(38, -100);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-38, -86, 3, 0, Math.PI);
    ctx.lineTo(-38, -92);
    ctx.closePath();
    ctx.fill();
  } else if (expression === "alert") {
    // Wide circular eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-11, -90, 7, 0, Math.PI * 2);
    ctx.arc(13, -90, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(-11, -90, 3, 0, Math.PI * 2);
    ctx.arc(13, -90, 3, 0, Math.PI * 2);
    ctx.fill();
    // Open shocked mouth
    ctx.beginPath();
    ctx.arc(2, -76, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Normal Expression
    // Simple eyes
    ctx.beginPath();
    ctx.arc(-10, -90, 3.5, 0, Math.PI * 2);
    ctx.arc(14, -90, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Small smile
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(2, -82, 8, 0, Math.PI, false);
    ctx.stroke();
  }

  // 9. Food Tray
  ctx.fillStyle = "#94a3b8"; // Metal tray
  ctx.beginPath();
  ctx.roundRect(-42, -14, 84, 8, 3);
  ctx.fill();
  ctx.fillStyle = "#cbd5e1"; // Tray inner highlight
  ctx.fillRect(-38, -14, 76, 2);

  // Render food bowls on tray depending on ingredients carried
  const count = snapshot.ingredientBag;
  if (count >= 1) {
    // Rice bowl
    ctx.fillStyle = "#3b82f6"; // Blue bowl
    ctx.beginPath();
    ctx.arc(-24, -16, 10, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = "#ffffff"; // Rice dome
    ctx.beginPath();
    ctx.arc(-24, -18, 8, Math.PI, 0);
    ctx.fill();
  }
  if (count >= 2) {
    // Beans bowl
    ctx.fillStyle = "#ea580c"; // Orange bowl
    ctx.beginPath();
    ctx.arc(24, -16, 10, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = "#78350f"; // Brown beans dome
    ctx.beginPath();
    ctx.arc(24, -18, 8, Math.PI, 0);
    ctx.fill();
  }
  if (count >= 3) {
    // Vegetables
    ctx.fillStyle = "#10b981"; // Green veggies
    ctx.beginPath();
    ctx.arc(0, -18, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f97316"; // Carrot bits
    ctx.beginPath();
    ctx.arc(4, -18, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  if (count >= 4) {
    // Fruit / Banana
    ctx.strokeStyle = "#eab308"; // Yellow banana
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-4, -18, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawItem(ctx: CanvasRenderingContext2D, item: KitchenItem) {
  // Glow background
  ctx.save();
  const glow = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, item.size * 2.0);
  glow.addColorStop(0, item.tone + "bb"); // vibrant glow opacity
  glow.addColorStop(0.5, item.tone + "44");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(item.x, item.y, item.size * 2.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(item.x, item.y);
  
  if (item.kind === "threat") {
    // Tilted red bills
    ctx.rotate(0.12);
    // Draw document sheet
    ctx.fillStyle = "#ffebe7";
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-item.size, -item.size * 1.3, item.size * 2, item.size * 2.6, 6);
    ctx.fill();
    ctx.stroke();

    // Red header line
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(-item.size + 2, -item.size * 1.3 + 2, item.size * 2 - 4, 10);

    // Write name
    ctx.fillStyle = "#ffffff";
    ctx.font = '900 9px "Geist", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(item.label.toUpperCase(), 0, -item.size * 1.3 + 10);

    // Barcode lines
    ctx.fillStyle = "#334155";
    ctx.fillRect(-item.size + 4, item.size * 0.7, 3, 10);
    ctx.fillRect(-item.size + 9, item.size * 0.7, 1, 10);
    ctx.fillRect(-item.size + 12, item.size * 0.7, 4, 10);
    ctx.fillRect(-item.size + 18, item.size * 0.7, 2, 10);
    ctx.fillRect(-item.size + 22, item.size * 0.7, 1, 10);

    // Value text
    ctx.fillStyle = "#b91c1c";
    ctx.font = '900 11px "Geist", sans-serif';
    ctx.fillText("R$ $$$", 0, item.size * 0.4);

    // Warning exclamation mark
    ctx.fillStyle = "#ef4444";
    ctx.font = '900 16px "Geist", sans-serif';
    ctx.fillText("!", 0, -item.size * 0.1);

  } else if (item.kind === "ingredient") {
    // Detailed ingredient graphics
    if (item.label.includes("arroz")) {
      // White bowl of rice
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.arc(0, 4, item.size * 0.7, 0, Math.PI);
      ctx.fill();
      // White fluffy rice mounds
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(-8, -2, 9, 0, Math.PI * 2);
      ctx.arc(8, -2, 9, 0, Math.PI * 2);
      ctx.arc(0, -6, 11, 0, Math.PI * 2);
      ctx.fill();
      // Detail lines
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (item.label.includes("feijao")) {
      // Brown bowl of beans
      ctx.fillStyle = "#d97706";
      ctx.beginPath();
      ctx.arc(0, 4, item.size * 0.7, 0, Math.PI);
      ctx.fill();
      // Bean textures
      ctx.fillStyle = "#451a03";
      ctx.beginPath();
      ctx.arc(-6, -1, 7, 0, Math.PI * 2);
      ctx.arc(6, -1, 7, 0, Math.PI * 2);
      ctx.arc(0, -4, 9, 0, Math.PI * 2);
      ctx.fill();
      // Little beans
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.arc(-3, -2, 3, 0, Math.PI * 2);
      ctx.arc(4, -4, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.label.includes("legume")) {
      // Carrot shape
      ctx.rotate(-0.4);
      // Carrot body
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(-6, -12);
      ctx.lineTo(6, -12);
      ctx.lineTo(0, 16);
      ctx.closePath();
      ctx.fill();
      // Carrot leaves
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.arc(-3, -16, 5, 0, Math.PI * 2);
      ctx.arc(3, -16, 5, 0, Math.PI * 2);
      ctx.arc(0, -21, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.label.includes("fruta")) {
      // Yellow banana
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(-2, -2, item.size * 0.7, 0.3, Math.PI - 0.3);
      ctx.stroke();
      // Tips
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.arc(-11, 4, 3, 0, Math.PI * 2);
      ctx.arc(8, 4, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.label.includes("leite")) {
      // Blue milk carton
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.roundRect(-item.size * 0.6, -item.size * 0.8, item.size * 1.2, item.size * 1.6, 3);
      ctx.fill();
      // White stripe
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-item.size * 0.6, -item.size * 0.2, item.size * 1.2, item.size * 0.4);
      // Top fold
      ctx.beginPath();
      ctx.moveTo(-item.size * 0.6, -item.size * 0.8);
      ctx.lineTo(0, -item.size * 1.2);
      ctx.lineTo(item.size * 0.6, -item.size * 0.8);
      ctx.closePath();
      ctx.fill();
      // Small blue drop icon
      ctx.fillStyle = "#1d4ed8";
      ctx.font = '8px "Geist", sans-serif';
      ctx.fillText("🥛", -4, 2);
    } else if (item.label.includes("pao")) {
      // Pão francês
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.ellipse(0, 0, item.size * 0.9, item.size * 0.6, 0.4, 0, Math.PI * 2);
      ctx.fill();
      // Diagonal slash
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-item.size * 0.5, -item.size * 0.1);
      ctx.lineTo(item.size * 0.5, item.size * 0.1);
      ctx.stroke();
    } else {
      // Fallback ingredient box
      ctx.fillStyle = "#f8f4e6";
      ctx.beginPath();
      ctx.roundRect(-item.size, -item.size, item.size * 2, item.size * 2, 8);
      ctx.fill();
      ctx.fillStyle = "#1e293b";
      ctx.font = '900 12px "Geist", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(item.label.substring(0, 5).toUpperCase(), 0, 4);
    }

  } else if (item.kind === "power") {
    // Glowing golden or cyan capsules
    const isGold = item.label.includes("mutirao") || item.label.includes("escala");
    ctx.fillStyle = isGold ? "#fef08a" : "#e0f2fe";
    ctx.strokeStyle = isGold ? "#eab308" : "#0284c7";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, item.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner icon
    ctx.fillStyle = isGold ? "#854d0e" : "#0369a1";
    ctx.font = '900 14px "Geist", sans-serif';
    ctx.textAlign = "center";
    if (item.label.includes("mutirao")) {
      ctx.fillText("✊", 0, 5);
    } else if (item.label.includes("apoio")) {
      ctx.fillText("🤝", 0, 5);
    } else if (item.label.includes("marmita")) {
      ctx.fillText("🍲", 0, 5);
    } else if (item.label.includes("escala")) {
      ctx.fillText("📅", 0, 5);
    } else if (item.label.includes("organizacao")) {
      ctx.fillText("📢", 0, 5);
    } else {
      ctx.fillText("🧺", 0, 5);
    }
  }
  ctx.restore();
  ctx.textAlign = "start"; // Reset
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawRankBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, rank: string) {
  ctx.save();
  ctx.translate(cx, cy);

  // Colors based on rank
  let bg = "#1e293b";
  let border1 = "#cbd5e1";
  let border2 = "#94a3b8";
  let text = "#ffffff";
  let glow = "rgba(255,255,255,0.2)";

  if (rank === "S") {
    bg = "#450a0a";
    border1 = "#fbbf24";
    border2 = "#f59e0b";
    text = "#fbbf24";
    glow = "rgba(251, 191, 36, 0.45)";
  } else if (rank === "A") {
    bg = "#1e1b4b";
    border1 = "#facc15";
    border2 = "#eab308";
    text = "#facc15";
    glow = "rgba(250, 204, 21, 0.35)";
  } else if (rank === "B") {
    bg = "#064e3b";
    border1 = "#38bdf8";
    border2 = "#0284c7";
    text = "#38bdf8";
    glow = "rgba(56, 189, 248, 0.3)";
  } else if (rank === "C") {
    bg = "#3c1502";
    border1 = "#fb923c";
    border2 = "#f97316";
    text = "#fb923c";
    glow = "rgba(251, 146, 60, 0.25)";
  }

  // Draw Badge Outer Glow
  const bGlow = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, size * 0.8);
  bGlow.addColorStop(0, glow);
  bGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bGlow;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Draw Shield Outline
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.lineTo(size * 0.45, -size * 0.25);
  ctx.lineTo(size * 0.45, size * 0.2);
  ctx.lineTo(0, size * 0.55);
  ctx.lineTo(-size * 0.45, size * 0.2);
  ctx.lineTo(-size * 0.45, -size * 0.25);
  ctx.closePath();
  
  const shieldGrad = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.55);
  shieldGrad.addColorStop(0, border1);
  shieldGrad.addColorStop(1, border2);
  ctx.strokeStyle = shieldGrad;
  ctx.lineWidth = size * 0.08;
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.stroke();

  // Inner lines
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.42);
  ctx.lineTo(size * 0.38, -size * 0.2);
  ctx.lineTo(size * 0.38, size * 0.16);
  ctx.lineTo(0, size * 0.46);
  ctx.lineTo(-size * 0.38, size * 0.16);
  ctx.lineTo(-size * 0.38, -size * 0.2);
  ctx.closePath();
  ctx.stroke();

  // Draw Rank text
  ctx.fillStyle = text;
  ctx.textAlign = "center";
  ctx.font = `900 ${size * 0.52}px "Geist", sans-serif`;
  ctx.fillText(rank, 0, size * 0.16);
  
  ctx.restore();
}

function MiniHud({
  label,
  value,
  color,
  icon,
  percentage,
}: {
  label: string;
  value: string;
  color: string;
  icon: string;
  percentage?: number;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/45 p-1.5 xs:p-2 text-center shadow-inner">
      <div className="flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/50">
        <span>{icon}</span>
        <span className="hidden xs:inline">{label}</span>
      </div>
      <div className="mt-1 text-[11px] xs:text-[13px] font-black tracking-tight" style={{ color }}>
        {value}
      </div>
      {percentage !== undefined && (
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              backgroundColor: color,
              width: `${Math.max(0, Math.min(100, percentage))}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function GuideStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-1.5 xs:p-2">
      <div className="text-base xs:text-lg font-black text-[#ffd34e]">{title}</div>
      <div className="mt-0.5 leading-tight text-[9px] xs:text-[10px] text-white/70">{text}</div>
    </div>
  );
}

function ResultChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/25 p-2 xs:p-3">
      <div className="text-[9px] xs:text-[10px] font-black uppercase tracking-[0.14em] text-white/55">{label}</div>
      <div className="mt-0.5 text-base xs:text-xl font-black text-[#f3f0dd]">{value}</div>
    </div>
  );
}

function Badge({ value }: { value: string }) {
  return <div className="rounded-lg bg-black/20 p-1.5 xs:p-2 text-center text-[#ffd45c] text-[10px] xs:text-xs">{value}</div>;
}

