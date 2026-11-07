import { RECORDS_PAGE } from './records';
import { courseCounts, programCopy } from '../data/program';

export const defaultMetadata = {
  title: 'Home | Ignite',
  description: 'Student pre-enrollment is open for Ignite’s free live and independent courses in practical life skills. Apply now and explore the course plans.',
};

export const notFoundMetadata = {
  title: 'Page Not Found | Ignite',
  description: 'This page could not be found. Head back to Ignite to explore our free courses, team, and ways to get involved.',
};

export const pageMetadata: Record<string, { title: string; description: string }> = {
  '/': defaultMetadata,
  '/about': { title: 'About | Ignite', description: `Meet the student-led initiative building free practical life skills learning. ${programCopy.expansion}` },
  '/team': { title: 'Team | Ignite', description: 'Meet the students, co-founders, directors, and interns building Ignite’s free practical life skills courses.' },
  '/program': { title: 'Program | Ignite', description: `Explore ${courseCounts.all} courses in development: ${courseCounts.live} live and ${courseCounts.independent} independent. Student pre-enrollment is open; launch dates and class schedules are being planned.` },
  '/demo/boundaries': { title: 'Course Demo | Ignite', description: 'Explore a complete week from Ignite’s Relationships, Boundaries & Social Skills course through lessons, a fictional case study and practice with feedback. Allow about 4½ hours, with no account needed.' },
  '/faq': { title: 'FAQ | Ignite', description: 'Learn about Ignite’s planned live and independent formats, estimated time commitments, development status, and learning opportunities for all students.' },
  '/hiring': { title: 'Hiring | Ignite', description: 'Explore Ignite’s student internship roles and apply to help build free practical life skills courses.' },
  '/partnerships': { title: 'Partnerships | Ignite', description: 'Bring practical learning to your community. Explore ways to partner with Ignite on free practical life skills learning and start a partnership conversation.' },
  '/sponsors': { title: 'Sponsors | Ignite', description: 'Explore Ignite’s five sponsorship tiers, from Ember to Nova. Support our student team as we build free courses in practical life skills.' },
  [RECORDS_PAGE.path]: { title: RECORDS_PAGE.metaTitle, description: RECORDS_PAGE.metaDescription },
};
