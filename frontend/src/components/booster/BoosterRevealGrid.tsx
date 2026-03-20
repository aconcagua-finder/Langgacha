import { useEffect, useMemo, useRef, useState } from "react";

import type { GeneratedCard } from "../../types/card";
import { CardMini } from "../card/CardMini";
import { CardBackCover } from "./CardBackCover";

type Props = {
  cards: GeneratedCard[];
  onAllRevealed: () => void;
};

type FlipPhase = "idle" | "closing" | "opening";

function RevealSlot({
  card,
  revealed,
  onReveal,
}: {
  card: GeneratedCard;
  revealed: boolean;
  onReveal: () => void;
}) {
  const [phase, setPhase] = useState<FlipPhase>("idle");
  const [showFront, setShowFront] = useState(revealed);
  const timeouts = useRef<number[]>([]);

  useEffect(() => {
    setShowFront(revealed);
  }, [revealed]);

  useEffect(() => {
    return () => {
      for (const id of timeouts.current) window.clearTimeout(id);
      timeouts.current = [];
    };
  }, []);

  const onClick = () => {
    if (revealed || phase !== "idle") return;
    setPhase("closing");
    const t1 = window.setTimeout(() => {
      setShowFront(true);
      onReveal();
      setPhase("opening");
      const t2 = window.setTimeout(() => setPhase("idle"), 200);
      timeouts.current.push(t2);
    }, 200);
    timeouts.current.push(t1);
  };

  const scaleX = phase === "closing" ? 0 : 1;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={revealed}
      className="select-none disabled:cursor-default"
      aria-label={revealed ? "Карта раскрыта" : "Раскрыть карту"}
    >
      <div
        className="transition-transform duration-200 ease-in-out"
        style={{ transform: `scaleX(${scaleX})`, willChange: "transform" }}
      >
        <div className="h-[126px] w-[84px] min-[375px]:h-[135px] min-[375px]:w-[90px] sm:h-[150px] sm:w-[100px] md:h-[180px] md:w-[120px] lg:h-[210px] lg:w-[140px] xl:h-[240px] xl:w-[160px]">
          {showFront ? <CardMini card={card} size="booster" /> : <CardBackCover />}
        </div>
      </div>
    </button>
  );
}

export function BoosterRevealGrid({ cards, onAllRevealed }: Props) {
  const [revealed, setRevealed] = useState<boolean[]>(() => cards.map(() => false));

  useEffect(() => {
    setRevealed(cards.map(() => false));
  }, [cards]);

  const allRevealed = useMemo(
    () => revealed.length === cards.length && revealed.every(Boolean),
    [revealed, cards.length],
  );

  useEffect(() => {
    if (allRevealed) onAllRevealed();
  }, [allRevealed, onAllRevealed]);

  return (
    <section className="flex flex-col items-center gap-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-5">
        {cards.map((c, i) => (
          <RevealSlot
            key={c.id}
            card={c}
            revealed={revealed[i] ?? false}
            onReveal={() =>
              setRevealed((prev) => {
                const next = prev.length ? [...prev] : cards.map(() => false);
                next[i] = true;
                return next;
              })
            }
          />
        ))}
      </div>

      <div className="text-xs text-slate-200/50">
        {allRevealed ? "Все карты раскрыты." : "Раскрой все 5 карт."}
      </div>
    </section>
  );
}
