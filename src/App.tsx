import { useEffect, useRef, useState } from 'react';
import { useStore } from './store/useStore';
import { AuthPage } from './pages/AuthPage';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { motion } from 'framer-motion';
import { Diamond, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { onAuthStateChange } from './lib/accounts';

// ─── On-page log capture ────────────────────────────────────────────────────
// Mirror console.log/warn/error into a buffer we can render on the page,
// so the user doesn't need dev tools open to see what's happening.

interface LogEntry {
  ts: number;
  level: 'log' | 'warn' | 'error';
  text: string;
}

const logBuffer: LogEntry[] = [];
const logListeners = new Set<() => void>();

function pushLog(level: LogEntry['level'], args: unknown[]) {
  logBuffer.push({
    ts: Date.now(),
    level,
    text: args
      .map((a) => {
        if (a instanceof Error) return a.stack || a.message;
        if (typeof a === 'object') {
          try { return JSON.stringify(a); } catch { return String(a); }
        }
        return String(a);
      })
      .join(' '),
  });
  // Cap the buffer so we don't grow forever.
  if (logBuffer.length > 200) logBuffer.shift();
  logListeners.forEach((l) => l());
}

let installed = false;
function installLogMirror() {
  if (installed) return;
  installed = true;
  const origLog = console.log;
  const origWarn = console.warn;
  const origErr = console.error;
  console.log = (...args) => {
    pushLog('log', args);
    origLog.apply(console, args);
  };
  console.warn = (...args) => {
    pushLog('warn', args);
    origWarn.apply(console, args);
  };
  console.error = (...args) => {
    pushLog('error', args);
    origErr.apply(console, args);
  };
}

// ─── Loader + debug panel ──────────────────────────────────────────────────

function FullScreenLoader() {
  const initError = useStore((s) => s.initError);
  const initAuth = useStore((s) => s.initAuth);
  const [, force] = useState(0);

  // Subscribe to log buffer updates so the on-page log list re-renders.
  // Use setTimeout to avoid "Cannot update during render" warnings when
  // pushLog is called during another component's render cycle.
  useEffect(() => {
    const cb = () => setTimeout(() => force((n) => n + 1), 0);
    logListeners.add(cb);
    return () => { logListeners.delete(cb); };
  }, []);

  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logBuffer.length]);

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Diamond className="w-7 h-7 text-accent animate-pulse" />
          </div>
          <p className="text-sm text-text-muted">Loading your dashboard…</p>
        </div>

        <div className="bg-bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className={`w-4 h-4 ${initError ? 'text-danger' : 'text-text-muted'}`} />
            <h2 className="text-sm font-semibold text-text-primary">
              {initError ? 'Something went wrong' : 'Debug info'}
            </h2>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <Row label="Supabase URL" value={import.meta.env.VITE_SUPABASE_URL || '(empty)'} />
            <Row
              label="Anon key"
              value={
                import.meta.env.VITE_SUPABASE_ANON_KEY
                  ? import.meta.env.VITE_SUPABASE_ANON_KEY.slice(0, 12) +
                    '…' +
                    import.meta.env.VITE_SUPABASE_ANON_KEY.slice(-6)
                  : '(empty)'
              }
            />
            <Row
              label="Is configured?"
              value={import.meta.env.VITE_SUPABASE_URL?.startsWith('https://') ? '✅ yes' : '❌ no'}
            />
          </div>

          {initError && (
            <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-xs font-semibold text-danger mb-1">Error message:</p>
              <p className="text-xs text-text-secondary whitespace-pre-wrap break-words font-mono">
                {initError}
              </p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => initAuth()}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
            <button
              onClick={() => {
                try {
                  Object.keys(localStorage)
                    .filter((k) => k.startsWith('sublytics_') || k.startsWith('sb-'))
                    .forEach((k) => localStorage.removeItem(k));
                } catch { /* noop */ }
                window.location.reload();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-bg-elevated text-text-secondary border border-border rounded-lg hover:bg-bg-hover transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear session & reload
            </button>
          </div>

          {/* Live console mirror — shows exactly where the load hangs */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] uppercase tracking-wider text-text-muted">
                Live log ({logBuffer.length})
              </p>
              <button
                onClick={() => { logBuffer.length = 0; force((n) => n + 1); }}
                className="text-[11px] text-text-muted hover:text-text-primary"
              >
                clear
              </button>
            </div>
            <div
              ref={logRef}
              className="h-40 overflow-y-auto bg-bg-deep border border-border rounded-lg p-2 font-mono text-[11px] space-y-0.5"
            >
              {logBuffer.length === 0 ? (
                <p className="text-text-muted italic">No log output yet…</p>
              ) : (
                logBuffer.map((e, i) => (
                  <div
                    key={i}
                    className={
                      e.level === 'error'
                        ? 'text-danger'
                        : e.level === 'warn'
                        ? 'text-alert'
                        : 'text-text-secondary'
                    }
                  >
                    <span className="text-text-muted">
                      [{new Date(e.ts).toISOString().slice(11, 19)}]
                    </span>{' '}
                    {e.text}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-text-muted shrink-0 w-24">{label}:</span>
      <span className="text-text-primary break-all">{value}</span>
    </div>
  );
}

function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-danger" />
          </div>
          <h1 className="text-lg font-semibold text-text-primary">
            Supabase isn't configured yet
          </h1>
        </div>
        <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
          {message}
        </p>
        <div className="mt-6 p-4 bg-bg-elevated rounded-lg text-xs font-mono text-text-muted">
          <p className="mb-2 text-text-secondary">Quick start:</p>
          <p>1. Sign up free at <span className="text-accent">https://supabase.com</span></p>
          <p>2. Create a new project</p>
          <p>3. Run the SQL in <code className="text-accent">supabase/migrations/001_initial_schema.sql</code> in the SQL Editor</p>
          <p>4. Copy your URL + anon key from Project Settings → API</p>
          <p>5. Paste them into <code className="text-accent">.env</code></p>
          <p>6. Restart <code className="text-accent">npm run dev</code></p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Install the log mirror once, before anything else runs.
  useEffect(() => { installLogMirror(); }, []);

  const { isAuthenticated, isInitializing, initError, currentPage, initAuth, logout } = useStore();

  // Track whether the initial auth has already been triggered to avoid races
  // from React 19 StrictMode double-invocation + onAuthStateChange firing
  // for an existing session.
  const initStartedRef = useRef(false);

  // 1. Initial session check on mount (only once, regardless of StrictMode).
  useEffect(() => {
    if (!initStartedRef.current) {
      initStartedRef.current = true;
      initAuth();
    }
  }, [initAuth]);

  // 2. React to Supabase auth state changes (sign-out, token refresh,
  //    session expiry in another tab, etc.) so the local store stays in sync.
  //    IMPORTANT: Only subscribe ONCE — no dependency on initAuth/logout to
  //    prevent re-subscribing on every page navigation (which would trigger
  //    a full initAuth() reload and freeze the UI).
  useEffect(() => {
    let isFirstEvent = true;
    const { data: sub } = onAuthStateChange((user) => {
      if (isFirstEvent) {
        isFirstEvent = false;
        return; // Skip the initial auth state broadcast; initAuth() already handled it.
      }
      if (user) {
        initAuth();
      } else {
        logout();
      }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isInitializing) {
    return (
      <ErrorBoundary>
        <FullScreenLoader />
      </ErrorBoundary>
    );
  }

  if (initError && !isAuthenticated) {
    return (
      <ErrorBoundary>
        <ConfigErrorScreen message={initError} />
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
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {renderPage()}
        </motion.div>
      </Layout>
    </ErrorBoundary>
  );
}
