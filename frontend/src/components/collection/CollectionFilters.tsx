import { getRarityTheme, getTypeTheme } from "../../styles/card-themes";
import type { ListCardsSort } from "../../api/cards";

const TYPES = ["Person", "Place", "Action", "Object", "Emotion", "Expression"] as const;
const RARITIES = ["C", "UC", "R", "SR", "SSR"] as const;

type Props = {
  selectedTypes: string[];
  selectedRarities: string[];
  sort: ListCardsSort;
  onChange: (next: {
    selectedTypes: string[];
    selectedRarities: string[];
    sort: ListCardsSort;
  }) => void;
};

const toggleInList = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export function CollectionFilters({
  selectedTypes,
  selectedRarities,
  sort,
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/20 p-4">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-200/60">
          Типы
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const theme = getTypeTheme(t);
            const active = selectedTypes.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() =>
                  onChange({
                    selectedTypes: toggleInList(selectedTypes, t),
                    selectedRarities,
                    sort,
                  })
                }
                className={[
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                  active
                    ? "border-slate-200/30 bg-slate-950/40 text-slate-50"
                    : "border-slate-800/60 bg-slate-950/20 text-slate-200/80 hover:bg-slate-950/30",
                ].join(" ")}
                style={active ? { borderColor: theme.color } : undefined}
              >
                <span>{theme.emoji}</span>
                <span>{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-200/60">
          Рарность
        </div>
        <div className="flex flex-wrap gap-2">
          {RARITIES.map((r) => {
            const theme = getRarityTheme(r);
            const active = selectedRarities.includes(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() =>
                  onChange({
                    selectedTypes,
                    selectedRarities: toggleInList(selectedRarities, r),
                    sort,
                  })
                }
                className={[
                  "rounded-xl border px-3 py-2 text-sm font-semibold",
                  active
                    ? "bg-slate-950/40 text-slate-50"
                    : "border-slate-800/60 bg-slate-950/20 text-slate-200/80 hover:bg-slate-950/30",
                ].join(" ")}
                style={{
                  borderColor: active ? theme.badge : "rgba(148,163,184,0.25)",
                }}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-200/60">
          Сортировка
        </div>
        <select
          value={sort}
          onChange={(e) =>
            onChange({
              selectedTypes,
              selectedRarities,
              sort: e.target.value as ListCardsSort,
            })
          }
          className="rounded-xl border border-slate-800/60 bg-slate-950/30 px-3 py-2 text-sm text-slate-100"
        >
          <option value="newest">Новые</option>
          <option value="fue_desc">По силе (FUE)</option>
          <option value="def_desc">По защите (DEF)</option>
          <option value="rarity_desc">По рарности</option>
        </select>
      </div>
    </div>
  );
}
