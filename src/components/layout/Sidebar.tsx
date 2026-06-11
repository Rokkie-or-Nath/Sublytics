import { cn } from '../../utils/cn';
import { useStore } from '../../store/useStore';
import { LayoutDashboard, CreditCard, BarChart3, Settings, Diamond, LogOut } from 'lucide-react';
import type { Page } from '../../types';
import { getMonthlyCost, formatCurrency } from '../../utils/formatters';

const navItems: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { page: 'analytics', label: 'Analytics', icon: BarChart3 },
  { page: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { currentPage, setCurrentPage, subscriptions, currency, user, logout } = useStore();
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const monthlyTotal = activeSubs.reduce((sum, s) => sum + getMonthlyCost(s.cost, s.billingCycle), 0);

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-bg-deep/95 backdrop-blur-xl z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
          <Diamond className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Sublytics</h1>
          <p className="text-[11px] text-text-muted tracking-wide uppercase">Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          const Icon = item.icon;
          return (
            <button
              key={item.page}
              onClick={() => setCurrentPage(item.page)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-accent')} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User & Stats */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Spending summary */}
        <div className="bg-bg-elevated rounded-lg p-4 border border-border">
          <p className="text-xs text-text-muted mb-1">Monthly spending</p>
          <p className="text-lg font-bold text-accent animate-counter-glow">{formatCurrency(monthlyTotal, currency)}</p>
          <p className="text-xs text-text-muted mt-1">{activeSubs.length} active subscription{activeSubs.length !== 1 ? 's' : ''}</p>
        </div>

        {/* User mini profile — purely visual, no interactions */}
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-accent">{user.name.charAt(0)}</span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-accent border-2 border-bg-deep rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{user.name}</p>
              <p className="text-[11px] text-text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
