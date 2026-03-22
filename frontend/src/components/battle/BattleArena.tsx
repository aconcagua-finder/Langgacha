import type { BattleCardPublic } from "../../api/battle";
import { getCardImageUrl } from "../../utils/cardImage";
import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";
import { BATTLE_LABELS, CONDITION_LABELS, TYPE_LABELS, label } from "../../shared/labels";
import { useTiltEffect } from "../../hooks/useTiltEffect";

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
  hideWord = false,
}: {
  side: "player" | "bot";
  card: BattleCardPublic;
  hp: number;
  maxHp: number;
  inspiration?: boolean;
  hideWord?: boolean;
}) {
  const typeTheme = getTypeTheme(card.type);
  const rarityTheme = getRarityTheme(card.rarity);
  const tiltFx = useTiltEffect({ maxTiltDeg: 8, scale: 1.01 });
  const imgUrl = getCardImageUrl(card.conceptKey);
  const conditionClass =
    card.condition === "Deteriorated"
      ? "condition-deteriorated"
      : card.condition === "Worn"
        ? "condition-worn"
        : card.condition === "Brilliant"
          ? "condition-brilliant"
          : "condition-normal";
  const displayWord = hideWord ? "???" : card.word;

  return (
    <div
      className={[
        "relative w-full max-w-[260px] overflow-hidden rounded-2xl border bg-slate-900/60 p-3 backdrop-blur sm:max-w-[280px] lg:max-w-[300px]",
        rarityTheme.glow,
        rarityTheme.frameFx,
        conditionClass,
        tiltFx.isEnabled ? "group" : "",
      ].join(" ")}
      style={{ ...tiltFx.style, borderColor: rarityTheme.border }}
      onMouseEnter={tiltFx.onMouseEnter}
      onMouseLeave={tiltFx.onMouseLeave}
      onMouseMove={tiltFx.onMouseMove}
      ref={tiltFx.ref}
    >
      {tiltFx.isEnabled ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-[var(--tilt-glare)] transition-opacity duration-150"
          style={{
            background:
              "radial-gradient(circle at var(--tilt-x) var(--tilt-y), rgba(255,255,255,0.20), transparent 60%)",
            mixBlendMode: "screen",
          }}
        />
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-2.5 backdrop-blur">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300/65">
            {side === "player" ? "Игрок" : "Бот"}
          </div>
          <span
            className="rounded-full px-2 py-1 text-[10px] font-extrabold text-slate-950"
            style={{ backgroundColor: rarityTheme.badge }}
          >
            {card.rarity}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/70 px-2 py-1 text-[10px] text-slate-100/90">
            <span>{typeTheme.emoji}</span>
            <span>{label(TYPE_LABELS, card.type)}</span>
          </div>
          <span className="rounded-full border border-white/10 bg-slate-900/70 px-2 py-1 text-[10px] font-semibold text-slate-100/80">
            {label(CONDITION_LABELS, card.condition)}
          </span>
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] text-slate-200/75">
            <span>HP</span>
            <span className="font-mono">
              {Math.max(0, hp)} / {maxHp}
            </span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-900/70">
            <div
              className={["h-full transition-[width] duration-500", hpColor(hp, maxHp)].join(" ")}
              style={{ width: `${Math.max(0, Math.min(1, hp / maxHp)) * 100}%` }}
            />
          </div>
        </div>

        {inspiration ? (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-2 py-1 text-[10px] font-bold text-slate-950">
            <span>⚔</span>
            <span>{BATTLE_LABELS.inspiration} +15%</span>
          </div>
        ) : null}
      </div>

      <div className="mt-2.5 flex flex-col gap-2.5">
        <div
          className={[
            "relative flex h-24 items-center justify-center overflow-hidden rounded-2xl border",
            "bg-gradient-to-br",
            rarityTheme.gradient,
            "sm:h-28",
          ].join(" ")}
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={card.word}
              className="h-20 w-20 object-contain drop-shadow-lg sm:h-24 sm:w-24"
            />
          ) : (
            <div className="text-5xl drop-shadow sm:text-6xl">{typeTheme.emoji}</div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-3 text-center backdrop-blur">
          <div
            className={[
              "text-xl font-extrabold leading-tight tracking-tight sm:text-2xl",
              hideWord ? "tracking-[0.2em] text-slate-100/92" : "",
            ].join(" ")}
          >
            {displayWord}
          </div>
          <div className="mt-1 text-[11px] text-slate-200/65">
            {hideWord ? "Слово скрыто до ответа" : label(TYPE_LABELS, card.type)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-950/60 px-3 py-2 backdrop-blur">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">ATK</div>
            <div className="text-base font-extrabold text-slate-50">{card.atk}</div>
          </div>
          <div className="rounded-xl bg-slate-950/60 px-3 py-2 backdrop-blur">
            <div className="text-right text-[10px] uppercase tracking-wider text-slate-400">
              DEF
            </div>
            <div className="text-right text-base font-extrabold text-slate-50">{card.def}</div>
          </div>
        </div>
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
  hidePlayerWord,
}: {
  playerCard: BattleCardPublic;
  botCard: BattleCardPublic;
  playerHp: number;
  botHp: number;
  playerInspired?: boolean;
  vsLabel?: string;
  hidePlayerWord?: boolean;
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 sm:gap-6 lg:flex-row">
      <CardPanel
        side="player"
        card={playerCard}
        hp={playerHp}
        maxHp={playerCard.hp}
        inspiration={playerInspired}
        hideWord={hidePlayerWord}
      />
      <div className="text-xl font-extrabold tracking-tight text-slate-200/70 sm:text-2xl">
        {vsLabel ?? "VS"}
      </div>
      <CardPanel side="bot" card={botCard} hp={botHp} maxHp={botCard.hp} />
    </div>
  );
}
