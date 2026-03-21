# TASK-032: Мастерство и ветхость на уровне слова + эволюция карт + визуал ветхости

**Важно:** все предыдущие задачи (TASK-001–031) уже выполнены и проверены. Не нужно их восстанавливать. Путь к этому файлу: `docs/tasks/TASK-032.md`.

## Контекст

### Проблема 1: Мастерство/ветхость привязаны к экземпляру карты
Сейчас `masteryProgress`, `condition`, `lastUsedAt` хранятся на модели `Card`. Если у игрока 5 карт "casa" — каждую нужно осваивать отдельно. Это абсурд: ты учишь **слово**, а не карточку. Нужно перенести обучение на уровень слова.

### Проблема 2: Эволюция не реализована
В GDD описана эволюция карт: освоил слово → платишь Пыль → карта получает спряжения/формы, +20% статов, сложные вопросы в бою. Поля `canEvolve`, `isEvolved`, `evolutionData` в схеме есть, но логика не написана.

### Проблема 3: Ветхость визуально не отражается
Состояние карты (Brilliant/Normal/Worn/Deteriorated) показывается только как цветной квадратик. Нужен визуальный эффект на самой карте — потёртости, трещины.

---

## Часть 1: Новая модель — WordProgress

### 1.1 Создать таблицу WordProgress

Новая модель в `schema.prisma`:

```prisma
model WordProgress {
  id              String   @id @default(uuid())
  playerId        String
  player          Player   @relation(fields: [playerId], references: [id])
  wordId          String
  word            Word     @relation(fields: [wordId], references: [id])

  masteryProgress Int      @default(0)
  lastReviewedAt  DateTime @default(now())

  @@unique([playerId, wordId])
}
```

Добавить обратные связи:
- В `Player`: `wordProgress WordProgress[]`
- В `Word`: `wordProgress WordProgress[]`

### 1.2 Миграция данных

Создать миграцию, которая:
1. Создаёт таблицу `WordProgress`
2. Мигрирует существующие данные: для каждой пары (playerId, wordId) берёт **максимальный** `masteryProgress` и **самый свежий** `lastUsedAt` среди всех карт игрока с этим словом
3. **НЕ удалять** поля `masteryProgress`, `condition`, `lastUsedAt` из `Card` — они остаются, но теперь `condition` и `lastUsedAt` на Card будут **вычисляться** из `WordProgress.lastReviewedAt`

SQL для миграции данных (вставить в migration.sql после CREATE TABLE):
```sql
INSERT INTO "WordProgress" (id, "playerId", "wordId", "masteryProgress", "lastReviewedAt")
SELECT
  gen_random_uuid(),
  c."playerId",
  c."wordId",
  MAX(c."masteryProgress"),
  MAX(c."lastUsedAt")
FROM "Card" c
WHERE c."playerId" IS NOT NULL
GROUP BY c."playerId", c."wordId"
ON CONFLICT DO NOTHING;
```

### 1.3 Убрать `masteryProgress` из Card

После миграции данных в WordProgress, **убрать** поле `masteryProgress` из модели `Card` в schema.prisma. Оставить `condition` и `lastUsedAt` на Card, но они теперь будут вычисляться из WordProgress.

**Стоп.** На самом деле `condition` и `lastUsedAt` на Card тоже больше не нужны как отдельные поля — ветхость теперь считается от `WordProgress.lastReviewedAt`. Убираем:
- `Card.masteryProgress` — удалить
- `Card.lastUsedAt` — удалить
- `Card.condition` — удалить (будет вычисляться)

Схема Card становится:
```prisma
model Card {
  id              String   @id @default(uuid())
  wordId          String
  word            Word     @relation(fields: [wordId], references: [id])
  atk             Int      @map("fue")
  def             Int
  isEvolved       Boolean  @default(false)
  createdAt       DateTime @default(now())
  playerId        String?
  player          Player?  @relation(fields: [playerId], references: [id])
  raidAttacks     RaidAttack[]
}
```

---

## Часть 2: Перенос логики мастерства и ветхости

### 2.1 Обновить onCorrectAnswer (battle.service.ts, строки 80-101)

