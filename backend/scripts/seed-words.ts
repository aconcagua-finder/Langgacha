import type { SeedWord } from "./seed-words.types.js";

import { COMMON_WORDS } from "./seed-words-common.js";
import { CORE_WORDS } from "./seed-words-core.js";
import { KITCHEN_WORDS } from "./seed-theme-kitchen.js";
import { RARE_WORDS } from "./seed-words-rare.js";
import { SR_WORDS } from "./seed-words-sr.js";
import { UNCOMMON_WORDS } from "./seed-words-uncommon.js";

export type { SeedWord } from "./seed-words.types.js";

/**
 * Combined word pool for seeding.
 *
 * Phase 2.18 Content Foundation composition:
 * - CORE_WORDS (12): base verbs (ser/estar/tener/...) — filling the A1 gap
 * - KITCHEN_WORDS (~88): reference theme, fully populated inline (TASK-051)
 * - COMMON/UNCOMMON/RARE/SR_WORDS: legacy pool (TASK-049 mapping).
 *   Their SeedWord fields don't include cefrLevel/isCore/themes inline;
 *   seed.ts looks them up in seed-words-taxonomy.ts by conceptKey at seed time.
 *   This keeps the legacy files minimally touched until TASK-053+ content revision.
 *
 * When a theme is lifted into its own seed-theme-*.ts file:
 *   1) Entries are physically removed from the legacy file (to avoid duplicates)
 *   2) Entries are removed from seed-words-taxonomy.ts (no longer looked up)
 *   3) New file is imported here and added to the spread
 */
export const WORDS: SeedWord[] = [
  ...CORE_WORDS,
  ...KITCHEN_WORDS,
  ...COMMON_WORDS,
  ...UNCOMMON_WORDS,
  ...RARE_WORDS,
  ...SR_WORDS,
];
