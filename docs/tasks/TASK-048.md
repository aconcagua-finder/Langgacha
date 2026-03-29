# TASK-048: Word XP система + языковые уровни коллекции

**Путь к файлу задачи:** `docs/tasks/TASK-048.md`

> Старые таски удалены, потому что проверены и закрыты. НЕ восстанавливай их.

## Цель

Заменить примитивную систему mastery (0-5 счётчик) на полноценную Word XP систему с 30 уровнями слов, интервальным повторением на основе SM-2, и двойным критерием для языковых уровней коллекции (A1-B1+ / Bronze-Master). Отобразить прогресс XP в результатах боя и в коллекции.

## Контекст

Текущая система `masteryProgress: 0-5` — просто счётчик правильных ответов. 5 ответов = слово "освоено" навсегда. Нет реального интервального повторения, нет деградации знаний. Языковой уровень считается только по количеству "доминированных" слов — можно задрочить одни и те же слова и получить высокий уровень.

Новая система должна быть образовательно обоснована (SM-2 интервалы) и гейм-дизайнерски интересна (XP, уровни, прогресс-бары).

---

## Часть 1: Backend — Word XP и интервалы

### 1.1 Миграция БД (Prisma)

Изменить модель `WordProgress`:

```
model WordProgress {
  id              String   @id @default(uuid())
  playerId        String
  wordId          String
  xp              Int      @default(0)       // накопленный XP
  level           Int      @default(0)       // текущий уровень 0-30
  lastReviewedAt  DateTime?
  lastDecayAt     DateTime?                  // когда последний раз считали деградацию

  player          Player   @relation(...)
  word            Word     @relation(...)
  @@unique([playerId, wordId])
}
```

**Удалить поле `masteryProgress`** (заменяется на `xp` + `level`).

**Миграция данных:** при миграции конвертировать старый `masteryProgress` в XP:
- mastery 0 → xp 0, level 0
- mastery 1 → xp 25, level 1
- mastery 2 → xp 75, level 3
- mastery 3 → xp 175, level 5
- mastery 4 → xp 375, level 8
- mastery 5 → xp 625, level 11

### 1.2 Константы XP (в `shared/constants.ts`)

```typescript
// XP нужный для перехода на СЛЕДУЮЩИЙ уровень (от текущего)
export const WORD_LEVEL_MAX = 30;

export const WORD_XP_PER_LEVEL: Record<number, number> = {
  // Фаза 1: New (lv 1-5) — интервал 1 день
  1: 25, 2: 25, 3: 25, 4: 25, 5: 25,
  // Фаза 2: Learning (lv 6-10) — интервал 3 дня
  6: 40, 7: 40, 8: 40, 9: 40, 10: 40,
  // Фаза 3: Familiar (lv 11-15) — интервал 7 дней
  11: 60, 12: 60, 13: 60, 14: 60, 15: 60,
  // Фаза 4: Confident (lv 16-20) — интервал 14 дней
  16: 90, 17: 90, 18: 90, 19: 90, 20: 90,
  // Фаза 5: Strong (lv 21-25) — интервал 30 дней
  21: 130, 22: 130, 23: 130, 24: 130, 25: 130,
  // Фаза 6: Mastered (lv 26-30) — интервал 60 дней
  26: 180, 27: 180, 28: 180, 29: 180, 30: 180,
};

// Интервал повторения в днях, по уровню
export const WORD_REVIEW_INTERVAL_DAYS: Record<number, number> = {
  0: 1,
  // lv 1-5
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
  // lv 6-10
  6: 3, 7: 3, 8: 3, 9: 3, 10: 3,
  // lv 11-15
  11: 7, 12: 7, 13: 7, 14: 7, 15: 7,
  // lv 16-20
  16: 14, 17: 14, 18: 14, 19: 14, 20: 14,
  // lv 21-25
  21: 30, 22: 30, 23: 30, 24: 30, 25: 30,
  // lv 26-30
  26: 60, 27: 60, 28: 60, 29: 60, 30: 60,
};

// XP за правильный ответ
export const WORD_XP_BASE = 10;
export const WORD_XP_TYPING_BONUS = 5;    // typing quiz сложнее
export const WORD_XP_REVERSE_BONUS = 3;   // reverse quiz сложнее
export const WORD_XP_OVERDUE_BONUS = 5;   // карта была Worn/Deteriorated
export const WORD_XP_VARIANCE = 2;        // ±2 XP рандом

// Деградация
export const WORD_XP_DECAY_RATE = 0.05;          // 5% XP в день при просрочке
export const WORD_XP_DECAY_GRACE_MULTIPLIER = 2;  // деградация начинается после 2× интервала
```

