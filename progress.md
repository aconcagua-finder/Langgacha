Original prompt: забирай задачу в работу - docs/tasks/TASK-043.md

Visual thesis: экран боёв должен ощущаться как командный центр с двумя сильными режимами, а primary-кнопки как единый яркий экшен-акцент по всему приложению.
Content plan: общий заголовок battles hub, две обзорные секции режимов, полноэкранная боевая/рейдовая фаза, затем возврат в hub.
Interaction thesis: обзорные карточки с мягким свечением, gradient-primary для всех основных CTA, переключение hub -> active mode без табов и без лишнего UI.

TODO:
- Добавить bossTranslationRu в Prisma/raid service/types и миграцию.
- Пересобрать BattlesPage без табов, с одновременным обзором Battle/Raid.
- Упростить overview боя, скрыть автоподбор карт, обновить рейдовый overview и BossCard.
- Вынести общий стиль primary-кнопки и заменить старые варианты.

Progress:
- Backend обновлён: `bossTranslationRu` добавлен в schema/types/service/generator босса, создана миграция `20260324112000_add_boss_translation` с backfill существующих `RaidDay`.
- Battles hub собран без табов: overview показывает бой и рейд рядом, активная фаза любого режима прячет обзор и раскрывается во всю ширину.
- Battle overview упрощён: убраны preview автоподбора и кнопка refresh, оставлены компактные статусы и CTA.
- Raid overview получил описание механики, перевод босса и более компактный summary-card; `BossCard` теперь выводит перевод под словом.
- Primary CTA сведены в общий `.btn-primary` и проставлены по страницам/модалкам.

Verification:
- `frontend`: `npm run build` — OK.
- `backend`: `npm run build` — OK.
- `prisma migrate dev` запускался штатно, но dev-база уже находится в drift относительно migration history и Prisma предлагает destructive reset; reset сознательно не делался.
- Для локальной разработки колонка и backfill применены напрямую в dockerized Postgres, Prisma client в backend-контейнере перегенерирован.
- Playwright snapshot на `/battles` подтвердил новый общий hub с двумя секциями; wrapper подвисал на повторной навигации, поэтому перевод босса дополнительно подтверждён прямым SQL-запросом к dev-базе.

Notes:
- В рабочем дереве есть сторонние пользовательские изменения (`docs/ROADMAP.md`, удалённый `TASK-042`, untracked `docs/tasks/TASK-043.md`), их не трогал.

TASK-044 visual polish:
- Убран page-level header с `/battles`; экран теперь начинается сразу с двух режимов.
- Overview-карточки растянуты по высоте через `items-stretch` + `h-full` на контейнерах.
- Иконки упрощены до крупных emoji (`⚔`, `🐉`), убраны правые верхние бейджи, белые внутренние обводки заменены на более тихие slate-границы.
- Battle overview сокращён до одного compact deck-status блока; лишние нижние пояснения убраны.
- CTA в обеих карточках сидят внизу и стали `w-full` на mobile / `auto` на desktop.

TASK-044 verification:
- `frontend`: `npm run build` — OK.
- Playwright snapshot `/battles` — OK: header исчез, обе карточки рендерятся в overview, перевод босса виден.
- Playwright wrapper стабильно отдаёт `snapshot`, но `screenshot/resize` подвисают по stdout; mobile-pass проверял через тот же session flow и snapshot, но без сохранённого PNG-артефакта.

TASK-045 compact cards:
- Battles overview дополнительно сжат по вертикали: меньшие page paddings/gaps, более компактные headers, убраны служебные sublabels.
- Battle card получила короткую инфо-строку `Колода / Слов`, а статус теперь показывается только при проблеме (пусто или неполная колода).
- Raid card переведена на inline-подачу босса и stats в одну строку; status-block сжат до `text-xs` и показывается только в особых состояниях.

TASK-045 verification:
- `frontend`: `npm run build` — OK.
- Playwright snapshot `/battles` после правок — OK: overview ещё компактнее, обе CTA присутствуют прямо в snapshot без дополнительных промежуточных секций.
- Попытка снять точный `innerHeight/scrollHeight` через wrapper снова подвисла по stdout, поэтому критерий fit проверял по сокращённой DOM-структуре snapshot-а, а не численным метрикам viewport.

TASK-046 balanced cards:
- `BattlesPage` получил обратно чуть больше вертикального воздуха по `py`, а зазор между двумя overview-карточками поднят до `gap-5`.
- `BattleOverviewCard` возвращена к среднему масштабу: `p-6`, `gap-4`, `h-12` icon, `text-2xl` header, полное `text-sm` описание без `truncate`.
- В battle overview восстановлен третий стат `В коллекции`, для этого `collectionCount` вернулся в пропсы карточки; info-block снова состоит из трёх inline-метрик и визуально заполняет карту.
- `RaidOverviewCard` приведена к той же иерархии: полный `text-sm` header, отдельный компактный boss-block и отдельный stats-block с `HP / Карты / Ваш урон`.
- Status-block-и на overview оставлены только для особых состояний и подняты до `text-sm`, CTA в обеих карточках сохранены внизу без изменений active-phase логики.

