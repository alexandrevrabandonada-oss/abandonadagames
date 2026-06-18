"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameDefinition } from "@/lib/gameRegistry";
import type { ScoreSubmission } from "@/lib/score";

type Citizen = {
  id: number;
  x: number;
  y: number;
  radius: number;
  patience: number;
  hue: string;
  mood: "waiting" | "panic";
};

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  text: string;
  tone: "good" | "bad" | "combo";
};

type ExitSprite = {
  id: number;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  hue: string;
  tone: "served" | "lost";
};

type WaveToast = {
  id: number;
  text: string;
  tone: "good" | "bad" | "combo";
};

type GameSnapshot = {
  score: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  chaos: number;
  timeLeft: number;
  served: number;
  lost: number;
  bestScore: number;
  running: boolean;
  finished: boolean;
  rank: string;
};

type GameStats = {
  score: number;
  comboMax: number;
  served: number;
  lost: number;
  chaos: number;
  rank: string;
};

type AudioTone = "serve" | "miss" | "combo";

type SpawnDirector = {
  nextSpawnAt: number;
  nextEventAt: number;
};

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 1180;
const ROUND_DURATION_MS = 50000;
const MAX_CITIZENS = 9;
const INITIAL_CHAOS = 12;
const BEST_SCORE_KEY = "abandonada:fila-invisivel:best-score";
const PLAYER_NAME_KEY = "abandonada:fila-invisivel:player-name";

const rankTable = [
  { min: 0, label: "D", message: "A fila engoliu o atendimento." },
  { min: 1500, label: "C", message: "Voce segurou o caos por pouco." },
  { min: 3400, label: "B", message: "A fila andou." },
  { min: 5600, label: "A", message: "Mutirao funcionando!" },
  { min: 8200, label: "S", message: "Fila derrotada!" },
];

