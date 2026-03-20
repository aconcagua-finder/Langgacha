import { useState } from "react";

import { generateCard } from "../api/cards";
import type { GeneratedCard } from "../types/card";
import { CardBack } from "../components/card/CardBack";
import { CardFace } from "../components/card/CardFace";
import { CardFlip } from "../components/card/CardFlip";

export function HomePage() {
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  const [card, setCard] = useState<GeneratedCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await generateCard();
      setCard(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-extrabold tracking-tight">LangGacha</h1>
        <p className="text-slate-200/80">
          Прототип: генерация карточки из seed-пула + переворот.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className={[
              "rounded-xl px-4 py-3 font-semibold",
              "bg-sky-500 text-slate-950 hover:bg-sky-400",
              "disabled:opacity-60 disabled:hover:bg-sky-500",
            ].join(" ")}
          >
            {loading ? "Генерирую…" : "Сгенерировать карточку"}
          </button>
          <div className="text-sm text-slate-200/70">
            API: <span className="font-mono">{apiUrl}</span>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}
      </section>

      <section className="flex flex-col items-center gap-4">
        {card ? (
          <>
            <CardFlip front={<CardFace card={card} />} back={<CardBack card={card} />} />
            <div className="w-[340px] rounded-xl bg-slate-900/40 p-4 text-xs text-slate-200/80">
              <div>
                <span className="text-slate-200/60">id:</span>{" "}
                <span className="font-mono">{card.id}</span>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-200/60">FUE:</span>{" "}
                  <span className="font-mono">{card.fue}</span>
                </div>
                <div>
                  <span className="text-slate-200/60">DEF:</span>{" "}
                  <span className="font-mono">{card.def}</span>
                </div>
              </div>
              <div className="mt-1">
                <span className="text-slate-200/60">canEvolve:</span>{" "}
                <span className="font-mono">{String(card.canEvolve)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/20 p-10 text-sm text-slate-200/70">
            Нажми кнопку, чтобы сгенерировать первую карточку.
          </div>
        )}
      </section>
    </main>
  );
}
