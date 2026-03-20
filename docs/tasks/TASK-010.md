# TASK-010: Цвет карточек по рарности + системные термины FUE→ATK, Polvo→Dust

## Цель

Два блока:
1. Цветовая палитра карточек: **рарность определяет цвет карты и обводку**, тип — только плашка/бейдж
2. Переименование испанских терминов: FUE→ATK, Polvo→Dust в системе (API, DB, код), русские лейблы на UI

**Порядок:** сначала переименование (блок 2, рефакторинг), потом цвета (блок 1, визуал).

---

## 1. Переименование: FUE→ATK, Polvo→Dust

### Что менять

Все системные упоминания `fue` и `polvo` переименовать:
- `fue` → `atk` (attack)
- `Polvo` / `polvo` → `Dust` / `dust`

`DEF` уже на английском — оставить как есть.

### Бэкенд

1. **Prisma-схема** (`backend/src/db/prisma/schema.prisma`):
   - `Word.baseFue` → `Word.baseAtk`
   - `Card.fue` → `Card.atk`
   - `Player.polvo` → `Player.dust`
   - После изменения: `npx prisma db push` (или создать миграцию)

2. **`backend/scripts/seed.ts`**:
   - Все `baseFue` → `baseAtk` в данных слов
   - Все `polvo` → `dust`

3. **`backend/src/shared/constants.ts`**:
   - `POLVO_PER_RARITY_BATTLE` → `DUST_PER_RARITY_BATTLE`
   - `POLVO_PER_DISINTEGRATE` → `DUST_PER_DISINTEGRATE`
   - `CORRECT_ANSWER_POLVO` → `CORRECT_ANSWER_DUST`
   - `INSPIRATION_BONUS` — оставить как есть
   - `rollStat` — не меняется (внутренняя логика)

4. **`backend/src/modules/cards/cards.generator.ts`**:
   - `card.fue` → `card.atk` в mapCardToDto и createCardFromWord

5. **`backend/src/modules/cards/cards.types.ts`**:
   - Поля fue → atk в типах

6. **`backend/src/modules/battle/battle.types.ts`**:
   - `BattleCard.fue` → `BattleCard.atk`

7. **`backend/src/modules/battle/battle.service.ts`**:
   - Все `fue` → `atk`

8. **`backend/src/modules/battle/battle.bot.ts`**:
   - Все `fue` → `atk`

9. **`backend/src/modules/battle/battle.combat.ts`**:
   - Все `fue` → `atk`

10. **`backend/src/modules/battle/battle.rewards.ts`**:
    - `polvo` → `dust`

11. **`backend/src/modules/player/player.service.ts`**:
    - `addPolvo` → `addDust`, `player.polvo` → `player.dust`

12. **`backend/src/modules/player/player.types.ts`**:
    - `polvo` → `dust`

13. **`backend/src/modules/cards/cards.service.ts`** (disintegrate):
    - `polvoGained` → `dustGained`, `totalPolvo` → `totalDust`

14. **Routes** — если в ответах есть polvo/fue, обновить

### Фронтенд

1. **`frontend/src/types/card.ts`**:
   - `fue` → `atk`

2. **`frontend/src/api/cards.ts`**:
   - `polvoGained` → `dustGained`, `totalPolvo` → `totalDust`

3. **`frontend/src/api/player.ts`**:
   - `polvo` → `dust`

4. **`frontend/src/api/battle.ts`**:
   - `polvo` → `dust` в типах ответов

5. **`frontend/src/shared/labels.ts`**:
   - Обновить TOOLTIPS: `fue` → `atk`
   - `POLVO_PER_DISINTEGRATE` → `DUST_PER_DISINTEGRATE`
   - Добавить русские лейблы:
     ```typescript
     export const STAT_LABELS = {
       atk: "Атака",
       def: "Защита",
     };
     export const CURRENCY_LABEL = "Пыль"; // для UI отображения Dust
     ```

6. **Все компоненты** где отображается `FUE` → `ATK`, `Polvo` → `Dust`:
   - CardMini, CardFace — `FUE {card.fue}` → `ATK {card.atk}`, на UI через лейбл можно отображать "АТК" или "ATK"
   - TopNav — "Polvo" → "Dust" (отображать по-русски "Пыль" через лейбл)
   - CollectionPage — toast "+N Polvo" → "+N Dust"
   - BattleResult — награды polvo → dust
   - ConfirmDialog (распыление) — "N Polvo" → "N Dust"
   - CollectionFilters — сортировка "По силе (FUE)" → "По силе (ATK)"
   - DeckSelect — если есть упоминания

**Важно:** на UI можно показывать английские ATK/DEF/Dust (короткие, геймерские, интернациональные). Русские лейблы "Атака"/"Защита"/"Пыль" использовать в тултипах. Это как в гачах: ATK/DEF — стандартные аббревиатуры, которые понятны без перевода.

