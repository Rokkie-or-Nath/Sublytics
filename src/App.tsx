import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { AuthPage } from './pages/AuthPage';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import { Diamond } from 'lucide-react';
import { onAuthStateChange } from './lib/accounts';

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Diamond className="w-7 h-7 text-accent animate-pulse" />
        </div>
        <p className="text-sm text-text-muted">Loading your dashboard…</p>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isInitializing, currentPage, initAuth, logout } = useStore();

  // 1. Initial session check on mount.
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // 2. React to Supabase auth state changes (sign-out, token refresh,
  //    session expiry in another tab, etc.) so the local store stays in sync.
  useEffect(() => {
    const { data: sub } = onAuthStateChange((user) => {
      if (user) {
        // Session appeared (e.g. user signed in via another tab) — load data.
        initAuth();
      } else {
        // Session ended (sign-out or expiry) — clear local state.
        logout();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [initAuth, logout]);

  if (isInitializing) {
    return (
      <ErrorBoundary>
        <FullScreenLoader />
      </ErrorBoundary>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <AuthPage />
      </ErrorBoundary>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'subscriptions':
        return <SubscriptionsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <ErrorBoundary>
      <Layout>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </ErrorBoundary>
  );
}
