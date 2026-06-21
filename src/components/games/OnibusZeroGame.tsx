"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameDefinition } from "@/lib/gameRegistry";
import type { ScoreSubmission } from "@/lib/score";

type RoadItemKind = "passenger" | "obstacle" | "checkpoint";

type RoadItem = {
  id: number;
  kind: RoadItemKind;
  lane: number;
  y: number;
  label: string;
  hit: boolean;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  vy: number;
  life: number;
  text: string;
  tone: "good" | "bad" | "fare";
};

type GameSnapshot = {
  score: number;
  passengers: number;
  combo: number;
  maxCombo: number;
  fare: number;
  districts: number;
  delay: number;
  timeLeft: number;
  bestScore: number;
  rank: string;
  running: boolean;
  finished: boolean;
};

type AudioTone = "pickup" | "hit" | "fare" | "horn";

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 1180;
const ROUND_DURATION_MS = 60000;
const LANES = [180, 360, 540];
const BEST_SCORE_KEY = "abandonada:onibus-zero:best-score";
const PLAYER_NAME_KEY = "abandonada:onibus-zero:player-name";
const START_FARE = 5;

const rankTable = [
  { min: 0, label: "D", message: "Linha travada." },
  { min: 1200, label: "C", message: "Rota funcionando." },
  { min: 2900, label: "B", message: "Cidade conectada." },
  { min: 5000, label: "A", message: "Tarifa popular." },
  { min: 7400, label: "S", message: "Onibus Zero em movimento." },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getRank(score: number) {
  return [...rankTable].reverse().find((rank) => score >= rank.min) ?? rankTable[0];
}

function createInitialSnapshot(bestScore = 0): GameSnapshot {
  return {
    score: 0,
    passengers: 0,
    combo: 0,
    maxCombo: 0,
    fare: START_FARE,
    districts: 0,
    delay: 6,
    timeLeft: ROUND_DURATION_MS / 1000,
    bestScore,
    rank: "D",
    running: false,
    finished: false,
  };
}

function formatFare(value: number) {
  return value.toFixed(2).replace(".", ",");
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
  bg.addColorStop(0, "#11251f");
  bg.addColorStop(0.52, "#14342d");
  bg.addColorStop(1, "#101413");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,209,92,0.12)";
  ctx.fillRect(70, 78, 940, 1194);
  ctx.strokeStyle = "#ffd15c";
  ctx.lineWidth = 10;
  ctx.strokeRect(70, 78, 940, 1194);

  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 76px "Geist", sans-serif';
  ctx.fillText("Corrida do", 112, 205);
  ctx.fillText("Onibus Zero", 112, 292);

  ctx.fillStyle = "#ffd15c";
  ctx.font = '900 292px "Geist", sans-serif';
  ctx.fillText(stats.rank, 112, 615);

  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 76px "Geist", sans-serif';
  ctx.fillText(`${stats.score} pts`, 112, 752);

  ctx.fillStyle = "#41d99a";
  ctx.font = '900 48px "Geist", sans-serif';
  ctx.fillText(`Tarifa R$ ${formatFare(stats.fare)}`, 112, 840);

  ctx.fillStyle = "rgba(255,255,255,0.09)";
  ctx.fillRect(112, 900, 856, 180);
  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 44px "Geist", sans-serif';
  ctx.fillText(`${stats.passengers}`, 150, 990);
  ctx.fillText(`${stats.districts}`, 430, 990);
  ctx.fillText(`${stats.maxCombo}x`, 710, 990);
  ctx.fillStyle = "#a7b8a9";
  ctx.font = '700 26px "Geist", sans-serif';
  ctx.fillText("pessoas", 150, 1034);
  ctx.fillText("bairros", 430, 1034);
  ctx.fillText("combo", 710, 1034);

  ctx.fillStyle = "#ffd15c";
  ctx.font = '900 42px "Geist", sans-serif';
  ctx.fillText("JOGUE TAMBÉM: ABANDONADA GAMES", 112, 1160);
  ctx.fillStyle = "#ff5e2f";
  ctx.font = '900 24px "Geist", sans-serif';
  ctx.fillText("PRÉ-CAMPANHA ALEXANDRE VR ABANDONADA - DEPUTADO ESTADUAL", 112, 1215);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return null;
  return new File([blob], "onibus-zero-resultado.png", { type: "image/png" });
}

