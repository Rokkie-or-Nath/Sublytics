import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  error = '',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: { bg: 'bg-danger/10', border: 'border-danger/20', text: 'text-danger', button: 'bg-danger hover:bg-danger/80' },
    warning: { bg: 'bg-alert/10', border: 'border-alert/20', text: 'text-alert', button: 'bg-alert hover:bg-alert/80' },
    info: { bg: 'bg-accent/10', border: 'border-accent/20', text: 'text-accent', button: 'bg-accent hover:bg-accent-dim' },
  };

  const s = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={isLoading ? undefined : onCancel}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              className="bg-bg-surface border border-border rounded-2xl shadow-2xl shadow-black/30 w-full max-w-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className={`flex items-center gap-3 ${s.text}`}>
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                </div>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="p-1 rounded-lg hover:bg-bg-elevated transition-colors text-text-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-text-secondary">{message}</p>
                {error && (
                  <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-border">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-bg-elevated hover:bg-bg-hover rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-medium text-white ${s.button} rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {isLoading && (
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isLoading ? 'Working…' : confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
