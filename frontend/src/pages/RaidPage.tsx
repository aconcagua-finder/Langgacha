import { useEffect, useMemo, useState } from "react";

import {
  attackRaidBoss,
  getNextRaidCard,
  getRaidStatus,
  type NextRaidCard,
  type RaidAttackResult,
  type RaidStatus,
} from "../api/raid";
import { QuizPhase } from "../components/battle/QuizPhase";
import { CardMini } from "../components/card/CardMini";
import { getRarityTheme, getTypeTheme } from "../styles/card-themes";
import { RARITY_LABELS, TYPE_LABELS, label } from "../shared/labels";

type RaidPageProps = {
  embedded?: boolean;
  onOverviewChange?: (isOverview: boolean) => void;
};

type Phase = "overview" | "quiz" | "result";
type QuizFeedback = {
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

const hpBarClass = (pct: number) => {
  if (pct >= 0.6) return "bg-emerald-400";
  if (pct >= 0.3) return "bg-amber-400";
  return "bg-rose-400";
};

const QUIZ_AUTO_ADVANCE_MS = 1500;

const getQuizCorrectAnswer = (card: NextRaidCard): string =>
  card.quiz.type === "translate" ? card.card.translationRu : card.card.word;

function RaidModeIcon() {
  return <div className="text-2xl leading-none">🐉</div>;
}

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

          <div>
            <div className="text-3xl font-extrabold tracking-tight">{status.bossWord}</div>
            <div className="mt-1 text-sm text-slate-200/60">{status.bossTranslationRu}</div>
          </div>
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

function RaidOverviewCard({
  status,
  canAttack,
  loading,
  error,
  onAttack,
}: {
  status: RaidStatus | null;
  canAttack: boolean;
  loading: boolean;
  error: string | null;
  onAttack: () => void;
}) {
  const usedText = status ? `${status.usedCards}/${status.totalCards}` : "—";
  const hpText = status
    ? `${status.currentHp.toLocaleString()}/${status.bossHp.toLocaleString()}`
    : "—";

  const overviewState = (() => {
    if (!status) return null;
    if (status.totalCards === 0) {
      return {
        tone: "neutral",
        copy: "Нет карт для атаки. Откройте бустер, чтобы вступить в рейд.",
      } as const;
    }
    if (status.defeated) {
      return {
        tone: "success",
        copy: "Босс уже повержен. Награды за победу доступны и завтра придёт новый противник.",
      } as const;
    }
    if (status.usedCards >= status.totalCards) {
      return {
        tone: "warning",
        copy: "Карты на сегодня закончились. Завтра появится новый босс и новая попытка.",
      } as const;
    }
    return {
      tone: "ready",
      copy: "",
    } as const;
  })();

  const overviewStateClass =
    overviewState?.tone === "success"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-50"
      : overviewState?.tone === "warning"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-50"
        : "border-slate-800/60 bg-slate-950/40 text-slate-200/70";

  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-800/60 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.16),transparent_34%)]" />

      <div className="relative flex h-full flex-col gap-4">
        <header className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-100 shadow-lg shadow-indigo-950/20">
            <RaidModeIcon />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-50">Рейд</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-200/70">
              Каждый день появляется новый босс. Отправляйте карты в бой: каждая атака
              это квиз, правильный ответ даёт бонус к урону.
            </p>
          </div>
        </header>

        <div className="rounded-xl border border-slate-700/40 bg-slate-950/45 px-4 py-3">
          <div className="text-lg font-extrabold text-slate-50">{status?.bossWord ?? "—"}</div>
          <div className="mt-0.5 text-sm text-slate-200/50">
            {status?.bossTranslationRu ?? "—"}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/40 bg-slate-950/45 px-4 py-3">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200/70">
            <div>
              HP босса <span className="font-mono font-bold text-slate-50">{hpText}</span>
            </div>
            <div>
              Карты <span className="font-mono font-bold text-slate-50">{usedText}</span>
            </div>
            <div>
              Ваш урон{" "}
              <span className="font-mono font-bold text-slate-50">
                {status?.playerDamage.toLocaleString() ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {overviewState && overviewState.tone !== "ready" ? (
          <div className={["rounded-xl px-4 py-2.5 text-sm", overviewStateClass].join(" ")}>
            {overviewState.copy}
          </div>
        ) : null}

        <div className="mt-auto flex justify-end">
          <button
            type="button"
            onClick={onAttack}
            disabled={!canAttack || loading}
            className="btn-primary w-full sm:w-auto"
          >
            {loading ? "Подготавливаю карту…" : "Атаковать босса"}
          </button>
        </div>
      </div>
    </section>
  );
}

