# LangGacha Taxonomy (draft v1.1)

**Дата:** 2026-04-09
**Статус:** ревью Aleksei пройдено, 11 спорных слов раскладаны, диалект зафиксирован. Готово к TASK-050.
**Родительский план:** [content-plan.md](./content-plan.md) — разделы 2, 3, 4, 5 (особенно 5.6 про диалект и 5.7 про инструмент генерации)
**Задача:** TASK-049 часть 2

> **⚠️ Диалект — Rioplatense Spanish (аргентинский/уругвайский).** Все слова, темы и примеры ориентируются на аргентинский узус. Voseo (`vos tenés`), lunfardo, региональные значения слов — норма. Если у слова разное значение в Аргентине и Испании — берём аргентинское (`boliche = ночной клуб`, не `боулинг`). Подробности — `content-plan.md` § 5.6.

---

## Принципы таксономии

Таксономия трёхслойная: **Domain → Theme → Word**. Домен — это большая сфера жизни (5-6 штук), тема — это конкретная коммуникативная ситуация в ней (30 штук). Слово принадлежит одной главной теме (`isPrimary`) и 0-N вторичным темам: `agua` живёт в `kitchen` как primary, но проявляется ещё в `restaurante` и `morning-routine`. Это реализует "контекстное обучение" — слово встречается в разных ситуациях, а бустер тематически однородный.

**Core** — это служебные слова, которые не привязаны ни к одной ситуации: артикли, местоимения, базовые глаголы бытия/движения, числа, дни недели, базовые предлоги и союзы. Они доступны с нулевого уровня и появляются во всех темах как фоновый словарь. В схеме БД это моделируется флагом `isCore: true` на Word, и слово НЕ имеет записи в WordTheme (либо имеет "псевдо-тему" `core`, финализируется в TASK-050).

**CEFR как ось сложности** — поле `cefrTier` на теме задаёт минимальный уровень игрока, с которого она становится доступна. Это ортогонально рарности: в теме A1 `kitchen` могут быть и C-слова (`pan`), и SR-слова (`olla de hierro fundido`, гипотетически). Игрок A1 получает доступ к темам уровня A1, игрок B1 — ко всем A1+A2+B1. Рарность определяет "редкость" выпадения карты, а CEFR — готов ли игрок встретить это слово вообще.

**Отдельное примечание про Expression-домен** — это специальный домен для идиом, фразеологизмов и сленга. Слова оттуда часто имеют SR/SSR рарность и тянут на A2+ по CEFR, потому что идиому нельзя понять без базового уровня. Expression — это "гача-мечта", а не основа обучения.

---

## Доменная карта

### Domain: Everyday
Бытовая жизнь: дом, еда, тело, повседневные эмоции и рутины. Это ядро A1-A2, где человек проводит 90% времени.

| Theme key | nameRu | nameEs | CEFR | Emoji | Описание | Размер |
|-----------|--------|--------|------|-------|----------|--------|
| home | Дом и комнаты | La casa | A1 | 🏠 | Комнаты, мебель, бытовые предметы | ~80 |
| kitchen | На кухне | En la cocina | A1 | 🍳 | Еда, посуда, готовка, напитки | ~90 |
| eating-out | За столом | A la mesa | A1 | 🍽️ | Приёмы пищи, вкус, манеры за столом | ~50 |
| morning-routine | Утро и рутина | Rutina diaria | A1 | 🪥 | Гигиена, завтрак, сборы на день | ~60 |
| clothing | Одежда и гардероб | La ropa | A1 | 👕 | Одежда, обувь, аксессуары, сезоны | ~70 |
| body-health | Тело и здоровье | El cuerpo y la salud | A1 | 🩺 | Части тела, болезни, врачи, аптека | ~90 |
| feelings | Чувства и состояния | Sentimientos | A1 | 😊 | Эмоции, настроения, физические состояния | ~70 |
| weather-seasons | Погода и сезоны | El tiempo | A1 | ☀️ | Погода, времена года, климат | ~50 |
| family | Семья и родственники | La familia | A1 | 👨‍👩‍👧 | Члены семьи, родственные связи | ~50 |
| pets-animals | Питомцы и животные | Animales | A2 | 🐕 | Домашние и дикие животные | ~60 |

### Domain: City
Жизнь в городе: перемещения, магазины, услуги, техника. Здесь живёт первый "выход из дома".

