import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { courseCounts, developmentCourses, programCopy } from '../../src/data/program';
import { teamMembers } from '../../src/data/mentors';
import { LEARNING_HUB_URL, INTERN_FORM_URL } from '../../src/lib/links';
import { RECORDS_PAGE } from '../../src/config/records';
import { destinations, resolveDestination } from '../../src/sol/shared/destinations';
import { knowledge, relevantKnowledge } from '../../server/sol/knowledge';

it.each([
  'Who are the cofounders?', 'Who are the co-founders?', 'Who are the co founders?',
  'Who are the co‑founders?', 'Who founded Ignite?', 'Who started Ignite?',
  'Who is the CEO?', 'Who is the CTO?',
])('retrieves the website cofounders for "%s"', question => {
  const founders = relevantKnowledge(question).find(entry => entry.id === 'founders');
  expect(founders).toBeDefined();
  expect(founders!.source).toContain('src/data/mentors.ts');
  expect(founders!.destinationIds).toContain('team');
  for (const name of ['Elaine Che', 'Austin Zhao', 'Michael Zhao']) expect(founders!.facts).toContain(name);
  for (const member of teamMembers.filter(member => member.role.startsWith('Co-founder'))) {
    expect(founders!.facts).toContain(`${member.name} (${member.role})`);
  }
});

it('answers named-person questions from the website profiles and preserves former staff status', () => {
  for (const member of teamMembers) {
    const team = relevantKnowledge(`Who is ${member.name}?`).find(entry => entry.id === 'team');
    expect(team?.facts).toContain(`${member.name}: ${member.role}`);
    for (const course of member.courses || []) expect(team?.facts).toContain(course);
    if (member.school) expect(team?.facts).toContain(member.school);
  }
  const team = relevantKnowledge('Who are the former staff?').find(entry => entry.id === 'team')!;
  const former = team.facts.split('Former staff profiles:')[1];
  expect(former).toContain('Julie Ye: Former Staff');
  expect(former).not.toContain('Elaine Che');
});

it('prioritizes the new founder question over earlier course questions while retaining follow-up context', () => {
  const selected = relevantKnowledge('Who are the cofounders?', [
    'Tell me about ai, research, design, communication, productivity, project, financial, python, scratch and career courses.',
  ]);
  expect(selected[0].id).toBe('founders');
  expect(selected.length).toBeLessThanOrEqual(5);
  expect(relevantKnowledge('What are their roles?', ['Who are the cofounders?']).map(entry => entry.id)).toContain('founders');
});

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
