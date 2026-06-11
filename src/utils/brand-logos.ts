/**
 * Brand logo resolution for subscription services.
 *
 * Uses Simple Icons CDN (https://simpleicons.org) which provides free,
 * open-source SVG icons for hundreds of brands. The CDN is served via
 * jsDelivr — no API key needed.
 *
 * Fallback: if a brand isn't in the map, the component renders a letter.
 */

const BRAND_LOGOS: Record<string, string> = {
  // Streaming
  'Netflix': 'https://cdn.simpleicons.org/netflix',
  'Disney+': 'https://cdn.simpleicons.org/disneyplus',
  'Hulu': 'https://cdn.simpleicons.org/hulu',
  'HBO Max': 'https://cdn.simpleicons.org/hbomax',
  'Paramount+': 'https://cdn.simpleicons.org/paramountplus',
  'Apple TV+': 'https://cdn.simpleicons.org/appletv',
  'Amazon Prime Video': 'https://cdn.simpleicons.org/amazonprimevideo',
  'YouTube Premium': 'https://cdn.simpleicons.org/youtube',
  'Crunchyroll': 'https://cdn.simpleicons.org/crunchyroll',

  // Music
  'Spotify': 'https://cdn.simpleicons.org/spotify',
  'Spotify Duo': 'https://cdn.simpleicons.org/spotify',
  'Spotify Family': 'https://cdn.simpleicons.org/spotify',
  'Apple Music': 'https://cdn.simpleicons.org/applemusic',
  'Apple Music Family': 'https://cdn.simpleicons.org/applemusic',
  'Tidal': 'https://cdn.simpleicons.org/tidal',
  'Deezer': 'https://cdn.simpleicons.org/deezer',
  'Pandora': 'https://cdn.simpleicons.org/pandora',
  'Audible': 'https://cdn.simpleicons.org/audible',
  'Kindle Unlimited': 'https://cdn.simpleicons.org/amazonkindle',

  // Cloud & Storage
  'iCloud+ 50GB': 'https://cdn.simpleicons.org/icloud',
  'iCloud+ 200GB': 'https://cdn.simpleicons.org/icloud',
  'iCloud+ 2TB': 'https://cdn.simpleicons.org/icloud',
  'Google One 100GB': 'https://cdn.simpleicons.org/googleone',
  'Google One 200GB': 'https://cdn.simpleicons.org/googleone',
  'Google One 2TB': 'https://cdn.simpleicons.org/googleone',
  'Dropbox Plus': 'https://cdn.simpleicons.org/dropbox',
  'Dropbox Family': 'https://cdn.simpleicons.org/dropbox',
  'OneDrive 100GB': 'https://cdn.simpleicons.org/onedrive',
  'OneDrive Family': 'https://cdn.simpleicons.org/onedrive',

  // Productivity
  'Notion': 'https://cdn.simpleicons.org/notion',
  'Notion Team': 'https://cdn.simpleicons.org/notion',
  'Notion Plus': 'https://cdn.simpleicons.org/notion',
  'Figma': 'https://cdn.simpleicons.org/figma',
  'Figma Team': 'https://cdn.simpleicons.org/figma',
  'Adobe Creative Cloud': 'https://cdn.simpleicons.org/adobe',
  'Adobe Lightroom': 'https://cdn.simpleicons.org/adobelightroom',
  'LinkedIn Premium': 'https://cdn.simpleicons.org/linkedin',
  'GitHub Copilot': 'https://cdn.simpleicons.org/github',
  'ChatGPT Plus': 'https://cdn.simpleicons.org/openai',
  'ChatGPT Pro': 'https://cdn.simpleicons.org/openai',
  'Midjourney': 'https://cdn.simpleicons.org/midjourney',
  'Microsoft 365': 'https://cdn.simpleicons.org/microsoft',
  'Microsoft 365 Family': 'https://cdn.simpleicons.org/microsoft',
  'Todoist Pro': 'https://cdn.simpleicons.org/todoist',

  // Gaming
  'Xbox Game Pass': 'https://cdn.simpleicons.org/xbox',
  'Xbox Game Pass Ultimate': 'https://cdn.simpleicons.org/xbox',
  'PlayStation Plus': 'https://cdn.simpleicons.org/playstation',
  'PlayStation Plus Extra': 'https://cdn.simpleicons.org/playstation',
  'PlayStation Plus Premium': 'https://cdn.simpleicons.org/playstation',
  'Nintendo Switch Online': 'https://cdn.simpleicons.org/nintendoswitch',
  'Nintendo Switch Online + Exp Pack': 'https://cdn.simpleicons.org/nintendoswitch',
  'Apple Arcade': 'https://cdn.simpleicons.org/applearcade',

  // Fitness
  'Peloton': 'https://cdn.simpleicons.org/peloton',
  'Peloton App': 'https://cdn.simpleicons.org/peloton',
  'Apple Fitness+': 'https://cdn.simpleicons.org/applefitness',
  'Calm': 'https://cdn.simpleicons.org/calm',
  'Headspace': 'https://cdn.simpleicons.org/headspace',
  'Strava': 'https://cdn.simpleicons.org/strava',
  'MyFitnessPal': 'https://cdn.simpleicons.org/myfitnesspal',

  // Shopping
  'Amazon Prime': 'https://cdn.simpleicons.org/amazon',
  'Amazon Prime Yearly': 'https://cdn.simpleicons.org/amazon',
  'DoorDash DashPass': 'https://cdn.simpleicons.org/doordash',
  'Uber One': 'https://cdn.simpleicons.org/uber',
  'Walmart+': 'https://cdn.simpleicons.org/walmart',
  'Instacart+': 'https://cdn.simpleicons.org/instacart',

  // News
  'The New York Times': 'https://cdn.simpleicons.org/nytimes',
  'Washington Post': 'https://cdn.simpleicons.org/washingtonpost',
  'Wall Street Journal': 'https://cdn.simpleicons.org/wallstreetjournal',
  'Medium': 'https://cdn.simpleicons.org/medium',
  'Substack Pro': 'https://cdn.simpleicons.org/substack',
};

/**
 * Returns the brand logo URL for a given subscription name, or undefined
 * if no logo is available (the caller should fall back to a letter).
 */
export function getBrandLogo(name: string): string | undefined {
  return BRAND_LOGOS[name];
}