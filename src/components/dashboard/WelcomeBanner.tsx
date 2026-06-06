import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { getMonthlyCost, formatCurrency } from '../../utils/formatters';

export function WelcomeBanner() {
  const { subscriptions, currency, setCurrentPage, user, budget } = useStore();
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const monthlyTotal = activeSubs.reduce((sum, s) => sum + getMonthlyCost(s.cost, s.billingCycle), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-bg-surface via-bg-elevated to-bg-surface border border-border p-6 lg:p-8"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-bright/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent-bright" />
            <span className="text-xs font-medium text-accent-bright uppercase tracking-wider">Overview</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
            {greeting}, {user?.name?.trim() ? user.name.split(' ')[0] : 'there'}
          </h1>
          <p className="text-sm text-text-secondary mt-1 max-w-lg">
            You have <span className="text-accent font-semibold">{activeSubs.length} active subscriptions</span> costing{' '}
            <span className="text-accent font-semibold font-mono">{formatCurrency(monthlyTotal, currency)}</span> per month.
            {monthlyTotal > 200 && (
              <span className="text-alert"> Consider reviewing unused subscriptions.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-text-muted">This month</p>
            <p className="text-2xl font-bold text-accent font-mono animate-counter-glow">
              {formatCurrency(monthlyTotal, currency)}
            </p>
          </div>
          <button
            onClick={() => setCurrentPage('subscriptions')}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl text-sm font-medium transition-colors border border-accent/20"
          >
            Review
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mt-6">
        <div className="flex items-center justify-between text-xs text-text-muted mb-2">
          <span>Budget usage</span>
          <span>{Math.min(Math.round((monthlyTotal / budget) * 100), 100)}% of {formatCurrency(budget, currency)} budget</span>
        </div>
        <div className="h-2 bg-bg-deep rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((monthlyTotal / budget) * 100, 100)}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            className={`h-full rounded-full ${monthlyTotal > budget * 0.83 ? 'bg-alert' : monthlyTotal > budget * 0.67 ? 'bg-amber' : 'bg-accent'}`}
          />
        </div>
      </div>
    </motion.div>
  );
}
