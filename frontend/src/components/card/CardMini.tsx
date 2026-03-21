import type { GeneratedCard } from "../../types/card";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";
import { useTiltEffect } from "../../hooks/useTiltEffect";
import { useConfig } from "../../contexts/ConfigContext";
import { getCardImageUrl } from "../../utils/cardImage";
import {
  BATTLE_LABELS,
  CONDITION_LABELS,
  RARITY_LABELS,
  TOOLTIPS,
  TYPE_LABELS,
  label,
} from "../../shared/labels";
import { Tooltip } from "../ui/Tooltip";

const masteryDots = (progress: number, total: number) => {
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

type Size = "mini" | "deck" | "booster";

const sizeClass: Record<Size, { w: string; h?: string; aspect?: string }> = {
  mini: { w: "w-full max-w-[200px]", aspect: "aspect-[200/320]" },
  deck: { w: "w-full max-w-[220px]", aspect: "aspect-[220/350]" },
  booster: {
    w: "w-full",
    h: "h-full",
  },
};

export function CardMini({
  card,
  size = "mini",
  tilt = true,
  selected = false,
}: {
  card: GeneratedCard;
  size?: Size;
  tilt?: boolean;
  selected?: boolean;
}) {
  const { config } = useConfig();
  const typeTheme = getTypeTheme(card.type);
  const rarityTheme = getRarityTheme(card.rarity);
  const sz = sizeClass[size];
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

  const compact = size === "booster";
  const tiltFx = useTiltEffect({ enabled: tilt });
  const masteryMax = config?.masteryMax ?? 5;
  return (
    <div
      className={[
        sz.w,
        sz.h ?? "",
        sz.aspect ?? "",
        "relative overflow-hidden rounded-2xl border bg-slate-900/60 backdrop-blur",
        "flex flex-col",
        "transition-shadow duration-150",
        conditionClass,
        card.isEvolved ? "card-evolved" : "",
        tiltFx.isEnabled ? "group" : "",
        selected ? "ring-2 ring-sky-400/60" : "hover:ring-1 hover:ring-slate-700/70",
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
      {card.masteryProgress >= masteryMax ? (
        <div className="pointer-events-none absolute right-2 top-10 z-10 rounded-lg bg-emerald-400/90 px-2 py-1 text-[10px] font-extrabold tracking-wide text-slate-950 shadow-lg">
          ✓ {BATTLE_LABELS.mastered}
        </div>
      ) : null}
      <div className="h-2 w-full" style={{ backgroundColor: rarityTheme.badge }} />

      <div className={["flex flex-1 flex-col", compact ? "gap-2 p-2 sm:gap-2.5 sm:p-3" : "gap-3 p-4"].join(" ")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/35 px-2 py-1 text-[11px] font-semibold text-slate-100/90">
            <span>{typeTheme.emoji}</span>
            {compact ? null : <span>{label(TYPE_LABELS, card.type)}</span>}
          </div>
          <div className="flex items-center gap-2">
            {card.isEvolved ? (
              <Tooltip text={TOOLTIPS.evolved}>
                <div className="rounded-full border border-sky-300/35 bg-sky-300/12 px-2 py-1 text-[10px] font-bold text-sky-100">
                  🔄
                </div>
              </Tooltip>
            ) : null}
            <Tooltip text={label(RARITY_LABELS, card.rarity)}>
              <div className="text-xs font-semibold text-slate-200/50">{card.rarity}</div>
            </Tooltip>
          </div>
        </div>

        <div
          className={[
            "relative flex items-center justify-center overflow-hidden rounded-2xl border",
            "bg-gradient-to-br",
            rarityTheme.gradient,
            compact ? "h-[56px] sm:h-[64px] md:h-[72px] lg:h-[80px]" : "h-[110px]",
          ].join(" ")}
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {(() => {
            const imgUrl = getCardImageUrl(card.conceptKey);
            return imgUrl ? (
              <img
                src={imgUrl}
                alt={card.word}
                className={
                  compact
                    ? "h-12 w-12 object-contain drop-shadow-lg sm:h-14 sm:w-14"
                    : "h-20 w-20 object-contain drop-shadow-lg"
                }
              />
            ) : (
              <div className={["drop-shadow", compact ? "text-3xl" : "text-5xl"].join(" ")}>
                {typeTheme.emoji}
              </div>
            );
          })()}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
        </div>

        <div>
          <div
            className={[
              "font-extrabold tracking-tight leading-tight",
              compact ? "text-sm sm:text-base md:text-lg" : "text-xl",
            ].join(" ")}
          >
            {card.word}
          </div>
          {compact ? (
            <div className="mt-0.5 hidden text-[10px] text-slate-200/75 md:block">
              {card.translationRu}
            </div>
          ) : (
            <div className="mt-1 text-xs text-slate-200/75">{card.translationRu}</div>
          )}
        </div>

        <div
          className={[
            "mt-auto rounded-xl bg-slate-950/40 text-slate-200/80",
            compact ? "px-2 py-1.5 text-[10px]" : "px-3 py-2 text-xs",
          ].join(" ")}
        >
          <div className="flex items-center justify-between font-mono">
            <Tooltip text={TOOLTIPS.atk}>
              <span>ATK {card.atk}</span>
            </Tooltip>
            <Tooltip text={TOOLTIPS.def}>
              <span>DEF {card.def}</span>
            </Tooltip>
          </div>
          {compact ? null : (
            <div className="mt-2 flex items-center justify-between">
              <Tooltip text={conditionTooltip}>
                <div className="flex items-center gap-2">
                  <span>{conditionEmoji[card.condition] ?? "🟦"}</span>
                  <span className="text-slate-200/70">
                    {label(CONDITION_LABELS, card.condition)}
                  </span>
                </div>
              </Tooltip>
              <Tooltip text={TOOLTIPS.mastery(card.masteryProgress, masteryMax)}>
                <div className="font-mono">{masteryDots(card.masteryProgress, masteryMax)}</div>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
