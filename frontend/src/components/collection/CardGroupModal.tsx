import { useEffect, useMemo, useState } from "react";

import type { CardGroup } from "../../utils/groupCards";
import type { GeneratedCard } from "../../types/card";
import { CardMini } from "../card/CardMini";
import { CardBack } from "../card/CardBack";
import { CardFace } from "../card/CardFace";
import { CardFlip } from "../card/CardFlip";

type Props = {
  group: CardGroup | null;
  onClose: () => void;
};

export function CardGroupModal({ group, onClose }: Props) {
  const [selected, setSelected] = useState<GeneratedCard | null>(null);

  useEffect(() => {
    if (!group) return;
    setSelected(group.bestCard);
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

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-5xl">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/80 p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-200/60">Стопка</div>
              <div className="text-2xl font-extrabold tracking-tight">
                {title} <span className="text-slate-200/60">×{group.cards.length}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700"
            >
              Закрыть
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-200/60">
                Экземпляры
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {group.cards.map((c) => (
                  <div key={c.id} className="flex shrink-0 flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelected(c)}
                      className={[
                        "rounded-2xl border p-1",
                        selected?.id === c.id
                          ? "border-sky-400/60 bg-sky-500/10"
                          : "border-transparent hover:border-slate-700/70",
                      ].join(" ")}
                      aria-label={`Выбрать ${c.word}`}
                    >
                      <CardMini card={c} />
                    </button>
                    <button
                      type="button"
                      disabled
                      title="Скоро"
                      className="rounded-xl bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-100/70 disabled:cursor-not-allowed"
                    >
                      Распылить
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-200/60">
                Просмотр
              </div>
              {selected ? (
                <CardFlip front={<CardFace card={selected} />} back={<CardBack card={selected} />} />
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/20 p-10 text-sm text-slate-200/70">
                  Выбери карту слева.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

