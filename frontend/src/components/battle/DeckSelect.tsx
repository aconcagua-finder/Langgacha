import { useEffect, useMemo, useState } from "react";

import { listCards, type ListCardsSort } from "../../api/cards";
import type { GeneratedCard } from "../../types/card";
import { CardMini } from "../card/CardMini";
import { CollectionFilters } from "../collection/CollectionFilters";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";
import { TYPE_LABELS, label } from "../../shared/labels";

type Props = {
  onStart: (cardIds: string[]) => void;
};

export function DeckSelect({ onStart }: Props) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [sort, setSort] = useState<ListCardsSort>("newest");
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedById, setSelectedById] = useState<Record<string, GeneratedCard>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  const autoSelect = () => {
    const condRank: Record<string, number> = {
      Brilliant: 3,
      Normal: 2,
      Worn: 1,
      Deteriorated: 0,
    };

    const sorted = cards
      .map((card) => ({ card, r: Math.random() }))
      .sort((a, b) => {
        const ca = condRank[a.card.condition] ?? 2;
        const cb = condRank[b.card.condition] ?? 2;
        if (cb !== ca) return cb - ca;
        const pa = a.card.atk + a.card.def;
        const pb = b.card.atk + b.card.def;
        if (pb !== pa) return pb - pa;
        return b.r - a.r;
      })
      .map((x) => x.card);

    const top = sorted.slice(0, 5);
    setSelectedIds(top.map((c) => c.id));
    setSelectedById(Object.fromEntries(top.map((c) => [c.id, c])));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listCards({ type: selectedTypes, rarity: selectedRarities, sort })
      .then((data) => {
        if (!cancelled) setCards(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedTypes, selectedRarities, sort, refreshKey]);

  const toggle = (card: GeneratedCard) => {
    setSelectedIds((prev) => {
      if (prev.includes(card.id)) {
        setSelectedById((map) => {
          const next = { ...map };
          delete next[card.id];
          return next;
        });
        return prev.filter((id) => id !== card.id);
      }
      if (prev.length >= 5) return prev;
      setSelectedById((map) => ({ ...map, [card.id]: card }));
      return [...prev, card.id];
    });
  };

  const removeAtIndex = (idx: number) => {
    setSelectedIds((prev) => {
      const id = prev[idx];
      if (id) {
        setSelectedById((map) => {
          const next = { ...map };
          delete next[id];
          return next;
        });
      }
      return prev.filter((_, i) => i !== idx);
    });
  };

  return (
    <div className="flex flex-col gap-4 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-200/70">
          Выбери <span className="font-mono">5</span> карт (порядок выбора = порядок боя) ·
          Выбрано: <span className="font-mono">{selectedIds.length}/5</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={autoSelect}
            disabled={loading || cards.length === 0}
            className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700 disabled:opacity-60"
          >
            Авто
          </button>
          <button
            type="button"
            onClick={() => setRefreshKey((v) => v + 1)}
            disabled={loading}
            className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? "Загружаю…" : "Обновить"}
          </button>
        </div>
      </div>

      <CollectionFilters
        selectedTypes={selectedTypes}
        selectedRarities={selectedRarities}
        sort={sort}
        onChange={(next) => {
          setSelectedTypes(next.selectedTypes);
          setSelectedRarities(next.selectedRarities);
          setSort(next.sort);
        }}
      />

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
                  "relative rounded-2xl p-1",
                  selectedSet.has(c.id)
                    ? "bg-sky-500/10"
                    : "hover:bg-slate-950/10",
                ].join(" ")}
                aria-label={`Выбрать карту ${c.word}`}
              >
                {selectedSet.has(c.id) ? (
                  <div className="absolute right-3 top-3 z-10 rounded-full bg-sky-400 px-2 py-1 text-xs font-bold text-slate-950">
                    ✓
                  </div>
                ) : null}
                <CardMini card={c} selected={selectedSet.has(c.id)} />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-3 py-2 sm:px-6 sm:py-3">
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            {Array.from({ length: 5 }, (_, i) => {
              const id = selectedIds[i];
              const card = id ? selectedById[id] ?? byId.get(id) : undefined;
              if (!card) {
                return (
                  <div
                    key={i}
                    className="flex h-[70px] w-[50px] shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-700/70 bg-slate-950/10 text-xs font-semibold text-slate-200/60 sm:h-[90px] sm:w-[64px]"
                  >
                    {i + 1}
                  </div>
                );
              }

              const rarityTheme = getRarityTheme(card.rarity);
              const typeTheme = getTypeTheme(card.type);

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => removeAtIndex(i)}
                  className="flex h-[70px] w-[50px] shrink-0 flex-col justify-between rounded-xl border bg-slate-950/20 p-2 text-left hover:bg-slate-950/30 sm:h-[90px] sm:w-[64px]"
                  style={{ borderColor: rarityTheme.border }}
                  aria-label={`Убрать ${card.word} из колоды`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-lg">{typeTheme.emoji}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-extrabold text-slate-950"
                      style={{ backgroundColor: rarityTheme.badge }}
                    >
                      {card.rarity}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-extrabold leading-tight text-slate-50">
                      {card.word}
                    </div>
                    <div className="truncate text-[10px] text-slate-200/60">
                      {label(TYPE_LABELS, card.type)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onStart(selectedIds)}
            disabled={selectedIds.length !== 5}
            className="shrink-0 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60 disabled:hover:bg-sky-500"
          >
            Начать бой
          </button>
        </div>
      </div>
    </div>
  );
}
