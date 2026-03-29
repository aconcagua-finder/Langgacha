import type { ReactNode } from "react";
import { useId, useState } from "react";

import { useConfig } from "../contexts/ConfigContext";
import { CONDITION_LABELS, TYPE_LABELS, label } from "../shared/labels";

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
        onClick={() => setOpen((value) => !value)}
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

export function GuideContent() {
  const { config } = useConfig();
  if (!config) return null;

  const rechargeMinutes = Math.round(config.boosterRechargeMs / 60000);
  const rarityOrder = config.rarityOrder;
  const rarityChances = config.rarityChances;
  const conditionModifiers = config.conditionModifiers;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Гайд</h1>
        <p className="text-sm text-slate-200/70">
          Справочник по основным механикам. Открывай только то, что нужно.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <GuideSection title="Как играть">
          <ul className="list-disc space-y-1 pl-5">
            <li>LangGacha — карточная гача-игра для изучения иностранных языков.</li>
            <li>Открывай бустеры → собирай карты → сражайся → учи слова.</li>
            <li>
              Цель: прокачивать слова до <span className="font-mono">Lv {config.wordLevelMax}</span>,
              расширять коллекцию и побеждать рейд-босса каждый день.
            </li>
          </ul>
        </GuideSection>

        <GuideSection title="Карты">
          <ul className="list-disc space-y-1 pl-5">
            <li>Каждая карта — иностранное слово с переводом.</li>
            <li>
              <span className="font-semibold">Рарность:</span>{" "}
              <span className="font-mono">
                {rarityOrder.map((rarity) => `${rarity} ${rarityChances[rarity] ?? 0}%`).join(" · ")}
              </span>
              .
            </li>
            <li>
              <span className="font-semibold">Статы:</span>{" "}
              <span className="font-mono">ATK</span> (сила атаки) и{" "}
              <span className="font-mono">DEF</span> (защита) — случайные в диапазоне рарности.
            </li>
            <li>
              <span className="font-semibold">Типы:</span>{" "}
              {Object.keys(TYPE_LABELS)
                .map((type) => label(TYPE_LABELS, type))
                .join(", ")}
              .
            </li>
          </ul>
        </GuideSection>

        <GuideSection title="Состояние карт">
          <ul className="list-disc space-y-1 pl-5">
            <li>Карты «стареют», если их не использовать в бою.</li>
            <li>
              <span className="font-semibold">Эффект на статы:</span>{" "}
              <span className="font-mono">
                {label(CONDITION_LABELS, "Brilliant")} ({percentDelta(conditionModifiers.Brilliant ?? 1)}) →{" "}
                {label(CONDITION_LABELS, "Normal")} ({percentDelta(conditionModifiers.Normal ?? 1)}) →{" "}
                {label(CONDITION_LABELS, "Worn")} ({percentDelta(conditionModifiers.Worn ?? 1)}) →{" "}
                {label(CONDITION_LABELS, "Deteriorated")} ({percentDelta(conditionModifiers.Deteriorated ?? 1)})
              </span>
              .
            </li>
            <li>Используй карту в бою, чтобы обновить её состояние.</li>
          </ul>
        </GuideSection>

        <GuideSection title="Word XP">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Правильные ответы дают XP слова: translate, reverse и typing дают разный вклад.
            </li>
            <li>
              У каждого слова <span className="font-mono">30</span> уровней и собственный интервал
              повторения.
            </li>
            <li>Если слово долго не повторять после grace-периода, XP внутри уровня постепенно снижается.</li>
            <li>Эволюция открывается с <span className="font-mono">Lv {config.wordEvolutionLevel}</span>.</li>
          </ul>
        </GuideSection>

        <GuideSection title="Бустеры">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Бустер = <span className="font-mono">{config.boosterSize}</span> случайных карт.
            </li>
            <li>
              Максимум <span className="font-mono">{config.maxBoosters}</span> бустеров, +1 каждые{" "}
              <span className="font-mono">{rechargeMinutes}</span> минут.
            </li>
            <li>Гарантия: минимум 1 карта UC+ в каждом бустере.</li>
            <li>
              Pity-система: каждые <span className="font-mono">{config.pityThreshold}</span>{" "}
              бустеров без SR+ → гарантированная SR+ карта.
            </li>
          </ul>
        </GuideSection>

        <GuideSection title="Бой (PvE)">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Перед стартом игра автоматически собирает колоду до{" "}
              <span className="font-mono">{config.battleDeckSize}</span> карт.
            </li>
            <li>Приоритет у ветхих и изношенных карт, а дубликаты слова схлопываются в один сильнейший экземпляр.</li>
            <li>Перед каждым раундом — вопрос: переведи слово на карте.</li>
            <li>
              Правильный ответ → «Воодушевление»:{" "}
              <span className="font-mono">+{Math.round(config.inspirationBonus * 100)}%</span> к{" "}
              <span className="font-mono">ATK</span>.
            </li>
            <li>Если карт меньше полного лимита, бой всё равно стартует с доступной колодой.</li>
            <li>
              Стрик: <span className="font-mono">{config.streakThreshold}+</span> правильных
              ответов подряд → <span className="font-mono">×{config.streakMultiplier}</span> к
              награде Пыли.
            </li>
          </ul>
        </GuideSection>

        <GuideSection title="Рейд дня">
          <ul className="list-disc space-y-1 pl-5">
            <li>Ежедневный мощный босс.</li>
            <li>
              Используешь до <span className="font-mono">{config.raidMaxCards}</span> карт: карта
              бьёт босса, босс бьёт карту — обмен ударами до смерти одного.
            </li>
            <li>Карты могут погибнуть — это нормально, отправляй следующую.</li>
            <li>
              Победа → <span className="font-mono">{config.raidVictoryDust}</span> Пыль +{" "}
              <span className="font-mono">{config.raidVictoryBoosters}</span> бустер.
            </li>
            <li>Приоритет: забытые и слабые карты идут первыми — тренируешь то, что знаешь хуже.</li>
          </ul>
        </GuideSection>

        <GuideSection title="Пыль и крафт">
          <ul className="list-disc space-y-1 pl-5">
            <li>Пыль — валюта. Получаешь из боёв, рейда и распыления карт.</li>
            <li>
              <span className="font-semibold">Распыление:</span> уничтожь карту → получи Пыль{" "}
              <span className="font-mono">
                ({rarityOrder.map((rarity) => `${rarity}: ${config.dustPerDisintegrate[rarity] ?? 0}`).join(", ")})
              </span>
              .
            </li>
            <li>
              <span className="font-semibold">Крафт:</span> создай карту нужной рарности за Пыль{" "}
              <span className="font-mono">
                ({rarityOrder.map((rarity) => `${rarity}: ${config.dustPerCraft[rarity] ?? 0}`).join(", ")})
              </span>
              . Лимит: <span className="font-mono">{config.craftsPerDay}</span> крафт в день.
            </li>
          </ul>
        </GuideSection>

        <GuideSection title="Прогрессия">
          <div className="space-y-2">
            <div>Коллекционный ранг зависит от ширины словаря и среднего уровня слов:</div>
            <ul className="list-disc space-y-1 pl-5">
              {config.collectionLevels.map((level) => (
                <li key={level.name}>
                  <span className="font-mono">
                    {level.name} {level.gachaName}
                  </span>{" "}
                  (
                  <span className="font-mono">
                    {level.minWords} слов / Avg Lv {level.minAvgLevel}
                  </span>
                  ) →{" "}
                  <span className="font-mono">{level.rarities.join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>
        </GuideSection>
      </section>
    </div>
  );
}

export function GuidePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl flex-col px-6 py-10">
      <GuideContent />
    </main>
  );
}
