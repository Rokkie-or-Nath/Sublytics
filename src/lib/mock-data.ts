import type { Subscription, Activity, Insight } from '../types';

// ─── Helpers ───────────────────────────────────────────────────────────────

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const addMonths = (months: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
};

// ─── Mock subscription data ─────────────────────────────────────────────────

const possibleSubs = [
  { name: 'Netflix', category: 'streaming', cost: 15.49, color: '#E74C3C', desc: 'Standard plan - HD streaming' },
  { name: 'Spotify', category: 'music', cost: 10.99, color: '#8B5CF6', desc: 'Premium individual plan' },
  { name: 'Apple Music', category: 'music', cost: 10.99, color: '#F43F5E', desc: 'Individual plan' },
  { name: 'Notion', category: 'productivity', cost: 8.00, color: '#3B82F6', desc: 'Personal Pro plan' },
  { name: 'Apple Fitness+', category: 'fitness', cost: 9.99, color: '#0FA573', desc: 'Monthly fitness subscription' },
  { name: 'Peloton', category: 'fitness', cost: 44.00, color: '#E74C3C', desc: 'All-Access Membership' },
  { name: 'iCloud+', category: 'cloud', cost: 2.99, color: '#06B6D4', desc: '200GB storage plan' },
  { name: 'Google One', category: 'cloud', cost: 9.99, color: '#3B82F6', desc: '2TB storage plan' },
  { name: 'Xbox Game Pass', category: 'gaming', cost: 16.99, color: '#EC4899', desc: 'Ultimate subscription' },
  { name: 'PlayStation Plus', category: 'gaming', cost: 14.99, color: '#3B82F6', desc: 'Extra tier' },
  { name: 'The New York Times', category: 'news', cost: 17.00, color: '#F59E0B', desc: 'Digital subscription' },
  { name: 'Washington Post', category: 'news', cost: 12.00, color: '#06B6D4', desc: 'Digital access' },
  { name: 'Adobe Creative Cloud', category: 'productivity', cost: 54.99, color: '#E67E3C', desc: 'All Apps plan' },
  { name: 'Figma', category: 'productivity', cost: 12.00, color: '#EC4899', desc: 'Professional plan' },
  { name: 'Dropbox', category: 'cloud', cost: 11.99, color: '#3B82F6', desc: 'Plus plan - 2TB' },
  { name: 'YouTube Premium', category: 'streaming', cost: 13.99, color: '#E74C3C', desc: 'Individual plan' },
  { name: 'Hulu', category: 'streaming', cost: 14.99, color: '#14B8A6', desc: 'No Ads plan' },
  { name: 'Disney+', category: 'streaming', cost: 13.99, color: '#3B82F6', desc: 'Premium with Hulu' },
  { name: 'Amazon Prime', category: 'shopping', cost: 14.99, color: '#F59E0B', desc: 'Monthly membership' },
  { name: 'DoorDash DashPass', category: 'shopping', cost: 9.99, color: '#E74C3C', desc: 'Monthly delivery pass' },
  { name: 'Calm', category: 'fitness', cost: 14.99, color: '#8B5CF6', desc: 'Premium meditation' },
  { name: 'Headspace', category: 'fitness', cost: 12.99, color: '#F59E0B', desc: 'Meditation app' },
  { name: 'LinkedIn Premium', category: 'productivity', cost: 29.99, color: '#3B82F6', desc: 'Career subscription' },
  { name: 'GitHub Copilot', category: 'productivity', cost: 10.00, color: '#6B7B8F', desc: 'AI coding assistant' },
  { name: 'ChatGPT Plus', category: 'productivity', cost: 20.00, color: '#10A37F', desc: 'GPT-4 access' },
  { name: 'Midjourney', category: 'productivity', cost: 10.00, color: '#8B5CF6', desc: 'AI image generation' },
  { name: 'Audible', category: 'music', cost: 14.95, color: '#F59E0B', desc: 'Monthly audiobook credit' },
  { name: 'Kindle Unlimited', category: 'music', cost: 11.99, color: '#3B82F6', desc: 'E-book subscription' },
  { name: 'Paramount+', category: 'streaming', cost: 11.99, color: '#3B82F6', desc: 'Essential plan' },
  { name: 'Max', category: 'streaming', cost: 15.99, color: '#8B5CF6', desc: 'Ad-Free plan' },
];

// ─── Subscription generators ────────────────────────────────────────────────

