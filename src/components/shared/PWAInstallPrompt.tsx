import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Diamond, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

/**
 * PWA install prompt — shows a banner / bottom sheet when the browser
 * supports installation and the `beforeinstallprompt` event fired.
 */
export function PWAInstallPrompt() {
  const { canInstall, install, isInstalled } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (isInstalled || !canInstall || dismissed) return null;

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await install();
    } catch {
      // User may have dismissed or install failed silently.
    }
    setInstalling(false);
  };

  const handleDismiss = () => setDismissed(true);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-20 lg:bottom-6 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div className="bg-bg-surface border border-border rounded-2xl p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Diamond className="w-5 h-5 text-accent" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary">
                Install Sublytics
              </h3>
              <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                Add to your home screen for quick access and offline support.
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 px-3 py-2 text-xs font-medium text-text-secondary bg-bg-elevated border border-border rounded-lg hover:bg-bg-hover transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              disabled={installing}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-accent rounded-lg hover:bg-accent-bright transition-colors disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              {installing ? 'Installing…' : 'Install'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}