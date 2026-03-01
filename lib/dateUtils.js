import { format, parseISO, startOfWeek, subWeeks, subDays } from 'date-fns';

export function getTodayString(date = new Date()) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

/** Week starts Monday (ISO week). */
export function getWeekStart(date = new Date()) {
  const d = typeof date === 'string' ? parseISO(date) : date;
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
    const d = parseISO(expected);
    expected = format(subDays(d, 1), 'yyyy-MM-dd');
  }
  return streak;
}

/** Streak: consecutive weeks logged (spec). */
export function getStreakWeeks(weights) {
  if (!weights?.length) return 0;
  const weekKeys = [...new Set(weights.map((w) => getWeightDateKey(w)))].filter(Boolean);
  weekKeys.sort((a, b) => (a > b ? -1 : 1));
  const thisWeek = getWeekStart();
  if (weekKeys[0] > thisWeek) return 0;
  let streak = 0;
  let expected = weekKeys[0];
  for (let i = 0; i < weekKeys.length; i++) {
    if (weekKeys[i] !== expected) break;
    streak++;
    const d = parseISO(expected);
    expected = format(subWeeks(d, 1), 'yyyy-MM-dd');
  }
  return streak;
}
