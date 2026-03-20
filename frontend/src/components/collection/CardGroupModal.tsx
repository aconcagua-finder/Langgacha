import { useEffect, useMemo, useState } from "react";

import type { CardGroup } from "../../utils/groupCards";
import type { GeneratedCard } from "../../types/card";
import { CardMini } from "../card/CardMini";
import { CardBack } from "../card/CardBack";
import { CardFace } from "../card/CardFace";
import { CardFlip } from "../card/CardFlip";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { DISINTEGRATE_COPY, DUST_PER_DISINTEGRATE } from "../../shared/labels";

type Props = {
  group: CardGroup | null;
  onClose: () => void;
  onDisintegrate: (cardId: string) => Promise<void>;
};

export function CardGroupModal({ group, onClose, onDisintegrate }: Props) {
  const [selected, setSelected] = useState<GeneratedCard | null>(null);
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [confirmCard, setConfirmCard] = useState<GeneratedCard | null>(null);
  const [disintegratingId, setDisintegratingId] = useState<string | null>(null);

  useEffect(() => {
    if (!group) return;
    setSelected(group.bestCard);
    setCards(group.cards);
  }, [group]);

  useEffect(() => {
    if (!group) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [group, onClose]);

  const title = useMemo(() => group?.word ?? "", [group]);

  if (!group) return null;

  const dust = confirmCard ? (DUST_PER_DISINTEGRATE[confirmCard.rarity] ?? 0) : 0;
  const danger = confirmCard ? ["R", "SR", "SSR"].includes(confirmCard.rarity) : false;
  const description = danger ? DISINTEGRATE_COPY.rare(dust) : DISINTEGRATE_COPY.common(dust);

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/90 p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-5xl">
        <div className="flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-200/60">Стопка</div>
              <div className="text-2xl font-extrabold tracking-tight">
                {title} <span className="text-slate-200/60">×{cards.length}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={!!disintegratingId}
              className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700"
            >
              Закрыть
            </button>
          </div>

          <div className="mt-5 flex-1 min-h-0 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-200/60">
                Экземпляры
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {cards.map((c) => (
                  <div
                    key={c.id}
                    className={[
                      "flex flex-col items-center gap-2",
                      disintegratingId === c.id ? "disintegrating" : "",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(c)}
                      disabled={disintegratingId === c.id}
                      className={[
                        "rounded-2xl p-1",
                        selected?.id === c.id
                          ? "bg-sky-500/10"
                          : "hover:bg-slate-950/10",
                      ].join(" ")}
                      aria-label={`Выбрать ${c.word}`}
                    >
                      <CardMini card={c} selected={selected?.id === c.id} />
                    </button>
                    <button
                      type="button"
                      disabled={disintegratingId === c.id}
                      onClick={() => setConfirmCard(c)}
                      className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-50 hover:bg-slate-700"
                    >
                      Распылить
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky top-0 self-start flex flex-col items-center gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-200/60">
                Просмотр
              </div>
              {selected ? (
                <div className="rounded-2xl bg-slate-950 p-1">
                  <CardFlip
                    front={<CardFace card={selected} tilt={false} />}
                    back={<CardBack card={selected} />}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/20 p-10 text-sm text-slate-200/70">
                  Выбери карту слева.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmCard}
        title={DISINTEGRATE_COPY.title}
        description={description}
        confirmLabel={DISINTEGRATE_COPY.confirm}
        cancelLabel={DISINTEGRATE_COPY.cancel}
        danger={danger}
        onCancel={() => setConfirmCard(null)}
        onConfirm={async () => {
          const cardToRemove = confirmCard;
          if (!cardToRemove) return;
          setConfirmCard(null);
          setDisintegratingId(cardToRemove.id);
          await new Promise((r) => window.setTimeout(r, 500));
          try {
            await onDisintegrate(cardToRemove.id);
            const next = cards.filter((x) => x.id !== cardToRemove.id);
            setCards(next);
            if (selected?.id === cardToRemove.id) setSelected(next[0] ?? null);
            if (next.length === 0) onClose();
          } catch {
            // error toast handled upstream
          } finally {
            setDisintegratingId(null);
          }
        }}
      />
    </div>
  );
}
