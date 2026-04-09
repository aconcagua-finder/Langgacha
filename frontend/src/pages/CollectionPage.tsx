import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { disintegrateCard, listCards, type ListCardsSort } from "../api/cards";
import { evolveCard } from "../api/evolution";
import { CardGroupModal } from "../components/collection/CardGroupModal";
import { CardModal } from "../components/collection/CardModal";
import { CollectionFilters } from "../components/collection/CollectionFilters";
import { CollectionGrid } from "../components/collection/CollectionGrid";
import { CollectionMiniGrid } from "../components/collection/CollectionMiniGrid";
import { CollectionTable } from "../components/collection/CollectionTable";
import { SegmentedTabs } from "../components/ui/SegmentedTabs";
import { Tooltip } from "../components/ui/Tooltip";
import { usePlayer } from "../contexts/PlayerContext";
import { TOOLTIPS } from "../shared/labels";
import type { ThemeProgressDto } from "../api/player";
import type { GeneratedCard } from "../types/card";
import type { CardGroup } from "../utils/groupCards";
import { groupCards } from "../utils/groupCards";
import { CraftPage } from "./CraftPage";

const VIEW_MODE_OPTIONS = [
  { value: "full", icon: "🃏", label: "Карты" },
  { value: "mini", icon: "🔳", label: "Мини" },
  { value: "table", icon: "☰", label: "Список" },
] as const;

