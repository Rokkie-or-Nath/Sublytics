import { useStore } from '../../store/useStore';
import { Badge } from '../ui/Badge';
import { motion } from 'framer-motion';
import { Pause, Play, Trash2, Calendar } from 'lucide-react';
import { formatCurrency, getDaysUntil } from '../../utils/formatters';
import type { Subscription } from '../../types';

interface SubscriptionCardProps {
  subscription: Subscription;
  index: number;
}

export function SubscriptionCard({ subscription, index }: SubscriptionCardProps) {
  const { toggleSubscriptionStatus, deleteSubscription, currency } = useStore();
  const daysUntil = getDaysUntil(subscription.nextBillingDate);

  const statusVariant = subscription.status === 'active' ? 'success' : subscription.status === 'paused' ? 'warning' : 'neutral';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.34, 1.56, 0.64, 1] }}
      className="group bg-bg-surface border border-border rounded-xl p-4 hover:border-border-light hover:shadow-lg hover:shadow-black/10 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${subscription.color}18` }}
          >
            <span className="text-base font-bold" style={{ color: subscription.color }}>
              {subscription.name.charAt(0)}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">{subscription.name}</h4>
            <p className="text-xs text-text-muted capitalize">{subscription.category}</p>
          </div>
        </div>
        <Badge variant={statusVariant} size="sm">
          {subscription.status}
        </Badge>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Cost</span>
          <span className="text-sm font-mono font-semibold text-text-primary">
            {formatCurrency(subscription.cost, currency)}
            <span className="text-xs text-text-muted font-normal">/{subscription.billingCycle}</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">Next billing</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-text-muted" />
            <span className={`text-xs ${daysUntil <= 3 ? 'text-alert font-medium' : 'text-text-secondary'}`}>
              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
            </span>
          </div>
        </div>
        {subscription.description && (
          <p className="text-xs text-text-muted truncate">{subscription.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => toggleSubscriptionStatus(subscription.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          {subscription.status === 'active' ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Resume
            </>
          )}
        </button>
        <button
          onClick={() => deleteSubscription(subscription.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-danger/70 hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Remove
        </button>
      </div>
    </motion.div>
  );
}
