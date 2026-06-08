/**
 * Service layer — orchestrates Supabase reads/writes (via `db.ts`) and seeds
 * mock data for new users. All state-mutating functions are async because they
 * hit the network; the store handles loading states.
 */

import * as db from './db';
import { supabase } from './supabase';
import type { User, Subscription, Activity, Insight } from '../types';
import { DEFAULTS } from '../constants/defaults';

// ─── Auth / session lifecycle ───────────────────────────────────────────────

/**
 * Returns the current user from the Supabase session, or null if signed out.
 * Does NOT touch the database — used as a cheap check on app boot.
 */
export async function getSessionUser(): Promise<User | null> {
  console.log('[Sublytics] getSessionUser: reading session…');
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[Sublytics] getSession error:', error.message);
    return null;
  }
  const u = data.session?.user;
  if (!u) {
    console.log('[Sublytics] no active session');
    return null;
  }
  console.log('[Sublytics] active session for', u.email);
  return {
    email: u.email ?? '',
    name: (u.user_metadata?.name as string) || (u.email?.split('@')[0] ?? 'User'),
    joinedAt: u.created_at,
  };
}

/**
 * Loads the user's profile + data from Supabase.
 * New users start with an empty dashboard — no mock data is seeded.
 */
export async function loadUserData(): Promise<{
  user: User;
  profile: db.UserSettings;
  subscriptions: Subscription[];
  activities: Activity[];
  insights: Insight[];
} | null> {
  console.log('[Sublytics] loadUserData: start');
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    console.log('[Sublytics] loadUserData: no session, returning null');
    return null;
  }

  // Resolve the auth user so we have their UUID.
  console.log('[Sublytics] loadUserData: calling auth.getUser…');
  const { data: authUser, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authUser.user) {
    console.warn('[Sublytics] getUser error:', authErr?.message);
    return null;
  }
  console.log('[Sublytics] auth user:', authUser.user.id);

  // Profile
  console.log('[Sublytics] loadUserData: fetching profile…');
  let profile = await db.getProfile();
  if (!profile) {
    console.log('[Sublytics] no profile row yet, creating…');
    await supabase.from('profiles').upsert({
      id: authUser.user.id,
      email: authUser.user.email ?? sessionUser.email,
      name: sessionUser.name,
      joined_at: sessionUser.joinedAt,
    }, { onConflict: 'id' });
    profile = await db.getProfile();
  }
  if (!profile) {
    console.warn('[Sublytics] still no profile after upsert');
    return null;
  }
  console.log('[Sublytics] profile loaded:', profile.email);

  // Subscriptions — never seed fake data. The user starts with an empty list.
  console.log('[Sublytics] loadUserData: fetching subscriptions…');
  const subscriptions = await db.getSubscriptions();
  console.log('[Sublytics] subscriptions loaded:', subscriptions.length);

  // Activities
  console.log('[Sublytics] loadUserData: fetching activities…');
  const activities = await db.getActivities();
  console.log('[Sublytics] activities loaded:', activities.length);

  // Insights
  console.log('[Sublytics] loadUserData: fetching insights…');
  const insights = await db.getInsights();
  console.log('[Sublytics] insights loaded:', insights.length);

  return {
    user: {
      email: profile.email,
      name: profile.name,
      joinedAt: profile.joinedAt,
    },
    profile,
    subscriptions,
    activities,
    insights,
  };
}

/**
 * Signs the user out of Supabase. The store clears local state separately.
 */
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── Subscriptions ──────────────────────────────────────────────────────────

export const getSubscriptions = db.getSubscriptions;
export const addSubscription = db.addSubscription;
export const updateSubscription = db.updateSubscription;
export const deleteSubscription = db.deleteSubscription;
export const toggleSubscriptionStatus = db.toggleSubscriptionStatus;

// ─── Activities ─────────────────────────────────────────────────────────────

export const getActivities = db.getActivities;
export const addActivity = db.addActivity;

// ─── Insights ───────────────────────────────────────────────────────────────

export const getInsights = db.getInsights;

// ─── Settings (profile-backed) ──────────────────────────────────────────────

export async function getCurrency(): Promise<string> {
  const p = await db.getProfile();
  return p?.currency ?? DEFAULTS.currency;
}
export const setCurrency = (currency: string) =>
  db.upsertProfileSettings({ currency });

export async function getBudget(): Promise<number> {
  const p = await db.getProfile();
  return p?.budget ?? DEFAULTS.budget;
}
export const setBudget = (budget: number) =>
  db.upsertProfileSettings({ budget });

export async function getNotifications(): Promise<boolean> {
  const p = await db.getProfile();
  return p?.notifications ?? DEFAULTS.notifications;
}
export const setNotifications = (enabled: boolean) =>
  db.upsertProfileSettings({ notifications: enabled });

export async function getEmailAlerts(): Promise<boolean> {
  const p = await db.getProfile();
  return p?.emailAlerts ?? DEFAULTS.emailAlerts;
}
export const setEmailAlerts = (enabled: boolean) =>
  db.upsertProfileSettings({ emailAlerts: enabled });

export async function getWeeklyReports(): Promise<boolean> {
  const p = await db.getProfile();
  return p?.weeklyReports ?? DEFAULTS.weeklyReports;
}
export const setWeeklyReports = (enabled: boolean) =>
  db.upsertProfileSettings({ weeklyReports: enabled });
