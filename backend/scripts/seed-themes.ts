/**
 * Theme taxonomy — Phase 2.18 Content Foundation
 * See: docs/taxonomy.md, docs/content-plan.md
 *
 * 32 themes across 6 domains.
 * orderIndex:
 *   1-15: A1 priority themes (manual order from content-plan.md § 10)
 *   16+: A2 and B1 themes in stable order by insertion
 */

export type ThemeSeed = {
  key: string;
  nameRu: string;
  nameEs: string;
  domain: "Everyday" | "City" | "Social" | "Travel" | "Work & Study" | "Expression";
  cefrTier: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  orderIndex: number;
  emoji: string;
  description: string;
};

export const THEMES: ThemeSeed[] = [
  // ============================================================
  // A1 PRIORITY (orderIndex 1-15) — начальный пул для новых игроков
  // ============================================================

  // Everyday A1
  {
    key: "home",
    nameRu: "Дом и комнаты",
    nameEs: "La casa",
    domain: "Everyday",
    cefrTier: "A1",
    orderIndex: 1,
    emoji: "🏠",
    description: "Комнаты, мебель, бытовые предметы",
  },
  {
    key: "kitchen",
    nameRu: "На кухне",
    nameEs: "En la cocina",
    domain: "Everyday",
    cefrTier: "A1",
    orderIndex: 2,
    emoji: "🍳",
    description: "Еда, посуда, готовка, напитки",
  },
  {
    key: "eating-out",
    nameRu: "За столом",
    nameEs: "A la mesa",
    domain: "Everyday",
    cefrTier: "A1",
    orderIndex: 3,
    emoji: "🍽️",
    description: "Приёмы пищи, вкус, манеры за столом",
  },
  {
    key: "morning-routine",
    nameRu: "Утро и рутина",
    nameEs: "Rutina diaria",
    domain: "Everyday",
    cefrTier: "A1",
    orderIndex: 4,
    emoji: "🪥",
    description: "Гигиена, завтрак, сборы на день",
  },
  {
    key: "clothing",
    nameRu: "Одежда и гардероб",
    nameEs: "La ropa",
    domain: "Everyday",
    cefrTier: "A1",
    orderIndex: 5,
    emoji: "👕",
    description: "Одежда, обувь, аксессуары, сезоны",
  },
  {
    key: "body-health",
    nameRu: "Тело и здоровье",
    nameEs: "El cuerpo y la salud",
    domain: "Everyday",
    cefrTier: "A1",
    orderIndex: 6,
    emoji: "🩺",
    description: "Части тела, болезни, врачи, аптека",
  },
  {
    key: "feelings",
    nameRu: "Чувства и состояния",
    nameEs: "Sentimientos",
    domain: "Everyday",
    cefrTier: "A1",
    orderIndex: 7,
    emoji: "😊",
    description: "Эмоции, настроения, физические состояния",
  },
  {
    key: "weather-seasons",
    nameRu: "Погода и сезоны",
    nameEs: "El tiempo",
    domain: "Everyday",
    cefrTier: "A1",
    orderIndex: 8,
    emoji: "☀️",
    description: "Погода, времена года, климат",
  },
  {
    key: "family",
    nameRu: "Семья и родственники",
    nameEs: "La familia",
    domain: "Everyday",
    cefrTier: "A1",
    orderIndex: 9,
    emoji: "👨‍👩‍👧",
    description: "Члены семьи, родственные связи",
  },

  // City A1
  {
    key: "city-streets",
    nameRu: "На улицах города",
    nameEs: "En la ciudad",
    domain: "City",
    cefrTier: "A1",
    orderIndex: 10,
    emoji: "🏙️",
    description: "Районы, улицы, ориентиры, направления",
  },
  {
    key: "shopping",
    nameRu: "Покупки",
    nameEs: "De compras",
    domain: "City",
    cefrTier: "A1",
    orderIndex: 11,
    emoji: "🛒",
    description: "Магазины, цены, товары, торг",
  },

  // Social A1
  {
    key: "greetings-courtesy",
    nameRu: "Приветствия и вежливость",
    nameEs: "Saludos y cortesía",
    domain: "Social",
    cefrTier: "A1",
    orderIndex: 12,
    emoji: "👋",
    description: '"Привет/пока", этикет, формулы вежливости',
  },

  // Travel A1
  {
    key: "asking-directions",
    nameRu: "Как пройти",
    nameEs: "Preguntar direcciones",
    domain: "Travel",
    cefrTier: "A1",
    orderIndex: 13,
    emoji: "🗺️",
    description: "Навигация, карты, ориентиры на местности",
  },

  // Work & Study A1
  {
    key: "school-education",
    nameRu: "Школа и обучение",
    nameEs: "Escuela",
    domain: "Work & Study",
    cefrTier: "A1",
    orderIndex: 14,
    emoji: "📚",
    description: "Учителя, учебники, занятия, экзамены",
  },

  // Expression A1
  {
    key: "time-moments",
    nameRu: "Время и моменты",
    nameEs: "Tiempo y momentos",
    domain: "Expression",
    cefrTier: "A1",
    orderIndex: 15,
    emoji: "⏰",
    description: '"de repente", "a propósito", "mientras tanto"',
  },

  // ============================================================
  // A2 (orderIndex 16-27)
  // ============================================================

  // Everyday A2
  {
    key: "pets-animals",
    nameRu: "Питомцы и животные",
    nameEs: "Animales",
    domain: "Everyday",
    cefrTier: "A2",
    orderIndex: 16,
    emoji: "🐕",
    description: "Домашние и дикие животные",
  },

  // City A2
  {
    key: "transport",
    nameRu: "Транспорт",
    nameEs: "Transporte",
    domain: "City",
    cefrTier: "A2",
    orderIndex: 17,
    emoji: "🚌",
    description: "Автобусы, метро, машины, навигация",
  },
  {
    key: "money-bank",
    nameRu: "Деньги и банк",
    nameEs: "Dinero y banco",
    domain: "City",
    cefrTier: "A2",
    orderIndex: 18,
    emoji: "💰",
    description: "Банкоматы, счета, оплата, обмен",
  },
  {
    key: "tech-gadgets",
    nameRu: "Техника и гаджеты",
    nameEs: "Tecnología",
    domain: "City",
    cefrTier: "A2",
    orderIndex: 19,
    emoji: "📱",
    description: "Компьютер, интернет, мобильный",
  },
  {
    key: "city-services",
    nameRu: "Городские службы",
    nameEs: "Servicios",
    domain: "City",
    cefrTier: "A2",
    orderIndex: 20,
    emoji: "🏢",
    description: "Полиция, почта, админ. формальности",
  },

  // Social A2
  {
    key: "meeting-people",
    nameRu: "Знакомство и small talk",
    nameEs: "Conocer gente",
    domain: "Social",
    cefrTier: "A2",
    orderIndex: 21,
    emoji: "🤝",
    description: "Представиться, откуда ты, первый разговор",
  },
  {
    key: "friendship-relationships",
    nameRu: "Дружба и отношения",
    nameEs: "Amistad y relaciones",
    domain: "Social",
    cefrTier: "A2",
    orderIndex: 22,
    emoji: "💞",
    description: "Друзья, пара, доверие, ссоры",
  },
  {
    key: "party-celebration",
    nameRu: "Вечеринки и праздники",
    nameEs: "Fiestas",
    domain: "Social",
    cefrTier: "A2",
    orderIndex: 23,
    emoji: "🎉",
    description: "Дни рождения, подарки, тосты, Nochevieja",
  },

  // Travel A2
  {
    key: "airport-transit",
    nameRu: "В аэропорту",
    nameEs: "En el aeropuerto",
    domain: "Travel",
    cefrTier: "A2",
    orderIndex: 24,
    emoji: "✈️",
    description: "Чекин, багаж, паспортный контроль, гейты",
  },
  {
    key: "hotel-stay",
    nameRu: "В отеле",
    nameEs: "En el hotel",
    domain: "Travel",
    cefrTier: "A2",
    orderIndex: 25,
    emoji: "🏨",
    description: "Заселение, номера, ресепшен, услуги",
  },
  {
    key: "restaurant-abroad",
    nameRu: "В ресторане",
    nameEs: "En el restaurante",
    domain: "Travel",
    cefrTier: "A2",
    orderIndex: 26,
    emoji: "🍷",
    description: "Меню, заказ, счёт, жалобы",
  },
  {
    key: "nature-outdoors",
    nameRu: "Природа и outdoor",
    nameEs: "Naturaleza",
    domain: "Travel",
    cefrTier: "A2",
    orderIndex: 27,
    emoji: "🏞️",
    description: "Горы, реки, пляж, походы, пейзажи",
  },

  // Work & Study A2
  {
    key: "work-office",
    nameRu: "Работа и офис",
    nameEs: "El trabajo",
    domain: "Work & Study",
    cefrTier: "A2",
    orderIndex: 28,
    emoji: "💼",
    description: "Коллеги, начальник, задачи, офисная рутина",
  },
  {
    key: "professions",
    nameRu: "Профессии",
    nameEs: "Profesiones",
    domain: "Work & Study",
    cefrTier: "A2",
    orderIndex: 29,
    emoji: "👷",
    description: "Названия профессий и сфер деятельности",
  },

  // Expression A2
  {
    key: "idioms-everyday",
    nameRu: "Идиомы бытовые",
    nameEs: "Modismos cotidianos",
    domain: "Expression",
    cefrTier: "A2",
    orderIndex: 30,
    emoji: "💬",
    description: "Устойчивые выражения повседневной речи",
  },
  {
    key: "slang-rioplatense",
    nameRu: "Сленг Рио-де-ла-Плата",
    nameEs: "Lunfardo argentino",
    domain: "Expression",
    cefrTier: "A2",
    orderIndex: 31,
    emoji: "🧉",
    description: "Аргентинский/уругвайский сленг, lunfardo",
  },

  // ============================================================
  // B1 (orderIndex 32-37)
  // ============================================================

  // Social B1
  {
    key: "disagreement-conflict",
    nameRu: "Несогласие и конфликт",
    nameEs: "Desacuerdos",
    domain: "Social",
    cefrTier: "B1",
    orderIndex: 32,
    emoji: "😠",
    description: "Возражения, извинения, примирение",
  },

  // Travel B1
  {
    key: "travel-docs",
    nameRu: "Документы и граница",
    nameEs: "Documentos",
    domain: "Travel",
    cefrTier: "B1",
    orderIndex: 33,
    emoji: "🛂",
    description: "Паспорт, визы, таможня, посольство",
  },
  {
    key: "emergencies",
    nameRu: "Экстренные ситуации",
    nameEs: "Emergencias",
    domain: "Travel",
    cefrTier: "B1",
    orderIndex: 34,
    emoji: "🚨",
    description: '"Помогите!", кража, потерялся, врач на отпуске',
  },

  // Work & Study B1
  {
    key: "meetings-business",
    nameRu: "Встречи и переговоры",
    nameEs: "Reuniones",
    domain: "Work & Study",
    cefrTier: "B1",
    orderIndex: 35,
    emoji: "📊",
    description: "Митинги, презентации, проекты, дедлайны",
  },
  {
    key: "abstract-life",
    nameRu: "Абстрактное и жизнь",
    nameEs: "Ideas y decisiones",
    domain: "Work & Study",
    cefrTier: "B1",
    orderIndex: 36,
    emoji: "💭",
    description: "Возможности, решения, память, выбор, цели",
  },

  // Expression B1
  {
    key: "idioms-body",
    nameRu: "Идиомы с частями тела",
    nameEs: "Modismos corporales",
    domain: "Expression",
    cefrTier: "B1",
    orderIndex: 37,
    emoji: "🫀",
    description: '"tomar el pelo", "meter la pata"',
  },
];

/**
 * Helper: find theme by key (throws if not found).
 */
export const getThemeByKey = (key: string): ThemeSeed => {
  const theme = THEMES.find((t) => t.key === key);
  if (!theme) throw new Error(`Theme not found: ${key}`);
  return theme;
};

/**
 * Helper: list all valid theme keys (for validation in SeedWord.themes).
 */
export const THEME_KEYS = new Set(THEMES.map((t) => t.key));
