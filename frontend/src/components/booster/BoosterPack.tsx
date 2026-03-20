type Props = {
  onOpen: () => void;
  disabled?: boolean;
  disabledLabel?: string;
  packName: string;
  level: string;
};

const LEVEL_THEMES: Record<
  string,
  { gradient: string; accent: string; icon: string }
> = {
  Beginner: {
    gradient: "from-slate-500/20 via-slate-400/10 to-slate-950",
    accent: "bg-slate-300",
    icon: "🌱",
  },
  Elementary: {
    gradient: "from-emerald-500/20 via-emerald-400/10 to-slate-950",
    accent: "bg-emerald-300",
    icon: "🪴",
  },
  Intermediate: {
    gradient: "from-sky-500/20 via-sky-400/10 to-slate-950",
    accent: "bg-sky-300",
    icon: "🔥",
  },
  Advanced: {
    gradient: "from-amber-500/20 via-amber-400/10 to-slate-950",
    accent: "bg-amber-300",
    icon: "⚔️",
  },
  Master: {
    gradient: "from-fuchsia-500/20 via-fuchsia-400/10 to-slate-950",
    accent: "bg-fuchsia-300",
    icon: "👑",
  },
};

export function BoosterPack({ onOpen, disabled, disabledLabel, packName, level }: Props) {
  const theme = LEVEL_THEMES[level] ?? {
    gradient: "from-sky-500/20 via-fuchsia-500/10 to-slate-950",
    accent: "bg-sky-300",
    icon: "🎴",
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
      <div
        className={[
          "w-full rounded-3xl border border-slate-800/60 bg-gradient-to-br p-10",
          theme.gradient,
        ].join(" ")}
      >
        <div className="text-center">
          <div className="text-2xl font-extrabold tracking-tight">LangGacha</div>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-950/40 px-3 py-1 text-sm text-slate-200/80">
            <span className={["h-2 w-2 rounded-full", theme.accent].join(" ")} />
            <span>{packName}</span>
          </div>
          <div className="mt-6 text-5xl">{theme.icon}</div>
          <div className="mt-6 text-sm text-slate-200/70">×5 карт</div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        disabled={disabled}
        className={[
          "w-full rounded-xl px-4 py-3 font-semibold",
          "bg-sky-500 text-slate-950 hover:bg-sky-400",
          "disabled:opacity-60 disabled:hover:bg-sky-500",
        ].join(" ")}
      >
        {disabled ? disabledLabel ?? "Открываю…" : "Открыть бустер"}
      </button>
    </div>
  );
}
