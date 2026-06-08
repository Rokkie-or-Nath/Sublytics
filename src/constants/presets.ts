import type { BillingCycle } from '../types';

export interface PresetSubscription {
  name: string;
  category: string;
  cost: number;
  billingCycle: BillingCycle;
  color: string;
  description: string;
}

export const PRESET_SUBSCRIPTIONS: PresetSubscription[] = [
  // ─── Streaming ────────────────────────────────────────────────────────────
  { name: 'Netflix', category: 'streaming', cost: 15.49, billingCycle: 'monthly', color: '#E74C3C', description: 'Standard plan - HD streaming' },
  { name: 'Netflix Premium', category: 'streaming', cost: 22.99, billingCycle: 'monthly', color: '#E74C3C', description: 'Premium plan - 4K + HDR' },
  { name: 'Disney+', category: 'streaming', cost: 13.99, billingCycle: 'monthly', color: '#3B82F6', description: 'Premium plan' },
  { name: 'Hulu', category: 'streaming', cost: 14.99, billingCycle: 'monthly', color: '#14B8A6', description: 'No Ads plan' },
  { name: 'HBO Max', category: 'streaming', cost: 15.99, billingCycle: 'monthly', color: '#8B5CF6', description: 'Ad-Free plan' },
  { name: 'Paramount+', category: 'streaming', cost: 11.99, billingCycle: 'monthly', color: '#3B82F6', description: 'Essential plan' },
  { name: 'Apple TV+', category: 'streaming', cost: 9.99, billingCycle: 'monthly', color: '#6B7B8F', description: 'Individual plan' },
  { name: 'Amazon Prime Video', category: 'streaming', cost: 8.99, billingCycle: 'monthly', color: '#F59E0B', description: 'Video only' },
  { name: 'YouTube Premium', category: 'streaming', cost: 13.99, billingCycle: 'monthly', color: '#E74C3C', description: 'Individual plan' },
  { name: 'Crunchyroll', category: 'streaming', cost: 7.99, billingCycle: 'monthly', color: '#F59E0B', description: 'Fan plan' },

  // ─── Music ────────────────────────────────────────────────────────────────
  { name: 'Spotify', category: 'music', cost: 10.99, billingCycle: 'monthly', color: '#8B5CF6', description: 'Premium individual' },
  { name: 'Spotify Duo', category: 'music', cost: 14.99, billingCycle: 'monthly', color: '#8B5CF6', description: 'Duo plan' },
  { name: 'Spotify Family', category: 'music', cost: 17.99, billingCycle: 'monthly', color: '#8B5CF6', description: 'Family plan' },
  { name: 'Apple Music', category: 'music', cost: 10.99, billingCycle: 'monthly', color: '#F43F5E', description: 'Individual plan' },
  { name: 'Apple Music Family', category: 'music', cost: 16.99, billingCycle: 'monthly', color: '#F43F5E', description: 'Family plan' },
  { name: 'Tidal', category: 'music', cost: 10.99, billingCycle: 'monthly', color: '#06B6D4', description: 'HiFi plan' },
  { name: 'Deezer', category: 'music', cost: 10.99, billingCycle: 'monthly', color: '#06B6D4', description: 'Premium plan' },
  { name: 'Pandora', category: 'music', cost: 4.99, billingCycle: 'monthly', color: '#3B82F6', description: 'Plus plan' },
  { name: 'Audible', category: 'music', cost: 14.95, billingCycle: 'monthly', color: '#F59E0B', description: 'Monthly audiobook credit' },
  { name: 'Kindle Unlimited', category: 'music', cost: 11.99, billingCycle: 'monthly', color: '#3B82F6', description: 'E-book subscription' },

  // ─── Cloud & Storage ──────────────────────────────────────────────────────
  { name: 'iCloud+ 50GB', category: 'cloud', cost: 0.99, billingCycle: 'monthly', color: '#06B6D4', description: '50GB storage' },
  { name: 'iCloud+ 200GB', category: 'cloud', cost: 2.99, billingCycle: 'monthly', color: '#06B6D4', description: '200GB storage' },
  { name: 'iCloud+ 2TB', category: 'cloud', cost: 9.99, billingCycle: 'monthly', color: '#06B6D4', description: '2TB storage' },
  { name: 'Google One 100GB', category: 'cloud', cost: 1.99, billingCycle: 'monthly', color: '#3B82F6', description: '100GB storage' },
  { name: 'Google One 200GB', category: 'cloud', cost: 2.99, billingCycle: 'monthly', color: '#3B82F6', description: '200GB storage' },
  { name: 'Google One 2TB', category: 'cloud', cost: 9.99, billingCycle: 'monthly', color: '#3B82F6', description: '2TB storage' },
  { name: 'Dropbox Plus', category: 'cloud', cost: 11.99, billingCycle: 'monthly', color: '#3B82F6', description: 'Plus plan - 2TB' },
  { name: 'Dropbox Family', category: 'cloud', cost: 19.99, billingCycle: 'monthly', color: '#3B82F6', description: 'Family plan' },
  { name: 'OneDrive 100GB', category: 'cloud', cost: 1.99, billingCycle: 'monthly', color: '#3B82F6', description: '100GB storage' },
  { name: 'OneDrive Family', category: 'cloud', cost: 9.99, billingCycle: 'monthly', color: '#3B82F6', description: 'Family plan' },

  // ─── Productivity ─────────────────────────────────────────────────────────
  { name: 'Notion', category: 'productivity', cost: 8.00, billingCycle: 'monthly', color: '#3B82F6', description: 'Personal Pro plan' },
  { name: 'Notion Team', category: 'productivity', cost: 12.00, billingCycle: 'monthly', color: '#3B82F6', description: 'Team plan' },
  { name: 'Notion Plus', category: 'productivity', cost: 10.00, billingCycle: 'monthly', color: '#3B82F6', description: 'Plus plan' },
  { name: 'Figma', category: 'productivity', cost: 12.00, billingCycle: 'monthly', color: '#EC4899', description: 'Professional plan' },
  { name: 'Figma Team', category: 'productivity', cost: 15.00, billingCycle: 'monthly', color: '#EC4899', description: 'Team plan' },
  { name: 'Adobe Creative Cloud', category: 'productivity', cost: 54.99, billingCycle: 'monthly', color: '#E67E3C', description: 'All Apps plan' },
  { name: 'Adobe Lightroom', category: 'productivity', cost: 9.99, billingCycle: 'monthly', color: '#E67E3C', description: 'Photography plan' },
  { name: 'LinkedIn Premium', category: 'productivity', cost: 29.99, billingCycle: 'monthly', color: '#3B82F6', description: 'Career subscription' },
  { name: 'GitHub Copilot', category: 'productivity', cost: 10.00, billingCycle: 'monthly', color: '#6B7B8F', description: 'AI coding assistant' },
  { name: 'ChatGPT Plus', category: 'productivity', cost: 20.00, billingCycle: 'monthly', color: '#10A37F', description: 'GPT-4 access' },
  { name: 'ChatGPT Pro', category: 'productivity', cost: 200.00, billingCycle: 'monthly', color: '#10A37F', description: 'Unlimited GPT-4' },
  { name: 'Midjourney', category: 'productivity', cost: 10.00, billingCycle: 'monthly', color: '#8B5CF6', description: 'AI image generation' },
  { name: 'Microsoft 365', category: 'productivity', cost: 6.99, billingCycle: 'monthly', color: '#E67E3C', description: 'Personal plan' },
  { name: 'Microsoft 365 Family', category: 'productivity', cost: 9.99, billingCycle: 'monthly', color: '#E67E3C', description: 'Family plan' },
  { name: 'Todoist Pro', category: 'productivity', cost: 5.00, billingCycle: 'monthly', color: '#E74C3C', description: 'Pro plan' },

  // ─── Gaming ───────────────────────────────────────────────────────────────
  { name: 'Xbox Game Pass', category: 'gaming', cost: 9.99, billingCycle: 'monthly', color: '#EC4899', description: 'Core subscription' },
  { name: 'Xbox Game Pass Ultimate', category: 'gaming', cost: 16.99, billingCycle: 'monthly', color: '#EC4899', description: 'Ultimate subscription' },
  { name: 'PlayStation Plus', category: 'gaming', cost: 9.99, billingCycle: 'monthly', color: '#3B82F6', description: 'Essential tier' },
  { name: 'PlayStation Plus Extra', category: 'gaming', cost: 14.99, billingCycle: 'monthly', color: '#3B82F6', description: 'Extra tier' },
  { name: 'PlayStation Plus Premium', category: 'gaming', cost: 17.99, billingCycle: 'monthly', color: '#3B82F6', description: 'Premium tier' },
  { name: 'Nintendo Switch Online', category: 'gaming', cost: 3.99, billingCycle: 'monthly', color: '#E74C3C', description: 'Individual plan' },
  { name: 'Nintendo Switch Online + Exp Pack', category: 'gaming', cost: 6.99, billingCycle: 'monthly', color: '#E74C3C', description: 'Expansion pack' },
  { name: 'Apple Arcade', category: 'gaming', cost: 4.99, billingCycle: 'monthly', color: '#F43F5E', description: 'Unlimited games' },

  // ─── Fitness ──────────────────────────────────────────────────────────────
  { name: 'Peloton', category: 'fitness', cost: 44.00, billingCycle: 'monthly', color: '#E74C3C', description: 'All-Access Membership' },
  { name: 'Peloton App', category: 'fitness', cost: 12.99, billingCycle: 'monthly', color: '#E74C3C', description: 'App membership' },
  { name: 'Apple Fitness+', category: 'fitness', cost: 9.99, billingCycle: 'monthly', color: '#0FA573', description: 'Monthly fitness subscription' },
  { name: 'Calm', category: 'fitness', cost: 14.99, billingCycle: 'monthly', color: '#8B5CF6', description: 'Premium meditation' },
  { name: 'Headspace', category: 'fitness', cost: 12.99, billingCycle: 'monthly', color: '#F59E0B', description: 'Meditation app' },
  { name: 'Strava', category: 'fitness', cost: 5.00, billingCycle: 'monthly', color: '#F59E0B', description: 'Summit plan' },
  { name: 'MyFitnessPal', category: 'fitness', cost: 9.99, billingCycle: 'monthly', color: '#3B82F6', description: 'Premium plan' },

  // ─── Shopping ─────────────────────────────────────────────────────────────
  { name: 'Amazon Prime', category: 'shopping', cost: 14.99, billingCycle: 'monthly', color: '#F59E0B', description: 'Monthly membership' },
  { name: 'Amazon Prime Yearly', category: 'shopping', cost: 139.00, billingCycle: 'yearly', color: '#F59E0B', description: 'Yearly membership' },
  { name: 'DoorDash DashPass', category: 'shopping', cost: 9.99, billingCycle: 'monthly', color: '#E74C3C', description: 'Monthly delivery pass' },
  { name: 'Uber One', category: 'shopping', cost: 9.99, billingCycle: 'monthly', color: '#06B6D4', description: 'Delivery & rides' },
  { name: 'Walmart+', category: 'shopping', cost: 12.95, billingCycle: 'monthly', color: '#3B82F6', description: 'Delivery membership' },
  { name: 'Instacart+', category: 'shopping', cost: 9.99, billingCycle: 'monthly', color: '#0FA573', description: 'Grocery delivery' },

  // ─── News ─────────────────────────────────────────────────────────────────
  { name: 'The New York Times', category: 'news', cost: 17.00, billingCycle: 'monthly', color: '#F59E0B', description: 'Digital subscription' },
  { name: 'Washington Post', category: 'news', cost: 12.00, billingCycle: 'monthly', color: '#06B6D4', description: 'Digital access' },
  { name: 'Wall Street Journal', category: 'news', cost: 12.00, billingCycle: 'monthly', color: '#F59E0B', description: 'Digital subscription' },
  { name: 'Medium', category: 'news', cost: 5.00, billingCycle: 'monthly', color: '#06B6D4', description: 'Member plan' },
  { name: 'Substack Pro', category: 'news', cost: 5.00, billingCycle: 'monthly', color: '#6366F1', description: 'Reading subscription' },
];