import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { disintegrateCard, listCards, type ListCardsSort } from "../api/cards";
import { evolveCard } from "../api/evolution";
import type { GeneratedCard } from "../types/card";
import { CardModal } from "../components/collection/CardModal";
import { CardGroupModal } from "../components/collection/CardGroupModal";
import { CollectionFilters } from "../components/collection/CollectionFilters";
import { CollectionGrid } from "../components/collection/CollectionGrid";
import { CollectionMiniGrid } from "../components/collection/CollectionMiniGrid";
import { CollectionTable } from "../components/collection/CollectionTable";
import { groupCards } from "../utils/groupCards";
import type { CardGroup } from "../utils/groupCards";
import { usePlayer } from "../contexts/PlayerContext";
import { LEVEL_LABELS, TOOLTIPS, label } from "../shared/labels";
import { Tooltip } from "../components/ui/Tooltip";

const VIEW_MODE_OPTIONS = [
  { value: "full", icon: "🃏", label: "Карты" },
  { value: "mini", icon: "🔳", label: "Мини" },
  { value: "table", icon: "☰", label: "Список" },
] as const;

export function CollectionPage() {
  const { player, refresh: refreshPlayer } = usePlayer();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [sort, setSort] = useState<ListCardsSort>("newest");
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"full" | "mini" | "table">("full");
  const [modalCard, setModalCard] = useState<GeneratedCard | null>(null);
  const [modalGroup, setModalGroup] = useState<CardGroup | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const syncOpenViews = useCallback((nextCards: GeneratedCard[]) => {
    setModalCard((prev) => (prev ? nextCards.find((card) => card.id === prev.id) ?? null : null));
    const nextGroups = groupCards(nextCards);
    setModalGroup((prev) => (prev ? nextGroups.find((group) => group.word === prev.word) ?? null : null));
  }, []);

  const reloadCards = useCallback(async (): Promise<GeneratedCard[]> => {
    const nextCards = await listCards({
      type: selectedTypes,
      rarity: selectedRarities,
      sort,
    });
    setCards(nextCards);
    syncOpenViews(nextCards);
    return nextCards;
  }, [selectedTypes, selectedRarities, sort, syncOpenViews]);

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

  const onDisintegrate = async (cardId: string) => {
    try {
      const res = await disintegrateCard(cardId);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      setToast(`+${res.dustGained} Пыль`);
      window.setTimeout(() => setToast(null), 1800);
      await refreshPlayer();
    } catch (e) {
      setToast("Не удалось распылить карту");
      window.setTimeout(() => setToast(null), 1800);
      throw e;
    }
  };

  const onEvolve = async (cardId: string) => {
    try {
      const result = await evolveCard(cardId);
      const nextCards = await reloadCards();
      const nextCard = nextCards.find((card) => card.id === result.card.id) ?? result.card;
      setModalCard((prev) => (prev?.id === result.card.id ? nextCard : prev));
      setToast(`Эволюция: -${result.dustSpent} Пыль`);
      window.setTimeout(() => setToast(null), 2200);
      await refreshPlayer();
      return { ...result, card: nextCard };
    } catch (e) {
      setToast("Не удалось эволюционировать карту");
      window.setTimeout(() => setToast(null), 2200);
      throw e;
    }
  };

  const progressPct =
    player && player.nextLevel
      ? Math.min(100, Math.round((player.progressToNext / player.progressNeeded) * 100))
      : 100;

  return (
    <>
      <main
        className={[
          "mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-6 px-6 py-10",
        ].join(" ")}
      >
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Коллекция</h1>
            <div className="text-sm text-slate-200/70">
              Всего карт: <span className="font-mono">{cards.length}</span> · Уникальных
              слов: <span className="font-mono">{uniqueWords}</span>
            </div>
          </div>

          <div className="inline-flex w-full flex-wrap gap-2 rounded-2xl border border-slate-800/60 bg-slate-900/20 p-1 sm:w-auto">
            {VIEW_MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setViewMode(option.value)}
                className={[
                  "flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors",
                  viewMode === option.value
                    ? "bg-slate-800 text-slate-50"
                    : "text-slate-200/70 hover:bg-slate-900/50",
                ].join(" ")}
                aria-pressed={viewMode === option.value}
                aria-label={option.label}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </header>

        {toast ? (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
            {toast}
          </div>
        ) : null}

        {player ? (
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-200/80">
                Уровень: <span className="font-mono">{label(LEVEL_LABELS, player.level)}</span>
                {player.nextLevel ? (
                  <>
                    {" "}
                    →{" "}
                    <span className="font-mono">{label(LEVEL_LABELS, player.nextLevel)}</span>
                  </>
                ) : null}
              </div>
              <div className="text-sm text-slate-200/70">
                Освоено:{" "}
                <span className="font-mono">
                  {player.progressToNext}/{player.progressNeeded}
                </span>
              </div>
            </div>
            <Tooltip text={TOOLTIPS.levelProgress}>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-950/40">
                <div className="h-full bg-sky-400" style={{ width: `${progressPct}%` }} />
              </div>
            </Tooltip>
            <div className="mt-2 text-xs text-slate-200/60">
              Доступные рарности:{" "}
              <span className="font-mono">{player.unlockedRarities.join(", ")}</span>
            </div>
          </div>
        ) : null}

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
          <>
            {viewMode === "full" && (
              <CollectionGrid
                groups={groups}
                onOpenCard={(c) => setModalCard(c)}
                onOpenGroup={(g) => setModalGroup(g)}
              />
            )}
            {viewMode === "mini" && (
              <CollectionMiniGrid
                groups={groups}
                onOpenCard={(c) => setModalCard(c)}
                onOpenGroup={(g) => setModalGroup(g)}
              />
            )}
            {viewMode === "table" && (
              <CollectionTable
                groups={groups}
                onOpenCard={(c) => setModalCard(c)}
                onOpenGroup={(g) => setModalGroup(g)}
              />
            )}
          </>
        )}
      </main>

      <CardModal
        card={modalCard}
        onClose={() => setModalCard(null)}
        onDisintegrate={onDisintegrate}
        onEvolve={onEvolve}
      />
      <CardGroupModal
        group={modalGroup}
        onClose={() => setModalGroup(null)}
        onDisintegrate={onDisintegrate}
        onEvolve={onEvolve}
      />
    </>
  );
}
