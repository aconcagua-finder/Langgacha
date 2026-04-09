/**
 * Core words — base verbs and connectors that underlie everything else.
 * Phase 2.18 Content Foundation, TASK-050.
 *
 * These words are referenced throughout flavorText of other cards
 * (e.g. "Tengo hambre", "Estoy cansado", "Es importante") but were
 * missing from the seed pool — creating a critical A1 gap.
 *
 * All Core words have:
 *   - isCore: true (flag used by boosters for fallback drops)
 *   - themes: [] (no theme, they're universal)
 *   - cefrLevel: "A1"
 *   - rarity: "C"
 *   - dialect: "rioplatense" (voseo in all flavor texts)
 *
 * Style rules (from content-plan.md § 5.6):
 *   - voseo: "vos tenés", "vos sos", "vos podés" (not "tú tienes")
 *   - hints: concrete mnemonic connection, NOT "sounds soft/hard"
 *
 * The 12 verbs here fill the critical A1 gap identified in content-audit.md.
 * Remaining Core (articles, pronouns, numbers, days) will be added in
 * future tasks if/when needed — for MVP these verbs are the priority.
 */

import type { SeedWord } from "./seed-words.types.js";

export const CORE_WORDS: SeedWord[] = [
  // ============================================================
  // Базовые глаголы бытия (критическая A1 дыра)
  // ============================================================
  {
    language: "es",
    conceptKey: "to_be_permanent",
    word: "ser",
    translationRu: "быть (постоянно)",
    type: "Action",
    rarity: "C",
    baseAtk: 45,
    baseDef: 75,
    colorido: 1,
    flavorText: "Yo soy de Buenos Aires. ¿Y vos?",
    hint: "«Ser» родственник английского «is»/«sir»: «сэр» — это кто он ЕСТЬ по статусу, постоянно.",
    tags: [],
    cefrLevel: "A1",
    isCore: true,
    themes: [],
    quizCorrect: "быть (постоянно)",
    quizOptions: ["быть (постоянно)", "иметь", "мочь", "хотеть"],
  },
  {
    language: "es",
    conceptKey: "to_be_temporary",
    word: "estar",
    translationRu: "быть (временно / находиться)",
    type: "Action",
    rarity: "C",
    baseAtk: 45,
    baseDef: 70,
    colorido: 1,
    flavorText: "—¿Dónde estás? —Estoy en la cocina, vení.",
    hint: "«Estar» — корень «стар-/стать»: встать на место, временно там находиться.",
    tags: [],
    cefrLevel: "A1",
    isCore: true,
    themes: [],
    quizCorrect: "быть (временно / находиться)",
    quizOptions: [
      "быть (временно / находиться)",
      "быть (постоянно)",
      "знать",
      "работать",
    ],
  },
  {
    language: "es",
    conceptKey: "have",
    word: "tener",
    translationRu: "иметь",
    type: "Action",
    rarity: "C",
    baseAtk: 55,
    baseDef: 60,
    colorido: 2,
    flavorText: "Tengo hambre, ¿hay algo para morfar?",
    hint: "«Tener» от латинского tenere — «держать»: держишь значит имеешь. Родственно «теннис» (держишь ракетку).",
    tags: [],
    cefrLevel: "A1",
    isCore: true,
    themes: [],
    quizCorrect: "иметь",
    quizOptions: ["иметь", "быть (постоянно)", "давать", "знать"],
  },
  {
    language: "es",
    conceptKey: "there_is",
    word: "haber",
    translationRu: "быть (hay — есть / имеется)",
    type: "Action",
    rarity: "C",
    baseAtk: 40,
    baseDef: 75,
    colorido: 1,
    flavorText: "Hay una panadería en la esquina, te va a gustar.",
    hint: "«Haber» связан с английским «have», но в форме «hay» — «там есть»: есть эй, вот оно.",
    tags: [],
    cefrLevel: "A1",
    isCore: true,
    themes: [],
    quizCorrect: "быть (hay — есть / имеется)",
    quizOptions: [
      "быть (hay — есть / имеется)",
      "иметь (кому-то)",
      "знать факт",
      "давать",
    ],
  },

  // ============================================================
  // Базовые модальные
  // ============================================================
  {
    language: "es",
    conceptKey: "can",
    word: "poder",
    translationRu: "мочь",
    type: "Action",
    rarity: "C",
    baseAtk: 60,
    baseDef: 55,
    colorido: 2,
    flavorText: "¿Podés ayudarme con esto un segundo?",
    hint: "«Poder» — однокоренное со словом «power» (сила): есть power — значит можешь.",
    tags: [],
    cefrLevel: "A1",
    isCore: true,
    themes: [],
    quizCorrect: "мочь",
    quizOptions: ["мочь", "хотеть", "знать", "должен"],
  },

  // ============================================================
  // Базовые действия жизни
  // ============================================================
  {
    language: "es",
    conceptKey: "live",
    word: "vivir",
    translationRu: "жить",
    type: "Action",
    rarity: "C",
    baseAtk: 50,
    baseDef: 60,
    colorido: 2,
    flavorText: "Vivo en el barrio de Palermo desde hace dos años.",
    hint: "«Vivir» — прямой родственник «vivo» в музыке (живое исполнение) и «виварий»: жить, живое.",
    tags: [],
    cefrLevel: "A1",
    isCore: true,
    themes: [],
    quizCorrect: "жить",
    quizOptions: ["жить", "работать", "быть (временно / находиться)", "идти"],
  },
  {
    language: "es",
    conceptKey: "work",
    word: "trabajar",
    translationRu: "работать",
    type: "Action",
    rarity: "C",
    baseAtk: 60,
    baseDef: 50,
    colorido: 2,
    flavorText: "Mañana no trabajo, por fin descansamos.",
    hint: "«Trabajar» — от латинского tripalium (орудие пыток): работа как мучение, а «trabajo» по смыслу близко к «трудно».",
    tags: [],
    cefrLevel: "A1",
    isCore: true,
    themes: [],
    quizCorrect: "работать",
    quizOptions: ["работать", "играть", "спать", "гулять"],
  },

  // ============================================================
  // Базовые глаголы знания
  // ============================================================
  {
    language: "es",
    conceptKey: "know_fact",
    word: "saber",
    translationRu: "знать (факт)",
    type: "Action",
    rarity: "C",
    baseAtk: 55,
    baseDef: 60,
    colorido: 2,
    flavorText: "—¿Sabés dónde está el baño? —Sí, segunda puerta.",
    hint: "«Saber» — корень «sabio» (мудрец): знать факт, быть в курсе. Родственник английского «savvy».",
    tags: [],
    cefrLevel: "A1",
    isCore: true,
    themes: [],
    quizCorrect: "знать (факт)",
    quizOptions: [
      "знать (факт)",
      "знать (быть знакомым)",
      "думать",
      "помнить",
    ],
  },
  {
    language: "es",
    conceptKey: "know_person",
    word: "conocer",
    translationRu: "знать (быть знакомым)",
    type: "Action",
    rarity: "C",
    baseAtk: 55,
    baseDef: 60,
    colorido: 2,
    flavorText: "¿Conocés a María? Trabaja conmigo en la oficina.",
    hint: "«Conocer» — корень английского «recognize» (узнавать): знать по знакомству, узнавать лично.",
    tags: [],
    cefrLevel: "A1",
    isCore: true,
    themes: [],
    quizCorrect: "знать (быть знакомым)",
    quizOptions: [
      "знать (быть знакомым)",
      "знать (факт)",
      "видеть",
      "помнить",
    ],
  },

  // ============================================================
  // Базовые глаголы коммуникации
  // ============================================================
  {
    language: "es",
    conceptKey: "give",
    word: "dar",
    translationRu: "давать",
    type: "Action",
    rarity: "C",
    baseAtk: 60,
    baseDef: 45,
    colorido: 2,
    flavorText: "¿Me das una mano con las bolsas?",
    hint: "«Dar» — максимально короткий, как «дать» в русском: оба глагола означают одно действие и звучат похоже.",
    tags: [],
    cefrLevel: "A1",
    isCore: true,
    themes: [],
    quizCorrect: "давать",
    quizOptions: ["давать", "брать", "продавать", "искать"],
  },
  {
    language: "es",
    conceptKey: "say",
    word: "decir",
    translationRu: "говорить (сказать что-то)",
    type: "Action",
    rarity: "C",
    baseAtk: 55,
    baseDef: 55,
    colorido: 2,
    flavorText: "¿Qué te dijo el médico? ¿Todo bien?",
    hint: "«Decir» — от латинского dicere, тот же корень что в «dictation» (диктант): сказать, продиктовать.",
    tags: [],
    cefrLevel: "A1",
    isCore: true,
    themes: [],
    quizCorrect: "говорить (сказать что-то)",
    quizOptions: [
      "говорить (сказать что-то)",
      "слушать",
      "думать",
      "писать",
    ],
  },

  // ============================================================
  // Базовый «нравится»
  // ============================================================
  {
    language: "es",
    conceptKey: "like",
    word: "gustar",
    translationRu: "нравиться",
    type: "Action",
    rarity: "C",
    baseAtk: 50,
    baseDef: 55,
    colorido: 2,
    flavorText: "Me gusta el mate amargo, sin azúcar.",
    hint: "«Gustar» — тот же корень что «gusto» (вкус, gusto в английском): что по вкусу, то и нравится.",
    tags: [],
    cefrLevel: "A1",
    isCore: true,
    themes: [],
    quizCorrect: "нравиться",
    quizOptions: ["нравиться", "хотеть", "любить", "пробовать"],
  },
];
