# TASK-006: Core UX — бустер по одной, CardMini с артом, системный язык → английский, UI → русский

## Цель

Четыре блока изменений:
1. **Системный язык → английский:** все внутренние ID, API, константы, seed-данные перевести с испанского на английский
2. **UI-термины → русский:** маппинг английских ID на русские лейблы для отображения
3. **Бустер по одной карте:** гача-ощущение — рубашка → переворот → следующая
4. **CardMini с арт-областью:** подготовка под AI-изображения

**Порядок выполнения:** сначала рефакторинг языка (блоки 1-2), потом UX (блоки 3-4). Так безопаснее — не мешаем рефакторинг строк с новым функционалом.

---

## 1. Рефакторинг: системный язык → английский

### Что менять

Все строковые константы, которые сейчас на испанском, перевести на английский. Это затрагивает и бэкенд, и фронтенд, и seed-данные.

#### Типы карт

| Было (испанский) | Стало (английский) |
|---|---|
| Persona | Person |
| Lugar | Place |
| Acción | Action |
| Objeto | Object |
| Emoción | Emotion |
| Expresión | Expression |

#### Состояния карт

| Было | Стало |
|---|---|
| Brillante | Brilliant |
| Normal | Normal |
| Gastada | Worn |
| Deteriorada | Deteriorated |

#### Уровни прогрессии

| Было | Стало |
|---|---|
| Principiante | Beginner |
| Elemental | Elementary |
| Intermedio | Intermediate |
| Avanzado | Advanced |
| Maestro | Master |

#### Боевые термины

| Было | Стало |
|---|---|
| Inspiración | Inspiration |

### Где менять (бэкенд)

1. **`backend/src/shared/constants.ts`** — PROGRESSION_LEVELS (name), CONDITION_MODIFIERS (ключи)
2. **`backend/src/shared/condition.ts`** — строки состояний
3. **`backend/scripts/seed.ts`** — поле `type` для каждого слова: `"Persona"` → `"Person"`, `"Acción"` → `"Action"` и т.д. Поле `condition` default в Prisma
4. **`backend/src/db/prisma/schema.prisma`** — `@default("Normal")` — ОК, остаётся "Normal"
5. **`backend/src/modules/cards/cards.generator.ts`** — rollCondition возвращает "Brilliant" вместо "Brillante"
6. **`backend/src/modules/battle/battle.service.ts`** — если есть ссылки на состояния/типы
7. **`backend/src/modules/battle/battle.types.ts`** — CardCondition тип
8. **`backend/src/modules/cards/cards.types.ts`** — CardCondition тип
9. **`backend/src/modules/player/player.types.ts`** — PlayerLevelName тип

### Где менять (фронтенд)

1. **`frontend/src/types/card.ts`** — CardCondition тип
2. **`frontend/src/styles/card-themes.ts`** — ключи TYPE_THEMES и RARITY_THEMES (типы уже как ключи)
3. Все компоненты, которые сравнивают строки типов/состояний

### Миграция данных в БД

Существующие данные в PostgreSQL содержат испанские значения. Нужно обновить:

```sql
-- Обновить типы в таблице Word
UPDATE "Word" SET type = 'Person' WHERE type = 'Persona';
UPDATE "Word" SET type = 'Place' WHERE type = 'Lugar';
UPDATE "Word" SET type = 'Action' WHERE type = 'Acción';
UPDATE "Word" SET type = 'Object' WHERE type = 'Objeto';
UPDATE "Word" SET type = 'Emotion' WHERE type = 'Emoción';
UPDATE "Word" SET type = 'Expression' WHERE type = 'Expresión';

-- Обновить состояния в таблице Card
UPDATE "Card" SET condition = 'Brilliant' WHERE condition = 'Brillante';
UPDATE "Card" SET condition = 'Worn' WHERE condition = 'Gastada';
UPDATE "Card" SET condition = 'Deteriorated' WHERE condition = 'Deteriorada';
-- Normal остаётся Normal
```

**Лучший способ:** добавить эту миграцию в seed.ts (в конце, после upsert слов) или создать отдельный скрипт миграции `scripts/migrate-to-english.ts`. Также обновить значение `@default` в Prisma-схеме для condition.

**Важно:** после изменения seed.ts — перезапуск `db:setup` должен корректно обновить все записи (upsert уже есть).

---

## 2. UI-маппинг: английский → русский

Создать файл лейблов:

```
frontend/src/shared/labels.ts
```

