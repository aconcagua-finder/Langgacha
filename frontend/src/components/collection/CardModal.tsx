import { useEffect } from "react";

import type { GeneratedCard } from "../../types/card";
import { CardBack } from "../card/CardBack";
import { CardFace } from "../card/CardFace";
import { CardFlip } from "../card/CardFlip";

type Props = {
  card: GeneratedCard | null;
  onClose: () => void;
};

export function CardModal({ card, onClose }: Props) {
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
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/90 p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-2xl bg-slate-950 p-1">
          <CardFlip front={<CardFace card={card} />} back={<CardBack card={card} />} />
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
