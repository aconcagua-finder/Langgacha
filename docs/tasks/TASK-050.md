# TASK-050: Миграция схемы БД — Theme, WordTheme, CEFR, Core

**Путь к файлу задачи:** `docs/tasks/TASK-050.md`
**Родительский план:** `docs/content-plan.md` (ЭТАП 2, задачи 2.1–2.5)
**Статус:** ⚪ Pending (ожидает начала)
**Тип:** CODE + миграция БД + ручная раскладка данных
**Блокеры:** TASK-049 завершён, решения Aleksei зафиксированы в content-plan.md § 12

> **Старые TASK-файлы удалены, потому что проверены и закрыты. НЕ восстанавливай их.**

---

## Цель

Мигрировать схему БД под трёхслойную таксономию (Domain → Theme → Word), добавить CEFR и Core-флаг, обновить сервисы бустеров и дистракторов, разложить существующие 150 слов по темам согласно утверждённой раскладке.

После выполнения TASK-050 должно быть возможно:
1. Запросить бустер с фильтром `themeKey=kitchen` и получить только слова темы kitchen
2. Запросить бустер игрока A1 и получить только темы уровня A1
3. В quiz reverse-дистракторы должны приоритизироваться по теме
4. Core-слова (isCore=true) выпадают из бустера с низким фоновым шансом (настраивается константой)

---

## Обязательные чтения ПЕРЕД стартом

1. `docs/content-plan.md` — весь документ, особенно разделы 5 (архитектурные решения), 5.6 (диалект), 12 (решения Aleksei)
2. `docs/taxonomy.md` — финальная таксономия с раскладкой существующих слов
3. `docs/content-audit.md` — систематические проблемы в существующих 150 словах (часть из них решается в TASK-053+, но некоторые надо учесть в миграции — см. ниже)
4. `backend/src/db/prisma/schema.prisma` — текущая схема
5. `backend/src/modules/boosters/boosters.service.ts` — текущая логика бустера
6. `backend/src/modules/cards/cards.generator.ts` — текущая логика подбора слова
7. `backend/src/modules/quiz/quiz.generator.ts` — текущая логика дистракторов
8. `backend/scripts/seed-words-common.ts` (75 слов) — для раскладки
9. `backend/scripts/seed-words-uncommon.ts` (45 слов) — для раскладки
10. `backend/scripts/seed-words-rare.ts` (20 слов) — для раскладки
11. `backend/scripts/seed-words-sr.ts` (10 слов) — для раскладки

---

## Часть 1 — Схема БД

### 1.1 Prisma миграция

Файл: `backend/src/db/prisma/schema.prisma`

**Новые модели:**

```prisma
model Theme {
  key           String    @id                       // "kitchen", "hotel-stay"
  nameRu        String
  nameEs        String
  domain        String                              // "Everyday", "City", ...
  cefrTier      String                              // "A1" | "A2" | "B1" | ...
  orderIndex    Int                                 // порядок показа в UI
  emoji         String?
  description   String?

  createdAt     DateTime  @default(now())
  wordThemes    WordTheme[]
}

model WordTheme {
  wordId     String
  themeKey   String
  isPrimary  Boolean   @default(false)              // основная тема слова

  word       Word      @relation(fields: [wordId], references: [id], onDelete: Cascade)
  theme      Theme     @relation(fields: [themeKey], references: [key], onDelete: Cascade)

  @@id([wordId, themeKey])
  @@index([themeKey])
  @@index([wordId])
}
```

**Изменения в `Word`:**

```prisma
model Word {
  // ... существующие поля ...
  cefrLevel  String?    // "A1" | "A2" | "B1" | "B2" | "C1" | "C2" (null = не проставлен, будет считаться как A1)
  isCore     Boolean    @default(false)
  dialect    String     @default("rioplatense")   // на будущее; сейчас все rioplatense

  wordThemes WordTheme[]
  // tags можно оставить, но не использовать — или удалить, если ничего не сломается
}
```

**Миграция имени:** `20260410000000_add_themes_and_cefr` (дата фиксируется при запуске).

