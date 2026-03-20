import { useEffect, useMemo, useState } from "react";

import {
  attackRaidBoss,
  getNextRaidCard,
  getRaidStatus,
  type NextRaidCard,
  type RaidAttackResult,
  type RaidStatus,
} from "../api/raid";
import { CardMini } from "../components/card/CardMini";
import { getRarityTheme, getTypeTheme } from "../styles/card-themes";
import { RARITY_LABELS, TYPE_LABELS, label } from "../shared/labels";

type Phase = "overview" | "quiz" | "result";

const hpBarClass = (pct: number) => {
  if (pct >= 0.6) return "bg-emerald-400";
  if (pct >= 0.3) return "bg-amber-400";
  return "bg-rose-400";
};

function BossCard({ status }: { status: RaidStatus }) {
  const rarityTheme = getRarityTheme(status.bossRarity);
  const typeTheme = getTypeTheme(status.bossType);
  const pct = status.bossHp > 0 ? status.currentHp / status.bossHp : 0;

  return (
    <div
      className={[
        "relative w-full overflow-hidden rounded-2xl border bg-slate-900/60 p-6 backdrop-blur",
        rarityTheme.glow,
        rarityTheme.frameFx,
      ].join(" ")}
      style={{ borderColor: rarityTheme.border }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-1 text-xs font-extrabold text-slate-950"
              style={{ backgroundColor: rarityTheme.badge }}
              title={label(RARITY_LABELS, status.bossRarity)}
            >
              {status.bossRarity}
            </span>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-xs font-semibold text-slate-100/90">
              <span>{typeTheme.emoji}</span>
              <span>{label(TYPE_LABELS, status.bossType)}</span>
            </div>
          </div>

          <div className="text-3xl font-extrabold tracking-tight">{status.bossWord}</div>
          {status.bossFlavorText ? (
            <div className="max-w-prose text-sm text-slate-200/70">
              {status.bossFlavorText}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl bg-slate-950/40 px-4 py-3 text-xs text-slate-200/80">
          <div className="flex items-center justify-between gap-6 font-mono">
            <span>ATK {status.bossAtk}</span>
            <span>DEF {status.bossDef}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-slate-200/70">
          <span>HP</span>
          <span className="font-mono">
            {status.currentHp.toLocaleString()}/{status.bossHp.toLocaleString()}
          </span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-950/50">
          <div
            className={["h-full transition-[width] duration-500", hpBarClass(pct)].join(" ")}
            style={{ width: `${Math.max(0, Math.min(1, pct)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function RaidPage() {
  const [phase, setPhase] = useState<Phase>("overview");
  const [status, setStatus] = useState<RaidStatus | null>(null);
  const [nextCard, setNextCard] = useState<NextRaidCard | null>(null);
  const [result, setResult] = useState<RaidAttackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const data = await getRaidStatus();
    setStatus(data);
  };

  useEffect(() => {
    let cancelled = false;
    getRaidStatus()
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const usedText = useMemo(() => {
    if (!status) return null;
    return `${status.usedCards}/${status.totalCards}`;
  }, [status]);

  const canAttack = Boolean(
    status &&
      !status.defeated &&
      status.totalCards > 0 &&
      status.usedCards < status.totalCards,
  );

  const startAttack = async () => {
    if (!canAttack) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const card = await getNextRaidCard();
      setNextCard(card);
      if (!card) {
        setPhase("overview");
      } else {
        setPhase("quiz");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const onAnswer = async (answer: string) => {
    if (!nextCard || !status) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attackRaidBoss(nextCard.card.id, answer);
      setResult(res);
      setPhase("result");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Рейд дня</h1>
        {status ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200/70">
            <div>
              Карты на сегодня: <span className="font-mono">{usedText}</span>
            </div>
            <div>
              Ваш урон: <span className="font-mono">{status.playerDamage.toLocaleString()}</span>
            </div>
          </div>
        ) : null}
      </header>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {status ? <BossCard status={status} /> : null}

      {phase === "overview" && status ? (
        <section className="flex flex-col gap-4">
          {status.totalCards === 0 ? (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 text-sm text-slate-200/70">
              Нет карт для атаки. Откройте бустер!
            </div>
          ) : status.defeated ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-50">
              Рейд завершён! Награды: <span className="font-mono">100</span> Dust +{" "}
              <span className="font-mono">1</span> бустер.
            </div>
          ) : status.usedCards >= status.totalCards ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-50">
              Босс выстоял! Вы нанесли{" "}
              <span className="font-mono">{status.playerDamage.toLocaleString()}</span> урона.
              Завтра будет новый босс.
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={startAttack}
              disabled={!canAttack || loading}
              className={[
                "rounded-xl px-5 py-3 text-sm font-extrabold transition-colors",
                canAttack && !loading
                  ? "bg-sky-500 text-slate-950 hover:bg-sky-400"
                  : "bg-slate-800 text-slate-400",
              ].join(" ")}
            >
              {loading ? "Загружаю…" : "Атаковать"}
            </button>
          </div>
        </section>
      ) : null}

      {phase === "quiz" && nextCard ? (
        <section className="grid gap-6 md:grid-cols-[240px_1fr]">
          <div className="flex justify-center md:justify-start">
            <CardMini card={nextCard.card} />
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5">
              <div className="text-sm font-extrabold text-slate-100">{nextCard.quiz.question}</div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {nextCard.quiz.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={loading}
                    onClick={() => onAnswer(opt)}
                    className="rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3 text-left text-sm font-semibold text-slate-200/80 hover:bg-slate-900/60 disabled:opacity-60"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {phase === "result" && status && result ? (
        <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={[
                "rounded-full px-3 py-1 text-xs font-extrabold",
                result.correct ? "bg-emerald-400/20 text-emerald-100" : "bg-rose-500/20 text-rose-100",
              ].join(" ")}
            >
              {result.correct ? "Правильно" : "Неправильно"}
            </div>
            {result.inspirationApplied ? (
              <div className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-extrabold text-sky-100">
                Inspiration +15% ATK
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-200/80 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-950/40 px-4 py-3">
              Бой:{" "}
              <span className="font-mono">
                {result.cardHp.toLocaleString()} → {result.cardFinalHp.toLocaleString()}
              </span>
            </div>
            <div className="rounded-xl bg-slate-950/40 px-4 py-3">
              Dust: <span className="font-mono">+{result.dustEarned}</span>
            </div>
            <div className="rounded-xl bg-slate-950/40 px-4 py-3">
              Босс:{" "}
              <span className="font-mono">
                {result.bossHpBefore.toLocaleString()} → {result.bossCurrentHp.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-200/80 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-950/40 px-4 py-3">
              Нанесено:{" "}
              <span className="font-mono">{result.totalDamageDealt.toLocaleString()}</span> за{" "}
              <span className="font-mono">{result.rounds}</span> удар(ов)
            </div>
            <div className="rounded-xl bg-slate-950/40 px-4 py-3">
              Получено:{" "}
              <span className="font-mono">{result.totalDamageTaken.toLocaleString()}</span>
            </div>
            <div
              className={[
                "rounded-xl px-4 py-3 font-extrabold",
                result.cardSurvived
                  ? "bg-emerald-500/10 text-emerald-50"
                  : "bg-rose-500/10 text-rose-50",
              ].join(" ")}
            >
              {result.cardSurvived ? "Карта выстояла!" : "Ваша карта погибла!"}
            </div>
          </div>

          {result.bossDefeated ? (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-50">
              Победа! Награды: <span className="font-mono">{result.victoryDust ?? 100}</span> Dust +{" "}
              <span className="font-mono">{result.victoryBoosters ?? 1}</span> бустер.
            </div>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setPhase("overview");
                setNextCard(null);
                setResult(null);
              }}
              className="rounded-xl border border-slate-800/60 bg-slate-950/40 px-5 py-3 text-sm font-extrabold text-slate-200/80 hover:bg-slate-900/60"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={startAttack}
              disabled={!canAttack || loading}
              className={[
                "rounded-xl px-5 py-3 text-sm font-extrabold transition-colors",
                canAttack && !loading
                  ? "bg-sky-500 text-slate-950 hover:bg-sky-400"
                  : "bg-slate-800 text-slate-400",
              ].join(" ")}
            >
              {loading ? "Загружаю…" : "Следующая карта"}
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
