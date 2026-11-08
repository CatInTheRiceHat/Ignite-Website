import { RECORDS_PAGE } from './records';
import { DEMO_PATH } from './courseDemo';
import { courseCounts, programCopy } from '../data/program';

export const defaultMetadata = {
  title: 'Ignite Education',
  description: 'Ignite Education is a student-led team building free courses in practical life skills. Explore our course plans and pre-enroll.',
};

export const notFoundMetadata = {
  title: 'Page Not Found | Ignite Education',
  description: 'This page could not be found. Head back to Ignite to explore our free courses, team, and ways to get involved.',
};

const confirmationMetadata = {
  title: 'Confirmation | Ignite Education',
  description: 'Thank you for pre-enrolling with Ignite. Find out what happens next and explore our free courses in practical life skills.',
};

export const pageMetadata: Record<string, { title: string; description: string }> = {
  '/': defaultMetadata,
  '/about': { title: 'About | Ignite Education', description: `Meet the student-led initiative building free practical life skills learning. ${programCopy.expansion}` },
  '/team': { title: 'Team | Ignite Education', description: 'Meet the students, co-founders, directors, and interns building Ignite Education’s free practical life skills courses.' },
  '/program': { title: 'Program | Ignite Education', description: `Explore ${courseCounts.all} courses in development: ${courseCounts.live} live and ${courseCounts.independent} independent. Student pre-enrollment is open; launch dates and class schedules are being planned.` },
  [DEMO_PATH]: { title: 'Course Demo | Ignite Education', description: 'Explore a complete week from Ignite Education’s Relationships, Boundaries & Social Skills course through lessons, a fictional case study and practice with feedback. Allow about 4½ hours, with no account needed.' },
  '/faq': { title: 'FAQ | Ignite Education', description: 'Learn about Ignite Education’s planned live and independent formats, estimated time commitments, development status, and learning opportunities for all students.' },
  '/hiring': { title: 'Hiring | Ignite Education', description: 'Explore Ignite Education’s student internship roles and apply to help build free practical life skills courses.' },
  '/partnerships': { title: 'Partnerships | Ignite Education', description: 'Bring practical learning to your community. Explore ways to partner with Ignite Education on free practical life skills learning and start a partnership conversation.' },
  '/sponsors': { title: 'Sponsors | Ignite Education', description: 'Explore Ignite Education’s five sponsorship tiers, from Ember to Nova. Support our student team as we build free courses in practical life skills.' },
  '/confirmation': confirmationMetadata,
  '/thank-you': confirmationMetadata,
  [RECORDS_PAGE.path]: { title: RECORDS_PAGE.metaTitle, description: RECORDS_PAGE.metaDescription },
};
