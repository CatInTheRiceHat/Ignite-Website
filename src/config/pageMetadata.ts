import { RECORDS_PAGE } from './records';
import { courseCounts, programCopy } from '../data/program';

export const defaultMetadata = {
  title: 'Ignite - Practical Life Skills for Students',
  description: 'Student pre-enrollment is open for Ignite’s free live and independent courses in practical life skills. Apply now and explore the course plans.',
};

export const pageMetadata: Record<string, { title: string; description: string }> = {
  '/': defaultMetadata,
  '/about': { title: 'About | Ignite', description: `Meet the student-led initiative building free practical life skills learning. ${programCopy.expansion}` },
  '/program': { title: 'Program | Ignite', description: `Explore ${courseCounts.all} courses in development: ${courseCounts.live} live and ${courseCounts.independent} independent. Student pre-enrollment is open; launch dates and class schedules are being planned.` },
  '/demo/boundaries': { title: 'What Are Boundaries? · Try a Sample Week | Ignite', description: 'Explore a complete week from Ignite’s Relationships, Boundaries & Social Skills course through lessons, a fictional case study and practice with feedback. Allow about 4½ hours, with no account needed.' },
  '/faq': { title: 'Program FAQ | Ignite', description: 'Learn about Ignite’s planned live and independent formats, estimated time commitments, development status, and learning opportunities for all students.' },
  '/partnerships': { title: 'Partnerships | Ignite', description: 'Bring practical learning to your community. Explore ways to partner with Ignite on free practical life skills learning and start a partnership conversation.' },
  '/sponsors': { title: 'Sponsors · From a Spark to the Stars | Ignite', description: 'Explore Ignite’s five sponsorship tiers, from Ember to Nova. Help a little spark become a brighter future through free practical learning.' },
  [RECORDS_PAGE.path]: { title: RECORDS_PAGE.metaTitle, description: RECORDS_PAGE.metaDescription },
};