export function RaidPage({ embedded = false, onOverviewChange }: RaidPageProps) {
  const [phase, setPhase] = useState<Phase>("overview");
  const [status, setStatus] = useState<RaidStatus | null>(null);
  const [nextCard, setNextCard] = useState<NextRaidCard | null>(null);
  const [result, setResult] = useState<RaidAttackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<QuizFeedback | null>(null);

  useEffect(() => {
    onOverviewChange?.(phase === "overview");
  }, [phase, onOverviewChange]);

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

  useEffect(() => {
    if (phase !== "quiz" || !quizFeedback?.isCorrect || !result) return undefined;

    const timeoutId = window.setTimeout(() => {
      setPhase("result");
    }, QUIZ_AUTO_ADVANCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [phase, quizFeedback?.isCorrect, result]);

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

  const resetToOverview = () => {
    setPhase("overview");
    setNextCard(null);
    setResult(null);
    setQuizFeedback(null);
    setError(null);
  };

  const startAttack = async () => {
    if (!canAttack) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setQuizFeedback(null);
    try {
      const card = await getNextRaidCard();
      setNextCard(card);
      if (!card) {
        await refresh();
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
      setQuizFeedback({
        selectedAnswer: answer,
        correctAnswer: getQuizCorrectAnswer(nextCard),
        isCorrect: res.correct,
      });
      setPhase("quiz");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setQuizFeedback(null);
    } finally {
      setLoading(false);
    }
  };

  const content =
    phase === "overview" ? (
      <RaidOverviewCard
        status={status}
        canAttack={canAttack}
        loading={loading}
        error={error}
        onAttack={() => void startAttack()}
      />
    ) : (
      <>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-50">Рейд дня</h2>
            {status ? (
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200/70">
                <div>
                  Карты на сегодня: <span className="font-mono">{usedText}</span>
                </div>
                <div>
                  Ваш урон:{" "}
                  <span className="font-mono">{status.playerDamage.toLocaleString()}</span>
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={resetToOverview}
            className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-50 hover:bg-slate-700"
          >
            Назад
          </button>
        </header>

        {error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {status ? <BossCard status={status} /> : null}

        {phase === "quiz" && nextCard ? (
          <section className="grid gap-6 md:grid-cols-[240px_1fr]">
            <div className="flex justify-center md:justify-start">
              <CardMini card={nextCard.card} tilt={false} />
            </div>

            <div className="flex flex-col gap-4">
              <QuizPhase
                type={nextCard.quiz.type}
                question={nextCard.quiz.question}
                options={nextCard.quiz.options}
                disabled={loading}
                correctAnswer={quizFeedback?.correctAnswer}
                showResult={Boolean(quizFeedback)}
                selectedAnswer={quizFeedback?.selectedAnswer}
                resultCorrect={quizFeedback?.isCorrect}
                onContinue={
                  quizFeedback && !quizFeedback.isCorrect && result
                    ? () => setPhase("result")
                    : undefined
                }
                onPick={onAnswer}
              />
            </div>
          </section>
        ) : null}

        {phase === "result" && status && result ? (
          <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={[
                  "rounded-full px-3 py-1 text-xs font-extrabold",
                  result.correct
                    ? "bg-emerald-400/20 text-emerald-100"
                    : "bg-rose-500/20 text-rose-100",
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
                Пыль: <span className="font-mono">+{result.dustEarned}</span>
              </div>
              <div className="rounded-xl bg-slate-950/40 px-4 py-3">
                Босс:{" "}
                <span className="font-mono">
                  {result.bossHpBefore.toLocaleString()} → {result.bossCurrentHp.toLocaleString()}
                </span>
              </div>
            </div>

            {result.wordXpGain ? (
              <div className="mt-4 rounded-2xl border border-slate-800/60 bg-slate-950/35 p-4 text-sm text-slate-200/80">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    Прогресс слова <span className="font-mono">{result.wordXpGain.word}</span>
                  </div>
                  <div className="font-mono">
                    Lv {result.wordXpGain.oldLevel}
                    {result.wordXpGain.leveledUp
                      ? ` → ${result.wordXpGain.newLevel}`
                      : ` · ${result.wordXpGain.newLevel}`}
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-200/65">
                  +{result.wordXpGain.xpGained} XP ·
                  {" "}
                  {result.wordXpGain.xpForNextLevel > 0
                    ? `${result.wordXpGain.xpInCurrentLevel}/${result.wordXpGain.xpForNextLevel}`
                    : "MAX"}
                </div>
              </div>
            ) : null}

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
                Победа! Награды: <span className="font-mono">{result.victoryDust ?? 100}</span>{" "}
                Пыль + <span className="font-mono">{result.victoryBoosters ?? 1}</span> бустер.
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={resetToOverview}
                className="rounded-xl border border-slate-800/60 bg-slate-950/40 px-5 py-3 text-sm font-extrabold text-slate-200/80 hover:bg-slate-900/60"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={() => void startAttack()}
                disabled={!canAttack || loading}
                className="btn-primary"
              >
                {loading ? "Загружаю…" : "Следующая карта"}
              </button>
            </div>
          </section>
        ) : null}
      </>
    );

  if (embedded) {
    return <section className="flex h-full flex-col gap-6">{content}</section>;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-8 px-6 py-10">
      {content}
    </main>
  );
}
