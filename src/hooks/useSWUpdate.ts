import { useState, useEffect, useCallback } from 'react';
import { registerSW } from 'virtual:pwa-register';

/**
 * Hook that registers the service worker with update detection.
 *
 * Returns:
 *  - needRefresh: true when a new SW is waiting to activate
 *  - update:      function that triggers the SW update (reloads the page)
 *  - dismiss:     function that dismisses the update notification
 */
export function useSWUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    let updateHandler: ((reloadPage?: boolean) => Promise<void>) | null = null;

    registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        console.log('[PWA] App is ready for offline use');
      },
      onRegisteredSW(swUrl, registration) {
        if (registration) {
          updateHandler = async () => {
            if (registration.waiting) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          };
          setUpdateSW(() => updateHandler!);
        }
      },
      onRegisterError(error) {
        console.error('[PWA] SW registration error:', error);
      },
    });
  }, []);

  const update = useCallback(async () => {
    if (updateSW) {
      await updateSW();
      // Give the SW a moment to activate, then reload.
      setTimeout(() => window.location.reload(), 500);
    }
  }, [updateSW]);

  const dismiss = useCallback(() => {
    setNeedRefresh(false);
  }, []);

  return { needRefresh, update, dismiss };
}