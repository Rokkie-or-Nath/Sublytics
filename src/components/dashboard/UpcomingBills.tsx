import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { formatCurrency, getDaysUntil, formatDate } from '../../utils/formatters';
import { SubscriptionLogo } from '../shared/SubscriptionLogo';

export function UpcomingBills() {
  const { subscriptions, currency } = useStore();

  const upcoming = subscriptions
    .filter((s) => s.status === 'active')
    .map((s) => ({ ...s, daysUntil: getDaysUntil(s.nextBillingDate) }))
    .filter((s) => s.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-accent" />
          <h3 className="text-base font-semibold text-text-primary">Upcoming Bills</h3>
        </div>
        <div className="space-y-3">
          {upcoming.map((sub, index) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated/50 border border-border/50"
            >
              <SubscriptionLogo
                name={sub.name}
                logoUrl={sub.logo}
                color={sub.color}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{sub.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-text-muted" />
                  <span className="text-xs text-text-muted">{formatDate(sub.nextBillingDate)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-semibold text-text-primary">{formatCurrency(sub.cost, currency)}</p>
                <p className={`text-xs ${sub.daysUntil <= 3 ? 'text-alert font-medium' : 'text-text-muted'}`}>
                  {sub.daysUntil === 0 ? 'Today' : sub.daysUntil === 1 ? 'Tomorrow' : `In ${sub.daysUntil} days`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
