import { getStreakWeeks, getLatestWeight } from '../lib/dateUtils';

export default function Leaderboard({ entries, loading }) {
  if (loading) return <div className="text-center py-8 text-white/60 font-medium">Loading…</div>;
  if (!entries?.length) {
    return (
      <div className="text-center py-12 text-white/50 rounded-3xl bg-white/5 border-2 border-dashed border-white/20 font-medium">
        No entries yet. Be the first to log!
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/10 rounded-3xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
      {entries.map((entry, index) => (
        <li key={entry.userId} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition">
          <span className="w-10 text-lg font-bold bg-gradient-to-r from-violet-400 to-blue-500 bg-clip-text text-transparent">
            #{index + 1}
          </span>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/30 to-blue-500/30 border border-white/20 flex items-center justify-center text-lg font-bold text-white">
            {entry.name ? entry.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white truncate flex items-center gap-1">
              {entry.name || 'Anonymous'}
              {index === 0 && <span>🏆🏆🏆</span>}
              {index === 1 && <span>🏆🏆</span>}
              {index === 2 && <span>🏆</span>}
            </p>
            <p className="text-xs text-white/50">{entry.weeksLogged} log{entry.weeksLogged !== 1 ? 's' : ''} · {entry.streak ?? 0}w streak</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/50">Start: {entry.originalWeight != null ? `${entry.originalWeight}` : '—'}</p>
            <p className="text-sm font-bold text-white">Now: {entry.currentWeight != null ? `${entry.currentWeight}` : '—'}</p>
            <p className={`text-sm font-bold ${(entry.originalWeight - entry.currentWeight) > 0 ? 'text-emerald-400' : (entry.currentWeight - entry.originalWeight) > 0 ? 'text-violet-400' : 'text-white/60'}`}>
              {entry.originalWeight != null && entry.currentWeight != null
                ? (entry.originalWeight - entry.currentWeight > 0 ? '-' : '+') + Math.abs(entry.originalWeight - entry.currentWeight).toFixed(1) + ' lbs'
                : '—'}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function getDateKey(w) {
  return w.date || w.weekStart;
}

function getWeekStartAgo(weeks) {
  const d = new Date();
  d.setDate(d.getDate() - weeks * 7);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  return d.toISOString().slice(0, 10);
}

export function buildLeaderboardEntries(users, weightsByUser, filter) {
  const entries = [];
  for (const user of users) {
    const uid = user.id;
    let weights = weightsByUser[uid] || [];
    if (filter != null) {
      if (typeof filter === 'number') {
        const minDate = getWeekStartAgo(filter);
        weights = weights.filter((w) => (getDateKey(w) || '') >= minDate);
      } else if (filter?.start != null && filter?.end != null) {
        weights = weights.filter(
          (w) => (getDateKey(w) || '') >= filter.start && (getDateKey(w) || '') <= filter.end
        );
      }
    }
    const sorted = [...weights].sort((a, b) => (getDateKey(b) > getDateKey(a) ? 1 : -1));
    const currentWeight = getLatestWeight(weights);
    const originalWeight = user.startWeight != null && user.startWeight > 0 ? user.startWeight : null;
    const weightLost =
      originalWeight != null && currentWeight != null ? originalWeight - currentWeight : -Infinity;
    const streak = getStreakWeeks(weights);
    entries.push({
      userId: uid,
      name: user.name || user.email,
      email: user.email,
      originalWeight,
      targetWeight: user.targetWeight ?? 0,
      currentWeight,
      weightLost,
      weeksLogged: sorted.length,
      streak,
    });
  }
  entries.sort((a, b) => {
    if (b.weightLost !== a.weightLost) return b.weightLost - a.weightLost;
    return (b.weeksLogged || 0) - (a.weeksLogged || 0);
  });
  return entries;
}
