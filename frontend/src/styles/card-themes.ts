export const TYPE_THEMES: Record<
  string,
  { color: string; emoji: string; gradient: string }
> = {
  Person: {
    color: "#E57373",
    emoji: "👤",
    gradient: "from-rose-500/30 via-rose-400/10 to-slate-950",
  },
  Place: {
    color: "#4DB6AC",
    emoji: "📍",
    gradient: "from-teal-500/30 via-teal-400/10 to-slate-950",
  },
  Action: {
    color: "#FFB74D",
    emoji: "⚡",
    gradient: "from-amber-500/30 via-amber-400/10 to-slate-950",
  },
  Object: {
    color: "#90A4AE",
    emoji: "🔧",
    gradient: "from-slate-400/30 via-slate-300/10 to-slate-950",
  },
  Emotion: {
    color: "#BA68C8",
    emoji: "💫",
    gradient: "from-fuchsia-500/30 via-fuchsia-400/10 to-slate-950",
  },
  Expression: {
    color: "#4FC3F7",
    emoji: "🗣️",
    gradient: "from-sky-500/30 via-sky-400/10 to-slate-950",
  },
};

export const RARITY_THEMES: Record<
  string,
  { badge: string; border: string; gradient: string; glow: string; frameFx: string }
> = {
  C: {
    badge: "#9E9E9E",
    border: "rgba(148,163,184,0.35)",
    gradient: "from-slate-500/25 via-slate-400/10 to-slate-950",
    glow: "shadow-black/40",
    frameFx: "",
  },
  UC: {
    badge: "#66BB6A",
    border: "rgba(52,211,153,0.45)",
    gradient: "from-emerald-500/30 via-emerald-400/10 to-slate-950",
    glow: "shadow-emerald-500/20",
    frameFx: "shadow-lg",
  },
  R: {
    badge: "#42A5F5",
    border: "rgba(56,189,248,0.5)",
    gradient: "from-sky-500/30 via-sky-400/10 to-slate-950",
    glow: "shadow-sky-500/25",
    frameFx: "shadow-xl",
  },
  SR: {
    badge: "#FFC107",
    border: "rgba(250,204,21,0.55)",
    gradient: "from-amber-400/35 via-yellow-300/10 to-slate-950",
    glow: "shadow-amber-400/30",
    frameFx: "shadow-2xl",
  },
  SSR: {
    badge: "#AB47BC",
    border: "rgba(217,70,239,0.5)",
    gradient: "from-fuchsia-500/35 via-purple-400/10 to-slate-950",
    glow: "shadow-fuchsia-500/35",
    frameFx: "shadow-2xl card-holo",
  },
};

export const getTypeTheme = (type: string) =>
  TYPE_THEMES[type] ?? {
    color: "#CBD5E1",
    emoji: "🃏",
    gradient: "from-slate-500/20 via-slate-400/10 to-slate-950",
  };

export const getRarityTheme = (rarity: string) =>
  RARITY_THEMES[rarity] ?? RARITY_THEMES.C;
