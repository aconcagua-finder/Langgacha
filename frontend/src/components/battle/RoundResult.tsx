import { useEffect } from "react";

import type { RoundResult as RoundResultType } from "../../api/battle";
import { BATTLE_LABELS } from "../../shared/labels";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";
import { getCardImageUrl } from "../../utils/cardImage";

function RoundCardMini({
  card,
}: {
  card: RoundResultType["playerCard"];
}) {
  const rarityTheme = getRarityTheme(card.rarity);
  const typeTheme = getTypeTheme(card.type);
  const imgUrl = getCardImageUrl(card.conceptKey);

  return (
    <div
      className={[
        "w-full max-w-[180px] overflow-hidden rounded-2xl border bg-slate-900/60 p-2.5 backdrop-blur",
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
          "relative mt-2 flex h-20 items-center justify-center overflow-hidden rounded-xl border",
          "bg-gradient-to-br",
          rarityTheme.gradient,
        ].join(" ")}
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {imgUrl ? (
          <img src={imgUrl} alt={card.word} className="h-16 w-16 object-contain drop-shadow-lg" />
        ) : (
          <div className="text-4xl drop-shadow">{typeTheme.emoji}</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
      </div>

      <div className="mt-2 text-center">
        <div className="line-clamp-2 text-sm font-extrabold leading-tight tracking-tight text-slate-50">
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

export function RoundResult({
  round,
  onNext,
  nextLabel,
}: {
  round: RoundResultType;
  onNext: () => void;
  nextLabel: string;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      if (event.repeat) return;
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      onNext();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onNext]);

  return (
    <div className="w-full rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5">
      <div className="text-lg font-extrabold tracking-tight">
        Раунд {round.roundNumber}:{" "}
        <span className={round.winner === "player" ? "text-emerald-300" : "text-rose-300"}>
          {round.winner === "player" ? "победа" : "поражение"}
        </span>
      </div>

      <div className="mt-5 flex flex-col items-center gap-3 md:flex-row md:justify-between">
        <RoundCardMini card={round.playerCard} />
        <div
          className={[
            "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border border-white/10 bg-slate-950/45",
            round.winner === "player" ? "text-emerald-300" : "text-rose-300",
          ].join(" ")}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200/55">
            VS
          </span>
          <span className="text-lg">{round.winner === "player" ? "✅" : "❌"}</span>
        </div>
        <RoundCardMini card={round.botCard} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-200/80">
        <span>
          Квиз:{" "}
          <span className={round.quizCorrect ? "text-emerald-300" : "text-rose-300"}>
            {round.quizCorrect ? "верно" : "неверно"}
          </span>
        </span>
        {round.inspirationApplied ? (
          <span className="rounded-full bg-emerald-400 px-2 py-1 text-xs font-bold text-slate-950">
            {BATTLE_LABELS.inspiration}
          </span>
        ) : null}
        <span className="text-slate-200/35">·</span>
        <span>
          Выжившая карта: <span className="font-mono">{round.survivorHpLeft}</span> HP
        </span>
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
