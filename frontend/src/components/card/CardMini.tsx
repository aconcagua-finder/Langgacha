import type { GeneratedCard } from "../../types/card";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";
import { BATTLE_LABELS, CONDITION_LABELS, TYPE_LABELS, label } from "../../shared/labels";

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
        <div className="pointer-events-none absolute -right-12 top-6 z-10 rotate-12 rounded-xl bg-emerald-400/90 px-10 py-2 text-xs font-extrabold tracking-wide text-slate-950 shadow-lg">
          ✓ {BATTLE_LABELS.mastered}
        </div>
      ) : null}
      <div className="h-2 w-full" style={{ backgroundColor: rarityTheme.badge }} />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-200/70">
            {label(TYPE_LABELS, card.type)}
          </div>
          <div className="text-xs font-semibold text-slate-200/50">{card.rarity}</div>
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
            <span>FUE {card.fue}</span>
            <span>DEF {card.def}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{conditionEmoji[card.condition] ?? "🟦"}</span>
              <span className="text-slate-200/70">
                {label(CONDITION_LABELS, card.condition)}
              </span>
            </div>
            <div className="font-mono">{masteryDots(card.masteryProgress)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
