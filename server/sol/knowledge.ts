import type { DestinationId } from '../../src/sol/shared/destinations.js';
import { courseCounts, courseFormats, developmentCourses, programCopy } from '../../src/data/program.js';
import { teamMembers } from '../../src/data/mentors.js';
import { siteContent } from './site-content.js';

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

const cofounders = teamMembers.filter(member => member.role.toLowerCase().startsWith('co-founder'));
const describeMember = (member: typeof teamMembers[number]) => [
  `${member.name}: ${member.role}`,
  member.school ? `School: ${member.school}${member.country ? `, ${member.country}` : ''}` : '',
  member.graduatingClass ? `Education: ${member.educationLevel ? `${member.educationLevel}, ` : ''}${member.graduatingClass}` : '',
  member.courses?.length ? `Courses listed on their profile: ${member.courses.join('; ')}` : '',
].filter(Boolean).join('. ');

// Public content from the same data as the website. Do not infer live availability.
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
    facts: `The catalog has ${courseCounts.all} courses in development: ${courseCounts.live} live and ${courseCounts.independent} independent. Plans: ${developmentCourses.map(course => `${course.title} (${course.format})${course.instructors?.length ? `; course team: ${course.instructors.map(instructor => `${instructor.name}${instructor.grades ? ` (Grades ${instructor.grades})` : ''}`).join(', ')}` : ''}`).join('; ')}. ${programCopy.availability}`,
  },
  {
    id: 'student-faq', destinationIds: ['faq', 'program', 'contact'], source: 'src/pages/FAQ.tsx; src/data/program.ts; src/lib/links.ts',
    keywords: ['apply', 'application', 'student', 'grade', 'eligible', 'eligibility', 'experience', 'grades', 'fee', 'tuition', 'certificate', 'enroll'],
    facts: `Summer 2026 was free; the developing courses are planned as free learning opportunities. ${programCopy.eligibility} Course-specific prerequisites, completion requirements and certificates still need confirmation. No current student application link or enrollment availability is confirmed. The old student Google Form is no longer published and must not be suggested. The learning hub is a Moodle sign-in page, not an enrollment form. Intern applications are separate.`,
  },
  {
    id: 'founders', destinationIds: ['team', 'about'], source: 'src/data/mentors.ts; src/pages/Mentors.tsx',
    keywords: ['cofounder', 'cofounders', 'co-founder', 'co-founders', 'co founder', 'co founders', 'founder', 'founders', 'founded', 'started', 'founding', 'runs', 'leads', 'ceo', 'cto', 'chief', 'executive', 'technology', 'outreach'],
    facts: `Ignite's cofounders listed on the website are ${cofounders.map(member => `${member.name} (${member.role})`).join('; ')}. These names and roles come directly from the public team profiles.`,
  },
  {
    id: 'team', destinationIds: ['team', 'hiring', 'intern'], source: 'src/data/mentors.ts; src/pages/Mentors.tsx; src/pages/Hiring.tsx; src/lib/links.ts',
    keywords: ['team', 'mentor', 'mentors', 'staff', 'former', 'developer', 'developers', 'ambassador', 'ambassadors', 'teach', 'teaches', 'teaching', 'instructor', 'instructors', 'intern', 'interns', 'internship', 'hiring', 'join', 'volunteer', 'job', 'compensation', 'paid', ...teamMembers.flatMap(member => [member.name, member.name.split(' ')[0]])],
    facts: `The website's current staff profiles: ${teamMembers.filter(member => member.role !== 'Former Staff').map(describeMember).join(' | ')}. Former staff profiles: ${teamMembers.filter(member => member.role === 'Former Staff').map(describeMember).join(' | ')}. Course associations are the published profile labels, not confirmed teaching schedules. Hiring invites visitors to apply as a student intern. The intern application uses INTERN_FORM_URL, whose source default can be overridden by Ignite's VITE_INTERN_FORM_URL. No compensation, intern eligibility, application deadline or hiring outcome is verified. Answer questions about listed people using these profiles and preserve the distinction between current and former staff.`,
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
  const normalize = (text: string) => text.toLowerCase().replace(/[-\u2010-\u2015]/g, ' ').replace(/\s+/g, ' ');
  const query = normalize(message);
  const history = normalize(previousUserMessages.slice(-2).join(' '));
  const score = (entry: KnowledgeEntry, text: string) => [...new Set(entry.keywords.map(normalize))].reduce((n, word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return n + (new RegExp(`\\b${escaped}\\b`, 'i').test(text) ? 1 : 0);
  }, 0);
  const ranked = knowledge.filter(entry => entry.id !== 'help').map((entry, index) => ({
    entry, index, currentScore: score(entry, query), historyScore: score(entry, history),
  })).filter(item => item.currentScore > 0 || item.historyScore > 0)
    .sort((a, b) => b.currentScore - a.currentScore || b.historyScore - a.historyScore || a.index - b.index)
    .slice(0, 4).map(item => item.entry);
  return [...(ranked.length ? ranked : [knowledge[0]]), knowledge.find(entry => entry.id === 'help')!];
}

const searchStopWords = new Set('a an and are as at be been but by can could do does for from had has have how i in into is it its me my of on or our s should that the their them there these they this to us was we were what when where which who why will with would you your ignite tell please many much'.split(' '));
function siteSearchTerms(text: string) {
  const normalized = text.toLowerCase().replace(/[-\u2010-\u2015]/g, ' ')
    .replace(/\b(?:co\s*founders?|founders?|founded)\b/g, 'founder')
    .replace(/\bceo\b/g, 'chief executive officer').replace(/\bcto\b/g, 'chief technology officer');
  return new Set((normalized.match(/[a-z0-9]+/g) || []).filter(word => !searchStopWords.has(word)));
}

// Actual page text supplements the structured facts, including questions without a curated keyword.
export function relevantSiteContent(message: string, previousUserMessages: string[] = []) {
  const query = siteSearchTerms(message);
  const history = siteSearchTerms(previousUserMessages.slice(-2).join(' '));
  const summaries = relevantKnowledge(message, previousUserMessages).filter(entry => entry.id !== 'help');
  return siteContent.map((page, index) => {
    const terms = siteSearchTerms(page.text);
    const sourceRank = summaries.findIndex(entry => entry.source.split('; ').includes(page.source));
    return {
      page, index, sourceRank: sourceRank === -1 ? Infinity : sourceRank,
      score: [...query].filter(word => terms.has(word)).length,
      historyScore: [...history].filter(word => terms.has(word)).length,
    };
  }).filter(item => item.score > 0 || item.historyScore > 0 || item.sourceRank !== Infinity)
    .sort((a, b) => b.score - a.score || a.sourceRank - b.sourceRank || b.historyScore - a.historyScore || a.index - b.index)
    .slice(0, 3).map(item => item.page);
}
