import type { GeneratedCard } from "../../types/card";
import { CardMini } from "../card/CardMini";

export function BoosterSummary({ cards }: { cards: GeneratedCard[] }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-4">
      {cards.map((c) => (
        <div key={c.id} className="rounded-2xl">
          <CardMini card={c} />
        </div>
      ))}
    </div>
  );
}

