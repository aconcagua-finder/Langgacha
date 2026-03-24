type SegmentedTab = {
  key: string;
  label: string;
  onSelect: () => void;
};

type Props = {
  tabs: SegmentedTab[];
  activeKey: string;
};

export function SegmentedTabs({ tabs, activeKey }: Props) {
  return (
    <div className="inline-flex w-full flex-wrap gap-2 rounded-xl border border-slate-800/60 bg-slate-900/60 p-1 sm:w-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={tab.onSelect}
          className={[
            "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            activeKey === tab.key
              ? "bg-slate-800 text-slate-50"
              : "text-slate-200/60 hover:text-slate-200/80",
          ].join(" ")}
          aria-pressed={activeKey === tab.key}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
