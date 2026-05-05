import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export function SpendingChart() {
  const { subscriptions, currency } = useStore();

  const data = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    return months.map((month, index) => {
      const isFuture = index > currentMonth;
      const baseAmount = subscriptions
        .filter((s) => s.status === 'active')
        .reduce((sum, s) => {
          const monthly = s.billingCycle === 'yearly' ? s.cost / 12 : s.billingCycle === 'quarterly' ? s.cost / 3 : s.billingCycle === 'weekly' ? s.cost * 4.33 : s.cost;
          return sum + monthly;
        }, 0);

      // Add some variation for past months
      const variation = isFuture ? 0 : (Math.sin(index * 1.5) * 15) + (index === currentMonth ? 12 : 0);
      const projectedVariation = Math.sin(index * 1.2) * 10;

      return {
        month,
        amount: isFuture ? 0 : Math.round((baseAmount + variation) * 100) / 100,
        projected: Math.round((baseAmount + projectedVariation) * 100) / 100,
      };
    });
  }, [subscriptions]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-surface border border-border rounded-lg px-3 py-2 shadow-xl">
          <p className="text-sm font-medium text-text-primary mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs text-text-secondary">
              {entry.dataKey === 'amount' ? 'Actual: ' : 'Projected: '}
              <span className="font-mono font-medium text-text-primary">{currency}{entry.value.toFixed(2)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
            <p className="text-sm text-text-muted mt-0.5">Monthly subscription spending over time</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-accent/60" />
              <span className="text-text-secondary">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-accent/20 border border-accent/40" />
              <span className="text-text-secondary">Projected</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0FA573" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0FA573" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1FD9A8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1FD9A8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#252A33" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7B8F', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7B8F', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="projected" stroke="#1FD9A8" strokeWidth={1} strokeDasharray="4 4" fill="url(#colorProjected)" />
              <Area type="monotone" dataKey="amount" stroke="#0FA573" strokeWidth={2} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
