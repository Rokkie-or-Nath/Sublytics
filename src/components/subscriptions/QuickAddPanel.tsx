import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { PRESET_SUBSCRIPTIONS, type PresetSubscription } from '../../constants/presets';
import { Search, Check, X, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';

const CATEGORIES = [
  { id: 'all', label: 'All', color: '#8B5CF6' },
  { id: 'streaming', label: 'Streaming', color: '#E74C3C' },
  { id: 'music', label: 'Music', color: '#8B5CF6' },
  { id: 'cloud', label: 'Cloud', color: '#06B6D4' },
  { id: 'productivity', label: 'Productivity', color: '#3B82F6' },
  { id: 'gaming', label: 'Gaming', color: '#EC4899' },
  { id: 'fitness', label: 'Fitness', color: '#0FA573' },
  { id: 'shopping', label: 'Shopping', color: '#F59E0B' },
  { id: 'news', label: 'News', color: '#6366F1' },
];

interface QuickAddPanelProps {
  onClose: () => void;
}

export function QuickAddPanel({ onClose }: QuickAddPanelProps) {
  const { addSubscription, subscriptions } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Track existing sub names so we can mark duplicates
  const existingNames = useMemo(() => new Set(subscriptions.map((s) => s.name.toLowerCase())), [subscriptions]);

  const filtered = useMemo(() => {
    let result = PRESET_SUBSCRIPTIONS;
    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    return result;
  }, [search, selectedCategory]);

  const handleAdd = async (preset: PresetSubscription) => {
    if (adding) return; // prevent double-tap

    // Optimistic — show "Added!" immediately
    setRecentlyAdded((prev) => new Set(prev).add(preset.name));
    setTimeout(() => {
      setRecentlyAdded((prev) => {
        const next = new Set(prev);
        next.delete(preset.name);
        return next;
      });
    }, 1500);

    const today = new Date();
    const nextBilling = new Date(today);
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    setAdding(preset.name);

    try {
      setError('');
      await addSubscription({
        name: preset.name,
        category: preset.category,
        cost: preset.cost,
        billingCycle: preset.billingCycle,
        nextBillingDate: nextBilling.toISOString().split('T')[0],
        status: 'active',
        color: preset.color,
        description: preset.description,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add subscription';
      setError(msg);
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-bg-surface border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/30 w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">Quick Add</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-deep border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Category chips — wrap to fit, no scroll */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-accent/10 text-accent border border-accent/30'
                    : 'bg-bg-elevated text-text-secondary border border-border hover:text-text-primary hover:border-border-light'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of subscriptions */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((preset) => {
              const isAdded = recentlyAdded.has(preset.name);
              const exists = existingNames.has(preset.name.toLowerCase());
              return (
                <motion.button
                  key={preset.name}
                  layout
                  onClick={() => !exists && !isAdded && handleAdd(preset)}
                  disabled={exists}
                  className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 text-left ${
                    exists
                      ? 'border-border bg-bg-elevated/50 opacity-50 cursor-not-allowed'
                      : isAdded
                      ? 'border-accent bg-accent/5'
                      : 'border-border bg-bg-surface hover:border-accent/30 hover:bg-bg-elevated hover:shadow-lg hover:shadow-black/10 cursor-pointer'
                  }`}
                >
                  {/* Avatar circle */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${preset.color}18` }}
                  >
                    <span className="text-sm font-bold" style={{ color: preset.color }}>
                      {preset.name.charAt(0)}
                    </span>
                  </div>

                  {/* Name + price */}
                  <div className="text-center min-w-0 w-full">
                    <p className="text-xs font-semibold text-text-primary truncate">{preset.name}</p>
                    <p className="text-[11px] font-mono text-accent font-medium mt-0.5">
                      {formatCurrency(preset.cost, '$')}/{preset.billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </p>
                  </div>

                  {/* Overlay for added state */}
                  {isAdded && (
                    <div className="absolute inset-0 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Check className="w-6 h-6 text-accent" />
                    </div>
                  )}

                  {/* "Added" badge */}
                  {exists && (
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-medium bg-bg-elevated text-text-muted rounded">
                      Added
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-bg-elevated flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-text-muted" />
              </div>
              <p className="text-sm font-medium text-text-primary">No services found</p>
              <p className="text-xs text-text-muted mt-1">Try a different search or category</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border text-center text-[11px] text-text-muted">
          {PRESET_SUBSCRIPTIONS.length} popular services available
        </div>
      </motion.div>
    </div>
  );
}