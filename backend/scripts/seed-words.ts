import type { SeedWord } from "./seed-words.types.js";

import { COMMON_WORDS } from "./seed-words-common.js";
import { RARE_WORDS } from "./seed-words-rare.js";
import { SR_WORDS } from "./seed-words-sr.js";
import { UNCOMMON_WORDS } from "./seed-words-uncommon.js";

export type { SeedWord } from "./seed-words.types.js";

export const WORDS: SeedWord[] = [
  ...COMMON_WORDS,
  ...UNCOMMON_WORDS,
  ...RARE_WORDS,
  ...SR_WORDS,
];
