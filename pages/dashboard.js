import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  getWeightsForUser,
  setWeightForWeek,
  getAllUsers,
  getAllWeights,
} from '../lib/firebaseClient';
import { getStreakWeeks, getLatestWeight } from '../lib/dateUtils';
import ProgressCard from '../components/ProgressCard';
import AddWeightForm from '../components/AddWeightForm';
import WeightChart from '../components/WeightChart';
import RankPreview from '../components/RankPreview';
import { buildLeaderboardEntries } from '../components/Leaderboard';

export default function DashboardPage({ user, profile, authReady }) {
  const router = useRouter();
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardEntries, setLeaderboardEntries] = useState([]);

  useEffect(() => {
    if (!authReady || !user) {
      if (authReady && !user) router.replace('/login');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [w, users, allWeights] = await Promise.all([
          getWeightsForUser(user.uid),
          getAllUsers(),
          getAllWeights(),
        ]);
        if (!cancelled) {
          setWeights(w);
          const byUser = {};
          allWeights.forEach((r) => {
            if (!byUser[r.userId]) byUser[r.userId] = [];
            byUser[r.userId].push(r);
          });
          setLeaderboardEntries(buildLeaderboardEntries(users, byUser, null));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authReady, user, router]);

  const handleWeightSaved = async (weight, weekStart) => {
    // Optimistic update: show new weight immediately
    const newEntry = { weekStart, weight, date: weekStart, userId: user.uid };
    setWeights((prev) => {
      const filtered = prev.filter((w) => (w.weekStart || w.date) !== weekStart);
      const merged = [newEntry, ...filtered].sort((a, b) => {
        const ka = a.weekStart || a.date || '';
        const kb = b.weekStart || b.date || '';
        return kb > ka ? 1 : -1;
      });
      return merged;
    });
    setLeaderboardEntries((prev) => {
      const myEntry = prev.find((e) => e.userId === user.uid);
      if (!myEntry) return prev;
      const updated = prev.map((e) =>
        e.userId === user.uid
          ? { ...e, currentWeight: weight, weightLost: (e.originalWeight ?? 0) - weight }
          : e
      );
      return updated.sort((a, b) => (b.weightLost ?? -Infinity) - (a.weightLost ?? -Infinity));
    });
    // Persist and refetch for consistency
    await setWeightForWeek(user.uid, weight, weekStart);
    const [w, users, allWeights] = await Promise.all([
      getWeightsForUser(user.uid),
      getAllUsers(),
      getAllWeights(),
    ]);
    setWeights(w);
    const byUser = {};
    allWeights.forEach((r) => {
      if (!byUser[r.userId]) byUser[r.userId] = [];
      byUser[r.userId].push(r);
    });
    setLeaderboardEntries(buildLeaderboardEntries(users, byUser, null));
  };

  if (!authReady || !user) return null;

  const startWeight = profile?.startWeight ?? 0;
  const targetWeight = profile?.targetWeight ?? 0;
  const getDateKey = (w) => w.date || w.weekStart;
  const sortedWeights = [...weights].sort((a, b) => (getDateKey(b) > getDateKey(a) ? 1 : -1));
  const currentWeight = getLatestWeight(weights) ?? null;
  const mostRecentWeek = sortedWeights[0] ? getDateKey(sortedWeights[0]) : null;
  const previousWeekEntry = sortedWeights[1];
  const previousWeekWeight = previousWeekEntry?.weight ?? null;
  let weeksSameWeight = 0;
  if (currentWeight != null && sortedWeights.length > 0) {
    for (let i = 0; i < sortedWeights.length; i++) {
      if (sortedWeights[i].weight === currentWeight) weeksSameWeight++;
      else break;
    }
  }
  const deltaStart = currentWeight != null && startWeight ? currentWeight - startWeight : null;
  const deltaLastWeek =
    currentWeight != null && previousWeekWeight != null
      ? currentWeight - previousWeekWeight
      : null;
  const streak = getStreakWeeks(weights);

  const myEntry = leaderboardEntries.find((e) => e.userId === user?.uid);
  const myRank = myEntry ? leaderboardEntries.indexOf(myEntry) + 1 : null;
  const leader = leaderboardEntries[0];
  const lbsBehindLeader =
    myEntry &&
    leader &&
    leader.userId !== user?.uid &&
    myEntry.weightLost !== -Infinity &&
    leader.weightLost !== -Infinity
      ? leader.weightLost - myEntry.weightLost
      : null;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
        Dashboard
      </h1>

      {profile && (Number(profile.startWeight) === 0 || Number(profile.targetWeight) === 0) && (
        <div className="bg-violet-500/20 border border-violet-400/30 rounded-2xl p-4 text-sm text-violet-200">
          <a href="/profile" className="font-bold text-violet-300 hover:text-white transition">
            Set start & target weight
          </a>{' '}
          to track progress
        </div>
      )}

      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white/90">Log weight</h2>
            {streak > 0 && (
              <span className="text-sm font-bold text-violet-300 bg-violet-500/20 px-4 py-1.5 rounded-2xl">
                {streak} week{streak !== 1 ? 's' : ''} streak 🔥
              </span>
            )}
          </div>
          <AddWeightForm onSuccess={handleWeightSaved} initialWeight={null} />
          <RankPreview
            rank={myRank}
            total={leaderboardEntries.length}
            lbsBehindLeader={lbsBehindLeader}
            leaderName={leader?.name}
          />
        </div>
        <ProgressCard
          userId={user?.uid}
          startWeight={startWeight}
          currentWeight={currentWeight}
          targetWeight={targetWeight}
          deltaStart={deltaStart}
          deltaLastWeek={deltaLastWeek}
          weeksSameWeight={weeksSameWeight}
        />
      </section>

      <section className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-white/90">Weight history</h2>
          <p className="text-sm text-white/50 mt-0.5">Your journey</p>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="h-72 flex items-center justify-center">
              <p className="text-white/50">Loading…</p>
            </div>
          ) : (
            <WeightChart
              weights={weights}
              startWeight={startWeight}
              targetWeight={targetWeight}
            />
          )}
        </div>
      </section>
    </div>
  );
}
