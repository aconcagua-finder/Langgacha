import { useEffect, useMemo, useState } from "react";

import type { CombatTick } from "../../api/battle";
import { BattleArena } from "./BattleArena";
import type { BattleCardPublic } from "../../api/battle";

type Props = {
  playerCard: BattleCardPublic;
  botCard: BattleCardPublic;
  initialPlayerHp: number;
  initialBotHp: number;
  inspirationApplied: boolean;
  combatLog: CombatTick[];
  onDone: (final: { playerHp: number; botHp: number }) => void;
};

export function CombatPhase({
  playerCard,
  botCard,
  initialPlayerHp,
  initialBotHp,
  inspirationApplied,
  combatLog,
  onDone,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [playerHp, setPlayerHp] = useState(initialPlayerHp);
  const [botHp, setBotHp] = useState(initialBotHp);
  const [floating, setFloating] = useState<{ side: "player" | "bot"; text: string } | null>(
    null,
  );

  const currentTick = useMemo(() => combatLog[idx], [combatLog, idx]);

  useEffect(() => {
    setIdx(0);
    setPlayerHp(initialPlayerHp);
    setBotHp(initialBotHp);
  }, [initialPlayerHp, initialBotHp, combatLog]);

  useEffect(() => {
    if (idx >= combatLog.length) {
      onDone({ playerHp, botHp });
      return;
    }

    const t = combatLog[idx];
    const target = t.attacker === "player" ? "bot" : "player";
    setFloating({ side: target, text: `-${t.damage}` });
    if (target === "bot") setBotHp(t.targetHpAfter);
    else setPlayerHp(t.targetHpAfter);

    const timer = window.setTimeout(() => {
      setFloating(null);
      setIdx((v) => v + 1);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [idx, combatLog, playerHp, botHp, onDone]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full">
        <BattleArena
          playerCard={playerCard}
          botCard={botCard}
          playerHp={playerHp}
          botHp={botHp}
          playerInspired={inspirationApplied}
          vsLabel="Бой"
        />
        {floating ? (
          <div
            className={[
              "pointer-events-none absolute top-8 text-3xl font-extrabold",
              "animate-[float_800ms_ease-out]",
              floating.side === "player" ? "left-1/4" : "right-1/4",
              "text-rose-300 drop-shadow",
            ].join(" ")}
          >
            {floating.text}
          </div>
        ) : null}
      </div>
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(-18px); opacity: 0; }
          }
        `}
      </style>
      <div className="text-xs text-slate-200/60">Ход {Math.min(idx + 1, combatLog.length)} / {combatLog.length}</div>
    </div>
  );
}
