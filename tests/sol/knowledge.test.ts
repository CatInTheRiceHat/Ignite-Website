import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { courseCounts, developmentCourses, programCopy } from '../../src/data/program';
import { LEARNING_HUB_URL, INTERN_FORM_URL } from '../../src/lib/links';
import { RECORDS_PAGE } from '../../src/config/records';
import { destinations, resolveDestination } from '../../src/sol/shared/destinations';
import { knowledge } from '../../server/sol/knowledge';

it('uses the current developing catalog without turning plans into enrollment promises', () => {
  const courses = knowledge.find(entry => entry.id === 'courses')!.facts;
  expect(courses).toContain(`${courseCounts.all} courses in development`);
  for (const course of developmentCourses) expect(courses).toContain(course.title);
  expect(courses).toContain(programCopy.availability);
  const enrollment = knowledge.find(entry => entry.id === 'student-faq')!.facts;
  expect(enrollment).toContain('No current student application link');
  expect(enrollment).toContain(programCopy.eligibility);
  expect(() => resolveDestination('apply', 'https://ignitefindyourfire.org')).toThrow();
});

it('keeps navigation aligned with public routes and verified links', () => {
  const routes = readFileSync('src/App.tsx', 'utf8');
  for (const [id, destination] of Object.entries(destinations)) {
    if ('path' in destination) {
      expect(id === 'records' ? RECORDS_PAGE.path : routes).toContain(destination.path);
    }
  }
  expect(destinations.learning.url).toBe(LEARNING_HUB_URL);
  expect(destinations.intern.url).toBe(INTERN_FORM_URL);
  const help = knowledge.find(entry => entry.id === 'help')!;
  expect(help.destinationIds).toContain('learning');
  expect(help.facts).toContain('cannot access Moodle accounts, lessons, grades or student information');
});