### 1.3 Логика начисления XP

Файл: `backend/src/modules/word-progress/word-progress.service.ts`

Заменить `recordCorrectReview` на `awardWordXp`:

```typescript
export const awardWordXp = async (
  playerId: string,
  wordId: string,
  options: {
    quizType: 'translate' | 'reverse' | 'typing';
    wasOverdue: boolean;  // карта была Worn или Deteriorated
  }
): Promise<{ xpGained: number; newLevel: number; oldLevel: number; leveledUp: boolean }> => {
  // 1. Рассчитать XP: base + бонусы + variance
  // 2. Upsert WordProgress: добавить XP, пересчитать level
  // 3. Обновить lastReviewedAt
  // 4. Вернуть результат для UI
};
```

**Формула уровня из XP:**
```typescript
export const calculateLevelFromXp = (totalXp: number): { level: number; xpInCurrentLevel: number; xpForNextLevel: number } => {
  let remaining = totalXp;
  for (let lv = 1; lv <= WORD_LEVEL_MAX; lv++) {
    const needed = WORD_XP_PER_LEVEL[lv];
    if (remaining < needed) {
      return { level: lv - 1, xpInCurrentLevel: remaining, xpForNextLevel: needed };
    }
    remaining -= needed;
  }
  return { level: WORD_LEVEL_MAX, xpInCurrentLevel: 0, xpForNextLevel: 0 };
};
```

### 1.4 Condition через интервалы

Файл: `backend/src/shared/condition.ts`

Заменить хардкод 1/3/7 дней на расчёт от интервала слова:

```typescript
export function computeConditionFromReview(
  lastReviewedAt: Date | string | null,
  wordLevel: number = 0,  // НОВЫЙ параметр
): ComputedCondition {
  if (!lastReviewedAt) return "Normal";

  const daysSince = (Date.now() - new Date(lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24);
  const interval = WORD_REVIEW_INTERVAL_DAYS[wordLevel] ?? 1;
  const ratio = daysSince / interval;

  if (ratio < 0.5) return "Brilliant";
  if (ratio < 1.0) return "Normal";
  if (ratio < 2.0) return "Worn";
  return "Deteriorated";
}
```

### 1.5 Деградация XP

Файл: `backend/src/modules/word-progress/word-progress.decay.ts` (новый)

Деградация считается **лениво** (при запросе прогресса или при входе игрока), не по крону:

```typescript
export const applyDecayIfNeeded = async (playerId: string, wordId: string): Promise<void> => {
  // 1. Получить WordProgress
  // 2. Проверить: прошло ли > 2× интервала с lastReviewedAt?
  // 3. Если да — посчитать дни просрочки, отнять 5% XP за каждый день сверх grace period
  // 4. Не опускать XP ниже начала текущего уровня (мягкая деградация)
  // 5. Обновить lastDecayAt
};
```

**Важно:** деградация не должна опускать уровень — только XP внутри уровня. Это мягко мотивирует повторять, но не наказывает жёстко.

### 1.6 Языковые уровни коллекции

Файл: `backend/src/modules/player/player.service.ts`

Заменить `PROGRESSION_LEVELS` (считалось по количеству dominated слов) на двойной критерий:

```typescript
export const COLLECTION_LEVELS = [
  { name: "A1",  gachaName: "Bronze",   minWords: 25,  minAvgLevel: 5,  rarities: ["C"] },
  { name: "A1+", gachaName: "Silver",   minWords: 45,  minAvgLevel: 8,  rarities: ["C", "UC"] },
  { name: "A2",  gachaName: "Gold",     minWords: 70,  minAvgLevel: 10, rarities: ["C", "UC", "R"] },
  { name: "A2+", gachaName: "Platinum", minWords: 100, minAvgLevel: 12, rarities: ["C", "UC", "R"] },
  { name: "B1",  gachaName: "Diamond",  minWords: 150, minAvgLevel: 15, rarities: ["C", "UC", "R", "SR"] },
  { name: "B1+", gachaName: "Master",   minWords: 200, minAvgLevel: 18, rarities: ["C", "UC", "R", "SR", "SSR"] },
];
```

