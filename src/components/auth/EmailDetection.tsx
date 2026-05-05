import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Diamond, Mail, Search, CreditCard, TrendingUp, CheckCircle2 } from 'lucide-react';

export function EmailDetection() {
  const { detectionProgress, detectionMessage, user } = useStore();

  const steps = [
    { icon: Mail, label: 'Email', threshold: 15 },
    { icon: Search, label: 'Scanning', threshold: 40 },
    { icon: CreditCard, label: 'Detecting', threshold: 65 },
    { icon: TrendingUp, label: 'Analyzing', threshold: 85 },
    { icon: CheckCircle2, label: 'Complete', threshold: 100 },
  ];

  const currentStep = steps.findIndex((s) => detectionProgress < s.threshold);
  const activeStep = currentStep === -1 ? steps.length - 1 : currentStep;

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-bright/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-4"
          >
            <Diamond className="w-8 h-8 text-accent" />
          </motion.div>
          <h1 className="text-2xl font-bold text-text-primary">Analyzing your email</h1>
          <p className="text-sm text-text-secondary mt-1">
            {user?.email}
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/20">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">{detectionMessage || 'Initializing...'}</span>
              <span className="text-sm font-mono text-accent">{Math.round(detectionProgress)}%</span>
            </div>
            <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent-bright rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${detectionProgress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const isCompleted = detectionProgress >= step.threshold;
              const isActive = index === activeStep;
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-accent/5 border border-accent/20' : 'border border-transparent'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-accent/20'
                        : isActive
                        ? 'bg-accent/10 animate-pulse'
                        : 'bg-bg-elevated'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    ) : (
                      <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium transition-colors ${
                        isCompleted ? 'text-accent' : isActive ? 'text-text-primary' : 'text-text-muted'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {isCompleted && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs text-accent font-medium"
                    >
                      Done
                    </motion.span>
                  )}
                  {isActive && (
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-accent"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Stats preview */}
          {detectionProgress > 50 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 pt-6 border-t border-border"
            >
              <p className="text-xs text-text-muted uppercase tracking-wider mb-3">Preliminary findings</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-bg-elevated/50">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg font-bold text-accent font-mono"
                  >
                    {Math.max(4, Math.round(detectionProgress / 8))}
                  </motion.p>
                  <p className="text-[11px] text-text-muted">Subscriptions</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-bg-elevated/50">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg font-bold text-accent-bright font-mono"
                  >
                    ${Math.round(80 + detectionProgress * 1.5)}
                  </motion.p>
                  <p className="text-[11px] text-text-muted">Monthly</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-bg-elevated/50">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg font-bold text-alert font-mono"
                  >
                    ${Math.round(detectionProgress * 2.5)}
                  </motion.p>
                  <p className="text-[11px] text-text-muted">Potential savings</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          This may take a few moments. We're scanning for subscription receipts and payment confirmations.
        </p>
      </motion.div>
    </div>
  );
}
