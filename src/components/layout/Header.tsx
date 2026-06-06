import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Search, Bell, Plus, Menu, Diamond, LogOut, User, X, BellOff } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { PAGE_TITLES } from '../../constants/defaults';

export function Header() {
  const { searchQuery, setSearchQuery, setIsAddModalOpen, currentPage, setCurrentPage, user, logout, notifications, setNotifications } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);


  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile menu button */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Diamond className="w-5 h-5 text-accent" />
            <span className="font-bold text-text-primary">Sublytics</span>
          </div>
        </div>

        {/* Page title - desktop */}
        <div className="hidden lg:block">
          <h2 className="text-xl font-semibold text-text-primary">{PAGE_TITLES[currentPage] || 'Dashboard'}</h2>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <Input
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="bg-bg-deep border-border"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              aria-label="Toggle notifications"
            >
              {notifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              {notifications && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-alert rounded-full" />
              )}
            </button>
            <AnimatePresence>
              {showNotifPanel && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifPanel(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-bg-surface border border-border rounded-xl shadow-2xl shadow-black/30 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setNotifications(!notifications); }}
                          className={`text-xs px-2 py-1 rounded-lg transition-colors ${notifications ? 'bg-accent/10 text-accent' : 'bg-bg-elevated text-text-muted'}`}
                        >
                          {notifications ? 'On' : 'Off'}
                        </button>
                        <button onClick={() => setShowNotifPanel(false)} className="text-text-muted hover:text-text-primary">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 text-center text-sm text-text-muted">
                      {notifications
                        ? 'No new notifications. You\'re all caught up!'
                        : 'Notifications are disabled. Enable them in Settings.'
                      }
                    </div>
                    <div className="p-3 border-t border-border">
                      <button
                        onClick={() => { setShowNotifPanel(false); setCurrentPage('settings'); }}
                        className="w-full text-center text-xs text-accent hover:text-accent-bright transition-colors"
                      >
                        Manage notification settings
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
            className="hidden sm:inline-flex"
          >
            Add
          </Button>

          {/* User menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-bg-elevated transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <span className="text-sm font-bold text-accent">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-text-primary">
                {user?.name}
              </span>
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-bg-surface border border-border rounded-xl shadow-2xl shadow-black/30 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-border">
                      <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                      <p className="text-xs text-text-muted truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setCurrentPage('settings');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-left"
                      >
                        <User className="w-4 h-4" />
                        Profile & Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-danger/70 hover:text-danger hover:bg-danger/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-bg-surface">
          <nav className="p-2 space-y-1">
            {(['dashboard', 'subscriptions', 'analytics', 'settings'] as const).map((page) => (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  currentPage === page ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                }`}
              >
                {page}
              </button>
            ))}
            <div className="border-t border-border mt-2 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-danger/70 hover:text-danger hover:bg-danger/10 transition-colors"
              >
                Sign out
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
