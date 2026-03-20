import { CardBack } from "../card/CardBack";
import { CardFace } from "../card/CardFace";
import { CardFlip } from "../card/CardFlip";
import type { GeneratedCard } from "../../types/card";
import { getRarityTheme } from "../../styles/card-themes";

type Props = {
  cards: GeneratedCard[];
  visibleCount: number;
};

export function BoosterReveal({ cards, visibleCount }: Props) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-5">
      {cards.map((card, idx) => {
        const visible = idx < visibleCount;
        const rarityTheme = getRarityTheme(card.rarity);

        if (!visible) {
          return (
            <div
              key={`hidden-${idx}`}
              className="h-[336px] w-[238px] rounded-2xl border border-slate-800/60 bg-slate-900/30"
            />
          );
        }

        return (
          <div
            key={card.id}
            className="origin-center animate-[reveal_420ms_ease-out] will-change-transform"
            style={{ filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.45))" }}
          >
            <div
              className={["rounded-2xl", rarityTheme.glow].join(" ")}
              style={{ transform: "scale(0.7)" }}
            >
              <CardFlip front={<CardFace card={card} />} back={<CardBack card={card} />} />
            </div>
          </div>
        );
      })}
      <style>
        {`
          @keyframes reveal {
            0% { transform: scale(0.92); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