| Theme key | nameRu | nameEs | CEFR | Emoji | Описание | Размер |
|-----------|--------|--------|------|-------|----------|--------|
| city-streets | На улицах города | En la ciudad | A1 | 🏙️ | Районы, улицы, ориентиры, направления | ~70 |
| shopping | Покупки | De compras | A1 | 🛒 | Магазины, цены, товары, торг | ~80 |
| transport | Транспорт | Transporte | A2 | 🚌 | Автобусы, метро, машины, навигация | ~70 |
| money-bank | Деньги и банк | Dinero y banco | A2 | 💰 | Банкоматы, счета, оплата, обмен | ~50 |
| tech-gadgets | Техника и гаджеты | Tecnología | A2 | 📱 | Компьютер, интернет, мобильный | ~60 |
| city-services | Городские службы | Servicios | A2 | 🏢 | Полиция, почта, админ. формальности | ~50 |

### Domain: Social
Общение с людьми: знакомство, вечеринки, отношения, конфликты.

| Theme key | nameRu | nameEs | CEFR | Emoji | Описание | Размер |
|-----------|--------|--------|------|-------|----------|--------|
| greetings-courtesy | Приветствия и вежливость | Saludos y cortesía | A1 | 👋 | "Привет/пока", этикет, формулы вежливости | ~40 |
| meeting-people | Знакомство и small talk | Conocer gente | A2 | 🤝 | Представиться, откуда ты, первый разговор | ~60 |
| friendship-relationships | Дружба и отношения | Amistad y relaciones | A2 | 💞 | Друзья, пара, доверие, ссоры | ~70 |
| party-celebration | Вечеринки и праздники | Fiestas | A2 | 🎉 | Дни рождения, подарки, тосты, Nochevieja | ~60 |
| disagreement-conflict | Несогласие и конфликт | Desacuerdos | B1 | 😠 | Возражения, извинения, примирение | ~50 |

### Domain: Travel
Путешествия: аэропорт, отель, ресторан за границей, экстренные ситуации.

| Theme key | nameRu | nameEs | CEFR | Emoji | Описание | Размер |
|-----------|--------|--------|------|-------|----------|--------|
| airport-transit | В аэропорту | En el aeropuerto | A2 | ✈️ | Чекин, багаж, паспортный контроль, гейты | ~60 |
| hotel-stay | В отеле | En el hotel | A2 | 🏨 | Заселение, номера, ресепшен, услуги | ~60 |
| restaurant-abroad | В ресторане | En el restaurante | A2 | 🍷 | Меню, заказ, счёт, жалобы | ~70 |
| asking-directions | Как пройти | Preguntar direcciones | A1 | 🗺️ | Навигация, карты, ориентиры на местности | ~40 |
| travel-docs | Документы и граница | Documentos | B1 | 🛂 | Паспорт, визы, таможня, посольство | ~40 |
| nature-outdoors | Природа и outdoor | Naturaleza | A2 | 🏞️ | Горы, реки, пляж, походы, пейзажи | ~70 |
| emergencies | Экстренные ситуации | Emergencias | B1 | 🚨 | "Помогите!", кража, потерялся, врач на отпуске | ~40 |

### Domain: Work & Study
Работа, образование, абстрактные понятия — сфера, которая "раскрывается" на B1+.

| Theme key | nameRu | nameEs | CEFR | Emoji | Описание | Размер |
|-----------|--------|--------|------|-------|----------|--------|
| school-education | Школа и обучение | Escuela | A1 | 📚 | Учителя, учебники, занятия, экзамены | ~60 |
| work-office | Работа и офис | El trabajo | A2 | 💼 | Коллеги, начальник, задачи, офисная рутина | ~70 |
| meetings-business | Встречи и переговоры | Reuniones | B1 | 📊 | Митинги, презентации, проекты, дедлайны | ~60 |
| professions | Профессии | Profesiones | A2 | 👷 | Названия профессий и сфер деятельности | ~50 |
| abstract-life | Абстрактное и жизнь | Ideas y decisiones | B1 | 💭 | Возможности, решения, память, выбор, цели | ~60 |

### Domain: Expression (спец)
Специальный домен для идиом, фразеологизмов и региональной лексики. Почти весь контент здесь — R/SR/SSR рарности. Открывается с A2 (минимум для понимания контекста идиомы), но полноценно — с B1+.

| Theme key | nameRu | nameEs | CEFR | Emoji | Описание | Размер |
|-----------|--------|--------|------|-------|----------|--------|
| idioms-everyday | Идиомы бытовые | Modismos cotidianos | A2 | 💬 | Устойчивые выражения повседневной речи | ~50 |
| idioms-body | Идиомы с частями тела | Modismos corporales | B1 | 🫀 | "tomar el pelo", "meter la pata" | ~40 |
| slang-rioplatense | Сленг Рио-де-ла-Плата | Lunfardo argentino | A2 | 🧉 | Аргентинский/уругвайский сленг, lunfardo | ~60 |
| time-moments | Время и моменты | Tiempo y momentos | A1 | ⏰ | "de repente", "a propósito", "mientras tanto" | ~40 |

