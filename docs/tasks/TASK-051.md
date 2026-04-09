# TASK-051: Эталонная тема Kitchen — сборка вручную

**Путь к файлу задачи:** `docs/tasks/TASK-051.md`
**Родительский план:** `docs/content-plan.md` (ЭТАП 3, задачи 3.1–3.2)
**Статус:** ⚪ Pending (ожидает завершения TASK-050)
**Тип:** ИНТЕРАКТИВНАЯ сборка контента + извлечение промпта
**Блокеры:** TASK-050 должен быть завершён (нужна схема с Theme/WordTheme/CEFR/isCore)

> **Старые TASK-файлы удалены, потому что проверены и закрыты. НЕ восстанавливай их.**

---

## Цель

Собрать первую полную тематическую пачку слов `kitchen` (~80-100 слов) — это будет ЭТАЛОН качества для всех последующих тем. На нём калибруется стиль flavor-текста, мнемоник, дистракторов, распределения рарностей внутри темы. Извлечённый из этого эталона AI-промпт станет шаблоном для генерации остальных тем в Этапе 5.

---

## Почему Kitchen

Решение Aleksei 2026-04-09:
- Богатый контекст: конкретные существительные (посуда, продукты, ингредиенты), глаголы (готовить, резать, смешивать), прилагательные (вкусный, острый, холодный)
- Легко калибровать семантичные дистракторы — если правильный ответ "сковорода", дистракторы "кастрюля/нож/вилка" естественны
- Уже есть 11 существующих слов в seed — стартовая точка, не с нуля
- Универсально применима к разным культурам (включая Аргентину — asado, mate, parrilla)

---

## Обязательные чтения ПЕРЕД стартом

1. `docs/content-plan.md` — весь документ, особенно разделы 5.6 (диалект Rioplatense), 5.7 (инструмент генерации), 6 (ревизия), 7 (подход к генерации)
2. `docs/content-audit.md` — список эталонных слов и систематических проблем (особенно раздел "Рекомендации для AI-промпта")
3. `docs/taxonomy.md` — тема kitchen, существующие слова, слова-заполнители в разделе "Дыры в темах"
4. `backend/scripts/seed-words-common.ts` и другие — существующие слова темы kitchen для сохранения/улучшения
5. TASK-050 результаты (seed.ts, schema, cards.generator.ts) — чтобы понимать новую структуру

---

## Принципы эталона

### Диалект
**Rioplatense Spanish**. Voseo во всех flavor-текстах. Аргентинский узус в culturally-specific словах (asado, parrilla, mate, medialuna, milanesa, empanada, dulce de leche...).

### Правило регистров (из content-plan § 5.6)
- C = voseo + повседневный, без специфического сленга
- UC = voseo + лёгкие разговорные обороты, минимум lunfardo
- R = voseo + регионализмы, может быть сленг если слово само сленг
- SR/SSR = полный спектр lunfardo

### Правило мнемоник (из content-audit § 3 в категориях проблем)
Hint = конкретная ассоциация, поднимающая значение за одну операцию. НЕ "звучит мягко/нежно". Три допустимых формата:
- **(a) Интернационализм:** "X почти как Y в русском/английском, означает то же самое."
- **(b) Фонетическая зацепка с объяснением:** "X звучит похоже на Y, а Y связано с <значение> потому что <причина>."
- **(c) Морфология:** "X = prefix + root, где prefix значит <Y>, root значит <Z>, вместе — <значение>."

### Правило quiz-дистракторов
Для темы kitchen — все 3 дистрактора из той же темы (или из близких — `eating-out`, `shopping`). НЕ миксовать типы (если правильный — Object, дистракторы тоже Object).

### Правило flavorText
- C: 5-10 слов, 1 фраза, повседневный быт
- UC: 6-12 слов, контекстная миниатюра
- R: 8-15 слов, 1-2 реплики диалога, показывает нюанс
- SR: 10-20 слов, обязательно культурный контекст (аргентинский)

### Распределение рарностей в теме kitchen
Грубая рекомендация (можно варьировать на ±5):

