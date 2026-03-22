import { Link } from "react-router-dom";

import type { BattleResult as BattleResultType } from "../../api/battle";
import { BATTLE_LABELS } from "../../shared/labels";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";
import { getCardImageUrl } from "../../utils/cardImage";
import { CardBack } from "../card/CardBack";
import { CardFace } from "../card/CardFace";
import { CardFlip } from "../card/CardFlip";

function RoundCardPreview({
  card,
}: {
  card: BattleResultType["rounds"][number]["playerCard"];
}) {
  const rarityTheme = getRarityTheme(card.rarity);
  const typeTheme = getTypeTheme(card.type);
  const imgUrl = getCardImageUrl(card.conceptKey);

  return (
    <div
      className={[
        "w-full max-w-[140px] overflow-hidden rounded-2xl border bg-slate-900/60 p-2 backdrop-blur",
        rarityTheme.glow,
        rarityTheme.frameFx,
      ].join(" ")}
      style={{ borderColor: rarityTheme.border }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/45 px-2 py-1 text-[10px] text-slate-100/85">
          <span>{typeTheme.emoji}</span>
          <span>{card.type}</span>
        </div>
        <span
          className="rounded-full px-2 py-1 text-[10px] font-extrabold text-slate-950"
          style={{ backgroundColor: rarityTheme.badge }}
        >
          {card.rarity}
        </span>
      </div>

      <div
        className={[
          "mt-2 relative flex h-20 items-center justify-center overflow-hidden rounded-xl border",
          "bg-gradient-to-br",
          rarityTheme.gradient,
        ].join(" ")}
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={card.word}
            className="h-14 w-14 object-contain drop-shadow-lg"
          />
        ) : (
          <div className="text-3xl drop-shadow">{typeTheme.emoji}</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
      </div>

      <div className="mt-2 text-center">
        <div className="line-clamp-2 text-xs font-extrabold leading-tight tracking-tight text-slate-50 sm:text-sm">
          {card.word}
        </div>
        <div className="mt-1 line-clamp-1 text-[11px] text-slate-200/70">{card.translationRu}</div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-950/40 px-2 py-2 text-[10px] font-mono text-slate-200/80">
        <span>ATK {card.atk}</span>
        <span className="text-right">DEF {card.def}</span>
      </div>
    </div>
  );
}

export function BattleResult({
  result,
  onAgain,
}: {
  result: BattleResultType;
  onAgain: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5">
        <div className="text-2xl font-extrabold tracking-tight">
          {result.winner === "player" ? "Победа" : "Поражение"} {result.playerWins}:{result.botWins}
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

      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5">
        <div className="text-sm font-semibold text-slate-200/80">Раунды</div>
        <div className="mt-3 flex flex-col gap-2.5">
          {result.rounds.map((r) => {
            const playerWon = r.winner === "player";
            return (
              <div
                key={r.roundNumber}
                className="rounded-2xl border border-slate-800/60 bg-slate-950/20 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200/55">
                    Раунд {r.roundNumber}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-extrabold",
                        playerWon
                          ? "bg-emerald-500/15 text-emerald-200"
                          : "bg-rose-500/15 text-rose-200",
                      ].join(" ")}
                    >
                      {playerWon ? "✅ Победа" : "❌ Поражение"}
                    </div>
                    {r.inspirationApplied ? (
                      <div className="rounded-full bg-amber-300/15 px-2 py-1 text-[10px] font-extrabold text-amber-200">
                        {BATTLE_LABELS.inspiration}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-2.5 flex flex-row items-center justify-center gap-2 sm:gap-3">
                  <RoundCardPreview card={r.playerCard} />
                  <div className="shrink-0 text-lg text-slate-200/65 sm:text-xl">⚔</div>
                  <RoundCardPreview card={r.botCard} />
                </div>

                <div className="mt-2.5 text-center text-xs text-slate-200/65">
                  Квиз:{" "}
                  <span className={r.quizCorrect ? "text-emerald-300" : "text-rose-300"}>
                    {r.quizCorrect ? "верно" : "неверно"}
                  </span>
                  <span className="mx-2 text-slate-200/30">·</span>
                  Выжившая карта: <span className="font-mono">{r.survivorHpLeft}</span> HP
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
