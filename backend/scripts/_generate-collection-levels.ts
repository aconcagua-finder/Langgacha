/**
 * Collection ladder generator — Phase 2.18 TASK-052.
 *
 * Not wired into build or seed. Run manually when you need to re-tune
 * the 100-level ladder:
 *
 *   DATABASE_URL=postgresql://u:p@localhost:5432/db npx tsx scripts/_generate-collection-levels.ts
 *
 * Copy output and paste into src/shared/constants.ts COLLECTION_LEVELS.
 *
 * Tri-phase exponential curve, tuned to hit real CEFR word thresholds on
 * specific level anchors:
 *   L25  → A1  (500 words)
 *   L40  → A2  (1000 words)
 *   L55  → B1  (2000 words)
 *   L75  → B2  (4000 words)
 *   L92  → C1  (8000 words)
 *   L100 → C2* (10000 words, real C2 is ~16000 — we stop at "C2 start")
 *
 * Phase 1 (L1-18):  linear, 18 + (L-1)*20
 * Phase 2 (L19-30): prev * 1.050
 * Phase 3 (L31-65): prev * 1.045
 * Phase 4 (L66-100): prev * 1.035
 */

const RANKS_METALES = ["Cobre", "Bronce", "Hierro", "Plata", "Oro", "Platino"];
const RANKS_PIEDRAS = [
  "Ónix",
  "Jade",
  "Turquesa",
  "Zafiro",
  "Esmeralda",
  "Rubí",
  "Diamante",
];
const RANKS_COSMOS = [
  "Luna",
  "Estrella",
  "Constelación",
  "Nébula",
  "Galaxia",
  "Cosmos",
  "Eternidad",
];
const ROMAN = ["I", "II", "III", "IV", "V"];

type Epoch = "Metales" | "Piedras" | "Cosmos";

const levelToName = (
  level: number,
): { epoch: Epoch; shortName: string; roman: string; fullName: string } => {
  let epoch: Epoch;
  let rank: string;
  let roman: string;
  if (level <= 30) {
    epoch = "Metales";
    rank = RANKS_METALES[Math.floor((level - 1) / 5)]!;
    roman = ROMAN[(level - 1) % 5]!;
  } else if (level <= 65) {
    epoch = "Piedras";
    rank = RANKS_PIEDRAS[Math.floor((level - 31) / 5)]!;
    roman = ROMAN[(level - 31) % 5]!;
  } else {
    epoch = "Cosmos";
    rank = RANKS_COSMOS[Math.floor((level - 66) / 5)]!;
    roman = ROMAN[(level - 66) % 5]!;
  }
  return { epoch, shortName: rank, roman, fullName: `${rank} ${roman}` };
};

const buildWidths = (): number[] => {
  const w = new Array<number>(101).fill(0);
  const p1Start = 18;
  const p1Step = 20;
  const p1End = 18;
  const p2Rate = 1.05;
  const p2End = 30;
  const p3Rate = 1.045;
  const p3End = 65;
  const p4Rate = 1.035;
  for (let L = 1; L <= p1End; L += 1) {
    w[L] = p1Start + (L - 1) * p1Step;
  }
  for (let L = p1End + 1; L <= p2End; L += 1) {
    w[L] = w[L - 1]! * p2Rate;
  }
  for (let L = p2End + 1; L <= p3End; L += 1) {
    w[L] = w[L - 1]! * p3Rate;
  }
  for (let L = p3End + 1; L <= 100; L += 1) {
    w[L] = w[L - 1]! * p4Rate;
  }
  return w.slice(1).map((x) => Math.round(x));
};

const avgLevelFor = (L: number): number => {
  if (L <= 10) return Number((3 + L * 0.3).toFixed(1));
  if (L <= 25) return Number((6 + (L - 10) * 0.15).toFixed(1));
  if (L <= 40) return Number((8.25 + (L - 25) * 0.12).toFixed(1));
  if (L <= 55) return Number((10.05 + (L - 40) * 0.12).toFixed(1));
  if (L <= 75) return Number((11.85 + (L - 55) * 0.11).toFixed(1));
  if (L <= 92) return Number((14.05 + (L - 75) * 0.12).toFixed(1));
  return Number((16.09 + (L - 92) * 0.15).toFixed(1));
};

const CEFR_ANCHORS: Record<number, string> = {
  25: "A1",
  40: "A2",
  55: "B1",
  75: "B2",
  92: "C1",
  100: "C2",
};

const unlockedRarities = (L: number): string[] => {
  const r: string[] = ["C"];
  if (L >= 6) r.push("UC");
  if (L >= 18) r.push("R");
  if (L >= 23) r.push("SR");
  if (L >= 38) r.push("SSR");
  return r;
};

const widths = buildWidths();

// eslint-disable-next-line no-console
console.log("export const COLLECTION_LEVELS = [");
for (let L = 1; L <= 100; L += 1) {
  const { epoch, shortName, roman, fullName } = levelToName(L);
  const width = widths[L - 1];
  const avg = avgLevelFor(L);
  const cefr = CEFR_ANCHORS[L] ?? null;
  const certified = cefr !== null;
  const rarities = unlockedRarities(L);
  const rarityStr = rarities.map((x) => `"${x}"`).join(", ");
  const cefrStr = cefr === null ? "null" : `"${cefr}"`;
  // eslint-disable-next-line no-console
  console.log(
    `  { level: ${L}, name: "${fullName}", shortName: "${shortName}", roman: "${roman}", epoch: "${epoch}", widthRequired: ${width}, minAvgWordLevel: ${avg}, realCefr: ${cefrStr}, cefrCertified: ${certified}, unlockedRarities: [${rarityStr}] },`,
  );
}
// eslint-disable-next-line no-console
console.log("] as const;");
