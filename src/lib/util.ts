import type { CollectionEntry } from 'astro:content';

// Prefix an internal path with the configured base (needed on GitHub Pages project repos).
export const url = (path: string) => (import.meta.env.BASE_URL.replace(/\/$/, '') + path) || '/';

// Always three-letter months ("Sep", not en-GB's "Sept").
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const fmtMonth = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

export const fmtDay = (d: Date) => `${d.getUTCDate()} ${fmtMonth(d)}`;

export const TOPIC_TAGS: Record<string, string> = {
  kinematics: '#kinematics',
  navigation: '#navigation',
  slam: '#SLAM',
  'computer-vision': '#computer-vision',
  'motion-planning': '#motion-planning',
  controls: '#controls',
  'ai-ml': '#AI-ML',
};

export const hashtags = (topics: string[]) => topics.map((t) => TOPIC_TAGS[t]).join(' ');

// A project gets its own page once it's written up and not just planned.
export const hasPage = (p: CollectionEntry<'projects'>) => !p.data.draft && p.data.status !== 'planned';
