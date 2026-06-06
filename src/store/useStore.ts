import { create } from 'zustand';
import type { Subscription, Activity, Insight, Page, User } from '../types';
import * as service from '../lib/service';
import { DEFAULTS } from '../constants/defaults';

// ─── State interface ───────────────────────────────────────────────────────

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isDetecting: boolean;
  detectionProgress: number;
  detectionMessage: string;
  login: (email: string) => void;
  logout: () => void;
  setIsDetecting: (detecting: boolean) => void;
  setDetectionProgress: (progress: number) => void;
  setDetectionMessage: (message: string) => void;

  // Navigation
  currentPage: Page;
  setCurrentPage: (page: Page) => void;

  // Subscriptions
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  toggleSubscriptionStatus: (id: string) => void;
  setSubscriptions: (subs: Subscription[]) => void;

  // Activities
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  setActivities: (acts: Activity[]) => void;

  // Insights
  insights: Insight[];
  setInsights: (insights: Insight[]) => void;

  // UI
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  sortBy: 'name' | 'cost' | 'nextBilling' | 'status';
  setSortBy: (sort: 'name' | 'cost' | 'nextBilling' | 'status') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;

  // Settings
  currency: string;
  setCurrency: (currency: string) => void;
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
  emailAlerts: boolean;
  setEmailAlerts: (enabled: boolean) => void;
  weeklyReports: boolean;
  setWeeklyReports: (enabled: boolean) => void;
  budget: number;
  setBudget: (budget: number) => void;
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useStore = create<AppState>((set, get) => ({
  // ─── Auth ─────────────────────────────────────────────────────────────────
  user: service.getUser(),
  isAuthenticated: service.getUser() !== null,
  isDetecting: false,
  detectionProgress: 0,
  detectionMessage: '',

  login: (email: string) => {
    const data = service.login(email);
    set({
      user: data.user,
      isAuthenticated: true,
      subscriptions: data.subscriptions,
      activities: data.activities,
      insights: data.insights,
    });
  },

  logout: () => {
    service.logout();
    set({
      user: null,
      isAuthenticated: false,
      subscriptions: [],
      activities: [],
      insights: [],
      currentPage: 'dashboard',
      searchQuery: '',
      selectedCategory: null,
    });
  },

  setIsDetecting: (detecting) => set({ isDetecting: detecting }),
  setDetectionProgress: (progress) => set({ detectionProgress: progress }),
  setDetectionMessage: (message) => set({ detectionMessage: message }),

  // ─── Navigation ───────────────────────────────────────────────────────────
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),

  // ─── Subscriptions ────────────────────────────────────────────────────────
  subscriptions: service.getSubscriptions(),

  addSubscription: (sub) => {
    const newSub = service.addSubscription(sub);
    set((state) => ({
      subscriptions: [newSub, ...state.subscriptions],
      activities: [
        {
          id: crypto.randomUUID(),
          type: 'added',
          description: `Added ${sub.name} subscription`,
          date: new Date().toISOString(),
          amount: sub.cost,
          subscriptionName: sub.name,
        },
        ...state.activities,
      ],
    }));
  },

  updateSubscription: (id, updates) => {
    service.updateSubscription(id, updates);
    set((state) => ({
      subscriptions: state.subscriptions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      activities: [
        {
          id: crypto.randomUUID(),
          type: 'updated',
          description: `Updated ${updates.name || 'subscription'}`,
          date: new Date().toISOString(),
          subscriptionName: updates.name,
        },
        ...state.activities,
      ],
    }));
  },

  deleteSubscription: (id) => {
    const sub = service.deleteSubscription(id);
    if (!sub) return;
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s.id !== id),
      activities: [
        {
          id: crypto.randomUUID(),
          type: 'cancelled',
          description: `Removed ${sub.name || 'subscription'}`,
          date: new Date().toISOString(),
          amount: sub.cost,
          subscriptionName: sub.name,
        },
        ...state.activities,
      ],
    }));
  },

  toggleSubscriptionStatus: (id) => {
    const updated = service.toggleSubscriptionStatus(id);
    if (!updated) return;
    set((state) => ({
      subscriptions: state.subscriptions.map((s) => (s.id === id ? updated : s)),
      activities: [
        {
          id: crypto.randomUUID(),
          type: updated.status === 'paused' ? 'paused' : 'updated',
          description: `${updated.status === 'paused' ? 'Paused' : 'Resumed'} ${updated.name}`,
          date: new Date().toISOString(),
          amount: updated.cost,
          subscriptionName: updated.name,
        },
        ...state.activities,
      ],
    }));
  },

  setSubscriptions: (subs) => {
    set({ subscriptions: subs });
  },

  // ─── Activities ───────────────────────────────────────────────────────────
  activities: service.getActivities(),

  addActivity: (activity) => {
    const newAct = service.addActivity(activity);
    set((state) => ({ activities: [newAct, ...state.activities] }));
  },

  setActivities: (acts) => {
    service.setActivities(acts);
    set({ activities: acts });
  },

  // ─── Insights ─────────────────────────────────────────────────────────────
  insights: service.getInsights(),

  setInsights: (insights) => {
    service.setInsights(insights);
    set({ insights });
  },

  // ─── UI ───────────────────────────────────────────────────────────────────
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  isAddModalOpen: false,
  setIsAddModalOpen: (open) => set({ isAddModalOpen: open }),
  sortBy: 'name',
  setSortBy: (sort) => set({ sortBy: sort }),
  sortOrder: 'asc',
  setSortOrder: (order) => set({ sortOrder: order }),

  // ─── Settings ─────────────────────────────────────────────────────────────
  currency: service.getCurrency(),
  setCurrency: (currency) => {
    service.setCurrency(currency);
    set({ currency });
  },
  notifications: service.getNotifications(),
  setNotifications: (enabled) => {
    service.setNotifications(enabled);
    set({ notifications: enabled });
  },
  emailAlerts: service.getEmailAlerts(),
  setEmailAlerts: (enabled) => {
    service.setEmailAlerts(enabled);
    set({ emailAlerts: enabled });
  },
  weeklyReports: service.getWeeklyReports(),
  setWeeklyReports: (enabled) => {
    service.setWeeklyReports(enabled);
    set({ weeklyReports: enabled });
  },
  budget: service.getBudget(),
  setBudget: (budget) => {
    service.setBudget(budget);
    set({ budget });
  },
}));