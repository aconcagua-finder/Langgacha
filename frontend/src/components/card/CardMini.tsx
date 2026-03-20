import type { GeneratedCard } from "../../types/card";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";
import {
  BATTLE_LABELS,
  CONDITION_LABELS,
  RARITY_LABELS,
  TOOLTIPS,
  TYPE_LABELS,
  label,
} from "../../shared/labels";
import { Tooltip } from "../ui/Tooltip";

const masteryDots = (progress: number) => {
  const total = 5;
  return Array.from({ length: total }, (_, i) => (i < progress ? "●" : "○")).join(
    "",
  );
};

const conditionEmoji: Record<string, string> = {
  Brilliant: "✨",
  Normal: "🟦",
  Worn: "🟨",
  Deteriorated: "🟥",
};

type Size = "mini" | "deck";

const sizeClass: Record<Size, { w: string; h: string }> = {
  mini: { w: "w-[200px]", h: "h-[320px]" },
  deck: { w: "w-[220px]", h: "h-[350px]" },
};

export function CardMini({
  card,
  size = "mini",
}: {
  card: GeneratedCard;
  size?: Size;
}) {
  const typeTheme = getTypeTheme(card.type);
  const rarityTheme = getRarityTheme(card.rarity);
  const sz = sizeClass[size];
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
        sz.w,
        sz.h,
        "relative overflow-hidden rounded-2xl border bg-slate-900/60 backdrop-blur",
        "flex flex-col",
      ].join(" ")}
      style={{ borderColor: typeTheme.color }}
    >
      {card.masteryProgress >= 5 ? (
        <div className="pointer-events-none absolute right-2 top-10 z-10 rounded-lg bg-emerald-400/90 px-2 py-1 text-[10px] font-extrabold tracking-wide text-slate-950 shadow-lg">
          ✓ {BATTLE_LABELS.mastered}
        </div>
      ) : null}
      <div className="h-2 w-full" style={{ backgroundColor: rarityTheme.badge }} />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-200/70">
            {label(TYPE_LABELS, card.type)}
          </div>
          <Tooltip text={label(RARITY_LABELS, card.rarity)}>
            <div className="text-xs font-semibold text-slate-200/50">{card.rarity}</div>
          </Tooltip>
        </div>

        <div
          className={[
            "relative flex items-center justify-center overflow-hidden rounded-2xl border",
            "bg-gradient-to-br",
            typeTheme.gradient,
          ].join(" ")}
          style={{ height: 110, borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="text-5xl drop-shadow">{typeTheme.emoji}</div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
        </div>

        <div>
          <div className="text-xl font-extrabold tracking-tight leading-tight">{card.word}</div>
          <div className="mt-1 text-xs text-slate-200/75">{card.translationRu}</div>
        </div>

        <div className="mt-auto rounded-xl bg-slate-950/40 px-3 py-2 text-xs text-slate-200/80">
          <div className="flex items-center justify-between font-mono">
            <Tooltip text={TOOLTIPS.fue}>
              <span>FUE {card.fue}</span>
            </Tooltip>
            <Tooltip text={TOOLTIPS.def}>
              <span>DEF {card.def}</span>
            </Tooltip>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <Tooltip text={conditionTooltip}>
              <div className="flex items-center gap-2">
                <span>{conditionEmoji[card.condition] ?? "🟦"}</span>
                <span className="text-slate-200/70">
                  {label(CONDITION_LABELS, card.condition)}
                </span>
              </div>
            </Tooltip>
            <Tooltip text={TOOLTIPS.mastery(card.masteryProgress)}>
              <div className="font-mono">{masteryDots(card.masteryProgress)}</div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
