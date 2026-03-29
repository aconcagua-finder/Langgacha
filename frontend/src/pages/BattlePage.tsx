import { useCallback, useEffect, useMemo, useState } from "react";

import type { BattleAnswerResponse, BattleCardPublic, BattleStartResponse } from "../api/battle";
import { answerBattle, startBattle } from "../api/battle";
import { listCards } from "../api/cards";
import { BattleArena } from "../components/battle/BattleArena";
import { BattleResult } from "../components/battle/BattleResult";
import { CombatPhase } from "../components/battle/CombatPhase";
import { QuizPhase } from "../components/battle/QuizPhase";
import { RoundResult } from "../components/battle/RoundResult";
import { useConfig } from "../contexts/ConfigContext";
import { usePlayer } from "../contexts/PlayerContext";
import type { GeneratedCard } from "../types/card";
import { autoSelectBattleCards } from "../utils/autoSelectBattleCards";

type BattlePageProps = {
  embedded?: boolean;
  onOverviewChange?: (isOverview: boolean) => void;
};

type Phase = "overview" | "quiz" | "combat" | "roundResult" | "battleResult";
type QuizFeedback = {
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

const QUIZ_AUTO_ADVANCE_MS = 1500;
const DEFAULT_BATTLE_DECK_SIZE = 10;

function BattleModeIcon() {
  return <div className="text-2xl leading-none">⚔</div>;
}

function BattleOverviewCard({
  battleDeckSize,
  selectedCount,
  uniqueWords,
  collectionCount,
  cardsLoading,
  canStartBattle,
  submitting,
  error,
  onStart,
}: {
  battleDeckSize: number;
  selectedCount: number;
  uniqueWords: number;
  collectionCount: number;
  cardsLoading: boolean;
  canStartBattle: boolean;
  submitting: boolean;
  error: string | null;
  onStart: () => void;
}) {
  const deckToneClass = "border-slate-700/40 bg-slate-950/45 text-slate-200/70";

  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-800/60 bg-slate-950/55 p-6 shadow-2xl shadow-slate-950/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,113,113,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.14),transparent_34%)]" />

      <div className="relative flex h-full flex-col gap-4">
        <header className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/10 text-rose-100 shadow-lg shadow-rose-950/20">
            <BattleModeIcon />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-50">Бой</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-200/70">
              Автоподбор собирает колоду из карт, которые стоит повторить прямо сейчас.
              Каждый раунд начинается с квиза: правильный ответ усиливает атаку.
            </p>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div
          className={["rounded-xl border px-4 py-3", deckToneClass].join(" ")}
        >
          {cardsLoading ? (
            <div className="text-sm text-slate-200/70">Подбираю колоду…</div>
          ) : (
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200/70">
              <div>
                Колода{" "}
                <span className="font-mono font-bold text-slate-50">
                  {selectedCount}/{battleDeckSize}
                </span>
              </div>
              <div>
                Уникальных слов{" "}
                <span className="font-mono font-bold text-slate-50">{uniqueWords}</span>
              </div>
              <div>
                В коллекции{" "}
                <span className="font-mono font-bold text-slate-50">{collectionCount}</span>
              </div>
            </div>
          )}
        </div>

        {!cardsLoading && selectedCount === 0 ? (
          <div className="rounded-xl border border-slate-700/40 bg-slate-950/45 px-4 py-2.5 text-sm text-slate-200/70">
            Коллекция пуста. Сначала открой бустер.
          </div>
        ) : !cardsLoading && selectedCount < battleDeckSize ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-50">
            Бой начнётся с текущим набором карт.
          </div>
        ) : null}

        <div className="mt-auto flex justify-end">
          <button
            type="button"
            onClick={onStart}
            disabled={!canStartBattle}
            className="btn-primary w-full sm:w-auto"
          >
            {submitting ? "Подбираю колоду…" : "Начать бой"}
          </button>
        </div>
      </div>
    </section>
  );
}