| Рарность | Кол-во | Примеры кандидатов |
|----------|--------|--------------------|
| C | 50 (60%) | pan, leche, café, agua, manzana, plato, vaso, sal, cuchillo, tenedor, sartén, olla, cocinar, comer, beber, ... |
| UC | 20 (25%) | hervir, freír, cortar, probar, hambriento, sabroso, crudo, aceitoso, merienda, sobremesa, ... |
| R | 10 (12%) | sobras, picar, enfriar, asado, parrilla, mate, medialuna, ... |
| SR | 3 (3%) | morfi (lunfardo "еда"), manducar, tragón, ... |
| SSR | 0-1 | (опционально) — какая-то идиома типа "echar leña al fuego" если уместно |

**Итого:** ~83 слова в теме, плюс 11 существующих (если пересекаются — объединяем, не дублируем).

### Распределение по типам в теме kitchen

| Type | Примерно | Примеры |
|------|----------|---------|
| Object | 50% | pan, plato, cuchillo, sartén, manzana, ... |
| Action | 30% | cocinar, comer, freír, hervir, cortar, ... |
| Emotion | 5% | hambriento, sediento, satisfecho, ... |
| Place | 10% | cocina, heladera, horno, despensa, ... |
| Expression | 5% | morfi, echar leña, buen provecho, ... |

---

## Процесс (ИНТЕРАКТИВНЫЙ с Aleksei)

TASK-051 — это НЕ "агент сгенерил и сохранил". Это **диалог**, в котором каждый блок слов проходит ревью.

### Шаг 1 — Скелет темы (25-30 слов, приоритет C + базовые UC)

Агент готовит первый черновой список 25-30 слов в формате SeedWord, включающий:
- 5-10 существующих (улучшенных из seed-words-common/uncommon) — `cocinar`, `agua`, `comida`, `café`, `cuchara`, `plato`, ...
- 15-20 новых — `pan`, `leche`, `cuchillo`, `tenedor`, `sartén`, `olla`, `sal`, `azúcar`, `manzana`, `tomate`, ...

Формат: TypeScript-массив готовый к вставке в `seed-theme-kitchen.ts`, полными полями.

Aleksei ревьюит:
- Выбор слов (ничего не пропущено из очевидных? Слишком очевидные слова?)
- Стиль hint (работают ли мнемоники?)
- Стиль flavor (звучит ли как Rioplatense?)
- Квизы (дистракторы осмысленные?)
- Переводы (точные, без канцелярщины?)

### Шаг 2 — Правки и вторая пачка (ещё 25-30 слов)

Агент применяет правки из Шага 1, выдаёт вторую пачку (UC + начало R).

### Шаг 3 — Третья пачка (R + SR + добивка)

R-слова (asado, parrilla, mate, medialuna), SR (аргентинский сленг про еду), возможно один SSR.

### Шаг 4 — Финал: собранный файл

Агент собирает финальный `backend/scripts/seed-words-kitchen.ts` с всеми ~80 словами. Импорт в `seed-words.ts` добавляется рядом с другими.

**Важно:** существующие 11 слов kitchen в seed-words-common/uncommon **удаляются** после миграции в новый файл — чтобы не было дублей.

### Шаг 5 — Запуск seed, проверка

- `npm run seed` — новая тема загружается в БД
- Открыть бустер kitchen — проверить что тянет только kitchen-слова
- Проверить qual дистракторов в quiz

### Шаг 6 — Извлечение AI-промпта (`docs/content-generation-prompt.md`)

На основе эталонной темы сформировать промпт для AI-генерации следующих тем. Формат:

```markdown
# Content Generation Prompt — LangGacha Theme Generation

## System prompt
Ты помогаешь собирать тематические пачки слов для LangGacha — гача-игры для изучения **аргентинского испанского** (Rioplatense).

## Контекст
- Диалект: Rioplatense (voseo, lunfardo для R/SR)
- Правило регистров: ...
- Правило мнемоник: ...
- Правило квизов: ...

## Few-shot examples (из темы Kitchen)
[15-20 эталонных слов из TASK-051 как reference]

## Anti-examples (из audit)
[5-10 "как НЕ надо", с объяснением]

## Структура SeedWord
[тип + описание каждого поля]

## Инструкция
Сгенерируй тему {theme_key} с распределением: {N}C + {M}UC + ... Слова должны быть всеми разными, не дублироваться между собой и не дублировать Core-список: {список Core}.

Формат вывода: TypeScript массив SeedWord[] готовый к вставке в seed-theme-{key}.ts.
```