**Критерий "ширина":** количество уникальных слов с level >= порога (для A1 порог=1, для A2+ порог=5, и т.п. — конкретные пороги в константах, подобрать чтобы было адекватно).

**Упрощение:** на первой итерации считаем ширину = количество слов с level >= 5 (т.е. хотя бы "знакомые"), а глубину = средний уровень этих слов. Так нельзя просто открыть 200 карт и получить B1, нужно реально их учить.

**PlayerDto** — расширить:

```typescript
type PlayerDto = {
  // ... существующие поля ...
  collectionLevel: string;       // "A1", "A2" и т.п.
  collectionGachaName: string;   // "Bronze", "Gold" и т.п.
  nextCollectionLevel: string | null;
  wordsWidth: number;            // сколько слов >= порога
  wordsWidthNeeded: number;      // сколько нужно для следующего уровня
  avgWordLevel: number;          // средний уровень подходящих слов
  avgWordLevelNeeded: number;    // средний нужный для следующего уровня
  totalCollectionXp: number;     // сумма всех XP (для красоты)
  unlockedRarities: string[];
};
```

---

## Часть 2: Backend — Интеграция с боем и рейдом

### 2.1 Battle service

В `battle.service.ts` при правильном ответе вызывать `awardWordXp` вместо `recordCorrectReview`. Передавать `quizType` и `wasOverdue` (condition карты).

**Собирать результаты XP** в state и возвращать в BattleResult:

```typescript
type BattleResult = {
  // ... существующие поля ...
  rewards: {
    dust: number;
    bonusCard: GeneratedCardDto | null;
    correctAnswers: number;
    streak: number;
    wordXpGains: Array<{      // НОВОЕ
      wordId: string;
      word: string;
      xpGained: number;
      oldLevel: number;
      newLevel: number;
      leveledUp: boolean;
      xpInCurrentLevel: number;
      xpForNextLevel: number;
    }>;
  };
};
```

### 2.2 Raid service

Аналогично — в `raid.service.ts` при правильном ответе вызывать `awardWordXp`. Возвращать XP-результат в ответе атаки.

### 2.3 Cards DTO

В `GeneratedCardDto` и API карт — добавить поля уровня слова:

```typescript
type GeneratedCardDto = {
  // ... существующие поля ...
  wordLevel: number;         // уровень слова (0-30)
  wordXp: number;            // текущий XP
  wordXpForNext: number;     // XP до следующего уровня
};
```

**Заменить `masteryProgress`** на `wordLevel` везде где используется (квизы, condition, эволюция).

### 2.4 Эволюция

Текущее условие эволюции: `masteryProgress >= 5`. Заменить на `wordLevel >= 15` (Familiar → Confident, примерно середина пути). Это поле используется в `evolution.service.ts`.

---

## Часть 3: Frontend

### 3.1 BattleResult — секция "Прогресс слов"

В компоненте `BattleResult.tsx` после секции наград и перед секцией раундов добавить блок:

**Дизайн:**
```
┌─────────────────────────────────────┐
│  Прогресс слов                      │
│                                     │
│  🔤 hola         Lv 8 → 9  ⬆       │
│  ████████░░  +12 XP                 │
│                                     │
│  🔤 gato         Lv 14             │
│  ██████░░░░  +10 XP                 │
│                                     │
│  🔤 correr       Lv 3              │
│  ██░░░░░░░░  +15 XP (overdue!)     │
└─────────────────────────────────────┘
```

- Показывать ТОЛЬКО слова, за которые получен XP (правильные ответы)
- Прогресс-бар: заполненность XP внутри текущего уровня, цвет по фазе (New=серый, Learning=зелёный, Familiar=синий, Confident=фиолетовый, Strong=оранжевый, Mastered=золотой)
- Если level up — подсветка строки + стрелка вверх
- Стиль: компактный, в духе существующего UI (slate, rounded, backdrop-blur)