### 1.2 Что делать с существующими полями

- **`tags` (String[])** — оставить в схеме, но прекратить использование в коде (quiz.generator.ts, где sameType bucket). Удалять столбец не надо — не хочу блокировать возможность обратки.
- **`language`** — оставить "es", не менять на "es-ar" (решение Aleksei — не дёргать миграцию из-за будущего расширения кастильского).

---

## Часть 2 — Сид таблицы Theme

Файл: `backend/scripts/seed-themes.ts` (новый)

Скрипт идемпотентный (upsert по key), вызывается из `seed.ts` первым, до сида слов.

Содержимое — из `docs/taxonomy.md` разделы "Доменная карта". 32 темы. Пример формата:

```typescript
export const THEMES: ThemeSeed[] = [
  // Everyday
  { key: "home", nameRu: "Дом и комнаты", nameEs: "La casa", domain: "Everyday", cefrTier: "A1", orderIndex: 1, emoji: "🏠", description: "Комнаты, мебель, бытовые предметы" },
  { key: "kitchen", nameRu: "На кухне", nameEs: "En la cocina", domain: "Everyday", cefrTier: "A1", orderIndex: 2, emoji: "🍳", description: "Еда, посуда, готовка, напитки" },
  // ... остальные 30 тем
];
```

**orderIndex** — ручной для первых 15 A1 тем, соответствует приоритету из `content-plan.md` § 10 Этап 5. Остальные A2/B1 — продолжающие индексы по алфавиту ключа.

### Тип в TypeScript

```typescript
export type ThemeSeed = {
  key: string;
  nameRu: string;
  nameEs: string;
  domain: "Everyday" | "City" | "Social" | "Travel" | "Work & Study" | "Expression";
  cefrTier: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  orderIndex: number;
  emoji: string;
  description: string;
};
```

---

## Часть 3 — Обновление 150 существующих seed-файлов

Это БОЛЬШАЯ часть задачи. Необходимо каждое из 150 слов:
1. Проставить `cefrLevel` (A1/A2/B1 — согласно `docs/taxonomy.md`)
2. Проставить `isCore: true` для 16 core-слов (список в `docs/taxonomy.md` раздел Core)
3. Проставить список тем (primary + additional) — через новое поле `themes: string[]` с первым элементом = primary

### 3.1 Расширить SeedWord type

Файл: `backend/scripts/seed-words.types.ts`

```typescript
export type SeedWord = {
  language: "es";
  conceptKey: string;
  word: string;
  translationRu: string;
  type: WordType;
  rarity: WordRarity;
  baseAtk: number;
  baseDef: number;
  colorido: number;
  flavorText: string;
  hint: string;
  tags: string[];       // оставить как есть, можно не заполнять
  canEvolve?: boolean;
  imagePrompt?: string | null;
  quizCorrect: string;
  quizOptions: [string, string, string, string];
  evolutionData?: unknown | null;

  // НОВЫЕ:
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  isCore?: boolean;
  themes: string[];     // 1-й элемент = primary, остальные = additional. Пусто для isCore=true
};
```

### 3.2 Пройтись по всем 4 seed-файлам и добавить поля

**Для каждого слова:** открыть `docs/taxonomy.md`, найти слово в таблице распределения по теме или в секции Core, проставить `cefrLevel`, `isCore`, `themes`.

**Использовать таблицу из `content-plan.md` § 12 "Раскладка 11 спорных слов"** для спорных случаев — это SOURCE OF TRUTH при расхождении с taxonomy.md.

### 3.3 Обновить seed.ts (upsert логика)

Файл: `backend/scripts/seed.ts`

После upsert Word — сразу upsert WordTheme для каждой темы. Первая тема — isPrimary=true, остальные — false.

