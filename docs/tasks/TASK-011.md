# TASK-011: Лимит бустеров — восстановление по таймеру

## Цель

Сейчас бустеры бесконечные — нет экономики. Нужно ввести систему "энергии бустеров": конечное количество, восстанавливаются по таймеру.

**Параметры (начальные, захардкодить как константы — в будущем вынесем в админку):**
- Максимум бустеров: **7**
- Восстановление: **1 бустер каждые 10 минут**
- Начальное количество при создании игрока: **7** (полный запас)

---

## 1. Бэкенд

### 1.1 Prisma-схема

Добавить в модель `Player`:
```prisma
boosterCount   Int      @default(7)    // текущее количество бустеров
lastBoosterAt  DateTime @default(now()) // когда последний раз пересчитывали
```

После изменения: `npx prisma db push`.

### 1.2 Константы

В `backend/src/shared/constants.ts` добавить:
```typescript
export const MAX_BOOSTERS = 7;
export const BOOSTER_RECHARGE_MS = 10 * 60 * 1000; // 10 минут
```

### 1.3 Логика восстановления

Создать `backend/src/modules/boosters/boosters.recharge.ts`:

Функция `rechargeAndGet(playerId: string)`:
1. Прочитать `player.boosterCount` и `player.lastBoosterAt`
2. Вычислить сколько бустеров восстановилось: `Math.floor((now - lastBoosterAt) / BOOSTER_RECHARGE_MS)`
3. Новое количество: `Math.min(MAX_BOOSTERS, boosterCount + recharged)`
4. Обновить `lastBoosterAt` (сдвинуть на `recharged * BOOSTER_RECHARGE_MS`, а не на `now` — чтобы не терять "хвост" времени)
5. Обновить `boosterCount` в БД
6. Вернуть: `{ count, maxBoosters, nextRechargeAt }` — где `nextRechargeAt` = время когда добавится следующий бустер (null если count === max)

### 1.4 Модификация openBooster

В `backend/src/modules/boosters/boosters.service.ts`:
1. В начале `openBooster()`: вызвать `rechargeAndGet(player.id)`
2. Если `count === 0` — бросить ошибку `"No boosters available"`
3. После успешной генерации карт: уменьшить `boosterCount` на 1 (`decrement`)
4. Вернуть вместе с картами информацию о бустерах: `{ cards, boosterInfo: { count, maxBoosters, nextRechargeAt } }`

**Важно:** изменится формат ответа API. Сейчас `POST /api/boosters/open` возвращает массив карт. Теперь должен возвращать объект:
```typescript
{
  cards: GeneratedCard[],
  boosterInfo: {
    count: number,        // сколько осталось после открытия
    maxBoosters: number,  // максимум (7)
    nextRechargeAt: string | null  // ISO timestamp следующего восстановления
  }
}
```

### 1.5 Эндпоинт статуса бустеров

Добавить `GET /api/boosters/status` в `boosters.routes.ts`:
- Вызывает `rechargeAndGet(player.id)`
- Возвращает `{ count, maxBoosters, nextRechargeAt }`

Фронтенд будет вызывать его при загрузке страницы бустера.

### 1.6 PlayerDto

Добавить в `PlayerDto` (и в бэкенд, и на фронтенде):
```typescript
boosterCount: number;
nextBoosterAt: string | null; // ISO timestamp
```

Обновить `getPlayerDto()` — вызвать `rechargeAndGet`, добавить поля в ответ.

---

## 2. Фронтенд

### 2.1 API

Обновить `frontend/src/api/boosters.ts`:
- `openBooster()` теперь возвращает `{ cards: GeneratedCard[], boosterInfo: BoosterInfo }`
- Добавить `getBoosterStatus(): Promise<BoosterInfo>`
- Тип `BoosterInfo = { count: number, maxBoosters: number, nextRechargeAt: string | null }`

Обновить `frontend/src/api/player.ts`:
- `PlayerDto` добавить `boosterCount` и `nextBoosterAt`

### 2.2 BoosterPage

В `frontend/src/pages/BoosterPage.tsx`:

1. **Загрузка статуса** при монтировании: вызвать `getBoosterStatus()`, сохранить в стейт
2. **Счётчик бустеров** в header: "Бустеры: 5/7" (count/max)
3. **Таймер** если count < max: "Следующий через: MM:SS" — обратный отсчёт до `nextRechargeAt`, обновляется каждую секунду через `setInterval`
4. **Кнопка "Открыть бустер"** — disabled если `count === 0`
5. **После открытия**: обновить count из ответа `openBooster()`
6. **Когда таймер доходит до 0**: пересоздать интервал, увеличить `count` на 1 (оптимистично), перезапросить `getBoosterStatus()` для синхронизации

### 2.3 Визуал счётчика

В header BoosterPage, рядом с уровнем:
```
Бустеры: ●●●●●○○  5/7    Следующий: 06:32
```

- Заполненные точки = доступные бустеры (цвет sky-400)
- Пустые точки = использованные (цвет slate-800)
- Таймер обратного отсчёта
- Если count === max: таймер не показывать

### 2.4 Кнопка "Открыть ещё" в summary

Кнопка на странице summary: тоже проверять count > 0. Если 0 — показать "Нет бустеров" + таймер.

---

## 3. Git

Один коммит:
```
feat: booster recharge system (7 max, 10 min per booster, countdown timer)
```

---

## Критерии готовности

1. Player имеет поля `boosterCount` и `lastBoosterAt` в БД
2. Бустеры восстанавливаются: каждые 10 минут +1, максимум 7
3. `POST /api/boosters/open` возвращает `{ cards, boosterInfo }` и уменьшает count
4. `GET /api/boosters/status` возвращает актуальный статус
5. При count === 0 API возвращает ошибку, кнопка disabled
6. UI: счётчик "5/7" + точки + таймер обратного отсчёта
7. Таймер автоматически обновляет счётчик при достижении 0
8. Новый игрок начинает с 7 бустерами
9. `docker compose up` — всё работает
