import { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

/**
 * A simple install button that triggers the native PWA install prompt.
 * If the `beforeinstallprompt` event hasn't fired yet, clicking this button
 * will silently do nothing — the user can try again later or use their
 * browser's built-in install menu.
 */
export function PWAInstallButton({ variant = 'full' }: { variant?: 'full' | 'mini' }) {
  const { isInstalled, install, canInstall } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (!install) return;
    setInstalling(true);
    try {
      await install();
    } catch {
      // dismissed or failed
    }
    setInstalling(false);
  };

  if (!canInstall) return null;

  if (variant === 'mini') {
    return (
      <button
        onClick={handleClick}
        disabled={installing}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition-colors disabled:opacity-50"
        title="Install app"
      >
        <Download className="w-3.5 h-3.5" />
        {installing ? 'Installing…' : 'Install'}
      </button>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
          <Smartphone className="w-4.5 h-4.5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">Install App</p>
          <p className="text-xs text-text-muted">Add Sublytics to your device</p>
        </div>
      </div>
      <button
        onClick={handleClick}
        disabled={installing}
        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dim text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-all duration-300 disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {installing ? 'Installing…' : 'Install to device'}
      </button>
    </div>
  );
}