import { useSearchParams } from "react-router-dom";

import { BattlePage } from "./BattlePage";
import { RaidPage } from "./RaidPage";
import { SegmentedTabs } from "../components/ui/SegmentedTabs";

type BattleTab = "battle" | "raid";

export function BattlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: BattleTab = searchParams.get("tab") === "raid" ? "raid" : "battle";

  const setTab = (tab: BattleTab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === "battle") {
      next.delete("tab");
    } else {
      next.set("tab", tab);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-6 px-6 py-4 sm:py-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-50">Бои</h1>
          <p className="text-sm text-slate-200/70">
            Обычный бой и рейд теперь собраны в одном экране.
          </p>
        </div>

        <SegmentedTabs
          activeKey={activeTab}
          tabs={[
            { key: "battle", label: "Бой", onSelect: () => setTab("battle") },
            { key: "raid", label: "Рейд", onSelect: () => setTab("raid") },
          ]}
        />
      </header>

      {activeTab === "battle" ? <BattlePage embedded /> : <RaidPage embedded />}
    </main>
  );
}
