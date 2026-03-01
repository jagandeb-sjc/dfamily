import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { setUserProfile } from '../lib/firebaseClient';

export default function ProfilePage({ user, profile, authReady, refreshProfile }) {
  const router = useRouter();
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (authReady && !user) router.replace('/login');
  }, [authReady, user, router]);

  useEffect(() => {
    if (profile) {
      setStartWeight(String(profile.startWeight ?? ''));
      setTargetWeight(String(profile.targetWeight ?? ''));
    }
  }, [profile]);

  if (!authReady || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const sw = startWeight.trim() ? Number(startWeight) : 0;
      const tw = targetWeight.trim() ? Number(targetWeight) : 0;
      await setUserProfile(user.uid, { startWeight: sw, targetWeight: tw });
      await refreshProfile();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
        Profile
      </h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-md bg-white/5 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 p-6 space-y-4"
      >
        <h2 className="font-bold text-white/90">Weight goals</h2>
        <div>
          <label htmlFor="start-weight" className="block text-sm font-semibold text-white/80 mb-1">
            Start weight (lbs)
          </label>
          <input
            id="start-weight"
            type="number"
            step="0.1"
            min="0"
            value={startWeight}
            onChange={(e) => setStartWeight(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/50 outline-none"
          />
        </div>
        <div>
          <label htmlFor="target-weight" className="block text-sm font-semibold text-white/80 mb-1">
            Target weight (lbs)
          </label>
          <input
            id="target-weight"
            type="number"
            step="0.1"
            min="0"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/50 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold rounded-2xl hover:from-violet-400 hover:to-blue-400 disabled:opacity-50 transition-all hover:scale-[1.02] shadow-lg shadow-violet-500/30"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saved && <p className="text-sm text-emerald-400 font-bold">Saved!</p>}
      </form>
    </div>
  );
}
