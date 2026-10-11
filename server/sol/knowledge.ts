import type { DestinationId } from '../../src/sol/shared/destinations.js';
import { courseCounts, courseFormats, developmentCourses, programCopy } from '../../src/data/program.js';

export const knowledgeRevision = {
  repository: 'CatInTheRiceHat/Ignite-Website',
  commit: '4695804e4785f9e16074b0ddcaa04268d971238c',
  reviewed: '2026-10-11',
  routesSource: 'src/App.tsx',
  styleSource: 'IGNITE_STYLE_GUIDE.md',
};

type KnowledgeEntry = {
  id: string;
  destinationIds: DestinationId[];
  source: string;
  keywords: string[];
  facts: string;
};

// Curated public content only. Describe the published program; do not infer live availability.
export const knowledge: KnowledgeEntry[] = [
  {
    id: 'about', destinationIds: ['about'], source: 'src/pages/About.tsx; src/data/program.ts',
    keywords: ['about', 'ignite', 'mission', 'what', 'mentorship', 'free', 'cost', 'price'],
    facts: `Ignite is a student-led education initiative building free courses in practical life skills. Summer 2026 brought students and high school mentors together. Its mission emphasizes access, connection and practice. ${programCopy.direction} ${programCopy.expansion}`,
  },
  {
    id: 'format', destinationIds: ['program', 'faq'], source: 'src/pages/FAQ.tsx; src/data/program.ts',
    keywords: ['program', 'online', 'zoom', 'where', 'location', 'weeks', 'duration', 'schedule', 'summer', 'live', 'independent', 'asynchronous', 'synchronous', 'format', 'formats', 'time', 'commitment'],
    facts: `Both developing formats are planned online. Live: ${courseFormats.live.duration}; ${courseFormats.live.commitment} Independent: ${courseFormats.independent.duration}; ${courseFormats.independent.commitment} Both draft formats build toward a final project, with practice, feedback and revision. ${programCopy.availability} The three-week Summer 2026 program is historical, not an upcoming schedule.`,
  },
  {
    id: 'courses', destinationIds: ['program'], source: 'src/pages/Program.tsx; src/data/program.ts',
    keywords: ['course', 'courses', 'classes', 'learn', 'ai', 'research', 'design', 'communication', 'productivity', 'project', 'financial', 'money', 'physics', 'astronomy', 'python', 'scratch', 'game', 'leadership', 'cybersecurity', 'safety', 'career', 'stress', 'resilience', 'storytelling', 'marketing', 'civic', 'relationships', 'emergency', 'entrepreneurship'],
    facts: `The catalog has ${courseCounts.all} courses in development: ${courseCounts.live} live and ${courseCounts.independent} independent. Plans: ${developmentCourses.map(course => `${course.title} (${course.format})`).join('; ')}. ${programCopy.availability}`,
  },
  {
    id: 'student-faq', destinationIds: ['faq', 'program', 'contact'], source: 'src/pages/FAQ.tsx; src/data/program.ts; src/lib/links.ts',
    keywords: ['apply', 'application', 'student', 'grade', 'eligible', 'eligibility', 'experience', 'grades', 'fee', 'tuition', 'certificate', 'enroll'],
    facts: `Summer 2026 was free; the developing courses are planned as free learning opportunities. ${programCopy.eligibility} Course-specific prerequisites, completion requirements and certificates still need confirmation. No current student application link or enrollment availability is confirmed. The old student Google Form is no longer published and must not be suggested. The learning hub is a Moodle sign-in page, not an enrollment form. Intern applications are separate.`,
  },
  {
    id: 'team', destinationIds: ['team', 'hiring', 'intern'], source: 'src/pages/Mentors.tsx; src/pages/Hiring.tsx; src/lib/links.ts',
    keywords: ['team', 'mentor', 'mentors', 'intern', 'internship', 'hiring', 'join', 'volunteer', 'job', 'compensation', 'paid'],
    facts: 'The team page displays current and former staff and describes student interns helping younger students practice skills. Hiring invites visitors to apply as a student intern. The intern application uses INTERN_FORM_URL, whose source default can be overridden by Ignite’s VITE_INTERN_FORM_URL. No compensation, intern eligibility, application deadline or hiring outcome is verified. Do not invent team names; link to the team page.',
  },
  {
    id: 'statistics', destinationIds: ['statistics'], source: 'src/pages/Statistics.tsx',
    keywords: ['statistics', 'stats', 'numbers', 'reach', 'cohorts', 'schools', 'countries', 'impact'],
    facts: 'The 2026 Summer Statistics page reports 110 applications, 295 course selections, 77 schools, five countries/regions, ten live cohorts over three weeks, and ten mentors. These are historical 2026 summer figures, not current enrollment or future projections.',
  },
  {
    id: 'records', destinationIds: ['records'], source: 'src/pages/Records.tsx; src/config/records.ts',
    keywords: ['records', 'student work', 'projects', 'capstone', 'examples', 'results'],
    facts: 'The records route is /records. It includes historical Summer 2026 statistics and student-work examples: a Cleanse Nonprofit pitch about misinformation, a Nice Tea campaign design, and a study comparing basil growth under red, green, blue and white light.',
  },
  {
    id: 'help', destinationIds: ['contact', 'faq', 'learning'], source: 'src/pages/FAQ.tsx; src/data/program.ts; src/pages/Hiring.tsx; src/lib/links.ts; src/components/program/ProgramNextSteps.tsx',
    keywords: ['help', 'contact', 'email', 'moodle', 'login', 'password', 'learning', 'platform', 'lesson', 'grades', 'account'],
    facts: 'Verified contact is ignitefindyourfire@gmail.com. The public Learning Hub link from LEARNING_HUB_URL opens a Moodle sign-in page. For learning-site questions, offer the learning destination and contact for account help. Sol cannot access Moodle accounts, lessons, grades or student information. Do not ask for passwords or private student information. A learning login does not establish course availability or enrollment.',
  },
];

export function relevantKnowledge(message: string, previousUserMessages: string[] = []) {
  const query = `${previousUserMessages.slice(-2).join(' ')} ${message}`.toLowerCase();
  const ranked = knowledge.filter(entry => entry.id !== 'help').map((entry, index) => ({
    entry, index, score: entry.keywords.reduce((n, word) => n + (new RegExp(`\\b${word}\\b`, 'i').test(query) ? 1 : 0), 0),
  })).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, 4).map(item => item.entry);
  return [...(ranked.length ? ranked : [knowledge[0]]), knowledge.find(entry => entry.id === 'help')!];
}
