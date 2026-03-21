import type { ReactNode } from "react";
import { useId, useState } from "react";

import {
  BOOSTER_RECHARGE_MS,
  BOOSTER_SIZE,
  CONDITION_MODIFIERS,
  CRAFTS_PER_DAY,
  DUST_PER_CRAFT,
  DUST_PER_DISINTEGRATE,
  INSPIRATION_BONUS,
  MASTERY_MAX,
  MAX_BOOSTERS,
  PITY_THRESHOLD,
  PROGRESSION_LEVELS,
  RAID_MAX_CARDS,
  RAID_VICTORY_BOOSTERS,
  RAID_VICTORY_DUST,
  RARITY_CHANCES,
  RARITY_ORDER,
  STREAK_MULTIPLIER,
  STREAK_THRESHOLD,
} from "../shared/constants";
import { CONDITION_LABELS, LEVEL_LABELS, TYPE_LABELS, label } from "../shared/labels";

function percentDelta(multiplier: number): string {
  const delta = Math.round((multiplier - 1) * 100);
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta}%`;
}

function GuideSection({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-full items-center justify-between gap-4 px-4 text-left text-base font-semibold text-slate-50 hover:bg-slate-950/20"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span>{title}</span>
        <span className="font-mono text-xs text-slate-200/70">{open ? "▲" : "▼"}</span>
      </button>
      {open ? (
        <div id={panelId} className="border-t border-slate-800/60 px-4 py-4 text-sm text-slate-200/80">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function GuidePage() {
  const rechargeMinutes = Math.round(BOOSTER_RECHARGE_MS / 60000);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Гайд</h1>
        <p className="text-sm text-slate-200/70">
          Справочник по основным механикам. Открывай только то, что нужно.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <GuideSection title="Как играть">
          <ul className="list-disc space-y-1 pl-5">
            <li>LangGacha — карточная гача-игра для изучения испанского.</li>
            <li>Открывай бустеры → собирай карты → сражайся → учи слова.</li>
            <li>
              Цель: освоить слова (до <span className="font-mono">{MASTERY_MAX}</span> правильных ответов на карту) и побеждать рейд-босса
              каждый день.
            </li>
          </ul>
        </GuideSection>

        <GuideSection title="Карты">
          <ul className="list-disc space-y-1 pl-5">
            <li>Каждая карта — испанское слово с переводом.</li>
            <li>
              <span className="font-semibold">Рарность:</span>{" "}
              <span className="font-mono">
                {RARITY_ORDER.map((r) => `${r} ${RARITY_CHANCES[r]}%`).join(" · ")}
              </span>
              .
            </li>
            <li>
              <span className="font-semibold">Статы:</span> <span className="font-mono">ATK</span> (сила атаки) и{" "}
              <span className="font-mono">DEF</span> (защита) — случайные в диапазоне рарности.
            </li>
            <li>
              <span className="font-semibold">Типы:</span> {Object.keys(TYPE_LABELS).map((t) => label(TYPE_LABELS, t)).join(", ")}.
            </li>
          </ul>
        </GuideSection>

        <GuideSection title="Состояние карт">
          <ul className="list-disc space-y-1 pl-5">
            <li>Карты «стареют», если их не использовать в бою.</li>
            <li>
              <span className="font-semibold">Эффект на статы:</span>{" "}
              <span className="font-mono">
                {label(CONDITION_LABELS, "Brilliant")} ({percentDelta(CONDITION_MODIFIERS.Brilliant)}) →{" "}
                {label(CONDITION_LABELS, "Normal")} ({percentDelta(CONDITION_MODIFIERS.Normal)}) →{" "}
                {label(CONDITION_LABELS, "Worn")} ({percentDelta(CONDITION_MODIFIERS.Worn)}) →{" "}
                {label(CONDITION_LABELS, "Deteriorated")} ({percentDelta(CONDITION_MODIFIERS.Deteriorated)})
              </span>
              .
            </li>
            <li>Используй карту в бою, чтобы обновить её состояние.</li>
          </ul>
        </GuideSection>

        <GuideSection title="Освоение (Mastery)">
          <ul className="list-disc space-y-1 pl-5">
            <li>Ответь правильно на вопрос о слове в бою → +1 к прогрессу.</li>
            <li>
              <span className="font-mono">{MASTERY_MAX}</span> правильных ответов → карта «Освоена».
            </li>
            <li>Освоенные карты влияют на уровень и открытие новых рарностей.</li>
          </ul>
        </GuideSection>

        <GuideSection title="Бустеры">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Бустер = <span className="font-mono">{BOOSTER_SIZE}</span> случайных карт.
            </li>
            <li>
              Максимум <span className="font-mono">{MAX_BOOSTERS}</span> бустеров, +1 каждые{" "}
              <span className="font-mono">{rechargeMinutes}</span> минут.
            </li>
            <li>Гарантия: минимум 1 карта UC+ в каждом бустере.</li>
            <li>
              Pity-система: каждые <span className="font-mono">{PITY_THRESHOLD}</span> бустеров без SR+ → гарантированная SR+ карта.
            </li>
          </ul>
        </GuideSection>

        <GuideSection title="Бой (PvE)">
          <ul className="list-disc space-y-1 pl-5">
            <li>Выбери 5 карт из коллекции (или нажми «Авто»).</li>
            <li>Перед каждым раундом — вопрос: переведи слово на карте.</li>
            <li>
              Правильный ответ → «Воодушевление»: <span className="font-mono">+{Math.round(INSPIRATION_BONUS * 100)}%</span> к{" "}
              <span className="font-mono">ATK</span>.
            </li>
            <li>Карты сражаются по очереди: проигравший выбывает, победитель несёт оставшееся HP в следующий раунд.</li>
            <li>
              Стрик: <span className="font-mono">{STREAK_THRESHOLD}+</span> правильных ответов подряд →{" "}
              <span className="font-mono">×{STREAK_MULTIPLIER}</span> к Dust-награде.
            </li>
          </ul>
        </GuideSection>

        <GuideSection title="Рейд дня">
          <ul className="list-disc space-y-1 pl-5">
            <li>Ежедневный мощный босс.</li>
            <li>
              Используешь до <span className="font-mono">{RAID_MAX_CARDS}</span> карт: карта бьёт босса, босс бьёт карту — обмен ударами до смерти одного.
            </li>
            <li>Карты могут погибнуть — это нормально, отправляй следующую.</li>
            <li>
              Победа → <span className="font-mono">{RAID_VICTORY_DUST}</span> Dust + <span className="font-mono">{RAID_VICTORY_BOOSTERS}</span> бустер.
            </li>
            <li>Приоритет: забытые и слабые карты идут первыми — тренируешь то, что знаешь хуже.</li>
          </ul>
        </GuideSection>

        <GuideSection title="Dust и крафт">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Dust — валюта. Получаешь из боёв, рейда и распыления карт.
            </li>
            <li>
              <span className="font-semibold">Распыление:</span> уничтожь карту → получи Dust{" "}
              <span className="font-mono">
                ({RARITY_ORDER.map((r) => `${r}: ${DUST_PER_DISINTEGRATE[r]}`).join(", ")})
              </span>
              .
            </li>
            <li>
              <span className="font-semibold">Крафт:</span> создай карту нужной рарности за Dust{" "}
              <span className="font-mono">({RARITY_ORDER.map((r) => `${r}: ${DUST_PER_CRAFT[r]}`).join(", ")})</span>. Лимит:{" "}
              <span className="font-mono">{CRAFTS_PER_DAY}</span> крафт в день.
            </li>
          </ul>
        </GuideSection>

        <GuideSection title="Прогрессия">
          <div className="space-y-2">
            <div>
              Уровни открываются по количеству освоенных карт (Dominada):
            </div>
            <ul className="list-disc space-y-1 pl-5">
              {PROGRESSION_LEVELS.map((lvl) => (
                <li key={lvl.name}>
                  {label(LEVEL_LABELS, lvl.name)} (<span className="font-mono">{lvl.minDominated}</span>) →{" "}
                  <span className="font-mono">{lvl.rarities.join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>
        </GuideSection>
      </section>
    </main>
  );
}

