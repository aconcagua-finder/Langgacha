# TASK-001: Инфраструктура + Seed-база + Генерация и отображение карточки

## Цель

Развернуть Docker-окружение проекта, создать схему БД, заполнить стартовый пул слов, реализовать API генерации карточки и React-компонент её отображения.

Результат: при открытии приложения в браузере можно нажать кнопку "Сгенерировать карточку" и увидеть визуально оформленную карточку слова с лицом и разворотом.

---

## 1. Docker-окружение

Создать `docker-compose.yml` в корне проекта со следующими сервисами:

- **postgres** — PostgreSQL 16, порт 5432, volume для данных
- **redis** — Redis 7, порт 6379
- **backend** — Node.js (Fastify + TypeScript), порт 3000, hot-reload
- **frontend** — React (Vite + TypeScript), порт 5173, hot-reload

Требования:
- Единый `docker-compose up` поднимает всё
- Backend ждёт готовности postgres перед стартом
- Переменные окружения через `.env` файл (добавить `.env.example` с шаблоном)
- `.env` добавить в `.gitignore`

---

## 2. Backend: структура проекта

Стек: **Fastify + TypeScript + Prisma (ORM) + PostgreSQL**

Структура папок:
```
backend/
├── src/
│   ├── app.ts                  # Инициализация Fastify
│   ├── server.ts               # Точка входа
│   ├── config/
│   │   └── index.ts            # Конфигурация из env
│   ├── db/
│   │   └── prisma/
│   │       └── schema.prisma   # Схема БД
│   ├── modules/
│   │   └── cards/
│   │       ├── cards.routes.ts
│   │       ├── cards.service.ts
│   │       └── cards.types.ts
│   └── shared/
│       └── constants.ts        # Диапазоны статов, шансы рарности и т.д.
├── scripts/
│   └── seed.ts                 # Скрипт заполнения seed-базы
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

## 3. Схема БД (Prisma)

### Таблица `Word` (seed-пул, общая для всех игроков)

```prisma
model Word {
  id            String   @id @default(uuid())
  language      String   // "es", "en"
  word          String   // слово или фраза
  translationRu String   // перевод на русский
  type          String   // "Persona", "Lugar", "Acción", "Objeto", "Emoción", "Expresión"
  rarity        String   // "C", "UC", "R", "SR", "SSR"
  baseFue       Int      // базовая сила в % от диапазона (0-100)
  baseDef       Int      // базовая защита в % от диапазона (0-100)
  colorido      Int      // 1-10
  flavorText    String   // флейвор-текст
  hint          String   // подсказка/этимология
  tags          String[] // теги
  canEvolve     Boolean  @default(false)
  imagePrompt   String?  // промт для генерации изображения (на будущее)

  quizCorrect   String   // правильный ответ для квиза
  quizOptions   String[] // 4 варианта ответа (включая правильный)

  evolutionData Json?    // данные эволюции (если canEvolve = true)

  createdAt     DateTime @default(now())

  cards         Card[]
}
```

### Таблица `Card` (экземпляр карточки у игрока)

```prisma
model Card {
  id          String   @id @default(uuid())
  wordId      String
  word        Word     @relation(fields: [wordId], references: [id])

  fue         Int      // итоговая сила после рандомизации
  def         Int      // итоговая защита после рандомизации

  masteryProgress Int  @default(0) // 0-5
  condition       String @default("Normal") // "Brillante", "Normal", "Gastada", "Deteriorada"
  isEvolved       Boolean @default(false)

  createdAt   DateTime @default(now())
  lastUsedAt  DateTime @default(now())
}
```

---

## 4. Константы и рандомизация статов

В файле `shared/constants.ts` определить:

```typescript
// Диапазоны статов по рарности
export const STAT_RANGES = {
  C:   { min: 100, max: 500 },
  UC:  { min: 300, max: 1000 },
  R:   { min: 600, max: 2000 },
  SR:  { min: 1200, max: 4000 },
  SSR: { min: 2500, max: 8000 },
};

