import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthForm from '../components/AuthForm';

export default function SignupPage({ user, authReady }) {
  const router = useRouter();

  useEffect(() => {
    if (authReady && user) router.replace('/dashboard');
  }, [authReady, user, router]);

  const handleSuccess = () => {
    router.replace('/dashboard');
  };

  return (
    <div className="max-w-sm mx-auto mt-16 p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
      <h2 className="text-2xl font-extrabold text-white mb-2">Sign up</h2>
      <p className="text-white/60 text-sm mb-6">Use Google to get started</p>
      <AuthForm mode="signup" onSuccess={handleSuccess} />
    </div>
  );
}
