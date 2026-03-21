import { useEffect, useMemo, useRef, useState } from "react";

import type { GeneratedCard } from "../../types/card";
import { CardBack } from "../card/CardBack";
import { CardFace } from "../card/CardFace";
import { CardFlip } from "../card/CardFlip";
import { CardMini } from "../card/CardMini";
import { CardBackCover } from "./CardBackCover";

type Props = {
  cards: GeneratedCard[];
  onAllRevealed: () => void;
};

type FlipPhase = "idle" | "closing" | "opening";

function CardPreviewModal({ card, onClose }: { card: GeneratedCard | null; onClose: () => void }) {
  useEffect(() => {
    if (!card) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [card, onClose]);

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Превью карты"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl bg-slate-950 p-1">
          <CardFlip
            front={<CardFace card={card} tilt={false} />}
            back={<CardBack card={card} />}
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}

function RevealSlot({
  card,
  revealed,
  onReveal,
  onOpenPreview,
}: {
  card: GeneratedCard;
  revealed: boolean;
  onReveal: () => void;
  onOpenPreview: () => void;
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
    if (phase !== "idle") return;
    if (revealed) {
      onOpenPreview();
      return;
    }
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
      className={["select-none", revealed ? "cursor-pointer" : ""].join(" ")}
      aria-label={revealed ? "Открыть превью карты" : "Раскрыть карту"}
    >
      <div
        className="transition-transform duration-200 ease-in-out"
        style={{ transform: `scaleX(${scaleX})`, willChange: "transform" }}
      >
        <div className="w-[120px] min-[375px]:w-[130px] sm:w-[150px] md:w-[170px] lg:w-[190px] xl:w-[200px]">
          {showFront ? (
            <CardMini card={card} size="mini" />
          ) : (
            <div className="aspect-[200/320]">
              <CardBackCover />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export function BoosterRevealGrid({ cards, onAllRevealed }: Props) {
  const [revealed, setRevealed] = useState<boolean[]>(() => cards.map(() => false));
  const [selectedCard, setSelectedCard] = useState<GeneratedCard | null>(null);

  useEffect(() => {
    setRevealed(cards.map(() => false));
    setSelectedCard(null);
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
            onOpenPreview={() => setSelectedCard(c)}
          />
        ))}
      </div>

      <div className="text-xs text-slate-200/50">
        {allRevealed ? "Все карты раскрыты." : "Раскрой все 5 карт."}
      </div>

      <CardPreviewModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </section>
  );
}
