# TASK-005: Прогрессия и экономика (Polvo, распыление, мастерство, ветхость)

## Цель

Реализовать экономическую систему и прогрессию: валюта Polvo, распыление дубликатов, визуальное мастерство карт, система ветхости по времени, разблокировка пулов рарности. Крафт карточек (AI-генерация) — **не** в этой задаче, будет отдельно.

Результат: игрок зарабатывает Polvo в боях и через распыление, видит прогресс мастерства на картах, карты деградируют без использования, бустеры ограничены по рарности в зависимости от количества освоенных карт.

---

## 1. Backend: модель игрока (Player)

Сейчас в системе нет понятия "игрок". Добавить минимальную модель (без авторизации — один условный игрок).

### Prisma-схема

Добавить модель `Player`:

```prisma
model Player {
  id        String   @id @default(uuid())
  name      String   @default("Player")
  polvo     Int      @default(0)
  createdAt DateTime @default(now())
  cards     Card[]
}
```

Обновить модель `Card` — добавить связь с игроком:

```prisma
model Card {
  // ... существующие поля ...
  playerId String?
  player   Player? @relation(fields: [playerId], references: [id])
}
```

Создать seed для дефолтного игрока. Все существующие и новые карты привязывать к этому игроку.

### API: GET /api/player

Возвращает данные игрока:
```json
{
  "id": "uuid",
  "name": "Player",
  "polvo": 150,
  "dominatedCount": 3,
  "level": "Principiante",
  "nextLevel": "Elemental",
  "progressToNext": 3,
  "progressNeeded": 30,
  "unlockedRarities": ["C"]
}
```

### Структура

```
backend/src/modules/player/
├── player.routes.ts
├── player.service.ts
└── player.types.ts
```

---

## 2. Backend: распыление карточек

### POST /api/cards/:cardId/disintegrate

Уничтожает карточку, начисляет Polvo игроку.

Таблица Polvo за распыление (из GDD):
- C → 5 Polvo
- UC → 15 Polvo
- R → 50 Polvo
- SR → 200 Polvo
- SSR → 1000 Polvo

Логика:
1. Найти карту по ID, проверить что она существует
2. Определить рарность через связь Card → Word
3. Удалить карту из БД
4. Начислить Polvo игроку
5. Вернуть: `{ polvoGained: 15, totalPolvo: 165 }`

Добавить константы в `shared/constants.ts`:
```typescript
export const POLVO_PER_DISINTEGRATE: Record<string, number> = {
  C: 5, UC: 15, R: 50, SR: 200, SSR: 1000,
};
```

---

## 3. Backend: мастерство — обновление после боя

Мастерство уже обновляется в battle.service (TASK-003). Проверить и убедиться:
- При правильном ответе в бою: `masteryProgress += 1` (максимум 5)
- Когда `masteryProgress` достигает 5 — карта считается "Dominada"
- Dominada учитывается в счётчике для разблокировки пулов

Если это уже работает — ничего менять не нужно. Если нет — добавить.

---

## 4. Backend: ветхость (автоматическая деградация)

### Логика деградации

Состояние карточки определяется по полю `lastUsedAt`:
- Если `lastUsedAt` < 3 дней назад → Gastada
- Если `lastUsedAt` < 7 дней назад → Deteriorada
- Иначе сохраняется текущее состояние

**Важно:** не обновлять `condition` в БД по крону. Вместо этого — вычислять состояние **на лету** при запросе. Добавить утилиту:

```
backend/src/shared/condition.ts
```

```typescript
export function computeCondition(card: { condition: string; lastUsedAt: Date }): string {
  const now = Date.now();
  const last = new Date(card.lastUsedAt).getTime();
  const daysSinceUse = (now - last) / (1000 * 60 * 60 * 24);

  if (daysSinceUse >= 7) return "Deteriorada";
  if (daysSinceUse >= 3) return "Gastada";
  return card.condition; // Brillante или Normal — не деградируют до 3 дней
}
```

Применять `computeCondition` во всех местах, где отдаём карту клиенту (cards.generator.ts → mapCardToDto, listCards, и т.д.).

### Восстановление состояния

При правильном ответе в бою — состояние улучшается на 1 ступень:
- Deteriorada → Gastada
- Gastada → Normal
- Normal → Brillante

Обновить `lastUsedAt = now()` и `condition` в БД при использовании карты в бою.

