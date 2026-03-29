import { useCallback, useEffect, useMemo, useState } from "react";

import { API_URL } from "../api/config";
import { getBoosterStatus, openBooster, type BoosterInfo } from "../api/boosters";
import type { GeneratedCard } from "../types/card";
import { BoosterPack } from "../components/booster/BoosterPack";
import { BoosterRevealGrid } from "../components/booster/BoosterRevealGrid";
import { usePlayer } from "../contexts/PlayerContext";
import { useConfig } from "../contexts/ConfigContext";

type Phase = "pack" | "revealing";

export function BoosterPage() {
  const showDebug = import.meta.env.DEV;
  const { config } = useConfig();
  const { player } = usePlayer();
  const [phase, setPhase] = useState<Phase>("pack");
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [allRevealed, setAllRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boosterInfo, setBoosterInfo] = useState<BoosterInfo | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasPack = cards.length > 0;

  useEffect(() => {
    let cancelled = false;
    getBoosterStatus()
      .then((info) => {
        if (!cancelled) setBoosterInfo(info);
      })
      .catch(() => {
        // ignore status errors, page can still render
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!boosterInfo?.nextRechargeAt || boosterInfo.count >= boosterInfo.maxBoosters) {
      setSecondsLeft(null);
      return;
    }

    const nextAtMs = new Date(boosterInfo.nextRechargeAt).getTime();
    if (!Number.isFinite(nextAtMs)) {
      setSecondsLeft(null);
      return;
    }

    let handledZero = false;
    const tick = () => {
      const diffMs = nextAtMs - Date.now();
      const left = Math.max(0, Math.ceil(diffMs / 1000));
      setSecondsLeft(left);
      if (left === 0 && !handledZero) {
        handledZero = true;
        setBoosterInfo((prev) =>
          prev ? { ...prev, count: Math.min(prev.maxBoosters, prev.count + 1) } : prev,
        );
        void getBoosterStatus()
          .then((info) => setBoosterInfo(info))
          .catch(() => {
            // ignore
          });
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [boosterInfo?.count, boosterInfo?.maxBoosters, boosterInfo?.nextRechargeAt]);

  const boosterDots = useMemo(() => {
    if (!boosterInfo) return null;
    return Array.from({ length: boosterInfo.maxBoosters }, (_, i) => {
      const filled = i < boosterInfo.count;
      return (
        <span key={i} className={filled ? "text-sky-400" : "text-slate-800"}>
          ●
        </span>
      );
    });
  }, [boosterInfo]);

  const timerText = useMemo(() => {
    if (secondsLeft == null) return null;
    const mm = Math.floor(secondsLeft / 60);
    const ss = secondsLeft % 60;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }, [secondsLeft]);

  const onOpen = useCallback(async () => {
    if (hasPack && !allRevealed) return;
    setLoading(true);
    setError(null);
    setAllRevealed(false);

    try {
      const res = await openBooster();
      setCards(res.cards);
      setBoosterInfo(res.boosterInfo);
      setPhase("revealing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setPhase("pack");
    } finally {
      setLoading(false);
    }
  }, [allRevealed, hasPack]);

  const onDone = () => {
    setCards([]);
    setAllRevealed(false);
    setPhase("pack");
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Бустер</h1>
        {player ? (
          <div className="text-sm text-slate-200/70">
            Ранг:{" "}
            <span className="font-mono">
              {player.collectionLevel} {player.collectionGachaName}
            </span>
            {" "}· Слова: <span className="font-mono">{player.wordsWidth}/{player.wordsWidthNeeded}</span>
          </div>
        ) : null}
        {boosterInfo ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200/70">
            <div className="flex items-center gap-2">
              <span>Бустеры:</span>
              <span className="font-mono tracking-wide">{boosterDots}</span>
              <span className="font-mono">
                {boosterInfo.count}/{boosterInfo.maxBoosters}
              </span>
            </div>
            {player ? (
              <div className="text-xs text-slate-200/50">
                До гарантии SR+:{" "}
                {config?.pityThreshold != null ? (
                  <span className="font-mono">
                    {Math.min(config.pityThreshold, player.pityCounter)}/{config.pityThreshold}
                  </span>
                ) : (
                  <span className="font-mono">—</span>
                )}
              </div>
            ) : null}
            {timerText && boosterInfo.count < boosterInfo.maxBoosters ? (
              <div>
                Следующий: <span className="font-mono">{timerText}</span>
              </div>
            ) : null}
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
          disabled={loading || boosterInfo?.count === 0}
          disabledLabel={loading ? "Открываю…" : "Нет бустеров"}
          level={player?.collectionGachaName ?? "Bronze"}
          cardCount={config?.boosterSize}
          packName={`${player?.collectionGachaName ?? "Bronze"} Pack`}
        />
      ) : null}

      {phase === "revealing" && cards.length ? (
        <section className="flex flex-col items-center gap-6">
          <BoosterRevealGrid cards={cards} onAllRevealed={() => setAllRevealed(true)} />

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpen}
              disabled={!allRevealed || loading || boosterInfo?.count === 0}
              className="btn-primary"
            >
              {loading
                ? "Открываю…"
                : (boosterInfo?.count ?? 0) > 0
                  ? "Открыть ещё"
                  : "Нет бустеров"}
            </button>

            <button
              type="button"
              onClick={onDone}
              className="rounded-xl border border-slate-800/60 bg-slate-950/40 px-5 py-3 text-sm font-extrabold text-slate-200/80 hover:bg-slate-900/60"
            >
              Готово
            </button>

            {allRevealed && (boosterInfo?.count ?? 0) === 0 && timerText ? (
              <div className="text-sm text-slate-200/70">
                Следующий: <span className="font-mono">{timerText}</span>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
