export function CardBackCover() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(56,189,248,0.12),transparent_55%)]" />
      <div className="relative flex h-full w-full items-center justify-center p-6 text-center">
        <div>
          <div className="text-5xl font-extrabold tracking-tight text-slate-100">LG</div>
          <div className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200/70">
            LangGacha
          </div>
        </div>
      </div>
    </div>
  );
}

