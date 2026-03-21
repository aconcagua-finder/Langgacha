import type { GeneratedCard } from "../../types/card";
import type { CardGroup } from "../../utils/groupCards";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";
import { TYPE_LABELS, label } from "../../shared/labels";

type Props = {
  groups: CardGroup[];
  onOpenCard: (card: GeneratedCard) => void;
  onOpenGroup: (group: CardGroup) => void;
};

export function CollectionGrid({ groups, onOpenCard, onOpenGroup }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {groups.map((g) => {
        const best = g.bestCard;
        const count = g.cards.length;
        const isStack = count >= 2;
        const onClick = () => (isStack ? onOpenGroup(g) : onOpenCard(g.cards[0]));
        const typeTheme = getTypeTheme(best.type);
        const rarityTheme = getRarityTheme(best.rarity);

        return (
          <button
            key={`${g.word}:${best.id}`}
            type="button"
            onClick={onClick}
            className={[
              "rounded-xl border border-slate-800/60 bg-slate-900/20 px-4 py-3 text-left",
              "transition-colors hover:bg-slate-800/30",
            ].join(" ")}
            aria-label={isStack ? `Открыть стопку ${g.word}` : `Открыть карточку ${g.word}`}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]">
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg">{typeTheme.emoji}</span>
                  <span className="truncate font-bold text-slate-50">{best.word}</span>
                  <span className="truncate text-sm text-slate-200/70">{best.translationRu}</span>
                </div>
              </div>

              <div className="hidden text-sm text-slate-200/70 sm:block">
                {label(TYPE_LABELS, best.type)}
              </div>

              <div
                className="rounded-full px-2 py-1 text-xs font-extrabold text-slate-950"
                style={{ backgroundColor: rarityTheme.badge }}
                aria-label={`Рарность ${best.rarity}`}
              >
                {best.rarity}
              </div>

              <div
                className={[
                  "text-xs font-extrabold",
                  count > 1 ? "text-slate-50" : "text-slate-200/40",
                ].join(" ")}
              >
                {count > 1 ? `×${count}` : "—"}
              </div>

              <div className="hidden justify-self-end font-mono text-xs text-slate-200/80 sm:block">
                <span>ATK {best.atk}</span>
                <span className="px-2 text-slate-200/35">·</span>
                <span>DEF {best.def}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