function getRank(score: number) {
  return [...rankTable].reverse().find((item) => score >= item.min) ?? rankTable[0];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createCitizen(id: number, count: number): Citizen {
  const row = count % 2;
  return {
    id,
    x: -40 - Math.random() * 120,
    y: 250 + count * 96 + row * 8,
    radius: 34 + Math.random() * 5,
    patience: 0.78 + Math.random() * 0.22,
    hue: ["#ffca74", "#f7f1df", "#ff8f58", "#ffd86a"][id % 4],
    mood: "waiting",
  };
}

function createInitialSnapshot(bestScore = 0): GameSnapshot {
  return {
    score: 0,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    chaos: INITIAL_CHAOS,
    timeLeft: ROUND_DURATION_MS / 1000,
    served: 0,
    lost: 0,
    bestScore,
    running: false,
    finished: false,
    rank: "D",
  };
}

function resizeCanvas(canvas: HTMLCanvasElement, containerWidth: number) {
  const ratio = CANVAS_HEIGHT / CANVAS_WIDTH;
  const width = Math.min(containerWidth, 560);
  const height = width * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = CANVAS_WIDTH * window.devicePixelRatio;
  canvas.height = CANVAS_HEIGHT * window.devicePixelRatio;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  return ctx;
}

async function createResultCardFile(stats: GameSnapshot, phrase: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#1b1d1b");
  bg.addColorStop(1, "#0d0f0d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,202,116,0.08)";
  ctx.fillRect(64, 70, 952, 1210);
  drawHazardStripe(ctx, 64, 70, 952, 36);
  drawHazardStripe(ctx, 64, 1244, 952, 36);

  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 82px "Geist", sans-serif';
  ctx.fillText("Fila Invisivel", 104, 220);

  ctx.fillStyle = "#9d927d";
  ctx.font = '700 34px "Geist", sans-serif';
  ctx.fillText("Abandonada Games", 108, 280);

  ctx.fillStyle = "#ffca74";
  ctx.font = '900 300px "Geist", sans-serif';
  ctx.fillText(stats.rank, 104, 585);

  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 92px "Geist", sans-serif';
  ctx.fillText(`${stats.score} pts`, 104, 735);

  ctx.fillStyle = "#ff6d2b";
  ctx.font = '900 48px "Geist", sans-serif';
  ctx.fillText(phrase, 104, 820);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(104, 890, 872, 188);

  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 48px "Geist", sans-serif';
  ctx.fillText(`${stats.served}`, 150, 990);
  ctx.fillText(`${stats.maxCombo}x`, 430, 990);
  ctx.fillText(`${stats.bestScore}`, 710, 990);

  ctx.fillStyle = "#9d927d";
  ctx.font = '700 26px "Geist", sans-serif';
  ctx.fillText("atendidos", 150, 1036);
  ctx.fillText("combo max", 430, 1036);
  ctx.fillText("recorde", 710, 1036);

  ctx.fillStyle = "#ffca74";
  ctx.font = '900 54px "Geist", sans-serif';
  ctx.fillText("A fila nao venceu hoje.", 104, 1165);

  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 38px "Geist", sans-serif';
  ctx.fillText("Jogue tambem", 104, 1228);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return null;
  return new File([blob], "fila-invisivel-resultado.png", { type: "image/png" });
}

export function QueueChaosGame({ game }: { game: GameDefinition }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const startAtRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const citizenSeqRef = useRef(0);
  const directorRef = useRef<SpawnDirector>({
    nextSpawnAt: 0,
    nextEventAt: 0,
  });
  const citizensRef = useRef<Citizen[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const exitSpritesRef = useRef<ExitSprite[]>([]);
  const flashRef = useRef<{ life: number; tone: "good" | "bad" | "combo" } | null>(null);
  const shakeRef = useRef(0);
  const multiplierFlashRef = useRef(0);
  const lastMultiplierRef = useRef(1);
  const comboWindowRef = useRef<number>(0);
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
  const [toast, setToast] = useState<WaveToast | null>(null);
  const [copyLabel, setCopyLabel] = useState("Compartilhar");
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

  const rankMeta = useMemo(() => getRank(snapshot.score), [snapshot.score]);

  const playTone = useCallback((tone: AudioTone) => {
    if (typeof window === "undefined") return;

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
        tone === "serve"
          ? { frequency: 620, duration: 0.08, gain: 0.04, type: "square" as OscillatorType }
          : tone === "combo"
            ? { frequency: 860, duration: 0.12, gain: 0.06, type: "triangle" as OscillatorType }
            : { frequency: 180, duration: 0.16, gain: 0.05, type: "sawtooth" as OscillatorType };

      oscillator.type = config.type;
      oscillator.frequency.value = config.frequency;
      gain.gain.value = config.gain;
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);
      oscillator.stop(ctx.currentTime + config.duration);
    } catch {}
  }, []);

  const pushToast = useCallback((text: string, tone: WaveToast["tone"]) => {
    setToast({ id: Date.now(), text, tone });
  }, []);

  const addParticle = useCallback(
    (text: string, x: number, y: number, tone: Particle["tone"]) => {
      particlesRef.current.push({
        id: Date.now() + Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 28,
        vy: tone === "bad" ? -22 : -44,
        life: 1,
        maxLife: 1,
        text,
        tone,
      });
    },
    [],
  );

  const addExitSprite = useCallback((citizen: Citizen, tone: ExitSprite["tone"]) => {
    exitSpritesRef.current.push({
      id: Date.now() + Math.random(),
      x: citizen.x,
      y: citizen.y,
      life: 1,
      maxLife: 1,
      hue: citizen.hue,
      tone,
    });
  }, []);

  const updateBestScore = useCallback((nextScore: number) => {
    if (nextScore <= bestScoreRef.current) return;
    bestScoreRef.current = nextScore;
    try {
      window.localStorage.setItem(BEST_SCORE_KEY, String(nextScore));
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
    pushToast(rank === "D" ? "Fila colapsou!" : "Fila andando!", rank === "D" ? "bad" : "good");
  }, [mutateState, pushToast]);

  const resetRound = useCallback(() => {
    submittedRef.current = false;
    citizenSeqRef.current = 0;
    citizensRef.current = [];
    particlesRef.current = [];
    exitSpritesRef.current = [];
    flashRef.current = null;
    shakeRef.current = 0;
    multiplierFlashRef.current = 0;
    lastMultiplierRef.current = 1;
    comboWindowRef.current = 0;
    directorRef.current = {
      nextSpawnAt: 0,
      nextEventAt: 7800,
    };
    const nextState: GameSnapshot = {
      ...createInitialSnapshot(bestScoreRef.current),
      running: true,
    };
    stateRef.current = nextState;
    setSnapshot(nextState);
    startAtRef.current = performance.now();
    lastTickRef.current = performance.now();
  }, []);

  const spawnCitizen = useCallback(() => {
    const current = citizensRef.current;
    if (current.length >= MAX_CITIZENS) return;
    citizenSeqRef.current += 1;
    current.push(createCitizen(citizenSeqRef.current, current.length));
  }, []);

  const applyPublicEvent = useCallback(() => {
    const eventIsPower = Math.random() > 0.68;
    const source = eventIsPower ? game.powerUps : game.obstacles;
    const label = source[Math.floor(Math.random() * source.length)];

    if (eventIsPower) {
      citizensRef.current = citizensRef.current.map((citizen) => ({
        ...citizen,
        patience: clamp(citizen.patience + 0.18, 0, 1),
      }));
      flashRef.current = { life: 0.7, tone: "good" };
      multiplierFlashRef.current = Math.max(multiplierFlashRef.current, 0.45);
      addParticle("Mutirao!", CANVAS_WIDTH / 2, 190, "combo");
      pushToast(label, "combo");
    } else {
      mutateState((current) => ({
        ...current,
        chaos: clamp(current.chaos + 7, 0, 100),
        combo: 0,
        multiplier: 1,
      }));
      flashRef.current = { life: 0.9, tone: "bad" };
      shakeRef.current = 0.45;
      addParticle("Caos subiu!", CANVAS_WIDTH / 2, 190, "bad");
      pushToast(label, "bad");
      playTone("miss");
    }
  }, [addParticle, game.obstacles, game.powerUps, mutateState, playTone, pushToast]);

  const serveCitizen = useCallback(
    (citizenId: number) => {
      const citizen = citizensRef.current.find((item) => item.id === citizenId);
      if (!citizen) return;

      citizensRef.current = citizensRef.current.filter((item) => item.id !== citizenId);
      const quickWindow = performance.now() - comboWindowRef.current < 1500;
      comboWindowRef.current = performance.now();
      addExitSprite(citizen, "served");

      mutateState((current) => {
        const nextCombo = quickWindow ? current.combo + 1 : 1;
        const multiplier = clamp(1 + Math.floor(nextCombo / 4), 1, 5);
        const points = Math.round(125 * multiplier + citizen.patience * 110 + nextCombo * 8);
        if (multiplier > lastMultiplierRef.current) {
          multiplierFlashRef.current = 0.8;
          lastMultiplierRef.current = multiplier;
        }
        return {
          ...current,
          score: current.score + points,
          combo: nextCombo,
          maxCombo: Math.max(current.maxCombo, nextCombo),
          multiplier,
          served: current.served + 1,
          chaos: clamp(current.chaos - 3.4, 0, 100),
          rank: getRank(current.score + points).label,
          bestScore: bestScoreRef.current,
        };
      });

      const message = quickWindow && stateRef.current.combo >= 2 ? "Combo!" : "Atendeu!";
      addParticle(`+${120 * stateRef.current.multiplier}`, citizen.x, citizen.y - 14, "good");
      addParticle(message, citizen.x, citizen.y - 54, quickWindow ? "combo" : "good");
      pushToast(message, quickWindow ? "combo" : "good");
      flashRef.current = { life: 0.35, tone: quickWindow ? "combo" : "good" };
      playTone(quickWindow ? "combo" : "serve");
      spawnCitizen();
    },
    [addExitSprite, addParticle, mutateState, playTone, pushToast, spawnCitizen],
  );

  const handleCanvasPress = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current || !stateRef.current.running) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      let chosen: Citizen | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const citizen of citizensRef.current) {
        const dx = citizen.x - x;
        const dy = citizen.y - y;
        const distance = Math.hypot(dx, dy);
        if (distance <= citizen.radius * 1.35 && distance < bestDistance) {
          bestDistance = distance;
          chosen = citizen;
        }
      }

      if (chosen) {
        serveCitizen(chosen.id);
      } else {
        mutateState((current) => ({
          ...current,
          combo: 0,
          multiplier: 1,
          chaos: clamp(current.chaos + 3, 0, 100),
        }));
        addParticle("Perdeu atendimento!", x, y, "bad");
        pushToast("Caos subiu!", "bad");
        flashRef.current = { life: 0.45, tone: "bad" };
        shakeRef.current = 0.25;
        playTone("miss");
      }
    },
    [addParticle, mutateState, playTone, pushToast, serveCitizen],
  );

  const submitScore = useCallback(async (stats: GameStats, finalName: string) => {
    const payload: ScoreSubmission = {
      slug: game.slug,
      player: finalName || "Anon",
      score: stats.score,
      durationMs: ROUND_DURATION_MS,
      eventsHandled: Math.max(1, stats.served + stats.lost),
    };

    await fetch("/api/score/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }, [game.slug]);

  useEffect(() => {
    if (!snapshot.finished || submittedRef.current) return;
    submittedRef.current = true;
    const stats: GameStats = {
      score: snapshot.score,
      comboMax: snapshot.maxCombo,
      served: snapshot.served,
      lost: snapshot.lost,
      chaos: snapshot.chaos,
      rank: snapshot.rank,
    };
    void submitScore(stats, playerName);
  }, [playerName, snapshot, submitScore]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PLAYER_NAME_KEY, playerName);
    } catch {}
  }, [playerName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = resizeCanvas(canvas, parent.clientWidth);
    if (!ctx) return;

    const handleResize = () => resizeCanvas(canvas, parent.clientWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    resetRound();
    for (let index = 0; index < 4; index += 1) spawnCitizen();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const ctx = resizeCanvas(canvas, parent?.clientWidth ?? 420);
    if (!ctx) return;

    const render = (now: number) => {
      const dt = Math.min(0.033, (now - lastTickRef.current) / 1000);
      lastTickRef.current = now;
      const elapsed = now - startAtRef.current;
      const timeLeft = clamp((ROUND_DURATION_MS - elapsed) / 1000, 0, ROUND_DURATION_MS / 1000);

      if (stateRef.current.running) {
        if (elapsed >= directorRef.current.nextSpawnAt) {
          spawnCitizen();
          directorRef.current.nextSpawnAt = elapsed + clamp(2200 - elapsed / 34, 760, 2200);
        }

        if (elapsed >= directorRef.current.nextEventAt) {
          applyPublicEvent();
          directorRef.current.nextEventAt = elapsed + 4500 + Math.random() * 1100;
        }
      }

      citizensRef.current = citizensRef.current
        .map((citizen, index) => {
          const targetX = 148 + index * 66;
          const tension = Math.max(0, index - 3) * 0.03;
          const phase = elapsed / ROUND_DURATION_MS;
          const grace = elapsed < 15000 ? 0.7 : 1;
          const patienceLoss =
            dt * grace * (0.033 + phase * 0.04 + tension + stateRef.current.chaos / 3200);
          const patience = citizen.patience - patienceLoss;
          const mood: Citizen["mood"] = patience < 0.28 ? "panic" : "waiting";

          return {
            ...citizen,
            x: citizen.x + (targetX - citizen.x) * 0.1,
            y: 340 + index * 95 + Math.sin((elapsed / 200) + index) * 3,
            patience,
            mood,
          };
        })
        .filter((citizen) => {
          if (citizen.patience > 0) return true;
          addExitSprite(citizen, "lost");
          mutateState((current) => ({
            ...current,
            combo: 0,
            multiplier: 1,
            lost: current.lost + 1,
            chaos: clamp(current.chaos + 10, 0, 100),
          }));
          addParticle("Desistiu!", citizen.x, citizen.y - 24, "bad");
          pushToast("Perdeu atendimento!", "bad");
          flashRef.current = { life: 0.7, tone: "bad" };
          shakeRef.current = 0.55;
          playTone("miss");
          return false;
        });

      exitSpritesRef.current = exitSpritesRef.current
        .map((sprite) => ({
          ...sprite,
          x: sprite.x + (sprite.tone === "served" ? 210 : -120) * dt,
          y: sprite.y + (sprite.tone === "served" ? -55 : 70) * dt,
          life: sprite.life - dt * 1.8,
        }))
        .filter((sprite) => sprite.life > 0);

      particlesRef.current = particlesRef.current
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx * dt,
          y: particle.y + particle.vy * dt,
          life: particle.life - dt * 1.2,
        }))
        .filter((particle) => particle.life > 0);

      if (flashRef.current) {
        flashRef.current.life -= dt;
        if (flashRef.current.life <= 0) flashRef.current = null;
      }

      if (shakeRef.current > 0) shakeRef.current = Math.max(0, shakeRef.current - dt);
      if (multiplierFlashRef.current > 0) {
        multiplierFlashRef.current = Math.max(0, multiplierFlashRef.current - dt);
      }

      if (stateRef.current.running) {
        mutateState((current) => ({
          ...current,
          timeLeft,
          rank: getRank(current.score).label,
          bestScore: bestScoreRef.current,
        }));
      }

      if ((timeLeft <= 0 || stateRef.current.chaos >= 100) && stateRef.current.running) {
        finishRound();
      }

      drawGame(
        ctx,
        elapsed,
        stateRef.current,
        citizensRef.current,
        exitSpritesRef.current,
        particlesRef.current,
        flashRef.current,
        shakeRef.current,
        multiplierFlashRef.current,
      );
      frameRef.current = window.requestAnimationFrame(render);
    };

    frameRef.current = window.requestAnimationFrame(render);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [
    addExitSprite,
    addParticle,
    applyPublicEvent,
    finishRound,
    mutateState,
    playTone,
    pushToast,
    resetRound,
    spawnCitizen,
  ]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 1200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!snapshot.finished) return;

    let cancelled = false;
    void createResultCardFile(snapshot, rankMeta.message).then((file) => {
      if (!file || cancelled) return;
      setResultImageUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(file);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [rankMeta.message, snapshot]);

  const shareResult = useCallback(async () => {
    const text = `Joguei Fila Invisivel: atendi ${snapshot.served} pessoas, fiz combo ${snapshot.maxCombo}, marquei ${snapshot.score} pontos e terminei com rank ${snapshot.rank}. A fila nao venceu hoje.`;
    const imageFile = await createResultCardFile(snapshot, rankMeta.message);
    const filePayload = imageFile
      ? { title: game.title, text, url: window.location.href, files: [imageFile] }
      : null;

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
  }, [game.title, rankMeta.message, snapshot]);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-3 py-3 text-[var(--text)] sm:px-5 sm:py-5">
      <div className="mx-auto max-w-md">
        <div className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--text-muted)]">
                arcade queue chaos
              </p>
              <h1 className="mt-2 text-3xl font-black uppercase leading-none">
                {game.title}
              </h1>
            </div>
            <Link
              href="/"
              className="rounded-full border border-[var(--border)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-soft)]"
            >
              Inicio
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <HudBox label="tempo" value={`${Math.ceil(snapshot.timeLeft)}s`} />
            <HudBox label="score" value={`${snapshot.score}`} />
            <HudBox label="combo" value={`${snapshot.combo}x`} />
            <HudBox label="recorde" value={`${snapshot.bestScore}`} />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[rgba(255,202,116,0.18)] bg-[rgba(255,202,116,0.07)] px-4 py-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
                objetivo
              </div>
              <div className="mt-1 text-sm font-bold uppercase text-[var(--sand)]">
                Toque nas pessoas antes de desistirem
              </div>
            </div>
            <div className="rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--bg)]">
              x{snapshot.multiplier}
            </div>
          </div>
        </div>

        <section className="relative mt-4 rounded-[2rem] border border-[var(--border-strong)] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.08))] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                pressao da fila
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#ffca74,#ff6d2b,#d6451b)] transition-[width] duration-150"
                  style={{ width: `${snapshot.chaos}%` }}
                />
              </div>
            </div>
            <div className="shrink-0 rounded-full border border-[rgba(255,202,116,0.18)] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--sand)]">
              caos {Math.round(snapshot.chaos)}%
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.6rem] border border-[rgba(255,255,255,0.08)] bg-[#131513] p-2">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,202,116,0.05),transparent_20%,transparent_80%,rgba(0,0,0,0.36))]" />
            <canvas
              ref={canvasRef}
              className="block w-full touch-manipulation rounded-[1.2rem]"
              onPointerDown={(event) => handleCanvasPress(event.clientX, event.clientY)}
            />
            {!snapshot.finished ? (
              <div className="pointer-events-none absolute inset-x-6 bottom-6 flex items-center justify-between rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(17,19,17,0.75)] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-soft)] backdrop-blur-sm">
                <span>toque para atender</span>
                <span>{snapshot.served} atendidos</span>
              </div>
            ) : null}
          </div>

          {toast ? (
            <div
              className={`pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.14em] shadow-lg ${
                toast.tone === "bad"
                  ? "bg-[var(--accent-2)] text-[var(--text)]"
                  : toast.tone === "combo"
                    ? "bg-[var(--sand)] text-[var(--bg)]"
                    : "bg-[var(--accent)] text-[var(--bg)]"
              }`}
            >
              {toast.text}
            </div>
          ) : null}
        </section>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatCard label="atendidos" value={snapshot.served} />
          <StatCard label="perdidos" value={snapshot.lost} />
          <StatCard label="combo max" value={snapshot.maxCombo} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoList title="obstaculos" items={game.obstacles} tone="danger" />
          <InfoList title="forcas" items={game.powerUps} tone="boost" />
        </div>

        {snapshot.finished ? (
          <section className="mt-4 rounded-[2rem] border border-[var(--border-strong)] bg-[var(--surface)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
                  resultado
                </p>
                <h2 className="mt-1 text-7xl font-black uppercase leading-none text-[var(--sand)]">
                  {rankMeta.label}
                </h2>
                <p className="mt-2 text-sm font-bold uppercase text-[var(--text-soft)]">
                  {rankMeta.message}
                </p>
              </div>
              <div className="rounded-2xl bg-[rgba(255,202,116,0.12)] px-4 py-3 text-right">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  score final
                </div>
                <div className="mt-1 text-4xl font-black text-[var(--sand)]">
                  {snapshot.score}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <ResultMetric label="maior combo" value={`${snapshot.maxCombo}x`} />
              <ResultMetric label="melhor score" value={`${snapshot.bestScore}`} />
              <ResultMetric label="atendidos" value={`${snapshot.served}`} />
              <ResultMetric label="caos final" value={`${Math.round(snapshot.chaos)}%`} />
            </div>

            <div className="mt-4 overflow-hidden rounded-[1.6rem] border border-[rgba(255,202,116,0.18)] bg-[#111311]">
              {resultImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resultImageUrl}
                  alt="Card de resultado para compartilhamento"
                  className="block w-full"
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center text-sm font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  gerando card
                </div>
              )}
            </div>

            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value.slice(0, 18))}
              className="mt-4 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] outline-none"
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
                  for (let index = 0; index < 4; index += 1) spawnCitizen();
                }}
                className="flex-[1.2] rounded-2xl bg-[var(--sand)] px-4 py-4 text-sm font-black uppercase tracking-[0.14em] text-[var(--bg)] shadow-[0_12px_30px_rgba(255,202,116,0.18)]"
              >
                Jogar de novo
              </button>
              <button
                type="button"
                onClick={() => void shareResult()}
                className="flex-1 rounded-2xl border border-[var(--border-strong)] px-4 py-4 text-sm font-black uppercase tracking-[0.14em] text-[var(--text)]"
              >
                {copyLabel}
              </button>
            </div>

            <Link
              href={`/ranking/${game.slug}`}
              className="mt-3 block rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[var(--surface-soft)] px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[var(--text-soft)]"
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
    <div className="rounded-2xl bg-[var(--surface-soft)] px-2 py-3">
      <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1 text-center text-lg font-black uppercase sm:text-xl">{value}</div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface)] px-3 py-4 text-center">
      <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 text-2xl font-black text-[var(--sand)]">{value}</div>
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] bg-[var(--surface-soft)] px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 text-xl font-black uppercase">{value}</div>
    </div>
  );
}

