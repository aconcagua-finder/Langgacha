import type { GeneratedCard } from "../../types/card";
import { CardFace } from "../card/CardFace";
import { CardBackCover } from "./CardBackCover";

export function BoosterCardReveal({
  card,
  revealed,
  onReveal,
}: {
  card: GeneratedCard;
  revealed: boolean;
  onReveal: () => void;
}) {
  return (
    <div
      className="origin-center will-change-transform"
      style={{ filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.45))" }}
    >
      <button
        type="button"
        onClick={() => {
          if (!revealed) onReveal();
        }}
        disabled={revealed}
        className={[
          "card-perspective group block w-[340px] select-none",
          revealed ? "cursor-default" : "cursor-pointer",
        ].join(" ")}
        aria-label={revealed ? "Карта раскрыта" : "Раскрыть карту"}
      >
        <div
          className="relative h-[480px] w-full transition-transform duration-700 card-preserve-3d"
          style={{ transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div className="absolute inset-0 card-backface-hidden">
            <CardBackCover />
          </div>
          <div
            className="absolute inset-0 card-backface-hidden"
            style={{ transform: "rotateY(180deg)" }}
          >
            <CardFace card={card} />
          </div>
        </div>
      </button>
    </div>
  );
}

