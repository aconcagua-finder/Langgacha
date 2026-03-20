import { useEffect, useMemo, useRef, useState } from "react";

import { API_URL } from "../api/config";
import { openBooster } from "../api/boosters";
import type { GeneratedCard } from "../types/card";
import { BoosterPack } from "../components/booster/BoosterPack";
import { BoosterReveal } from "../components/booster/BoosterReveal";
import { usePlayer } from "../contexts/PlayerContext";

type Phase = "pack" | "revealing" | "done";

export function BoosterPage() {
  const showDebug = import.meta.env.DEV;
  const { player } = usePlayer();
  const [phase, setPhase] = useState<Phase>("pack");
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const canOpenMore = useMemo(() => phase === "done" && !loading, [phase, loading]);

  const onOpen = async () => {
    clearTimers();
    setLoading(true);
    setError(null);
    setPhase("pack");
    setCards([]);
    setVisibleCount(0);

    try {
      const next = await openBooster();
      setCards(next);
      setPhase("revealing");

      for (let i = 1; i <= next.length; i += 1) {
        const id = window.setTimeout(() => setVisibleCount(i), i * 500);
        timersRef.current.push(id);
      }
      const doneId = window.setTimeout(() => setPhase("done"), (next.length + 1) * 500);
      timersRef.current.push(doneId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setPhase("pack");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Бустер</h1>
        {player ? (
          <div className="text-sm text-slate-200/70">
            Уровень: <span className="font-mono">{player.level}</span> · Освоено:{" "}
            <span className="font-mono">
              {player.progressToNext}/{player.progressNeeded}
            </span>
          </div>
        ) : null}
        {showDebug ? (
          <p className="text-sm text-slate-200/70">
            API: <span className="font-mono">{API_URL}</span>
          </p>
        ) : null}
      </header>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {phase === "pack" ? (
        <BoosterPack
          onOpen={onOpen}
          disabled={loading}
          level={player?.level ?? "Beginner"}
          packName={
            player?.level === "Elementary"
              ? "Пак Повседневного"
              : player?.level === "Intermediate"
                ? "Пак Уличного"
                : player?.level === "Advanced"
                  ? "Пак Литературного"
                  : player?.level === "Master"
                    ? "Пак Легендарного"
                    : "Пак Новичка"
          }
        />
      ) : null}

      {phase !== "pack" ? (
        <section className="flex flex-col items-center gap-6">
          <BoosterReveal cards={cards} visibleCount={visibleCount} />
          {canOpenMore ? (
            <button
              type="button"
              onClick={onOpen}
              className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700"
            >
              Открыть ещё
            </button>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