export function OnibusZeroGame({ game }: { game: GameDefinition }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const startAtRef = useRef(0);
  const lastTickRef = useRef(0);
  const laneRef = useRef(1);
  const targetLaneRef = useRef(1);
  const busXRef = useRef(LANES[1]);
  const itemSeqRef = useRef(0);
  const roadOffsetRef = useRef(0);
  const nextPassengerAtRef = useRef(0);
  const nextObstacleAtRef = useRef(1800);
  const nextCheckpointAtRef = useRef(7200);
  const hornCooldownRef = useRef(0);
  const hornPulseRef = useRef(0);
  const shakeRef = useRef(0);
  const roadItemsRef = useRef<RoadItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
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
  const [toast, setToast] = useState("Linha voando!");
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
        tone === "pickup"
          ? { frequency: 700, duration: 0.08, gain: 0.04, type: "square" as OscillatorType }
          : tone === "fare"
            ? { frequency: 920, duration: 0.12, gain: 0.05, type: "triangle" as OscillatorType }
            : tone === "horn"
              ? { frequency: 360, duration: 0.18, gain: 0.06, type: "sawtooth" as OscillatorType }
              : { frequency: 150, duration: 0.14, gain: 0.05, type: "sawtooth" as OscillatorType };
      oscillator.type = config.type;
      oscillator.frequency.value = config.frequency;
      gain.gain.value = config.gain;
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);
      oscillator.stop(ctx.currentTime + config.duration);
    } catch {}
  }, []);

  const setQuickToast = useCallback((message: string) => {
    setToast(message);
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

  const addParticle = useCallback((text: string, x: number, y: number, tone: Particle["tone"]) => {
    particlesRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      vy: tone === "bad" ? -18 : -42,
      life: 1,
      text,
      tone,
    });
  }, []);

  const resetRound = useCallback(() => {
    submittedRef.current = false;
    laneRef.current = 1;
    targetLaneRef.current = 1;
    busXRef.current = LANES[1];
    itemSeqRef.current = 0;
    roadOffsetRef.current = 0;
    nextPassengerAtRef.current = 400;
    nextObstacleAtRef.current = 2600;
    nextCheckpointAtRef.current = 6200;
    hornCooldownRef.current = 0;
    hornPulseRef.current = 0;
    shakeRef.current = 0;
    roadItemsRef.current = [];
    particlesRef.current = [];
    const next = { ...createInitialSnapshot(bestScoreRef.current), running: true };
    stateRef.current = next;
    setSnapshot(next);
    startAtRef.current = performance.now();
    lastTickRef.current = performance.now();
  }, []);

  const spawnItem = useCallback((kind: RoadItemKind, elapsed: number) => {
    itemSeqRef.current += 1;
    const lane = Math.floor(Math.random() * 3);
    const label =
      kind === "checkpoint"
        ? game.powerUps[Math.floor(Math.random() * game.powerUps.length)]
        : kind === "obstacle"
          ? game.obstacles[Math.floor(Math.random() * game.obstacles.length)]
          : "ponto cheio";
    roadItemsRef.current.push({
      id: itemSeqRef.current + Math.floor(elapsed),
      kind,
      lane,
      y: -80,
      label,
      hit: false,
    });
  }, [game.obstacles, game.powerUps]);

  const finishRound = useCallback(() => {
    if (stateRef.current.finished) return;
    const rank = getRank(stateRef.current.score).label;
    mutateState((current) => ({
      ...current,
      running: false,
      finished: true,
      rank,
      bestScore: bestScoreRef.current,
      timeLeft: Math.max(0, current.timeLeft),
    }));
    setQuickToast(rank === "D" ? "Linha travada." : "Onibus lotado de esperanca!");
  }, [mutateState, setQuickToast]);

  const triggerHorn = useCallback(() => {
    if (!stateRef.current.running || hornCooldownRef.current > 0) return;
    hornCooldownRef.current = 4.5;
    hornPulseRef.current = 0.75;
    playTone("horn");
    setQuickToast("Linha voando!");

    const busX = busXRef.current;
    const hitIds = new Set<number>();
    for (const item of roadItemsRef.current) {
      if (item.hit || item.kind !== "passenger") continue;
      const dx = Math.abs(LANES[item.lane] - busX);
      const dy = Math.abs(item.y - 890);
      if (dx < 220 && dy < 230) {
        hitIds.add(item.id);
        mutateState((current) => {
          const combo = current.combo + 1;
          const scoreGain = 130 + combo * 18;
          return {
            ...current,
            passengers: current.passengers + 1,
            combo,
            maxCombo: Math.max(current.maxCombo, combo),
            score: current.score + scoreGain,
            delay: clamp(current.delay - 1.2, 0, 100),
            rank: getRank(current.score + scoreGain).label,
          };
        });
        addParticle("Pegou geral!", LANES[item.lane] - 70, item.y, "good");
      }
    }
    if (hitIds.size > 0) {
      roadItemsRef.current = roadItemsRef.current.map((item) =>
        hitIds.has(item.id) ? { ...item, hit: true } : item,
      );
    }
  }, [addParticle, mutateState, playTone, setQuickToast]);

  const changeLane = useCallback((direction: -1 | 1) => {
    targetLaneRef.current = clamp(targetLaneRef.current + direction, 0, 2);
  }, []);

  const submitScore = useCallback(async (stats: GameSnapshot, finalName: string) => {
    const payload: ScoreSubmission = {
      slug: game.slug,
      player: finalName || "Anon",
      score: stats.score,
      durationMs: ROUND_DURATION_MS,
      eventsHandled: Math.max(1, stats.passengers + stats.districts),
    };

    await fetch("/api/score/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }, [game.slug]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") changeLane(-1);
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") changeLane(1);
      if (event.key === " ") triggerHorn();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeLane, triggerHorn]);

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
      const speed = 390 + phase * 230 + stateRef.current.combo * 2.4;
      const timeLeft = clamp((ROUND_DURATION_MS - elapsed) / 1000, 0, ROUND_DURATION_MS / 1000);

      if (stateRef.current.running) {
        if (elapsed >= nextPassengerAtRef.current) {
          spawnItem("passenger", elapsed);
          nextPassengerAtRef.current = elapsed + clamp(1180 - phase * 360, 660, 1180);
        }
        if (elapsed >= nextObstacleAtRef.current) {
          spawnItem("obstacle", elapsed);
          nextObstacleAtRef.current = elapsed + clamp(2150 - phase * 520, 980, 2150);
        }
        if (elapsed >= nextCheckpointAtRef.current) {
          spawnItem("checkpoint", elapsed);
          nextCheckpointAtRef.current = elapsed + 7200;
        }
      }

      if (hornCooldownRef.current > 0) hornCooldownRef.current = Math.max(0, hornCooldownRef.current - dt);
      if (hornPulseRef.current > 0) hornPulseRef.current = Math.max(0, hornPulseRef.current - dt);
      if (shakeRef.current > 0) shakeRef.current = Math.max(0, shakeRef.current - dt);

      laneRef.current += (targetLaneRef.current - laneRef.current) * 0.18;
      busXRef.current += (LANES[targetLaneRef.current] - busXRef.current) * 0.18;
      roadOffsetRef.current = (roadOffsetRef.current + speed * dt) % 160;

      roadItemsRef.current = roadItemsRef.current
        .map((item) => ({ ...item, y: item.y + speed * dt }))
        .filter((item) => item.y < CANVAS_HEIGHT + 100 && !item.hit);

      const busLane = targetLaneRef.current;
      const hitIds = new Set<number>();
      for (const item of roadItemsRef.current) {
        if (item.hit || item.y < 810 || item.y > 970) continue;
        const sameLane = item.lane === busLane;
        if (!sameLane) continue;
        hitIds.add(item.id);
        if (item.kind === "passenger") {
          mutateState((current) => {
            const combo = current.combo + 1;
            const multiplier = 1 + Math.min(4, Math.floor(combo / 4));
            const scoreGain = 150 * multiplier + combo * 12;
            return {
              ...current,
              passengers: current.passengers + 1,
              combo,
              maxCombo: Math.max(current.maxCombo, combo),
              score: current.score + scoreGain,
              delay: clamp(current.delay - 1.5, 0, 100),
              rank: getRank(current.score + scoreGain).label,
            };
          });
          addParticle(stateRef.current.combo >= 3 ? "Combo popular!" : "Pegou geral!", LANES[item.lane] - 94, item.y, "good");
          setQuickToast(stateRef.current.combo >= 6 ? "Onibus lotado de esperanca!" : "Pegou geral!");
          playTone("pickup");
        } else if (item.kind === "checkpoint") {
          mutateState((current) => {
            const nextFare = clamp(current.fare - 0.45 - Math.min(0.45, current.combo * 0.018), 0, START_FARE);
            const scoreGain = 430 + current.combo * 20;
            return {
              ...current,
              districts: current.districts + 1,
              fare: nextFare,
              score: current.score + scoreGain,
              delay: clamp(current.delay - 4, 0, 100),
              rank: getRank(current.score + scoreGain).label,
            };
          });
          addParticle("Bairro conectado!", LANES[item.lane] - 120, item.y, "fare");
          setQuickToast("Tarifa caiu!");
          playTone("fare");
        } else {
          mutateState((current) => ({
            ...current,
            combo: 0,
            delay: clamp(current.delay + 10, 0, 100),
            fare: clamp(current.fare + 0.08, 0, START_FARE),
          }));
          shakeRef.current = 0.34;
          addParticle("Cuidado com o buraco!", LANES[item.lane] - 130, item.y, "bad");
          setQuickToast("Cuidado com o buraco!");
          playTone("hit");
        }
      }
      if (hitIds.size > 0) {
        roadItemsRef.current = roadItemsRef.current.map((item) =>
          hitIds.has(item.id) ? { ...item, hit: true } : item,
        );
      }

      particlesRef.current = particlesRef.current
        .map((particle) => ({
          ...particle,
          y: particle.y + particle.vy * dt,
          life: particle.life - dt * 1.35,
        }))
        .filter((particle) => particle.life > 0);

      if (stateRef.current.running) {
        mutateState((current) => ({
          ...current,
          timeLeft,
          bestScore: bestScoreRef.current,
          rank: getRank(current.score).label,
        }));
      }

      if ((timeLeft <= 0 || stateRef.current.delay >= 100) && stateRef.current.running) {
        finishRound();
      }

      drawGame(ctx, roadOffsetRef.current, busXRef.current, stateRef.current, roadItemsRef.current, particlesRef.current, hornPulseRef.current, shakeRef.current);
      frameRef.current = window.requestAnimationFrame(render);
    };

    frameRef.current = window.requestAnimationFrame(render);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [addParticle, finishRound, mutateState, playTone, resetRound, setQuickToast, spawnItem]);

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
    void submitScore(snapshot, playerName);
  }, [playerName, snapshot, submitScore]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PLAYER_NAME_KEY, playerName);
    } catch {}
  }, [playerName]);

  useEffect(() => {
    if (snapshot.finished) {
      const timer = setTimeout(() => {
        const resultsEl = document.getElementById("game-results-panel");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [snapshot.finished]);

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
    const text = `Joguei Corrida do Onibus Zero: transportei ${snapshot.passengers} pessoas, conectei ${snapshot.districts} bairros e deixei a tarifa em R$ ${formatFare(snapshot.fare)}. Meu rank foi ${snapshot.rank}.`;
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

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (x < rect.width * 0.42) changeLane(-1);
    else if (x > rect.width * 0.58) changeLane(1);
    else triggerHorn();
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-concrete px-3 py-3 text-[var(--text)] sm:px-5 sm:py-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(242,169,0,0.05),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(74,73,67,0.12),transparent_18%)]" />
      <div className="relative z-10 mx-auto max-w-md">
        <section className="relative overflow-hidden rounded-xl border border-white/10 bg-[rgba(28,28,26,0.9)] p-4 shadow-[4px_4px_0px_#000000] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">
                arcade bus runner
              </p>
              <h1 className="mt-2 text-3xl font-black uppercase leading-none">{game.title}</h1>
            </div>
            <Link
              href="/"
              className="rounded-lg border border-[var(--accent)] px-3 py-2 text-[11px] font-black uppercase text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-colors"
            >
              Inicio
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <HudBox label="tempo" value={`${Math.ceil(snapshot.timeLeft)}s`} />
            <HudBox label="tarifa" value={`R$${formatFare(snapshot.fare)}`} />
            <HudBox label="combo" value={`${snapshot.combo}x`} />
            <HudBox label="pessoas" value={`${snapshot.passengers}`} />
            <HudBox label="bairros" value={`${snapshot.districts}`} />
            <HudBox label="score" value={`${snapshot.score}`} />
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),#ffd15c,var(--rust))] transition-[width] duration-150"
              style={{ width: `${snapshot.delay}%` }}
            />
          </div>
        </section>

        <section className="relative mt-4 rounded-xl border border-white/10 bg-[rgba(10,10,9,0.94)] p-2 shadow-[6px_6px_0px_#000000]">
          <canvas
            ref={canvasRef}
            className="block w-full touch-manipulation rounded-lg"
            onPointerDown={handlePointerDown}
          />
          {!snapshot.finished ? (
            <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-center justify-between rounded-xl border border-white/5 bg-[rgba(28,28,26,0.9)] px-4 py-3 text-xs font-black uppercase text-[var(--text)] backdrop-blur-sm">
              <span>toque lados</span>
              <span>{toast}</span>
            </div>
          ) : null}
        </section>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => changeLane(-1)}
            className="btn-secondary !py-4 text-xl font-black"
          >
            &lt;
          </button>
          <button
            type="button"
            onClick={triggerHorn}
            className="btn-primary !py-4 text-sm font-black uppercase"
          >
            buzina
          </button>
          <button
            type="button"
            onClick={() => changeLane(1)}
            className="btn-secondary !py-4 text-xl font-black"
          >
            &gt;
          </button>
        </div>

        {snapshot.finished ? (
          <section id="game-results-panel" className="relative overflow-hidden mt-4 rounded-xl border border-white/10 bg-[rgba(28,28,26,0.95)] p-5 scroll-mt-6 shadow-[6px_6px_0px_#000000] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-soft)]">resultado</p>
                <h2 className="mt-1 text-7xl font-black leading-none text-[var(--accent)]">{rankMeta.label}</h2>
                <p className="mt-2 text-sm font-bold uppercase text-[var(--text)]">{rankMeta.message}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/45 px-4 py-3 text-right">
                <div className="text-[10px] font-bold uppercase text-[var(--text-soft)]">score</div>
                <div className="mt-1 text-4xl font-black text-[var(--accent)]">{snapshot.score}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ResultMetric label="passageiros" value={`${snapshot.passengers}`} />
              <ResultMetric label="combo max" value={`${snapshot.maxCombo}x`} />
              <ResultMetric label="tarifa final" value={`R$ ${formatFare(snapshot.fare)}`} />
              <ResultMetric label="bairros" value={`${snapshot.districts}`} />
              <ResultMetric label="melhor score" value={`${snapshot.bestScore}`} />
              <ResultMetric label="atraso" value={`${Math.round(snapshot.delay)}%`} />
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/45">
              {resultImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resultImageUrl} alt="Card de resultado" className="block w-full" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center text-xs font-black uppercase text-[var(--text-soft)]">
                  gerando card
                </div>
              )}
            </div>

            {/* Card de Pré-campanha de Alexandre VR Abandonada */}
            <div className="relative overflow-hidden rounded-[1.25rem] border border-[#f15a24]/30 bg-gradient-to-br from-[#1e3c34]/95 to-[rgba(28,28,26,0.98)] p-5 shadow-[0_12px_40px_rgba(241,90,36,0.15)] text-center mt-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f15a24] via-[#ffd45c] to-[#f15a24]" />
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ffd554]">Pré-campanha</div>
              <h3 className="mt-1 text-lg font-black uppercase text-white tracking-wide">Alexandre VR Abandonada</h3>
              <p className="mt-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-[#ff7c52]">Candidato a Deputado Estadual</p>
              <p className="mt-3 text-xs font-semibold leading-relaxed text-[#d4e8d8]/90">
                "Volta Redonda e o estado do Rio de Janeiro precisam de dignidade: merenda escolar de qualidade, valorização profissional, saúde eficiente e transporte público que realmente funcione. Vamos juntos mudar essa realidade!"
              </p>
              <div className="mt-3.5 flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f15a24] animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9ee8c1]">Pelo resgate da nossa dignidade</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#f15a24] animate-pulse" />
              </div>
            </div>

            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value.slice(0, 18))}
              className="mt-4 w-full rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]/50"
              placeholder="nome no ranking"
            />
            <div className="mt-4 flex gap-3 flex-wrap xs:flex-nowrap">
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
                className="flex-[1.2] btn-primary !p-3 text-[10px] xs:text-xs"
              >
                Jogar de novo
              </button>
              <button
                type="button"
                onClick={() => void shareResult()}
                className="flex-1 btn-secondary !p-3 text-[10px] xs:text-xs"
              >
                {copyLabel}
              </button>
            </div>
            <Link
              href={`/ranking/${game.slug}`}
              className="mt-3 block btn-secondary !p-3 text-center text-[10px] xs:text-xs"
            >
              Ver ranking
            </Link>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function HudBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[rgba(10,10,9,0.94)] px-3 py-3">
      <div className="text-[10px] font-black uppercase text-[var(--text-soft)]">{label}</div>
      <div className="mt-1 text-lg font-black text-[var(--accent)]">{value}</div>
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[rgba(10,10,9,0.94)] px-4 py-3">
      <div className="text-[10px] font-black uppercase text-[var(--text-soft)]">{label}</div>
      <div className="mt-1 text-xl font-black text-[var(--accent)]">{value}</div>
    </div>
  );
}