---

## Core (без темы)

Core — это ~200 служебных слов, доступных с первого дня и появляющихся во всех темах как фоновый словарь. В БД помечаются `isCore: true`, не привязываются к WordTheme (финализируется в TASK-050).

**Категории Core:**
- **Артикли:** el, la, los, las, un, una, unos, unas
- **Местоимения:** yo, tú, él, ella, usted, nosotros, vosotros, ellos, ellas, ustedes, me, te, le, nos, les, se
- **Базовые глаголы бытия:** ser, estar, haber, tener
- **Базовые глаголы движения/действия:** ir, venir, volver, llegar, salir, entrar, pasar
- **Базовые глаголы восприятия/мысли:** ver, mirar, oír, saber, conocer, pensar, creer, entender
- **Базовые модальные:** poder, querer, deber, tener que, necesitar, gustar
- **Базовый "делать":** hacer, dar, decir, poner, llevar, traer
- **Связки/помощники:** esperar, buscar, encontrar
- **Числа:** 1-20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 500, 1000
- **Дни недели:** lunes, martes, miércoles, jueves, viernes, sábado, domingo
- **Месяцы:** enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre
- **Базовые предлоги:** de, en, a, con, sin, para, por, sobre, entre, desde, hasta
- **Базовые союзы:** y, o, pero, porque, si, cuando, aunque
- **Базовые наречия частотности:** hoy, ayer, mañana, ahora, nunca, siempre, a veces, pronto, tarde, temprano
- **Базовые квантификаторы:** mucho, poco, más, menos, todo, nada, algo, nadie

---

## Распределение существующих 150 слов

### По темам

#### home (Domain: Everyday)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| casa | home | — | A1 | |
| baño | home | — | A1 | |
| puerta | home | — | A1 | |
| ventana | home | — | A1 | |
| llave | home | — | A1 | |
| mesa | home | kitchen | A1 | Мебель, но используется и в кухне |
| silla | home | — | A1 | |
| cama | home | morning-routine | A1 | |
| edificio | home | city-streets | A2 | Дом снаружи — это уже city |
| ropa | home | clothing | A1 | Бытовой контекст стирки |

#### kitchen (Domain: Everyday)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| cocina | kitchen | home | A1 | |
| agua | kitchen | restaurant-abroad, morning-routine | A1 | |
| pan | kitchen | eating-out | A1 | |
| leche | kitchen | morning-routine | A1 | |
| café | kitchen | morning-routine, eating-out | A1 | |
| té | kitchen | morning-routine | A1 | |
| manzana | kitchen | eating-out | A1 | |
| pollo | kitchen | restaurant-abroad | A1 | |
| comida | kitchen | eating-out, restaurant-abroad | A1 | |
| cocinar | kitchen | — | A2 | Глагол |
| cocinero | kitchen | professions, restaurant-abroad | A2 | |

#### eating-out (Domain: Everyday)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| comer | eating-out | kitchen | A1 | Глагол |
| beber | eating-out | kitchen | A1 | Глагол |
| hambriento | eating-out | feelings | A1 | Чувство голода как повод к еде |

#### clothing (Domain: Everyday)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| zapatos | clothing | shopping | A1 | |
| reloj | clothing | time-moments | A1 | Аксессуар |

#### body-health (Domain: Everyday)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| hospital | body-health | city-streets | A1 | Место лечения |
| doctor | body-health | professions | A1 | |
| enfermera | body-health | professions | A2 | |
| medicina | body-health | — | A2 | |
| cansado | body-health | feelings | A1 | Физическое состояние |

#### feelings (Domain: Everyday)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| feliz | feelings | — | A1 | |
| triste | feelings | — | A1 | |
| enojado | feelings | disagreement-conflict | A1 | |
| nervioso | feelings | school-education | A1 | |
| tranquilo | feelings | — | A1 | |
| aburrido | feelings | — | A1 | |
| contento | feelings | — | A1 | |
| miedo | feelings | emergencies | A2 | Существительное |
| alegría | feelings | party-celebration | A2 | |
| sorpresa | feelings | party-celebration | A2 | |
| vergüenza | feelings | meeting-people | A2 | |
| preocupación | feelings | — | A2 | |
| paciencia | feelings | — | A2 | |
| orgullo | feelings | — | B1 | |
| ansiedad | feelings | body-health | B1 | |
| alivio | feelings | — | B1 | |
| nostalgia | feelings | — | B1 | |

