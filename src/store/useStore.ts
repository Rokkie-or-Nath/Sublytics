import { create } from 'zustand';
import type { Subscription, Activity, Insight, Page, User } from '../types';
import * as service from '../lib/service';
import * as accounts from '../lib/accounts';
import { isSupabaseConfigured } from '../lib/supabase';
import { DEFAULTS } from '../constants/defaults';

/**
 * Wraps a promise with a timeout so the load screen doesn't hang forever
 * if Supabase is unreachable or a request never settles.
 * Throws the timeout reason after `ms` milliseconds.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms (${label})`));
    }, ms);
    promise
      .then((v) => { clearTimeout(timer); resolve(v); })
      .catch((e) => { clearTimeout(timer); reject(e); });
  });
}

// ─── State interface ───────────────────────────────────────────────────────

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;          // true on first session check
  initError: string;                // set when initAuth fails (e.g. bad .env)
  isDetecting: boolean;             // true during the "email scan" animation
  detectionProgress: number;
  detectionMessage: string;
  initAuth: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ success: true } | { success: false; error: string }>;
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

const SUPABASE_NOT_CONFIGURED_MSG =
  'Supabase is not configured. Open .env and set VITE_SUPABASE_URL and ' +
  'VITE_SUPABASE_ANON_KEY to your project values, then restart the dev server. ' +
  'See .env.example for the format.';

export const useStore = create<AppState>((set) => ({
  // ─── Auth ─────────────────────────────────────────────────────────────────
  user: null,
  isAuthenticated: false,
  isInitializing: true,             // start as "still figuring out who you are"
  initError: '',
  isDetecting: false,
  detectionProgress: 0,
  detectionMessage: '',

  initAuth: async () => {
    // If the user is already authenticated, skip the loading UI to prevent
    // flickering the FullScreenLoader on page navigation.
    set((state) => {
      if (state.isAuthenticated) return {};
      return { isInitializing: true, initError: '' };
    });

    // If .env still has placeholder Supabase values, bail out cleanly
    // instead of letting the requests hang.
    if (!isSupabaseConfigured) {
      set({
        user: null,
        isAuthenticated: false,
        isInitializing: false,
        initError: SUPABASE_NOT_CONFIGURED_MSG,
      });
      return;
    }

    try {
      const LOAD_TIMEOUT_MS = 15_000; // 15 seconds max to load user data
      const data = await withTimeout(service.loadUserData(), LOAD_TIMEOUT_MS, 'loadUserData');
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
    } catch (err) {
      // ANY failure here (network, bad env, missing tables, etc.) must
      // still flip isInitializing to false so the UI doesn't hang forever.
      // eslint-disable-next-line no-console
      console.error('[Sublytics] initAuth failed:', err);
      set({
        user: null,
        isAuthenticated: false,
        isInitializing: false,
        initError:
          (err instanceof Error ? err.message : String(err)) ||
          'Failed to connect to Supabase. Check your .env and that the schema is applied.',
      });
    }
  },

  logout: async () => {
    await service.logout();
    set({
      user: null,
      isAuthenticated: false,
      isInitializing: false,
      initError: '',
      subscriptions: [],
      activities: [],
      insights: [],
      currentPage: 'dashboard',
      searchQuery: '',
      selectedCategory: null,
    });
  },

  deleteAccount: async () => {
    // Call the Edge Function (uses service_role key server-side) to delete
    // the auth user. FK cascades wipe their profile + data automatically.
    const result = await accounts.deleteAccount();
    if (!result.success) return result;

    // Edge function succeeded — sign out locally and reset state.
    await service.logout();
    set({
      user: null,
      isAuthenticated: false,
      isInitializing: false,
      initError: '',
      subscriptions: [],
      activities: [],
      insights: [],
      currentPage: 'dashboard',
      searchQuery: '',
      selectedCategory: null,
    });
    return { success: true };
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
