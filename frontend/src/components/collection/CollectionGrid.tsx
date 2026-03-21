import type { GeneratedCard } from "../../types/card";
import type { CardGroup } from "../../utils/groupCards";
import { CardFace } from "../card/CardFace";

type Props = {
  groups: CardGroup[];
  onOpenCard: (card: GeneratedCard) => void;
  onOpenGroup: (group: CardGroup) => void;
};

export function CollectionGrid({ groups, onOpenCard, onOpenGroup }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => {
        const count = g.cards.length;
        const isStack = count >= 2;
        const onClick = () => (isStack ? onOpenGroup(g) : onOpenCard(g.cards[0]));
        const shadows = Math.min(3, count - 1);

        return (
          <button
            key={`${g.word}:${g.bestCard.id}`}
            type="button"
            onClick={onClick}
            className="relative rounded-2xl text-left"
            aria-label={isStack ? `Открыть стопку ${g.word}` : `Открыть карточку ${g.word}`}
          >
            {isStack ? (
              <>
                {Array.from({ length: shadows }, (_, i) => {
                  const offset = (i + 1) * 8;
                  return (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-2xl border border-slate-800/60 bg-slate-900/25"
                      style={{ transform: `translate(${offset}px, ${offset}px)` }}
                    />
                  );
                })}
                <div className="absolute right-3 top-3 z-20 rounded-full bg-slate-950/75 px-2 py-1 text-xs font-extrabold text-slate-50">
                  ×{count}
                </div>
              </>
            ) : null}

            <div className="relative z-10 w-full aspect-[340/480]">
              <CardFace card={g.bestCard} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