TASK-046 verification:
- `frontend`: `npm run build` — OK.
- Playwright flow: login -> `/battles` — OK, snapshot `.playwright-cli/page-2026-03-24T23-41-55-803Z.yml` подтверждает обе overview-карточки на странице, полные описания без `truncate`, battle info-block на 3 стата и отдельные boss/stats-блоки у рейда.
- Wrapper по-прежнему ненадёжен для точных viewport-метрик (`eval/resize/open` могут подвисать или сбрасывать session), поэтому fit на 1440×900 подтверждал по итоговому overview snapshot и сокращённой вертикальной структуре карточек, а не числовым замерам `scrollHeight`.

TASK-047 top nav polish:
- `TopNav` обновлён точечно: `Бустер` переименован в `Бустеры`, а desktop-nav вынесен в абсолютно центрированный слой внутри `relative` header container.
- Левый brand-block и правый utility-block получили `z-10`, чтобы навигация центрировалась относительно всей шапки, но не конфликтовала по слоям с лого и user controls.
- В desktop dust-chip убрано слово `Пыль`; в mobile profile-block тоже оставлен только `✨` + число.
- Блок `username + Выйти` на desktop заменён на username-button с dropdown-меню, затемнённым overlay, logout action внутри меню и закрытием по outside-click.
- Добавлены `userMenuOpen` state, Escape-close для dropdown и закрытие dropdown вместе с hamburger-menu при смене `pathname/search`.

TASK-047 verification:
- `frontend`: `npm run build` — OK.
- Playwright snapshot `.playwright-cli/page-2026-03-24T23-50-09-388Z.yml` на `/battles` подтверждает обновлённую шапку: label `Бустеры`, центральный nav-block, desktop dust-chip без слова `Пыль` и user button вместо старой пары `username + Выйти`.
- Wrapper в этом сеансе снова подвисал на интерактивном click по user-trigger, поэтому open-state dropdown без стабильного snapshot-артефакта не зафиксирован; сам dropdown, overlay, Escape-close и route-close проверены по коду и через зелёную сборку.

TASK-049 content foundation analysis (2026-04-09):
- `docs/content-plan.md` создан (v1.1 после ревью Aleksei) — главный план фазы 2.18
- `docs/content-audit.md` создан — аудит 150 слов (~32 критичных проблемы, 18 эталонных)
- `docs/taxonomy.md` создан — 6 доменов, 37 тем, 150 legacy слов разложены
- Решения Aleksei зафиксированы: Rioplatense диалект (voseo ок везде), 11 спорных слов, Core как флаг, правило мнемоник, Expression блокируется до A2
- `docs/tasks/TASK-049.md`, TASK-050.md, TASK-051.md созданы

TASK-050 schema migration + content foundation (2026-04-09):
- Prisma schema: +cefrLevel/isCore/dialect на Word, новые модели Theme (37 themes) и WordTheme (m2m с isPrimary)
- Миграция `20260409173454_content_foundation_themes/migration.sql` (SQL, для истории; реальный push через `db:push`)
- `scripts/seed-themes.ts` — 37 тем с orderIndex, 13 A1 (приоритет 1-15) + 16 A2 + 8 B1
- `scripts/seed-words-taxonomy.ts` — маппинг 150 legacy conceptKey → {cefrLevel, isCore?, themes[]}, 0 пропусков
- `scripts/seed-words-core.ts` — 12 новых базовых глаголов (ser/estar/tener/haber/poder/vivir/trabajar/saber/conocer/dar/decir/gustar) закрывают A1-gap из audit. Voseo в flavor, мнемоники по новому правилу (конкретные ассоциации)
- `scripts/seed.ts` — upsert Theme → Word → rebuild WordTheme, валидация ключей, warn на unknown refs
- `cards.generator.ts` — pickRandomWord добавлены themeKey / cefrMaxLevel / excludeCore / coreOnly + graceful fallback при пустой теме. toDto добавляет themes/primaryTheme/cefrLevel/isCore
- Все точки `include: { word: true }` обновлены на `include: { word: { include: { wordThemes: true } } }` (cards.service, battle.service, battle.bot, evolution.service, raid.service)
- `boosters.service.ts` — выбор случайной темы из player.unlockedThemes, per-slot core-plan (BOOSTER_CORE_DROP_CHANCE=15%, cap=2), обратно-совместимая сигнатура
- `quiz.generator.ts` — distractor priority: sameThemeAndType > sameTheme > sameType > sameRarity > sameLanguage > any. Добавлена clearDistractorCache. wordThemes проброшен из battle/bot/raid
- `player.service.ts` — PlayerDto +unlockedThemes +cefrMaxLevel, CEFR_MAX_BY_COLLECTION_LEVEL map
- Frontend: `types/card.ts` и `api/player.ts` синхронизированы с backend DTO