function CollectionCardsTab() {
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
      setCards((prev) => prev.filter((card) => card.id !== cardId));
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

  // Phase 2.18 TASK-052: progress is measured against the NEXT level's requirements.
  // widthPct = how full the next-level width bar is (clamped to current level's floor).
  const widthFloor = player?.widthRequired ?? 0;
  const widthTarget = player?.nextLevelWidth ?? widthFloor;
  const widthSpan = Math.max(1, widthTarget - widthFloor);
  const widthIntoSpan = Math.max(0, (player?.wordsWidth ?? 0) - widthFloor);
  const widthPct = Math.min(100, Math.round((widthIntoSpan / widthSpan) * 100));

  const avgFloor = player?.minAvgLevel ?? 0;
  const avgTarget = player?.nextLevelMinAvg ?? avgFloor;
  const avgSpan = Math.max(0.1, avgTarget - avgFloor);
  const avgIntoSpan = Math.max(0, (player?.avgWordLevel ?? 0) - avgFloor);
  const avgLevelPct = Math.min(100, Math.round((avgIntoSpan / avgSpan) * 100));

  // Epoch → accent color for the hero block. Keeps visual identity per era.
  const epochAccent: Record<string, string> = {
    Metales: "from-amber-300/30 via-orange-400/20 to-amber-600/10",
    Piedras: "from-emerald-300/30 via-teal-400/20 to-sky-500/10",
    Cosmos: "from-fuchsia-400/30 via-violet-500/20 to-indigo-600/10",
  };
  const heroGradient =
    epochAccent[player?.collectionLevelEpoch ?? ""] ?? "from-slate-400/20 to-slate-700/10";

  // Honest CEFR coverage text — shown under the hero block.
  const cefrCoverageText = (() => {
    if (!player) return null;
    const { lastAchievedCefr, nextAnchor, percentToNextAnchor, nextAnchorWidth } =
      player.cefrCoverage;
    if (player.collectionLevelCefrCertified && player.collectionLevelRealCefr) {
      return `${player.collectionLevelRealCefr} достигнут ✓ — ваша коллекция соответствует реальному CEFR ${player.collectionLevelRealCefr}`;
    }
    if (nextAnchor) {
      const achievedTxt = lastAchievedCefr ? ` (последний ${lastAchievedCefr} ✓)` : "";
      return `${percentToNextAnchor}% от реального ${nextAnchor} (${player.wordsWidth}/${nextAnchorWidth} слов)${achievedTxt}`;
    }
    return lastAchievedCefr ? `Все академические уровни достигнуты` : null;
  })();

  // Epoch CEFR label (A1/A2/B1/B2/C1/C2) for grouping theme progress tiles.
  const themesByEpoch = useMemo(() => {
    const map = new Map<string, ThemeProgressDto[]>();
    if (!player) return map;
    for (const t of player.themeProgress) {
      const key = t.cefrTier;
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    }
    return map;
  }, [player]);

  return (
    <>
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-slate-200/70">
              Всего карт: <span className="font-mono">{cards.length}</span> · Уникальных слов:{" "}
              <span className="font-mono">{uniqueWords}</span>
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
        </div>

        {toast ? (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
            {toast}
          </div>
        ) : null}

        {player ? (
          <div
            className={`relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br ${heroGradient} p-5`}
          >
            {/* Phase 2.18 TASK-052: 100-level hero with epoch, CEFR cert, honest coverage */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs uppercase tracking-widest text-slate-200/50">
                    {player.collectionLevelEpoch} · Lv {player.collectionLevel}/100
                  </span>
                  {player.collectionLevelCefrCertified && player.collectionLevelRealCefr ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-100">
                      👑 Real {player.collectionLevelRealCefr}
                    </span>
                  ) : null}
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-slate-50">
                  {player.collectionLevelName}
                </div>
                <div className="text-xs text-slate-200/60">
                  Total XP: <span className="font-mono">{player.totalCollectionXp}</span> · Rarities:{" "}
                  <span className="font-mono">{player.unlockedRarities.join(", ")}</span>
                </div>
              </div>
              {player.nextLevelName ? (
                <div className="text-right text-xs text-slate-200/70">
                  <div className="opacity-60">Следующий ранг</div>
                  <div className="mt-1 font-semibold text-slate-50">{player.nextLevelName}</div>
                </div>
              ) : null}
            </div>

            {cefrCoverageText ? (
              <div className="mt-3 rounded-xl border border-slate-800/40 bg-slate-950/40 px-3 py-2 text-xs text-slate-200/80">
                {cefrCoverageText}
              </div>
            ) : null}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Tooltip text={TOOLTIPS.levelProgress}>
                <div className="rounded-2xl border border-slate-800/60 bg-slate-950/35 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-200/80">
                    <span>Ширина (слова)</span>
                    <span className="font-mono">
                      {player.wordsWidth}/{player.nextLevelWidth}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-950/50">
                    <div className="h-full bg-sky-400" style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              </Tooltip>
              <Tooltip text={TOOLTIPS.levelProgress}>
                <div className="rounded-2xl border border-slate-800/60 bg-slate-950/35 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-200/80">
                    <span>Глубина (avg)</span>
                    <span className="font-mono">
                      {player.avgWordLevel.toFixed(1)}/{player.nextLevelMinAvg.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-950/50">
                    <div
                      className="h-full bg-violet-400"
                      style={{ width: `${avgLevelPct}%` }}
                    />
                  </div>
                </div>
              </Tooltip>
            </div>
          </div>
        ) : null}

        {/* Phase 2.18 TASK-052: Theme progress grid — per-theme learning layer */}
        {player && player.themeProgress.length > 0 ? (
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-bold uppercase tracking-widest text-slate-200/70">
                Прогресс по темам
              </div>
              <div className="text-xs text-slate-200/50">
                Освоено тем:{" "}
                <span className="font-mono">
                  {player.themeProgress.filter((t) => t.status === "Learned" || t.status === "Mastered").length}
                  /{player.themeProgress.length}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from(themesByEpoch.entries()).flatMap(([cefr, themes]) =>
                themes.map((theme) => {
                  const statusColor =
                    theme.status === "Mastered"
                      ? "border-amber-400/60 bg-amber-400/10"
                      : theme.status === "Learned"
                        ? "border-emerald-400/60 bg-emerald-400/10"
                        : theme.status === "InProgress"
                          ? "border-sky-400/40 bg-sky-400/5"
                          : "border-slate-700/50 bg-slate-950/40 opacity-50";
                  const barColor =
                    theme.status === "Mastered"
                      ? "bg-amber-400"
                      : theme.status === "Learned"
                        ? "bg-emerald-400"
                        : "bg-sky-400";
                  return (
                    <div
                      key={theme.themeKey}
                      className={`rounded-xl border ${statusColor} p-3`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{theme.emoji ?? "•"}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-slate-50">
                            {theme.themeName}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-200/50">
                            <span>{cefr}</span>
                            <span>·</span>
                            <span>{theme.wordsLearned}/{theme.wordsTotal}</span>
                          </div>
                        </div>
                        {theme.status === "Mastered" ? (
                          <span className="text-xs">👑</span>
                        ) : theme.status === "Learned" ? (
                          <span className="text-xs">✓</span>
                        ) : null}
                      </div>
                      {theme.status !== "Locked" ? (
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-950/60">
                          <div
                            className={`h-full ${barColor}`}
                            style={{ width: `${theme.percentLearned}%` }}
                          />
                        </div>
                      ) : (
                        <div className="mt-2 text-[10px] text-slate-500">🔒 Заблокировано</div>
                      )}
                    </div>
                  );
                }),
              )}
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
            {viewMode === "full" ? (
              <CollectionGrid
                groups={groups}
                onOpenCard={(card) => setModalCard(card)}
                onOpenGroup={(group) => setModalGroup(group)}
              />
            ) : null}
            {viewMode === "mini" ? (
              <CollectionMiniGrid
                groups={groups}
                onOpenCard={(card) => setModalCard(card)}
                onOpenGroup={(group) => setModalGroup(group)}
              />
            ) : null}
            {viewMode === "table" ? (
              <CollectionTable
                groups={groups}
                onOpenCard={(card) => setModalCard(card)}
                onOpenGroup={(group) => setModalGroup(group)}
              />
            ) : null}
          </>
        )}
      </section>

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

export function CollectionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.endsWith("/craft") ? "craft" : "cards";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-6 px-6 py-6 sm:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-50">Коллекция</h1>
          <p className="text-sm text-slate-200/70">
            {activeTab === "cards"
              ? "Карты, фильтры и прогресс игрока в одном месте."
              : "Создавай карту нужной рарности, не выходя из коллекции."}
          </p>
        </div>

        <SegmentedTabs
          activeKey={activeTab}
          tabs={[
            { key: "cards", label: "Карты", onSelect: () => navigate("/collection") },
            { key: "craft", label: "Крафт", onSelect: () => navigate("/collection/craft") },
          ]}
        />
      </header>

      {activeTab === "cards" ? <CollectionCardsTab /> : <CraftPage embedded />}
    </main>
  );
}