#### family (Domain: Everyday)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| madre | family | — | A1 | |
| padre | family | — | A1 | |
| hermano | family | — | A1 | |
| hermana | family | — | A1 | |
| hijo | family | — | A1 | |
| hija | family | — | A1 | |
| niño | family | — | A1 | "Ребёнок/мальчик" |
| niña | family | — | A1 | |
| pareja | family | friendship-relationships | A2 | Романтический партнёр |

#### city-streets (Domain: City)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| calle | city-streets | — | A1 | |
| ciudad | city-streets | — | A1 | |
| parque | city-streets | nature-outdoors | A1 | |
| plaza | city-streets | — | A1 | |
| barrio | city-streets | — | A2 | |
| caminar | city-streets | — | A1 | Ходьба по городу, глагол |

#### shopping (Domain: City)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| tienda | shopping | — | A1 | |
| mercado | shopping | — | A1 | |
| supermercado | shopping | — | A2 | |
| dinero | shopping | money-bank | A1 | |
| comprar | shopping | — | A2 | Глагол |
| vender | shopping | — | A2 | Глагол |
| aprovechar | shopping | abstract-life | B1 | "воспользоваться скидкой" |

#### transport (Domain: City)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| estación | transport | — | A2 | |
| conductor | transport | professions | A2 | |
| conducir | transport | — | A2 | Глагол |
| bicicleta | transport | — | A2 | |

#### money-bank (Domain: City)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| banco | money-bank | city-streets | A1 | |

#### tech-gadgets (Domain: City)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| teléfono | tech-gadgets | — | A1 | |
| computadora | tech-gadgets | work-office | A2 | |
| llamar | tech-gadgets | — | A2 | Звонок, но также обращаться |

#### city-services (Domain: City)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| policía | city-services | professions | A2 | |

#### greetings-courtesy (Domain: Social)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| hola | greetings-courtesy | — | A1 | |
| adiós | greetings-courtesy | — | A1 | |
| gracias | greetings-courtesy | — | A1 | |
| lo siento | greetings-courtesy | disagreement-conflict | A1 | |
| ¿qué tal? | greetings-courtesy | meeting-people | A1 | |
| buenos días | greetings-courtesy | — | A1 | |
| por favor | greetings-courtesy | — | A1 | |
| de nada | greetings-courtesy | — | A1 | |
| permiso | greetings-courtesy | — | A2 | |

#### meeting-people (Domain: Social)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| amigo | meeting-people | friendship-relationships, family | A1 | |
| vecino | meeting-people | family | A1 | |
| desconocido | meeting-people | city-streets | A2 | |
| hablar | meeting-people | — | A1 | Глагол коммуникации |
| escuchar | meeting-people | — | A2 | |
| ¡qué lindo! | meeting-people | — | A2 | Small talk комплимент |

#### friendship-relationships (Domain: Social)
*(пусто — см. "дыры", pareja уже учтена как additional)*

#### party-celebration (Domain: Social)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| regalo | party-celebration | — | A2 | |
| invitado | party-celebration | — | B1 | |
| boliche | party-celebration | slang-rioplatense | A2 | Аргентинский ночной клуб |

#### disagreement-conflict (Domain: Social)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| convencer | disagreement-conflict | — | B1 | Глагол |
| ni loco | disagreement-conflict | slang-rioplatense, idioms-everyday | B1 | Жёсткое "нет" |

#### airport-transit (Domain: Travel)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| aeropuerto | airport-transit | — | A2 | |
| boleto | airport-transit | transport | A2 | |
| pasaporte | airport-transit | travel-docs | A2 | |

#### restaurant-abroad (Domain: Travel)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| restaurante | restaurant-abroad | eating-out | A2 | |

#### asking-directions (Domain: Travel)
*(пусто — см. "дыры"; частично покрывается mapa и через city-streets)*

#### travel-docs (Domain: Travel)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| frontera | travel-docs | — | B1 | |

#### nature-outdoors (Domain: Travel)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| río | nature-outdoors | — | A2 | |
| montaña | nature-outdoors | — | A2 | |
| viaje | nature-outdoors | airport-transit, travel-docs | A2 | |
| mapa | asking-directions | nature-outdoors, travel-docs | A2 | Primary — навигация |
| mochila | nature-outdoors | — | A2 | |

#### school-education (Domain: Work & Study)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| escuela | school-education | — | A1 | |
| profesor | school-education | professions | A1 | |
| estudiante | school-education | — | A1 | |
| libro | school-education | — | A1 | |
| leer | school-education | — | A1 | Глагол |
| escribir | school-education | meetings-business | A1 | Глагол |
| aprender | school-education | — | A2 | Глагол |

