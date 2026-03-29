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