export function generateEmailBasedSubscriptions(email: string): Subscription[] {
  const seed = hashString(email.toLowerCase().trim());
  const count = 6 + Math.floor(seededRandom(seed) * 9);
  const selected: Subscription[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < count; i++) {
    let idx = Math.floor(seededRandom(seed + i * 100) * possibleSubs.length);
    while (usedIndices.has(idx)) {
      idx = (idx + 1) % possibleSubs.length;
    }
    usedIndices.add(idx);
    const sub = possibleSubs[idx];
    const cycles: Array<'monthly' | 'yearly' | 'weekly' | 'quarterly'> = ['monthly', 'monthly', 'monthly', 'yearly', 'monthly'];
    const cycle = cycles[Math.floor(seededRandom(seed + i * 200) * cycles.length)];
    const statusRoll = seededRandom(seed + i * 300);
    const status: Subscription['status'] = statusRoll > 0.85 ? 'cancelled' : statusRoll > 0.7 ? 'paused' : 'active';
    const daysOffset = Math.floor(seededRandom(seed + i * 400) * 30) - 5;

    selected.push({
      id: `sub-${i}`,
      name: sub.name,
      category: sub.category,
      cost: sub.cost,
      billingCycle: cycle,
      nextBillingDate: addDays(daysOffset),
      status,
      color: sub.color,
      description: sub.desc,
      createdAt: addMonths(-Math.floor(seededRandom(seed + i * 500) * 12) - 1),
    });
  }

  return selected;
}

export function generateActivities(email: string, subs: Subscription[]): Activity[] {
  const seed = hashString(email.toLowerCase().trim());
  const activities: Activity[] = [];

  const types: Array<Activity['type']> = ['added', 'updated', 'paused', 'alert', 'saved'];
  const messages: Record<string, string[]> = {
    added: ['Added {name} subscription', 'Signed up for {name}', 'Started {name} trial'],
    updated: ['Updated {name} plan', 'Changed {name} billing cycle', 'Upgraded {name}'],
    paused: ['Paused {name} temporarily', 'Put {name} on hold', 'Suspended {name}'],
    alert: ['{name} billing in {days} days', '{name} price increase detected', '{name} renewal upcoming'],
    saved: ['Found savings on {name}', 'Detected unused {name} subscription', 'Paused {name} to save money'],
  };

  for (let i = 0; i < 8; i++) {
    const sub = subs[Math.floor(seededRandom(seed + i * 1000) * subs.length)];
    if (!sub) continue;
    const type = types[Math.floor(seededRandom(seed + i * 2000) * types.length)];
    const msgs = messages[type];
    const msg = msgs[Math.floor(seededRandom(seed + i * 3000) * msgs.length)]
      .replace('{name}', sub.name)
      .replace('{days}', String(Math.floor(seededRandom(seed + i * 4000) * 7) + 1));

    const date = new Date();
    date.setDate(date.getDate() - Math.floor(seededRandom(seed + i * 5000) * 30));

    activities.push({
      id: `act-${i}`,
      type,
      description: msg,
      date: date.toISOString(),
      amount: type === 'saved' ? Math.round(seededRandom(seed + i * 6000) * 100) : sub.cost,
      subscriptionName: sub.name,
    });
  }

  return activities;
}

export function generateInsights(email: string, subs: Subscription[]): Insight[] {
  const seed = hashString(email.toLowerCase().trim());
  const insights: Insight[] = [];

  const pausedOrCancelled = subs.filter((s) => s.status !== 'active');
  const totalMonthly = subs.filter((s) => s.status === 'active').reduce((sum, s) => {
    const monthly = s.billingCycle === 'yearly' ? s.cost / 12 : s.billingCycle === 'quarterly' ? s.cost / 3 : s.billingCycle === 'weekly' ? s.cost * 4.33 : s.cost;
    return sum + monthly;
  }, 0);

  insights.push({
    id: 'ins-1',
    type: 'trend',
    title: `Spending ${seededRandom(seed) > 0.5 ? 'up' : 'down'} ${Math.floor(seededRandom(seed + 1) * 20)}% this month`,
    description: `Your subscription spending has ${seededRandom(seed) > 0.5 ? 'increased' : 'decreased'} compared to last month. Review your active subscriptions to understand the change.`,
    actionable: false,
  });

  if (pausedOrCancelled.length > 0) {
    const saved = pausedOrCancelled.reduce((sum, s) => {
      const yearly = s.billingCycle === 'monthly' ? s.cost * 12 : s.billingCycle === 'weekly' ? s.cost * 52 : s.billingCycle === 'quarterly' ? s.cost * 4 : s.cost;
      return sum + yearly;
    }, 0);
    insights.push({
      id: 'ins-2',
      type: 'saving',
      title: `${pausedOrCancelled.length} subscription${pausedOrCancelled.length > 1 ? 's' : ''} managed`,
      description: `You've paused or cancelled ${pausedOrCancelled.length} subscription${pausedOrCancelled.length > 1 ? 's' : ''}, saving approximately ${Math.round(saved)} per year.`,
      amount: Math.round(saved),
      actionable: true,
    });
  }

  insights.push({
    id: 'ins-3',
    type: 'alert',
    title: 'Price increase detected',
    description: 'One of your streaming services has increased pricing. Review your subscriptions to see the impact on your budget.',
    actionable: true,
  });

  insights.push({
    id: 'ins-4',
    type: 'tip',
    title: `Switch to annual billing to save ~$${Math.floor(totalMonthly * 12 * 0.15)}`,
    description: 'Annual billing typically offers 15-20% savings compared to monthly plans across most services.',
    amount: Math.floor(totalMonthly * 12 * 0.15),
    actionable: true,
  });

  return insights;
}

// ─── Default fallback data ──────────────────────────────────────────────────

