import Link from 'next/link';

export default function RankPreview({ rank, total, lbsBehindLeader, leaderName }) {
  if (!total || rank == null) return null;
  const isLead = rank === 1;

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <div className="flex justify-between items-center gap-2">
        <span className="text-sm font-bold text-white/90">
          Your rank: <span className="bg-gradient-to-r from-violet-400 to-blue-500 bg-clip-text text-transparent">#{rank} of {total}</span>
          {rank <= 3 && <span className="ml-1">{rank === 1 ? '🏆🏆🏆' : rank === 2 ? '🏆🏆' : '🏆'}</span>}
        </span>
        <Link href="/group" className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition">
          See leaderboard →
        </Link>
      </div>
      <p className="text-sm text-white/60 mt-1">
        {isLead ? (
          <span className="text-amber-400 font-bold">You&apos;re winning!</span>
        ) : lbsBehindLeader != null && lbsBehindLeader > 0 && leaderName ? (
          <span>{lbsBehindLeader.toFixed(1)} lbs behind {leaderName}</span>
        ) : (
          <span className="text-white/40">Log weight to see ranking</span>
        )}
      </p>
    </div>
  );
}
