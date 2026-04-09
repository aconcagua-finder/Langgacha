# Content Generation Prompt — LangGacha Theme Pack

> **Derived from TASK-051 (seed-theme-kitchen.ts).** This is the canonical prompt template used to generate subsequent theme packs in Phase 2.18 Stage 5. Keep it in sync with the kitchen reference when style rules evolve.

---

## When to use this

You're generating a new theme pack for LangGacha — a Rioplatense Spanish learning gacha. The output must be a TypeScript file exporting `const <THEME>_WORDS: SeedWord[]` ready to import in `backend/scripts/seed-words.ts`.

Reference file: `backend/scripts/seed-theme-kitchen.ts`. Match its structure, tone, rigor.

---

## Hard constraints (non-negotiable)

### 1. Dialect — Rioplatense Spanish (argentine/uruguayan)

- **Voseo in every flavor text**: `vos tenés / sos / podés / hacés / sabés`. NEVER `tú tienes / eres / puedes`.
- **Rioplatense vocabulary**: `heladera` (not `nevera`), `manteca` (not `mantequilla`), `palta` (not `aguacate`), `celular` (not `móvil`), `papa` (not `patata`), `pollera` (not `falda`), `colectivo/bondi` (not `autobús`), `remera` (not `camiseta`).
- **Regional word meanings**: when a word means different things in AR vs ES, take the AR meaning. Example: `boliche` = ночной клуб (AR), not боулинг (ES).
- **Lunfardo** is welcome for R/SR/SSR rarities (`morfar`, `pibe`, `quilombo`, `bancar`). NEVER in C (base) words.

### 2. CEFR gating

- **C base words** → CEFR A1 (unless word is truly rare/uncommon in everyday Rioplatense speech, then A2).
- **UC words** → A1 or A2.
- **R words** → A2 or B1. Often regionalisms or argentine specialties.
- **SR words** → B1 or B2. Lunfardo, idioms, culturally-loaded.
- **SSR** → B1-C1. Full-blown lunfardo, archaisms, niche slang.

### 3. Mnemonic (`hint`) rules

**Forbidden:** descriptive phrases like `"sounds soft"`, `"sounds hard"`, `"sounds bright"`. These don't help recall.

**Required:** one concrete association that lifts the meaning in a single mental step. Three patterns allowed:

**Pattern A — Internationalism:**
> "«Plato» — прямой родственник английского «plate»: тарелка."

**Pattern B — Phonetic link WITH explanation:**
> "«Tenedor» от «tener» (держать) + «-dor» (инструмент): инструмент, которым держат еду = вилка."

**Pattern C — Morphology breakdown:**
> "«Panadero» — от «pan» (хлеб) + -ero (деятель): тот, кто делает хлеб. Пекарь."

If you can't find an association — don't fake one. Pick a different word.

### 4. Flavor text rules

- **Length by rarity:** C ~5–10 words | UC ~6–12 | R ~8–15 | SR ~10–20
- **Everyday voseo register.** Sound like a real argentinian in the street.
- **No generic textbook sentences.** Instead of "Me gusta comer pan" prefer "Compré pan fresquito para el desayuno."
- **Dialogs OK for UC+.** Use `—` (em-dash) to separate speakers. Example: `"—¿Vamos a morfar? —Dale, muero de hambre."`
- **Rioplatense cultural touches welcome**: mate, asado, milanesa, facturas, Buenos Aires references, "el viejo", "el barrio", etc.

### 5. Quiz distractor rules (CRITICAL)

**The three wrong options in `quizOptions` MUST come from the same theme, ideally same word type (Object/Action/Emotion/etc).**