// Рандомизация: ±20% от базового значения
export const RANDOMIZATION_FACTOR = 0.20;
```

**Алгоритм генерации статов карточки:**
1. Взять `baseFue` (0-100%) из Word
2. Вычислить абсолютное значение: `min + (max - min) * baseFue / 100`
3. Применить случайный множитель: `value * (1 + random(-0.20, +0.20))`
4. Ограничить результат диапазоном рарности [min, max]
5. Аналогично для DEF

---

## 5. Seed-скрипт

Файл `scripts/seed.ts` — заполняет таблицу `Word` стартовым набором.

Создать **вручную** (не через AI-генерацию) массив из **30 испанских слов**, распределённых по типам и рарностям:

- 15 слов рарности C (по 2-3 каждого типа)
- 8 слов рарности UC
- 5 слов рарности R
- 2 слова рарности SR

Для каждого слова заполнить все поля Word. Данные должны быть лингвистически корректными.

Примеры для ориентира:

```typescript
{
  word: "casa",
  translationRu: "дом",
  type: "Lugar",
  rarity: "C",
  baseFue: 40,
  baseDef: 60,
  colorido: 2,
  flavorText: "—¿Dónde vivís? —En casa de mis viejos, por ahora.",
  hint: "Одно из первых слов, которое учат в любом языке",
  tags: ["básico", "vivienda"],
  quizCorrect: "дом",
  quizOptions: ["дом", "машина", "улица", "город"]
}
```

```typescript
{
  word: "laburar",
  translationRu: "работать (сленг, Аргентина)",
  type: "Acción",
  rarity: "R",
  baseFue: 75,
  baseDef: 50,
  colorido: 8,
  flavorText: "—Dale, dejá de boludearte y ponete a laburar. —¿Laburar? ¡Si es domingo!",
  hint: "Lunfardo: от итал. lavorare. Используется повсеместно в Аргентине.",
  tags: ["lunfardo", "informal", "Argentina"],
  canEvolve: true,
  quizCorrect: "работать",
  quizOptions: ["работать", "играть", "спать", "есть"]
}
```

---

## 6. API-эндпоинт генерации карточки

`POST /api/cards/generate` — генерирует одну карточку из случайного слова пула.

Логика:
1. Выбрать случайное слово из таблицы `Word` (пока без фильтров по прогрессии)
2. Рандомизировать статы (алгоритм из раздела 4)
3. Создать запись `Card` в БД
4. Вернуть полные данные карточки (Card + Word)

Ответ:
```json
{
  "id": "uuid",
  "word": "laburar",
  "translationRu": "работать (сленг, Аргентина)",
  "type": "Acción",
  "rarity": "R",
  "fue": 1850,
  "def": 1200,
  "colorido": 8,
  "flavorText": "...",
  "hint": "...",
  "tags": ["lunfardo", "informal", "Argentina"],
  "condition": "Brillante",
  "masteryProgress": 0,
  "canEvolve": true
}
```

Также создать `GET /api/cards` — список всех карточек (для коллекции, потом).

---

## 7. Frontend: структура проекта

Стек: **React + TypeScript + Vite + Tailwind CSS**

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/
│   │   └── cards.ts            # API-клиент
│   ├── components/
│   │   └── card/
│   │       ├── CardFace.tsx     # Лицо карточки
│   │       ├── CardBack.tsx     # Разворот карточки
│   │       └── CardFlip.tsx     # Обёртка с анимацией переворота
│   ├── pages/
│   │   └── HomePage.tsx         # Главная: кнопка генерации + карточка
│   ├── styles/
│   │   └── card-themes.ts      # Цвета и стили по типам/рарностям
│   └── types/
│       └── card.ts             # TypeScript-типы карточки
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── Dockerfile
```

---

## 8. Компонент карточки

Это ключевой визуальный элемент проекта. Карточка должна выглядеть как коллекционная карта (вдохновение: TCG карты, WikiGacha).

### Лицо карточки (CardFace)

Отображает:
- Цветная рамка по типу (см. таблицу типов в GDD, раздел 3)
- Область изображения — пока заглушка: стилизованный фон с эмодзи типа (👤📍⚡🔧💫🗣️)
- Слово на целевом языке (крупно)
- Перевод (мельче)
- Статы FUE и DEF
- Тип (иконка) + Рарность (цветной бейдж)
- Состояние (иконка) + Мастерство (точки прогресса ●●●○○)

### Разворот карточки (CardBack)

Отображает:
- Слово
- Флейвор-текст (курсивом, как цитата)
- Подсказка (с иконкой 💡)
- Теги

### Анимация переворота (CardFlip)

- По клику/тапу карточка переворачивается (CSS 3D transform, `rotateY(180deg)`)
- Плавная анимация ~0.6s

### Визуальные стили по типам

| Тип | Основной цвет рамки | Фон заглушки |
|-----|---------------------|--------------|
| Persona | #E57373 (тёплый красный) | Тёплый градиент |
| Lugar | #4DB6AC (бирюзовый) | Холодный градиент |
| Acción | #FFB74D (оранжевый) | Динамичный градиент |
| Objeto | #90A4AE (серо-голубой) | Нейтральный градиент |
| Emoción | #BA68C8 (фиолетовый) | Мягкий градиент |
| Expresión | #4FC3F7 (яркий голубой) | Яркий градиент |

### Визуальные стили по рарности

| Рарность | Цвет бейджа | Эффект рамки |
|----------|-------------|--------------|
| C | #9E9E9E (серый) | Обычная рамка |
| UC | #66BB6A (зелёный) | Лёгкое свечение |
| R | #42A5F5 (синий) | Заметное свечение |
| SR | #FFC107 (золотой) | Сильное свечение + блёстки (CSS) |
| SSR | #AB47BC (фиолетовый) | Голографический эффект (CSS анимация) |

---

## 9. Главная страница (HomePage)

Минималистичная страница для тестирования:

- Заголовок "LangGacha"
- Кнопка "Сгенерировать карточку"
- При нажатии — запрос к API, отображение полученной карточки
- Карточка кликабельна (переворот лицо ↔ разворот)
- Под карточкой — базовая информация (для дебага): ID, сырые статы

---

## 10. Git и начальная настройка

- Инициализировать git-репозиторий
- Создать `.gitignore` (node_modules, .env, dist, postgres data volume, etc.)
- Создать `.env.example` с шаблоном переменных
- Первый коммит: инфраструктура
- Далее коммиты по логическим блокам (схема БД, seed, API, frontend)

---

## Критерии готовности

1. `docker-compose up` поднимает всё окружение без ошибок
2. Seed-скрипт заполняет БД 30 словами
3. `POST /api/cards/generate` возвращает карточку с рандомизированными статами
4. `GET /api/cards` возвращает список сгенерированных карт
5. В браузере (localhost:5173) видна страница с кнопкой генерации
6. При нажатии — появляется визуально оформленная карточка
7. Карточка переворачивается по клику
8. Стили карточки соответствуют типу и рарности слова
