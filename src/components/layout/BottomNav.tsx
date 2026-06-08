import { cn } from '../../utils/cn';
import { useStore } from '../../store/useStore';
import { LayoutDashboard, CreditCard, BarChart3, Settings, Diamond } from 'lucide-react';

const navItems: { page: 'dashboard' | 'subscriptions' | 'analytics' | 'settings'; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { page: 'subscriptions', label: 'Subs', icon: CreditCard },
  { page: 'analytics', label: 'Analytics', icon: BarChart3 },
  { page: 'settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const { currentPage, setCurrentPage } = useStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-bg-surface/90 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          const Icon = item.icon;
          return (
            <button
              key={item.page}
              onClick={() => setCurrentPage(item.page)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0"
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors duration-200',
                  isActive ? 'text-accent' : 'text-text-muted'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-200 truncate',
                  isActive ? 'text-accent' : 'text-text-muted'
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}