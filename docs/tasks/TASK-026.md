# TASK-026: Починить урон + адаптивный рейд-босс + UC+ гарантия + pity-fix

**Важно:** все предыдущие задачи (TASK-001–025) уже выполнены и проверены. Не нужно их восстанавливать. Путь к этому файлу: `docs/tasks/TASK-026.md`.

## Контекст

Четыре проблемы с балансом:
1. Урон в боях = 1 из-за формулы
2. Рейд-босс не адаптируется к силе игрока
3. Нет гарантии UC+ в бустере для начинающих
4. Pity SR+ не срабатывает если SR не разблокирован

---

## 1. Починить формулу урона

### Проблема
`damage = max(1, ATK - DEF * 0.5)` — если DEF высокий, урон 1.

### Решение

В `backend/src/shared/combat.ts` заменить `computeDamage`:

```typescript
import { DEF_SCALING_FACTOR } from "./constants.js";

export const computeDamage = (attackerAtk: number, defenderDef: number): number => {
  const reduction = defenderDef / (defenderDef + DEF_SCALING_FACTOR);
  const dmg = attackerAtk * (1 - reduction);
  return Math.max(1, Math.round(dmg));
};
```

В `backend/src/shared/constants.ts` добавить:
```typescript
export const DEF_SCALING_FACTOR = 200;
```

Примеры:
- ATK 300 vs DEF 300: 300 × (1 - 300/500) = 300 × 0.4 = **120**
- ATK 300 vs DEF 2880: 300 × (1 - 2880/3080) = 300 × 0.065 = **19**
- ATK 2600 vs DEF 2880: 2600 × 0.065 = **169**

---

## 2. Рейд-босс — адаптивный к силе игрока

### Проблема
Босс генерируется из слов R/SR/SSR с фиксированными статами по рарности слова. Игрок с Common-картами (ATK ~300) бьёт босса с DEF ~2880 — нереально даже с новой формулой (19 урона × ~5 карт выживших = ~100, а HP босса ~14000).

### Решение

Переделать `backend/src/modules/raid/raid.boss.ts` — генерация босса должна учитывать среднюю силу карт игрока.

Вместо фиксированных статов по рарности слова:

```typescript
export const generateRaidBoss = async (date: string, playerId?: string) => {
  // Слово босса — по-прежнему предпочитаем R/SR/SSR для интереса
  const preferred = ["R", "SR", "SSR"];
  const preferredCount = await prisma.word.count({ where: { rarity: { in: preferred } } });
  const word = preferredCount > 0
    ? await pickRandomWord({ rarity: { in: preferred } })
    : await pickRandomWord();

  // Адаптация к силе игрока
  let avgPlayerAtk = 300; // дефолт для нового игрока
  let avgPlayerDef = 300;

  if (playerId) {
    const playerCards = await prisma.card.findMany({
      where: { playerId },
      select: { atk: true, def: true },
      orderBy: { atk: "desc" },
      take: 20, // топ-20 карт
    });
    if (playerCards.length > 0) {
      avgPlayerAtk = Math.round(playerCards.reduce((s, c) => s + c.atk, 0) / playerCards.length);
      avgPlayerDef = Math.round(playerCards.reduce((s, c) => s + c.def, 0) / playerCards.length);
    }
  }

  // Рандом: босс от 0.7x до 1.5x силы игрока
  const difficultyMultiplier = 0.7 + Math.random() * 0.8; // 0.7–1.5

  const bossDef = Math.round(avgPlayerAtk * difficultyMultiplier * 1.2);
  const bossAtk = Math.round(avgPlayerDef * difficultyMultiplier * 0.4);
  // HP: чтобы бой длился ~10-15 карт при средней силе колоды
  const bossHp = Math.round(avgPlayerAtk * difficultyMultiplier * 8);

  return prisma.raidDay.create({
    data: {
      date,
      bossWord: word.word,
      bossHp,
      currentHp: bossHp,
      bossAtk,
      bossDef,
      bossRarity: word.rarity,
      bossType: word.type,
      bossFlavorText: word.flavorText ?? "",
    },
  });
};
```

