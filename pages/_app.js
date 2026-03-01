import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { subscribeAuth, getUserProfile } from '../lib/firebaseClient.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import FitnessBackground from '../components/FitnessBackground.jsx';


const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', weight: ['400','500','600','700','800'] });

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = subscribeAuth(async (authUser) => {
      setUser(authUser || null);
      if (authUser) {
        const p = await getUserProfile(authUser.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  return (
    <div className={`${jakarta.variable} font-sans min-h-screen flex flex-col relative`}>
      <FitnessBackground />
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar user={user} />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
          <Component
            {...pageProps}
            user={user}
            profile={profile}
            authReady={authReady}
            refreshProfile={async () => {
              if (user) {
                const p = await getUserProfile(user.uid);
                setProfile(p);
              }
            }}
          />
        </main>
        <Footer />
      </div>
    </div>
  );
}
