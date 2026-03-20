import { useEffect, useState } from "react";

import type { GeneratedCard } from "../../types/card";
import { CardBack } from "../card/CardBack";
import { CardFace } from "../card/CardFace";
import { CardFlip } from "../card/CardFlip";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { DISINTEGRATE_COPY, POLVO_PER_DISINTEGRATE } from "../../shared/labels";

type Props = {
  card: GeneratedCard | null;
  onClose: () => void;
  onDisintegrate: (cardId: string) => Promise<void>;
};

export function CardModal({ card, onClose, onDisintegrate }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disintegrating, setDisintegrating] = useState(false);

  useEffect(() => {
    if (!card) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [card, onClose]);

  if (!card) return null;

  const polvo = POLVO_PER_DISINTEGRATE[card.rarity] ?? 0;
  const danger = ["R", "SR", "SSR"].includes(card.rarity);
  const description = danger ? DISINTEGRATE_COPY.rare(polvo) : DISINTEGRATE_COPY.common(polvo);

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
        <div className={["rounded-2xl bg-slate-950 p-1", disintegrating ? "disintegrating" : ""].join(" ")}>
          <CardFlip front={<CardFace card={card} />} back={<CardBack card={card} />} />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={disintegrating}
            className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700"
          >
            Закрыть
          </button>
          <button
            type="button"
            onClick={async () => {
              setConfirmOpen(true);
            }}
            disabled={disintegrating}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 hover:bg-rose-500/15"
          >
            Распылить
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={DISINTEGRATE_COPY.title}
        description={description}
        confirmLabel={DISINTEGRATE_COPY.confirm}
        cancelLabel={DISINTEGRATE_COPY.cancel}
        danger={danger}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          setDisintegrating(true);
          await new Promise((r) => window.setTimeout(r, 500));
          try {
            await onDisintegrate(card.id);
            onClose();
          } catch {
            setDisintegrating(false);
          }
        }}
      />
    </div>
  );
}
