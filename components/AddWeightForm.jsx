import { useState } from 'react';
import { getTodayString } from '../lib/dateUtils';

export default function AddWeightForm({ onSuccess, initialWeight }) {
  const [weight, setWeight] = useState(initialWeight ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = String(weight).trim();
    if (!trimmed) {
      setError('Please enter your weight');
      return;
    }
    const num = Number(trimmed);
    if (Number.isNaN(num)) {
      setError('Valid number only');
      return;
    }
    if (num < 30 || num > 800) {
      setError('30–800 lbs only');
      return;
    }
    setLoading(true);
    try {
      const today = getTodayString(new Date());
      await onSuccess(num, today);
      setWeight('');
    } catch (err) {
      setError(err.message || 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-label="Log weight">
      <div>
        <label htmlFor="weight-input" className="block text-sm font-semibold text-white/90 mb-1">
          Weight (lbs)
        </label>
        <input
          id="weight-input"
          type="number"
          step="0.1"
          min={30}
          max={800}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/40 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/50 outline-none transition"
          placeholder="e.g. 165"
          disabled={loading}
          aria-invalid={!!error}
          aria-describedby={error ? 'weight-error' : undefined}
        />
      </div>
      {error && (
        <p id="weight-error" className="text-sm text-violet-300 font-medium" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold rounded-2xl hover:from-violet-400 hover:to-blue-400 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/30"
      >
        {loading ? 'Saving…' : 'Log it'}
      </button>
    </form>
  );
}
