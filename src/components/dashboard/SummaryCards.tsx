import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown, Wallet, Calendar, AlertTriangle } from 'lucide-react';
import { getMonthlyCost, getYearlyCost, formatCurrency } from '../../utils/formatters';
import { motion } from 'framer-motion';

export function SummaryCards() {
  const { subscriptions, currency } = useStore();
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  const monthlyTotal = activeSubs.reduce((sum, s) => sum + getMonthlyCost(s.cost, s.billingCycle), 0);
  const yearlyTotal = activeSubs.reduce((sum, s) => sum + getYearlyCost(s.cost, s.billingCycle), 0);
  const avgPerSub = activeSubs.length > 0 ? monthlyTotal / activeSubs.length : 0;

  const upcomingBills = activeSubs
    .filter((s) => {
      const days = Math.ceil((new Date(s.nextBillingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 7;
    })
    .reduce((sum, s) => sum + s.cost, 0);

  const cards = [
    {
      title: 'Monthly Spend',
      value: formatCurrency(monthlyTotal, currency),
      change: '+12%',
      trend: 'up' as const,
      icon: Wallet,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Yearly Projection',
      value: formatCurrency(yearlyTotal, currency),
      change: '+8%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-accent-bright',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Avg. Per Sub',
      value: formatCurrency(avgPerSub, currency),
      change: '-3%',
      trend: 'down' as const,
      icon: TrendingDown,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Due This Week',
      value: formatCurrency(upcomingBills, currency),
      change: `${activeSubs.filter((s) => {
        const days = Math.ceil((new Date(s.nextBillingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days >= 0 && days <= 7;
      }).length} bills`,
      trend: 'neutral' as const,
      icon: Calendar,
      color: 'text-alert',
      bgColor: 'bg-alert/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Card hover padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-text-primary font-mono">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {card.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-accent" />}
                    {card.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-accent" />}
                    {card.trend === 'neutral' && <AlertTriangle className="w-3.5 h-3.5 text-alert" />}
                    <span className={`text-xs font-medium ${card.trend === 'neutral' ? 'text-alert' : 'text-accent'}`}>
                      {card.change}
                    </span>
                    <span className="text-xs text-text-muted">vs last month</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
