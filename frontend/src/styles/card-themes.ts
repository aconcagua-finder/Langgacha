export const TYPE_THEMES: Record<
  string,
  { color: string; emoji: string; gradient: string }
> = {
  Persona: {
    color: "#E57373",
    emoji: "👤",
    gradient: "from-rose-500/30 via-rose-400/10 to-slate-950",
  },
  Lugar: {
    color: "#4DB6AC",
    emoji: "📍",
    gradient: "from-teal-500/30 via-teal-400/10 to-slate-950",
  },
  "Acción": {
    color: "#FFB74D",
    emoji: "⚡",
    gradient: "from-amber-500/30 via-amber-400/10 to-slate-950",
  },
  Objeto: {
    color: "#90A4AE",
    emoji: "🔧",
    gradient: "from-slate-400/30 via-slate-300/10 to-slate-950",
  },
  "Emoción": {
    color: "#BA68C8",
    emoji: "💫",
    gradient: "from-fuchsia-500/30 via-fuchsia-400/10 to-slate-950",
  },
  "Expresión": {
    color: "#4FC3F7",
    emoji: "🗣️",
    gradient: "from-sky-500/30 via-sky-400/10 to-slate-950",
  },
};

export const RARITY_THEMES: Record<
  string,
  { badge: string; glow: string; frameFx: string }
> = {
  C: { badge: "#9E9E9E", glow: "shadow-black/40", frameFx: "" },
  UC: { badge: "#66BB6A", glow: "shadow-emerald-500/20", frameFx: "shadow-lg" },
  R: { badge: "#42A5F5", glow: "shadow-sky-500/25", frameFx: "shadow-xl" },
  SR: {
    badge: "#FFC107",
    glow: "shadow-amber-400/30",
    frameFx: "shadow-2xl",
  },
  SSR: {
    badge: "#AB47BC",
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

