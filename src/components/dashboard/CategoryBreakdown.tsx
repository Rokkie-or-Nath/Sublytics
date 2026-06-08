import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import { getMonthlyCost } from '../../utils/formatters';

export function CategoryBreakdown() {
  const { subscriptions, currency } = useStore();

  const data = useMemo(() => {
    const categoryMap = new Map<string, { value: number; color: string }>();
    subscriptions
      .filter((s) => s.status === 'active')
      .forEach((sub) => {
        const monthly = getMonthlyCost(sub.cost, sub.billingCycle);
        const existing = categoryMap.get(sub.category);
        if (existing) existing.value += monthly;
        else categoryMap.set(sub.category, { value: monthly, color: sub.color });
      });
    return Array.from(categoryMap.entries())
      .map(([name, { value, color }]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: Math.round(value * 100) / 100, color }))
      .sort((a, b) => b.value - a.value);
  }, [subscriptions]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <Card>
        <h3 className="text-base font-semibold text-text-primary mb-1">Category Breakdown</h3>
        <p className="text-sm text-text-muted mb-4">Spending distribution by category</p>

        <div className="space-y-3">
          {data.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">No active subscriptions yet</p>
          )}
          {data.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-primary truncate">{item.name}</span>
                    <span className="text-sm font-mono text-text-secondary">{currency}{item.value.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
                <span className="text-xs text-text-muted w-10 text-right">{percentage}%</span>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}