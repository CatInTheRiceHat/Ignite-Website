import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { expect, it } from 'vitest';
import { extractPublicText } from '../../scripts/index-sol-site';
import { relevantSiteContent } from '../../server/sol/knowledge';
import { siteContent } from '../../server/sol/site-content';
import { programFaqs } from '../../src/data/program';
import { interns, mentors } from '../../src/data/mentors';
import { RECORDS_PAGE } from '../../src/config/records';

it('indexes every public page in a fresh production process without router or dependency-scan failures', () => {
  const cli = createRequire(import.meta.url).resolve('tsx/cli');
  const result = spawnSync(process.execPath, [cli, 'scripts/index-sol-site.ts'], {
    cwd: process.cwd(), env: { PATH: process.env.PATH, NODE_ENV: 'production' },
    encoding: 'utf8', timeout: 30000,
  });
  expect(result.error).toBeUndefined();
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('Indexed 9 public website pages for Sol.');
  expect(result.stderr).not.toMatch(/vite:dep-scan|Cannot destructure|Request is outdated/);
}, 35000);

it('extracts readable public text while excluding scripts, attributes, icons and hidden animation values', () => {
  const text = extractPublicText(`<section class="hidden decoration"><h1>Questions &amp; Answers</h1>
    <span class="sr-only">110 </span><p aria-hidden="true"><span>0</span></p><p>Applications</p>
    <div hidden><p>Private placeholder</p></div><script>secret()</script><style>.x { color: red; }</style>
    <svg><path d="ignore"/><text>Icon label</text></svg><p>Student&#x27;s work</p>
    <a href="https://example.com/never-read">Learning Hub</a></section>`);
  expect(text).toBe("Questions & Answers\n110\nApplications\nStudent's work\nLearning Hub");
});

it('covers every public page route, excluding redirects and error pages', () => {
  const routes = readFileSync('src/App.tsx', 'utf8');
  const literalPaths = [...routes.matchAll(/<Route path="([^"]+)"/g)].map(match => match[1])
    .filter(path => path !== '/mentors' && path !== '*');
  expect(siteContent.map(page => page.path).sort()).toEqual([...literalPaths, RECORDS_PAGE.path].sort());
  expect(new Set(siteContent.map(page => page.path)).size).toBe(siteContent.length);
  for (const page of siteContent) {
    expect(page.text.length).toBeGreaterThan(100);
    expect(page.text).not.toMatch(/<script|class=|data-ignition|apiKey/);
  }
});

it('contains the actual FAQ answers and all published team profiles', () => {
  const faq = siteContent.find(page => page.path === '/faq')!.text;
  for (const entry of programFaqs) {
    expect(faq).toContain(entry.question);
    expect(faq).toContain(entry.answer);
  }
  const team = siteContent.find(page => page.path === '/team')!.text;
  for (const member of [...mentors, ...interns]) {
    expect(team).toContain(member.name);
    expect(team).toContain(member.role);
  }
  expect(siteContent.find(page => page.path === '/')!.text).toMatch(/110\s+Applications/);
});

it('finds student-work details from page text even when the summaries have no matching keyword', () => {
  const selected = relevantSiteContent('What is Cleanse Nonprofit?');
  expect(selected[0].path).toBe('/records');
  expect(selected[0].text).toContain('misinformation');
  expect(selected.length).toBeLessThanOrEqual(3);
});

it.each(['Who are the cofounders?', 'Who are the co‑founders?', 'Who is the CEO?', 'Who is Elaine Che?'])('retrieves the actual team page for "%s"', question => {
  const selected = relevantSiteContent(question);
  expect(selected[0].path).toBe('/team');
  for (const name of ['Elaine Che', 'Austin Zhao', 'Michael Zhao']) expect(selected[0].text).toContain(name);
});

it('uses the statistics page for reach questions and current questions ahead of course history', () => {
  expect(relevantSiteContent('How many schools were reached?').map(page => page.path)).toContain('/statistics');
  expect(relevantSiteContent('Who are the cofounders?', ['Tell me about all the courses and enrollment.'])[0].path).toBe('/team');
});
