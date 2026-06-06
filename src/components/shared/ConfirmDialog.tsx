import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
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
            onClick={onCancel}
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
                <button onClick={onCancel} className="p-1 rounded-lg hover:bg-bg-elevated transition-colors text-text-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-text-secondary">{message}</p>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-border">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-bg-elevated hover:bg-bg-hover rounded-lg transition-colors"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={`px-4 py-2 text-sm font-medium text-white ${s.button} rounded-lg transition-colors`}
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}