import { useState } from 'react';
import { useStore } from '../store/useStore';
import { AnimatePresence } from 'framer-motion';
import { SignupPage } from './SignupPage';
import { LoginPage } from './LoginPage';
import { EmailDetection } from '../components/auth/EmailDetection';

type AuthView = 'login' | 'signup' | 'detecting';

export function AuthPage() {
  const {
    login,
    isDetecting,
    setIsDetecting,
    setDetectionProgress,
    setDetectionMessage,
  } = useStore();

  const [view, setView] = useState<AuthView>('login');
  const [pendingEmail, setPendingEmail] = useState('');

  const handleSwitchToSignup = () => setView('signup');
  const handleSwitchToLogin = () => setView('login');

  const handleSignupSuccess = (email: string) => {
    setPendingEmail(email);
    startDetection(email);
  };

  const handleLoginSuccess = (email: string) => {
    setPendingEmail(email);
    startDetection(email);
  };

  const startDetection = (email: string) => {
    setIsDetecting(true);
    setDetectionProgress(0);
    setDetectionMessage('');

    const messages = [
      'Connecting to email servers...',
      'Scanning inbox for subscription receipts...',
      'Analyzing payment history...',
      'Detecting recurring charges...',
      'Identifying subscription services...',
      'Calculating spending patterns...',
      'Generating insights...',
      'Finalizing your dashboard...',
    ];

    (async () => {
      for (let i = 0; i < messages.length; i++) {
        setDetectionMessage(messages[i]);
        setDetectionProgress(((i + 1) / messages.length) * 100);
        await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
      }
      login(email);
      setIsDetecting(false);
      setDetectionProgress(0);
      setDetectionMessage('');
    })();
  };

  if (isDetecting) {
    return <EmailDetection />;
  }

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-bright/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <AnimatePresence mode="wait">
        {view === 'login' && (
          <LoginPage
            key="login"
            onSwitchToSignup={handleSwitchToSignup}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {view === 'signup' && (
          <SignupPage
            key="signup"
            onSwitchToLogin={handleSwitchToLogin}
            onSignupSuccess={handleSignupSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}