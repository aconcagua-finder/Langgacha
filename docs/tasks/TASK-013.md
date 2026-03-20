# TASK-013: Dev-эндпоинт сброса + начальный Dust для нового игрока

## Цель

Две вещи для удобства тестирования:
1. **Dev-эндпоинт** для сброса ресурсов игрока (бустеры, крафт, dust)
2. **Начальный Dust** для нового игрока — чтобы можно было сразу попробовать крафт

---

## 1. Dev-эндпоинт сброса

### Зачем

При тестировании нужно быстро сбросить бустеры (заполнить до макс), крафт (разрешить снова), добавить Dust. Без этого приходится ждать таймеры.

### Реализация

Создать `backend/src/modules/dev/dev.routes.ts`:

```typescript
POST /api/dev/reset
```

Body (всё опционально):
```typescript
{
  boosters?: boolean,   // true → сбросить boosterCount до MAX_BOOSTERS, lastBoosterAt = now
  craft?: boolean,      // true → сбросить lastCraftAt до null
  dust?: number,        // установить конкретное количество Dust
  addDust?: number,     // добавить N Dust к текущему
}
```

Ответ: обновлённый PlayerDto.

**Важно:** этот эндпоинт **только для DEV-режима**. Обернуть в проверку:
```typescript
if (process.env.NODE_ENV === "production") {
  throw new Error("Dev endpoints are disabled in production");
}
```

Зарегистрировать в `app.ts` как `/api/dev`.

### Отдельный файл маршрутов

Файл `backend/src/modules/dev/dev.routes.ts` — один файл, без отдельного сервиса (логика простая).

---

## 2. Начальный Dust для нового игрока

### Проблема

Сейчас новый игрок создаётся с `dust: 0`. Чтобы попробовать крафт, нужно сначала нафармить Dust через бустеры и бои. Это долго для первого опыта.

### Решение

В `backend/src/modules/player/player.service.ts`, в `getOrCreateDefaultPlayer()`:

Изменить создание нового игрока:
```typescript
return prisma.player.create({ data: { name: "Player", dust: 100 } });
```

100 Dust — хватает на 1 крафт C-карты (30) или 1 UC (60), но не на R (150). Стимулирует играть дальше.

Также добавить константу в `backend/src/shared/constants.ts`:
```typescript
export const STARTING_DUST = 100;
```

И использовать её при создании.

---

## 3. Git

Один коммит:
```
feat: dev reset endpoint, starting Dust for new players
```

---

## Критерии готовности

1. `POST /api/dev/reset` работает, сбрасывает бустеры/крафт/dust по запросу
2. Dev-эндпоинт заблокирован в production (проверка NODE_ENV)
3. Новый игрок начинает со 100 Dust
4. Константа STARTING_DUST в constants.ts
5. `docker compose up` — всё работает
