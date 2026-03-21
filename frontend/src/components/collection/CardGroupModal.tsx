import { useEffect, useMemo, useState } from "react";

import { getEvolutionStatus, type EvolveResult, type EvolutionStatus } from "../../api/evolution";
import type { CardGroup } from "../../utils/groupCards";
import type { GeneratedCard } from "../../types/card";
import { CardMini } from "../card/CardMini";
import { CardBack } from "../card/CardBack";
import { CardFace } from "../card/CardFace";
import { CardFlip } from "../card/CardFlip";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { DISINTEGRATE_COPY, EVOLVE_COPY } from "../../shared/labels";
import { useConfig } from "../../contexts/ConfigContext";

type Props = {
  group: CardGroup | null;
  onClose: () => void;
  onDisintegrate: (cardId: string) => Promise<void>;
  onEvolve: (cardId: string) => Promise<EvolveResult>;
};

export function CardGroupModal({ group, onClose, onDisintegrate, onEvolve }: Props) {
  const { config } = useConfig();
  const [selected, setSelected] = useState<GeneratedCard | null>(null);
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [confirmCard, setConfirmCard] = useState<GeneratedCard | null>(null);
  const [evolutionStatus, setEvolutionStatus] = useState<EvolutionStatus | null>(null);
  const [evolveConfirmOpen, setEvolveConfirmOpen] = useState(false);
  const [disintegratingId, setDisintegratingId] = useState<string | null>(null);
  const [evolvingId, setEvolvingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!group) return;
    setSelected(group.bestCard);
    setCards(group.cards);
    setConfirmCard(null);
    setEvolutionStatus(null);
    setEvolveConfirmOpen(false);
    setDisintegratingId(null);
    setEvolvingId(null);
    setActionError(null);
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

  const masteryMax = config?.masteryMax ?? 5;
  const dust = confirmCard ? (config?.dustPerDisintegrate?.[confirmCard.rarity] ?? 0) : 0;
  const danger = confirmCard ? ["R", "SR", "SSR"].includes(confirmCard.rarity) : false;
  const description = danger ? DISINTEGRATE_COPY.rare(dust) : DISINTEGRATE_COPY.common(dust);
  const selectedCanEvolve =
    !!selected &&
    selected.canEvolve &&
    !selected.isEvolved &&
    selected.masteryProgress >= masteryMax;

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
                <>
                  <div
                    className={[
                      "rounded-2xl bg-slate-950 p-1",
                      disintegratingId === selected.id || evolvingId === selected.id
                        ? "disintegrating"
                        : "",
                    ].join(" ")}
                  >
                    <CardFlip
                      front={<CardFace card={selected} tilt={false} />}
                      back={<CardBack card={selected} />}
                    />
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {selectedCanEvolve ? (
                      <button
                        type="button"
                        disabled={!!disintegratingId || !!evolvingId}
                        onClick={async () => {
                          setActionError(null);
                          try {
                            const status = await getEvolutionStatus(selected.id);
                            setEvolutionStatus(status);
                            if (!status.canEvolve) {
                              throw new Error(status.reason ?? "Эволюция сейчас недоступна");
                            }
                            setEvolveConfirmOpen(true);
                          } catch (e) {
                            setActionError(
                              e instanceof Error
                                ? e.message
                                : "Не удалось проверить эволюцию",
                            );
                          }
                        }}
                        className="rounded-xl border border-sky-300/30 bg-sky-300/10 px-4 py-3 text-sm font-semibold text-sky-100 hover:bg-sky-300/15"
                      >
                        Эволюция
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={!!disintegratingId || !!evolvingId}
                      onClick={() => setConfirmCard(selected)}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 hover:bg-rose-500/15"
                    >
                      Распылить
                    </button>
                  </div>
                  {actionError ? (
                    <div className="max-w-sm rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-100">
                      {actionError}
                    </div>
                  ) : null}
                </>
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
      <ConfirmDialog
        open={evolveConfirmOpen}
        title={EVOLVE_COPY.title}
        description={EVOLVE_COPY.description(evolutionStatus?.dustCost ?? 0)}
        confirmLabel={EVOLVE_COPY.confirm}
        cancelLabel={EVOLVE_COPY.cancel}
        onCancel={() => setEvolveConfirmOpen(false)}
        onConfirm={async () => {
          const cardToEvolve = selected;
          if (!cardToEvolve) return;
          setEvolveConfirmOpen(false);
          setEvolvingId(cardToEvolve.id);
          setActionError(null);
          try {
            await onEvolve(cardToEvolve.id);
          } catch (e) {
            setActionError(
              e instanceof Error ? e.message : "Не удалось эволюционировать карту",
            );
          } finally {
            setEvolvingId(null);
          }
        }}
      />
    </div>
  );
}
