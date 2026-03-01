import { getMotivationMessage } from '../lib/motivationMessages';

export function progressPercent(startWeight, currentWeight, targetWeight) {
  const start = Number(startWeight);
  const current = Number(currentWeight);
  const target = Number(targetWeight);
  if (start === target || start < target) return 0;
  const totalToLose = start - target;
  const lost = start - current;
  return Math.round((lost / totalToLose) * 1000) / 10;
}

export default function ProgressCard({
  userId,
  startWeight,
  currentWeight,
  targetWeight,
  deltaStart,
  deltaLastWeek,
  weeksSameWeight = 0,
}) {
  const gainedFromStart = deltaStart != null && deltaStart > 0;
  const weightNotMoving = deltaLastWeek != null && deltaLastWeek === 0;
  const atStartWeight = startWeight != null && currentWeight != null && currentWeight === startWeight;
  const atStartAndFlat = atStartWeight && (weightNotMoving || weeksSameWeight >= 2);
  const makingProgress = deltaStart != null && deltaStart < 0;
  const showNote = gainedFromStart || weightNotMoving || weeksSameWeight >= 2 || atStartAndFlat || makingProgress;
  const type = gainedFromStart
    ? 'gained'
    : atStartAndFlat
    ? 'atStartFlat'
    : weeksSameWeight >= 2
    ? 'flatMultiWeek'
    : weightNotMoving
    ? 'flat'
    : makingProgress
    ? 'progress'
    : null;
  const msg = showNote && userId ? getMotivationMessage(userId, type, String(currentWeight ?? '')) : null;
  const isProgressType = type === 'progress';

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-5 space-y-3 shadow-xl">
      <h2 className="font-bold text-white/90">Your progress</h2>
      {showNote && msg && (
        <div
          className={`px-4 py-3 rounded-2xl space-y-1 ${
            isProgressType ? 'bg-emerald-500/20 border border-emerald-400/30' : 'bg-violet-500/10 border border-violet-400/20'
          }`}
        >
          <p className={`text-sm ${isProgressType ? 'text-emerald-200' : 'text-violet-200'}`}>{msg.note}</p>
          <ul className={`text-xs list-disc list-inside space-y-0.5 ${isProgressType ? 'text-emerald-300/90' : 'text-violet-300/90'}`}>
            {msg.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-white/50 text-xs font-medium">Start</p>
          <p className="font-bold text-white">{startWeight ? `${startWeight} lbs` : '—'}</p>
        </div>
        <div>
          <p className="text-white/50 text-xs font-medium">Now</p>
          <p className="font-bold text-white">{currentWeight != null ? `${currentWeight} lbs` : '—'}</p>
        </div>
        <div>
          <p className="text-white/50 text-xs font-medium">Target</p>
          <p className="font-bold text-cyan-300">{targetWeight ? `${targetWeight} lbs` : '—'}</p>
        </div>
        {deltaStart != null && (
          <div>
            <p className="text-white/50 text-xs font-medium">Vs start</p>
            <p className={`font-bold ${deltaStart <= 0 ? 'text-emerald-400' : 'text-violet-400'}`}>
              {deltaStart > 0 ? '+' : ''}{deltaStart} lbs
            </p>
          </div>
        )}
        {deltaLastWeek != null && (
          <div>
            <p className="text-white/50 text-xs font-medium">Vs last week</p>
            <p className={`font-bold ${deltaLastWeek <= 0 ? 'text-emerald-400' : 'text-violet-400'}`}>
              {deltaLastWeek > 0 ? '+' : ''}{deltaLastWeek} lbs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
