import { useEffect, useState } from "react";

import type { QuizType } from "../../types/quiz";

type Props = {
  type: QuizType;
  question: string;
  options: string[];
  disabled?: boolean;
  correctAnswer?: string;
  showResult?: boolean;
  selectedAnswer?: string;
  resultCorrect?: boolean;
  onContinue?: () => void;
  continueLabel?: string;
  onPick: (answer: string) => void;
};

const isTextEntryTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || target.isContentEditable;
};

export function QuizPhase({
  type,
  question,
  options,
  disabled,
  correctAnswer,
  showResult,
  selectedAnswer,
  resultCorrect,
  onContinue,
  continueLabel = "Далее",
  onPick,
}: Props) {
  const [typingValue, setTypingValue] = useState("");
  const interactionLocked = Boolean(disabled || showResult);
  const showContinue = Boolean(showResult && !resultCorrect && onContinue);

  useEffect(() => {
    setTypingValue("");
  }, [type, question]);

  useEffect(() => {
    if (type === "typing" && showResult && typeof selectedAnswer === "string") {
      setTypingValue(selectedAnswer);
    }
  }, [type, showResult, selectedAnswer]);

  useEffect(() => {
    if (type === "typing" || interactionLocked) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      if (isTextEntryTarget(event.target)) return;

      const optionIndex = Number(event.key) - 1;
      if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex > 3) return;

      const option = options[optionIndex];
      if (!option) return;

      event.preventDefault();
      onPick(option);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [type, interactionLocked, onPick, options]);

  useEffect(() => {
    if (!showContinue || !onContinue) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      if (event.repeat) return;
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      onContinue();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showContinue, onContinue]);

  if (type === "typing") {
    const canSubmit = typingValue.trim().length > 0 && !interactionLocked;

    return (
      <div className="w-full rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5">
        <div className="text-sm text-slate-200/80">{question}</div>
        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit) return;
            onPick(typingValue);
          }}
        >
          <input
            type="text"
            autoFocus
            value={typingValue}
            disabled={interactionLocked}
            placeholder="Введите слово..."
            onChange={(event) => setTypingValue(event.target.value)}
            className="min-h-[48px] flex-1 rounded-xl border border-slate-800/60 bg-slate-950/20 px-4 py-3 text-sm font-semibold text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-sky-400/60 focus:bg-slate-950/35 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="min-h-[48px] rounded-xl border border-slate-800/60 bg-slate-950/20 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-950/30 disabled:opacity-60"
          >
            Ответить
          </button>
        </form>

        {showResult ? (
          <div
            className={[
              "mt-3 text-sm font-semibold",
              resultCorrect ? "text-emerald-300" : "text-rose-300",
            ].join(" ")}
          >
            {resultCorrect ? (
              "Верно!"
            ) : (
              <>
                Неверно. Правильный ответ:{" "}
                <span className="font-mono text-slate-100">{correctAnswer}</span>
              </>
            )}
          </div>
        ) : null}

        {showContinue ? (
          <button
            type="button"
            onClick={onContinue}
            className="mt-4 w-full rounded-xl bg-slate-800 px-4 py-3 font-semibold text-slate-50 hover:bg-slate-700"
          >
            {continueLabel}
          </button>
        ) : null}
      </div>
    );
  }

  const getOptionClassName = (option: string): string => {
    if (showResult && correctAnswer === option) {
      return "border-emerald-400/50 bg-emerald-500/15 text-emerald-50";
    }

    if (showResult && selectedAnswer === option) {
      return "border-rose-400/50 bg-rose-500/15 text-rose-50";
    }

    return "border-slate-800/60 bg-slate-950/20 text-slate-100 hover:bg-slate-950/30";
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5">
      <div className="text-sm text-slate-200/80">{question}</div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((o, index) => (
          <button
            key={o}
            type="button"
            disabled={interactionLocked}
            onClick={() => onPick(o)}
            className={[
              "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold disabled:opacity-60",
              getOptionClassName(o),
            ].join(" ")}
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-extrabold text-slate-300">
              {index + 1}
            </span>
            <span>{o}</span>
          </button>
        ))}
      </div>

      {showContinue ? (
        <button
          type="button"
          onClick={onContinue}
          className="mt-4 w-full rounded-xl bg-slate-800 px-4 py-3 font-semibold text-slate-50 hover:bg-slate-700"
        >
          {continueLabel}
        </button>
      ) : null}
    </div>
  );
}
