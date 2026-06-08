/**
 * Supabase data-access layer for Sublytics.
 * All functions return mapped domain types (camelCase) used by the rest of the app.
 * RLS policies in `supabase/migrations/001_initial_schema.sql` enforce per-user access.
 */

import { supabase } from './supabase';
import type { Subscription, Activity, Insight } from '../types';

// ─── Row shapes (snake_case as stored in Postgres) ──────────────────────────

interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  joined_at: string;
  currency: string;
  notifications: boolean;
  email_alerts: boolean;
  weekly_reports: boolean;
  budget: number;
}

interface SubscriptionRow {
  id: string;
  user_id: string;
  name: string;
  category: string;
  cost: number;
  billing_cycle: string;
  next_billing_date: string | null;
  status: string;
  logo: string | null;
  color: string | null;
  description: string | null;
  created_at: string;
}

interface ActivityRow {
  id: string;
  user_id: string;
  type: string;
  description: string;
  date: string;
  amount: number | null;
  subscription_name: string | null;
}

interface InsightRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  amount: number | null;
  actionable: boolean;
}

// ─── Mappers ────────────────────────────────────────────────────────────────

const mapSubscription = (r: SubscriptionRow): Subscription => ({
  id: r.id,
  name: r.name,
  category: r.category,
  cost: Number(r.cost),
  billingCycle: r.billing_cycle as Subscription['billingCycle'],
  nextBillingDate: r.next_billing_date ?? '',
  status: r.status as Subscription['status'],
  logo: r.logo ?? undefined,
  color: r.color ?? '#8B5CF6',
  description: r.description ?? undefined,
  createdAt: r.created_at.split('T')[0],
});

const mapActivity = (r: ActivityRow): Activity => ({
  id: r.id,
  type: r.type as Activity['type'],
  description: r.description,
  date: r.date,
  amount: r.amount != null ? Number(r.amount) : undefined,
  subscriptionName: r.subscription_name ?? undefined,
});

const mapInsight = (r: InsightRow): Insight => ({
  id: r.id,
  type: r.type as Insight['type'],
  title: r.title,
  description: r.description,
  amount: r.amount != null ? Number(r.amount) : undefined,
  actionable: r.actionable,
});

// ─── Auth helper ────────────────────────────────────────────────────────────

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Not authenticated');
  return data.user.id;
}

// ─── Profile ────────────────────────────────────────────────────────────────

export interface UserSettings {
  email: string;
  name: string;
  joinedAt: string;
  currency: string;
  notifications: boolean;
  emailAlerts: boolean;
  weeklyReports: boolean;
  budget: number;
}

const mapProfile = (r: ProfileRow): UserSettings => ({
  email: r.email,
  name: r.name ?? r.email.split('@')[0],
  joinedAt: r.joined_at,
  currency: r.currency,
  notifications: r.notifications,
  emailAlerts: r.email_alerts,
  weeklyReports: r.weekly_reports,
  budget: Number(r.budget),
});

export async function getProfile(): Promise<UserSettings | null> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data) : null;
}

export async function upsertProfileSettings(
  settings: Partial<Omit<UserSettings, 'email' | 'name' | 'joinedAt'>>
): Promise<void> {
  const userId = await requireUserId();
  const update: Record<string, unknown> = { id: userId, updated_at: new Date().toISOString() };
  if (settings.currency !== undefined) update.currency = settings.currency;
  if (settings.notifications !== undefined) update.notifications = settings.notifications;
  if (settings.emailAlerts !== undefined) update.email_alerts = settings.emailAlerts;
  if (settings.weeklyReports !== undefined) update.weekly_reports = settings.weeklyReports;
  if (settings.budget !== undefined) update.budget = settings.budget;

  const { error } = await supabase.from('profiles').upsert(update, { onConflict: 'id' });
  if (error) throw error;
}

// ─── Subscriptions ──────────────────────────────────────────────────────────

export async function getSubscriptions(): Promise<Subscription[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    if (error.code === '404' || error.code === '400' || String(error.message).includes('does not exist')) {
      console.warn('[Sublytics] subscriptions table not found — returning empty.');
      return [];
    }
    throw error;
  }
  return (data ?? []).map(mapSubscription);
}