**Было:** обновляет `Card.masteryProgress`, `Card.condition`, `Card.lastUsedAt`

**Стало:** обновляет (или создаёт) `WordProgress` для пары (playerId, wordId):

```typescript
const onCorrectAnswer = async (cardId: string, playerId: string): Promise<void> => {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { wordId: true },
  });
  if (!card) return;

  await prisma.wordProgress.upsert({
    where: { playerId_wordId: { playerId, wordId: card.wordId } },
    create: {
      playerId,
      wordId: card.wordId,
      masteryProgress: 1,
      lastReviewedAt: new Date(),
    },
    update: {
      masteryProgress: { increment: 1 },
      lastReviewedAt: new Date(),
    },
  });

  // Clamp mastery to max
  await prisma.wordProgress.updateMany({
    where: { playerId, wordId: card.wordId, masteryProgress: { gt: 5 } },
    data: { masteryProgress: 5 },
  });
};
```

Обновить вызов — теперь передаём `playerId`:
- `battle.service.ts` строка 189: `await onCorrectAnswer(playerCard.id, state.playerId);`

### 2.2 Обновить рейд (raid.service.ts, строки 186-202)

Аналогичная замена — вместо обновления Card обновляем WordProgress:

```typescript
if (quizCorrect) {
  await tx.wordProgress.upsert({
    where: { playerId_wordId: { playerId, wordId: card.wordId } },
    create: {
      playerId,
      wordId: card.wordId,
      masteryProgress: 1,
      lastReviewedAt: now,
    },
    update: {
      masteryProgress: { increment: 1 },
      lastReviewedAt: now,
    },
  });
  await tx.wordProgress.updateMany({
    where: { playerId, wordId: card.wordId, masteryProgress: { gt: 5 } },
    data: { masteryProgress: 5 },
  });
}
```

Удалить обновление `Card.masteryProgress`, `Card.condition`, `Card.lastUsedAt` из обоих файлов.

### 2.3 Обновить computeCondition (condition.ts)

Теперь condition вычисляется от `WordProgress.lastReviewedAt`, а не от `Card.lastUsedAt`:

```typescript
export function computeConditionFromReview(lastReviewedAt: Date | null): string {
  if (!lastReviewedAt) return "Deteriorated";
  const daysSinceReview = (Date.now() - new Date(lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceReview >= 7) return "Deteriorated";
  if (daysSinceReview >= 3) return "Worn";
  if (daysSinceReview < 1) return "Brilliant";
  return "Normal";
}
```

Старую `computeCondition` и `improveCondition` можно удалить — больше не нужны.

### 2.4 Обновить buildPlayerBattleCard (battle.service.ts, строки 53-70)

Теперь нужно подтягивать condition из WordProgress:

```typescript
const buildPlayerBattleCard = async (card: Card & { word: Word }, playerId: string): Promise<BattleCard> => {
  const wp = await prisma.wordProgress.findUnique({
    where: { playerId_wordId: { playerId, wordId: card.wordId } },
  });
  const condition = computeConditionFromReview(wp?.lastReviewedAt ?? null);
  const atk = applyConditionModifier(card.atk, condition);
  const def = applyConditionModifier(card.def, condition);
  return {
    id: card.id,
    word: card.word.word,
    translationRu: card.word.translationRu,
    type: card.word.type,
    rarity: card.word.rarity,
    atk,
    def,
    hp: computeHp(def),
    condition,
    quizCorrect: card.word.quizCorrect,
    quizOptions: card.word.quizOptions,
  };
};
```

Эта функция становится async. Обновить все вызовы (строка 121):
```typescript
const playerCards = await Promise.all(ordered.map((c) => buildPlayerBattleCard(c!, playerId)));
```

### 2.5 Обновить dominatedCount (player.service.ts, строки 51-53)

**Было:** считает карты с `masteryProgress >= 5`

**Стало:** считает уникальные слова с `masteryProgress >= 5`:

```typescript
const dominatedCount = await prisma.wordProgress.count({
  where: { playerId, masteryProgress: { gte: 5 } },
});
```