#### work-office (Domain: Work & Study)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| oficina | work-office | — | A2 | |
| jefe | work-office | professions | A2 | |
| compañero | work-office | friendship-relationships | A2 | "Коллега" |
| cliente | work-office | shopping | A2 | |
| trabajo | work-office | — | A2 | |

#### meetings-business (Domain: Work & Study)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| reunión | meetings-business | — | B1 | |

#### professions (Domain: Work & Study)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| artista | professions | — | A2 | |

*(Большинство профессий выше учтены как additional для professions, чтобы не дублировать карточки.)*

#### abstract-life (Domain: Work & Study)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| oportunidad | abstract-life | — | B1 | |
| decisión | abstract-life | — | B1 | |
| recuerdo | abstract-life | feelings | B1 | |
| perder | abstract-life | feelings | A2 | Проигрывать/терять |
| reconocer | abstract-life | — | B1 | |

#### idioms-everyday (Domain: Expression)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| darse cuenta | idioms-everyday | — | A2 | |
| cargar con | idioms-everyday | — | B1 | Фразовый глагол |
| estar en las nubes | idioms-everyday | — | B1 | |
| no hay drama | idioms-everyday | slang-rioplatense | A2 | |

#### slang-rioplatense (Domain: Expression)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| pibe | slang-rioplatense | meeting-people | A2 | "Парень" в аргентинском |
| bancar | slang-rioplatense | friendship-relationships | B1 | "Поддерживать" |
| quilombo | slang-rioplatense | city-streets | B1 | "Бардак" |
| ni en pedo | slang-rioplatense | disagreement-conflict | B1 | "Ни за что, жёстко" |

#### time-moments (Domain: Expression)
| Word | Primary | Additional | CEFR | Заметка |
|------|---------|------------|------|---------|
| de repente | time-moments | — | A2 | |
| a propósito | time-moments | — | B1 | |

### Core — служебные слова без темы (утверждено 2026-04-09)

Реализация: флаг `isCore: true` на Word, без записи в WordTheme. Core-слова доступны с первого дня и появляются во всех темах как фоновый словарь.

**Core из существующих 150 слов (утверждено):**

| Word | CEFR | Почему core |
|------|------|-------------|
| ir | A1 | Базовый глагол движения |
| venir | A1 | Базовый глагол движения (парный ir) |
| ver | A1 | Базовый глагол восприятия |
| hacer | A1 | Универсальный "делать" |
| querer | A1 | Базовый модальный "хотеть" |
| necesitar | A1 | Базовый модальный "нуждаться" |
| pensar | A1 | Базовый ментальный глагол |
| esperar | A2 | Универсальный "ждать" — используется везде |
| buscar | A2 | Универсальный "искать" |
| jugar | A1 | Слишком широкий контекст (дети, спорт, игры) |
| dormir | A1 | Используется во всех темах как фоновый |
| correr | A2 | Спорт или "убегать" — широкий контекст |
| hablar | A1 | Базовый глагол коммуникации |
| escuchar | A1 | Базовый глагол восприятия |
| leer | A1 | Базовый глагол |
| escribir | A1 | Базовый глагол |

**Core-пробелы, которые нужно добавить вручную в TASK-050 (критическая дыра A1 из аудита):**

Эти слова УПОМИНАЮТСЯ в flavorText существующих карт, но самих карт нет. Без них ученик встречает слова до того, как они введены. Приоритет — ДОБАВИТЬ в TASK-050 как Core:

| Word | CEFR | Комментарий |
|------|------|-------------|
| ser | A1 | Быть (постоянное) — базовая связка |
| estar | A1 | Быть (временное/местоположение) — базовая связка |
| tener | A1 | Иметь + конструкции `tener que` |
| haber | A1 | Универсальный вспомогательный, `hay` |
| poder | A1 | Мочь |
| vivir | A1 | Жить |
| trabajar | A1 | Работать (нейтральное) — парный к laburar |
| saber | A1 | Знать (факт) |
| conocer | A1 | Знать (быть знакомым) |
| dar | A1 | Давать |
| decir | A1 | Говорить (передавать слова) |
| gustar | A1 | Нравиться |

**Остальной Core (финализируется в TASK-050, на генерацию):**
- **Артикли:** el, la, los, las, un, una, unos, unas
- **Местоимения:** yo, vos, él, ella, usted, nosotros, ellos, ellas, ustedes + клитики me, te, le, nos, les, se (диалект Rioplatense: используем `vos` вместо `tú` как дефолтное 2-е лицо)
- **Числа:** 1-20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 500, 1000
- **Дни недели:** lunes, martes, miércoles, jueves, viernes, sábado, domingo
- **Месяцы:** enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre
- **Базовые предлоги:** de, en, a, con, sin, para, por, sobre, entre, desde, hasta
- **Базовые союзы:** y, o, pero, porque, si, cuando, aunque
- **Базовые наречия частотности:** hoy, ayer, mañana, ahora, nunca, siempre, a veces, pronto, tarde, temprano
- **Базовые квантификаторы:** mucho, poco, más, menos, todo, nada, algo, nadie

