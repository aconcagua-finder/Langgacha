import type { GeneratedCard } from "../../types/card";
import type { CardGroup } from "../../utils/groupCards";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";
import { getCardImageUrl } from "../../utils/cardImage";
import { RARITY_LABELS, TYPE_LABELS, label } from "../../shared/labels";

type Props = {
  groups: CardGroup[];
  onOpenCard: (card: GeneratedCard) => void;
  onOpenGroup: (group: CardGroup) => void;
};

export function CollectionTable({ groups, onOpenCard, onOpenGroup }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => {
        const best = group.bestCard;
        const count = group.cards.length;
        const isStack = count >= 2;
        const typeTheme = getTypeTheme(best.type);
        const rarityTheme = getRarityTheme(best.rarity);
        const imgUrl = getCardImageUrl(best.conceptKey);

        return (
          <button
            key={`${group.word}:${best.id}`}
            type="button"
            onClick={() => (isStack ? onOpenGroup(group) : onOpenCard(group.cards[0]))}
            className="rounded-xl border border-slate-800/60 bg-slate-900/20 px-4 py-3 text-left transition-colors hover:bg-slate-800/30"
            aria-label={isStack ? `Открыть стопку ${group.word}` : `Открыть карточку ${group.word}`}
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto_auto_auto]">
              <div
                className={[
                  "flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border",
                  "bg-gradient-to-br",
                  rarityTheme.gradient,
                ].join(" ")}
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={best.word}
                    className="h-9 w-9 object-contain drop-shadow-lg"
                  />
                ) : (
                  <span className="text-2xl">{typeTheme.emoji}</span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="truncate font-bold text-slate-50">{best.word}</span>
                  <span className="truncate text-sm text-slate-200/70">
                    {best.translationRu}
                  </span>
                </div>
              </div>

              <div className="hidden text-sm text-slate-200/70 sm:block">
                {label(TYPE_LABELS, best.type)}
              </div>

              <div
                className="rounded-full px-2 py-1 text-xs font-extrabold text-slate-950"
                style={{ backgroundColor: rarityTheme.badge }}
                aria-label={`Рарность ${label(RARITY_LABELS, best.rarity)}`}
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
