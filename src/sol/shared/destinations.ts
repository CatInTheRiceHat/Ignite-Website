// Public destinations verified against Ignite-Website at the revision in knowledge.ts.
export const destinations = {
  about: { label: 'About Ignite', path: '/about', source: 'src/pages/About.tsx' },
  team: { label: 'Meet the team', path: '/team', source: 'src/pages/Mentors.tsx' },
  program: { label: 'Explore the program', path: '/program', source: 'src/pages/Program.tsx' },
  faq: { label: 'Read FAQs', path: '/faq', source: 'src/pages/FAQ.tsx' },
  statistics: { label: 'See summer statistics', path: '/statistics', source: 'src/pages/Statistics.tsx' },
  hiring: { label: 'Join the team', path: '/hiring', source: 'src/pages/Hiring.tsx' },
  records: { label: 'Explore records & student work', path: '/records', source: 'src/config/records.ts' },
  learning: { label: 'Learning Hub (Moodle sign-in)', url: 'https://learn.ignitefindyourfire.org', source: 'src/lib/links.ts' },
  intern: { label: 'Intern application', url: 'https://forms.gle/wV8e5edRNVNpUJvt7', source: 'src/lib/links.ts' },
  contact: { label: 'Email Ignite', url: 'mailto:ignitefindyourfire@gmail.com', source: 'src/pages/FAQ.tsx' },
} as const;

export type DestinationId = keyof typeof destinations;
export const destinationIds = Object.keys(destinations) as DestinationId[];
export const quickActions: DestinationId[] = ['program', 'hiring', 'about', 'faq'];
export const DEFAULT_WEBSITE_URL = 'https://ignitefindyourfire.org';

export function isDestinationId(value: unknown): value is DestinationId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(destinations, value);
}

export function safeHttpUrl(value: string): string {
  const url = new URL(value);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password) {
    throw new Error('Use HTTPS, or HTTP on localhost.');
  }
  return url.href;
}

export function resolveDestination(id: unknown, websiteBaseUrl: string) {
  if (!isDestinationId(id)) throw new Error('Unknown destination.');
  const destination = destinations[id];
  return {
    id,
    label: destination.label,
    url: 'path' in destination ? new URL(destination.path, safeHttpUrl(websiteBaseUrl)).href : destination.url,
  };
}
