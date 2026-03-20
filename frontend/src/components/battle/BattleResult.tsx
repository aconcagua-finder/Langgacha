import { Link } from "react-router-dom";

import type { BattleResult as BattleResultType } from "../../api/battle";
import { CardBack } from "../card/CardBack";
import { CardFace } from "../card/CardFace";
import { CardFlip } from "../card/CardFlip";

export function BattleResult({
  result,
  onAgain,
}: {
  result: BattleResultType;
  onAgain: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-6">
        <div className="text-2xl font-extrabold tracking-tight">
          {result.winner === "player" ? "Победа!" : "Поражение"}
        </div>
        <div className="mt-3 text-sm text-slate-200/80">
          Правильных ответов: <span className="font-mono">{result.rewards.correctAnswers}</span>{" "}
          · Максимальная серия: <span className="font-mono">{result.rewards.streak}</span>
        </div>
        <div className="mt-2 text-sm text-slate-200/80">
          Награда: <span className="font-mono">{result.rewards.dust}</span> Dust
        </div>
      </div>

      {result.rewards.bonusCard ? (
        <div className="flex flex-col items-center gap-3">
          <div className="text-sm font-semibold text-slate-200/80">Бонусная карта</div>
          <CardFlip
            front={<CardFace card={result.rewards.bonusCard} />}
            back={<CardBack card={result.rewards.bonusCard} />}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onAgain}
          className="rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 hover:bg-sky-400"
        >
          Ещё бой
        </button>
        <Link
          to="/collection"
          className="rounded-xl bg-slate-800 px-4 py-3 font-semibold text-slate-50 hover:bg-slate-700"
        >
          В коллекцию
        </Link>
      </div>
    </div>
  );
}
