import type { GeneratedCard } from "../../types/card";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";
import { useTiltEffect } from "../../hooks/useTiltEffect";
import { getCardImageUrl } from "../../utils/cardImage";
import {
  BATTLE_LABELS,
  RARITY_LABELS,
  TOOLTIPS,
  TYPE_LABELS,
  label,
} from "../../shared/labels";
import {
  getWordProgressPercent,
  getWordProgressTheme,
  isWordMastered,
} from "../../shared/wordProgress";
import { Tooltip } from "../ui/Tooltip";

const conditionEmoji: Record<string, string> = {
  Brilliant: "✨",
  Normal: "🟦",
  Worn: "🟨",
  Deteriorated: "🟥",
};

export function CardFace({ card, tilt = true }: { card: GeneratedCard; tilt?: boolean }) {
  const typeTheme = getTypeTheme(card.type);
  const rarityTheme = getRarityTheme(card.rarity);
  const progressTheme = getWordProgressTheme(card.wordLevel);
  const progressPct = getWordProgressPercent(card.wordXp, card.wordXpForNext);
  const mastered = isWordMastered(card.wordLevel);
  const tiltFx = useTiltEffect({ enabled: tilt });
  const conditionClass =
    card.condition === "Deteriorated"
      ? "condition-deteriorated"
      : card.condition === "Worn"
        ? "condition-worn"
        : card.condition === "Brilliant"
          ? "condition-brilliant"
          : "condition-normal";
  const conditionTooltip =
    card.condition === "Brilliant"
      ? TOOLTIPS.conditionBrilliant
      : card.condition === "Worn"
        ? TOOLTIPS.conditionWorn
        : card.condition === "Deteriorated"
          ? TOOLTIPS.conditionDeteriorated
          : TOOLTIPS.conditionNormal;

  return (
    <div
      className={[
        "relative h-full w-full rounded-2xl border bg-slate-900/60 backdrop-blur",
        "flex flex-col overflow-hidden",
        rarityTheme.glow,
        rarityTheme.frameFx,
        conditionClass,
        card.isEvolved ? "card-evolved" : "",
        tiltFx.isEnabled ? "group" : "",
      ].join(" ")}
      style={{ ...tiltFx.style, borderColor: rarityTheme.border }}
      onMouseEnter={tiltFx.onMouseEnter}
      onMouseLeave={tiltFx.onMouseLeave}
      onMouseMove={tiltFx.onMouseMove}
      ref={tiltFx.ref}
    >
      {tiltFx.isEnabled ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-[var(--tilt-glare)] transition-opacity duration-150"
          style={{
            background:
              "radial-gradient(circle at var(--tilt-x) var(--tilt-y), rgba(255,255,255,0.20), transparent 60%)",
            mixBlendMode: "screen",
          }}
        />
      ) : null}
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
        <div
          className={[
            "rounded-full border px-3 py-1 text-xs font-extrabold shadow-lg shadow-slate-950/35",
            progressTheme.badge,
          ].join(" ")}
        >
          Lv {card.wordLevel}
        </div>
        {mastered ? (
          <div className="rounded-full bg-yellow-300/90 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-slate-950">
            {BATTLE_LABELS.mastered}
          </div>
        ) : null}
      </div>
      <div
        className={[
          "relative h-44 w-full",
          "bg-gradient-to-br",
          rarityTheme.gradient,
          "border-b",
        ].join(" ")}
        style={{ borderBottomColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {(() => {
            const imgUrl = getCardImageUrl(card.conceptKey);
            return imgUrl ? (
              <img
                src={imgUrl}
                alt={card.word}
                className="h-36 w-36 object-contain drop-shadow-lg"
              />
            ) : (
              <div className="text-7xl drop-shadow">{typeTheme.emoji}</div>
            );
          })()}
        </div>
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Tooltip text={label(RARITY_LABELS, card.rarity)}>
            <span
              className="rounded-full px-2 py-1 text-xs font-semibold text-slate-950"
              style={{ backgroundColor: rarityTheme.badge }}
            >
              {card.rarity}
            </span>
          </Tooltip>
          {card.isEvolved ? (
            <Tooltip text={TOOLTIPS.evolved}>
              <span className="rounded-full border border-sky-300/35 bg-sky-300/12 px-2 py-1 text-xs font-bold text-sky-100">
                🔄 {BATTLE_LABELS.evolved}
              </span>
            </Tooltip>
          ) : null}
          <span className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/35 px-2 py-1 text-xs text-slate-100/90">
            <span>{typeTheme.emoji}</span>
            <span>{label(TYPE_LABELS, card.type)}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 pb-14">
        <div className="text-center">
          <div className="text-3xl font-extrabold tracking-tight">{card.word}</div>
          <div className="text-sm text-slate-200/80">{card.translationRu}</div>
        </div>
      </div>

      <div className="pointer-events-auto absolute inset-x-4 bottom-16 z-10">
        <Tooltip text={TOOLTIPS.wordProgress(card.wordLevel, card.wordXp, card.wordXpForNext)}>
          <div className="overflow-hidden rounded-full bg-slate-950/60">
            <div
              className={["h-1.5 transition-[width] duration-300", progressTheme.bar].join(" ")}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </Tooltip>
      </div>

      <Tooltip text={TOOLTIPS.atk}>
        <div className="pointer-events-auto absolute bottom-3 left-3 z-10 rounded-xl bg-slate-950/50 px-3 py-1.5 backdrop-blur">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">ATK</div>
          <div className="text-lg font-extrabold text-slate-50">{card.atk}</div>
        </div>
      </Tooltip>

      <div className="pointer-events-auto absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-100/90 backdrop-blur">
        <Tooltip text={conditionTooltip}>
          <span>{conditionEmoji[card.condition] ?? "🟦"}</span>
        </Tooltip>
        <Tooltip text={TOOLTIPS.wordProgress(card.wordLevel, card.wordXp, card.wordXpForNext)}>
          <span className="font-mono">
            {mastered ? "MAX" : `${card.wordXp}/${card.wordXpForNext} XP`}
          </span>
        </Tooltip>
      </div>

      <Tooltip text={TOOLTIPS.def}>
        <div className="pointer-events-auto absolute bottom-3 right-3 z-10 rounded-xl bg-slate-950/50 px-3 py-1.5 backdrop-blur">
          <div className="text-right text-[10px] uppercase tracking-wider text-slate-400">
            DEF
          </div>
          <div className="text-right text-lg font-extrabold text-slate-50">{card.def}</div>
        </div>
      </Tooltip>
    </div>
  );
}
