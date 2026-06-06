import { storage } from './storage';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Account {
  email: string;
  name: string;
  passwordHash: string;
  verified: boolean;
  verificationCode: string;
  joinedAt: string;
  connectedEmail?: string;
  emailScanComplete?: boolean;
}

interface AccountStore {
  accounts: Account[];
}

// ─── Internal helpers ───────────────────────────────────────────────────────

const ACCOUNTS_KEY = 'accounts_db';

function getStore(): AccountStore {
  return storage.get<AccountStore>(ACCOUNTS_KEY, { accounts: [] });
}

function saveStore(store: AccountStore): void {
  storage.set(ACCOUNTS_KEY, store);
}

/** Simple hash for demo purposes (NOT production-grade — use bcrypt in production) */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

export function formatName(email: string): string {
  return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function accountExists(email: string): boolean {
  const store = getStore();
  return store.accounts.some((a) => a.email.toLowerCase() === email.toLowerCase());
}

export function registerAccount(
  email: string,
  password: string,
  name: string
): { success: true } | { success: false; error: string } {
  const normalized = email.toLowerCase().trim();

  if (accountExists(normalized)) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const store = getStore();

  store.accounts.push({
    email: normalized,
    name: name.trim() || formatName(normalized),
    passwordHash: simpleHash(password),
    verified: true, // Auto-verified — no email verification needed
    verificationCode: '',
    joinedAt: new Date().toISOString(),
  });

  saveStore(store);

  return { success: true };
}

export function loginAccount(
  email: string,
  password: string
): { success: true; account: Account } | { success: false; error: string } {
  const normalized = email.toLowerCase().trim();
  const store = getStore();
  const account = store.accounts.find((a) => a.email === normalized);

  if (!account) return { success: false, error: 'No account found with this email.' };
  if (account.passwordHash !== simpleHash(password)) {
    return { success: false, error: 'Incorrect password.' };
  }

  return { success: true, account };
}

export function getAccount(email: string): Account | null {
  const store = getStore();
  return store.accounts.find((a) => a.email === email.toLowerCase().trim()) || null;
}

export function connectEmailAccount(accountEmail: string, connectedEmail: string): void {
  const normalized = accountEmail.toLowerCase().trim();
  const store = getStore();
  const account = store.accounts.find((a) => a.email === normalized);
  if (account) {
    account.connectedEmail = connectedEmail;
    account.emailScanComplete = false;
    saveStore(store);
  }
}

export function markEmailScanComplete(accountEmail: string): void {
  const normalized = accountEmail.toLowerCase().trim();
  const store = getStore();
  const account = store.accounts.find((a) => a.email === normalized);
  if (account) {
    account.emailScanComplete = true;
    saveStore(store);
  }
}

