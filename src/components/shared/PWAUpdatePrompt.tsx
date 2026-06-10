import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Diamond, X } from 'lucide-react';
import { useSWUpdate } from '../../hooks/useSWUpdate';

/**
 * PWA update notification — appears when a new service worker is available.
 * The user can either update (reload) or dismiss it.
 */
export function PWAUpdatePrompt() {
  const { needRefresh, update, dismiss } = useSWUpdate();

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-36 lg:bottom-20 right-4 left-4 lg:left-auto lg:w-80 z-50"
        >
          <div className="bg-bg-surface border border-border rounded-2xl p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Diamond className="w-4 h-4 text-accent" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">
                  Update available
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  A newer version of Sublytics is ready.
                </p>
              </div>

              <button
                onClick={dismiss}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={update}
              className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-accent rounded-lg hover:bg-accent-bright transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Update & reload
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}