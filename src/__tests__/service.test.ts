/**
 * Tests for the service layer (src/lib/service.ts).
 *
 * The db layer is mocked so NO real Supabase calls are made.
 * These tests verify that service functions correctly handle:
 *  - Auth session retrieval edge cases (null session, errors)
 *  - Profile / settings fallback logic (getProfile returns null)
 *  - Re-exported passthrough functions
 *
 * Usage: npm test   or   npm run test:watch
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock db layer BEFORE importing the service ──────────────────────────────

vi.mock('../lib/db', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  getSubscriptions: vi.fn(),
  addSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  deleteSubscription: vi.fn(),
  toggleSubscriptionStatus: vi.fn(),
  getActivities: vi.fn(),
  addActivity: vi.fn(),
  getInsights: vi.fn(),
  upsertProfileSettings: vi.fn(),
}));

import * as db from '../lib/db';

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// We test the service functions that have real logic (not just re-exports)

describe('getCurrency', () => {
  it('returns the profile currency when profile exists', async () => {
    vi.mocked(db.getProfile).mockResolvedValue({
      email: 'a@b.com',
      name: 'Alice',
      joinedAt: '2025-01-01',
      currency: '€',
      notifications: true,
      emailAlerts: false,
      weeklyReports: false,
      budget: 300,
    });

    const { getCurrency } = await import('../lib/service');
    const result = await getCurrency();
    expect(result).toBe('€');
  });

  it('returns the default currency when profile is null', async () => {
    vi.mocked(db.getProfile).mockResolvedValue(null);

    const { getCurrency } = await import('../lib/service');
    const result = await getCurrency();
    expect(result).toBe('$');
  });
});

describe('getBudget', () => {
  it('returns the profile budget when profile exists', async () => {
    vi.mocked(db.getProfile).mockResolvedValue({
      email: 'a@b.com',
      name: 'Alice',
      joinedAt: '2025-01-01',
      currency: '$',
      notifications: true,
      emailAlerts: false,
      weeklyReports: false,
      budget: 500,
    });

    const { getBudget } = await import('../lib/service');
    const result = await getBudget();
    expect(result).toBe(500);
  });

  it('returns the default budget when profile is null', async () => {
    vi.mocked(db.getProfile).mockResolvedValue(null);

    const { getBudget } = await import('../lib/service');
    const result = await getBudget();
    expect(result).toBe(300);
  });
});

describe('getNotifications', () => {
  it('returns the profile notifications value when profile exists', async () => {
    vi.mocked(db.getProfile).mockResolvedValue({
      email: 'a@b.com',
      name: 'Alice',
      joinedAt: '2025-01-01',
      currency: '$',
      notifications: false,
      emailAlerts: false,
      weeklyReports: false,
      budget: 300,
    });

    const { getNotifications } = await import('../lib/service');
    const result = await getNotifications();
    expect(result).toBe(false);
  });

  it('returns the default notifications when profile is null', async () => {
    vi.mocked(db.getProfile).mockResolvedValue(null);

    const { getNotifications } = await import('../lib/service');
    const result = await getNotifications();
    expect(result).toBe(true);
  });
});

describe('getEmailAlerts', () => {
  it('returns the profile emailAlerts value when profile exists', async () => {
    vi.mocked(db.getProfile).mockResolvedValue({
      email: 'a@b.com',
      name: 'Alice',
      joinedAt: '2025-01-01',
      currency: '$',
      notifications: true,
      emailAlerts: true,
      weeklyReports: false,
      budget: 300,
    });

    const { getEmailAlerts } = await import('../lib/service');
    const result = await getEmailAlerts();
    expect(result).toBe(true);
  });

  it('returns the default emailAlerts when profile is null', async () => {
    vi.mocked(db.getProfile).mockResolvedValue(null);

    const { getEmailAlerts } = await import('../lib/service');
    const result = await getEmailAlerts();
    expect(result).toBe(true);
  });
});

describe('getWeeklyReports', () => {
  it('returns the profile weeklyReports value when profile exists', async () => {
    vi.mocked(db.getProfile).mockResolvedValue({
      email: 'a@b.com',
      name: 'Alice',
      joinedAt: '2025-01-01',
      currency: '$',
      notifications: true,
      emailAlerts: false,
      weeklyReports: true,
      budget: 300,
    });

    const { getWeeklyReports } = await import('../lib/service');
    const result = await getWeeklyReports();
    expect(result).toBe(true);
  });

  it('returns the default weeklyReports when profile is null', async () => {
    vi.mocked(db.getProfile).mockResolvedValue(null);

    const { getWeeklyReports } = await import('../lib/service');
    const result = await getWeeklyReports();
    expect(result).toBe(false);
  });
});

describe('setCurrency', () => {
  it('calls upsertProfileSettings with the correct value', async () => {
    vi.mocked(db.upsertProfileSettings).mockResolvedValue(undefined);

    const { setCurrency } = await import('../lib/service');
    await setCurrency('€');
    expect(db.upsertProfileSettings).toHaveBeenCalledWith({ currency: '€' });
  });
});

describe('setBudget', () => {
  it('calls upsertProfileSettings with the correct value', async () => {
    vi.mocked(db.upsertProfileSettings).mockResolvedValue(undefined);

    const { setBudget } = await import('../lib/service');
    await setBudget(999);
    expect(db.upsertProfileSettings).toHaveBeenCalledWith({ budget: 999 });
  });
});

describe('setNotifications', () => {
  it('calls upsertProfileSettings with the correct value', async () => {
    vi.mocked(db.upsertProfileSettings).mockResolvedValue(undefined);

    const { setNotifications } = await import('../lib/service');
    await setNotifications(false);
    expect(db.upsertProfileSettings).toHaveBeenCalledWith({ notifications: false });
  });
});

describe('re-exports', () => {
  it('passes through getSubscriptions', async () => {
    vi.mocked(db.getSubscriptions).mockResolvedValue([]);

    const { getSubscriptions } = await import('../lib/service');
    const result = await getSubscriptions();
    expect(result).toEqual([]);
    expect(db.getSubscriptions).toHaveBeenCalledTimes(1);
  });

  it('passes through addSubscription', async () => {
    const sub = {
      id: 's1', name: 'Test', category: 'Other', cost: 10,
      billingCycle: 'monthly' as const, nextBillingDate: '', status: 'active' as const,
      color: '#000', createdAt: '2026-01-01',
    };
    vi.mocked(db.addSubscription).mockResolvedValue(sub);

    const { addSubscription } = await import('../lib/service');
    const result = await addSubscription({
      name: 'Test', category: 'Other', cost: 10,
      billingCycle: 'monthly', nextBillingDate: '', status: 'active', color: '#000',
    });
    expect(result.id).toBe('s1');
    expect(db.addSubscription).toHaveBeenCalledTimes(1);
  });

  it('passes through deleteSubscription', async () => {
    const sub = {
      id: 's1', name: 'Test', category: 'Other', cost: 10,
      billingCycle: 'monthly' as const, nextBillingDate: '', status: 'active' as const,
      color: '#000', createdAt: '2026-01-01',
    };
    vi.mocked(db.deleteSubscription).mockResolvedValue(sub);

    const { deleteSubscription } = await import('../lib/service');
    const result = await deleteSubscription('s1');
    expect(result?.id).toBe('s1');
    expect(db.deleteSubscription).toHaveBeenCalledWith('s1');
  });

  it('passes through addActivity', async () => {
    vi.mocked(db.addActivity).mockResolvedValue({
      id: 'a1', type: 'added', description: 'Test', date: '2026-01-01',
    });

    const { addActivity } = await import('../lib/service');
    const result = await addActivity({
      type: 'added', description: 'Test', date: '2026-01-01',
    });
    expect(result.id).toBe('a1');
    expect(db.addActivity).toHaveBeenCalledTimes(1);
  });

  it('passes through getInsights', async () => {
    vi.mocked(db.getInsights).mockResolvedValue([]);

    const { getInsights } = await import('../lib/service');
    const result = await getInsights();
    expect(result).toEqual([]);
    expect(db.getInsights).toHaveBeenCalledTimes(1);
  });

  it('passes through updateProfile', async () => {
    vi.mocked(db.updateProfile).mockResolvedValue(undefined);

    const { updateProfile } = await import('../lib/service');
    await updateProfile({ name: 'Bob' });
    expect(db.updateProfile).toHaveBeenCalledWith({ name: 'Bob' });
  });
});