import type { BattleCardPublic } from "../../api/battle";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";
import { BATTLE_LABELS, CONDITION_LABELS, TYPE_LABELS, label } from "../../shared/labels";

const hpColor = (hp: number, maxHp: number) => {
  const pct = maxHp > 0 ? hp / maxHp : 0;
  if (pct > 0.5) return "bg-emerald-400";
  if (pct > 0.2) return "bg-amber-400";
  return "bg-rose-400";
};

function CardPanel({
  side,
  card,
  hp,
  maxHp,
  inspiration,
}: {
  side: "player" | "bot";
  card: BattleCardPublic;
  hp: number;
  maxHp: number;
  inspiration?: boolean;
}) {
  const typeTheme = getTypeTheme(card.type);
  const rarityTheme = getRarityTheme(card.rarity);

  return (
    <div
      className={[
        "w-full max-w-sm rounded-2xl border bg-slate-900/50 p-3 backdrop-blur sm:p-4",
        rarityTheme.glow,
      ].join(" ")}
      style={{ borderColor: rarityTheme.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-slate-200/60">{side === "player" ? "Игрок" : "Бот"}</div>
          <div className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">{card.word}</div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-200/70">
            <span>{typeTheme.emoji}</span>
            <span>{label(TYPE_LABELS, card.type)}</span>
            <span className="opacity-60">·</span>
            <span
              className="rounded-full px-2 py-1 font-semibold text-slate-950"
              style={{ backgroundColor: rarityTheme.badge }}
            >
              {card.rarity}
            </span>
          </div>
        </div>
        {inspiration ? (
          <div className="rounded-full bg-emerald-400 px-3 py-1 text-[11px] font-bold text-slate-950">
            {BATTLE_LABELS.inspiration} +15%
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
        <div className="rounded-xl bg-slate-950/40 p-2.5 sm:p-3">
          <div className="text-[11px] text-slate-200/70 sm:text-xs">ATK</div>
          <div className="text-base font-bold sm:text-lg">{card.atk}</div>
        </div>
        <div className="rounded-xl bg-slate-950/40 p-2.5 sm:p-3">
          <div className="text-[11px] text-slate-200/70 sm:text-xs">DEF</div>
          <div className="text-base font-bold sm:text-lg">{card.def}</div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4">
        <div className="flex items-center justify-between text-xs text-slate-200/70">
          <div>HP</div>
          <div className="font-mono">
            {Math.max(0, hp)} / {maxHp}
          </div>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-950/40">
          <div
            className={["h-full", hpColor(hp, maxHp)].join(" ")}
            style={{ width: `${Math.max(0, Math.min(1, hp / maxHp)) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-200/70 sm:mt-4">
        Состояние:{" "}
        <span className="font-mono">{label(CONDITION_LABELS, card.condition)}</span>
      </div>
    </div>
  );
}

export function BattleArena({
  playerCard,
  botCard,
  playerHp,
  botHp,
  playerInspired,
  vsLabel,
}: {
  playerCard: BattleCardPublic;
  botCard: BattleCardPublic;
  playerHp: number;
  botHp: number;
  playerInspired?: boolean;
  vsLabel?: string;
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 sm:gap-6 lg:flex-row">
      <CardPanel
        side="player"
        card={playerCard}
        hp={playerHp}
        maxHp={playerCard.hp}
        inspiration={playerInspired}
      />
      <div className="text-xl font-extrabold tracking-tight text-slate-200/70 sm:text-2xl">
        {vsLabel ?? "VS"}
      </div>
      <CardPanel side="bot" card={botCard} hp={botHp} maxHp={botCard.hp} />
    </div>
  );
}
