import type { GeneratedCard } from "../../types/card";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";

export function CardBack({ card }: { card: GeneratedCard }) {
  const typeTheme = getTypeTheme(card.type);
  const rarityTheme = getRarityTheme(card.rarity);

  return (
    <div
      className={[
        "h-full w-full rounded-2xl border bg-slate-900/70 backdrop-blur",
        "flex flex-col overflow-hidden p-4",
        rarityTheme.glow,
        rarityTheme.frameFx,
      ].join(" ")}
      style={{ borderColor: typeTheme.color }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-extrabold tracking-tight">{card.word}</div>
          <div className="text-sm text-slate-200/80">{card.translationRu}</div>
        </div>
        <div className="text-3xl">{typeTheme.emoji}</div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-950/40 p-4">
        <div className="text-xs text-slate-200/70">Флейвор</div>
        <div className="mt-2 text-sm italic text-slate-100/90">
          “{card.flavorText}”
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-slate-950/40 p-4">
        <div className="flex items-center gap-2 text-xs text-slate-200/70">
          <span>💡</span>
          <span>Подсказка</span>
        </div>
        <div className="mt-2 text-sm text-slate-100/90">{card.hint}</div>
      </div>

      <div className="mt-auto pt-3">
        <div className="text-xs text-slate-200/70">Теги</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {card.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-950/40 px-2 py-1 text-xs text-slate-100/80"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

