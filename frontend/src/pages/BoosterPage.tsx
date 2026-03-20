import { useMemo, useState } from "react";

import { API_URL } from "../api/config";
import { openBooster } from "../api/boosters";
import type { GeneratedCard } from "../types/card";
import { BoosterPack } from "../components/booster/BoosterPack";
import { BoosterCardReveal } from "../components/booster/BoosterCardReveal";
import { BoosterSummary } from "../components/booster/BoosterSummary";
import { usePlayer } from "../contexts/PlayerContext";
import { LEVEL_LABELS, label } from "../shared/labels";

type Phase = "pack" | "revealing" | "summary";

export function BoosterPage() {
  const showDebug = import.meta.env.DEV;
  const { player } = usePlayer();
  const [phase, setPhase] = useState<Phase>("pack");
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedFlags, setRevealedFlags] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentCard = cards[currentIndex];
  const currentRevealed = revealedFlags[currentIndex] ?? false;

  const dots = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);

  const onOpen = async () => {
    setLoading(true);
    setError(null);
    setPhase("pack");
    setCards([]);
    setCurrentIndex(0);
    setRevealedFlags([false, false, false, false, false]);

    try {
      const next = await openBooster();
      setCards(next);
      setPhase("revealing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setPhase("pack");
    } finally {
      setLoading(false);
    }
  };

  const onReveal = () => {
    setRevealedFlags((prev) => {
      if (prev[currentIndex]) return prev;
      const next = prev.length ? [...prev] : [false, false, false, false, false];
      next[currentIndex] = true;
      return next;
    });
  };

  const onNext = () => {
    if (!currentRevealed) return;
    if (currentIndex >= cards.length - 1) {
      setPhase("summary");
      return;
    }
    setCurrentIndex((i) => Math.min(cards.length - 1, i + 1));
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Бустер</h1>
        {player ? (
          <div className="text-sm text-slate-200/70">
            Уровень: <span className="font-mono">{label(LEVEL_LABELS, player.level)}</span>{" "}
            · Освоено:{" "}
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

      {phase === "revealing" && currentCard ? (
        <section className="flex flex-col items-center gap-6">
          <BoosterCardReveal card={currentCard} revealed={currentRevealed} onReveal={onReveal} />

          <div className="flex flex-col items-center gap-3">
            <div className="text-sm font-semibold text-slate-200/80">
              Карта{" "}
              <span className="font-mono">
                {currentIndex + 1}/{cards.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {dots.map((i) => (
                <span
                  key={i}
                  className={[
                    "h-2.5 w-2.5 rounded-full transition-colors",
                    i === currentIndex ? "bg-sky-400" : "bg-slate-800/70",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={!currentRevealed}
            className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700 disabled:opacity-60 disabled:hover:bg-slate-800"
          >
            {currentIndex >= cards.length - 1 ? "Готово" : "Следующая →"}
          </button>
        </section>
      ) : null}

      {phase === "summary" ? (
        <section className="flex flex-col items-center gap-6">
          <BoosterSummary cards={cards} />
          <button
            type="button"
            onClick={onOpen}
            className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700"
          >
            Открыть ещё
          </button>
        </section>
      ) : null}
    </main>
  );
}
