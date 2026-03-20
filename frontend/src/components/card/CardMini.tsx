import type { GeneratedCard } from "../../types/card";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";

const masteryDots = (progress: number) => {
  const total = 5;
  return Array.from({ length: total }, (_, i) => (i < progress ? "●" : "○")).join(
    "",
  );
};

const conditionEmoji: Record<string, string> = {
  Brillante: "✨",
  Normal: "🟦",
  Gastada: "🟨",
  Deteriorada: "🟥",
};

type Size = "mini" | "deck";

const sizeClass: Record<Size, { w: string; h: string }> = {
  mini: { w: "w-[200px]", h: "h-[280px]" },
  deck: { w: "w-[220px]", h: "h-[308px]" },
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
      <div className="h-2 w-full" style={{ backgroundColor: rarityTheme.badge }} />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="text-2xl">{typeTheme.emoji}</div>
          <div className="text-xs font-semibold text-slate-200/70">{card.type}</div>
        </div>

        <div className="mt-1">
          <div className="text-xl font-extrabold tracking-tight leading-tight">
            {card.word}
          </div>
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
              <span className="text-slate-200/70">{card.condition}</span>
            </div>
            <div className="font-mono">{masteryDots(card.masteryProgress)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