**Итого Core:** ~170-200 слов (16 из 150 существующих + ~150-180 новых в TASK-050).

### Финальная раскладка спорных слов (утверждено 2026-04-09)

Решения Aleksei зафиксированы. Полная таблица и обоснование — в `content-plan.md` § 12 ("Раскладка 11 спорных слов"). Кратко:

| Слово | Primary | Additional |
|-------|---------|------------|
| laburar | work-office | slang-rioplatense |
| jefe | work-office | professions |
| jugar | **Core** | — |
| dormir | **Core** | — |
| correr | **Core** | — |
| hablar | **Core** | — |
| escuchar | **Core** | — |
| leer | **Core** | — |
| escribir | **Core** | — |
| ropa | clothing | — (убрано additional=home) |
| zapatos | clothing | — |
| reloj | clothing | — |
| amigo | friendship-relationships | meeting-people |
| vecino | meeting-people | home |
| ¡qué lindo! | meeting-people | party-celebration |
| mesa | eating-out | home, kitchen |
| agua | kitchen | restaurant-abroad, morning-routine, body-health |
| boliche | slang-rioplatense | party-celebration |

**Важно для TASK-050:** источник правды по раскладке — таблица в `content-plan.md` § 12. Если эта таблица здесь расходится с content-plan — следуй content-plan.

---

## Дыры в темах

Темы, в которых из 150 существующих слов оказалось менее 5. Для каждой — предложения слов для заполнения при генерации новых.

### morning-routine (Domain: Everyday) — 0 прямых слов
(Есть косвенно через additional: café, leche, té, cama, agua)
**Типичные слова, которых не хватает:**
- despertarse (просыпаться), ducha (душ), jabón (мыло), toalla (полотенце), cepillo de dientes (зубная щётка), peinarse (причёсываться), vestirse (одеваться), desayunar (завтракать), cepillar (чистить), afeitarse (бриться), maquillarse (наносить макияж)

### eating-out (Domain: Everyday) — 3 слова (comer, beber, hambriento)
**Типичные слова, которых не хватает:**
- plato (тарелка), cuchillo (нож), tenedor (вилка), cuchara (ложка), vaso (стакан), servilleta (салфетка), sal (соль), pimienta (перец), azúcar (сахар), rico (вкусный), sabroso (вкусный), probar (пробовать), desayuno (завтрак), almuerzo (обед), cena (ужин)

### clothing (Domain: Everyday) — 2 слова (zapatos, reloj)
**Типичные слова, которых не хватает:**
- camisa (рубашка), camiseta (футболка), pantalones (брюки), vestido (платье), falda (юбка), chaqueta (куртка), abrigo (пальто), gorro (шапка), bufanda (шарф), guantes (перчатки), calcetines (носки), cinturón (ремень), talle (размер), probador (примерочная)

### weather-seasons (Domain: Everyday) — 0 слов
**Типичные слова, которых не хватает:**
- sol (солнце), lluvia (дождь), nieve (снег), viento (ветер), frío (холод), calor (жара), nube (облако), tormenta (гроза), primavera (весна), verano (лето), otoño (осень), invierno (зима), hace frío (холодно), paraguas (зонт)

### pets-animals (Domain: Everyday) — 0 слов
**Типичные слова, которых не хватает:**
- perro (собака), gato (кошка), pájaro (птица), pez (рыба), caballo (лошадь), vaca (корова), cerdo (свинья), oveja (овца), ratón (мышь), conejo (кролик), araña (паук), león (лев), elefante (слон)

### body-health (Domain: Everyday) — 5 слов (hospital, doctor, enfermera, medicina, cansado)
**Дыры в частях тела:**
- cabeza (голова), mano (рука, кисть), brazo (рука, плечо), pie (нога), pierna (нога), ojo (глаз), oreja (ухо), boca (рот), nariz (нос), diente (зуб), corazón (сердце), espalda (спина), estómago (живот), garganta (горло), fiebre (температура), dolor (боль)

### transport (Domain: City) — 4 слова (estación, conductor, conducir, bicicleta)
**Типичные слова, которых не хватает:**
- coche/auto (машина), autobús (автобус), metro (метро), tren (поезд), taxi (такси), avión (самолёт), parada (остановка), andén (перрон), ticket (билет — уже есть как boleto), kilómetro (километр), gasolina (бензин)