function drawGame(
  ctx: CanvasRenderingContext2D,
  roadOffset: number,
  busX: number,
  snapshot: GameSnapshot,
  items: RoadItem[],
  particles: Particle[],
  hornPulse: number,
  shake: number,
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.save();
  if (shake > 0) ctx.translate(Math.sin(roadOffset / 18) * shake * 18, Math.cos(roadOffset / 21) * shake * 18);

  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bg.addColorStop(0, "#14342d");
  bg.addColorStop(1, "#101413");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "#27302d";
  ctx.fillRect(112, 0, 496, CANVAS_HEIGHT);
  ctx.strokeStyle = "#ffd15c";
  ctx.lineWidth = 7;
  ctx.strokeRect(112, 0, 496, CANVAS_HEIGHT);

  ctx.strokeStyle = "rgba(247,241,223,0.35)";
  ctx.lineWidth = 5;
  ctx.setLineDash([48, 52]);
  for (const x of [270, 450]) {
    ctx.beginPath();
    ctx.moveTo(x, -160 + roadOffset);
    ctx.lineTo(x, CANVAS_HEIGHT + 160);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  for (let y = -160 + roadOffset; y < CANVAS_HEIGHT; y += 160) {
    ctx.fillStyle = "rgba(65,217,154,0.12)";
    ctx.fillRect(22, y, 70, 90);
    ctx.fillStyle = "rgba(255,209,92,0.1)";
    ctx.fillRect(628, y + 70, 70, 110);
  }

  for (const item of items) {
    const x = LANES[item.lane];
    if (item.kind === "passenger") drawPassengerStop(ctx, x, item.y);
    if (item.kind === "obstacle") drawObstacle(ctx, x, item.y, item.label);
    if (item.kind === "checkpoint") drawCheckpoint(ctx, x, item.y);
  }

  drawBus(ctx, busX, 890, hornPulse);

  for (const particle of particles) {
    ctx.save();
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.tone === "bad" ? "#ff684f" : particle.tone === "fare" ? "#41d99a" : "#ffd15c";
    ctx.font = '900 25px "Geist", sans-serif';
    ctx.fillText(particle.text, particle.x, particle.y);
    ctx.restore();
  }

  ctx.fillStyle = "rgba(16,20,19,0.72)";
  ctx.fillRect(28, 26, 664, 86);
  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 30px "Geist", sans-serif';
  ctx.fillText(`Score ${snapshot.score}`, 48, 78);
  ctx.fillStyle = "#41d99a";
  ctx.fillText(`R$ ${formatFare(snapshot.fare)}`, 498, 78);
  ctx.restore();
}

function drawBus(ctx: CanvasRenderingContext2D, x: number, y: number, hornPulse: number) {
  ctx.save();
  ctx.translate(x, y);
  if (hornPulse > 0) {
    ctx.strokeStyle = `rgba(255,209,92,${hornPulse})`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 96 + hornPulse * 80, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 86, 64, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd15c";
  ctx.fillRect(-54, -88, 108, 176);
  ctx.fillStyle = "#10231f";
  ctx.fillRect(-40, -66, 80, 44);
  ctx.fillRect(-40, -8, 80, 48);
  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 22px "Geist", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("ZERO", 0, 72);
  ctx.fillStyle = "#101413";
  ctx.fillRect(-62, -54, 10, 42);
  ctx.fillRect(52, -54, 10, 42);
  ctx.restore();
}

function drawPassengerStop(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#41d99a";
  ctx.fillRect(-42, -24, 84, 48);
  ctx.fillStyle = "#101413";
  ctx.font = '900 22px "Geist", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("+", 0, 8);
  for (let i = -1; i <= 1; i += 1) {
    ctx.fillStyle = "#f7f1df";
    ctx.beginPath();
    ctx.arc(i * 23, -42, 11, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawObstacle(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
  ctx.save();
  ctx.translate(x, y);
  if (label.includes("buraco")) {
    ctx.fillStyle = "#101413";
    ctx.beginPath();
    ctx.ellipse(0, 0, 52, 28, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#ff684f";
    ctx.beginPath();
    ctx.moveTo(0, -44);
    ctx.lineTo(48, 38);
    ctx.lineTo(-48, 38);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f7f1df";
    ctx.fillRect(-28, 8, 56, 10);
  }
  ctx.restore();
}

function drawCheckpoint(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#ffd15c";
  ctx.beginPath();
  ctx.arc(0, 0, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#101413";
  ctx.font = '900 22px "Geist", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("BAIRRO", 0, 7);
  ctx.restore();
}
