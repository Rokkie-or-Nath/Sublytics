import { useEffect, useState } from 'react';
import { SignupPage } from './SignupPage';
import { LoginPage } from './LoginPage';

type AuthView = 'login' | 'signup';

export function AuthPage() {
  const [view, setView] = useState<AuthView>('login');

  // Defensive: make sure the loader is hidden once we reach the auth page.
  useEffect(() => {
    document.body.style.overflow = '';
  }, []);

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-bright/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      {view === 'login' ? (
        <LoginPage
          key="login"
          onSwitchToSignup={() => setView('signup')}
        />
      ) : (
        <SignupPage
          key="signup"
          onSwitchToLogin={() => setView('login')}
        />
      )}
    </div>
  );
}
