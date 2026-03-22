type Props = {
  onOpen: () => void;
  disabled?: boolean;
  disabledLabel?: string;
  packName: string;
  level: string;
  cardCount?: number;
};

const LEVEL_THEMES: Record<
  string,
  { shell: string; halo: string; accent: string; icon: string; foil: string }
> = {
  Beginner: {
    shell: "from-slate-300 via-slate-500 to-slate-950",
    halo: "rgba(148,163,184,0.45)",
    accent: "rgba(226,232,240,0.9)",
    icon: "🌱",
    foil: "from-slate-100/55 via-white/10 to-transparent",
  },
  Elementary: {
    shell: "from-emerald-200 via-emerald-500 to-slate-950",
    halo: "rgba(16,185,129,0.45)",
    accent: "rgba(110,231,183,0.92)",
    icon: "🪴",
    foil: "from-emerald-100/55 via-white/10 to-transparent",
  },
  Intermediate: {
    shell: "from-sky-200 via-sky-500 to-slate-950",
    halo: "rgba(56,189,248,0.45)",
    accent: "rgba(125,211,252,0.92)",
    icon: "🔥",
    foil: "from-sky-100/55 via-white/10 to-transparent",
  },
  Advanced: {
    shell: "from-amber-200 via-amber-500 to-slate-950",
    halo: "rgba(245,158,11,0.45)",
    accent: "rgba(252,211,77,0.92)",
    icon: "⚔️",
    foil: "from-amber-100/55 via-white/10 to-transparent",
  },
  Master: {
    shell: "from-fuchsia-200 via-fuchsia-500 to-slate-950",
    halo: "rgba(217,70,239,0.48)",
    accent: "rgba(240,171,252,0.92)",
    icon: "👑",
    foil: "from-fuchsia-100/55 via-white/10 to-transparent",
  },
};

export function BoosterPack({
  onOpen,
  disabled,
  disabledLabel,
  packName,
  level,
  cardCount,
}: Props) {
  const theme = LEVEL_THEMES[level] ?? {
    shell: "from-sky-200 via-fuchsia-500 to-slate-950",
    halo: "rgba(56,189,248,0.4)",
    accent: "rgba(125,211,252,0.92)",
    icon: "🎴",
    foil: "from-sky-100/55 via-white/10 to-transparent",
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5">
      <div
        className={[
          "booster-pack-shell booster-pack-shimmer relative aspect-[2/3] w-[220px] overflow-hidden rounded-[2rem] border border-white/15 p-3 sm:w-[240px]",
          "bg-gradient-to-br",
          theme.shell,
        ].join(" ")}
        style={{ boxShadow: `0 24px 70px ${theme.halo}` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_38%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(15,23,42,0.35),transparent_40%)]" />
        <div
          className={[
            "absolute inset-y-0 left-[8%] w-[34%] -skew-x-12 bg-gradient-to-r opacity-60",
            theme.foil,
          ].join(" ")}
        />
        <div className="relative flex h-full flex-col rounded-[1.6rem] border border-white/12 bg-slate-950/45 p-5 backdrop-blur-sm">
          <div className="rounded-full border border-white/10 bg-slate-950/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-100/70">
            Sealed Pack
          </div>

          <div className="mt-5 flex flex-1 flex-col items-center justify-center text-center">
            <div className="text-6xl drop-shadow-[0_8px_24px_rgba(15,23,42,0.45)]">
              {theme.icon}
            </div>
            <div className="mt-7 text-[2rem] font-black tracking-[0.06em] text-white">
              LangGacha
            </div>
            <div
              className="mt-3 h-px w-16"
              style={{ backgroundColor: theme.accent }}
            />
            <div className="mt-4 text-lg font-semibold tracking-wide text-slate-100">
              {packName}
            </div>
            <div className="mt-5 rounded-full border border-white/10 bg-slate-950/35 px-4 py-1.5 text-sm font-semibold text-slate-100/80">
              ×{cardCount ?? 7} карт
            </div>
          </div>

          <div className="booster-pack-tear mt-4 pt-4 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-slate-200/45">
            Tear Here
          </div>
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
