# TASK-009: Фиксы тултипов и штампа "Освоена"

## Цель

Исправить два визуальных бага из TASK-008:
1. Тултипы обрезаются границей карточки (overflow-hidden)
2. Штамп "✓ Освоена" на CardMini обрезается и перекрывает рарность

---

## 1. Тултипы — React Portal

### Проблема

`Tooltip` рендерит всплывающий пузырь как `absolute` внутри `<span>`. Карточки (`CardMini`, `CardFace`) имеют `overflow-hidden` на корневом div. Тултип физически не может выйти за пределы карточки — обрезается.

### Решение

Рендерить пузырь тултипа через **React Portal** в `document.body`. Позиционировать через `fixed` координаты, вычисленные из `getBoundingClientRect()` триггер-элемента.

### Что менять

**`frontend/src/components/ui/Tooltip.tsx`:**

1. Импортировать `createPortal` из `react-dom`
2. Пузырь (`<div>` с текстом) рендерить через `createPortal(..., document.body)`
3. Позиционирование: `position: fixed`, координаты вычислять из `wrapRef.current.getBoundingClientRect()`
4. Логика размещения top/bottom оставить как есть, но теперь координаты абсолютные на экране
5. Горизонтально: центрировать относительно триггера, но **не выходить за края экрана** (clamp left/right с отступом 8px)

Примерная логика позиционирования:
```typescript
const rect = wrapRef.current.getBoundingClientRect();
const centerX = rect.left + rect.width / 2;

// top placement
const top = rect.top - bubbleHeight - 8;
// bottom placement
const top = rect.bottom + 8;

// horizontal clamp
const left = Math.max(8, Math.min(centerX - bubbleWidth / 2, window.innerWidth - bubbleWidth - 8));
```

6. z-index пузыря: `z-50` (выше всех модалок)

### Важно

- **Не менять** API компонента — `<Tooltip text="..."><children/></Tooltip>` остаётся как есть
- **Не менять** визуальный стиль пузыря (цвета, скругления, padding)
- **Не менять** логику hover/tap/pointerdown

---

## 2. Штамп "Освоена" на CardMini

### Проблема

На `CardMini` штамп использует `-right-12 px-10 rotate-12` — слишком широкий и агрессивно сдвинут. Из-за `overflow-hidden` на карточке текст обрезается справа. Также штамп перекрывает бейдж рарности в правом верхнем углу.

### Решение

Уменьшить штамп для CardMini. CardFace (полная карточка 340×480) — штамп нормальный, не трогать.

### Что менять

**`frontend/src/components/card/CardMini.tsx`**, строка со штампом (примерно строка 64):

Было:
```
absolute -right-12 top-6 z-10 rotate-12 rounded-xl bg-emerald-400/90 px-10 py-2 text-xs
```

Заменить на компактный вариант, который не обрезается и не перекрывает рарность. Например:
```
absolute right-2 top-10 z-10 rounded-lg bg-emerald-400/90 px-2 py-1 text-[10px]
```

Убрать `rotate-12` и `-right-12` — на маленькой карточке поворот и отрицательное смещение не работают. Точные значения подбери, чтобы:
- Штамп полностью видим (не обрезан)
- Не перекрывает рарность (C/UC/R/SR/SSR в правом верхнем углу)
- Визуально читаем

---

## 3. Git

Один коммит:
```
fix: tooltip portal to escape overflow-hidden, compact mastered badge on CardMini
```

---

## Критерии готовности

1. Тултипы видны полностью, не обрезаются границами карточки
2. Тултипы не выходят за края экрана (горизонтальный clamp)
3. Тултипы работают и на CardMini (в сетке коллекции), и на CardFace (в модалке)
4. Штамп "Освоена" на CardMini полностью видим, текст не обрезан
5. Штамп не перекрывает бейдж рарности
6. CardFace — штамп не изменён (он там нормальный)
7. `docker compose up` — всё работает