export function BattlePage({ embedded = false, onOverviewChange }: BattlePageProps) {
  const { config } = useConfig();
  const { refresh: refreshPlayer } = usePlayer();
  const battleDeckSize = config?.battleDeckSize ?? DEFAULT_BATTLE_DECK_SIZE;

  const [phase, setPhase] = useState<Phase>("overview");
  const [collectionCards, setCollectionCards] = useState<GeneratedCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [startData, setStartData] = useState<BattleStartResponse | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [playerPos, setPlayerPos] = useState(0);
  const [botPos, setBotPos] = useState(0);
  const [playerWins, setPlayerWins] = useState(0);
  const [botWins, setBotWins] = useState(0);
  const [playerHp, setPlayerHp] = useState(0);
  const [botHp, setBotHp] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnswer, setLastAnswer] = useState<BattleAnswerResponse | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<QuizFeedback | null>(null);

  useEffect(() => {
    onOverviewChange?.(phase === "overview");
  }, [phase, onOverviewChange]);

  const loadCards = useCallback(async () => {
    setCardsLoading(true);
    setError(null);
    try {
      const data = await listCards({ sort: "newest" });
      setCollectionCards(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setCardsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  useEffect(() => {
    if (lastAnswer?.battleResult) void refreshPlayer();
  }, [lastAnswer?.battleResult, refreshPlayer]);

  useEffect(() => {
    if (phase !== "quiz" || !quizFeedback?.isCorrect || !lastAnswer) return undefined;

    const timeoutId = window.setTimeout(() => {
      setPhase("combat");
    }, QUIZ_AUTO_ADVANCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [phase, quizFeedback?.isCorrect, lastAnswer]);

  const autoSelectedCards = useMemo(
    () => autoSelectBattleCards(collectionCards, battleDeckSize),
    [collectionCards, battleDeckSize],
  );

  const playerCard: BattleCardPublic | null = useMemo(() => {
    if (!startData) return null;
    return startData.playerCards[playerPos] ?? null;
  }, [startData, playerPos]);

  const botCard: BattleCardPublic | null = useMemo(() => {
    if (!startData) return null;
    return startData.botCards[botPos] ?? null;
  }, [startData, botPos]);

  const uniqueWords = useMemo(
    () => new Set(collectionCards.map((card) => card.word)).size,
    [collectionCards],
  );

  const currentQuiz = playerCard?.quiz ?? null;
  const canStartBattle = autoSelectedCards.length > 0 && !cardsLoading && !submitting;

  const reset = () => {
    setPhase("overview");
    setStartData(null);
    setRoundNumber(1);
    setPlayerPos(0);
    setBotPos(0);
    setPlayerWins(0);
    setBotWins(0);
    setPlayerHp(0);
    setBotHp(0);
    setSubmitting(false);
    setError(null);
    setLastAnswer(null);
    setQuizFeedback(null);
    void loadCards();
  };

  const onStart = async () => {
    if (!autoSelectedCards.length) {
      setError("В коллекции нет карт для автоподбора. Сначала открой бустер.");
      return;
    }

    setError(null);
    setSubmitting(true);
    setQuizFeedback(null);
    setLastAnswer(null);

    try {
      const data = await startBattle(autoSelectedCards.map((card) => card.id));
      setStartData(data);
      setRoundNumber(1);
      setPlayerPos(0);
      setBotPos(0);
      setPlayerWins(0);
      setBotWins(0);
      setPlayerHp(data.playerCards[0]?.hp ?? 0);
      setBotHp(data.botCards[0]?.hp ?? 0);
      setPhase("quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  const onPickAnswer = async (answer: string) => {
    if (!startData || !currentQuiz) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await answerBattle({ battleId: startData.battleId, roundNumber, answer });
      setLastAnswer(res);
      setQuizFeedback({
        selectedAnswer: answer,
        correctAnswer: res.round.correctAnswer,
        isCorrect: res.round.quizCorrect,
      });
      if (res.round.winner === "player") {
        setPlayerWins((value) => value + 1);
      } else {
        setBotWins((value) => value + 1);
      }
      setPhase("quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setQuizFeedback(null);
      setPhase("quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const onCombatDone = (final: { playerHp: number; botHp: number }) => {
    setPlayerHp(final.playerHp);
    setBotHp(final.botHp);
    setPhase("roundResult");
  };

  const onNext = () => {
    if (!startData || !lastAnswer) return;
    if (lastAnswer.battleResult) {
      setPhase("battleResult");
      return;
    }

    const nextPlayerPos = playerPos + 1;
    const nextBotPos = botPos + 1;

    setPlayerPos(nextPlayerPos);
    setBotPos(nextBotPos);
    setPlayerHp(startData.playerCards[nextPlayerPos]?.hp ?? 0);
    setBotHp(startData.botCards[nextBotPos]?.hp ?? 0);
    setQuizFeedback(null);
    setRoundNumber((value) => value + 1);
    setPhase("quiz");
  };

  const content =
    phase === "overview" ? (
      <BattleOverviewCard
        battleDeckSize={battleDeckSize}
        selectedCount={autoSelectedCards.length}
        uniqueWords={uniqueWords}
        collectionCount={collectionCards.length}
        cardsLoading={cardsLoading}
        canStartBattle={canStartBattle}
        submitting={submitting}
        error={error}
        onStart={() => void onStart()}
      />
    ) : (
      <>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-slate-200/70">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-50">Бой</h2>
            <span className="text-slate-200/35">·</span>
            <span>
              Раунд{" "}
              <span className="font-mono">
                {Math.min(roundNumber, battleDeckSize)}/{battleDeckSize}
              </span>
            </span>
            <span className="text-slate-200/35">·</span>
            <span>
              Счёт <span className="font-mono">{playerWins}:{botWins}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-50 hover:bg-slate-700"
          >
            Сбросить
          </button>
        </header>

        {error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {playerCard && botCard ? (
          <section className="flex flex-col gap-3">
            {phase === "quiz" && currentQuiz ? (
              <>
                <BattleArena
                  playerCard={playerCard}
                  botCard={botCard}
                  playerHp={playerHp}
                  botHp={botHp}
                  vsLabel="Раунд"
                  hidePlayerWord={phase === "quiz" && !quizFeedback}
                />
                <QuizPhase
                  type={currentQuiz.type}
                  question={currentQuiz.question}
                  options={currentQuiz.options}
                  disabled={submitting}
                  correctAnswer={quizFeedback?.correctAnswer}
                  showResult={Boolean(quizFeedback)}
                  selectedAnswer={quizFeedback?.selectedAnswer}
                  resultCorrect={quizFeedback?.isCorrect}
                  onContinue={
                    quizFeedback && !quizFeedback.isCorrect && lastAnswer
                      ? () => setPhase("combat")
                      : undefined
                  }
                  onPick={onPickAnswer}
                />
              </>
            ) : null}

            {phase === "combat" && lastAnswer ? (
              <CombatPhase
                playerCard={playerCard}
                botCard={botCard}
                initialPlayerHp={playerHp}
                initialBotHp={botHp}
                inspirationApplied={lastAnswer.round.inspirationApplied}
                combatLog={lastAnswer.round.combatLog}
                onDone={onCombatDone}
              />
            ) : null}

            {phase === "roundResult" && lastAnswer ? (
              <RoundResult
                round={lastAnswer.round}
                onNext={onNext}
                nextLabel={lastAnswer.battleResult ? "К результатам" : "Следующий раунд"}
              />
            ) : null}

            {phase === "battleResult" && lastAnswer?.battleResult ? (
              <BattleResult result={lastAnswer.battleResult} onAgain={reset} />
            ) : null}
          </section>
        ) : null}
      </>
    );

  if (embedded) {
    return <section className="flex h-full flex-col gap-4">{content}</section>;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-4 px-6 py-4">
      {content}
    </main>
  );
}
