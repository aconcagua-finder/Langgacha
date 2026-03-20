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
    <div className="grid place-items-center grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {groups.map((g) => {
        const count = g.cards.length;
        const isStack = count >= 2;
        const shadows = Math.min(3, count - 1);
        const onClick = () => (isStack ? onOpenGroup(g) : onOpenCard(g.cards[0]));

        return (
          <button
            key={`${g.word}:${g.bestCard.id}`}
            type="button"
            onClick={onClick}
            className="relative rounded-2xl border border-transparent p-1 hover:border-slate-700/70"
            aria-label={isStack ? `Открыть стопку ${g.word}` : `Открыть карточку ${g.word}`}
          >
            {isStack ? (
              <>
                {Array.from({ length: shadows }, (_, i) => {
                  const offset = (i + 1) * 4;
                  return (
                    <div
                      key={i}
                      className="absolute left-1 top-1 rounded-2xl border border-slate-800/60 bg-slate-900/20"
                      style={{
                        width: 200,
                        height: 320,
                        transform: `translate(${offset}px, ${offset}px)`,
                      }}
                    />
                  );
                })}
                <div className="absolute right-3 top-3 z-20 rounded-full bg-slate-950/70 px-2 py-1 text-xs font-extrabold text-slate-50">
                  ×{count}
                </div>
              </>
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
