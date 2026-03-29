import { useState } from "react";

import { BattlePage } from "./BattlePage";
import { RaidPage } from "./RaidPage";

export function BattlesPage() {
  const [battleInOverview, setBattleInOverview] = useState(true);
  const [raidInOverview, setRaidInOverview] = useState(true);

  const activeMode = battleInOverview ? (raidInOverview ? null : "raid") : "battle";
  const showOverview = activeMode === null;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col gap-4 px-6 py-4 sm:py-6">
      <div
        className={
          showOverview
            ? "grid items-stretch gap-5 lg:grid-cols-2"
            : "flex flex-col gap-4"
        }
      >
        <section className={showOverview || activeMode === "battle" ? "h-full" : "hidden"}>
          <BattlePage embedded onOverviewChange={setBattleInOverview} />
        </section>
        <section className={showOverview || activeMode === "raid" ? "h-full" : "hidden"}>
          <RaidPage embedded onOverviewChange={setRaidInOverview} />
        </section>
      </div>
    </main>
  );
}
