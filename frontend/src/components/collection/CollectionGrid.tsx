import type { GeneratedCard } from "../../types/card";
import { CardFace } from "../card/CardFace";

type Props = {
  cards: GeneratedCard[];
  onSelect: (card: GeneratedCard) => void;
};

export function CollectionGrid({ cards, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => onSelect(card)}
          className="flex justify-center rounded-2xl border border-transparent p-1 hover:border-slate-700/70"
          aria-label={`Открыть карточку ${card.word}`}
        >
          <div style={{ transform: "scale(0.7)" }} className="origin-top">
            <div className="w-[340px]">
              <div className="h-[480px]">
                <CardFace card={card} />
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

