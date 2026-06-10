/**
 * Vitest setup file — runs before every test file.
 * Mocks the Supabase client so no real network calls are made.
 */
import { vi } from 'vitest';

// ─── Mock Supabase client ────────────────────────────────────────────────────

/**
 * Creates a chainable query builder mock.
 *
 * Each chain method (select, insert, update, etc.) returns the same builder
 * instance. The builder itself is a Promise-like object: its `then` method
 * reads from a shared mutable `_result` variable, which tests can reassign
 * via `mockQueryBuilder._resolveWith({ data, error })`.
 *
 * This avoids the vi.fn() + mockResolvedValue conflict that happens when
 * `then` is also a vi.fn() and tests try to call mockResolvedValue on it.
 */
const resultRef: { current: { data: unknown; error: unknown } } = {
  current: { data: null, error: null },
};

function createBuilder() {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    upsert: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    maybeSingle: vi.fn(() => builder),
    single: vi.fn(() => builder),
  };

  // `then` makes the builder thenable (usable with `await`).
  // It reads from resultRef.current so tests can control the resolved value.
  builder.then = function (resolve: (value: unknown) => unknown) {
    return Promise.resolve(resolve(resultRef.current));
  };

  return builder as ReturnType<typeof vi.fn> & typeof builder & Promise<unknown>;
}

const mockQueryBuilder = createBuilder();

// Expose a helper for tests to set what the query resolves to.
// Tests call: setQueryResult({ data: rows, error: null })
function setQueryResult(data: unknown, error: unknown = null) {
  resultRef.current = { data, error };
}

const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: vi.fn().mockResolvedValue(undefined),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  },
  from: vi.fn(() => mockQueryBuilder),
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
  isSupabaseConfigured: true,
}));

export { mockSupabase, setQueryResult };