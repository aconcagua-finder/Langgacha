import type { BattleCardPublic } from "../../api/battle";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";

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
  inspiracion,
}: {
  side: "player" | "bot";
  card: BattleCardPublic;
  hp: number;
  maxHp: number;
  inspiracion?: boolean;
}) {
  const typeTheme = getTypeTheme(card.type);
  const rarityTheme = getRarityTheme(card.rarity);

  return (
    <div
      className={[
        "w-full max-w-sm rounded-2xl border bg-slate-900/50 p-4 backdrop-blur",
        rarityTheme.glow,
      ].join(" ")}
      style={{ borderColor: typeTheme.color }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-slate-200/60">{side === "player" ? "Игрок" : "Бот"}</div>
          <div className="mt-1 text-2xl font-extrabold tracking-tight">{card.word}</div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-200/70">
            <span>{typeTheme.emoji}</span>
            <span>{card.type}</span>
            <span className="opacity-60">·</span>
            <span
              className="rounded-full px-2 py-1 font-semibold text-slate-950"
              style={{ backgroundColor: rarityTheme.badge }}
            >
              {card.rarity}
            </span>
          </div>
        </div>
        {inspiracion ? (
          <div className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950">
            Inspiration +15%
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-950/40 p-3">
          <div className="text-xs text-slate-200/70">FUE</div>
          <div className="text-lg font-bold">{card.fue}</div>
        </div>
        <div className="rounded-xl bg-slate-950/40 p-3">
          <div className="text-xs text-slate-200/70">DEF</div>
          <div className="text-lg font-bold">{card.def}</div>
        </div>
      </div>

      <div className="mt-4">
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

      <div className="mt-4 text-xs text-slate-200/70">
        Состояние: <span className="font-mono">{card.condition}</span>
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
    <div className="flex w-full flex-col items-center justify-center gap-6 lg:flex-row">
      <CardPanel
        side="player"
        card={playerCard}
        hp={playerHp}
        maxHp={playerCard.hp}
        inspiracion={playerInspired}
      />
      <div className="text-2xl font-extrabold tracking-tight text-slate-200/70">
        {vsLabel ?? "VS"}
      </div>
      <CardPanel side="bot" card={botCard} hp={botHp} maxHp={botCard.hp} />
    </div>
  );
}
