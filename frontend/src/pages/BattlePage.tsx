import { useCallback, useEffect, useMemo, useState } from "react";

import type { BattleAnswerResponse, BattleCardPublic, BattleStartResponse } from "../api/battle";
import { answerBattle, startBattle } from "../api/battle";
import { listCards } from "../api/cards";
import { BattleArena } from "../components/battle/BattleArena";
import { BattleResult } from "../components/battle/BattleResult";
import { CombatPhase } from "../components/battle/CombatPhase";
import { QuizPhase } from "../components/battle/QuizPhase";
import { RoundResult } from "../components/battle/RoundResult";
import { CardMini } from "../components/card/CardMini";
import { useConfig } from "../contexts/ConfigContext";
import { usePlayer } from "../contexts/PlayerContext";
import type { GeneratedCard } from "../types/card";
import { autoSelectBattleCards } from "../utils/autoSelectBattleCards";

type BattlePageProps = {
  embedded?: boolean;
};

type Phase = "overview" | "quiz" | "combat" | "roundResult" | "battleResult";
type QuizFeedback = {
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

const QUIZ_AUTO_ADVANCE_MS = 1500;
const DEFAULT_BATTLE_DECK_SIZE = 10;

export function BattlePage({ embedded = false }: BattlePageProps) {
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

  const content = (
    <>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-slate-200/70">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-50">Бой</h2>
          <span className="text-slate-200/35">·</span>
          {phase === "overview" ? (
            <span>
              Автоподбор до <span className="font-mono">{battleDeckSize}</span> карт
            </span>
          ) : (
            <>
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
            </>
          )}
        </div>

        {phase !== "overview" ? (
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-50 hover:bg-slate-700"
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

      {phase === "overview" ? (
        <section className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div>
                  <div className="text-lg font-extrabold text-slate-50">Автоподбор колоды</div>
                  <p className="mt-1 max-w-2xl text-sm text-slate-200/70">
                    В бой идут забытые карты в первую очередь. Для каждого слова берётся один,
                    самый сильный экземпляр, затем колода добирается по приоритету состояния.
                  </p>
                </div>

                <div className="grid gap-3 text-sm text-slate-200/80 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-950/40 px-4 py-3">
                    В коллекции: <span className="font-mono">{collectionCards.length}</span>
                  </div>
                  <div className="rounded-xl bg-slate-950/40 px-4 py-3">
                    Уникальных слов: <span className="font-mono">{uniqueWords}</span>
                  </div>
                  <div className="rounded-xl bg-slate-950/40 px-4 py-3">
                    В колоде:{" "}
                    <span className="font-mono">
                      {autoSelectedCards.length}/{battleDeckSize}
                    </span>
                  </div>
                </div>

                {autoSelectedCards.length > 0 && autoSelectedCards.length < battleDeckSize ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-50">
                    Карт меньше {battleDeckSize}, поэтому бой начнётся с тем, что уже есть в
                    коллекции.
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => void loadCards()}
                  disabled={cardsLoading || submitting}
                  className="rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3 text-sm font-semibold text-slate-200/80 hover:bg-slate-900/60 disabled:opacity-60"
                >
                  {cardsLoading ? "Загружаю…" : "Обновить коллекцию"}
                </button>
                <button
                  type="button"
                  onClick={() => void onStart()}
                  disabled={!canStartBattle}
                  className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-extrabold text-slate-950 hover:bg-sky-400 disabled:opacity-60 disabled:hover:bg-sky-500"
                >
                  {submitting ? "Подбираю колоду…" : "Начать бой"}
                </button>
              </div>
            </div>
          </div>

          {cardsLoading ? (
            <div className="text-sm text-slate-200/70">Загружаю коллекцию…</div>
          ) : autoSelectedCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/20 p-10 text-sm text-slate-200/70">
              Коллекция пуста. Сначала открой бустер, потом возвращайся в бой.
            </div>
          ) : (
            <section className="flex flex-col gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-200/60">
                Автоподбор на следующий бой
              </div>
              <div className="grid place-items-center grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {autoSelectedCards.map((card) => (
                  <div key={card.id} className="w-full max-w-[200px]">
                    <CardMini card={card} tilt={false} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>
      ) : null}

      {phase !== "overview" && playerCard && botCard ? (
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
    return <section className="flex flex-col gap-4">{content}</section>;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-4 px-6 py-4">
      {content}
    </main>
  );
}