---

## 5. Backend: разблокировка пулов рарности

### Уровни прогрессии (из GDD)

```typescript
export const PROGRESSION_LEVELS = [
  { name: "Principiante", minDominated: 0, rarities: ["C"] },
  { name: "Elemental", minDominated: 30, rarities: ["C", "UC"] },
  { name: "Intermedio", minDominated: 80, rarities: ["C", "UC", "R"] },
  { name: "Avanzado", minDominated: 150, rarities: ["C", "UC", "R", "SR"] },
  { name: "Maestro", minDominated: 250, rarities: ["C", "UC", "R", "SR", "SSR"] },
] as const;
```

### Фильтрация бустеров

Обновить `boosters.service.ts`:
1. Подсчитать количество Dominada карт игрока (`masteryProgress >= 5`)
2. Определить текущий уровень прогрессии
3. Получить список доступных рарностей
4. В `rollRarity` передавать только доступные рарности (этот параметр уже поддерживается — `allowed`)
5. При выборе слова из пула — фильтровать по доступным рарностям

---

## 6. Frontend: отображение Polvo и прогрессии

### TopNav — показать Polvo

В навигации (TopNav) справа добавить отображение баланса Polvo:
```
LangGacha  Prototype          Бустер  Бой  Коллекция    ✨ 150 Polvo
```

Данные подтягивать из GET /api/player. Для обновления после действий (распыление, бой) — либо refetch, либо локальное обновление state.

### Коллекция — Dominada визуал

На CardMini и CardFace: если `masteryProgress >= 5` — показать штамп "✓ Dominada" (полупрозрачный поверх карточки или маркер в углу).

### Коллекция — кнопка "Распылить"

Кнопка "Распылить" в модалке группы (CardGroupModal) — сделать **активной** (убрать `disabled`):
- При клике — запрос POST /api/cards/:id/disintegrate
- Показать сколько Polvo получено (маленькое уведомление)
- Убрать карту из списка
- Обновить баланс Polvo в TopNav

Также: в модалке одиночной карточки (CardModal) добавить кнопку "Распылить" с подтверждением (alert или инлайн-confirm).

### Коллекция — прогресс-бар уровня

Над фильтрами в CollectionPage показать блок прогрессии:
```
Уровень: Principiante → Elemental | Освоено: 3/30 | ████░░░░░░ 10%
```

### Страница бустера — визуал пака по уровню

В BoosterPack показывать название текущего пака: "Пак Новичка", "Пак Повседневного" и т.д. Цвет пака зависит от уровня.

---

## 7. Frontend: обновление API-клиента

```
frontend/src/api/player.ts   # GET /api/player
```

Обновить `frontend/src/api/cards.ts` — добавить `disintegrateCard(cardId)`.

---

## 8. Структура новых файлов

```
backend/src/modules/player/
├── player.routes.ts
├── player.service.ts
└── player.types.ts

backend/src/shared/
├── condition.ts              # computeCondition()
├── constants.ts              # обновить: POLVO_PER_DISINTEGRATE, PROGRESSION_LEVELS

frontend/src/api/
├── player.ts                 # НОВЫЙ

frontend/src/components/layout/
├── TopNav.tsx                # ИЗМЕНИТЬ: Polvo баланс

frontend/src/pages/
├── CollectionPage.tsx        # ИЗМЕНИТЬ: прогресс-бар
├── BoosterPage.tsx           # ИЗМЕНИТЬ: название пака по уровню
```

---

## 9. Git

Один коммит:
```
feat: progression system — Polvo economy, disintegration, mastery, wear, pool unlocking
```

---

## Критерии готовности

1. GET /api/player возвращает данные игрока с Polvo, уровнем, прогрессом
2. POST /api/cards/:id/disintegrate удаляет карту и начисляет Polvo
3. Ветхость вычисляется на лету — карта не использованная 3+ дней показывается как Gastada
4. Правильный ответ в бою восстанавливает состояние на 1 ступень
5. Бустеры ограничены по рарности согласно уровню прогрессии
6. В TopNav виден баланс Polvo
7. Кнопка "Распылить" работает в модалке группы и одиночной карты
8. Прогресс-бар уровня виден на странице коллекции
9. Карты с masteryProgress=5 визуально помечены как Dominada
10. Пак бустера показывает название по уровню
11. `docker compose up` — всё работает
