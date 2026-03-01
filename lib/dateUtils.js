import { format, parseISO, parse, startOfWeek, subWeeks, subDays } from 'date-fns';

/** Parse date string as local date (avoids parseISO UTC quirks for date-only). */
export function parseDateLocal(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return parseISO(str);
  return parse(str, 'yyyy-MM-dd', new Date());
}

export function getTodayString(date = new Date()) {
  const d = typeof date === 'string' ? parseDateLocal(date) : (date instanceof Date ? date : new Date(date));
  return format(d, 'yyyy-MM-dd');
}

/** Week starts Monday (ISO week). Uses local timezone. */
export function getWeekStart(date = new Date()) {
  const d = typeof date === 'string' ? parseDateLocal(date) : (date instanceof Date ? date : new Date(date));
  return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export function getWeekStartAgo(weeksAgo) {
  const d = new Date();
  const monday = startOfWeek(d, { weekStartsOn: 1 });
  const target = subWeeks(monday, weeksAgo);
  return format(target, 'yyyy-MM-dd');
}

export function getWeightDateKey(w) {
  return w.date || w.weekStart;
}

/** Count distinct weeks (for leaderboard when using daily logs). */
export function getDistinctWeeksCount(weights) {
  if (!weights?.length) return 0;
  const weeks = new Set(weights.map((w) => {
    const dk = getWeightDateKey(w);
    return dk ? getWeekStart(dk) : null;
  }).filter(Boolean));
  return weeks.size;
}

/** Returns the weight value from the latest entry (most recent weekStart, then most recent update). */
export function getLatestWeight(weights) {
  if (!weights?.length) return null;
  const sorted = [...weights].sort((a, b) => {
    const ka = getWeightDateKey(a) || '';
    const kb = getWeightDateKey(b) || '';
    if (kb !== ka) return kb > ka ? 1 : -1;
    const ta = a._sortTs ?? 0;
    const tb = b._sortTs ?? 0;
    return tb - ta;
  });
  return sorted[0]?.weight ?? null;
}

/** Streak: consecutive days logged (legacy). */
export function getStreak(weights) {
  if (!weights?.length) return 0;
  const sorted = [...weights].sort((a, b) => {
    const da = getWeightDateKey(a);
    const db = getWeightDateKey(b);
    return db > da ? 1 : -1;
  });
  const today = getTodayString();
  const mostRecent = getWeightDateKey(sorted[0]);
  if (mostRecent > today) return 0;
  let streak = 0;
  let expected = mostRecent;
  for (let i = 0; i < sorted.length; i++) {
    const key = getWeightDateKey(sorted[i]);
    if (key !== expected) break;
    streak++;
    const d = parseDateLocal(expected);
    expected = format(subDays(d, 1), 'yyyy-MM-dd');
  }
  return streak;
}

/** Streak: consecutive weeks with at least one log. */
export function getStreakWeeks(weights) {
  if (!weights?.length) return 0;
  const weekKeys = [...new Set(weights.map((w) => {
    const dk = getWeightDateKey(w);
    return dk ? getWeekStart(dk) : null;
  }))].filter(Boolean);
  weekKeys.sort((a, b) => (a > b ? -1 : 1));
  const thisWeek = getWeekStart();
  if (weekKeys[0] > thisWeek) return 0;
  let streak = 0;
  let expected = weekKeys[0];
  for (let i = 0; i < weekKeys.length; i++) {
    if (weekKeys[i] !== expected) break;
    streak++;
    const d = parseDateLocal(expected);
    expected = format(subWeeks(d, 1), 'yyyy-MM-dd');
  }
  return streak;
}
