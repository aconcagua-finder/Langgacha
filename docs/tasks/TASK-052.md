# TASK-052: Learning Curve Rebalance — 100 levels, honest CEFR, fresh rotation, ThemeProgress

**Путь к файлу задачи:** `docs/tasks/TASK-052.md`
**Родительский план:** `docs/content-plan.md` (Stage 4: Learning Curve Calibration)
**Статус:** ✅ Done (2026-04-09)

## Итоги выполнения

- **100-level collection ladder** в 3 эпохах (Metales/Piedras/Cosmos), формула curvы tri-phase (linear → 5% → 4.5% → 3.5%), 6 CEFR-certified anchors с точными real-world match (A1 @ L25=504 words, A2 @ L40=998, B1 @ L55=1932, B2 @ L75=4233, C1 @ L92=7597, C2 start @ L100=10003)
- **Ускорение фазы 1 Word XP**: lvl 1-5 с 25 → 15 XP, lvl 6-10 с 40 → 30 XP, lvl 11-15 с 60 → 50 XP. Фазы 16+ без изменений
- **WORD_XP_NEW_WORD_BONUS = 10** для первых 2-х квизов на слово
- **Fresh rotation auto-select** (frontend/src/utils/autoSelectBattleCards.ts): tier 1 fresh (level<5) 35% / tier 2 overdue 35% / tier 3 power 30%, с fallback переполнением слотов
- **Adaptive booster duplicate bias**: при `unreviewedCount > 30` каждый слот бустера 50% шанс стать дубликатом существующего слова игрока (не core slots). Throttling overflow без ломки гачи
- **ThemeProgress derived layer**: per-theme `wordsLearned / wordsMastered / percentLearned / percentMastered / status` (Locked/InProgress/Learned/Mastered)
- **CEFR coverage honest**: `percentToNextAnchor` в DTO, UI показывает "30% от real A1" на промежуточных тирах, "👑 Real A2 achieved" на круглых
- **Frontend CollectionPage**: новый hero с epoch gradient (Metales amber / Piedras emerald / Cosmos violet), CEFR crown badge, next level preview, theme progress grid (37 тиров с emoji и progress bars)
- **GuidePage** показывает 6 CEFR milestones вместо 100 уровней + пояснение про 94 промежуточных подступени
- **Migration notes**: схема БД НЕ менялась, все изменения на уровне derived computation. Старые игроки автоматически пересчитываются при следующем `/api/player`
- **Backend build clean, Frontend build clean**, Docker watch подхватил изменения
- **Live verify**: смоделирован новый игрок с 60 progressed kitchen words → получил "Cobre III (Metales)", 12% real A1, correct theme progress % per theme (eating-out 72%, kitchen 67%). Отдельный игрок с 50 unreviewed words → при 5 бустерах получил 46% дубликатов (целевое 50%), подтверждая adaptive bias. Все новые поля присутствуют в `/api/player`

**Что НЕ сделано (не блокирующее):**
- Анимации CEFR milestone celebration (когда игрок пересекает L25/40/55/75/92/100) — TODO для UI полировки позже
- Achievements / unlock rewards при переходе в новую эпоху — можно добавить позже
- Sound effects на ранк-апах — позже

## Следующий шаг

**TASK-053..067**: массовая генерация тем по `docs/content-generation-prompt.md`. Начинаем с остальных 14 A1 тем (home, feelings, greetings-courtesy, ...), затем A2, затем B1, затем — расширение таксономии для B2/C1/C2. Цель — довести базу до ~10000 слов.

---

**Тип:** Большой механический rebalance + новая 100-ступенчатая система
**Блокеры:** TASK-050 и TASK-051 завершены

---

## Цель

Перебалансировать кривую обучения ДО массовой генерации остальных тем. Обнаруженные проблемы математического анализа:

1. **Плоская фаза 1:** нужно 10-11 квизов чтобы довести слово до level 5 (Anki/Duolingo — 3-5)
2. **Новые слова не в приоритете автоподбора:** игрок открыл бустер сегодня, но слова попадут в бой только когда станут Worn (через день). Упущен момент максимального внимания.
3. **Overflow коллекции:** бустеры приносят 21 новое слово/день, боевая система прокачивает ~10-30 слов/день. Несоответствие → коллекция растёт быстрее чем SRS её закрепляет → массовая ветхость.
4. **Нереалистичные CEFR пороги:** B1+ Master = 200 слов на avg level 18 (реальный B1 = ~2000 активных слов). Образовательный обман.
5. **Отсутствие дофамина в long-term прогрессии:** всего 6 collection levels → мало milestone-ов для daily motivation.

