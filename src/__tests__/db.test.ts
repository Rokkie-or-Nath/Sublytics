/**
 * Tests for the Supabase data-access layer (src/lib/db.ts).
 *
 * The Supabase client is mocked globally in vitest.setup.ts, so NO real
 * network calls are made. These tests verify that:
 *  - Mappers correctly convert snake_case DB rows to camelCase domain types.
 *  - Null / missing fields are handled without throwing.
 *  - Error responses (missing tables, auth failures) are gracefully handled.
 *
 * Usage: npm test   or   npm run test:watch
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// The mock is already set up, but we need to control its return values per test.
import { mockSupabase, setQueryResult } from '../../vitest.setup';

// The module under test — we import it fresh so the Supabase mock is in place.
import * as db from '../lib/db';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Factory functions that produce valid row objects.
 * Tests can override specific fields to exercise edge cases.
 */
const makeProfileRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-123',
  email: 'alice@example.com',
  name: 'Alice',
  avatar_url: null,
  joined_at: '2025-01-15T00:00:00Z',
  currency: '$',
  notifications: true,
  email_alerts: false,
  weekly_reports: true,
  budget: 200,
  ...overrides,
});

const makeSubscriptionRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'sub-1',
  user_id: 'user-123',
  name: 'Netflix',
  category: 'Entertainment',
  cost: 15.99,
  billing_cycle: 'monthly',
  next_billing_date: '2026-07-01',
  status: 'active',
  logo: 'https://logo.example.com/netflix.png',
  color: '#E50914',
  description: 'Streaming service',
  created_at: '2026-06-01T00:00:00Z',
  ...overrides,
});

const makeActivityRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'act-1',
  user_id: 'user-123',
  type: 'added',
  description: 'Added Netflix',
  date: '2026-06-10',
  amount: 15.99,
  subscription_name: 'Netflix',
  ...overrides,
});

const makeInsightRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'ins-1',
  user_id: 'user-123',
  type: 'saving',
  title: 'Potential saving',
  description: 'You could save $10 by switching to annual billing.',
  amount: 10,
  actionable: true,
  ...overrides,
});

// ─── Setup / Teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  // Default: auth.getUser() succeeds with a valid user.
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: { id: 'user-123' } },
    error: null,
  });

  // Default: query resolves with null data
  setQueryResult(null);
});

// ─── Profile ─────────────────────────────────────────────────────────────────

describe('getProfile', () => {
  it('returns null when no profile row exists', async () => {
    setQueryResult(null);
    const result = await db.getProfile();
    expect(result).toBeNull();
  });

  it('maps a profile row correctly', async () => {
    const row = makeProfileRow();
    setQueryResult(row);

    const result = await db.getProfile();
    expect(result).toEqual({
      email: 'alice@example.com',
      name: 'Alice',
      avatarUrl: undefined,
      joinedAt: '2025-01-15T00:00:00Z',
      currency: '$',
      notifications: true,
      emailAlerts: false,
      weeklyReports: true,
      budget: 200,
    });
  });

  it('falls back name to email prefix when name is null', async () => {
    const row = makeProfileRow({ name: null });
    setQueryResult(row);

    const result = await db.getProfile();
    expect(result?.name).toBe('alice');
  });

  it('maps avatar_url to avatarUrl', async () => {
    const row = makeProfileRow({ avatar_url: 'https://example.com/avatar.png' });
    setQueryResult(row);

    const result = await db.getProfile();
    expect(result?.avatarUrl).toBe('https://example.com/avatar.png');
  });

  it('budget is always a number', async () => {
    const row = makeProfileRow({ budget: '250' });
    setQueryResult(row);

    const result = await db.getProfile();
    expect(result?.budget).toBe(250);
  });
});

describe('updateProfile', () => {
  it('calls upsert with name and updated_at', async () => {
    setQueryResult(null);

    await db.updateProfile({ name: 'Bob' });

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    expect(mockSupabase.from().upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-123', name: 'Bob', updated_at: expect.any(String) }),
      { onConflict: 'id' },
    );
  });

  it('maps avatarUrl to avatar_url', async () => {
    setQueryResult(null);

    await db.updateProfile({ avatarUrl: 'https://example.com/ava.png' });

    expect(mockSupabase.from().upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-123', avatar_url: 'https://example.com/ava.png' }),
      expect.any(Object),
    );
  });
});

describe('upsertProfileSettings', () => {
  it('only includes defined settings in the upsert payload', async () => {
    setQueryResult(null);

    await db.upsertProfileSettings({ currency: '€', notifications: false });

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    expect(mockSupabase.from().upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-123',
        currency: '€',
        notifications: false,
      }),
      { onConflict: 'id' },
    );
  });
});

// ─── Subscriptions ───────────────────────────────────────────────────────────

