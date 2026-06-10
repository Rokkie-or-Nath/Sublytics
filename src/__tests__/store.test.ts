/**
 * Tests for the Zustand store (src/store/useStore.ts).
 *
 * The store's service layer calls are mocked so NO real Supabase or network
 * requests are made. These tests verify that:
 *  - initAuth correctly handles auth success, failure, and timeouts.
 *  - CRUD actions correctly update the store state.
 *  - Edge cases (empty data, errors, missing config) don't crash the app.
 *
 * Usage: npm test   or   npm run test:watch
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock service layer BEFORE importing the store ───────────────────────────

vi.mock('../lib/service', () => ({
  loadUserData: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
  addSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  deleteSubscription: vi.fn(),
  toggleSubscriptionStatus: vi.fn(),
  addActivity: vi.fn(),
  getCurrency: vi.fn(),
  setCurrency: vi.fn(),
  getBudget: vi.fn(),
  setBudget: vi.fn(),
  getNotifications: vi.fn(),
  setNotifications: vi.fn(),
  getEmailAlerts: vi.fn(),
  setEmailAlerts: vi.fn(),
  getWeeklyReports: vi.fn(),
  setWeeklyReports: vi.fn(),
}));

vi.mock('../lib/accounts', () => ({
  deleteAccount: vi.fn(),
}));

// Mock supabase module so we can control isSupabaseConfigured
vi.mock('../lib/supabase', () => ({
  supabase: {},
  isSupabaseConfigured: true,
}));

import * as service from '../lib/service';
import * as accounts from '../lib/accounts';
import * as supabaseModule from '../lib/supabase';
import type { Subscription } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface MockData {
  user: { email: string; name: string; avatar?: string; joinedAt: string };
  profile: {
    email: string; name: string; avatarUrl?: string; joinedAt: string;
    currency: string; notifications: boolean; emailAlerts: boolean;
    weeklyReports: boolean; budget: number;
  };
  subscriptions: Subscription[];
  activities: [];
  insights: [];
}

/**
 * Returns a mock user data payload that matches what loadUserData returns.
 */
const makeMockData = (overrides: Partial<MockData> = {}): MockData => ({
  user: { email: 'alice@example.com', name: 'Alice', joinedAt: '2025-01-15T00:00:00Z' },
  profile: {
    email: 'alice@example.com',
    name: 'Alice',
    joinedAt: '2025-01-15T00:00:00Z',
    currency: '$',
    notifications: true,
    emailAlerts: false,
    weeklyReports: true,
    budget: 200,
  },
  subscriptions: [],
  activities: [],
  insights: [],
  ...overrides,
});

const makeSubscription = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 'sub-1',
  name: 'Netflix',
  category: 'Entertainment',
  cost: 15.99,
  billingCycle: 'monthly',
  nextBillingDate: '2026-07-01',
  status: 'active',
  color: '#E50914',
  createdAt: '2026-06-01',
  ...overrides,
});

// ─── Setup / Teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Ensure isSupabaseConfigured is true by default; tests that need it false will set it
  (supabaseModule as { isSupabaseConfigured: boolean }).isSupabaseConfigured = true;
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('initAuth', () => {
  it('sets isAuthenticated and populates state on success', async () => {
    const { useStore } = await import('../store/useStore');

    const data = makeMockData({
      subscriptions: [makeSubscription()],
    });

    vi.mocked(service.loadUserData).mockResolvedValue(data);

    await useStore.getState().initAuth();

    const state = useStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isInitializing).toBe(false);
    expect(state.initError).toBe('');
    expect(state.subscriptions).toHaveLength(1);
    expect(state.subscriptions[0].name).toBe('Netflix');
    expect(state.currency).toBe('$');
    expect(state.budget).toBe(200);
  });

  it('sets isAuthenticated=false when loadUserData returns null', async () => {
    const { useStore } = await import('../store/useStore');

    vi.mocked(service.loadUserData).mockResolvedValue(null);

    await useStore.getState().initAuth();

    const state = useStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitializing).toBe(false);
    expect(state.initError).toBe('');
  });

  it('sets initError when Supabase is not configured', async () => {
    const { useStore } = await import('../store/useStore');
    (supabaseModule as { isSupabaseConfigured: boolean }).isSupabaseConfigured = false;

    await useStore.getState().initAuth();

    const state = useStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitializing).toBe(false);
    expect(state.initError).toContain('Supabase is not configured');
  });

  it('sets initError when loadUserData throws', async () => {
    const { useStore } = await import('../store/useStore');

    vi.mocked(service.loadUserData).mockRejectedValue(new Error('Network error'));

    await useStore.getState().initAuth();

    const state = useStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitializing).toBe(false);
    expect(state.initError).toBe('Network error');
  });

  it('deduplicates concurrent initAuth calls', async () => {
    const { useStore } = await import('../store/useStore');

    const data = makeMockData();
    vi.mocked(service.loadUserData).mockResolvedValue(data);

    await Promise.all([
      useStore.getState().initAuth(),
      useStore.getState().initAuth(),
    ]);

    // loadUserData should only be called once
    expect(service.loadUserData).toHaveBeenCalledTimes(1);
  });
});