Пример:
```typescript
for (const word of WORDS) {
  const created = await prisma.word.upsert({
    where: { language_word: { language: word.language, word: word.word } },
    create: {
      // ... все поля + новые
      cefrLevel: word.cefrLevel,
      isCore: word.isCore ?? false,
    },
    update: {
      cefrLevel: word.cefrLevel,
      isCore: word.isCore ?? false,
      // ... другие обновляемые поля
    },
  });

  // WordTheme upsert
  if (word.themes.length > 0) {
    // Удалить существующие связи (для идемпотентности)
    await prisma.wordTheme.deleteMany({ where: { wordId: created.id } });
    for (let i = 0; i < word.themes.length; i++) {
      await prisma.wordTheme.create({
        data: {
          wordId: created.id,
          themeKey: word.themes[i]!,
          isPrimary: i === 0,
        },
      });
    }
  }
}
```

---

## Часть 4 — Core-дополнение: добавить базовые глаголы

Из `docs/taxonomy.md` раздел "Core-пробелы, которые нужно добавить вручную" — 12 слов:

- ser, estar, tener, haber, poder, vivir, trabajar, saber, conocer, dar, decir, gustar

Для каждого нужно написать полную SeedWord запись: flavor, hint, quizOptions, статы по рарности C. Все — `cefrLevel: "A1"`, `isCore: true`, `rarity: "C"`, `themes: []`.

**Важно:** в рамках TASK-050 это "минимальный живой контент", без претензий на эталон. Полный reference-стиль будет задан в TASK-051 (kitchen). Сейчас — просто заполнить дыру.

Файл: `backend/scripts/seed-words-core.ts` (новый)

---

## Часть 5 — Обновление backend-сервисов

### 5.1 cards.generator.ts

```typescript
export const generateCardFromPool = async (params: {
  rarity?: Rarity;
  playerId: string;
  db?: DbClient;
  themeKey?: string;        // ← новое
  cefrMaxLevel?: CefrLevel; // ← новое
  excludeCore?: boolean;    // ← новое (для тематических бустеров)
}): Promise<GeneratedCardDto>
```

Обновить `pickRandomWord` так, чтобы where:
- `rarity` — если задан
- `themes.some.themeKey` = themeKey — если задан
- `cefrLevel` IN allowed CEFR уровни игрока — если задан cefrMaxLevel
- `isCore: false` — если excludeCore

### 5.2 boosters.service.ts

Добавить логику выбора темы бустера:

```typescript
const pickBoosterTheme = async (playerId: string): Promise<string | null> => {
  // 1. Получить cefrMaxLevel игрока (из player.collectionLevel или дефолт A1)
  // 2. Найти все темы с cefrTier <= cefrMaxLevel
  // 3. Случайно выбрать одну
  // 4. Вернуть themeKey
}
```

**Стандартный бустер:** 7 карт из выбранной темы, из них ~1 карта из Core (фоновый шанс 15%, CORE_DROP_CHANCE константа).

**Параметры бустера** расширить типом:
```typescript
type OpenBoosterParams = {
  playerId: string;
  themeKey?: string;  // если задан — тематический бустер (стоит пыль, пока не реализуем цену в TASK-050)
};
```

На TASK-050 достаточно, чтобы стандартный бустер работал по теме. Тематические бустеры за пыль — отдельная задача.

### 5.3 quiz.generator.ts

Обновить `pickDistractors`:

```typescript
const buckets = [
  sameTheme,          // ← новый, высший приоритет
  sameType,           // тип остаётся как вторичный
  sameDomain,         // ← новый
  sameLanguage,       // остаётся как fallback
  nonMatching,        // остаётся как последний fallback
];
```

`sameTheme` — слова, у которых есть WordTheme с тем же themeKey, что у правильного слова (primary).
`sameDomain` — слова из тем того же домена.

### 5.4 player.service.ts (TASK-048 связь)

TASK-048 (Word XP + языковые уровни) параллельно в работе. В TASK-050 нужно подготовить поле для интеграции:

- Добавить в PlayerDto: `unlockedThemes: string[]` (все темы с cefrTier <= player.cefrMaxLevel)
- `cefrMaxLevel` вычисляется из COLLECTION_LEVELS из TASK-048

Если TASK-048 ещё не мёржен — временно захардкодить `cefrMaxLevel = "A1"` для всех игроков и оставить TODO для интеграции.

---

