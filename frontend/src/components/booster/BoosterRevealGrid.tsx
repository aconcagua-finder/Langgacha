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

const glowClassForRarity = (rarity: string): string => {
  if (rarity === "SSR") return "reveal-glow-ssr";
  if (rarity === "SR") return "reveal-glow-sr";
  if (rarity === "R") return "reveal-glow-r";
  return "";
};

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
  const [glowClass, setGlowClass] = useState("");
  const timeouts = useRef<number[]>([]);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!revealed) {
      isAnimating.current = false;
      setPhase("idle");
      setShowFront(false);
      setGlowClass("");
      return;
    }
    if (!showFront && !isAnimating.current) {
      isAnimating.current = true;
      setPhase("closing");
      const t1 = window.setTimeout(() => {
        setShowFront(true);
        setPhase("opening");
        const nextGlowClass = glowClassForRarity(card.rarity);
        if (nextGlowClass) {
          setGlowClass(nextGlowClass);
          const tGlow = window.setTimeout(() => setGlowClass(""), 1000);
          timeouts.current.push(tGlow);
        }
        const t2 = window.setTimeout(() => {
          setPhase("idle");
          isAnimating.current = false;
        }, 220);
        timeouts.current.push(t2);
      }, 180);
      timeouts.current.push(t1);
    }
  }, [card.rarity, revealed, showFront]);

  useEffect(() => {
    return () => {
      for (const id of timeouts.current) window.clearTimeout(id);
      timeouts.current = [];
    };
  }, []);

  const onClick = () => {
    if (phase !== "idle") return;
    if (revealed || showFront) {
      onOpenPreview();
      return;
    }
    onReveal();
  };

  const scaleX = phase === "closing" ? 0 : 1;

  return (
    <button
      type="button"
      onClick={onClick}
      className="select-none cursor-pointer"
      aria-label={revealed || showFront ? "Открыть превью карты" : "Раскрыть карту"}
    >
      <div
        className={["transition-transform duration-200 ease-in-out", glowClass].join(" ")}
        style={{ transform: `scaleX(${scaleX})`, willChange: "transform" }}
      >
        <div className="w-[85px] min-[375px]:w-[92px] sm:w-[110px] md:w-[128px] lg:w-[142px] xl:w-[152px]">
          {showFront ? (
            <CardMini card={card} size="booster" />
          ) : (
            <div className="aspect-[200/320]">
              <div className="card-back-pulse h-full w-full">
                <CardBackCover />
              </div>
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
  const [revealingAll, setRevealingAll] = useState(false);
  const revealTimers = useRef<number[]>([]);

  useEffect(() => {
    setRevealed(cards.map(() => false));
    setSelectedCard(null);
    setRevealingAll(false);
    for (const id of revealTimers.current) window.clearTimeout(id);
    revealTimers.current = [];
  }, [cards]);

  useEffect(() => {
    return () => {
      for (const id of revealTimers.current) window.clearTimeout(id);
    };
  }, []);

  const allRevealed = useMemo(
    () => revealed.length === cards.length && revealed.every(Boolean),
    [revealed, cards.length],
  );

  const topRow = useMemo(() => cards.slice(0, 4), [cards]);
  const bottomRow = useMemo(() => cards.slice(4), [cards]);

  useEffect(() => {
    if (allRevealed) {
      setRevealingAll(false);
      onAllRevealed();
    }
  }, [allRevealed, onAllRevealed]);

  const revealIndex = (idx: number) => {
    setRevealed((prev) => {
      const next = prev.length ? [...prev] : cards.map(() => false);
      next[idx] = true;
      return next;
    });
  };

  const revealAll = () => {
    if (allRevealed || revealingAll) return;

    const unrevealed = revealed
      .map((isRevealed, idx) => (!isRevealed ? idx : -1))
      .filter((idx) => idx >= 0);

    if (!unrevealed.length) return;

    setRevealingAll(true);
    for (const id of revealTimers.current) window.clearTimeout(id);
    revealTimers.current = [];

    unrevealed.forEach((idx, order) => {
      const timeoutId = window.setTimeout(() => {
        revealIndex(idx);
        if (order === unrevealed.length - 1) {
          setRevealingAll(false);
        }
      }, order * 400);
      revealTimers.current.push(timeoutId);
    });
  };

  const renderRow = (rowCards: GeneratedCard[], offset: number, columnsClass: string) => (
    <div className={["grid justify-center gap-2 sm:gap-3 md:gap-4", columnsClass].join(" ")}>
      {rowCards.map((card, rowIndex) => {
        const idx = offset + rowIndex;
        return (
          <RevealSlot
            key={card.id}
            card={card}
            revealed={revealed[idx] ?? false}
            onReveal={() => revealIndex(idx)}
            onOpenPreview={() => setSelectedCard(card)}
          />
        );
      })}
    </div>
  );

  return (
    <section className="flex flex-col items-center gap-6">
      <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
        {renderRow(topRow, 0, "grid-cols-4")}
        {bottomRow.length ? renderRow(bottomRow, 4, "grid-cols-3") : null}
      </div>

      {!allRevealed ? (
        <button
          type="button"
          onClick={revealAll}
          disabled={revealingAll}
          className={[
            "rounded-xl border border-slate-700/70 px-4 py-2 text-sm font-bold transition-colors",
            revealingAll
              ? "bg-slate-900/60 text-slate-400"
              : "bg-slate-950/40 text-slate-100 hover:bg-slate-900/70",
          ].join(" ")}
        >
          {revealingAll ? "Раскрываю…" : "Раскрыть все"}
        </button>
      ) : null}

      <div className="text-xs text-slate-200/50">
        {allRevealed ? "Все карты раскрыты!" : "Нажми на карты или «Раскрыть все»"}
      </div>

      <CardPreviewModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </section>
  );
}