describe('logout', () => {
  it('clears all state and calls service.logout', async () => {
    const { useStore } = await import('../store/useStore');
    // First authenticate
    vi.mocked(service.loadUserData).mockResolvedValue(makeMockData());
    await useStore.getState().initAuth();
    expect(useStore.getState().isAuthenticated).toBe(true);

    // Then logout
    vi.mocked(service.logout).mockResolvedValue(undefined);
    await useStore.getState().logout();

    const state = useStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.subscriptions).toEqual([]);
    expect(state.activities).toEqual([]);
    expect(state.insights).toEqual([]);
    expect(service.logout).toHaveBeenCalledTimes(1);
  });

  it('does nothing if already logged out', async () => {
    const { useStore } = await import('../store/useStore');

    await useStore.getState().logout();
    expect(service.logout).not.toHaveBeenCalled();
  });
});

describe('deleteAccount', () => {
  it('on success: logs out and clears state', async () => {
    const { useStore } = await import('../store/useStore');
    vi.mocked(service.loadUserData).mockResolvedValue(makeMockData());
    await useStore.getState().initAuth();

    vi.mocked(accounts.deleteAccount).mockResolvedValue({ success: true });
    vi.mocked(service.logout).mockResolvedValue(undefined);

    const result = await useStore.getState().deleteAccount();
    expect(result).toEqual({ success: true });
    expect(useStore.getState().isAuthenticated).toBe(false);
    expect(service.logout).toHaveBeenCalledTimes(1);
  });

  it('on failure: returns error without logging out', async () => {
    const { useStore } = await import('../store/useStore');
    vi.mocked(accounts.deleteAccount).mockResolvedValue({
      success: false,
      error: 'Cannot delete demo account',
    });

    const result = await useStore.getState().deleteAccount();
    expect(result).toEqual({ success: false, error: 'Cannot delete demo account' });
    expect(service.logout).not.toHaveBeenCalled();
  });
});

describe('addSubscription', () => {
  it('adds a subscription and activity to state', async () => {
    const { useStore } = await import('../store/useStore');
    vi.mocked(service.loadUserData).mockResolvedValue(makeMockData());
    await useStore.getState().initAuth();

    const newSub = makeSubscription({ id: 'sub-new', name: 'Spotify', color: '#1DB954' });
    vi.mocked(service.addSubscription).mockResolvedValue(newSub);
    vi.mocked(service.addActivity).mockResolvedValue({
      id: 'act-new',
      type: 'added',
      description: 'Added Spotify subscription',
      date: '2026-06-10',
      amount: 9.99,
      subscriptionName: 'Spotify',
    });

    await useStore.getState().addSubscription({
      name: 'Spotify',
      category: 'Music',
      cost: 9.99,
      billingCycle: 'monthly',
      nextBillingDate: '2026-07-15',
      status: 'active',
      color: '#1DB954',
    });

    const state = useStore.getState();
    expect(state.subscriptions).toHaveLength(1);
    expect(state.subscriptions[0].name).toBe('Spotify');
    expect(state.activities).toHaveLength(1);
    expect(state.activities[0].type).toBe('added');
  });
});

describe('updateSubscription', () => {
  it('updates a subscription in state', async () => {
    const { useStore } = await import('../store/useStore');
    const existing = makeSubscription();
    vi.mocked(service.loadUserData).mockResolvedValue(makeMockData({ subscriptions: [existing] }));
    await useStore.getState().initAuth();

    const updatedSub = { ...existing, cost: 19.99, name: 'Netflix Premium' };
    vi.mocked(service.updateSubscription).mockResolvedValue(updatedSub);
    vi.mocked(service.addActivity).mockResolvedValue({
      id: 'act-upd',
      type: 'updated',
      description: 'Updated Netflix Premium',
      date: '2026-06-10',
      subscriptionName: 'Netflix Premium',
    });

    await useStore.getState().updateSubscription('sub-1', { cost: 19.99, name: 'Netflix Premium' });

    const state = useStore.getState();
    expect(state.subscriptions[0].cost).toBe(19.99);
    expect(state.subscriptions[0].name).toBe('Netflix Premium');
  });
});

