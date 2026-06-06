import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { motion } from 'framer-motion';
import {
  Bell, Mail, FileText, DollarSign, Shield, User,
  ChevronRight, LogOut, Download, PiggyBank
} from 'lucide-react';
import { CURRENCIES } from '../constants/defaults';

export function SettingsPage() {
  const {
    user,
    logout,
    currency, setCurrency,
    notifications, setNotifications,
    emailAlerts, setEmailAlerts,
    weeklyReports, setWeeklyReports,
    budget, setBudget,
    subscriptions, activities, insights,
  } = useStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(budget));

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

  const handleExport = () => {
    const data = JSON.stringify({ subscriptions, activities, insights, user, currency, budget }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sublytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateBudget = () => {
    const val = parseInt(budgetInput, 10);
    if (val > 0) {
      setBudget(val);
    }
  };

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
                {user?.name?.trim() ? user.name.charAt(0).toUpperCase() : 'U'}
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

      {/* Currency */}
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
            {CURRENCIES.map((c) => (
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

      {/* Budget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">Budget</h3>
              <p className="text-sm text-text-muted">Set your monthly spending limit</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono">{currency}</span>
              <input
                type="number"
                min="1"
                step="10"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateBudget()}
                className="w-full bg-bg-elevated border border-border rounded-lg pl-8 pr-3 py-2.5 text-text-primary font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
            </div>
            <Button size="sm" onClick={handleUpdateBudget}>
              Update
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Notifications */}
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

      {/* Privacy & Security */}
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
              <h3 className="text-base font-semibold text-text-primary">Data</h3>
              <p className="text-sm text-text-muted">Export or manage your data</p>
            </div>
          </div>
          <div className="space-y-1">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between py-3 px-2 rounded-lg hover:bg-bg-elevated transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-text-secondary">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Export Data</p>
                  <p className="text-xs text-text-muted">Download your subscription data as JSON</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-xs text-text-muted">Sublytics v1.0.0</p>
        <Button
          variant="ghost"
          size="sm"
          className="text-danger hover:text-danger hover:bg-danger/10"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete Account
        </Button>
      </div>

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Account?"
        message="This will permanently delete all your subscription data, activity history, and settings. This action cannot be undone."
        confirmLabel="Delete my account"
        cancelLabel="Keep my account"
        variant="danger"
        onConfirm={() => {
          setDeleteDialogOpen(false);
          logout();
        }}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}