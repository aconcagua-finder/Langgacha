# TASK-033: Усиление визуала ветхости карт

**Важно:** все предыдущие задачи (TASK-001–032) уже выполнены и проверены. Не нужно их восстанавливать. Путь к этому файлу: `docs/tasks/TASK-033.md`.

## Контекст

В TASK-032 добавлены CSS-классы ветхости (`condition-worn`, `condition-deteriorated`, `condition-brilliant`), но эффекты слишком тонкие — на тёмном фоне карт практически невидимы. Нужно усилить визуал, чтобы игрок **сразу видел** состояние карты.

Файл для редактирования: `frontend/src/styles/condition-effects.css`

**Карточки имеют тёмный фон** (`bg-slate-900/60`), поэтому тёмные overlay с `multiply` не работают. Нужны светлые/цветные эффекты.

---

## Требования

### Brilliant (✨) — карта только что повторена, "свежая"

Лёгкое, но заметное свечение. Карта выглядит "живой" и ухоженной.

- Внешнее свечение (box-shadow) белое/голубоватое, достаточно заметное
- Лёгкий анимированный shimmer — тонкая полоска света, медленно скользящая по карте (CSS animation, `@keyframes`)
- Без перегруза — карта не должна мигать или отвлекать

```css
.condition-brilliant {
  box-shadow: 0 0 20px 4px rgba(200, 220, 255, 0.15);
}

.condition-brilliant::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.07) 45%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.07) 55%,
    transparent 60%
  );
  background-size: 200% 100%;
  animation: shimmer 4s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Worn (🟨) — давно не повторял, начинает забываться

Заметное "потёртое" состояние. Карта выглядит неухоженной.

- **Желтоватый/сепия overlay** — тёплый тон поверх карты, заметный но не кричащий
- **Потёртые углы** — затемнение/виньетка по краям с тёплым оттенком
- **Лёгкая зернистость** — noise texture через CSS (background-image radial-gradient шум)
- `filter: saturate(0.85)` — слегка выцветшие цвета

```css
.condition-worn {
  position: relative;
  filter: saturate(0.85) sepia(0.08);
}

.condition-worn::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 20;
  background:
    /* Виньетка по краям — тёплая */
    radial-gradient(ellipse at center, transparent 55%, rgba(120, 80, 20, 0.25) 100%),
    /* Потёртости в углах */
    radial-gradient(ellipse at 0% 100%, rgba(180, 140, 60, 0.18) 0%, transparent 35%),
    radial-gradient(ellipse at 100% 0%, rgba(180, 140, 60, 0.15) 0%, transparent 30%),
    radial-gradient(ellipse at 100% 100%, rgba(180, 140, 60, 0.12) 0%, transparent 25%);
}
```

### Deteriorated (🟥) — слово забыто, срочно повторять

Сильный визуальный эффект "разрушающейся" карты. Должно бросаться в глаза.

- **Сильное выцветание** — `saturate(0.5) brightness(0.8)` — карта тусклая
- **Красноватый оттенок** — overlay с красным/ржавым тоном
- **Трещины** — CSS линии (linear-gradient), имитирующие трещины поверх карты
- **Сильная виньетка** — затемнённые рваные края
- **Зернистость** — более грубый noise

```css
.condition-deteriorated {
  position: relative;
  filter: saturate(0.5) brightness(0.8);
}

.condition-deteriorated::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 20;
  background:
    /* Красноватый overlay */
    linear-gradient(to bottom, rgba(180, 40, 30, 0.12) 0%, rgba(120, 30, 20, 0.18) 100%),
    /* Виньетка — тёмная и заметная */
    radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.4) 100%),
    /* Трещина 1 — диагональная */
    linear-gradient(135deg,
      transparent 28%, rgba(0,0,0,0.3) 28.5%, rgba(0,0,0,0.15) 29%, transparent 29.5%,
      transparent 100%),
    /* Трещина 2 — другой угол */
    linear-gradient(225deg,
      transparent 45%, rgba(0,0,0,0.25) 45.5%, rgba(0,0,0,0.1) 46%, transparent 46.5%,
      transparent 100%),
    /* Трещина 3 — горизонтальная */
    linear-gradient(175deg,
      transparent 60%, rgba(0,0,0,0.2) 60.3%, rgba(0,0,0,0.08) 60.6%, transparent 61%,
      transparent 100%),
    /* Потёртости в углах */
    radial-gradient(ellipse at 0% 100%, rgba(0, 0, 0, 0.35) 0%, transparent 40%),
    radial-gradient(ellipse at 100% 0%, rgba(0, 0, 0, 0.3) 0%, transparent 35%);
}
```

### card-evolved — оставить как есть

Текущий эффект эволюции (тонкая голубая рамка с inset glow) выглядит нормально, не трогать.

---

## Важные нюансы

1. `::after` должен иметь `z-index: 20` чтобы overlay был поверх содержимого карты, но `pointer-events: none` чтобы не блокировать клики
2. Проверить что `position: relative` не конфликтует с существующим позиционированием карты (оба компонента уже relative)
3. Эффекты должны быть заметны и на CardFace (полноразмерная) и на CardMini (маленькая)
4. Проверить на всех рарностях — эффект должен быть виден поверх rarity gradient
5. **НЕ трогать** логику condition, CardFace.tsx, CardMini.tsx — только CSS-файл

---

## Как проверить визуально

Для тестирования можно временно через DevTools добавить класс `condition-deteriorated` или `condition-worn` на карточку в коллекции.

Или использовать dev-endpoint: дождаться 3+ дней без боя (condition = Worn) или 7+ дней (condition = Deteriorated). Для ускорения можно через Prisma Studio/SQL сдвинуть `WordProgress.lastReviewedAt` назад:

```sql
-- Worn (3+ дня назад)
UPDATE "WordProgress" SET "lastReviewedAt" = NOW() - INTERVAL '4 days' WHERE "playerId" = '...';
-- Deteriorated (7+ дней назад)
UPDATE "WordProgress" SET "lastReviewedAt" = NOW() - INTERVAL '10 days' WHERE "playerId" = '...';
-- Brilliant (менее 1 дня)
UPDATE "WordProgress" SET "lastReviewedAt" = NOW() WHERE "playerId" = '...';
```

---

## Git

Один коммит:
```
style: make card wear effects more visible
```

---

## Критерии готовности

1. **Brilliant** — заметное свечение + анимированный shimmer
2. **Worn** — желтоватый тон, потёртые углы, слегка выцветшие цвета. Видно сразу.
3. **Deteriorated** — красноватый оттенок, трещины, сильная виньетка, тусклые цвета. Бросается в глаза.
4. Эффекты видны и на CardFace и на CardMini
5. Клики по карточкам работают (pointer-events: none на overlay)
6. `npm -C frontend run build` ✅
