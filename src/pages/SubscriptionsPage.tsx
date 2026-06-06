import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { SubscriptionCard } from '../components/subscriptions/SubscriptionCard';
import { AddSubscriptionModal } from '../components/subscriptions/AddSubscriptionModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus, Filter, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/Input';

type SortField = 'name' | 'cost' | 'nextBilling' | 'status';

export function SubscriptionsPage() {
  const {
    subscriptions, searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory, setIsAddModalOpen,
    sortBy, setSortBy, sortOrder, setSortOrder,
  } = useStore();

  const [showSortMenu, setShowSortMenu] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(subscriptions.map((s) => s.category));
    return Array.from(cats);
  }, [subscriptions]);

  const filtered = useMemo(() => {
    let result = subscriptions.filter((sub) => {
      const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || sub.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'cost':
          cmp = a.cost - b.cost;
          break;
        case 'nextBilling':
          cmp = new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
          break;
        case 'status': {
          const order = { active: 0, paused: 1, cancelled: 2 };
          cmp = (order[a.status] ?? 0) - (order[b.status] ?? 0);
          break;
        }
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [subscriptions, searchQuery, selectedCategory, sortBy, sortOrder]);

  const activeCount = filtered.filter((s) => s.status === 'active').length;
  const pausedCount = filtered.filter((s) => s.status === 'paused').length;
  const cancelledCount = filtered.filter((s) => s.status === 'cancelled').length;

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setShowSortMenu(false);
  };

  const sortOptions: { field: SortField; label: string }[] = [
    { field: 'name', label: 'Name' },
    { field: 'cost', label: 'Cost' },
    { field: 'nextBilling', label: 'Next billing' },
    { field: 'status', label: 'Status' },
  ];

  const SortIcon = sortOrder === 'asc' ? ArrowUp : ArrowDown;

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

          {/* Sort button */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors border border-border"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort
              <SortIcon className="w-3 h-3" />
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-40 bg-bg-surface border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.field}
                      onClick={() => handleSort(opt.field)}
                      className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                        sortBy === opt.field
                          ? 'bg-accent/10 text-accent'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                      }`}
                    >
                      {opt.label}
                      {sortBy === opt.field && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
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