Bad example (forbidden — don't do this):
```ts
quizCorrect: "сковорода",
quizOptions: ["сковорода", "школа", "бегать", "радость"], // ❌ random junk
```

Good example:
```ts
quizCorrect: "сковорода",
quizOptions: ["сковорода", "кастрюля", "противень", "миска"], // ✅ all kitchen objects
```

**Why:** this is the ONLY place where the player trains semantic discrimination. Random distractors turn quizzes into trivial guessing.

### 6. Stats (baseAtk / baseDef)

Scale within rarity range. Rough guidelines by type:

| Type | baseAtk | baseDef | Reasoning |
|------|---------|---------|-----------|
| Object (food/tool) | 30-60 | 40-70 | Defensive |
| Action (verb) | 55-75 | 35-55 | Aggressive |
| Emotion (state/taste) | 40-60 | 45-65 | Balanced |
| Place | 35-55 | 50-70 | Defensive |
| Person | 50-70 | 45-65 | Balanced |
| Expression | 55-75 | 40-60 | Mixed |

Variance ±10 within the range is fine. Don't overthink it — the engine rolls real stats inside rarity range per-instance.

### 7. Colorido (visual impact 1-10)

- C: 1-3 (base, neutral)
- UC: 2-4 (slightly more flavor)
- R: 4-6 (regional, cultural)
- SR: 6-8 (strong rioplatense identity)
- SSR: 7-10 (lunfardo legendary)

### 8. Theme field

Primary theme = first element. Additional themes = rest. Only list themes a player would reasonably expect the word to appear in. No more than 3-4 themes per word.

Example: `agua` — primary `kitchen`, additional `restaurant-abroad`, `morning-routine`, `body-health`. These are the real contexts where water comes up.

---

## Target size and distribution per theme

**Theme size:** ~80 words (60 minimum, 100 maximum). Go for richness, not bloat.

**Rarity distribution (soft target):**
- C: ~55% (44 words)
- UC: ~25% (20 words)
- R: ~13% (10 words)
- SR: ~5% (4 words)
- SSR: ~2% (2 words — optional, only if you have real gems)

**Type distribution** depends on the theme. For `kitchen`: ~50% Object (food/tool), ~25% Action (verb), ~10% Emotion, ~10% Place, ~5% Expression/Person. Other themes will differ.

**MUST include across rarity levels:**
- Base vocabulary (C): the 20-30 words a tourist would learn first
- Verbs (Action, C/UC): 10-15 key verbs for the context
- Regional specialty (R): argentine dishes/terms/objects unique to the theme
- Lunfardo gem (SR): at least 1-2 culturally dense slang expressions

---

## SeedWord structure (copy-paste template)

```typescript
{
  language: "es",
  conceptKey: "english_snake_case_id",     // unique across entire seed
  word: "palabra",                          // Spanish word (rioplatense form)
  translationRu: "русский перевод",        // precise, may include notation like "(арг.)"
  type: "Object",                           // Person | Place | Action | Object | Emotion | Expression
  rarity: "C",                              // C | UC | R | SR | SSR
  baseAtk: 45,                              // int, within rarity range
  baseDef: 55,                              // int, within rarity range
  colorido: 2,                              // 1-10 per rarity guideline
  flavorText: "Vení a la cocina, dale.",   // length per rarity, voseo mandatory
  hint: "«Palabra» — корень ...",          // concrete association, not description
  tags: [],                                 // keep empty, legacy field
  cefrLevel: "A1",                          // A1 | A2 | B1 | B2 | C1 | C2
  themes: ["kitchen", "home"],             // first = primary, rest = additional
  quizCorrect: "перевод",                   // must match translationRu or be a subset
  quizOptions: ["перевод", "опция2", "опция3", "опция4"],  // all 3 wrong options from same theme
},
```

---

## Process

1. **Read `docs/taxonomy.md`** to understand the theme's scope, CEFR tier, and neighboring themes.
2. **Skim `seed-theme-kitchen.ts`** to see the reference style in action.
3. **Brainstorm the vocabulary** for the theme before writing code. Start from base nouns, then verbs, then emotions/adjectives, then expressions. Include argentine specialties and at least one lunfardo gem.
4. **Check against Core** (`seed-words-core.ts`) — don't duplicate universal verbs like `ser`, `tener`, `hacer`. Those live in Core.
5. **Write the SeedWord entries** with all fields. Stat numbers last — focus on word/translation/flavor/hint/quiz first.
6. **Validate quiz distractors**: for every word, ensure the 3 wrong options exist somewhere in the theme (or are words that belong to the theme even if not in this pack yet).
7. **Export** as `<THEME>_WORDS` and add to `seed-words.ts`.
8. **If any words overlap with legacy seed files** (`seed-words-common.ts` etc), physically remove them from the legacy file AND from `seed-words-taxonomy.ts`, to avoid duplicate inserts.
9. **Run `docker compose exec backend npm run db:setup`** and open 3-5 boosters via API to verify the theme fires.

---

## Anti-patterns (from content-audit.md, don't repeat)

### ❌ Mnemonic-as-description

```ts
hint: "«Mesa» звучит как место для тарелок — стол." // describes, doesn't associate
hint: "«Hijo» звучит как короткое детское «хи-хо»." // doesn't distinguish son from daughter
hint: "«Pollo» — будто пёрышко полетело." // semantic conflict: chickens don't fly
```

### ❌ Slang leaking into C

```ts
rarity: "C",
flavorText: "Gracias por ayudarme, posta." // "posta" is slang, should be R+
```

### ❌ Random quiz distractors

```ts
quizCorrect: "нуждаться",
quizOptions: ["нуждаться", "покупать", "ждать", "терять / проигрывать"] // mixed types, no semantic frame
```

### ❌ Neutral/Castilian over Rioplatense

```ts
word: "nevera",     // ❌ → "heladera"
word: "mantequilla", // ❌ → "manteca"
word: "aguacate",    // ❌ → "palta"
flavorText: "Tú tienes que comer." // ❌ → "Vos tenés que comer."
```

### ❌ Over-explained hints

```ts
// Too long, reader will not read:
hint: "«Cocina» это место в доме, где готовят еду, и это слово тесно связано с английским «cook», которое происходит от латинского coquere, означающего варить или готовить."
```

Keep it one sentence, one association.

---

## Sanity checks before declaring a theme done

- [ ] ~80 words (give or take 20)
- [ ] Rarity distribution roughly C 55% / UC 25% / R 13% / SR 5% / SSR 2%
- [ ] No duplicated `conceptKey` with other theme files or legacy
- [ ] Every `cefrLevel` matches theme's tier (or is one level lower for base items)
- [ ] Every `hint` is an association, not a description
- [ ] Every `flavorText` uses voseo
- [ ] Every `quizOptions` has 3 theme-native distractors
- [ ] At least 1 lunfardo SR+ gem
- [ ] Reference argentine specialties (if applicable to the theme)
- [ ] `primaryTheme` (`themes[0]`) is always the current theme
- [ ] File imported in `seed-words.ts`
- [ ] Overlapping legacy entries removed from `seed-words-common.ts` / `seed-words-uncommon.ts` / `seed-words-taxonomy.ts`
- [ ] `npm run db:setup` runs clean, no warnings about missing taxonomy
- [ ] Opening boosters returns this theme's words with correct `primaryTheme`
- [ ] Reverse quiz distractors all belong to the theme

---

## Future improvements (not blocking)

- Automate the sanity checks as a `scripts/_verify-theme.ts` helper.
- Extract rarity/stat/colorido ranges as typed constants so the prompt references code, not hand-copied numbers.
- Cross-reference multiple themes for shared words (add `additionalThemes` automatically based on theme definitions).