Решение (согласовано с Aleksei):

1. **100 уровней коллекции** в трёх тематических эпохах (Metales → Piedras → Cosmos)
2. **CEFR anchors** на levels 25/40/55/75/92 — реальные образовательные milestone-ы с crown-анимацией и бейджами
3. **Ускорение фазы 1** (lvl 1-5 слова с 25 XP до 15 XP) и `WORD_XP_NEW_WORD_BONUS`
4. **Fresh rotation** в автоподборе (новые слова в приоритете наравне с ветхими)
5. **Adaptive duplicate bias** в бустерах при перегрузе коллекции
6. **ThemeProgress** — отдельный layer прогрессии (% освоения каждой темы)
7. **Честный UI**: показывать игроку реальный процент от CEFR (например, `"Principiante 150/500 real A1 words (30%)"`)

---

## Часть 1 — Новая кривая коллекции (100 уровней)

### Математика кривой

Тройная фаза, подобрана поиском по параметрам с целью попасть в CEFR anchors:

```
Phase 1 (L1-18):  linear, width[L] = 18 + (L-1) * 20
Phase 2 (L19-30): exponential, width[L] = width[L-1] * 1.050
Phase 3 (L31-65): exponential, width[L] = width[L-1] * 1.045
Phase 4 (L66-100): slowed exp, width[L] = width[L-1] * 1.035
```

### CEFR anchors (проверено)

| Gameplay Level | Width (words @ lvl>=5) | Real CEFR | Match |
|---|---|---|---|
| **25** (Oro V) | 504 | A1 = 500 | ✅ +0.8% |
| **40** (Jade V) | 998 | A2 = 1000 | ✅ -0.2% |
| **55** (Esmeralda V) | 1932 | B1 = 2000 | ✅ -3.4% |
| **75** (Estrella V) | 4233 | B2 = 4000 | ✅ +5.8% |
| **92** (Galaxia II) | 7597 | C1 = 8000 | ✅ -5.0% |
| **100** (Eternidad V) | 10003 | ~C2 start | ✅ +0.0% |

### 100 названий уровней (3 эпохи)

**Эпоха 1: Metales (levels 1-30)** — "От ученика к мастеру"
- Cobre I-V (L1-5)
- Bronce I-V (L6-10)
- Hierro I-V (L11-15)
- Plata I-V (L16-20)
- Oro I-V (L21-25) ← **Oro V = A1 anchor**
- Platino I-V (L26-30)

**Эпоха 2: Piedras (levels 31-65)** — "Кристаллизация знаний"
- Ónix I-V (L31-35)
- Jade I-V (L36-40) ← **Jade V = A2 anchor**
- Turquesa I-V (L41-45)
- Zafiro I-V (L46-50)
- Esmeralda I-V (L51-55) ← **Esmeralda V = B1 anchor**
- Rubí I-V (L56-60)
- Diamante I-V (L61-65)

**Эпоха 3: Cosmos (levels 66-100)** — "За пределы повседневного"
- Luna I-V (L66-70)
- Estrella I-V (L71-75) ← **Estrella V = B2 anchor**
- Constelación I-V (L76-80)
- Nébula I-V (L81-85)
- Galaxia I-V (L86-90) ← **Galaxia II = C1 anchor**
- Cosmos I-V (L91-95)
- Eternidad I-V (L96-100)

### Структура CollectionLevel

```typescript
type CollectionLevel = {
  level: number;                  // 1-100
  name: string;                   // "Oro V"
  shortName: string;              // "Oro" (для бейджей и короткого UI)
  roman: string;                  // "V" (I..V, для подпоказа)
  epoch: "Metales" | "Piedras" | "Cosmos";
  widthRequired: number;          // ширина (cnt слов с level >= 5)
  minAvgWordLevel: number;        // минимальный средний word-level
  realCefr: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;  // ← null или круглый marker
  cefrCertified: boolean;         // true для 25/40/55/75/92 — CEFR crown
  unlockedRarities: readonly string[];  // C/UC/R/SR/SSR
};
```

### Rarity unlock curve

Распределение прав на rarity по эпохам:
- **Cobre I-V (1-5):** C
- **Bronce I+ (6+):** C, UC
- **Plata III+ (18+):** C, UC, R
- **Oro III+ (23+):** C, UC, R, SR
- **Jade III+ (38+):** C, UC, R, SR, SSR

Игрок начинает только с C, но уже на L18 (Plata III) получает R — это около 2 недель игры при активном темпе. SSR на L38 — около 2-3 месяцев. Это честный unlock для гачи: первые 2 недели игрок "настраивается", потом получает полный диапазон.

