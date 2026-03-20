type Props = {
  onOpen: () => void;
  disabled?: boolean;
};

export function BoosterPack({ onOpen, disabled }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
      <div className="w-full rounded-3xl border border-slate-800/60 bg-gradient-to-br from-sky-500/20 via-fuchsia-500/10 to-slate-950 p-10">
        <div className="text-center">
          <div className="text-2xl font-extrabold tracking-tight">LangGacha</div>
          <div className="mt-2 text-sm text-slate-200/70">Booster Pack</div>
          <div className="mt-6 text-5xl">🎴</div>
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
        {disabled ? "Открываю…" : "Открыть бустер"}
      </button>
    </div>
  );
}