export async function addSubscription(
  sub: Omit<Subscription, 'id' | 'createdAt'>
): Promise<Subscription> {
  const userId = await requireUserId();
  const row: Omit<SubscriptionRow, 'id' | 'created_at'> = {
    user_id: userId,
    name: sub.name,
    category: sub.category,
    cost: sub.cost,
    billing_cycle: sub.billingCycle,
    next_billing_date: sub.nextBillingDate || null,
    status: sub.status,
    logo: sub.logo ?? null,
    color: sub.color ?? null,
    description: sub.description ?? null,
  };
  const { data, error } = await supabase
    .from('subscriptions')
    .insert(row)
    .select('*')
    .single();
  if (error) throw error;
  return mapSubscription(data);
}

export async function updateSubscription(
  id: string,
  updates: Partial<Omit<Subscription, 'id' | 'createdAt'>>
): Promise<Subscription | null> {
  const userId = await requireUserId();
  const patch: Record<string, unknown> = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.category !== undefined) patch.category = updates.category;
  if (updates.cost !== undefined) patch.cost = updates.cost;
  if (updates.billingCycle !== undefined) patch.billing_cycle = updates.billingCycle;
  if (updates.nextBillingDate !== undefined) patch.next_billing_date = updates.nextBillingDate || null;
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.logo !== undefined) patch.logo = updates.logo ?? null;
  if (updates.color !== undefined) patch.color = updates.color ?? null;
  if (updates.description !== undefined) patch.description = updates.description ?? null;

  const { data, error } = await supabase
    .from('subscriptions')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? mapSubscription(data) : null;
}

export async function deleteSubscription(id: string): Promise<Subscription | null> {
  const userId = await requireUserId();
  // Fetch first so we can return the deleted row to the caller.
  const { data: existing, error: fetchErr } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (!existing) return null;

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
  return mapSubscription(existing);
}

export async function toggleSubscriptionStatus(id: string): Promise<Subscription | null> {
  const userId = await requireUserId();
  const { data: existing, error: fetchErr } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (!existing) return null;
  const newStatus = existing.status === 'active' ? 'paused' : 'active';
  return updateSubscription(id, { status: newStatus as Subscription['status'] });
}

export async function seedSubscriptionsIfEmpty(subs: Omit<Subscription, 'id' | 'createdAt'>[]): Promise<void> {
  const userId = await requireUserId();
  const { count, error: countErr } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (countErr) throw countErr;
  if ((count ?? 0) > 0) return;

  const rows = subs.map((s) => ({
    user_id: userId,
    name: s.name,
    category: s.category,
    cost: s.cost,
    billing_cycle: s.billingCycle,
    next_billing_date: s.nextBillingDate || null,
    status: s.status,
    logo: s.logo ?? null,
    color: s.color ?? null,
    description: s.description ?? null,
  }));
  const { error } = await supabase.from('subscriptions').insert(rows);
  if (error) throw error;
}

// ─── Activities ─────────────────────────────────────────────────────────────

export async function getActivities(): Promise<Activity[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) {
    if (error.code === '404' || error.code === '400' || String(error.message).includes('does not exist')) {
      console.warn('[Sublytics] activities table not found — returning empty.');
      return [];
    }
    throw error;
  }
  return (data ?? []).map(mapActivity);
}

export async function addActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
  const userId = await requireUserId();
  const row: Omit<ActivityRow, 'id'> = {
    user_id: userId,
    type: activity.type,
    description: activity.description,
    date: activity.date,
    amount: activity.amount ?? null,
    subscription_name: activity.subscriptionName ?? null,
  };
  const { data, error } = await supabase.from('activities').insert(row).select('*').single();
  if (error) throw error;
  return mapActivity(data);
}

export async function seedActivitiesIfEmpty(activities: Omit<Activity, 'id'>[]): Promise<void> {
  const userId = await requireUserId();
  const { count, error: countErr } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (countErr) throw countErr;
  if ((count ?? 0) > 0) return;

  const rows = activities.map((a) => ({
    user_id: userId,
    type: a.type,
    description: a.description,
    date: a.date,
    amount: a.amount ?? null,
    subscription_name: a.subscriptionName ?? null,
  }));
  const { error } = await supabase.from('activities').insert(rows);
  if (error) throw error;
}

// ─── Insights ───────────────────────────────────────────────────────────────

export async function getInsights(): Promise<Insight[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    // If the table doesn't exist (404/400), return empty instead of crashing.
    if (error.code === '404' || error.code === '400' || String(error.message).includes('does not exist')) {
      console.warn('[Sublytics] insights table not found — returning empty.');
      return [];
    }
    throw error;
  }
  return (data ?? []).map(mapInsight);
}
