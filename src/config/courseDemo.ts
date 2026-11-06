import { developmentCourses } from '../data/program';

// Add reviewed samples here, then change featuredCourse to choose the homepage
// feature. Each sample keeps its own URL and progress when the feature changes.
const boundariesCourse = developmentCourses.find(course => course.title === 'Relationships, Boundaries & Social Skills');
if (!boundariesCourse) throw new Error('The boundaries sample needs its course catalog entry.');

export const courseSamples = {
  boundaries: {
    path: '/demo/boundaries',
    course: boundariesCourse,
    weekNumber: 1,
    weekTitle: 'What are boundaries?',
    workload: 'About 4½ hours',
    summary: 'Explore how boundaries can protect your time, privacy and belongings, and practice responding when someone crosses a limit.',
  },
} as const;

export const featuredCourse = courseSamples.boundaries;
export const DEMO_PATH = courseSamples.boundaries.path;
