# TASK-025: ATK/DEF стиль + центрирование текста + три режима коллекции

**Важно:** все предыдущие задачи (TASK-001–024) уже выполнены и проверены. Не нужно их восстанавливать. Путь к этому файлу: `docs/tasks/TASK-025.md`.

## Контекст

Три проблемы:
1. ATK/DEF бейджи на CardFace — яркие кричащие цвета (amber/sky) и эмодзи не вписываются в тёмную эстетику
2. Слово и перевод на CardFace — выровнены влево, должны быть по центру
3. В коллекции удалён табличный вид и переключатель — нужно вернуть и добавить третий режим

---

## 1. ATK/DEF на CardFace — приглушённый монохромный стиль

### Текущее состояние (ПЛОХО)
Яркие цветные бейджи `bg-amber-500/85` и `bg-sky-500/80` с эмодзи 🗡️ и 🛡️. Выглядят как наклейки из другой игры, не вписываются в тёмный дизайн.

### Что сделать

Заменить яркие бейджи на приглушённые блоки в стиле остального UI карты.

**ATK (нижний левый угол):**
```tsx
<div className="absolute bottom-3 left-3 z-10 rounded-xl bg-slate-950/50 px-3 py-1.5 backdrop-blur">
  <div className="text-[10px] uppercase tracking-wider text-slate-400">ATK</div>
  <div className="text-lg font-extrabold text-slate-50">{card.atk}</div>
</div>
```

**DEF (нижний правый угол):**
```tsx
<div className="absolute bottom-3 right-3 z-10 rounded-xl bg-slate-950/50 px-3 py-1.5 backdrop-blur">
  <div className="text-[10px] uppercase tracking-wider text-slate-400 text-right">DEF</div>
  <div className="text-lg font-extrabold text-slate-50 text-right">{card.def}</div>
</div>
```

### Стиль
- Фон: `bg-slate-950/50 backdrop-blur` — полупрозрачный тёмный, как остальные элементы карты
- Текст подписи (ATK/DEF): `text-[10px] uppercase tracking-wider text-slate-400` — мелкий, серый
- Текст значения: `text-lg font-extrabold text-slate-50` — крупный, белый
- **Без эмодзи** мечей/щитов — просто текст ATK и DEF
- **Без ярких цветов** — никакого amber, sky, red, blue на фоне. Только slate-оттенки
- Тултипы оставить

### Состояние + мастерство (центр)
Оставить как есть — `bg-slate-950/60 backdrop-blur`, эмодзи состояния + точки. Это уже хорошо стилистически.

---

## 2. Слово и перевод на CardFace — по центру

### Текущее состояние
Слово и перевод выровнены влево (`text-left` по умолчанию).

### Что сделать

В `frontend/src/components/card/CardFace.tsx`, блок с word/translationRu (строки ~101-105):

Добавить `text-center` к контейнеру:
```tsx
<div className="text-center">
  <div className="text-3xl font-extrabold tracking-tight">{card.word}</div>
  <div className="text-sm text-slate-200/80">{card.translationRu}</div>
</div>
```

---

## 3. Три режима отображения в коллекции

В предыдущей задаче был удалён табличный вид (CollectionTable) и переключатель. Нужно всё вернуть и добавить третий режим.

### Три режима:
1. **Полноразмерные карты** (CardFace) — текущий CollectionGrid, по умолчанию
2. **Мини-карты** (CardMini) — компактная сетка, 2/3/4 колонки
3. **Таблица** — табличный/списочный вид

### Что сделать:

**A) Восстановить `CollectionTable.tsx`:**

Агент удалил этот файл. Нужно создать его заново. Содержимое — табличный вид коллекции. Каждая строка:
- Эмодзи типа + слово (жирным) + перевод (серый)
- Тип (из TYPE_LABELS), скрыт на мобильном
- Рарность (бейдж с цветом)
- Количество (×N или —)
- ATK · DEF (скрыт на мобильном)

Строка кликабельна → CardModal / CardGroupModal.

Стиль строки: `rounded-xl border border-slate-800/60 bg-slate-900/20 px-4 py-3 hover:bg-slate-800/30`.

**B) Создать `CollectionMiniGrid.tsx`:**

Сетка CardMini — как был старый CollectionGrid до наших изменений:
- `grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4`
- Каждый элемент: `<CardMini card={g.bestCard} />`
- Бейдж ×N для стопок
- Стопки-тени адаптивные (inset-0 + translate) — как сейчас в CollectionGrid, скопировать оттуда

Клик → CardModal / CardGroupModal.

**C) Переключатель в `CollectionPage.tsx`:**

Добавить состояние: `viewMode: "full" | "mini" | "table"` (по умолчанию `"full"`).

Три кнопки-переключателя рядом с фильтрами или заголовком:
- 🃏 (или текст «Карты») — полноразмерные
- 🔳 (или текст «Мини») — мини
- ☰ (или текст «Список») — таблица

Стиль переключателей: как кнопки фильтра, активная — `bg-slate-800 text-slate-50`, неактивная — `text-slate-200/70 hover:bg-slate-900/50`.

Рендер:
```tsx
{viewMode === "full" && <CollectionGrid ... />}
{viewMode === "mini" && <CollectionMiniGrid ... />}
{viewMode === "table" && <CollectionTable ... />}
```

**D) CollectionGrid (полноразмерный) — оставить как есть** (CardFace + стопки + ×N бейдж).

---

## Git

Один коммит:
```
fix: subdued ATK/DEF badges, centered card text, three collection view modes
```

---

## Критерии готовности

1. ATK/DEF — приглушённые полупрозрачные блоки, без ярких цветов и эмодзи оружия
2. Слово и перевод на CardFace — по центру
3. Три режима коллекции: полноразмерные / мини / таблица
4. Переключатель работает, по умолчанию полноразмерные
5. Все три режима кликабельны → модалки
6. `npm -C frontend run build` ✅
7. Визуально проверить: все три режима коллекции, полноразмерная карта (стиль ATK/DEF, центрирование)
