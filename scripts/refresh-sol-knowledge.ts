import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname } from 'node:path';

// Public-source evidence only. This never reads environment files or changes approved facts.
const paths = [
  'IGNITE_STYLE_GUIDE.md', 'src/App.tsx', 'src/lib/links.ts', 'src/config/records.ts',
  'src/data/program.ts', 'src/pages/About.tsx', 'src/pages/Home.tsx', 'src/pages/Program.tsx',
  'src/pages/FAQ.tsx', 'src/pages/Hiring.tsx', 'src/pages/Mentors.tsx',
  'src/pages/Statistics.tsx', 'src/pages/Records.tsx', 'src/pages/Apply.tsx',
  'src/components/program/ProgramNextSteps.tsx',
];
for (const path of paths) {
  const target = `.reference/sol-review/${path}`;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, await readFile(path));
}
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
console.info(`Copied current public source at HEAD ${revision} to .reference/sol-review/.`);
console.info('Working-tree edits are included; review the diff as well as the revision.');
console.info('Review docs/SOL.md, server/sol/knowledge.ts and src/sol/shared/destinations.ts. Approved knowledge was not changed automatically.');
