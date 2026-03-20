import type { GeneratedCard } from "../../types/card";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";
import { useTiltEffect } from "../../hooks/useTiltEffect";
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

export function CardFace({ card, tilt = true }: { card: GeneratedCard; tilt?: boolean }) {
  const typeTheme = getTypeTheme(card.type);
  const rarityTheme = getRarityTheme(card.rarity);
  const tiltFx = useTiltEffect({ enabled: tilt });
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
      {card.masteryProgress >= 5 ? (
        <div className="pointer-events-none absolute right-4 top-4 z-10 rotate-12 rounded-xl bg-emerald-400/90 px-4 py-2 text-xs font-extrabold tracking-wide text-slate-950 shadow-lg">
          ✓ {BATTLE_LABELS.mastered}
        </div>
      ) : null}
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
          <div className="text-7xl drop-shadow">{typeTheme.emoji}</div>
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
          <span className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/35 px-2 py-1 text-xs text-slate-100/90">
            <span>{typeTheme.emoji}</span>
            <span>{label(TYPE_LABELS, card.type)}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="text-3xl font-extrabold tracking-tight">{card.word}</div>
          <div className="text-sm text-slate-200/80">{card.translationRu}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Tooltip text={TOOLTIPS.atk}>
            <div className="rounded-xl bg-slate-950/40 p-3">
              <div className="text-xs text-slate-200/70">ATK</div>
              <div className="text-lg font-bold">{card.atk}</div>
            </div>
          </Tooltip>
          <Tooltip text={TOOLTIPS.def}>
            <div className="rounded-xl bg-slate-950/40 p-3">
              <div className="text-xs text-slate-200/70">DEF</div>
              <div className="text-lg font-bold">{card.def}</div>
            </div>
          </Tooltip>
        </div>

        <div className="mt-auto flex items-center justify-between rounded-xl bg-slate-950/40 px-3 py-2 text-xs text-slate-200/80">
          <Tooltip text={conditionTooltip}>
            <div className="flex items-center gap-2">
              <span>{conditionEmoji[card.condition] ?? "🟦"}</span>
              <span>{label(CONDITION_LABELS, card.condition)}</span>
            </div>
          </Tooltip>
          <Tooltip text={TOOLTIPS.mastery(card.masteryProgress)}>
            <div className="font-mono">{masteryDots(card.masteryProgress)}</div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