export const defaultSubscriptions: Subscription[] = [
  { id: '1', name: 'Netflix', category: 'streaming', cost: 15.49, billingCycle: 'monthly', nextBillingDate: addDays(5), status: 'active', color: '#E74C3C', description: 'Standard plan - HD streaming', createdAt: '2024-01-15' },
  { id: '2', name: 'Spotify', category: 'music', cost: 10.99, billingCycle: 'monthly', nextBillingDate: addDays(12), status: 'active', color: '#8B5CF6', description: 'Premium individual plan', createdAt: '2024-02-01' },
  { id: '3', name: 'Notion', category: 'productivity', cost: 8.00, billingCycle: 'monthly', nextBillingDate: addDays(18), status: 'active', color: '#3B82F6', description: 'Personal Pro plan', createdAt: '2024-03-10' },
  { id: '4', name: 'Apple Fitness+', category: 'fitness', cost: 9.99, billingCycle: 'monthly', nextBillingDate: addDays(22), status: 'active', color: '#0FA573', description: 'Monthly fitness subscription', createdAt: '2024-04-05' },
  { id: '5', name: 'iCloud+', category: 'cloud', cost: 2.99, billingCycle: 'monthly', nextBillingDate: addDays(8), status: 'active', color: '#06B6D4', description: '200GB storage plan', createdAt: '2024-01-20' },
  { id: '6', name: 'Xbox Game Pass', category: 'gaming', cost: 16.99, billingCycle: 'monthly', nextBillingDate: addDays(28), status: 'active', color: '#EC4899', description: 'Ultimate subscription', createdAt: '2024-05-01' },
  { id: '7', name: 'The New York Times', category: 'news', cost: 17.00, billingCycle: 'monthly', nextBillingDate: addDays(14), status: 'paused', color: '#F59E0B', description: 'Digital subscription', createdAt: '2024-06-15' },
  { id: '8', name: 'Adobe Creative Cloud', category: 'productivity', cost: 54.99, billingCycle: 'monthly', nextBillingDate: addDays(3), status: 'active', color: '#E67E3C', description: 'All Apps plan', createdAt: '2024-02-20' },
  { id: '9', name: 'Dropbox', category: 'cloud', cost: 11.99, billingCycle: 'monthly', nextBillingDate: addDays(19), status: 'active', color: '#3B82F6', description: 'Plus plan - 2TB', createdAt: '2024-03-25' },
  { id: '10', name: 'Peloton', category: 'fitness', cost: 44.00, billingCycle: 'monthly', nextBillingDate: addDays(25), status: 'cancelled', color: '#E74C3C', description: 'All-Access Membership', createdAt: '2024-07-01' },
  { id: '11', name: 'YouTube Premium', category: 'streaming', cost: 13.99, billingCycle: 'monthly', nextBillingDate: addDays(10), status: 'active', color: '#E74C3C', description: 'Individual plan', createdAt: '2024-04-15' },
  { id: '12', name: 'Figma', category: 'productivity', cost: 12.00, billingCycle: 'monthly', nextBillingDate: addDays(16), status: 'active', color: '#EC4899', description: 'Professional plan', createdAt: '2024-05-20' },
];

export const defaultActivities: Activity[] = [
  { id: '1', type: 'alert', description: 'Netflix billing in 5 days', date: new Date().toISOString(), subscriptionName: 'Netflix' },
  { id: '2', type: 'saved', description: 'Paused NYT subscription', date: new Date(Date.now() - 86400000 * 2).toISOString(), amount: 17.00, subscriptionName: 'The New York Times' },
  { id: '3', type: 'added', description: 'Added Figma subscription', date: new Date(Date.now() - 86400000 * 5).toISOString(), amount: 12.00, subscriptionName: 'Figma' },
  { id: '4', type: 'alert', description: 'Adobe Creative Cloud price increased', date: new Date(Date.now() - 86400000 * 7).toISOString(), subscriptionName: 'Adobe Creative Cloud' },
  { id: '5', type: 'cancelled', description: 'Cancelled Peloton membership', date: new Date(Date.now() - 86400000 * 10).toISOString(), amount: 44.00, subscriptionName: 'Peloton' },
  { id: '6', type: 'updated', description: 'Updated iCloud storage plan', date: new Date(Date.now() - 86400000 * 14).toISOString(), subscriptionName: 'iCloud+' },
];

export const defaultInsights: Insight[] = [
  { id: '1', type: 'saving', title: 'Unused subscription detected', description: 'You haven\'t used Peloton in 3 months. Consider cancelling to save $528/year.', amount: 528, actionable: true },
  { id: '2', type: 'alert', title: 'Price increase incoming', description: 'Adobe Creative Cloud will increase by $5/month starting next billing cycle.', amount: 60, actionable: true },
  { id: '3', type: 'trend', title: 'Spending up 12% this month', description: 'Your subscription spending increased compared to last month. Review your active subscriptions.', actionable: false },
  { id: '4', type: 'tip', title: 'Annual billing could save you $89', description: 'Switch Netflix, Spotify, and Notion to annual billing for significant savings.', amount: 89, actionable: true },
];