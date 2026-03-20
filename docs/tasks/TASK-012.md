# TASK-012: Крафт карточек + микробаг в booster routes

## Цель

Два блока:
1. **Крафт** — потратить Dust → получить карту гарантированной рарности
2. **Микрофикс** — убрать бессмысленный тернар в booster routes

---

## 0. Микрофикс

В `backend/src/modules/boosters/boosters.routes.ts` есть строка:
```typescript
reply.code(noBoosters ? 400 : 400)
```

Заменить на просто `reply.code(400)`.

---

## 1. Крафт — бэкенд

### Концепция

Игрок тратит Dust и получает **одну случайную карту** выбранной рарности из пула. Это не AI-крафт (будет позже) — просто целенаправленная покупка карты нужной рарности.

### Стоимость (из GDD)

В `backend/src/shared/constants.ts` добавить:
```typescript
export const DUST_PER_CRAFT: Record<string, number> = {
  C: 30,
  UC: 60,
  R: 150,
  SR: 400,
  SSR: 1500,
};
```

### Ограничения

- Рарность должна быть **разблокирована** у игрока (нельзя крафтить SSR на уровне Beginner)
- Dust >= стоимости
- Лимит: **1 крафт в день** (из GDD). Добавить в Player:
  ```prisma
  lastCraftAt  DateTime?  // null = никогда не крафтил
  ```
  Проверка: если `lastCraftAt` — сегодня (тот же календарный день), то крафт недоступен.

### Сервис

Создать `backend/src/modules/craft/craft.service.ts`:

```typescript
export const craftCard = async (rarity: string): Promise<CraftResult>
```

1. Получить `playerDto` (для dust, unlockedRarities, id)
2. Проверить: рарность разблокирована → иначе ошибка "Rarity not unlocked"
3. Проверить: dust >= DUST_PER_CRAFT[rarity] → иначе ошибка "Not enough Dust"
4. Проверить: lastCraftAt не сегодня → иначе ошибка "Daily craft limit reached"
5. Списать Dust: `addDust(playerId, -cost)` (отрицательный increment)
6. Обновить `lastCraftAt = new Date()`
7. Сгенерировать карту: `generateCardFromPool({ rarity, playerId })`
8. Вернуть: `{ card, dustSpent, dustRemaining, nextCraftAt }`

Тип:
```typescript
export type CraftResult = {
  card: GeneratedCard;
  dustSpent: number;
  dustRemaining: number;
  nextCraftAt: string; // ISO — начало следующего дня
};
```

### Роуты

Создать `backend/src/modules/craft/craft.routes.ts`:

- `POST /api/craft` — body: `{ rarity: string }` → возвращает CraftResult
- `GET /api/craft/status` — возвращает `{ available: boolean, nextCraftAt: string | null, costs: Record<string, number> }`

Зарегистрировать в основном app (как `/api/craft`).

### PlayerDto

Добавить в PlayerDto:
```typescript
craftAvailable: boolean;
nextCraftAt: string | null; // ISO — когда будет доступен следующий крафт
```

---

## 2. Крафт — фронтенд

### API

Создать `frontend/src/api/craft.ts`:
```typescript
export type CraftStatus = {
  available: boolean;
  nextCraftAt: string | null;
  costs: Record<string, number>;
};

export type CraftResult = {
  card: GeneratedCard;
  dustSpent: number;
  dustRemaining: number;
  nextCraftAt: string;
};

export const getCraftStatus = async (): Promise<CraftStatus>;
export const craftCard = async (rarity: string): Promise<CraftResult>;
```

### Страница крафта

Создать `frontend/src/pages/CraftPage.tsx` + роут `/craft` в App.tsx + ссылка в TopNav.

**Layout:**

```
┌─────────────────────────────────────────┐
│ Крафт                                    │
│ Выбери рарность и создай карту           │
│                                          │
│ Dust: 450                                │
│                                          │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│ │ C  │ │ UC │ │ R  │ │ SR │ │SSR │      │
│ │ 30 │ │ 60 │ │150 │ │400 │ │1500│      │
│ └────┘ └────┘ └────┘ └────┘ └────┘      │
│                                          │
│        [Создать карту]                   │
│                                          │
│ Крафтов сегодня: 0/1                     │
│ (или: Следующий через: HH:MM:SS)        │
└─────────────────────────────────────────┘
```

### Компоненты

1. **Выбор рарности** — 5 кнопок (C/UC/R/SR/SSR):
   - Каждая показывает стоимость в Dust
   - Заблокированные рарности (не разблокированы у игрока) — disabled, серые, с замком
   - Недоступные по Dust — disabled, красноватые, "Не хватает Dust"
   - Выбранная — подсвечена цветом рарности (из RARITY_THEMES.border)

2. **Кнопка "Создать карту"** — disabled если:
   - Рарность не выбрана
   - Не хватает Dust
   - Крафт использован сегодня
   - Рарность не разблокирована

3. **После крафта** — показать результат:
   - Карточка (CardFace) с анимацией появления
   - "−150 Dust"
   - Кнопка "В коллекцию" (ведёт на /collection)
   - Обновить PlayerContext (refresh)

4. **Лимит** — если крафт использован, показать:
   - "Крафт использован сегодня"
   - Таймер до полуночи: "Следующий через: HH:MM:SS"

### TopNav

Добавить ссылку "Крафт" в навигацию (между "Бой" и "Коллекция" или после "Коллекция").

---

## 3. Git

Один коммит:
```
feat: card crafting (pick rarity, spend Dust, 1/day limit)
```

---

## Критерии готовности

1. Микрофикс: бессмысленный тернар в booster routes убран
2. `POST /api/craft` принимает `{ rarity }`, списывает Dust, возвращает карту
3. `GET /api/craft/status` возвращает доступность, стоимости, время до следующего крафта
4. Проверки: рарность разблокирована, хватает Dust, не крафтил сегодня
5. Player.lastCraftAt в Prisma-схеме
6. PlayerDto: craftAvailable, nextCraftAt
7. UI: страница /craft с выбором рарности, стоимостью, кнопкой, лимитом
8. Заблокированные/недоступные рарности визуально отличаются
9. После крафта — показ карточки, обновление баланса
10. Ссылка "Крафт" в TopNav
11. `docker compose up` — всё работает
