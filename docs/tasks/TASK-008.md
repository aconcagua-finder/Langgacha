# TASK-008: Распыление с анимацией и confirm-диалогом, тултипы

## Цель

Два блока UX-полировки:
1. Распыление карт: заменить нативный `window.confirm` на кастомный диалог + добавить анимацию исчезновения
2. Тултипы: объяснить игроку ключевые термины (FUE, DEF, состояние, рарность, мастерство, Polvo)

**Порядок выполнения:** сначала тултипы (блок 2, проще), потом распыление (блок 1, сложнее).

---

## 1. Тултипы

### Что нужно

Компонент `Tooltip` — при hover/tap показывает поясняющий текст. Простой, без библиотек.

### Реализация

Создать `frontend/src/components/ui/Tooltip.tsx`:
- Принимает `children` (элемент-триггер) и `text` (текст подсказки)
- По hover (desktop) / tap (mobile) показывает всплывающую подсказку
- Позиционирование: сверху элемента по умолчанию, снизу если не влезает
- Стиль: `bg-slate-950 border border-slate-700/60 text-xs text-slate-200 px-3 py-2 rounded-lg shadow-lg`
- Анимация: fade-in 150ms

### Где применить

1. **CardMini** (`frontend/src/components/card/CardMini.tsx`):
   - FUE: обернуть `<span>FUE {card.fue}</span>` → тултип "Сила атаки карты"
   - DEF: обернуть `<span>DEF {card.def}</span>` → тултип "Защита карты"
   - Состояние (emoji + текст): тултип с пояснением по состоянию:
     - Блестящая: "Свежая карта, бонус к статам"
     - Обычная: "Стандартное состояние"
     - Потёртая: "Давно не использовалась, штраф к статам"
     - Ветхая: "Сильно изношена, большой штраф к статам"
   - Мастерство (●●○○○): тултип "Прогресс освоения: N/5. Ответь правильно в бою для прокачки"
   - Рарность (C/UC/R/SR/SSR): тултип с русским названием из `RARITY_LABELS` (например "Редкая")

2. **CardFace** (`frontend/src/components/card/CardFace.tsx`):
   - Те же тултипы что и в CardMini (FUE, DEF, состояние, мастерство, рарность)

3. **TopNav** (`frontend/src/components/layout/TopNav.tsx`):
   - Polvo баланс: тултип "Валюта для крафта карт. Получай из боёв и распыления"

4. **CollectionPage** (`frontend/src/pages/CollectionPage.tsx`):
   - Прогресс-бар уровня: тултип "Осваивай карты в боях для повышения уровня и открытия новых рарностей"

### Тексты тултипов

Добавить в `frontend/src/shared/labels.ts` объект:

```typescript
export const TOOLTIPS = {
  fue: "Сила атаки карты",
  def: "Защита карты",
  conditionBrilliant: "Свежая карта, бонус к статам",
  conditionNormal: "Стандартное состояние",
  conditionWorn: "Давно не использовалась, штраф к статам",
  conditionDeteriorated: "Сильно изношена, большой штраф к статам",
  mastery: (progress: number) => `Прогресс освоения: ${progress}/5. Ответь правильно в бою для прокачки`,
  polvo: "Валюта для крафта карт. Получай из боёв и распыления",
  levelProgress: "Осваивай карты в боях для повышения уровня и открытия новых рарностей",
};
```

---

## 2. Распыление — кастомный confirm + анимация

### Текущее состояние

- `CardModal.tsx`: нативный `window.confirm("Распылить эту карту? Действие необратимо.")`
- `CardGroupModal.tsx`: тот же `window.confirm`
- `CollectionPage.tsx`: `onDisintegrate` удаляет карту из стейта, показывает toast "+N Polvo" на 1.8 секунды

### Что нужно

#### 2.1 Кастомный confirm-диалог

Создать `frontend/src/components/ui/ConfirmDialog.tsx`:
- Модалка поверх всего (z-40)
- Текст вопроса + описание
- Две кнопки: "Отмена" и "Распылить" (или кастомный текст)
- Для редких карт (R, SR, SSR) — усиленное предупреждение:
  - Жёлтая/красная рамка
  - Текст: "Это **редкая** карта! Уверен?"
  - Дополнительная строка: "Вы получите N Polvo"
- Для обычных (C, UC) — простой вопрос: "Распылить карту? Вы получите N Polvo"

**Props:**
```typescript
type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;       // красный стиль кнопки для редких
  onConfirm: () => void;
  onCancel: () => void;
};
```

#### 2.2 Количество Polvo в confirm-диалоге

Количество Polvo за распыление зависит от рарности. Эти значения уже есть на бэкенде в `POLVO_PER_DISINTEGRATE` (файл `backend/src/shared/constants.ts`). Чтобы не дублировать, можно:
- Захардкодить маппинг рарность→polvo на фронтенде (значения стабильные, меняются крайне редко)
- Добавить в `frontend/src/shared/labels.ts`:

```typescript
export const POLVO_PER_DISINTEGRATE: Record<string, number> = {
  C: 10,
  UC: 25,
  R: 60,
  SR: 150,
  SSR: 400,
};
```

Проверь актуальные значения в `backend/src/shared/constants.ts` и используй их.

#### 2.3 Анимация распыления

После подтверждения, **перед удалением карты из стейта**, показать анимацию:
- Карта уменьшается (scale 1 → 0.8)
- Растворяется (opacity 1 → 0)
- Появляются частицы/искры вокруг (опционально, можно без них если сложно — достаточно scale+opacity)
- Длительность ~500ms
- После анимации — карта исчезает из списка, toast "+N Polvo"

**Реализация анимации:**
Можно сделать через CSS-класс, который добавляется к карте перед удалением:
```css
.disintegrating {
  animation: disintegrate 500ms ease-out forwards;
}
@keyframes disintegrate {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.9); opacity: 0.5; filter: brightness(1.5); }
  100% { transform: scale(0.7); opacity: 0; filter: brightness(2); }
}
```

Добавить этот CSS в `frontend/src/index.css` или в отдельный файл `frontend/src/styles/animations.css` (импортировать в main.tsx).

### Где менять

1. **`CardModal.tsx`** — заменить `window.confirm` на `ConfirmDialog`. Добавить state `confirmOpen`. Перед вызовом `onDisintegrate` — показать анимацию (500ms пауза, потом удаление).

2. **`CardGroupModal.tsx`** — аналогично. При распылении конкретного экземпляра — confirm + анимация на этом CardMini.

3. **`CollectionPage.tsx`** — `onDisintegrate` оставить как есть (он уже обновляет стейт и показывает toast). Анимация происходит на уровне модалок, до вызова `onDisintegrate`.

---

## 3. Git

Один коммит:
```
feat: tooltips for card stats, custom disintegrate confirm with animation
```

---

## Критерии готовности

1. Компонент `Tooltip` работает на hover/tap, корректно позиционируется
2. Тултипы на: FUE, DEF, состояние, мастерство, рарность (CardMini + CardFace), Polvo (TopNav), прогресс (CollectionPage)
3. Нативный `window.confirm` заменён на кастомный `ConfirmDialog` в обеих модалках
4. Для R/SR/SSR — усиленное предупреждение с danger-стилем
5. В диалоге показано количество Polvo за распыление
6. После подтверждения — анимация исчезновения карты (~500ms) перед удалением из списка
7. Toast "+N Polvo" показывается после анимации
8. `docker compose up` — всё работает
