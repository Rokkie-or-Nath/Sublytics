export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface Subscription {
  id: string;
  name: string;
  category: string;
  cost: number;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  status: SubscriptionStatus;
  logo?: string;
  color: string;
  description?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Activity {
  id: string;
  type: 'added' | 'updated' | 'paused' | 'cancelled' | 'alert' | 'saved';
  description: string;
  date: string;
  amount?: number;
  subscriptionName?: string;
}

export interface SpendingData {
  month: string;
  amount: number;
  projected: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface Insight {
  id: string;
  type: 'saving' | 'alert' | 'trend' | 'tip';
  title: string;
  description: string;
  amount?: number;
  actionable: boolean;
}

export type Page = 'dashboard' | 'subscriptions' | 'analytics' | 'settings';

export interface User {
  email: string;
  name: string;
  avatar?: string;
  joinedAt: string;
}
