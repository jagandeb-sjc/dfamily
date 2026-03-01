import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAllUsers, getAllWeights } from '../lib/firebaseClient';
import Leaderboard, { buildLeaderboardEntries } from '../components/Leaderboard';
import { getTodayString, getWeekStartAgo } from '../lib/dateUtils';

const FILTERS = [
  { label: 'Last 4 weeks', value: 4 },
  { label: 'Last 12 weeks', value: 12 },
];

export default function GroupPage({ user, authReady }) {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [weights, setWeights] = useState([]);
  const [filter, setFilter] = useState(4);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const [u, w] = await Promise.all([getAllUsers(), getAllWeights()]);
      setUsers(u);
      setWeights(w);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady || !user) {
      if (authReady && !user) router.replace('/login');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [u, w] = await Promise.all([getAllUsers(), getAllWeights()]);
        if (!cancelled) {
          setUsers(u);
          setWeights(w);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authReady, user, router]);

  // Refetch when tab becomes visible (e.g. after logging weight on dashboard)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (user && document.visibilityState === 'visible') {
        fetchLeaderboard();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [user]);

  const weightsByUser = {};
  weights.forEach((r) => {
    if (!weightsByUser[r.userId]) weightsByUser[r.userId] = [];
    weightsByUser[r.userId].push(r);
  });

  const effectiveFilter =
    showCustom && customStart && customEnd ? { start: customStart, end: customEnd } : filter === null ? null : filter;
  const entries = buildLeaderboardEntries(users, weightsByUser, effectiveFilter);

  const btnActive = 'bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30';
  const btnInactive = 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <button
          type="button"
          onClick={() => fetchLeaderboard()}
          disabled={loading}
          className="px-4 py-2 rounded-2xl text-sm font-bold bg-white/10 text-white/90 hover:bg-white/20 border border-white/20 disabled:opacity-50 transition-all"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => {
              setShowCustom(false);
              setFilter(f.value);
            }}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${!showCustom && filter === f.value ? btnActive : btnInactive}`}
          >
            {f.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setShowCustom(true);
            if (!customStart) setCustomStart(getWeekStartAgo(12));
            if (!customEnd) setCustomEnd(getTodayString());
          }}
          className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${showCustom ? btnActive : btnInactive}`}
        >
          Custom
        </button>
        <button
          type="button"
          onClick={() => {
            setShowCustom(false);
            setFilter(null);
          }}
          className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${!showCustom && filter === null ? btnActive : btnInactive}`}
        >
          All time
        </button>
      </div>
      {showCustom && (
        <div className="flex flex-wrap gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
          <label className="text-sm font-semibold text-white/80">
            From
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="ml-2 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
            />
          </label>
          <label className="text-sm font-semibold text-white/80">
            To
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="ml-2 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
            />
          </label>
          <button
            type="button"
            onClick={() => customStart && customEnd && setShowCustom(true)}
            className="px-4 py-2 bg-violet-500 text-white rounded-xl text-sm font-bold hover:bg-violet-400"
          >
            Apply
          </button>
        </div>
      )}
      <Leaderboard entries={entries} loading={loading} />
    </div>
  );
}
