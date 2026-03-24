import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { craftCard, getCraftStatus, type CraftResult, type CraftStatus } from "../api/craft";
import { usePlayer } from "../contexts/PlayerContext";
import { getRarityTheme } from "../styles/card-themes";
import { CardFace } from "../components/card/CardFace";

type CraftPageProps = {
  embedded?: boolean;
};

const RARITIES = ["C", "UC", "R", "SR", "SSR"] as const;

const formatHms = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export function CraftPage({ embedded = false }: CraftPageProps) {
  const { player, refresh } = usePlayer();
  const [status, setStatus] = useState<CraftStatus | null>(null);
  const [selected, setSelected] = useState<string>("C");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CraftResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCraftStatus()
      .then((s) => {
        if (!cancelled) setStatus(s);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const nextAt = status?.nextCraftAt ?? player?.nextCraftAt ?? null;
    const available = status?.available ?? player?.craftAvailable ?? true;

    if (available || !nextAt) {
      setSecondsLeft(null);
      return;
    }

    const targetMs = new Date(nextAt).getTime();
    if (!Number.isFinite(targetMs)) {
      setSecondsLeft(null);
      return;
    }

    const tick = () => {
      const diffMs = targetMs - Date.now();
      const left = Math.max(0, Math.ceil(diffMs / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        void getCraftStatus()
          .then((s) => setStatus(s))
          .catch(() => {
            // ignore
          });
        void refresh();
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [player?.craftAvailable, player?.nextCraftAt, refresh, status?.available, status?.nextCraftAt]);

  const unlocked = player?.unlockedRarities ?? ["C"];
  const dust = player?.dust ?? 0;
  const costs = status?.costs ?? {};
  const selectedCost = costs[selected] ?? 0;

  const craftAvailable = status?.available ?? player?.craftAvailable ?? true;
  const nextCraftAt = status?.nextCraftAt ?? player?.nextCraftAt ?? null;

  const timerText = useMemo(() => (secondsLeft == null ? null : formatHms(secondsLeft)), [secondsLeft]);

  const canAffordSelected = dust >= selectedCost;
  const selectedUnlocked = unlocked.includes(selected);
  const canCraftNow = craftAvailable && selectedUnlocked && canAffordSelected && !loading;

  const onCraft = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await craftCard(selected);
      setResult(res);
      await refresh();
      const nextStatus = await getCraftStatus();
      setStatus(nextStatus);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Крафт</h1>
        <div className="text-sm text-slate-200/70">Выбери рарность и создай карту</div>
      </header>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-200/70">
            Пыль: <span className="font-mono text-slate-100">{dust}</span>
          </div>
          <div className="text-sm text-slate-200/70">
            {craftAvailable ? (
              <>
                Крафтов сегодня: <span className="font-mono text-slate-100">0/1</span>
              </>
            ) : (
              <>
                Крафтов сегодня: <span className="font-mono text-slate-100">1/1</span>
                {timerText ? (
                  <>
                    {" "}
                    · Следующий через: <span className="font-mono text-slate-100">{timerText}</span>
                  </>
                ) : nextCraftAt ? (
                  <>
                    {" "}
                    · Следующий: <span className="font-mono text-slate-100">{nextCraftAt}</span>
                  </>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {RARITIES.map((r) => {
            const cost = costs[r] ?? 0;
            const isUnlocked = unlocked.includes(r);
            const canAfford = dust >= cost;
            const disabled = !isUnlocked || !canAfford || !craftAvailable || loading;
            const selectedFlag = selected === r;
            const rarityTheme = getRarityTheme(r);

            const subLabel = !isUnlocked
              ? "🔒"
              : !canAfford
                ? "Не хватает"
                : craftAvailable
                  ? "Пыль"
                  : "Завтра";

            return (
              <button
                key={r}
                type="button"
                onClick={() => setSelected(r)}
                disabled={disabled}
                className={[
                  "rounded-2xl border px-4 py-4 text-left transition-colors",
                  selectedFlag
                    ? "bg-slate-950/40 text-slate-50"
                    : "bg-slate-950/20 text-slate-200/80 hover:bg-slate-950/30",
                  disabled ? "opacity-60 hover:bg-slate-950/20" : "",
                ].join(" ")}
                style={{
                  borderColor: selectedFlag ? rarityTheme.border : "rgba(148,163,184,0.18)",
                }}
                aria-label={`Выбрать ${r}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-extrabold">{r}</div>
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: rarityTheme.badge }}
                  />
                </div>
                <div className="mt-2 text-lg font-extrabold leading-tight">
                  {cost ? <span className="font-mono">{cost}</span> : "—"}
                </div>
                <div
                  className={[
                    "mt-1 text-xs",
                    !isUnlocked
                      ? "text-slate-200/50"
                      : !canAfford
                        ? "text-rose-200/70"
                        : "text-slate-200/60",
                  ].join(" ")}
                >
                  {subLabel}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onCraft}
            disabled={!canCraftNow}
            className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60 disabled:hover:bg-sky-500"
          >
            {loading ? "Создаю…" : "Создать карту"}
          </button>
          {!selectedUnlocked ? (
            <div className="text-sm text-slate-200/70">Рарность ещё не разблокирована</div>
          ) : !canAffordSelected ? (
            <div className="text-sm text-rose-200/80">Не хватает Пыли</div>
          ) : !craftAvailable ? (
            <div className="text-sm text-slate-200/70">Крафт доступен 1 раз в день</div>
          ) : null}
        </div>
      </section>

      {result ? (
        <section className="flex flex-col items-center gap-6">
          <div className="w-full max-w-md animate-[fadeIn_500ms_ease-out]">
            <CardFace card={result.card} />
          </div>
          <div className="text-sm text-slate-200/70">
            −<span className="font-mono">{result.dustSpent}</span> Пыль · Осталось{" "}
            <span className="font-mono">{result.dustRemaining}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/collection"
              className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700"
            >
              В коллекцию
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );

  if (embedded) {
    return <section className="flex flex-col gap-8">{content}</section>;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-8 px-6 py-10">
      {content}
    </main>
  );
}
