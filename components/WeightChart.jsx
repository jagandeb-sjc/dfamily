import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { getWeightDateKey, parseDateLocal } from '../lib/dateUtils';

export default function WeightChart({ weights, startWeight, targetWeight }) {
  const data = useMemo(() => {
    if (!weights?.length) return [];
    return [...weights]
      .sort((a, b) => (getWeightDateKey(a) < getWeightDateKey(b) ? -1 : 1))
      .map((w) => {
        const dk = getWeightDateKey(w);
        return {
          dateKey: dk,
          label: format(parseDateLocal(dk), 'MMM d'),
          weight: Number(w.weight),
        };
      });
  }, [weights]);

  const yDomain = useMemo(() => {
    if (!data.length) return [0, 200];
    const vals = data.map((d) => d.weight);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const all = [min, max, startWeight, targetWeight].filter(Boolean);
    const padding = max === min ? 3 : 5;
    return [Math.min(...all) - padding, Math.max(...all) + padding];
  }, [data, startWeight, targetWeight]);

  if (!data.length) {
    return (
      <div className="h-72 flex flex-col items-center justify-center rounded-3xl bg-white/5 border-2 border-dashed border-white/20">
        <p className="text-white/70 font-semibold">Your chart awaits</p>
        <p className="text-white/40 text-sm mt-1">Log weight to see your journey</p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full rounded-3xl overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="weightGradientGz" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }} />
          <YAxis domain={yDomain} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }} width={32} />
          <Tooltip
            contentStyle={{
              background: 'rgba(15,10,26,0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: '#fff',
            }}
            formatter={(value) => [`${value} lbs`, 'Weight']}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.dateKey && format(parseDateLocal(payload[0].payload.dateKey), 'MMM d, yyyy')
            }
          />
          {startWeight > 0 && <ReferenceLine y={startWeight} stroke="#a78bfa" strokeDasharray="4 4" strokeOpacity={0.8} />}
          {targetWeight > 0 && targetWeight !== startWeight && (
            <ReferenceLine y={targetWeight} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.8} />
          )}
          <Area
            type="monotone"
            dataKey="weight"
            stroke="#8b5cf6"
            strokeWidth={3}
            fill="url(#weightGradientGz)"
            dot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
