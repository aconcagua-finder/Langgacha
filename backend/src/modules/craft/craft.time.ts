const isSameUtcDay = (a: Date, b: Date): boolean =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate();

export const nextUtcMidnightIso = (from: Date): string => {
  const next = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + 1));
  return next.toISOString();
};

export const getDailyAvailability = (lastAt: Date | null): { available: boolean; nextAt: string | null } => {
  if (!lastAt) return { available: true, nextAt: null };
  const now = new Date();
  if (!isSameUtcDay(lastAt, now)) return { available: true, nextAt: null };
  return { available: false, nextAt: nextUtcMidnightIso(now) };
};