### 2.6 Обновить рейд выбор карты (raid.service.ts, строки 90-100)

Рейд сортирует карты по condition и mastery. Теперь condition берётся из WordProgress:

```typescript
const wordProgressMap = new Map<string, { masteryProgress: number; lastReviewedAt: Date }>();
const progressRecords = await prisma.wordProgress.findMany({
  where: { playerId, wordId: { in: cards.map(c => c.wordId) } },
});
for (const wp of progressRecords) {
  wordProgressMap.set(wp.wordId, wp);
}

const prepared = cards.map((c) => {
  const wp = wordProgressMap.get(c.wordId);
  const condition = computeConditionFromReview(wp?.lastReviewedAt ?? null);
  const rank = conditionRank[condition] ?? 2;
  const mastery = wp?.masteryProgress ?? 0;
  return { card: c, rank, mastery, r: Math.random() };
});
```

### 2.7 Обновить mapCardToDto (cards.generator.ts)

Добавить `masteryProgress` и `condition` через WordProgress. Функция станет async и будет принимать playerId:

```typescript
export const mapCardToDto = async (
  card: Card & { word: Word },
  playerId?: string | null,
): Promise<GeneratedCardDto> => {
  let masteryProgress = 0;
  let condition = "Normal";

  if (playerId) {
    const wp = await prisma.wordProgress.findUnique({
      where: { playerId_wordId: { playerId, wordId: card.wordId } },
    });
    if (wp) {
      masteryProgress = wp.masteryProgress;
      condition = computeConditionFromReview(wp.lastReviewedAt);
    }
  }

  return {
    id: card.id,
    conceptKey: card.word.conceptKey,
    word: card.word.word,
    translationRu: card.word.translationRu,
    type: card.word.type,
    rarity: card.word.rarity,
    atk: card.atk,
    def: card.def,
    colorido: card.word.colorido,
    flavorText: card.word.flavorText,
    hint: card.word.hint,
    tags: card.word.tags,
    condition,
    masteryProgress,
    canEvolve: card.word.canEvolve,
    isEvolved: card.isEvolved,
  };
};
```

Обновить все вызовы `mapCardToDto` — теперь async и передаёт playerId.

### 2.8 Обновить GeneratedCardDto / GeneratedCard

Добавить поле `isEvolved: boolean` если его ещё нет.

Проверить что `condition` и `masteryProgress` остаются в типе (они теперь вычисляемые, но всё ещё передаются на фронт).

---

## Часть 3: Эволюция карт

### 3.1 API эндпоинт

Создать `backend/src/modules/evolution/evolution.service.ts`:

```typescript
export const evolveCard = async (playerId: string, cardId: string): Promise<EvolveResult>
```

Логика:
1. Найти карту, проверить что принадлежит игроку
2. Проверить `card.word.canEvolve === true`
3. Проверить `card.isEvolved === false`
4. Найти WordProgress — `masteryProgress >= 5` (слово освоено)
5. Списать Пыль (стоимость = `DUST_PER_CRAFT[card.word.rarity]` — те же цены что и крафт)
6. Обновить `card.isEvolved = true`
7. Увеличить статы карты: `atk *= 1.2`, `def *= 1.2` (округлить)
8. Сбросить мастерство слова: `WordProgress.masteryProgress = 0`
9. Вернуть обновлённую карту

Создать `backend/src/modules/evolution/evolution.types.ts`:
```typescript
export type EvolveResult = {
  card: GeneratedCardDto;
  dustSpent: number;
  dustRemaining: number;
};
```

Создать `backend/src/modules/evolution/evolution.routes.ts`:
```typescript
POST /api/evolution/evolve  body: { cardId: string }
GET /api/evolution/status/:cardId  — можно ли эволюционировать эту карту
```

Зарегистрировать в `app.ts`.

### 3.2 Фронтенд — страница/модалка эволюции

Не создавать отдельную страницу. Добавить кнопку "Эволюция" в **CardPreviewModal** (или аналогичный компонент просмотра карты в коллекции).

Кнопка видна если:
- `card.canEvolve === true`
- `card.isEvolved === false`
- `masteryProgress >= 5` (слово освоено)

