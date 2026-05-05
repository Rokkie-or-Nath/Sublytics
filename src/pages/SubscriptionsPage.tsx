import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { SubscriptionCard } from '../components/subscriptions/SubscriptionCard';
import { AddSubscriptionModal } from '../components/subscriptions/AddSubscriptionModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/Input';

export function SubscriptionsPage() {
  const { subscriptions, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, setIsAddModalOpen } = useStore();

  const categories = useMemo(() => {
    const cats = new Set(subscriptions.map((s) => s.category));
    return Array.from(cats);
  }, [subscriptions]);

  const filtered = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || sub.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [subscriptions, searchQuery, selectedCategory]);

  const activeCount = filtered.filter((s) => s.status === 'active').length;
  const pausedCount = filtered.filter((s) => s.status === 'paused').length;
  const cancelledCount = filtered.filter((s) => s.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      <AddSubscriptionModal />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">All Subscriptions</h2>
          <p className="text-sm text-text-muted mt-0.5">
            {filtered.length} subscription{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
          Add Subscription
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-text-muted" />
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !selectedCategory ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                selectedCategory === cat ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Status summary */}
      <div className="flex items-center gap-3">
        <Badge variant="success">{activeCount} Active</Badge>
        <Badge variant="warning">{pausedCount} Paused</Badge>
        <Badge variant="neutral">{cancelledCount} Cancelled</Badge>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((sub, index) => (
            <SubscriptionCard key={sub.id} subscription={sub} index={index} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">No subscriptions found</h3>
          <p className="text-sm text-text-muted mt-1">Try adjusting your search or filters</p>
        </motion.div>
      )}
    </div>
  );
}
