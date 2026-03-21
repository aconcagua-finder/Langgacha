# TASK-029: Тестовая генерация 5 картинок для карточек

**Важно:** все предыдущие задачи (TASK-001–028) уже выполнены и проверены. Не нужно их восстанавливать. Путь к этому файлу: `docs/tasks/TASK-029.md`.

## Контекст

Сейчас на карточках вместо картинок — эмодзи. Нужно заменить их на уникальные изображения. Первый шаг — сгенерировать 5 тестовых картинок, чтобы заказчик оценил стиль.

Это **только генерация картинок**, без интеграции в код. Просто файлы в папку.

---

## Стиль

**Концепция:** стилизованный 3D-объект/фигурка, как коллекционная миниатюра внутри карточки. Не фотореализм, не плоский 2D — а что-то между, объёмное и игрушечное.

**Технические требования:**
- Прозрачный фон (PNG с альфа-каналом)
- Размер: 512×512 или близко
- Объект по центру, хорошо читается на тёмном фоне
- Стиль единый для всех 5 картинок

---

## 5 картинок для генерации

Сохранить в папку `docs/test-images/`. Создать её если не существует.

### 1. casa (дом) — conceptKey: house
**Промпт:** `Stylized 3D render of a cozy small house, warm lighting, miniature collectible figurine style, isometric view, soft shadows, transparent background, game card art`

Файл: `docs/test-images/house.png`

### 2. amigo (друг) — conceptKey: friend
**Промпт:** `Stylized 3D render of two friends doing a fist bump, cartoon proportions, warm friendly vibe, miniature figurine style, soft lighting, transparent background, game card art`

Файл: `docs/test-images/friend.png`

### 3. comer (есть) — conceptKey: eat
**Промпт:** `Stylized 3D render of a steaming plate of food with fork and knife, appetizing colors, miniature collectible style, soft shadows, transparent background, game card art`

Файл: `docs/test-images/eat.png`

### 4. libro (книга) — conceptKey: book
**Промпт:** `Stylized 3D render of an open magical book with glowing pages, floating letters, miniature collectible figurine style, soft lighting, transparent background, game card art`

Файл: `docs/test-images/book.png`

### 5. feliz (счастливый) — conceptKey: happy
**Промпт:** `Stylized 3D render of a joyful smiling character with arms raised in celebration, cartoon proportions, bright cheerful mood, miniature figurine style, transparent background, game card art`

Файл: `docs/test-images/happy.png`

---

## Важно

- Используй свой скилл генерации изображений
- Если генератор не поддерживает прозрачный фон — генерируй на однотонном фоне (чёрном или зелёном), пометь это в отчёте
- Стиль должен быть **единым** для всех 5 картинок — это проба для утверждения визуального направления
- Промпты выше — ориентир. Если знаешь как сделать лучше для конкретного генератора — адаптируй, но сохрани общую идею: 3D miniature, collectible, game card

---

## Критерии готовности

1. 5 файлов PNG в `docs/test-images/`
2. Все в едином стиле
3. Каждая картинка соответствует своему conceptKey
4. Объекты хорошо читаются и выглядят привлекательно
