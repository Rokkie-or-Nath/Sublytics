import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Capture the event globally as soon as it fires, before React mounts.
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

// Set up the listener immediately (outside React) so we never miss it.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
  });
}

/**
 * Hook that captures the `beforeinstallprompt` event and provides
 * an `install()` function that triggers the native install dialog.
 *
 * Returns:
 *  - isInstalled:  true once the `appinstalled` event fires
 *  - canInstall:   true while the deferred prompt is available (user hasn't
 *                  dismissed or installed yet)
 *  - install:      async function that shows the native install dialog
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // If already in standalone mode (installed), mark it immediately.
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone
    ) {
      setIsInstalled(true);
      return;
    }

    // Sync from global capture (in case it fired after initial render).
    if (globalDeferredPrompt && !deferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      if (!isInstalled) {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      }
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
    };

    const displayModeHandler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setDeferredPrompt(null);
        globalDeferredPrompt = null;
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', displayModeHandler);

    // Check again after mount in case the display mode changed.
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone
    ) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
      mediaQuery.removeEventListener('change', displayModeHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const install = useCallback(async () => {
    const prompt = deferredPrompt || globalDeferredPrompt;
    if (!prompt) return;
    prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === 'accepted') {
      setDismissed(false);
    } else {
      setDismissed(true);
    }
    setDeferredPrompt(null);
    globalDeferredPrompt = null;
  }, [deferredPrompt]);

  const canInstall = (deferredPrompt !== null || globalDeferredPrompt !== null) && !isInstalled && !dismissed;

  return { isInstalled, canInstall, install };
}