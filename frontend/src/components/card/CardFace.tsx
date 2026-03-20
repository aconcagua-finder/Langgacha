import type { GeneratedCard } from "../../types/card";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";

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

export function CardFace({ card }: { card: GeneratedCard }) {
  const typeTheme = getTypeTheme(card.type);
  const rarityTheme = getRarityTheme(card.rarity);

  return (
    <div
      className={[
        "relative h-full w-full rounded-2xl border bg-slate-900/60 backdrop-blur",
        "flex flex-col overflow-hidden",
        rarityTheme.glow,
        rarityTheme.frameFx,
      ].join(" ")}
      style={{ borderColor: typeTheme.color }}
    >
      {card.masteryProgress >= 5 ? (
        <div className="pointer-events-none absolute right-4 top-4 z-10 rotate-12 rounded-xl bg-emerald-400/90 px-4 py-2 text-xs font-extrabold tracking-wide text-slate-950 shadow-lg">
          ✓ Mastered
        </div>
      ) : null}
      <div
        className={[
          "relative h-44 w-full",
          "bg-gradient-to-br",
          typeTheme.gradient,
          "border-b",
        ].join(" ")}
        style={{ borderBottomColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-7xl drop-shadow">{typeTheme.emoji}</div>
        </div>
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className="rounded-full px-2 py-1 text-xs font-semibold text-slate-950"
            style={{ backgroundColor: rarityTheme.badge }}
          >
            {card.rarity}
          </span>
          <span className="text-xs text-slate-200/90">{card.type}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="text-3xl font-extrabold tracking-tight">{card.word}</div>
          <div className="text-sm text-slate-200/80">{card.translationRu}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-950/40 p-3">
            <div className="text-xs text-slate-200/70">FUE</div>
            <div className="text-lg font-bold">{card.fue}</div>
          </div>
          <div className="rounded-xl bg-slate-950/40 p-3">
            <div className="text-xs text-slate-200/70">DEF</div>
            <div className="text-lg font-bold">{card.def}</div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between rounded-xl bg-slate-950/40 px-3 py-2 text-xs text-slate-200/80">
          <div className="flex items-center gap-2">
            <span>{conditionEmoji[card.condition] ?? "🟦"}</span>
            <span>{card.condition}</span>
          </div>
          <div className="font-mono">{masteryDots(card.masteryProgress)}</div>
        </div>
      </div>
    </div>
  );
}