## Часть 6 — Frontend (минимальные изменения)

### 6.1 Типы

Файл: `frontend/src/types/card.ts`

Добавить в GeneratedCardDto:
```typescript
themes: string[];
primaryTheme: string | null;
cefrLevel: string | null;
isCore: boolean;
```

### 6.2 UI

В рамках TASK-050 **UI обновляем минимально**:
- В `CardFace` или `CardMini` — просто не ломать существующий рендер
- В `BoosterPage` — если есть seletion темы, добавить dropdown. Если нет — не добавлять, оставить на следующую задачу.

**НЕ делать в TASK-050** (оставить на следующие задачи):
- Экран выбора темы бустера
- Визуализация "уровня темы" в коллекции
- Прогресс-бары по темам
- Страница "Все темы"

---

## Часть 7 — Тестирование

### 7.1 Миграция применяется чисто

- `npm run prisma:migrate dev` проходит без ошибок (или `migrate reset` если БД уже в drift — см. ниже)
- `npm run seed` идемпотентен: первый запуск создаёт Theme+Word+WordTheme, второй ничего не ломает

### 7.2 Открытие бустера

- Создать тестового игрока с `cefrMaxLevel = "A1"`
- Открыть бустер
- Проверить, что все 7 карт из одной темы + до 1 core-карты
- Проверить, что тема имеет cefrTier="A1"

### 7.3 Quiz дистракторы

- Для карты `casa` (тема home) дистракторы должны включать слова из home в первую очередь
- Для карты из изолированной темы (где мало слов) — fallback на sameType и дальше

### 7.4 Сборка

- `cd backend && npm run build` — OK
- `cd frontend && npm run build` — OK

---

## Часть 8 — Что НЕ делать

- **НЕ** переписывать hints/flavorText/quiz'ы существующих 150 слов (это TASK-053+)
- **НЕ** генерировать новые темы кроме Core-дополнения (это TASK-051+)
- **НЕ** ломать TASK-048 (если он в работе в параллельной ветке — координироваться)
- **НЕ** удалять старые seed-файлы и старую логику до подтверждения работоспособности новой
- **НЕ** добавлять UI для тематических бустеров — только backend готовность
- **НЕ** менять типы/рарности в существующих 150 словах (кроме случаев критичных нестыковок из `content-audit.md` — типа `cargar con` который помечен type:Action но лежит в секции Expressions — это можно и нужно починить)
- **НЕ** запускать `prisma migrate reset` без явного разрешения Aleksei (там данные)

---

## Критерии готовности

- [ ] Схема БД: модели Theme, WordTheme, поля cefrLevel/isCore/dialect на Word
- [ ] Миграция применяется чисто на dev
- [ ] `seed-themes.ts` создан, 32 темы
- [ ] 150 существующих слов обновлены (cefrLevel + isCore + themes)
- [ ] Core-дополнение: 12 базовых глаголов добавлены в `seed-words-core.ts`
- [ ] `seed.ts` обновлён, идемпотентен
- [ ] `cards.generator.ts` поддерживает фильтр по теме/CEFR
- [ ] `boosters.service.ts` выбирает тему бустера
- [ ] `quiz.generator.ts` приоритизирует дистракторы по теме
- [ ] `player.service.ts` отдаёт unlockedThemes (заглушка OK если TASK-048 не мёржен)
- [ ] `frontend/src/types/card.ts` обновлён
- [ ] Backend build OK
- [ ] Frontend build OK
- [ ] Тестовый прогон: бустер возвращает тематический результат
- [ ] progress.md обновлён (раздел TASK-050)
- [ ] content-plan.md обновлён: статусы 2.1-2.5 → ✅

---

## После завершения

Следующая задача — TASK-051 (эталонная тема kitchen, интерактивная сборка с Aleksei). Это блокер для всех остальных тем в Этапе 5.

---

## Memory updates после завершения

- Обновить `project_content_foundation.md` — "TASK-050 завершён, схема мигрирована, сервисы поддерживают темы/CEFR/Core"
- Если появились новые архитектурные детали — обновить соответствующие memory-файлы