### CEFR coverage percent

Для тиров БЕЗ CEFR anchor (все кроме 25/40/55/75/92/100) — показываем процент **от ближайшего next anchor**:

- L10 (Bronce V = 198 words): `39% от real A1 (500)` — до ближайшего anchor
- L25 (Oro V = 504): `✓ Real A1 achieved`
- L32 (Ónix II = 702): `70% от real A2 (1000)` — между A1 и A2

Это честно: не обманываем ни в одну сторону. Игрок видит где он относительно реального CEFR.

---

## Часть 2 — Word XP rebalance

### Текущее (TASK-048)

```
lvl 1-5: 25 XP/level (125 total to reach lvl 5)
lvl 6-10: 40 XP/level
lvl 11-15: 60 XP/level
...
```

WORD_XP_BASE = 10, + typing +5, + reverse +3, + overdue +5. Средний правильный ответ: ~12-15 XP.

**Результат:** 10-11 правильных ответов чтобы довести слово до "знакомого" (lvl 5). Слишком медленно.

### Новое

```
lvl 1-5: 15 XP/level (75 total to reach lvl 5)  ← -40%
lvl 6-10: 30 XP/level  ← -25%
lvl 11-15: 50 XP/level ← -17%
lvl 16+: без изменений
```

Плюс новый бонус:
```
WORD_XP_NEW_WORD_BONUS = 10  // первые 2 правильных ответа по слову (level 0 и level 1)
```

### Результат

- Слово с 0 до level 5: ~6 квизов (было ~11) — **40% ускорение**
- Первое попадание: даёт 20-22 XP (было 10-12) — слово прыгает 0→2 с одного ответа
- Глубокие уровни (16+) без изменений — там дофамин не нужен, там уже "полировка"

---

## Часть 3 — Fresh rotation в автоподборе

### Текущее (`battle.service.ts::autoSelect`)

Приоритет:
1. Условие ветхости (Worn, Deteriorated > Normal, Brilliant)
2. Сильнейший экземпляр из группы
3. Дедупликация по слову

**Проблема:** свежие слова (только что из бустера) остаются в состоянии Normal/Brilliant несколько дней до первой ветхости. В приоритет автоподбора они не попадают → игрок их не встречает → упущен момент максимального внимания.

### Новое — трёхтиерный приоритет

**Tier 1 — Fresh rotation (30-40% deck):**
Слова с `lastReviewedAt` > 0 дней назад (или null), `level < 5`. Это новые слова, которые ещё не устаканились в памяти. Тянем их агрессивно первые 1-3 дня.

**Tier 2 — Overdue review (30-40% deck):**
Слова в Worn/Deteriorated. Стандартное ветхостное ревю.

**Tier 3 — Power slots (20-30% deck):**
Сильнейшие карты с хорошим состоянием. Для урона/кача мастерства.

Параметры:
```ts
AUTOSELECT_FRESH_SLOTS_RATIO = 0.35
AUTOSELECT_OVERDUE_SLOTS_RATIO = 0.35
AUTOSELECT_POWER_SLOTS_RATIO = 0.30
AUTOSELECT_FRESH_MAX_LEVEL = 5
AUTOSELECT_FRESH_MAX_AGE_HOURS = 72  // только если последнее ревю было <=3 дня назад
```

Количество слотов на tier = `round(BATTLE_DECK_SIZE * ratio)`.

---

## Часть 4 — Adaptive booster duplicate bias

### Текущее

Бустер тянет по теме + pity + core drop (15% шанс на слот). Каждая карта — **новая случайная** (из пула словаря темы), даже если у игрока 200 неосвоенных слов в коллекции.

### Проблема

Игрок быстро накапливает 200+ необкатанных слов. Новая колода не помогает им — она **добавляет ещё больше** new unreviewed cards. Коллекция разбухает, а знания нет.

### Новое

Если у игрока `unreviewed_count > BOOSTER_DUPLICATE_BIAS_THRESHOLD` (= 30 слов с level < 5), половина слотов бустера **переключается** на "повторение" — тянет существующие слова игрока вместо новых.

Реализация:
1. В `boosters.service::openBooster`, в начале — посчитать `unreviewed = count(WordProgress where level < 5)`
2. Если `unreviewed > 30`, для каждого слота определить `isDuplicateSlot = Math.random() < 0.5`
3. Если isDuplicateSlot: вызвать новую функцию `pickFromPlayerCollection(playerId, theme, rarity)` — выбирает random word из уже имеющихся у игрока в теме
4. Иначе: обычный pickRandomWord из пула