### money-bank (Domain: City) — 1 слово (banco)
**Типичные слова, которых не хватает:**
- tarjeta (карта, банковская), efectivo (наличные), caja (касса), precio (цена), cuenta (счёт), factura (счёт к оплате), cambio (сдача, обмен), barato (дешёвый), caro (дорогой), descuento (скидка), pagar (платить), cobrar (получать оплату)

### tech-gadgets (Domain: City) — 3 слова (teléfono, computadora, llamar)
**Типичные слова, которых не хватает:**
- pantalla (экран), teclado (клавиатура), mouse (мышка), internet (интернет), contraseña (пароль), correo (почта, email), mensaje (сообщение), aplicación (приложение), pantalla táctil (сенсорный экран), cargador (зарядка), enchufe (розетка)

### city-services (Domain: City) — 1 слово (policía)
**Типичные слова, которых не хватает:**
- correo (почта), bomberos (пожарные), ayuntamiento (мэрия), documento (документ), formulario (формуляр), firma (подпись), sello (штамп), cola (очередь)

### meeting-people (Domain: Social) — 6 слов
(Покрыто базово, но можно расширять.)
**Что добавить:**
- nombre (имя), apellido (фамилия), presentar(se) (представить(ся)), encantado (приятно познакомиться), mucho gusto (очень рад), ¿de dónde sos/eres? (откуда ты?), edad (возраст)

### friendship-relationships (Domain: Social) — 0 прямых слов (pareja учтена additional)
**Типичные слова, которых не хватает:**
- novio (парень/бойфренд), novia (девушка/гёрлфренд), casado (женатый), soltero (холостой), divorciado (разведённый), confianza (доверие), discutir (спорить), pelearse (ссориться), extrañar (скучать), besar (целовать), abrazar (обнимать), relación (отношения)

### party-celebration (Domain: Social) — 3 слова (regalo, invitado, boliche)
**Типичные слова, которых не хватает:**
- fiesta (вечеринка), cumpleaños (день рождения), torta (торт), vela (свеча), globo (воздушный шарик), brindis (тост), felicidades (поздравляю), música (музыка), bailar (танцевать), celebrar (праздновать), Navidad (Рождество), Año Nuevo (Новый год)

### disagreement-conflict (Domain: Social) — 2 слова (convencer, ni loco)
**Типичные слова, которых не хватает:**
- no estar de acuerdo (не согласен), discutir (спорить), tener razón (быть правым), equivocarse (ошибаться), disculparse (извиняться), pelearse (поссориться), hacer las paces (помириться), perdonar (прощать), culpa (вина), molestar (раздражать)

### airport-transit (Domain: Travel) — 3 слова (aeropuerto, boleto, pasaporte)
**Типичные слова, которых не хватает:**
- vuelo (рейс), equipaje (багаж), maleta (чемодан), embarque (посадка), puerta (здесь — "гейт"), retraso (задержка), cancelar (отменить), facturar (чекин), aduana (таможня), duty-free, escala (пересадка), llegar (прилететь)

### hotel-stay (Domain: Travel) — 0 слов
**Типичные слова, которых не хватает:**
- hotel (отель), habitación (номер), reserva (бронирование), recepción (ресепшен), llave (ключ — уже есть в home), cama (кровать — уже есть в home), wifi, desayuno incluido (завтрак включён), checkin, checkout, piscina (бассейн), vista al mar (вид на море), precio por noche

### restaurant-abroad (Domain: Travel) — 1 слово (restaurante)
(Покрыто косвенно: agua, pan, pollo, comida, cocinero как additional)
**Типичные слова, которых не хватает:**
- menú (меню), carta (меню-карта), mesa (уже есть в home), camarero/mozo (официант), propina (чаевые), cuenta (счёт), pedir (заказывать), bebida (напиток), entrada (закуска), plato principal (основное), postre (десерт), pagar en efectivo (наличными), tarjeta

### asking-directions (Domain: Travel) — 1 слово (mapa, primary здесь)
**Типичные слова, которых не хватает:**
- derecha (направо), izquierda (налево), recto (прямо), cerca (близко), lejos (далеко), esquina (угол), cuadra (квартал), manzana (квартал — neighborhood sense), seguir (продолжать), girar (повернуть), perdido (потерянный), ubicación (местоположение)

### travel-docs (Domain: Travel) — 1 слово (frontera)
**Типичные слова, которых не хватает:**
- visa (виза), sellado (штамп), embajada (посольство), consulado (консульство), trámite (процедура), residencia (вид на жительство), extranjero (иностранец), nacionalidad (национальность), verificación (проверка)

