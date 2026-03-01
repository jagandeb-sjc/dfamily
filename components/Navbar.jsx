import { signOut } from '../lib/firebaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar({ user }) {
  const router = useRouter();

  const activeClass = 'bg-white/20 text-white font-bold rounded-2xl';
  const linkClass = 'text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-200';

  return (
    <nav
      className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-xl bg-black/20"
      role="navigation"
      aria-label="Main"
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href={user ? '/dashboard' : '/'}
          className="font-extrabold text-lg bg-gradient-to-r from-violet-400 via-purple-400 to-blue-500 bg-clip-text text-transparent hover:opacity-90 transition"
        >
          DFamily 💪
        </Link>
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`text-sm px-4 py-2 transition-all duration-200 ${router.pathname === '/dashboard' ? activeClass : linkClass}`}
              >
                Dashboard
              </Link>
              <Link
                href="/group"
                className={`text-sm px-4 py-2 transition-all duration-200 ${router.pathname === '/group' ? activeClass : linkClass}`}
              >
                Leaderboard
              </Link>
              <Link
                href="/profile"
                className={`text-sm px-4 py-2 transition-all duration-200 ${router.pathname === '/profile' ? activeClass : linkClass}`}
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.push('/');
                }}
                className="text-sm text-white/70 hover:text-white px-4 py-2 rounded-2xl hover:bg-white/10 transition-all"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-white/80 hover:text-white px-4 py-2 rounded-2xl hover:bg-white/10 transition-all font-medium"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-gradient-to-r from-violet-500 to-blue-500 text-white px-5 py-2 rounded-2xl font-bold hover:from-violet-400 hover:to-blue-400 transition-all hover:scale-105 shadow-lg shadow-violet-500/30"
              >
                Get in
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