При клике:
- Показать подтверждение с ценой
- Отправить POST /api/evolution/evolve
- Показать результат (обновлённую карту)

### 3.3 Визуал эволюционированной карты

На CardFace и CardMini, если `card.isEvolved === true`:
- Добавить маркер эволюции — небольшой бейдж "🔄" или иконку рядом с рарностью
- Можно добавить лёгкий визуальный акцент на рамке (например, двойная рамка или accent border)

Минимально, без перегруза.

---

## Часть 4: Визуал ветхости на картах

### 4.1 CSS-эффекты ветхости

Создать файл `frontend/src/styles/condition-effects.css` (или добавить в существующий CSS):

```css
/* Worn — лёгкие потёртости */
.condition-worn {
  position: relative;
}
.condition-worn::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 5% 95%, rgba(0,0,0,0.15) 0%, transparent 40%),
    radial-gradient(ellipse at 95% 5%, rgba(0,0,0,0.1) 0%, transparent 35%);
  mix-blend-mode: multiply;
}

/* Deteriorated — трещины и выцветание */
.condition-deteriorated {
  position: relative;
  filter: saturate(0.7) brightness(0.9);
}
.condition-deteriorated::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    linear-gradient(135deg, transparent 30%, rgba(0,0,0,0.08) 31%, transparent 32%),
    linear-gradient(225deg, transparent 40%, rgba(0,0,0,0.06) 41%, transparent 42%),
    linear-gradient(45deg, transparent 55%, rgba(0,0,0,0.08) 56%, transparent 57%),
    radial-gradient(ellipse at 10% 90%, rgba(0,0,0,0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 90% 10%, rgba(0,0,0,0.15) 0%, transparent 40%);
  mix-blend-mode: multiply;
}

/* Brilliant — лёгкое свечение */
.condition-brilliant {
  box-shadow: 0 0 15px 2px rgba(255, 255, 255, 0.08);
}
```

### 4.2 Применить классы в CardFace.tsx и CardMini.tsx

На внешний контейнер карты добавить CSS-класс в зависимости от condition:

```typescript
const conditionClass =
  card.condition === "Deteriorated" ? "condition-deteriorated" :
  card.condition === "Worn" ? "condition-worn" :
  card.condition === "Brilliant" ? "condition-brilliant" : "";
```

Добавить `conditionClass` в className контейнера карты.

### 4.3 Импортировать CSS

В `main.tsx` или `App.tsx` добавить:
```typescript
import "./styles/condition-effects.css";
```

---

## Что НЕ трогать

- Логику крафта — она работает независимо
- Логику бустеров — не связана с мастерством
- Генерацию карт (randomization) — статы при генерации остаются как есть
- Картинки карт — не связано

---

## Порядок реализации

1. Создать миграцию и модель WordProgress
2. Мигрировать данные из Card в WordProgress
3. Удалить `masteryProgress`, `condition`, `lastUsedAt` из Card
4. Обновить бэкенд логику (battle, raid, player, cards.generator)
5. Реализовать эволюцию (бэкенд)
6. Обновить фронтенд типы и API
7. Добавить CSS ветхости
8. Добавить кнопку эволюции
9. Тестирование

---

## Git

Один коммит:
```
feat: word-level mastery/condition, card evolution, visual wear effects
```

---

## Критерии готовности

1. Таблица `WordProgress` создана, данные мигрированы
2. Мастерство привязано к слову — ответ на квиз по "casa" повышает мастерство для ВСЕХ карт "casa"
3. Ветхость привязана к слову — все карты одного слова деградируют/восстанавливаются вместе
4. `dominatedCount` считает уникальные освоенные слова (не экземпляры карт)
5. Эволюция работает: освоил слово → заплатил Пыль → карта получает `isEvolved=true`, +20% статов, мастерство сброшено
6. Визуал ветхости: Worn — потёртости, Deteriorated — трещины+выцветание, Brilliant — свечение
7. `npm -C backend run build` ✅
8. `npm -C frontend run build` ✅
9. Seed + бой + рейд работают корректно
