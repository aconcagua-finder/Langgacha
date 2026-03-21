# TASK-031: Генерация следующих 30 картинок + обновление cardImage

**Важно:** все предыдущие задачи (TASK-001–030) уже выполнены и проверены. Не нужно их восстанавливать. Путь к этому файлу: `docs/tasks/TASK-031.md`.

## Контекст

В TASK-029/030 сгенерированы 30 картинок и интегрированы в карточки. Нужно добить ещё 30 conceptKey'ов тем же стилем.

---

## Задача

Сгенерировать 30 PNG картинок и обновить `AVAILABLE_IMAGES` в `frontend/src/utils/cardImage.ts`.

**Стиль — точно как раньше:** stylized 3D render, miniature collectible figurine style, soft shadows, transparent background, game card art. Размер 512×512, PNG с альфа-каналом.

---

## Список для генерации

Сохранять в `docs/test-images/` И копировать в `frontend/public/card-images/`.

| # | conceptKey | Описание | Промпт |
|---|-----------|----------|--------|
| 1 | street | улица | `Stylized 3D render of a charming cobblestone street with lamp posts, miniature diorama style, soft lighting, transparent background, game card art` |
| 2 | city | город | `Stylized 3D render of a miniature city skyline with colorful buildings, isometric view, miniature collectible style, soft shadows, transparent background, game card art` |
| 3 | shop | магазин | `Stylized 3D render of a cute small shop with awning and display window, miniature collectible style, warm lighting, transparent background, game card art` |
| 4 | market | рынок | `Stylized 3D render of a market stall with fruits and vegetables, colorful canopy, miniature collectible style, soft lighting, transparent background, game card art` |
| 5 | hospital | больница | `Stylized 3D render of a small hospital building with red cross sign, miniature collectible style, soft lighting, transparent background, game card art` |
| 6 | bank | банк | `Stylized 3D render of a classic bank building with columns and vault door, miniature collectible style, soft lighting, transparent background, game card art` |
| 7 | kitchen | кухня | `Stylized 3D render of a cozy kitchen scene with pots, pans and stove, miniature diorama style, warm lighting, transparent background, game card art` |
| 8 | bathroom | ванная | `Stylized 3D render of a bathroom with bathtub, bubbles and rubber duck, miniature diorama style, soft lighting, transparent background, game card art` |
| 9 | square | площадь | `Stylized 3D render of a town square with fountain and benches, miniature diorama style, soft lighting, transparent background, game card art` |
| 10 | brother | брат | `Stylized 3D render of a teenage boy giving thumbs up, casual clothes, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 11 | sister | сестра | `Stylized 3D render of a teenage girl waving hello, casual clothes, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 12 | son | сын | `Stylized 3D render of a young boy with a toy ball, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 13 | daughter | дочь | `Stylized 3D render of a young girl with a flower in hair, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 14 | neighbor | сосед | `Stylized 3D render of a friendly neighbor waving over a small fence, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 15 | boy | мальчик | `Stylized 3D render of a cheerful little boy with cap, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 16 | girl | девочка | `Stylized 3D render of a cheerful little girl with pigtails, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 17 | drink | пить | `Stylized 3D render of a refreshing drink with ice cubes and straw, miniature collectible style, soft lighting, transparent background, game card art` |
| 18 | sleep | спать | `Stylized 3D render of a cute character sleeping on a cloud with Zzz letters, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 19 | speak | говорить | `Stylized 3D render of a character speaking into a megaphone with speech bubbles, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 20 | read | читать | `Stylized 3D render of a character sitting and reading a book with glasses, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 21 | write | писать | `Stylized 3D render of a quill pen writing on a scroll with ink splashes, miniature collectible style, soft lighting, transparent background, game card art` |
| 22 | go | идти | `Stylized 3D render of a character walking with a small suitcase, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 23 | come | приходить | `Stylized 3D render of a character approaching an open door with welcome mat, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 24 | see | видеть | `Stylized 3D render of a telescope on a tripod with stars and sparkles, miniature collectible style, soft lighting, transparent background, game card art` |
| 25 | walk | гулять | `Stylized 3D render of a character strolling happily on a path with flowers, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 26 | sad | грустный | `Stylized 3D render of a sad character sitting with a rain cloud above head, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 27 | tired | уставший | `Stylized 3D render of a sleepy character yawning with droopy eyes, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 28 | angry | злой | `Stylized 3D render of an angry character with steam coming from ears, cartoon proportions, miniature figurine style, soft lighting, transparent background, game card art` |
| 29 | tea | чай | `Stylized 3D render of an elegant teapot with steaming cup of tea and tea leaves, miniature collectible style, soft lighting, transparent background, game card art` |
| 30 | hello | привет | `Stylized 3D render of a friendly character waving hello with a big smile, speech bubble with exclamation mark, cartoon proportions, miniature figurine style, transparent background, game card art` |

---

## Обновить cardImage.ts

Добавить все 30 новых conceptKey в `AVAILABLE_IMAGES` в файле `frontend/src/utils/cardImage.ts`.

---

## Что НЕ трогать

- CardFace.tsx, CardMini.tsx — уже интегрированы в TASK-030
- Бэкенд — не нужен
- Существующие 30 картинок — не перегенерировать

---

## Git

Один коммит:
```
feat: add 30 more card concept images
```

---

## Критерии готовности

1. 30 новых PNG в `docs/test-images/` и `frontend/public/card-images/`
2. `AVAILABLE_IMAGES` содержит 60 conceptKey'ов
3. Стиль единый с предыдущими 30 картинками
4. `npm -C frontend run build` ✅
