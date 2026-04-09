/**
 * Taxonomy mapping for existing 150 seed words — Phase 2.18 Content Foundation
 *
 * Source of truth:
 * - docs/taxonomy.md (domain/theme assignments)
 * - docs/content-plan.md § 12 "Раскладка 11 спорных слов" (takes precedence over taxonomy.md where they differ)
 *
 * Each entry: conceptKey → { cefrLevel, isCore?, themes: [primary, ...additional] }
 *
 * Empty themes array + isCore: true → Core word (no theme).
 * First theme in array = primary; rest = additional.
 *
 * This map is consumed by seed.ts to upsert WordTheme records after each Word upsert.
 */

import type { CefrLevel } from "./seed-words.types.js";

export type WordTaxonomy = {
  cefrLevel: CefrLevel;
  isCore?: boolean;
  themes: string[];
};

export const WORD_TAXONOMY: Record<string, WordTaxonomy> = {
  // ============================================================
  // COMMON (75 слов)
  // ============================================================

  // Places (12)
  house: { cefrLevel: "A1", themes: ["home"] },
  school: { cefrLevel: "A1", themes: ["school-education"] },
  street: { cefrLevel: "A1", themes: ["city-streets"] },
  city: { cefrLevel: "A1", themes: ["city-streets"] },
  park: { cefrLevel: "A1", themes: ["city-streets", "nature-outdoors"] },
  shop: { cefrLevel: "A1", themes: ["shopping"] },
  market: { cefrLevel: "A1", themes: ["shopping", "city-streets"] },
  hospital: { cefrLevel: "A1", themes: ["body-health", "city-streets"] },
  bank: { cefrLevel: "A2", themes: ["money-bank", "city-streets"] },
  // kitchen → moved to seed-theme-kitchen.ts (TASK-051)
  bathroom: { cefrLevel: "A1", themes: ["home", "morning-routine"] },
  square: { cefrLevel: "A1", themes: ["city-streets"] },

  // Persons (13)
  friend: { cefrLevel: "A1", themes: ["friendship-relationships", "meeting-people"] },
  mother: { cefrLevel: "A1", themes: ["family"] },
  father: { cefrLevel: "A1", themes: ["family"] },
  brother: { cefrLevel: "A1", themes: ["family"] },
  sister: { cefrLevel: "A1", themes: ["family"] },
  son: { cefrLevel: "A1", themes: ["family"] },
  daughter: { cefrLevel: "A1", themes: ["family"] },
  doctor: { cefrLevel: "A1", themes: ["body-health", "professions"] },
  teacher: { cefrLevel: "A1", themes: ["school-education", "professions"] },
  student: { cefrLevel: "A1", themes: ["school-education"] },
  neighbor: { cefrLevel: "A1", themes: ["meeting-people", "home"] },
  boy: { cefrLevel: "A1", themes: ["family"] },
  girl: { cefrLevel: "A1", themes: ["family"] },

  // Actions (15)
  // eat/drink → moved to seed-theme-kitchen.ts (TASK-051)
  sleep: { cefrLevel: "A1", themes: ["morning-routine", "home"] },
  speak: { cefrLevel: "A1", isCore: true, themes: [] }, // hablar → Core
  read: { cefrLevel: "A1", isCore: true, themes: [] }, // leer → Core
  write: { cefrLevel: "A1", isCore: true, themes: [] }, // escribir → Core
  go: { cefrLevel: "A1", isCore: true, themes: [] }, // ir → Core
  come: { cefrLevel: "A1", isCore: true, themes: [] }, // venir → Core
  see: { cefrLevel: "A1", isCore: true, themes: [] }, // ver → Core
  do: { cefrLevel: "A1", isCore: true, themes: [] }, // hacer → Core
  want: { cefrLevel: "A1", isCore: true, themes: [] }, // querer → Core
  need: { cefrLevel: "A1", isCore: true, themes: [] }, // necesitar → Core
  think: { cefrLevel: "A1", isCore: true, themes: [] }, // pensar → Core
  play: { cefrLevel: "A1", isCore: true, themes: [] }, // jugar → Core (universal)
  walk: { cefrLevel: "A1", themes: ["morning-routine", "city-streets"] },

  // Objects (20)
  // water → moved to seed-theme-kitchen.ts (TASK-051)
  book: { cefrLevel: "A1", themes: ["school-education", "home"] },
  table: { cefrLevel: "A1", themes: ["eating-out", "home", "kitchen"] }, // mesa → primary eating-out
  chair: { cefrLevel: "A1", themes: ["home"] },
  bed: { cefrLevel: "A1", themes: ["home", "morning-routine"] },
  door: { cefrLevel: "A1", themes: ["home"] },
  window: { cefrLevel: "A1", themes: ["home"] },
  phone: { cefrLevel: "A1", themes: ["tech-gadgets"] },
  key: { cefrLevel: "A1", themes: ["home"] },
  money: { cefrLevel: "A1", themes: ["money-bank", "shopping"] },
  // food/bread/milk/coffee/tea/apple/chicken → moved to seed-theme-kitchen.ts (TASK-051)
  clothes: { cefrLevel: "A1", themes: ["clothing"] }, // ropa → primary clothing only
  shoes: { cefrLevel: "A1", themes: ["clothing"] }, // zapatos → primary clothing
  watch: { cefrLevel: "A1", themes: ["clothing"] }, // reloj → primary clothing

  // Emotions (10)
  happy: { cefrLevel: "A1", themes: ["feelings"] },
  sad: { cefrLevel: "A1", themes: ["feelings"] },
  tired: { cefrLevel: "A1", themes: ["feelings", "body-health"] },
  angry: { cefrLevel: "A1", themes: ["feelings", "disagreement-conflict"] },
  nervous: { cefrLevel: "A1", themes: ["feelings"] },
  calm: { cefrLevel: "A1", themes: ["feelings"] },
  bored: { cefrLevel: "A1", themes: ["feelings"] },
  pleased: { cefrLevel: "A1", themes: ["feelings"] },
  hungry: { cefrLevel: "A1", themes: ["feelings", "kitchen"] },

  // Expressions (6)
  hello: { cefrLevel: "A1", themes: ["greetings-courtesy"] },
  goodbye: { cefrLevel: "A1", themes: ["greetings-courtesy"] },
  thank_you: { cefrLevel: "A1", themes: ["greetings-courtesy"] },
  sorry: { cefrLevel: "A1", themes: ["greetings-courtesy"] },
  how_are_you: { cefrLevel: "A1", themes: ["greetings-courtesy", "meeting-people"] },
  good_morning: { cefrLevel: "A1", themes: ["greetings-courtesy", "morning-routine"] },

  // ============================================================
  // UNCOMMON (45 слов)
  // ============================================================

  // Places (7)
  office: { cefrLevel: "A2", themes: ["work-office"] },
  restaurant: { cefrLevel: "A2", themes: ["restaurant-abroad", "eating-out"] },
  airport: { cefrLevel: "A2", themes: ["airport-transit"] },
  station: { cefrLevel: "A2", themes: ["transport", "city-streets"] },
  river: { cefrLevel: "A2", themes: ["nature-outdoors"] },
  mountain: { cefrLevel: "A2", themes: ["nature-outdoors"] },
  supermarket: { cefrLevel: "A1", themes: ["shopping"] },

  // Persons (8)
  boss: { cefrLevel: "A2", themes: ["work-office", "professions"] }, // jefe
  coworker: { cefrLevel: "A2", themes: ["work-office", "friendship-relationships"] }, // compañero
  client: { cefrLevel: "A2", themes: ["work-office", "shopping"] },
  driver: { cefrLevel: "A2", themes: ["transport", "professions"] },
  // cook_person → moved to seed-theme-kitchen.ts (TASK-051)
  nurse: { cefrLevel: "A2", themes: ["body-health", "professions"] },
  police_officer: { cefrLevel: "A2", themes: ["city-services", "professions"] },
  artist: { cefrLevel: "A2", themes: ["professions"] },

  // Actions (10)
  run: { cefrLevel: "A2", isCore: true, themes: [] }, // correr → Core
  listen: { cefrLevel: "A1", isCore: true, themes: [] }, // escuchar → Core
  // cook_action → moved to seed-theme-kitchen.ts (TASK-051)
  drive: { cefrLevel: "A2", themes: ["transport"] },
  buy: { cefrLevel: "A1", themes: ["shopping"] },
  sell: { cefrLevel: "A2", themes: ["shopping"] },
  call: { cefrLevel: "A1", themes: ["tech-gadgets"] },
  wait: { cefrLevel: "A2", isCore: true, themes: [] }, // esperar → Core
  search: { cefrLevel: "A2", isCore: true, themes: [] }, // buscar → Core
  learn: { cefrLevel: "A2", themes: ["school-education"] },

  // Objects (10)
  work_noun: { cefrLevel: "A2", themes: ["work-office"] }, // trabajo
  trip: { cefrLevel: "A2", themes: ["nature-outdoors", "airport-transit", "travel-docs"] }, // viaje
  ticket: { cefrLevel: "A2", themes: ["airport-transit", "transport"] },
  map: { cefrLevel: "A2", themes: ["asking-directions", "nature-outdoors", "travel-docs"] },
  computer: { cefrLevel: "A2", themes: ["tech-gadgets", "work-office"] },
  bicycle: { cefrLevel: "A1", themes: ["transport"] },
  backpack: { cefrLevel: "A2", themes: ["nature-outdoors", "school-education"] },
  gift: { cefrLevel: "A2", themes: ["party-celebration"] },
  passport: { cefrLevel: "A2", themes: ["airport-transit", "travel-docs"] },
  medicine: { cefrLevel: "A2", themes: ["body-health"] },

  // Emotions (6)
  fear: { cefrLevel: "A2", themes: ["feelings"] },
  joy: { cefrLevel: "A2", themes: ["feelings"] },
  surprise_emotion: { cefrLevel: "A2", themes: ["feelings"] },
  embarrassment: { cefrLevel: "A2", themes: ["feelings"] },
  worry: { cefrLevel: "A2", themes: ["feelings"] },
  patience: { cefrLevel: "A2", themes: ["feelings"] },

  // Expressions (4)
  please: { cefrLevel: "A1", themes: ["greetings-courtesy"] },
  you_are_welcome: { cefrLevel: "A1", themes: ["greetings-courtesy"] },
  excuse_me: { cefrLevel: "A1", themes: ["greetings-courtesy"] },
  how_nice: { cefrLevel: "A2", themes: ["meeting-people", "party-celebration"] }, // ¡qué lindo!

  // ============================================================
  // RARE (20 слов)
  // ============================================================

  // Places (3)
  neighborhood: { cefrLevel: "A2", themes: ["city-streets"] }, // barrio
  border: { cefrLevel: "B1", themes: ["travel-docs"] },
  building: { cefrLevel: "A2", themes: ["city-streets"] },

  // Persons (3)
  partner: { cefrLevel: "A2", themes: ["friendship-relationships"] }, // pareja
  stranger: { cefrLevel: "A2", themes: ["meeting-people", "city-streets"] },
  guest: { cefrLevel: "B1", themes: ["party-celebration"] },

  // Actions (4)
  lose: { cefrLevel: "A2", themes: ["feelings", "abstract-life"] }, // perder
  take_advantage: { cefrLevel: "B1", themes: ["abstract-life"] }, // aprovechar
  convince: { cefrLevel: "B1", themes: ["disagreement-conflict"] },
  recognize: { cefrLevel: "B1", themes: ["abstract-life"] },

  // Objects (4) — all abstract concepts
  meeting: { cefrLevel: "B1", themes: ["meetings-business"] }, // reunión
  opportunity: { cefrLevel: "B1", themes: ["abstract-life"] },
  decision: { cefrLevel: "B1", themes: ["abstract-life"] },
  memory: { cefrLevel: "B1", themes: ["abstract-life", "feelings"] },

  // Emotions (3)
  pride: { cefrLevel: "B1", themes: ["feelings"] },
  anxiety: { cefrLevel: "B1", themes: ["feelings"] },
  relief: { cefrLevel: "B1", themes: ["feelings"] },

  // Expressions (3)
  suddenly: { cefrLevel: "A2", themes: ["time-moments"] }, // de repente
  on_purpose: { cefrLevel: "B1", themes: ["time-moments"] }, // a propósito
  no_way: { cefrLevel: "B1", themes: ["disagreement-conflict", "slang-rioplatense", "idioms-everyday"] }, // ni loco

  // ============================================================
  // SR (10 слов) — all lunfardo/idioms
  // ============================================================

  nightclub: { cefrLevel: "A2", themes: ["slang-rioplatense", "party-celebration"] }, // boliche → primary slang
  kid_slang: { cefrLevel: "A2", themes: ["slang-rioplatense", "meeting-people"] }, // pibe
  realize: { cefrLevel: "A2", themes: ["idioms-everyday", "abstract-life"] }, // darse cuenta
  support_slang: { cefrLevel: "B1", themes: ["slang-rioplatense", "friendship-relationships"] }, // bancar
  mess_slang: { cefrLevel: "B1", themes: ["slang-rioplatense", "city-streets"] }, // quilombo
  nostalgia: { cefrLevel: "B1", themes: ["feelings"] },
  carry_responsibility: { cefrLevel: "B1", themes: ["idioms-everyday", "abstract-life"] }, // cargar con
  daydream: { cefrLevel: "B1", themes: ["idioms-everyday", "feelings"] }, // estar en las nubes
  no_problem: { cefrLevel: "A2", themes: ["idioms-everyday", "slang-rioplatense", "greetings-courtesy"] }, // no hay drama
  no_way_slang: { cefrLevel: "B1", themes: ["slang-rioplatense", "disagreement-conflict"] }, // ni en pedo
};

/**
 * Get taxonomy for a seed word's conceptKey. Throws if not mapped.
 * Used in seed.ts to avoid silently dropping words without taxonomy.
 */
export const getWordTaxonomy = (conceptKey: string | null | undefined): WordTaxonomy => {
  if (!conceptKey) {
    throw new Error("Cannot get taxonomy: conceptKey is null");
  }
  const taxonomy = WORD_TAXONOMY[conceptKey];
  if (!taxonomy) {
    throw new Error(`No taxonomy mapping for conceptKey: ${conceptKey}. Update seed-words-taxonomy.ts`);
  }
  return taxonomy;
};