TASK-050 verification:
- `backend`: `npm run build` — OK
- `frontend`: `npm run build` — OK (300 kB bundle, 85 kB gzipped, 85 modules)
- `prisma validate` — OK
- Taxonomy verify script (одноразовый): 162 words, 150 legacy (все с taxonomy), 12 new, 27 core total, 0 битых theme refs, 4 пустых темы (заполнятся в Этапе 5)
- Docker seed — не запускался в этой задаче, ждёт ручного запуска (порт 5432 на машине был занят другим проектом). Для применения миграции локально: `npm run db:setup` (в backend)

TASK-050 post-verification в Docker (2026-04-09):
- `.env` POSTGRES_PORT сменён на 55432 (редкий, избегает конфликта с соседним проектом mediagenerator-postgres-1)
- `docker compose down && docker compose up -d` — стек перезапущен, network пересоздана
- `db:setup` прошёл через `db:push` (не migrate), seed загрузил 170 слов (162 ожидаемых + 8 zombie со старой БД)
- 8 слов с `conceptKey IS NULL` найдены в БД (bajón/bondi/che/desvelarse/laburar/manejar/orgulloso/¿Qué tal? — осколки предыдущих версий seed). Удалены вручную через SQL вместе с их Card/WordProgress
- Итог: 162 слова в БД (27 core, 135 в темах)
- Smoke tests через API:
  - `/api/player` возвращает `unlockedThemes: [15 A1 тем]` в правильном orderIndex и `cefrMaxLevel: "A1"`
  - `/api/boosters/open` возвращает 7 карт из одной темы (kitchen-пак: cocina+pollo+comida+mesa+té+cocinar) с core-слотами (~15% шанс per slot, cap 2)
  - Тематические бустеры тянут случайную unlocked тему для каждого открытия

TASK-051 kitchen reference theme (2026-04-09):
- `backend/scripts/seed-theme-kitchen.ts` — 88 слов (48 C / 29 UC / 9 R / 2 SR)
- Rioplatense стиль: voseo во всех flavor, rioplatense-вокабуляр (heladera/manteca/palta/papa/yerba/mate/asado/parrilla/milanesa/medialuna/dulce de leche/alfajor/chimichurri/empanada), мнемоники через латинский корень/интернационализм/морфологию
- Распределение: 48 Objects (посуда/продукты/специалитеты), 18 Actions (готовка), 10 Emotions (вкус/голод), 5 Places (cocina/heladera/horno/microondas/alacena), 3 Expressions (buen provecho/salud/sobremesa), 2 Persons (cocinero/panadero), 2 SR lunfardo (morfi/morfar)
- 13 legacy kitchen-слов удалены из `seed-words-common.ts` (11) и `seed-words-uncommon.ts` (2), и из `seed-words-taxonomy.ts` (13 mappings)
- `seed-words.ts` подключает `KITCHEN_WORDS` вторым после `CORE_WORDS`
- Багфикс в `cards.generator.ts`:
  - CEFR-фильтр не применяется к R/SR/SSR рарностям (набор `CEFR_BYPASS_RARITIES`), т.к. R/SR — это гача-моменты для игроков любого уровня
  - Расширенный fallback chain в `pickRandomWord`: cefr → theme → rarity (вместо только theme)
- Live-test в Docker:
  - `db:setup` на свежем seed: 236 слов (27 core + 88 kitchen + 121 legacy), 37 тем, 317 WordTheme links
  - 7 бустеров через API: получены тематически связные паки (kitchen чистый, kitchen + feelings, greetings-courtesy чистый, shopping + money-bank, city-streets + slang-rioplatense). Ни одной ошибки pickRandomWord
  - Reverse quiz с wordLevel >= 2 (прокачал через SQL для теста):
    - `tenedor` (вилка) → дистракторы `milanesa / palta / azúcar` (все kitchen) ✅
    - `cuchillo` (нож) → дистракторы `manteca / queso / asado` (все kitchen) ✅
- `docs/content-generation-prompt.md` — полный шаблон для AI-генерации следующих тем (~450 строк): диалект, CEFR, правила мнемоник/flavor/дистракторов, размеры, anti-patterns, sanity checks

