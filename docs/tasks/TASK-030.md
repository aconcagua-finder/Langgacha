# TASK-030: Генерация 25 картинок + интеграция изображений в карточки

**Важно:** все предыдущие задачи (TASK-001–029) уже выполнены и проверены. Не нужно их восстанавливать. Путь к этому файлу: `docs/tasks/TASK-030.md`.

## Контекст

В TASK-029 сгенерированы 5 тестовых картинок (house, friend, eat, book, happy) — стиль утверждён. Нужно:
1. Сгенерировать ещё 25 картинок тем же стилем
2. Интегрировать все 30 картинок в компоненты карточек (заменить emoji на изображение по conceptKey)

---

## Часть 1: Генерация 25 картинок

Сохранять в `docs/test-images/` (папка уже существует, там лежат 5 готовых).

**Стиль — точно как в TASK-029:** stylized 3D render, miniature collectible figurine style, soft shadows, transparent background, game card art. Размер 512×512, PNG с альфа-каналом.

### Список для генерации

| # | conceptKey | Описание | Промпт |
|---|-----------|----------|--------|
| 1 | water | вода | `Stylized 3D render of a glass of crystal clear water with droplets, miniature collectible style, soft lighting, transparent background, game card art` |
| 2 | coffee | кофе | `Stylized 3D render of a steaming cup of coffee with latte art, cozy warm tones, miniature collectible style, soft shadows, transparent background, game card art` |
| 3 | bread | хлеб | `Stylized 3D render of a fresh golden baguette with wheat ears, miniature collectible style, warm lighting, transparent background, game card art` |
| 4 | apple | яблоко | `Stylized 3D render of a shiny red apple with a leaf, miniature collectible style, soft shadows, transparent background, game card art` |
| 5 | milk | молоко | `Stylized 3D render of a glass bottle of milk with a splash, miniature collectible style, soft lighting, transparent background, game card art` |
| 6 | phone | телефон | `Stylized 3D render of a smartphone with glowing screen, miniature collectible figurine style, soft shadows, transparent background, game card art` |
| 7 | key | ключ | `Stylized 3D render of an ornate golden key with magical sparkles, miniature collectible style, soft lighting, transparent background, game card art` |
| 8 | money | деньги | `Stylized 3D render of gold coins and paper bills stack, miniature collectible style, warm lighting, transparent background, game card art` |
| 9 | table | стол | `Stylized 3D render of a cozy wooden dining table with tablecloth, miniature collectible style, soft shadows, transparent background, game card art` |
| 10 | chair | стул | `Stylized 3D render of a comfortable wooden chair with cushion, miniature collectible style, soft lighting, transparent background, game card art` |
| 11 | bed | кровать | `Stylized 3D render of a cozy bed with fluffy pillows and blanket, miniature collectible style, soft shadows, transparent background, game card art` |
| 12 | door | дверь | `Stylized 3D render of an arched wooden door with iron hinges, slightly ajar with light peeking through, miniature collectible style, transparent background, game card art` |
| 13 | window | окно | `Stylized 3D render of an open window with curtains blowing in wind, sunlight streaming through, miniature collectible style, transparent background, game card art` |
| 14 | shoes | обувь | `Stylized 3D render of stylish sneakers with untied laces, miniature collectible style, soft shadows, transparent background, game card art` |
| 15 | clothes | одежда | `Stylized 3D render of a folded stack of colorful clothes with a hanger, miniature collectible style, soft lighting, transparent background, game card art` |
| 16 | watch | часы | `Stylized 3D render of a classic wristwatch with golden details, miniature collectible figurine style, soft shadows, transparent background, game card art` |
| 17 | school | школа | `Stylized 3D render of a small schoolhouse with bell tower and chalkboard visible, miniature collectible style, warm lighting, transparent background, game card art` |
| 18 | park | парк | `Stylized 3D render of a mini park scene with bench, tree and lamp post on grass platform, miniature collectible style, transparent background, game card art` |
| 19 | mother | мама | `Stylized 3D render of a warm mother figure holding a small heart, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 20 | father | папа | `Stylized 3D render of a friendly father figure with glasses reading newspaper, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 21 | doctor | доктор | `Stylized 3D render of a friendly doctor with stethoscope and white coat, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 22 | teacher | учитель | `Stylized 3D render of a teacher with pointer and small chalkboard, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 23 | student | студент | `Stylized 3D render of a student with backpack and books, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 24 | food | еда | `Stylized 3D render of a colorful assortment of food items on a tray, fruits vegetables and pastries, miniature collectible style, transparent background, game card art` |
| 25 | chicken | курица | `Stylized 3D render of a roasted golden chicken on a plate with garnish, miniature collectible style, soft shadows, transparent background, game card art` |

Файлы: `docs/test-images/{conceptKey}.png`

---

## Часть 2: Интеграция картинок в карточки

### 2.1 Картинки как статические ассеты

Скопировать все 30 PNG из `docs/test-images/` в `frontend/public/card-images/`.

```
frontend/public/card-images/
  house.png
  friend.png
  eat.png
  book.png
  happy.png
  water.png
  ... (все 30)
