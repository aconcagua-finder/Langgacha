import { Link } from "react-router-dom";

import type { BattleResult as BattleResultType } from "../../api/battle";
import { getRarityTheme } from "../../styles/card-themes";
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
          Награда: <span className="font-mono">{result.rewards.dust}</span> Пыль
        </div>
      </div>

      {result.rewards.bonusCard ? (
        <div className="flex flex-col items-center gap-3">
          <div className="text-sm font-semibold text-slate-200/80">Бонусная карта</div>
          <CardFlip
            front={<CardFace card={result.rewards.bonusCard} tilt={false} />}
            back={<CardBack card={result.rewards.bonusCard} />}
          />
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-6">
        <div className="text-sm font-semibold text-slate-200/80">Раунды</div>
        <div className="mt-4 flex flex-col gap-2">
          {result.rounds.map((r) => {
            const pTheme = getRarityTheme(r.playerCard.rarity);
            const bTheme = getRarityTheme(r.botCard.rarity);
            const playerWon = r.winner === "player";
            return (
              <div
                key={r.roundNumber}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-950/20 px-3 py-2 text-sm"
              >
                <div className="w-12 shrink-0 text-[11px] font-semibold text-slate-200/60 sm:w-16 sm:text-xs">
                  Раунд {r.roundNumber}
                </div>

                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-extrabold text-slate-950"
                    style={{ backgroundColor: pTheme.badge }}
                  >
                    {r.playerCard.rarity}
                  </span>
                  <span className="truncate font-semibold text-slate-50">
                    {r.playerCard.word}{" "}
                    <span className="hidden font-mono text-xs text-slate-200/60 sm:inline">
                      ATK {r.playerCard.atk}
                    </span>
                  </span>
                  <span className="text-slate-200/40">⚔️</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-extrabold text-slate-950"
                    style={{ backgroundColor: bTheme.badge }}
                  >
                    {r.botCard.rarity}
                  </span>
                  <span className="truncate font-semibold text-slate-50">
                    {r.botCard.word}{" "}
                    <span className="hidden font-mono text-xs text-slate-200/60 sm:inline">
                      ATK {r.botCard.atk}
                    </span>
                  </span>
                </div>

                <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
                  <div
                    className={[
                      "shrink-0 text-xs font-extrabold",
                      playerWon ? "text-emerald-300" : "text-rose-300",
                    ].join(" ")}
                  >
                    {playerWon ? "✅ Победа" : "❌ Поражение"}
                  </div>
                  {r.inspirationApplied ? (
                    <div className="shrink-0 rounded-full bg-amber-300/15 px-2 py-0.5 text-[10px] font-extrabold text-amber-200">
                      Inspiration
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
