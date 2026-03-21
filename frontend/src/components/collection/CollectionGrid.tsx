import type { GeneratedCard } from "../../types/card";
import type { CardGroup } from "../../utils/groupCards";
import { CardMini } from "../card/CardMini";

type Props = {
  groups: CardGroup[];
  onOpenCard: (card: GeneratedCard) => void;
  onOpenGroup: (group: CardGroup) => void;
};

export function CollectionGrid({ groups, onOpenCard, onOpenGroup }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {groups.map((g) => {
        const count = g.cards.length;
        const isStack = count >= 2;
        const onClick = () => (isStack ? onOpenGroup(g) : onOpenCard(g.cards[0]));

        return (
          <button
            key={`${g.word}:${g.bestCard.id}`}
            type="button"
            onClick={onClick}
            className="relative rounded-2xl p-1"
            aria-label={isStack ? `Открыть стопку ${g.word}` : `Открыть карточку ${g.word}`}
          >
            {isStack ? (
              <div className="absolute right-3 top-3 z-20 rounded-full bg-slate-950/75 px-2 py-1 text-xs font-extrabold text-slate-50">
                ×{count}
              </div>
            ) : null}

            <div className="relative z-10">
              <CardMini card={g.bestCard} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
