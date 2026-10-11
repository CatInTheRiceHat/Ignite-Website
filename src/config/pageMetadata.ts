import { RECORDS_PAGE } from './records';
import { courseCounts, programCopy } from '../data/program';

export const defaultMetadata = {
  title: 'Ignite - Practical Life Skills for Students',
  description: 'Ignite is developing free live and independent courses in practical life skills. Explore the course plans and Summer 2026 results.',
};

export const pageMetadata: Record<string, { title: string; description: string }> = {
  '/': defaultMetadata,
  '/about': { title: 'About | Ignite', description: `Meet the student-led initiative building free practical life skills learning. ${programCopy.expansion}` },
  '/program': { title: 'Program | Ignite', description: `Explore ${courseCounts.all} courses in development: ${courseCounts.live} live and ${courseCounts.independent} independent. Course formats are planned; enrollment and launch dates are unconfirmed.` },
  '/faq': { title: 'Program FAQ | Ignite', description: 'Learn about Ignite’s planned live and independent formats, estimated time commitments, development status, and eligibility still to be confirmed.' },
  '/apply': { title: 'Student Enrollment | Ignite', description: programCopy.availability },
  '/statistics': { title: 'Summer 2026 Results | Ignite', description: 'Explore Ignite’s historical Summer 2026 program results.' },
  [RECORDS_PAGE.path]: { title: RECORDS_PAGE.metaTitle, description: RECORDS_PAGE.metaDescription },
};