### Ключевые моменты:
- Босс масштабируется по **топ-20 картам игрока** (не всем, а лучшим — игрок выберет их для рейда)
- `difficultyMultiplier 0.7–1.5` — иногда лёгкий босс, иногда сложный
- **HP** рассчитан так, чтобы для победы нужно ~10-15 карт (из 20 доступных)
- **ATK** босса = 40% от среднего DEF игрока × множитель — босс больно бьёт, но не убивает с одного удара
- **DEF** босса = 120% от среднего ATK игрока × множитель — карты наносят ощутимый, но не огромный урон

### Обновить вызов

В `backend/src/modules/raid/raid.service.ts` функция `getOrCreateTodayRaidDay` сейчас вызывает `generateRaidBoss(date)` без playerId. Нужно:

1. Добавить `playerId` параметр в `getOrCreateTodayRaidDay`
2. Пробросить его в `generateRaidBoss`
3. Обновить все вызовы `getOrCreateTodayRaidDay` — они уже получают playerId из контекста

Если рейд создаётся впервые (первый игрок зашёл) — использовать его playerId. Если рейд уже существует — статы босса не меняются.

---

## 3. Гарантия UC+ в каждом бустере

### Текущее состояние
В `boosters.service.ts` есть UC+ гарантия, но только если UC разблокирован (`hasUcPlusUnlocked`). Для Beginner (только C) — не работает.

### Решение
Убрать проверку `hasUcPlusUnlocked`. UC+ должен выпадать ВСЕГДА, даже если у игрока разблокирован только C.

Изменить логику (строки ~45-51):
```typescript
// Гарантия UC+ в каждом бустере — ВСЕГДА, без проверки разблокировки
const hasUcPlusRolled = rolledRarities.some((r) => r !== "C");
if (!hasUcPlusRolled) {
  // Форсируем хотя бы UC на последнюю позицию
  rolledRarities[4] = "UC";
}
```

Это значит: даже Beginner получит UC-карту в каждом бустере. UC-слова в seed-пуле есть (45 штук), так что `generateCardFromPool` найдёт слово.

---

## 4. Pity SR+ — починить для игроков без разблокированного SR

### Проблема
Условие `shouldForceSrPlus` требует `hasSrUnlocked`. Если игрок на уровне Beginner/Elementary/Intermediate — SR не разблокирован, pity не срабатывает, но счётчик растёт бесконечно. UI показывает "10/10" и ничего не происходит.

### Решение

Pity SR+ должен работать для ВСЕХ игроков, как и UC+ гарантия:

```typescript
const shouldForceSrPlus =
  pityCounter >= PITY_THRESHOLD - 1 &&
  !rolledRarities.some((r) => r === "SR" || r === "SSR");

if (shouldForceSrPlus) {
  rolledRarities[4] = "SR"; // Форсируем SR
}
```

Убрать проверки `hasSrUnlocked` и `srPlusAllowed` из этого блока.

---

## 5. Config API

В `backend/src/modules/config/config.routes.ts` добавить `defScalingFactor: DEF_SCALING_FACTOR`.

---

## Git

Один коммит:
```
fix: damage formula (diminishing returns), adaptive raid boss, guaranteed UC+ and pity SR+ for all players
```

---

## Критерии готовности

1. Common vs Common бой — урон ~120, не 1
2. Рейд-босс адаптируется к силе карт игрока
3. Рейд побеждаем за ~10-15 карт при среднем мультипликаторе
4. При мультипликаторе 1.5 — сложно, но реально (все 20 карт)
5. Каждый бустер содержит UC+ карту, даже для новичков
6. Pity SR+ срабатывает после 10 бустеров для ВСЕХ игроков
7. `npm -C backend run build` ✅
8. Проверить бой и рейд — урон адекватный
