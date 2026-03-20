import type { RoundResult as RoundResultType } from "../../api/battle";
import { BATTLE_LABELS } from "../../shared/labels";

export function RoundResult({
  round,
  onNext,
  nextLabel,
}: {
  round: RoundResultType;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="w-full rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-lg font-extrabold tracking-tight">
          Раунд {round.roundNumber}:{" "}
          <span className={round.winner === "player" ? "text-emerald-300" : "text-rose-300"}>
            {round.winner === "player" ? "победа" : "поражение"}
          </span>
        </div>
        <div className="text-sm text-slate-200/70">
          Квиз:{" "}
          <span className={round.quizCorrect ? "text-emerald-300" : "text-rose-300"}>
            {round.quizCorrect ? "верно" : "неверно"}
          </span>
          {round.inspirationApplied ? (
            <span className="ml-2 rounded-full bg-emerald-400 px-2 py-1 text-xs font-bold text-slate-950">
              {BATTLE_LABELS.inspiration}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-200/80">
        Выжившая карта: <span className="font-mono">{round.survivorHpLeft}</span> HP
      </div>

      <button
        type="button"
        onClick={onNext}
        className="mt-4 w-full rounded-xl bg-slate-800 px-4 py-3 font-semibold text-slate-50 hover:bg-slate-700"
      >
        {nextLabel}
      </button>
    </div>
  );
}