---

## Содержимое тем: конкретный список-стартёр

### Словарь темы kitchen — кандидаты на включение

**Существующие (из seed-words-*.ts, нужна ревизия):**
- cocina (Place), cocinar (Action), agua (Object), comida (Object), café (Object), ...

**Объекты — посуда и приборы:**
plato, vaso, copa, taza, cuchara, tenedor, cuchillo, servilleta, mantel, olla, sartén, cacerola, bandeja, bol, colador, rallador, tabla (de cortar), abrelatas, sacacorchos, pava (арг. чайник), mate (сосуд)

**Объекты — продукты базовые:**
pan, leche, huevo, queso, manteca, aceite, sal, azúcar, pimienta, harina, arroz, fideos, pollo, carne, pescado, verdura, fruta, manzana, banana, naranja, tomate, papa, cebolla, ajo, zanahoria, lechuga, palta, yerba (для мате)

**Объекты — аргентинские специфические:**
asado, parrilla, chimichurri, empanada, milanesa, medialuna, facturas, alfajor, dulce de leche, mate (напиток), chorizo, morcilla, provoleta

**Действия:**
cocinar, comer, beber, tomar (в смысле "пить"), freír, hervir, hornear, asar, picar, cortar, pelar, mezclar, revolver, servir, probar, masticar, tragar, morfar (lunfardo "есть"), chamuyar (нет, не сюда — это говорить)

**Места в теме:**
cocina, heladera (арг. холодильник), horno, microondas, despensa, alacena

**Эмоции / состояния:**
hambre (tener hambre), sed (tener sed), satisfecho, lleno, hambriento, sediento, sabroso, rico, delicioso, soso, salado, dulce, amargo, picante

**Выражения:**
¡Buen provecho!, ¡salud! (тост), la sobremesa, morfi (еда, lunfardo), tener una panza (переел), hacer sopa (быстро надоело — идиома), estar en la cocina (переносно)

---

## Что НЕ делать

- **НЕ** генерировать весь файл одним махом без ревью Aleksei — дробить на шаги
- **НЕ** копировать слова один-в-один из существующего seed без улучшения hints/flavors
- **НЕ** добавлять в тему слова, которые очевидно лежат в другой теме (например, `trabajar` — это Core)
- **НЕ** забывать про Core — проверять, что не дублируется с Core-списком
- **НЕ** нарушать правило voseo во flavor-текстах
- **НЕ** использовать "звучит мягко/нежно/резко" в мнемониках — только конкретные ассоциации

---

## Критерии готовности

- [ ] `backend/scripts/seed-words-kitchen.ts` создан, содержит ~80 слов
- [ ] Существующие 11 слов kitchen удалены из seed-words-common.ts и seed-words-uncommon.ts (или улучшены и перенесены в новый файл)
- [ ] Импорт kitchen в seed-words.ts
- [ ] `npm run seed` проходит, тема загружается
- [ ] Открытие бустера kitchen работает, возвращает kitchen-слова
- [ ] Quiz дистракторы осмысленные (проверка на 5-10 случайных карт из темы)
- [ ] `docs/content-generation-prompt.md` создан на основе эталона
- [ ] Все 80 слов прошли ревью Aleksei (минимум 3 итерации)
- [ ] progress.md обновлён (раздел TASK-051)
- [ ] content-plan.md обновлён: задачи 3.1 и 3.2 → ✅, 5.2 (kitchen) → ✅

---

## После завершения

Далее — генерация остальных тем из Этапа 5. Порядок:
1. Сначала оставшиеся 14 приоритетных A1 тем (home, eating-out, morning-routine, clothing, body-health, feelings, weather-seasons, family, city-streets, shopping, greetings-courtesy, asking-directions, school-education, time-moments)
2. После ~5 тем (~500 слов) — контрольная точка (2.18.6): Aleksei играет неделю, собираем фидбек
3. По фидбеку — либо продолжаем A2, либо полируем базу

---

## Memory updates после завершения

- `project_content_foundation.md` — обновить статус: TASK-051 завершён, эталон kitchen собран, AI-промпт в `docs/content-generation-prompt.md`
- Возможно новый memory-файл `feedback_content_style.md` — если по ходу ревью Aleksei даст общие правила по стилю контента, которые стоит унести в долгую память