```typescript
export const LEVEL_LABELS: Record<string, string> = {
  Beginner: "Начинающий",
  Elementary: "Базовый",
  Intermediate: "Средний",
  Advanced: "Продвинутый",
  Master: "Мастер",
};

export const CONDITION_LABELS: Record<string, string> = {
  Brilliant: "Блестящая",
  Normal: "Обычная",
  Worn: "Потёртая",
  Deteriorated: "Ветхая",
};

export const RARITY_LABELS: Record<string, string> = {
  C: "Обычная",
  UC: "Необычная",
  R: "Редкая",
  SR: "Супер редкая",
  SSR: "Легендарная",
};

export const TYPE_LABELS: Record<string, string> = {
  Person: "Персона",
  Place: "Место",
  Action: "Действие",
  Object: "Предмет",
  Emotion: "Эмоция",
  Expression: "Выражение",
};

export const BATTLE_LABELS = {
  inspiration: "Воодушевление",
  mastered: "Освоена",
};

// Хелпер: получить русский лейбл или вернуть исходную строку
export const label = (map: Record<string, string>, key: string): string =>
  map[key] ?? key;
```

### Где применить

1. **CardMini** — тип: `label(TYPE_LABELS, card.type)`, состояние: `label(CONDITION_LABELS, card.condition)`
2. **CardFace** — аналогично
3. **CollectionFilters** — кнопки типов: отображать русское название, но значение фильтра — английский ID
4. **BoosterPage** — уровень: `label(LEVEL_LABELS, player.level)`
5. **BoosterPack** — LEVEL_THEMES: ключи теперь `Beginner`, `Elementary` и т.д.
6. **BattleArena / RoundResult** — `Inspiration` → `Воодушевление`
7. **Штамп Dominada** → `✓ Освоена`
8. **CollectionPage** — прогресс-бар с русскими названиями уровней

---

## 3. Бустер — раскрытие по одной карте

### Фазы бустера

**Фаза "pack"** — как сейчас, кнопка "Открыть бустер".

**Фаза "revealing"** — одна карта по центру экрана:
1. Карта показана **рубашкой** (закрытая)
2. По клику на рубашку — карта **переворачивается** лицом (анимация rotateY, однократно)
3. После раскрытия — карта видна лицом. Внизу:
   - Счётчик "Карта 1 из 5"
   - Кнопка "Следующая →"
   - Для последней карты — кнопка "Готово"
4. Под картой — индикаторы (5 точек)

**Фаза "summary"** — все 5 карт в ряд. Кнопка "Открыть ещё".

### Визуал рубашки

Компонент `CardBackCover.tsx`:
- Размер 340×480 (как CardFace)
- Тёмный фон с градиентом
- Логотип "LG" или "LangGacha" по центру
- Рамка нейтральная (рарность скрыта)

### Структура файлов

```
frontend/src/components/booster/
├── BoosterPack.tsx          # ИЗМЕНИТЬ: ключи LEVEL_THEMES → английские
├── BoosterReveal.tsx        # УДАЛИТЬ или → BoosterSummary.tsx
├── BoosterCardReveal.tsx    # НОВЫЙ: одна карта — рубашка → раскрытие
├── BoosterSummary.tsx       # НОВЫЙ: все 5 карт в ряд
├── CardBackCover.tsx        # НОВЫЙ: рубашка карты

frontend/src/pages/
├── BoosterPage.tsx          # ИЗМЕНИТЬ: фазы pack → revealing → summary
```

### Логика BoosterPage

```typescript
type Phase = "pack" | "revealing" | "summary";

const [currentIndex, setCurrentIndex] = useState(0);
const [revealedFlags, setRevealedFlags] = useState<boolean[]>([false, false, false, false, false]);

// Клик на рубашку → revealedFlags[currentIndex] = true
// "Следующая" → currentIndex++, новая рубашка
// currentIndex === 4 && revealed → "Готово" → фаза summary
```

---

## 4. CardMini — квадратная арт-область

Добавить квадратную область для изображения:

```
┌─────────────────────┐
│ ■■■■■ (рарность)     │
│ ┌─────────────────┐ │
│ │   ⚡ (эмодзи)    │ │  ← арт-область ~110px
│ │   (градиент)    │ │
│ └─────────────────┘ │
│  LABURAR             │
│  работать (сленг)    │
│  FUE 1850  DEF 1200  │
│  Обычная  ●●●○○      │
└─────────────────────────┘
```

Размеры:
- `mini`: 200×320 (было 200×280)
- `deck`: 220×350 (было 220×308)

Арт-область: ~110px высота, градиент по типу, эмодзи по центру. Готово под `<img>`.

---

## 5. Git

Два коммита:
```
refactor: system language from Spanish to English (types, conditions, levels)
feat: booster one-by-one reveal, CardMini art area, Russian UI labels
```

---

## Критерии готовности

1. API возвращает английские значения: type="Action", condition="Brilliant", level="Beginner"
2. Seed-данные используют английские типы
3. Все фронтенд-компоненты отображают русские лейблы (Действие, Блестящая, Начинающий)
4. Бустер: рубашка → клик → переворот → "Следующая →" → summary
5. Счётчик "Карта N из 5" + индикатор точками
6. CardMini имеет квадратную арт-область с градиентом + эмодзи
7. Нет "дыр" — новая высота CardMini учтена в сетках
8. `docker compose up` — всё работает, данные мигрированы