TASK-052 learning curve rebalance (2026-04-09):
- Реальные CEFR thresholds (активный словарь): A1=500 / A2=1000 / B1=2000 / B2=4000 / C1=8000 / C2~16000 — источник правды для шкалы
- `COLLECTION_LEVELS` полностью переделан: 6 → **100 уровней** в 3 тематических эпохах:
  - **Metales** (1-30): Cobre → Bronce → Hierro → Plata → Oro → Platino
  - **Piedras** (31-65): Ónix → Jade → Turquesa → Zafiro → Esmeralda → Rubí → Diamante
  - **Cosmos** (66-100): Luna → Estrella → Constelación → Nébula → Galaxia → Cosmos → Eternidad
  - Каждый ранг = 5 подступеней (I-V), т.е. ranks-up каждые 5 уровней
- **6 CEFR crown milestones** точно попадают в real-world word counts:
  - Level 25 (Oro V) → A1 @ 504 real words
  - Level 40 (Jade V) → A2 @ 998 real words
  - Level 55 (Esmeralda V) → B1 @ 1932 real words
  - Level 75 (Estrella V) → B2 @ 4233 real words
  - Level 92 (Cosmos II) → C1 @ 7597 real words
  - Level 100 (Eternidad V) → C2 start @ 10003 real words
- Кривая формула: tri-phase (linear 18+20L → exp 1.050 → exp 1.045 → exp 1.035)
- Три уровня дофамина: sub-rank (каждые 3-14 дней) → rank-up (каждые 15-100 дней) → CEFR milestone (каждые ~3-18 месяцев)
- Генератор шкалы: `backend/scripts/_generate-collection-levels.ts` (для re-tuning кривой)
- **Word XP phase 1 ускорен**: lvl 1-5 XP с 25 до 15, lvl 6-10 с 40 до 30, lvl 11-15 с 60 до 50. Фазы 16+ без изменений
- **NEW_WORD_BONUS** = 10 XP для первых 2-х уровней слова (initial exposure boost из SRS literature)
- **Fresh rotation auto-select** (frontend/src/utils/autoSelectBattleCards.ts): tier 1 fresh (level<5) 35% / tier 2 overdue (Worn/Deteriorated) 35% / tier 3 power 30%. Fallback: если тир пуст, слоты переливаются в следующие
- **Adaptive booster duplicate bias**: если у игрока >30 unreviewed слов (level<5), каждый не-core слот бустера имеет 50% шанс стать дубликатом существующего слова — throttles raw-new-words inflow
- **ThemeProgress derived layer** в PlayerDto: per-theme {wordsLearned, wordsMastered, percentLearned, percentMastered, status} где status ∈ {Locked, InProgress, Learned, Mastered}. Mastered при percentMastered>=80%, Learned при percentLearned>=80%
- **CEFR coverage honest**: `{lastAchievedCefr, nextAnchor, nextAnchorWidth, percentToNextAnchor}` — UI показывает "30% от real A1" или "👑 Real A2 achieved"
- **PlayerDto полностью переписан**: старые `collectionGachaName/wordsWidthNeeded/avgWordLevelNeeded/nextCollectionLevel` удалены, на их место `collectionLevelName/nextLevelWidth/nextLevelMinAvg/nextLevelName` + `collectionLevelEpoch/collectionLevelCefrCertified/cefrCoverage/themeProgress`
- **Frontend**: CollectionPage полностью переделан — hero с epoch gradient (amber/emerald/violet), CEFR crown badge, 2 прогресс-бара (ширина + глубина), theme progress grid (37 тиров с emoji, progress, status). GuidePage упрощён — показывает только 6 CEFR milestones + пояснение про 94 промежуточных. BoosterPage обновлён под новый формат PlayerDto

TASK-052 verification:
- `backend`: `npm run build` OK, `prisma:generate` OK
- `frontend`: `npm run build` OK (306 kB, 87 kB gzipped, 85 modules)
- Docker stack up (postgres on port 55432), backend watch подхватил все изменения
- Live test свежего игрока `task052test`: `/api/player` вернул `collectionLevel: 1, Cobre I, Metales`, `nextLevel: Cobre II`, `cefrCoverage: {nextAnchor: A1, percent: 0, lastAchieved: null}`, 37 тем в themeProgress (15 InProgress для A1, 16 Locked для A2, 6 Locked для B1)
- Live test progressed player: после insert 60 kitchen wordProgress (50 на level 8, 10 на level 12) игрок показал `Cobre III (Metales), wordsWidth=60, avgWordLevel=9.7, cefrCoverage: 12% real A1`. Темы: eating-out 72%, kitchen 67%, morning-routine 54%, body-health 33%, feelings 23% (из additional-themes legacy mapping)
- Live test duplicate bias: игрок `dupbias` с 50 unreviewed words → 5 бустеров (35 карт), 19 новых уникальных слов + 16 дубликатов = **46% дубликатов** (целевое 50% при BOOSTER_DUPLICATE_BIAS_RATIO=0.5). Работает
- `backend/scripts/_generate-collection-levels.ts` — генератор кривой оставлен как артефакт для re-tuning
