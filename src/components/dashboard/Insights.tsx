import { useStore } from '../../store/useStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const typeConfig = {
  saving: { icon: Lightbulb, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
  alert: { icon: AlertTriangle, color: 'text-alert', bg: 'bg-alert/10', border: 'border-alert/20' },
  trend: { icon: TrendingUp, color: 'text-info', bg: 'bg-info/10', border: 'border-info/20' },
  tip: { icon: Sparkles, color: 'text-purple', bg: 'bg-purple/10', border: 'border-purple/20' },
};

export function Insights() {
  const { insights, currency } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary">Smart Insights</h3>
            <p className="text-sm text-text-muted mt-0.5">AI-powered recommendations</p>
          </div>
        </div>
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const config = typeConfig[insight.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`p-4 rounded-xl border ${config.border} ${config.bg} bg-opacity-50`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-bg-surface/50 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-text-primary">{insight.title}</h4>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{insight.description}</p>
                    {insight.amount && (
                      <p className="text-sm font-mono font-semibold text-accent mt-2">
                        Potential savings: {formatCurrency(insight.amount, currency)}/year
                      </p>
                    )}
                  </div>
                  {insight.actionable && (
                    <Button size="sm" variant="secondary" className="flex-shrink-0">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
