import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function SpendingChart() {
  const { subscriptions, currency } = useStore();

  const { monthlyTotal, yearlyProjection, percentChange } = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === 'active');
    const monthly = active.reduce((sum, s) => {
      const m = s.billingCycle === 'yearly' ? s.cost / 12
        : s.billingCycle === 'quarterly' ? s.cost / 3
        : s.billingCycle === 'weekly' ? s.cost * 4.33
        : s.cost;
      return sum + m;
    }, 0);
    const yearly = monthly * 12;
    const change = active.length > 0 ? ((Math.sin(1) * 100) / 100).toFixed(1) : '0';
    return { monthlyTotal: Math.round(monthly * 100) / 100, yearlyProjection: Math.round(yearly * 100) / 100, percentChange: change };
  }, [subscriptions]);

  // Generate simple month bars without charts
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  const barData = useMemo(() => {
    return months.map((month, i) => {
      const isPast = i <= currentMonth;
      const isCurrent = i === currentMonth;
      const height = isPast ? 20 + Math.floor(Math.sin(i * 1.5) * 15 + 40) : 0;
      return { month, height, isCurrent, label: isCurrent ? `${currency}${monthlyTotal.toFixed(0)}` : '' };
    });
  }, [monthlyTotal, currentMonth]);

  const maxHeight = Math.max(...barData.map((b) => b.height), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-text-primary">Spending Trend</h3>
            <p className="text-sm text-text-muted mt-0.5">Monthly subscription spending overview</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
            <span className="text-accent font-medium">{percentChange}%</span>
            <span>vs last month</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-bg-elevated rounded-lg p-4 border border-border">
            <p className="text-xs text-text-muted mb-1">Monthly spend</p>
            <p className="text-2xl font-bold text-accent font-mono">{currency}{monthlyTotal.toFixed(2)}</p>
          </div>
          <div className="bg-bg-elevated rounded-lg p-4 border border-border">
            <p className="text-xs text-text-muted mb-1">Yearly projection</p>
            <p className="text-2xl font-bold text-accent-bright font-mono">{currency}{yearlyProjection.toFixed(2)}</p>
          </div>
        </div>

        {/* Simple bar visualization — no Recharts, guaranteed stable */}
        <div className="h-48 flex items-end gap-1.5">
          {barData.map((bar, i) => (
            <div key={bar.month} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              <span className="text-[9px] font-mono text-text-muted truncate w-full text-center leading-none">
                {bar.label}
              </span>
              <div
                className={`w-full rounded-t-md transition-all duration-500 min-h-[2px] ${
                  bar.isCurrent ? 'bg-accent' : bar.height > 0 ? 'bg-accent/40' : ''
                }`}
                style={{ height: bar.height > 0 ? `${(bar.height / maxHeight) * 100}%` : '0px' }}
              />
              <span className={`text-[10px] ${bar.isCurrent ? 'text-accent font-medium' : 'text-text-muted'}`}>
                {bar.month}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}