### emergencies (Domain: Travel) — 0 слов
**Типичные слова, которых не хватает:**
- ayuda (помощь), ¡socorro! (спасите!), emergencia (чрезвычайная ситуация), robar (красть), perder (терять — уже есть), llamar a la policía (позвонить в полицию), ambulancia (скорая), incendio (пожар), accidente (авария), herido (раненый), urgente (срочно)

### school-education (Domain: Work & Study) — 7 слов
(Покрыто базово, но можно расширять.)
**Что добавить:**
- clase (урок/класс), aula (аудитория), examen (экзамен), nota (оценка), tarea (задание), deberes (домашка), pizarra (доска), lápiz (карандаш), cuaderno (тетрадь), mochila (уже есть), materia (предмет), universidad (университет)

### meetings-business (Domain: Work & Study) — 1 слово (reunión)
**Типичные слова, которых не хватает:**
- agenda (повестка), acta (протокол), proyecto (проект), plazo/fecha límite (дедлайн), presentación (презентация), informe (отчёт), objetivo (цель), acuerdo (договорённость), presupuesto (бюджет), factura (счёт)

### professions (Domain: Work & Study) — 1 прямое слово (artista)
(Покрыто через additional — jefe, cocinero, doctor, enfermera, policía, conductor, profesor.)
**Что добавить:**
- ingeniero (инженер), abogado (юрист), programador (программист), diseñador (дизайнер), periodista (журналист), mecánico (механик), vendedor (продавец), empresario (предприниматель), bombero (пожарный), científico (учёный), arquitecto (архитектор)

### idioms-everyday (Domain: Expression) — 4 слова
**Что добавить:**
- tomar el pelo (разыгрывать), echar una mano (помочь), estar hecho polvo (быть разбитым от усталости), meter la pata (облажаться), dar en el clavo (попасть в точку), no tener ni idea (понятия не иметь)

### idioms-body (Domain: Expression) — 0 слов
**Типичные слова, которых не хватает:**
- hablar por los codos (болтать без умолку), hacerse la boca agua (слюнки текут), no pegar ojo (не сомкнуть глаз), costar un ojo de la cara (стоить очень дорого), tener la cabeza en las nubes (витать в облаках)

---

## Статистика

| Метрика | Значение |
|---------|----------|
| Всего доменов | 6 (Everyday, City, Social, Travel, Work & Study, Expression) |
| Всего тем | 32 |
| Тем с cefrTier A1 | 13 |
| Тем с cefrTier A2 | 12 |
| Тем с cefrTier B1 | 7 |
| Существующих слов разложено в темы (primary) | 138 / 150 |
| Существующих слов в Core-кандидатах | 12 |
| Существующих слов помечено "на обсуждение" | 11 (частично пересекаются с выше) |
| Тем с дырами (<5 слов среди 150) | 23 из 32 |

**Топ-5 тем по наполненности в 150-слов пуле:**
1. feelings — 17 слов
2. kitchen — 11 слов
3. family — 9 слов
4. greetings-courtesy — 9 слов
5. home — 10 слов / school-education — 7 слов

**Темы с полным нулём слов (0 из 150):**
- morning-routine
- weather-seasons
- pets-animals
- hotel-stay
- emergencies
- idioms-body
- friendship-relationships (прямых primary)

Это ожидаемо: существующий seed был собран без темы-ориентации, и всё что попало — это "бытовое базовое ядро".

---

## Решения по открытым вопросам (2026-04-09, Aleksei)

Все вопросы из первого черновика закрыты. Полный список решений — в `content-plan.md` § 12 "Решения Aleksei". Краткая сводка:

- ✅ **Core = флаг `isCore: true`** на Word, без WordTheme
- ✅ **Expression** блокируется до A2 (SSR-идиомы появляются только с A2+)
- ✅ **32 темы оставляем** — не сливаем ничего
- ✅ **`sport-leisure` НЕ добавляем** сейчас — correr/jugar/dormir уходят в Core как универсальные
- ✅ **`professions` остаётся темой**, профессии в основных темах остаются additional
- ✅ **`boliche` primary → slang-rioplatense**, additional → party-celebration
- ✅ **hablar/escuchar/leer/escribir → Core**, не темы
- ✅ **`mesa` primary → eating-out**, additional home/kitchen
- ✅ **Порядок разблокировки тем A1** — ручной, список зафиксирован в `content-plan.md` § 10 Этап 5
- ⚪ **Русские имена тем** — не блокер, полируем по ходу UI-ревью
- ⚪ **`daily-routine`** — не добавляем сейчас, вернёмся на контрольной точке (2.18.6)
- ✅ **`quilombo` additional** — оставляем `city-streets` как есть
