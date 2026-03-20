import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listCards, type ListCardsSort } from "../api/cards";
import type { GeneratedCard } from "../types/card";
import { CardModal } from "../components/collection/CardModal";
import { CardGroupModal } from "../components/collection/CardGroupModal";
import { CollectionFilters } from "../components/collection/CollectionFilters";
import { CollectionGrid } from "../components/collection/CollectionGrid";
import { groupCards } from "../utils/groupCards";
import type { CardGroup } from "../utils/groupCards";

export function CollectionPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [sort, setSort] = useState<ListCardsSort>("newest");
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalCard, setModalCard] = useState<GeneratedCard | null>(null);
  const [modalGroup, setModalGroup] = useState<CardGroup | null>(null);

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
  }, [selectedTypes, selectedRarities, sort]);

  const groups = useMemo(() => groupCards(cards), [cards]);
  const uniqueWords = groups.length;
  const canStartBattle = cards.length >= 5;

  return (
    <>
      <main
        className={[
          "mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-6 px-6 py-10",
          canStartBattle ? "pb-24" : "",
        ].join(" ")}
      >
      <header className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Коллекция</h1>
          <div className="text-sm text-slate-200/70">
            Всего карт: <span className="font-mono">{cards.length}</span> · Уникальных
            слов: <span className="font-mono">{uniqueWords}</span>
          </div>
        </div>
      </header>

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

      {loading ? (
        <div className="text-sm text-slate-200/70">Загружаю коллекцию…</div>
      ) : cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/20 p-10 text-sm text-slate-200/70">
          Коллекция пуста.{" "}
          <Link to="/" className="font-semibold text-sky-300 hover:text-sky-200">
            Открой первый бустер!
          </Link>
        </div>
      ) : (
        <CollectionGrid
          groups={groups}
          onOpenCard={(c) => setModalCard(c)}
          onOpenGroup={(g) => setModalGroup(g)}
        />
      )}

      </main>

      {canStartBattle ? (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-end px-6 py-2">
            <Link
              to="/battle"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-50 hover:bg-slate-900"
            >
              ⚔️ Начать бой
            </Link>
          </div>
        </div>
      ) : null}

      <CardModal card={modalCard} onClose={() => setModalCard(null)} />
      <CardGroupModal group={modalGroup} onClose={() => setModalGroup(null)} />
    </>
  );
}