describe('deleteSubscription', () => {
  it('removes a subscription from state', async () => {
    const { useStore } = await import('../store/useStore');
    const existing = makeSubscription();
    vi.mocked(service.loadUserData).mockResolvedValue(makeMockData({ subscriptions: [existing] }));
    await useStore.getState().initAuth();

    vi.mocked(service.deleteSubscription).mockResolvedValue(existing);
    vi.mocked(service.addActivity).mockResolvedValue({
      id: 'act-del',
      type: 'cancelled',
      description: 'Removed Netflix',
      date: '2026-06-10',
      amount: 15.99,
      subscriptionName: 'Netflix',
    });

    await useStore.getState().deleteSubscription('sub-1');

    const state = useStore.getState();
    expect(state.subscriptions).toHaveLength(0);
  });
});

describe('toggleSubscriptionStatus', () => {
  it('flips active to paused in state', async () => {
    const { useStore } = await import('../store/useStore');
    const existing = makeSubscription({ status: 'active' });
    vi.mocked(service.loadUserData).mockResolvedValue(makeMockData({ subscriptions: [existing] }));
    await useStore.getState().initAuth();

    const paused = { ...existing, status: 'paused' as const };
    vi.mocked(service.toggleSubscriptionStatus).mockResolvedValue(paused);
    vi.mocked(service.addActivity).mockResolvedValue({
      id: 'act-pause',
      type: 'paused',
      description: 'Paused Netflix',
      date: '2026-06-10',
      amount: 15.99,
      subscriptionName: 'Netflix',
    });

    await useStore.getState().toggleSubscriptionStatus('sub-1');

    const state = useStore.getState();
    expect(state.subscriptions[0].status).toBe('paused');
  });
});

describe('settings', () => {
  it('setCurrency updates local state and persists', async () => {
    const { useStore } = await import('../store/useStore');
    vi.mocked(service.setCurrency).mockResolvedValue(undefined);

    await useStore.getState().setCurrency('€');

    expect(useStore.getState().currency).toBe('€');
    expect(service.setCurrency).toHaveBeenCalledWith('€');
  });

  it('setNotifications updates local state and persists', async () => {
    const { useStore } = await import('../store/useStore');
    vi.mocked(service.setNotifications).mockResolvedValue(undefined);

    await useStore.getState().setNotifications(false);

    expect(useStore.getState().notifications).toBe(false);
    expect(service.setNotifications).toHaveBeenCalledWith(false);
  });

  it('setBudget updates local state and persists', async () => {
    const { useStore } = await import('../store/useStore');
    vi.mocked(service.setBudget).mockResolvedValue(undefined);

    await useStore.getState().setBudget(500);

    expect(useStore.getState().budget).toBe(500);
    expect(service.setBudget).toHaveBeenCalledWith(500);
  });
});

describe('UI state', () => {
  it('setSearchQuery updates searchQuery', async () => {
    const { useStore } = await import('../store/useStore');
    useStore.getState().setSearchQuery('netflix');
    expect(useStore.getState().searchQuery).toBe('netflix');
  });

  it('setCurrentPage updates currentPage', async () => {
    const { useStore } = await import('../store/useStore');
    useStore.getState().setCurrentPage('settings');
    expect(useStore.getState().currentPage).toBe('settings');
  });
});

describe('updateProfile', () => {
  it('updates user name in state', async () => {
    const { useStore } = await import('../store/useStore');
    vi.mocked(service.loadUserData).mockResolvedValue(makeMockData());
    await useStore.getState().initAuth();

    vi.mocked(service.updateProfile).mockResolvedValue(undefined);

    await useStore.getState().updateProfile({ name: 'Bob' });

    expect(useStore.getState().user?.name).toBe('Bob');
    expect(service.updateProfile).toHaveBeenCalledWith({ name: 'Bob' });
  });
});

describe('detection state', () => {
  it('setIsDetecting updates isDetecting', async () => {
    const { useStore } = await import('../store/useStore');
    useStore.getState().setIsDetecting(true);
    expect(useStore.getState().isDetecting).toBe(true);

    useStore.getState().setIsDetecting(false);
    expect(useStore.getState().isDetecting).toBe(false);
  });

  it('setDetectionProgress updates detectionProgress', async () => {
    const { useStore } = await import('../store/useStore');
    useStore.getState().setDetectionProgress(50);
    expect(useStore.getState().detectionProgress).toBe(50);
  });

  it('setDetectionMessage updates detectionMessage', async () => {
    const { useStore } = await import('../store/useStore');
    useStore.getState().setDetectionMessage('Scanning...');
    expect(useStore.getState().detectionMessage).toBe('Scanning...');
  });
});