---

## 2. Цветовая палитра карточек — рарность = цвет

### Текущее состояние

Сейчас в `card-themes.ts`:
- `TYPE_THEMES` — задаёт `color` (цвет обводки), `gradient` (фон арт-области), `emoji`
- `RARITY_THEMES` — задаёт только `badge` (цвет бейджа), `glow` (тень), `frameFx`

Карточка визуально определяется **типом** (обводка + градиент), а рарность только тонкая полоска сверху + бейдж. Это неправильно — **рарность должна быть главным визуальным отличием**.

### Что нужно

Переключить роли:
- **Рарность** → определяет обводку карты, фон/градиент, свечение
- **Тип** → маленькая плашка с иконкой и текстом (как сейчас бейдж рарности)

### Изменения в `frontend/src/styles/card-themes.ts`

**`RARITY_THEMES`** — расширить, добавить цвет обводки и градиент:

```typescript
export const RARITY_THEMES = {
  C: {
    badge: "#9E9E9E",
    border: "#6B7280",         // серая обводка
    gradient: "from-slate-600/30 via-slate-500/10 to-slate-950",
    glow: "shadow-black/40",
    frameFx: "",
  },
  UC: {
    badge: "#66BB6A",
    border: "#4CAF50",         // зелёная обводка
    gradient: "from-emerald-600/30 via-emerald-400/10 to-slate-950",
    glow: "shadow-emerald-500/20",
    frameFx: "shadow-lg",
  },
  R: {
    badge: "#42A5F5",
    border: "#2196F3",         // синяя обводка
    gradient: "from-blue-600/30 via-blue-400/10 to-slate-950",
    glow: "shadow-sky-500/25",
    frameFx: "shadow-xl",
  },
  SR: {
    badge: "#FFC107",
    border: "#FFB300",         // золотая обводка
    gradient: "from-amber-500/30 via-yellow-400/10 to-slate-950",
    glow: "shadow-amber-400/30",
    frameFx: "shadow-2xl",
  },
  SSR: {
    badge: "#AB47BC",
    border: "#9C27B0",         // фиолетовая обводка
    gradient: "from-fuchsia-600/30 via-purple-400/10 to-slate-950",
    glow: "shadow-fuchsia-500/35",
    frameFx: "shadow-2xl card-holo",
  },
};
```

**`TYPE_THEMES`** — оставить `emoji` и `color`, но `color` теперь используется только для маленькой плашки типа, **не для обводки карты**.

### Изменения в CardMini (`frontend/src/components/card/CardMini.tsx`)

Сейчас:
- Обводка: `style={{ borderColor: typeTheme.color }}` → заменить на `rarityTheme.border`
- Градиент арт-области: `typeTheme.gradient` → `rarityTheme.gradient`
- Полоска сверху (h-2): оставить или убрать (обводка уже показывает рарность)

После:
- Обводка карты = рарность
- Арт-область = градиент рарности + emoji типа по центру (emoji остаётся от TYPE_THEMES)
- Тип показывается текстом в шапке карты (уже есть)
- Рарность показывается текстом в шапке + визуально через обводку/градиент

### Изменения в CardFace (`frontend/src/components/card/CardFace.tsx`)

Аналогично CardMini:
- Обводка: `typeTheme.color` → `rarityTheme.border`
- Градиент верхней зоны: `typeTheme.gradient` → `rarityTheme.gradient`
- Emoji типа в центре — оставить
- Бейдж рарности с цветом — оставить
- Бейдж типа — оставить как есть (текст + иконка)

### Изменения в CollectionGrid (`frontend/src/components/collection/CollectionGrid.tsx`)

Тени стопки дубликатов: если используется цвет типа, заменить на рарность. Проверь — скорее всего не затронуто.

### Изменения в DeckSelect

Sticky bar мини-слоты: если используется цвет обводки, заменить на рарность.

---

## 3. Git

Два коммита:
```
refactor: rename fue→atk, polvo→dust across backend and frontend
feat: card color palette based on rarity instead of type
```

---

## Критерии готовности

1. API возвращает `atk` вместо `fue`, `dust` вместо `polvo`
2. DB-поля переименованы: `Word.baseAtk`, `Card.atk`, `Player.dust`
3. Все константы/типы/сервисы на бэкенде используют atk/dust
4. Фронтенд отображает ATK/DEF вместо FUE/DEF
5. Фронтенд отображает Dust вместо Polvo (в навбаре "Пыль" или "Dust")
6. Тултипы обновлены (ATK = "Сила атаки карты", Dust = "Валюта для крафта...")
7. Обводка карточки = цвет рарности (серый C, зелёный UC, синий R, золотой SR, фиолетовый SSR)
8. Градиент арт-области = рарность
9. Тип показан только текстом/плашкой, не определяет цвет карты
10. `docker compose up` — всё работает, данные мигрированы
