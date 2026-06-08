import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { getMonthlyCost, formatCurrency, getYearlyCost } from '../utils/formatters';

export function AnalyticsPage() {
  const { subscriptions, currency } = useStore();
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  const monthlyTotal = activeSubs.reduce((sum, s) => sum + getMonthlyCost(s.cost, s.billingCycle), 0);
  const yearlyTotal = activeSubs.reduce((sum, s) => sum + getYearlyCost(s.cost, s.billingCycle), 0);

  // Category data
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    activeSubs.forEach((s) => {
      const monthly = getMonthlyCost(s.cost, s.billingCycle);
      map.set(s.category, (map.get(s.category) || 0) + monthly);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [activeSubs]);

  // Top subscriptions
  const topSubscriptions = useMemo(() => {
    return [...activeSubs]
      .sort((a, b) => getMonthlyCost(b.cost, b.billingCycle) - getMonthlyCost(a.cost, a.billingCycle))
      .slice(0, 8)
      .map((s) => ({
        name: s.name,
        monthly: Math.round(getMonthlyCost(s.cost, s.billingCycle) * 100) / 100,
        color: s.color,
      }));
  }, [activeSubs]);

  const maxMonthly = topSubscriptions.length > 0 ? topSubscriptions[0].monthly : 1;

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Annual Cost', value: formatCurrency(yearlyTotal, currency), icon: DollarSign, color: 'text-accent' },
          { label: 'Monthly Average', value: formatCurrency(monthlyTotal, currency), icon: Calendar, color: 'text-accent-bright' },
          { label: 'Active Subs', value: String(activeSubs.length), icon: TrendingUp, color: 'text-info' },
          { label: 'Cost Per Sub', value: formatCurrency(monthlyTotal / (activeSubs.length || 1), currency), icon: TrendingDown, color: 'text-purple' },
        ].map((stat, i) => (
          <div key={stat.label}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-text-primary font-mono">{stat.value}</p>
                </div>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <Card>
        <h3 className="text-base font-semibold text-text-primary mb-1">Category Breakdown</h3>
        <p className="text-sm text-text-muted mb-4">Monthly spending by category</p>
        <div className="space-y-3">
          {categoryData.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">No active subscriptions yet</p>
          )}
          {categoryData.map((cat, index) => {
            const maxVal = categoryData.length > 0 ? categoryData[0].value : 1;
            const pct = (cat.value / maxVal) * 100;
            return (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-sm text-text-primary w-24 truncate flex-shrink-0">{cat.name}</span>
                <div className="flex-1 h-4 bg-bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent/60 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-text-secondary w-20 text-right flex-shrink-0">
                  {currency}{cat.value.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top Subscriptions */}
      <Card>
        <h3 className="text-base font-semibold text-text-primary mb-1">Top Subscriptions</h3>
        <p className="text-sm text-text-muted mb-4">Highest monthly costs</p>
        <div className="space-y-3">
          {topSubscriptions.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">No active subscriptions yet</p>
          )}
          {topSubscriptions.map((sub, index) => (
            <div key={sub.name} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${sub.color}18` }}
              >
                <span className="text-xs font-bold" style={{ color: sub.color }}>
                  {sub.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{sub.name}</p>
                <div className="h-1.5 bg-bg-elevated rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ backgroundColor: sub.color, width: `${(sub.monthly / maxMonthly) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-mono font-semibold text-text-primary">{currency}{sub.monthly.toFixed(2)}</p>
                <p className="text-xs text-text-muted">/mo</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}