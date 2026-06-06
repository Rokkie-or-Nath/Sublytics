// Centralized default values for the application

export const DEFAULTS = {
  budget: 300,
  currency: '$',
  weeklyReports: false,
  notifications: true,
  emailAlerts: true,
};

export const CURRENCIES = [
  { value: '$', label: 'USD ($)' },
  { value: '€', label: 'EUR (€)' },
  { value: '£', label: 'GBP (£)' },
  { value: '¥', label: 'JPY (¥)' },
  { value: '₹', label: 'INR (₹)' },
  { value: 'A$', label: 'AUD (A$)' },
  { value: 'C$', label: 'CAD (C$)' },
] as const;

export const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  subscriptions: 'Subscriptions',
  analytics: 'Analytics',
  settings: 'Settings',
};
