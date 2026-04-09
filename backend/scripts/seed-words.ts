import type { SeedWord } from "./seed-words.types.js";

import { COMMON_WORDS } from "./seed-words-common.js";
import { CORE_WORDS } from "./seed-words-core.js";
import { RARE_WORDS } from "./seed-words-rare.js";
import { SR_WORDS } from "./seed-words-sr.js";
import { UNCOMMON_WORDS } from "./seed-words-uncommon.js";

export type { SeedWord } from "./seed-words.types.js";

/**
 * Combined word pool for seeding.
 *
 * Note on taxonomy (Phase 2.18):
 * - CORE_WORDS already have cefrLevel, isCore and themes fields populated inline
 *   (they're new, written under the new rules).
 * - COMMON/UNCOMMON/RARE/SR_WORDS are legacy — their SeedWord fields don't include
 *   cefrLevel/isCore/themes yet. The seed.ts script looks them up in
 *   seed-words-taxonomy.ts by conceptKey and merges the fields at seed time.
 *   This keeps the legacy files untouched (blast radius control) until TASK-053+
 *   when they get a full content revision pass.
 */
export const WORDS: SeedWord[] = [
  ...CORE_WORDS,
  ...COMMON_WORDS,
  ...UNCOMMON_WORDS,
  ...RARE_WORDS,
  ...SR_WORDS,
];
