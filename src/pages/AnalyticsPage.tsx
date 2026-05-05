import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { getMonthlyCost, formatCurrency, getYearlyCost } from '../utils/formatters';

export function AnalyticsPage() {
  const { subscriptions, currency } = useStore();
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  const monthlyTotal = activeSubs.reduce((sum, s) => sum + getMonthlyCost(s.cost, s.billingCycle), 0);
  const yearlyTotal = activeSubs.reduce((sum, s) => sum + getYearlyCost(s.cost, s.billingCycle), 0);

  // Monthly comparison data
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, i) => ({
      month,
      current: Math.round((monthlyTotal + (Math.sin(i * 2) * 20)) * 100) / 100,
      previous: Math.round((monthlyTotal * 0.9 + (Math.cos(i * 1.5) * 15)) * 100) / 100,
    }));
  }, [monthlyTotal]);

  // Category radar data
  const radarData = useMemo(() => {
    const cats = ['Streaming', 'Productivity', 'Fitness', 'Music', 'Cloud', 'Gaming', 'News'];
    return cats.map((cat) => {
      const catSubs = activeSubs.filter((s) => s.category.toLowerCase() === cat.toLowerCase());
      const value = catSubs.reduce((sum, s) => sum + getMonthlyCost(s.cost, s.billingCycle), 0);
      return { category: cat, value: Math.round(value * 100) / 100 };
    });
  }, [activeSubs]);

  // Top subscriptions
  const topSubscriptions = useMemo(() => {
    return [...activeSubs]
      .sort((a, b) => getMonthlyCost(b.cost, b.billingCycle) - getMonthlyCost(a.cost, a.billingCycle))
      .slice(0, 8)
      .map((s) => ({
        name: s.name,
        monthly: Math.round(getMonthlyCost(s.cost, s.billingCycle) * 100) / 100,
        yearly: Math.round(getYearlyCost(s.cost, s.billingCycle) * 100) / 100,
        color: s.color,
      }));
  }, [activeSubs]);

  // Growth trend
  const growthData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: `M${i + 1}`,
      subscriptions: Math.min(activeSubs.length, Math.floor(activeSubs.length * (0.5 + (i / 24)))),
      spending: Math.round((monthlyTotal * (0.7 + (i / 40))) * 100) / 100,
    }));
  }, [activeSubs.length, monthlyTotal]);

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Annual Cost', value: formatCurrency(yearlyTotal, currency), change: '+8%', icon: DollarSign, color: 'text-accent' },
          { label: 'Monthly Average', value: formatCurrency(monthlyTotal, currency), change: '+12%', icon: Calendar, color: 'text-accent-bright' },
          { label: 'Active Subs', value: activeSubs.length.toString(), change: '+2', icon: TrendingUp, color: 'text-info' },
          { label: 'Cost Per Sub', value: formatCurrency(monthlyTotal / (activeSubs.length || 1), currency), change: '-3%', icon: TrendingDown, color: 'text-purple' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-text-primary font-mono">{stat.value}</p>
                </div>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h3 className="text-base font-semibold text-text-primary mb-1">Monthly Comparison</h3>
            <p className="text-sm text-text-muted mb-4">Current vs previous year spending</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252A33" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7B8F', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7B8F', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#111318', border: '#252A33', borderRadius: 8 }}
                    labelStyle={{ color: '#F5F7FA' }}
                  />
                  <Bar dataKey="previous" fill="#2E3440" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="current" fill="#0FA573" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <h3 className="text-base font-semibold text-text-primary mb-1">Category Radar</h3>
            <p className="text-sm text-text-muted mb-4">Spending distribution across categories</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#252A33" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#B8C5D6', fontSize: 11 }} />
                  <PolarRadiusAxis tick={{ fill: '#6B7B8F', fontSize: 10 }} />
                  <Radar dataKey="value" stroke="#0FA573" fill="#0FA573" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <h3 className="text-base font-semibold text-text-primary mb-1">Growth Trend</h3>
            <p className="text-sm text-text-muted mb-4">Subscriptions and spending over time</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0FA573" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0FA573" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252A33" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7B8F', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7B8F', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#111318', border: '#252A33', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="spending" stroke="#0FA573" fill="url(#colorSpending)" strokeWidth={2} />
                  <Line type="monotone" dataKey="subscriptions" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <h3 className="text-base font-semibold text-text-primary mb-1">Top Subscriptions</h3>
            <p className="text-sm text-text-muted mb-4">Highest monthly costs</p>
            <div className="space-y-3">
              {topSubscriptions.map((sub, index) => (
                <motion.div
                  key={sub.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="flex items-center gap-3"
                >
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
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: sub.color,
                          width: `${(sub.monthly / topSubscriptions[0].monthly) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-text-primary">{currency}{sub.monthly.toFixed(2)}</p>
                    <p className="text-xs text-text-muted">/mo</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
