import { useEffect, useState } from "react";

import { getEvolutionStatus, type EvolveResult, type EvolutionStatus } from "../../api/evolution";
import type { GeneratedCard } from "../../types/card";
import { CardBack } from "../card/CardBack";
import { CardFace } from "../card/CardFace";
import { CardFlip } from "../card/CardFlip";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { DISINTEGRATE_COPY, EVOLVE_COPY } from "../../shared/labels";
import { useConfig } from "../../contexts/ConfigContext";

type Props = {
  card: GeneratedCard | null;
  onClose: () => void;
  onDisintegrate: (cardId: string) => Promise<void>;
  onEvolve: (cardId: string) => Promise<EvolveResult>;
};

export function CardModal({ card, onClose, onDisintegrate, onEvolve }: Props) {
  const { config } = useConfig();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [evolveConfirmOpen, setEvolveConfirmOpen] = useState(false);
  const [disintegrating, setDisintegrating] = useState(false);
  const [evolving, setEvolving] = useState(false);
  const [evolutionStatus, setEvolutionStatus] = useState<EvolutionStatus | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!card) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [card, onClose]);

  useEffect(() => {
    setConfirmOpen(false);
    setEvolveConfirmOpen(false);
    setEvolutionStatus(null);
    setActionError(null);
    setDisintegrating(false);
    setEvolving(false);
  }, [card?.id]);

  if (!card) return null;

  const masteryMax = config?.masteryMax ?? 5;
  const dust = config?.dustPerDisintegrate?.[card.rarity] ?? 0;
  const danger = ["R", "SR", "SSR"].includes(card.rarity);
  const description = danger ? DISINTEGRATE_COPY.rare(dust) : DISINTEGRATE_COPY.common(dust);
  const canShowEvolveButton =
    card.canEvolve && !card.isEvolved && card.masteryProgress >= masteryMax;
  const busy = disintegrating || evolving;

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/90 p-3 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
        <div className="flex flex-col items-center gap-4">
          <div className={["rounded-2xl bg-slate-950 p-1", busy ? "disintegrating" : ""].join(" ")}>
          <CardFlip front={<CardFace card={card} tilt={false} />} back={<CardBack card={card} />} />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700"
          >
            Закрыть
          </button>
          {canShowEvolveButton ? (
            <button
              type="button"
              onClick={async () => {
                setActionError(null);
                try {
                  const status = await getEvolutionStatus(card.id);
                  setEvolutionStatus(status);
                  if (!status.canEvolve) {
                    throw new Error(status.reason ?? "Эволюция сейчас недоступна");
                  }
                  setEvolveConfirmOpen(true);
                } catch (e) {
                  setActionError(e instanceof Error ? e.message : "Не удалось проверить эволюцию");
                }
              }}
              disabled={busy}
              className="rounded-xl border border-sky-300/30 bg-sky-300/10 px-4 py-3 text-sm font-semibold text-sky-100 hover:bg-sky-300/15"
            >
              Эволюция
            </button>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              setConfirmOpen(true);
            }}
            disabled={busy}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 hover:bg-rose-500/15"
          >
            Распылить
          </button>
        </div>
        {actionError ? (
          <div className="max-w-md rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-100">
            {actionError}
          </div>
        ) : null}
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
      <ConfirmDialog
        open={evolveConfirmOpen}
        title={EVOLVE_COPY.title}
        description={EVOLVE_COPY.description(evolutionStatus?.dustCost ?? 0)}
        confirmLabel={EVOLVE_COPY.confirm}
        cancelLabel={EVOLVE_COPY.cancel}
        onCancel={() => setEvolveConfirmOpen(false)}
        onConfirm={async () => {
          setEvolveConfirmOpen(false);
          setEvolving(true);
          setActionError(null);
          try {
            await onEvolve(card.id);
          } catch (e) {
            setActionError(e instanceof Error ? e.message : "Не удалось эволюционировать карту");
          } finally {
            setEvolving(false);
          }
        }}
      />
    </div>
  );
}
