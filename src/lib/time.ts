export const TZ = 'America/Fortaleza';

const isoFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const DAY = 86_400_000;
const utcDay = (iso: string): number => Date.parse(`${iso}T00:00:00Z`);
const isoFromUtc = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/** Hoje (YYYY-MM-DD) no fuso de Fortaleza, independente do fuso do aparelho. */
export const todayFortaleza = (d: Date = new Date()): string => isoFmt.format(d);

export const formatDateBR = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export const daysBetween = (fromIso: string, toIso: string): number =>
  Math.round((utcDay(toIso) - utcDay(fromIso)) / DAY);

/** Dia 1 = data exata do cadastro. */
export const dayNumber = (joinedIso: string, today: string = todayFortaleza()): number =>
  Math.max(1, daysBetween(joinedIso, today) + 1);

export const weekStart = (today: string = todayFortaleza()): string => {
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay();
  return isoFromUtc(utcDay(today) - ((dow + 6) % 7) * DAY);
};

export const countInCurrentWeek = (dates: string[]): number => {
  const start = weekStart();
  const today = todayFortaleza();
  return new Set(dates.filter(d => d >= start && d <= today)).size;
};

/** Dias consecutivos com treino, terminando hoje (ou ontem). */
export const computeStreak = (dates: string[]): number => {
  const set = new Set(dates);
  let cursor = todayFortaleza();
  if (!set.has(cursor)) cursor = isoFromUtc(utcDay(cursor) - DAY);
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = isoFromUtc(utcDay(cursor) - DAY);
  }
  return streak;
};