function InfoList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "danger" | "boost";
}) {
  return (
    <section className="rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-xs font-black uppercase tracking-[0.22em] text-[var(--text-muted)]">
        {title}
      </h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] ${
              tone === "danger"
                ? "bg-[rgba(214,69,27,0.18)] text-[var(--text)]"
                : "bg-[rgba(255,202,116,0.16)] text-[var(--sand)]"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function drawGame(
  ctx: CanvasRenderingContext2D,
  elapsed: number,
  snapshot: GameSnapshot,
  citizens: Citizen[],
  exitSprites: ExitSprite[],
  particles: Particle[],
  flash: { life: number; tone: "good" | "bad" | "combo" } | null,
  shake: number,
  multiplierFlash: number,
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.save();
  if (shake > 0) {
    const amount = shake * 18;
    ctx.translate(Math.sin(elapsed / 24) * amount, Math.cos(elapsed / 31) * amount);
  }

  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bg.addColorStop(0, "#1b1d1b");
  bg.addColorStop(1, "#111311");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let index = 0; index < 18; index += 1) {
    const y = 80 + index * 64;
    ctx.fillRect(0, y, CANVAS_WIDTH, 1);
  }

  ctx.fillStyle = "rgba(255,202,116,0.06)";
  ctx.fillRect(36, 232, CANVAS_WIDTH - 72, 720);
  ctx.strokeStyle = "rgba(255,202,116,0.22)";
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 232, CANVAS_WIDTH - 72, 720);

  drawHazardStripe(ctx, 0, 214, CANVAS_WIDTH, 26);
  drawHazardStripe(ctx, 0, 948, CANVAS_WIDTH, 26);

  ctx.fillStyle = "#0d0f0d";
  ctx.fillRect(46, 286, 90, 596);
  ctx.fillStyle = "#242824";
  ctx.fillRect(60, 300, 62, 568);

  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 44px "Geist", sans-serif';
  ctx.fillText("FILA", 74, 406);
  ctx.fillText("JA", 84, 456);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(156, 330);
  ctx.bezierCurveTo(220, 320, 260, 320, 336, 330);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(156, 426);
  ctx.bezierCurveTo(240, 416, 296, 418, 418, 428);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(156, 522);
  ctx.bezierCurveTo(250, 516, 330, 524, 496, 526);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(156, 618);
  ctx.bezierCurveTo(260, 618, 368, 622, 560, 620);
  ctx.stroke();

  ctx.fillStyle = multiplierFlash > 0 ? "#f7f1df" : "#ffca74";
  ctx.beginPath();
  ctx.arc(612, 620, 62 + multiplierFlash * 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111311";
  ctx.font = '900 28px "Geist", sans-serif';
  ctx.fillText("ATENDE", 572, 626);

  for (const citizen of citizens) {
    drawCitizen(ctx, citizen, elapsed);
  }

  for (const sprite of exitSprites) {
    drawExitSprite(ctx, sprite, elapsed);
  }

  for (const particle of particles) {
    const alpha = particle.life / particle.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle =
      particle.tone === "bad" ? "#ff8f58" : particle.tone === "combo" ? "#ffca74" : "#f7f1df";
    ctx.font =
      particle.tone === "combo"
        ? '900 32px "Geist", sans-serif'
        : '900 24px "Geist", sans-serif';
    ctx.fillText(particle.text, particle.x, particle.y);
    ctx.restore();
  }

  if (flash) {
    ctx.save();
    ctx.globalAlpha = flash.life * 0.18;
    ctx.fillStyle =
      flash.tone === "bad" ? "#d6451b" : flash.tone === "combo" ? "#ffca74" : "#ff6d2b";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }

  ctx.fillStyle = "rgba(17,19,17,0.84)";
  ctx.fillRect(24, 24, CANVAS_WIDTH - 48, 124);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.strokeRect(24, 24, CANVAS_WIDTH - 48, 124);

  ctx.fillStyle = "#9d927d";
  ctx.font = '700 20px "Geist", sans-serif';
  ctx.fillText("tap rapido | combo segura o caos", 48, 66);
  ctx.fillStyle = "#f7f1df";
  ctx.font = '900 34px "Geist", sans-serif';
  ctx.fillText(`Score ${snapshot.score}`, 48, 110);
  ctx.fillStyle = "#ffca74";
  ctx.fillText(`x${snapshot.multiplier}`, 548, 110);

  if (snapshot.combo >= 3) {
    const pulse = 1 + Math.sin(elapsed / 90) * 0.08;
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, 178);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = snapshot.multiplier >= 3 ? "#ffca74" : "#ff6d2b";
    ctx.font = '900 30px "Geist", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(`COMBO ${snapshot.combo}  x${snapshot.multiplier}`, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

function drawCitizen(ctx: CanvasRenderingContext2D, citizen: Citizen, elapsed: number) {
  const wobble = Math.sin(elapsed / 110 + citizen.id) * 3;
  const panic = citizen.mood === "panic";

  ctx.save();
  ctx.translate(citizen.x, citizen.y + wobble);

  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(0, citizen.radius + 14, citizen.radius * 0.9, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = citizen.hue;
  ctx.beginPath();
  ctx.arc(0, 0, citizen.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111311";
  ctx.beginPath();
  ctx.arc(-10, -6, 4, 0, Math.PI * 2);
  ctx.arc(10, -6, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#111311";
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (panic) {
    ctx.moveTo(-12, 12);
    ctx.lineTo(0, 4);
    ctx.lineTo(12, 12);
  } else {
    ctx.arc(0, 10, 11, 0.15, Math.PI - 0.15);
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(17,19,17,0.8)";
  ctx.fillRect(-citizen.radius, citizen.radius + 20, citizen.radius * 2, 12);
  ctx.fillStyle = citizen.patience > 0.32 ? "#ffca74" : "#d6451b";
  ctx.fillRect(-citizen.radius, citizen.radius + 20, citizen.radius * 2 * clamp(citizen.patience, 0, 1), 12);
  ctx.restore();
}

function drawExitSprite(ctx: CanvasRenderingContext2D, sprite: ExitSprite, elapsed: number) {
  const alpha = sprite.life / sprite.maxLife;
  const smile = sprite.tone === "served";
  const scale = smile ? 1 + (1 - alpha) * 0.15 : 1 - (1 - alpha) * 0.18;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(sprite.x, sprite.y + Math.sin(elapsed / 80 + sprite.id) * 5);
  ctx.scale(scale, scale);

  ctx.fillStyle = smile ? "rgba(255,202,116,0.2)" : "rgba(214,69,27,0.22)";
  ctx.beginPath();
  ctx.arc(0, 0, 54, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = sprite.hue;
  ctx.beginPath();
  ctx.arc(0, 0, 31, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111311";
  ctx.beginPath();
  ctx.arc(-9, -6, 4, 0, Math.PI * 2);
  ctx.arc(9, -6, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#111311";
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (smile) {
    ctx.arc(0, 7, 12, 0.15, Math.PI - 0.15);
  } else {
    ctx.moveTo(-12, 12);
    ctx.lineTo(0, 3);
    ctx.lineTo(12, 12);
  }
  ctx.stroke();

  ctx.fillStyle = smile ? "#ffca74" : "#ff8f58";
  ctx.font = '900 22px "Geist", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(smile ? "Atendeu!" : "Perdeu!", 0, -46);
  ctx.restore();
}

function drawHazardStripe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.fillStyle = "#111311";
  ctx.fillRect(x, y, width, height);

  const stripeWidth = 34;
  for (let offset = -width; offset < width * 2; offset += stripeWidth) {
    ctx.fillStyle = offset / stripeWidth % 2 === 0 ? "#ffca74" : "#111311";
    ctx.beginPath();
    ctx.moveTo(x + offset, y + height);
    ctx.lineTo(x + offset + stripeWidth, y);
    ctx.lineTo(x + offset + stripeWidth * 1.7, y);
    ctx.lineTo(x + offset + stripeWidth * 0.7, y + height);
    ctx.closePath();
    ctx.fill();
  }
}
