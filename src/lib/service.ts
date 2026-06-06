/**
 * Service layer — the single source of truth for data operations.
 * Currently uses localStorage + mock data. Swap implementations here
 * without touching any component.
 */
import { storage } from './storage';
import {
  generateEmailBasedSubscriptions,
  generateActivities,
  generateInsights,
  defaultSubscriptions,
  defaultActivities,
  defaultInsights,
} from './mock-data';
import { getAccount } from './accounts';
import type { Subscription, Activity, Insight, User } from '../types';
import { DEFAULTS } from '../constants/defaults';

// ─── Key constants ─────────────────────────────────────────────────────────

const KEYS = {
  user: 'user',
  subscriptions: 'subscriptions',
  activities: 'activities',
  insights: 'insights',
  currency: 'currency',
  notifications: 'notifications',
  emailAlerts: 'emailAlerts',
  weeklyReports: 'weeklyReports',
  budget: 'budget',
} as const;

// ─── Auth ───────────────────────────────────────────────────────────────────

export function login(email: string): { user: User; subscriptions: Subscription[]; activities: Activity[]; insights: Insight[] } {
  const account = getAccount(email);
  const user: User = {
    email,
    name: account?.name || email.split('@')[0],
    joinedAt: account?.joinedAt || new Date().toISOString(),
  };
  const subscriptions = generateEmailBasedSubscriptions(email);
  const activities = generateActivities(email, subscriptions);
  const insights = generateInsights(email, subscriptions);

  // Persist
  storage.set(KEYS.user, user);
  storage.set(KEYS.subscriptions, subscriptions);
  storage.set(KEYS.activities, activities);
  storage.set(KEYS.insights, insights);

  return { user, subscriptions, activities, insights };
}

export function logout(): void {
  storage.clear();
}

export function getUser(): User | null {
  return storage.get<User | null>(KEYS.user, null);
}

// ─── Subscriptions ──────────────────────────────────────────────────────────

export function getSubscriptions(): Subscription[] {
  return storage.get<Subscription[]>(KEYS.subscriptions, defaultSubscriptions);
}

export function addSubscription(sub: Omit<Subscription, 'id' | 'createdAt'>): Subscription {
  const newSub: Subscription = {
    ...sub,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString().split('T')[0],
  };
  const subs = [newSub, ...getSubscriptions()];
  storage.set(KEYS.subscriptions, subs);
  return newSub;
}

export function updateSubscription(id: string, updates: Partial<Subscription>): Subscription | null {
  const subs = getSubscriptions();
  const idx = subs.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  subs[idx] = { ...subs[idx], ...updates };
  storage.set(KEYS.subscriptions, subs);
  return subs[idx];
}

export function deleteSubscription(id: string): Subscription | null {
  const subs = getSubscriptions();
  const idx = subs.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const removed = subs[idx];
  storage.set(KEYS.subscriptions, subs.filter((s) => s.id !== id));
  return removed;
}

export function toggleSubscriptionStatus(id: string): Subscription | null {
  const sub = getSubscriptions().find((s) => s.id === id);
  if (!sub) return null;
  const newStatus = sub.status === 'active' ? 'paused' : 'active';
  return updateSubscription(id, { status: newStatus as Subscription['status'] });
}

// ─── Activities ─────────────────────────────────────────────────────────────

export function getActivities(): Activity[] {
  return storage.get<Activity[]>(KEYS.activities, defaultActivities);
}

export function addActivity(activity: Omit<Activity, 'id'>): Activity {
  const newAct: Activity = { ...activity, id: crypto.randomUUID() };
  const acts = [newAct, ...getActivities()];
  storage.set(KEYS.activities, acts);
  return newAct;
}

export function setActivities(acts: Activity[]): void {
  storage.set(KEYS.activities, acts);
}

// ─── Insights ───────────────────────────────────────────────────────────────

export function getInsights(): Insight[] {
  return storage.get<Insight[]>(KEYS.insights, defaultInsights);
}

export function setInsights(insights: Insight[]): void {
  storage.set(KEYS.insights, insights);
}

// ─── Settings ───────────────────────────────────────────────────────────────

export function getCurrency(): string {
  return storage.get<string>(KEYS.currency, DEFAULTS.currency);
}

export function setCurrency(currency: string): void {
  storage.set(KEYS.currency, currency);
}

export function getBudget(): number {
  return storage.get<number>(KEYS.budget, DEFAULTS.budget);
}

export function setBudget(budget: number): void {
  storage.set(KEYS.budget, budget);
}

export function getNotifications(): boolean {
  return storage.get<boolean>(KEYS.notifications, DEFAULTS.notifications);
}

export function setNotifications(enabled: boolean): void {
  storage.set(KEYS.notifications, enabled);
}

export function getEmailAlerts(): boolean {
  return storage.get<boolean>(KEYS.emailAlerts, DEFAULTS.emailAlerts);
}

export function setEmailAlerts(enabled: boolean): void {
  storage.set(KEYS.emailAlerts, enabled);
}

export function getWeeklyReports(): boolean {
  return storage.get<boolean>(KEYS.weeklyReports, DEFAULTS.weeklyReports);
}

export function setWeeklyReports(enabled: boolean): void {
  storage.set(KEYS.weeklyReports, enabled);
}