import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import { Plus, Pause, XCircle, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { formatRelativeDate } from '../../utils/formatters';

const typeConfig = {
  added: { icon: Plus, color: 'text-accent', bg: 'bg-accent/10' },
  updated: { icon: RefreshCw, color: 'text-info', bg: 'bg-info/10' },
  paused: { icon: Pause, color: 'text-alert', bg: 'bg-alert/10' },
  cancelled: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10' },
  alert: { icon: AlertTriangle, color: 'text-alert', bg: 'bg-alert/10' },
  saved: { icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10' },
};

export function RecentActivity() {
  const { activities, currency } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <Card>
        <h3 className="text-base font-semibold text-text-primary mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activities.slice(0, 6).map((activity, index) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.08 }}
                className="flex items-center gap-3 py-2"
              >
                <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{activity.description}</p>
                  <p className="text-xs text-text-muted">{formatRelativeDate(activity.date)}</p>
                </div>
                {activity.amount && (
                  <span className="text-sm font-mono text-text-secondary">
                    {currency}{activity.amount.toFixed(2)}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
