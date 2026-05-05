import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import {
  Bell, Mail, FileText, DollarSign, Moon, Shield, User,
  ChevronRight, LogOut
} from 'lucide-react';

export function SettingsPage() {
  const {
    user,
    logout,
    currency, setCurrency,
    notifications, setNotifications,
    emailAlerts, setEmailAlerts,
    weeklyReports, setWeeklyReports,
  } = useStore();

  const currencies = [
    { value: '$', label: 'USD ($)' },
    { value: '€', label: 'EUR (€)' },
    { value: '£', label: 'GBP (£)' },
    { value: '¥', label: 'JPY (¥)' },
    { value: '₹', label: 'INR (₹)' },
    { value: 'A$', label: 'AUD (A$)' },
    { value: 'C$', label: 'CAD (C$)' },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const toggleRow = (
    icon: React.ReactNode,
    title: string,
    description: string,
    enabled: boolean,
    onToggle: () => void
  ) => (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{title}</p>
          <p className="text-xs text-text-muted">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          enabled ? 'bg-accent' : 'bg-bg-elevated border border-border'
        }`}
        aria-label={`Toggle ${title}`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <User className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Profile</h3>
              <p className="text-sm text-text-muted">Manage your account settings</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-accent">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">{user?.name || 'User'}</p>
              <p className="text-xs text-text-muted truncate">{user?.email || ''}</p>
              <p className="text-xs text-text-muted mt-0.5">
                Member since {user?.joinedAt ? formatDate(user.joinedAt) : 'Recently'}
              </p>
            </div>
            <Button variant="danger" size="sm" leftIcon={<LogOut className="w-3.5 h-3.5" />} onClick={logout}>
              Sign out
            </Button>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Currency</h3>
              <p className="text-sm text-text-muted">Select your preferred currency</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currencies.map((c) => (
              <button
                key={c.value}
                onClick={() => setCurrency(c.value)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currency === c.value
                    ? 'bg-accent/10 text-accent border border-accent/30'
                    : 'bg-bg-elevated text-text-secondary border border-border hover:border-border-light hover:text-text-primary'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Notifications</h3>
              <p className="text-sm text-text-muted">Control how you receive updates</p>
            </div>
          </div>
          {toggleRow(
            <Bell className="w-4 h-4 text-text-secondary" />,
            'Push Notifications',
            'Get notified about upcoming bills',
            notifications,
            () => setNotifications(!notifications)
          )}
          {toggleRow(
            <Mail className="w-4 h-4 text-text-secondary" />,
            'Email Alerts',
            'Receive alerts via email',
            emailAlerts,
            () => setEmailAlerts(!emailAlerts)
          )}
          {toggleRow(
            <FileText className="w-4 h-4 text-text-secondary" />,
            'Weekly Reports',
            'Get a summary every week',
            weeklyReports,
            () => setWeeklyReports(!weeklyReports)
          )}
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Privacy & Security</h3>
              <p className="text-sm text-text-muted">Manage your data and security</p>
            </div>
          </div>
          <div className="space-y-1">
            {[
              { icon: <Shield className="w-4 h-4" />, label: 'Two-Factor Authentication', desc: 'Add an extra layer of security' },
              { icon: <Moon className="w-4 h-4" />, label: 'Dark Mode', desc: 'Always use dark theme' },
              { icon: <FileText className="w-4 h-4" />, label: 'Export Data', desc: 'Download your subscription data' },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center justify-between py-3 px-2 rounded-lg hover:bg-bg-elevated transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-text-secondary">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.label}</p>
                    <p className="text-xs text-text-muted">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      <div className="flex items-center justify-between pt-4">
        <p className="text-xs text-text-muted">Sublytics v1.0.0</p>
        <Button variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger/10" onClick={logout}>
          Delete Account
        </Button>
      </div>
    </div>
  );
}