```ts
BOOSTER_DUPLICATE_BIAS_THRESHOLD = 30
BOOSTER_DUPLICATE_BIAS_RATIO = 0.5  // когда включается, 50% слотов — копии
```

**Почему так:** игрок всё ещё получает новые слова (50%), но ещё и повторы — которые дают XP и closure на существующих словах. Это превращает бустер в "колоду свежего воздуха" для уже начатого.

---

## Часть 5 — ThemeProgress layer

### Что это

Per-theme прогресс. Вычисляется из `WordProgress` на лету. Не хранится в БД.

```typescript
type ThemeProgressDto = {
  themeKey: string;
  themeName: string;            // nameRu из Theme
  emoji: string | null;
  epoch: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";  // из cefrTier темы
  wordsTotal: number;           // сколько слов в теме всего
  wordsLearned: number;         // сколько игроком освоено (level >= 5)
  wordsMastered: number;        // сколько доведено до level >= 10
  percentLearned: number;       // 0-100
  percentMastered: number;      // 0-100
  status: "Locked" | "InProgress" | "Learned" | "Mastered";
};
```

**Statuses:**
- `Locked` — если `themes.cefrTier > player.cefrMaxLevel` (тема недоступна)
- `InProgress` — percentLearned < 80
- `Learned` — percentLearned >= 80
- `Mastered` — percentMastered >= 80

Это новый layer дофамина: "Kitchen 76% → 80% → *Learned*". На фронте — прогресс-бар per theme с celebrate анимацией при достижении `Learned` или `Mastered`.

В `PlayerDto.themeProgress: ThemeProgressDto[]` — отсортировано по `percentLearned desc`.

---

## Часть 6 — Frontend updates

### CollectionPage

Новые блоки:
- **Hero**: крупный бейдж с именем уровня (`Oro V` / `Jade III`), эпохой, крон-иконкой если CEFR anchor, прогресс-бар до следующего sub-rank, процент от реального CEFR
- **Theme Progress Grid**: маленькие карточки per theme с progress-бар, emoji, статусом (Locked/InProgress/Learned/Mastered)

### Типы

`frontend/src/api/player.ts` обновить:
```ts
export type PlayerDto = {
  // ...existing...
  collectionLevelNumber: number;     // 1-100
  collectionLevelName: string;       // "Oro V"
  collectionLevelEpoch: string;      // "Metales"
  collectionLevelCefrCertified: boolean;
  collectionCefrProgress: { realCefr: string; percent: number };  // "A2" → 75%
  wordsWidth: number;
  widthRequired: number;
  avgWordLevel: number;
  minAvgLevel: number;
  nextLevelName: string | null;
  unlockedRarities: string[];
  unlockedThemes: string[];
  cefrMaxLevel: string;
  themeProgress: ThemeProgressDto[];  // новое
};
```

---

## Часть 7 — Что НЕ делать

- **НЕ** менять механику ветхости (условия Worn/Deteriorated)
- **НЕ** менять формулы боя, урона, HP
- **НЕ** переделывать quiz types (translate/reverse/typing — оставить как есть)
- **НЕ** менять схему БД (ThemeProgress — derived, не persisted)
- **НЕ** удалять старые COLLECTION_LEVELS до подтверждения всех site-ов использования
- **НЕ** запускать `prisma migrate reset`

---

## Критерии готовности

- [ ] COLLECTION_LEVELS 100 тиров в constants.ts
- [ ] WORD_XP_PER_LEVEL rebalance + NEW_WORD_BONUS
- [ ] player.service считает новую кривую + CEFR coverage
- [ ] player.service отдаёт ThemeProgress
- [ ] word-progress.service: new word bonus в awardWordXp
- [ ] battle.service: trie-tier auto-select (fresh/overdue/power)
- [ ] boosters.service: adaptive duplicate bias при overflow
- [ ] player.types обновлены
- [ ] frontend типы обновлены
- [ ] frontend CollectionPage показывает новый UI
- [ ] Backend + frontend compile clean
- [ ] Docker db:setup проходит
- [ ] SQL-симуляция: игроку проставляется wordProgress, API возвращает корректный collectionLevel и themeProgress
- [ ] progress.md обновлён
- [ ] content-plan.md обновлён (новая Stage 4)
- [ ] memory files обновлены

## После завершения

Следующий шаг — **TASK-053: massive theme generation**. Home, feelings, greetings-courtesy и т.д. по `content-generation-prompt.md`. Цель: ~2000-3000 слов за несколько сессий, по одной теме за раз.
