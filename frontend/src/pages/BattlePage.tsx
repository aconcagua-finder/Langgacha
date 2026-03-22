import { useEffect, useMemo, useState } from "react";

import type { BattleAnswerResponse, BattleCardPublic, BattleStartResponse } from "../api/battle";
import { answerBattle, startBattle } from "../api/battle";
import { BattleArena } from "../components/battle/BattleArena";
import { CombatPhase } from "../components/battle/CombatPhase";
import { DeckSelect } from "../components/battle/DeckSelect";
import { QuizPhase } from "../components/battle/QuizPhase";
import { RoundResult } from "../components/battle/RoundResult";
import { BattleResult } from "../components/battle/BattleResult";
import { usePlayer } from "../contexts/PlayerContext";
import type { QuizData } from "../types/quiz";

type Phase = "deck" | "quiz" | "combat" | "roundResult" | "battleResult";
type QuizFeedback = {
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

const QUIZ_AUTO_ADVANCE_MS = 1500;

export function BattlePage() {
  const { refresh: refreshPlayer } = usePlayer();
  const [phase, setPhase] = useState<Phase>("deck");
  const [startData, setStartData] = useState<BattleStartResponse | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [nextQuiz, setNextQuiz] = useState<QuizData | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [playerPos, setPlayerPos] = useState(0);
  const [botPos, setBotPos] = useState(0);
  const [playerHp, setPlayerHp] = useState(0);
  const [botHp, setBotHp] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnswer, setLastAnswer] = useState<BattleAnswerResponse | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<QuizFeedback | null>(null);

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

  const playerCard: BattleCardPublic | null = useMemo(() => {
    if (!startData) return null;
    return startData.playerCards[playerPos] ?? null;
  }, [startData, playerPos]);

  const botCard: BattleCardPublic | null = useMemo(() => {
    if (!startData) return null;
    return startData.botCards[botPos] ?? null;
  }, [startData, botPos]);

  const reset = () => {
    setPhase("deck");
    setStartData(null);
    setCurrentQuiz(null);
    setNextQuiz(null);
    setRoundNumber(1);
    setPlayerPos(0);
    setBotPos(0);
    setPlayerHp(0);
    setBotHp(0);
    setSubmitting(false);
    setError(null);
    setLastAnswer(null);
    setQuizFeedback(null);
  };

  const onStart = async (cardIds: string[]) => {
    setError(null);
    setSubmitting(true);
    setQuizFeedback(null);
    setCurrentQuiz(null);
    setNextQuiz(null);
    try {
      const data = await startBattle(cardIds);
      setStartData(data);
      setCurrentQuiz(data.rounds[0]?.quiz ?? data.playerCards[0]?.quiz ?? null);
      setRoundNumber(1);
      setPlayerPos(0);
      setBotPos(0);
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
      setNextQuiz(res.nextQuiz ?? null);
      setQuizFeedback({
        selectedAnswer: answer,
        correctAnswer: res.round.correctAnswer,
        isCorrect: res.round.quizCorrect,
      });
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
      setNextQuiz(null);
      setPhase("battleResult");
      return;
    }

    const winner = lastAnswer.round.winner;
    const survivorHp = lastAnswer.round.survivorHpLeft;
    let nextPlayerPos = playerPos;

    if (winner === "player") {
      const nextBotPos = botPos + 1;
      setBotPos(nextBotPos);
      setBotHp(startData.botCards[nextBotPos]?.hp ?? 0);
      setPlayerHp(survivorHp);
    } else {
      nextPlayerPos = playerPos + 1;
      setPlayerPos(nextPlayerPos);
      setPlayerHp(startData.playerCards[nextPlayerPos]?.hp ?? 0);
      setBotHp(survivorHp);
    }

    setCurrentQuiz(nextQuiz ?? startData.playerCards[nextPlayerPos]?.quiz ?? null);
    setNextQuiz(null);
    setQuizFeedback(null);
    setRoundNumber((v) => v + 1);
    setPhase("quiz");
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Бой</h1>
          <div className="text-sm text-slate-200/70">
            Раунд: <span className="font-mono">{roundNumber}</span>
          </div>
        </div>
        {phase !== "deck" ? (
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700"
          >
            Сбросить
          </button>
        ) : null}
      </header>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {phase === "deck" ? <DeckSelect onStart={onStart} /> : null}

      {phase !== "deck" && playerCard && botCard ? (
        <section className="flex flex-col gap-6">
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
    </main>
  );
}