```

### 2.2 Хелпер для получения URL картинки

Создать файл `frontend/src/utils/cardImage.ts`:

```typescript
/**
 * Returns the URL for a card's concept image, or null if no image exists.
 * Images are stored as static files in /card-images/{conceptKey}.png
 */

// Set of conceptKeys that have generated images
const AVAILABLE_IMAGES = new Set([
  "house", "friend", "eat", "book", "happy",
  "water", "coffee", "bread", "apple", "milk",
  "phone", "key", "money", "table", "chair",
  "bed", "door", "window", "shoes", "clothes",
  "watch", "school", "park", "mother", "father",
  "doctor", "teacher", "student", "food", "chicken",
]);

export const getCardImageUrl = (conceptKey?: string | null): string | null => {
  if (!conceptKey || !AVAILABLE_IMAGES.has(conceptKey)) return null;
  return `/card-images/${conceptKey}.png`;
};
```

### 2.3 Изменить CardFace.tsx

В верхней области карточки (строки 73–98) — заменить emoji на изображение, если оно доступно.

**Было** (строка 82):
```tsx
<div className="text-7xl drop-shadow">{typeTheme.emoji}</div>
```

**Стало:**
```tsx
{(() => {
  const imgUrl = getCardImageUrl(card.conceptKey);
  return imgUrl ? (
    <img src={imgUrl} alt={card.word} className="h-36 w-36 object-contain drop-shadow-lg" />
  ) : (
    <div className="text-7xl drop-shadow">{typeTheme.emoji}</div>
  );
})()}
```

Добавить импорт `getCardImageUrl` из `../../utils/cardImage`.

**Важно:** emoji в бейдже типа (строка 94, `typeTheme.emoji` в левом верхнем углу) — оставить как есть. Заменяется только центральная картинка.

### 2.4 Изменить CardMini.tsx

В области изображения (строки 112–125) — аналогичная замена.

**Было** (строка 121-122):
```tsx
<div className={["drop-shadow", compact ? "text-3xl" : "text-5xl"].join(" ")}>
  {typeTheme.emoji}
</div>
```

**Стало:**
```tsx
{(() => {
  const imgUrl = getCardImageUrl(card.conceptKey);
  return imgUrl ? (
    <img src={imgUrl} alt={card.word} className={compact ? "h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-lg" : "h-20 w-20 object-contain drop-shadow-lg"} />
  ) : (
    <div className={["drop-shadow", compact ? "text-3xl" : "text-5xl"].join(" ")}>
      {typeTheme.emoji}
    </div>
  );
})()}
```

Добавить импорт `getCardImageUrl`.

**Важно:** emoji в бейдже типа (строка 104) — оставить как есть.

---

## Что НЕ трогать

- Бейдж типа с emoji в левом верхнем углу (остаётся как есть)
- Все остальные элементы карточки (ATK/DEF, condition, mastery, rarity и т.д.)
- Бэкенд — `conceptKey` уже передаётся на фронт через `mapCardToDto`
- Логику тем (`card-themes.ts`) — emoji остаются как fallback

---

## Git

Один коммит:
```
feat: add 25 card images and integrate concept art into card components
```

---

## Критерии готовности

1. 25 новых PNG файлов в `docs/test-images/` (итого 30)
2. 30 PNG в `frontend/public/card-images/`
3. Карточки с conceptKey из списка 30 показывают картинку вместо emoji
4. Карточки без картинки — fallback на emoji (как сейчас)
5. Стиль картинок единый (как в TASK-029)
6. `npm -C frontend run build` ✅
7. Визуально проверить: карточки с картинками в коллекции, бустере, бою
