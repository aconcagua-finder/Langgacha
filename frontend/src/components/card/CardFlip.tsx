import type { ReactNode } from "react";
import { useState } from "react";

type Props = {
  front: ReactNode;
  back: ReactNode;
};

export function CardFlip({ front, back }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((v) => !v)}
      className="card-perspective group block w-[340px] select-none"
      aria-label="Перевернуть карточку"
    >
      <div
        className="relative h-[480px] w-full transition-transform duration-700 card-preserve-3d"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div className="absolute inset-0 card-backface-hidden">{front}</div>
        <div
          className="absolute inset-0 card-backface-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          {back}
        </div>
      </div>
    </button>
  );
}

