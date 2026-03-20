type Props = {
  question: string;
  options: string[];
  disabled?: boolean;
  onPick: (answer: string) => void;
};

export function QuizPhase({ question, options, disabled, onPick }: Props) {
  return (
    <div className="w-full rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5">
      <div className="text-sm text-slate-200/80">{question}</div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            disabled={disabled}
            onClick={() => onPick(o)}
            className="rounded-xl border border-slate-800/60 bg-slate-950/20 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-950/30 disabled:opacity-60"
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