### 3.2 Коллекция — уровень слова на карте

В `CardFace` / `CardMini` — показывать уровень слова:
- Маленький бейдж "Lv 14" в углу карточки (не мешает ATK/DEF)
- Или тонкий прогресс-бар внизу карточки
- Подобрать визуально, не перегружая карту

В `CardGroupModal` — показывать уровень слова и XP прогресс-бар.

### 3.3 Коллекция — уровень коллекции

В `CollectionPage.tsx` — заменить текущий прогресс-бар уровня на новый:

```
┌─────────────────────────────────────────┐
│  A2 Gold Collector                      │
│                                         │
│  Слова:  ████████░░  70 / 100           │
│  Глубина: ██████░░░░  Avg Lv 10 / 12    │
│                                         │
│  → Следующий: A2+ Platinum Collector    │
└─────────────────────────────────────────┘
```

Два прогресс-бара: ширина (количество слов) и глубина (средний уровень). Стиль — как существующие элементы, slate/rounded.

### 3.4 Типы фронтенда

Обновить `frontend/src/types/card.ts`:
- Заменить `masteryProgress: number` на `wordLevel: number`, `wordXp: number`, `wordXpForNext: number`

Обновить `frontend/src/api/player.ts`:
- Добавить новые поля PlayerDto

Обновить `frontend/src/api/battle.ts`:
- Добавить `wordXpGains` в тип BattleResult

---

## Часть 4: Что НЕ делать

- **НЕ менять** систему condition модификаторов (Brilliant 1.1x, Worn 0.9x и т.п.) — только формулу расчёта condition
- **НЕ менять** боевую механику, урон, HP
- **НЕ менять** систему пыли, бустеров, крафта
- **НЕ трогать** рейд-босса (кроме начисления XP при атаке)
- **НЕ создавать** крон для деградации — только ленивый расчёт
- **НЕ использовать** испанские/языко-специфичные названия фаз в коде (New/Learning/Familiar и т.п. — универсальные)
- **НЕ восстанавливать** удалённые таски — они закрыты и проверены

## Порядок выполнения

1. **Миграция БД** — schema + migration + конвертация данных
2. **Константы** — XP таблицы, интервалы, уровни коллекции
3. **word-progress.service.ts** — awardWordXp, calculateLevel, decay
4. **condition.ts** — адаптивные интервалы
5. **battle.service.ts** — интеграция XP, сбор результатов
6. **raid.service.ts** — интеграция XP
7. **player.service.ts** — новые языковые уровни
8. **cards API** — wordLevel в DTO
9. **Frontend типы** — обновить все типы
10. **BattleResult.tsx** — секция прогресса слов
11. **Collection** — уровень слова на картах, уровень коллекции
12. **Тестирование** — проверить бой, рейд, коллекцию, уровни

## Файлы для изменения

### Backend:
- `backend/src/db/prisma/schema.prisma`
- `backend/src/shared/constants.ts`
- `backend/src/shared/condition.ts`
- `backend/src/modules/word-progress/word-progress.service.ts`
- `backend/src/modules/word-progress/word-progress.decay.ts` (новый)
- `backend/src/modules/battle/battle.service.ts`
- `backend/src/modules/battle/battle.types.ts`
- `backend/src/modules/battle/battle.rewards.ts`
- `backend/src/modules/raid/raid.service.ts`
- `backend/src/modules/raid/raid.types.ts`
- `backend/src/modules/player/player.service.ts`
- `backend/src/modules/player/player.types.ts`
- `backend/src/modules/cards/cards.types.ts`
- `backend/src/modules/cards/cards.service.ts`
- `backend/src/modules/evolution/evolution.service.ts`
- `backend/src/modules/config/config.routes.ts`

### Frontend:
- `frontend/src/types/card.ts`
- `frontend/src/api/battle.ts`
- `frontend/src/api/player.ts`
- `frontend/src/api/raid.ts`
- `frontend/src/components/battle/BattleResult.tsx`
- `frontend/src/components/card/CardFace.tsx`
- `frontend/src/components/card/CardMini.tsx`
- `frontend/src/components/collection/CardGroupModal.tsx`
- `frontend/src/pages/CollectionPage.tsx`
