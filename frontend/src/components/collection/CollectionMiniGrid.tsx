import type { GeneratedCard } from "../../types/card";
import type { CardGroup } from "../../utils/groupCards";
import { CardMini } from "../card/CardMini";

type Props = {
  groups: CardGroup[];
  onOpenCard: (card: GeneratedCard) => void;
  onOpenGroup: (group: CardGroup) => void;
};

const STACK_SHADOW_OFFSETS = [
  "translate-x-1 translate-y-1 sm:translate-x-1.5 sm:translate-y-1.5",
  "translate-x-2 translate-y-2 sm:translate-x-3 sm:translate-y-3",
  "translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4",
];

export function CollectionMiniGrid({ groups, onOpenCard, onOpenGroup }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {groups.map((group) => {
        const count = group.cards.length;
        const isStack = count >= 2;
        const shadows = Math.min(3, count - 1);

        return (
          <button
            key={`${group.word}:${group.bestCard.id}`}
            type="button"
            onClick={() => (isStack ? onOpenGroup(group) : onOpenCard(group.cards[0]))}
            className="relative w-full rounded-2xl text-left"
            aria-label={
              isStack ? `Открыть стопку ${group.word}` : `Открыть карточку ${group.word}`
            }
          >
            <div className="relative mx-auto w-full max-w-[200px]">
              {isStack
                ? Array.from({ length: shadows }, (_, i) => (
                    <div
                      key={i}
                      className={[
                        "pointer-events-none absolute inset-0 rounded-2xl border border-slate-800/60 bg-slate-900/25",
                        STACK_SHADOW_OFFSETS[i] ?? STACK_SHADOW_OFFSETS.at(-1),
                      ].join(" ")}
                    />
                  ))
                : null}

              {isStack ? (
                <div className="absolute right-3 top-3 z-20 rounded-full bg-slate-950/75 px-2 py-1 text-xs font-extrabold text-slate-50">
                  ×{count}
                </div>
              ) : null}

              <div className="relative z-10">
                <CardMini card={group.bestCard} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