describe('getSubscriptions', () => {
  it('returns an empty array when the table does not exist', async () => {
    setQueryResult(null, { code: '42P01', message: 'relation "subscriptions" does not exist' });

    const result = await db.getSubscriptions();
    expect(result).toEqual([]);
  });

  it('maps subscription rows correctly', async () => {
    const rows = [makeSubscriptionRow()];
    setQueryResult(rows);

    const result = await db.getSubscriptions();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'sub-1',
      name: 'Netflix',
      category: 'Entertainment',
      cost: 15.99,
      billingCycle: 'monthly',
      nextBillingDate: '2026-07-01',
      status: 'active',
      logo: 'https://logo.example.com/netflix.png',
      color: '#E50914',
      description: 'Streaming service',
      createdAt: '2026-06-01',
    });
  });

  it('maps cost as a number', async () => {
    const rows = [makeSubscriptionRow({ cost: '9.99' })];
    setQueryResult(rows);

    const result = await db.getSubscriptions();
    expect(result[0].cost).toBe(9.99);
  });

  it('handles missing optional fields', async () => {
    const rows = [makeSubscriptionRow({ logo: null, color: null, description: null, next_billing_date: null })];
    setQueryResult(rows);

    const result = await db.getSubscriptions();
    expect(result[0].logo).toBeUndefined();
    expect(result[0].color).toBe('#8B5CF6');   // default purple
    expect(result[0].description).toBeUndefined();
    expect(result[0].nextBillingDate).toBe('');
  });
});

describe('addSubscription', () => {
  it('inserts a subscription row and returns the mapped result', async () => {
    const row = makeSubscriptionRow();
    setQueryResult(row);

    const result = await db.addSubscription({
      name: 'Netflix',
      category: 'Entertainment',
      cost: 15.99,
      billingCycle: 'monthly',
      nextBillingDate: '2026-07-01',
      status: 'active',
      logo: 'https://logo.example.com/netflix.png',
      color: '#E50914',
      description: 'Streaming service',
    });

    expect(result.name).toBe('Netflix');
    expect(mockSupabase.from).toHaveBeenCalledWith('subscriptions');
    expect(mockSupabase.from().insert).toHaveBeenCalled();
  });
});

describe('deleteSubscription', () => {
  it('returns null when subscription does not exist', async () => {
    setQueryResult(null);

    const result = await db.deleteSubscription('nonexistent');
    expect(result).toBeNull();
  });

  it('fetches then deletes and returns the row', async () => {
    const row = makeSubscriptionRow();
    // First query (select) succeeds
    setQueryResult(row);

    const result = await db.deleteSubscription('sub-1');
    expect(result?.id).toBe('sub-1');
    expect(mockSupabase.from().delete).toHaveBeenCalled();
  });
});

describe('toggleSubscriptionStatus', () => {
  it('flips active to paused', async () => {
    const activeRow = makeSubscriptionRow({ status: 'active' });
    setQueryResult(activeRow);

    await db.toggleSubscriptionStatus('sub-1');

    // The toggle calls updateSubscription which calls supabase.from().update()
    expect(mockSupabase.from().update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'paused' }),
    );
  });
});

// ─── Activities ──────────────────────────────────────────────────────────────

describe('getActivities', () => {
  it('returns an empty array when the table does not exist', async () => {
    setQueryResult(null, { code: '42P01', message: 'relation "activities" does not exist' });

    const result = await db.getActivities();
    expect(result).toEqual([]);
  });

  it('maps activity rows correctly', async () => {
    const rows = [makeActivityRow()];
    setQueryResult(rows);

    const result = await db.getActivities();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'act-1',
      type: 'added',
      description: 'Added Netflix',
      date: '2026-06-10',
      amount: 15.99,
      subscriptionName: 'Netflix',
    });
  });

  it('handles null amount and subscription_name', async () => {
    const rows = [makeActivityRow({ amount: null, subscription_name: null })];
    setQueryResult(rows);

    const result = await db.getActivities();
    expect(result[0].amount).toBeUndefined();
    expect(result[0].subscriptionName).toBeUndefined();
  });
});

// ─── Insights ────────────────────────────────────────────────────────────────

describe('getInsights', () => {
  it('returns an empty array when the table does not exist', async () => {
    setQueryResult(null, { code: '42P01', message: 'relation "insights" does not exist' });

    const result = await db.getInsights();
    expect(result).toEqual([]);
  });

  it('maps insight rows correctly', async () => {
    const rows = [makeInsightRow()];
    setQueryResult(rows);

    const result = await db.getInsights();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'ins-1',
      type: 'saving',
      title: 'Potential saving',
      description: 'You could save $10 by switching to annual billing.',
      amount: 10,
      actionable: true,
    });
  });

  it('handles null amount', async () => {
    const rows = [makeInsightRow({ amount: null })];
    setQueryResult(rows);

    const result = await db.getInsights();
    expect(result[0].amount).toBeUndefined();
  });
});