import { create } from 'zustand';
import type { Subscription, Activity, Insight, Page, User } from '../types';
import * as service from '../lib/service';
import { DEFAULTS } from '../constants/defaults';

// ─── State interface ───────────────────────────────────────────────────────

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;          // true on first session check
  isDetecting: boolean;             // true during the "email scan" animation
  detectionProgress: number;
  detectionMessage: string;
  initAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setIsDetecting: (detecting: boolean) => void;
  setDetectionProgress: (progress: number) => void;
  setDetectionMessage: (message: string) => void;

  // Navigation
  currentPage: Page;
  setCurrentPage: (page: Page) => void;

  // Subscriptions
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt'>) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  toggleSubscriptionStatus: (id: string) => Promise<void>;
  setSubscriptions: (subs: Subscription[]) => void;

  // Activities
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id'>) => Promise<void>;
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
  setCurrency: (currency: string) => Promise<void>;
  notifications: boolean;
  setNotifications: (enabled: boolean) => Promise<void>;
  emailAlerts: boolean;
  setEmailAlerts: (enabled: boolean) => Promise<void>;
  weeklyReports: boolean;
  setWeeklyReports: (enabled: boolean) => Promise<void>;
  budget: number;
  setBudget: (budget: number) => Promise<void>;
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useStore = create<AppState>((set) => ({
  // ─── Auth ─────────────────────────────────────────────────────────────────
  user: null,
  isAuthenticated: false,
  isInitializing: true,             // start as "still figuring out who you are"
  isDetecting: false,
  detectionProgress: 0,
  detectionMessage: '',

  initAuth: async () => {
    set({ isInitializing: true });
    const data = await service.loadUserData();
    if (!data) {
      set({ user: null, isAuthenticated: false, isInitializing: false });
      return;
    }
    set({
      user: data.user,
      isAuthenticated: true,
      isInitializing: false,
      subscriptions: data.subscriptions,
      activities: data.activities,
      insights: data.insights,
      currency: data.profile.currency,
      notifications: data.profile.notifications,
      emailAlerts: data.profile.emailAlerts,
      weeklyReports: data.profile.weeklyReports,
      budget: data.profile.budget,
    });
  },

  logout: async () => {
    await service.logout();
    set({
      user: null,
      isAuthenticated: false,
      isInitializing: false,
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
  subscriptions: [],

  addSubscription: async (sub) => {
    try {
      const newSub = await service.addSubscription(sub);
      const newAct = await service.addActivity({
        type: 'added',
        description: `Added ${sub.name} subscription`,
        date: new Date().toISOString(),
        amount: sub.cost,
        subscriptionName: sub.name,
      });
      set((state) => ({
        subscriptions: [newSub, ...state.subscriptions],
        activities: [newAct, ...state.activities],
      }));
    } catch (err) {
      console.error('Failed to add subscription:', err);
    }
  },

  updateSubscription: async (id, updates) => {
    try {
      const updated = await service.updateSubscription(id, updates);
      if (!updated) return;
      const newAct = await service.addActivity({
        type: 'updated',
        description: `Updated ${updates.name || 'subscription'}`,
        date: new Date().toISOString(),
        subscriptionName: updates.name,
      });
      set((state) => ({
        subscriptions: state.subscriptions.map((s) => (s.id === id ? updated : s)),
        activities: [newAct, ...state.activities],
      }));
    } catch (err) {
      console.error('Failed to update subscription:', err);
    }
  },

  deleteSubscription: async (id) => {
    try {
      const removed = await service.deleteSubscription(id);
      if (!removed) return;
      const newAct = await service.addActivity({
        type: 'cancelled',
        description: `Removed ${removed.name || 'subscription'}`,
        date: new Date().toISOString(),
        amount: removed.cost,
        subscriptionName: removed.name,
      });
      set((state) => ({
        subscriptions: state.subscriptions.filter((s) => s.id !== id),
        activities: [newAct, ...state.activities],
      }));
    } catch (err) {
      console.error('Failed to delete subscription:', err);
    }
  },

  toggleSubscriptionStatus: async (id) => {
    try {
      const updated = await service.toggleSubscriptionStatus(id);
      if (!updated) return;
      const newAct = await service.addActivity({
        type: updated.status === 'paused' ? 'paused' : 'updated',
        description: `${updated.status === 'paused' ? 'Paused' : 'Resumed'} ${updated.name}`,
        date: new Date().toISOString(),
        amount: updated.cost,
        subscriptionName: updated.name,
      });
      set((state) => ({
        subscriptions: state.subscriptions.map((s) => (s.id === id ? updated : s)),
        activities: [newAct, ...state.activities],
      }));
    } catch (err) {
      console.error('Failed to toggle subscription status:', err);
    }
  },

  setSubscriptions: (subs) => set({ subscriptions: subs }),

  // ─── Activities ───────────────────────────────────────────────────────────
  activities: [],

  addActivity: async (activity) => {
    try {
      const newAct = await service.addActivity(activity);
      set((state) => ({ activities: [newAct, ...state.activities] }));
    } catch (err) {
      console.error('Failed to add activity:', err);
    }
  },

  setActivities: (acts) => set({ activities: acts }),

  // ─── Insights ─────────────────────────────────────────────────────────────
  insights: [],

  setInsights: (insights) => set({ insights }),

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
  currency: DEFAULTS.currency,
  setCurrency: async (currency) => {
    set({ currency });
    try { await service.setCurrency(currency); }
    catch (err) { console.error('Failed to persist currency:', err); }
  },

  notifications: DEFAULTS.notifications,
  setNotifications: async (enabled) => {
    set({ notifications: enabled });
    try { await service.setNotifications(enabled); }
    catch (err) { console.error('Failed to persist notifications:', err); }
  },

  emailAlerts: DEFAULTS.emailAlerts,
  setEmailAlerts: async (enabled) => {
    set({ emailAlerts: enabled });
    try { await service.setEmailAlerts(enabled); }
    catch (err) { console.error('Failed to persist emailAlerts:', err); }
  },

  weeklyReports: DEFAULTS.weeklyReports,
  setWeeklyReports: async (enabled) => {
    set({ weeklyReports: enabled });
    try { await service.setWeeklyReports(enabled); }
    catch (err) { console.error('Failed to persist weeklyReports:', err); }
  },

  budget: DEFAULTS.budget,
  setBudget: async (budget) => {
    set({ budget });
    try { await service.setBudget(budget); }
    catch (err) { console.error('Failed to persist budget:', err); }
  },
}));
