import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function HomePage({ user, authReady }) {
  const router = useRouter();
  useEffect(() => {
    if (authReady && user) router.replace('/dashboard');
  }, [authReady, user, router]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl -z-0 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl -z-0 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -z-0" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
          <span className="text-violet-400">🏆</span>
          <span className="text-sm font-semibold text-white/80">DFamily weight challenge</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
            DFamily
          </span>
          <span className="block text-white/90 mt-1">Weight Challenge</span>
        </h1>

        <p className="text-xl md:text-2xl text-white/70 mb-4 font-medium">
          Track. Compete. Slay.
        </p>
        <p className="text-white/50 text-base mb-12 max-w-md mx-auto">
          Log weight with your fam and see who&apos;s winning. No cap — this one hits different.
        </p>

        {/* CTA */}
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-lg rounded-2xl hover:from-violet-400 hover:to-blue-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/40 active:scale-100 shadow-xl shadow-violet-500/30"
        >
          Let&apos;s go
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        {/* Feature highlights */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <span className="text-3xl mb-2">📊</span>
            <span className="font-semibold text-white/90 text-sm">Log daily</span>
            <span className="text-white/50 text-xs mt-0.5">Track your weight</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <span className="text-3xl mb-2">📈</span>
            <span className="font-semibold text-white/90 text-sm">See progress</span>
            <span className="text-white/50 text-xs mt-0.5">Charts & streaks</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <span className="text-3xl mb-2">🏆</span>
            <span className="font-semibold text-white/90 text-sm">Compete</span>
            <span className="text-white/50 text-xs mt-0.5">Family leaderboard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
