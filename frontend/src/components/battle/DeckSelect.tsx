import { useEffect, useMemo, useState } from "react";

import { listCards } from "../../api/cards";
import type { GeneratedCard } from "../../types/card";
import { CardMini } from "../card/CardMini";

type Props = {
  onStart: (cardIds: string[]) => void;
};

export function DeckSelect({ onStart }: Props) {
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCards({ sort: "newest" });
      setCards(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (card: GeneratedCard) => {
    setSelectedIds((prev) => {
      if (prev.includes(card.id)) return prev.filter((id) => id !== card.id);
      if (prev.length >= 5) return prev;
      return [...prev, card.id];
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-200/70">
          Выбери <span className="font-mono">5</span> карт (порядок выбора = порядок боя)
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? "Загружаю…" : "Обновить"}
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {cards.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/20 p-10 text-sm text-slate-200/70">
          Коллекция пуста. Сначала открой бустер.
        </div>
      ) : null}

      {cards.length > 0 ? (
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-200/60">
            Коллекция
          </div>
          <div className="grid place-items-center grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {cards.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c)}
                className={[
                  "relative rounded-2xl border p-1",
                  selectedSet.has(c.id)
                    ? "border-sky-400/60 bg-sky-500/10"
                    : "border-transparent hover:border-slate-700/70",
                ].join(" ")}
                aria-label={`Выбрать карту ${c.word}`}
              >
                {selectedSet.has(c.id) ? (
                  <div className="absolute right-3 top-3 z-10 rounded-full bg-sky-400 px-2 py-1 text-xs font-bold text-slate-950">
                    ✓
                  </div>
                ) : null}
                <CardMini card={c} />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-200/60">
          Колода
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 5 }, (_, i) => {
            const id = selectedIds[i];
            const card = id ? byId.get(id) : undefined;
            if (!card) {
              return (
                <div
                  key={i}
                  className="flex h-[350px] w-[220px] shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/10 text-sm text-slate-200/50"
                >
                  Слот {i + 1}
                </div>
              );
            }

            return (
              <div key={id} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedIds((prev) => prev.filter((x) => x !== id))}
                  className="rounded-2xl border border-transparent hover:border-slate-700/70"
                  aria-label={`Убрать ${card.word} из колоды`}
                >
                  <CardMini card={card} size="deck" />
                </button>
                <div className="absolute left-3 top-3 rounded-full bg-slate-950/70 px-2 py-1 text-xs font-extrabold text-slate-50">
                  {i + 1}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onStart(selectedIds)}
          disabled={selectedIds.length !== 5}
          className="mt-4 w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60 disabled:hover:bg-sky-500"
        >
          Начать бой
        </button>
      </div>
    </div>
  );
}
