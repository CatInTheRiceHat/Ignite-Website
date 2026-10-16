import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import type { ComponentType } from 'react';
import { createServer } from 'vite';

const publicPages = [
  { path: '/', source: 'src/pages/Home.tsx' },
  { path: '/about', source: 'src/pages/About.tsx' },
  { path: '/team', source: 'src/pages/Mentors.tsx' },
  { path: '/program', source: 'src/pages/Program.tsx' },
  { path: '/faq', source: 'src/pages/FAQ.tsx' },
  { path: '/hiring', source: 'src/pages/Hiring.tsx' },
  { path: '/partnerships', source: 'src/pages/Partnerships.tsx' },
  { path: '/records', source: 'src/pages/Records.tsx' },
];

// Read the page's public text, not attributes, scripts, icons or hidden animation counters.
export function extractPublicText(html: string) {
  const blocks = /^(?:div|section|article|p|h[1-6]|li|dt|dd|br)$/;
  const voidTags = /^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;
  const stack: { tag: string; hidden: boolean }[] = [];
  const text: string[] = [];
  for (const token of html.match(/<[^>]+>|[^<]+/g) || []) {
    if (!token.startsWith('<')) {
      if (!stack.at(-1)?.hidden) text.push(token);
      continue;
    }
    const match = token.match(/^<(\/)?([a-z][\w-]*)/i);
    if (!match) continue;
    const tag = match[2].toLowerCase();
    if (match[1]) {
      const element = stack.pop();
      if (!element?.hidden) text.push(blocks.test(tag) ? '\n' : ' ');
      continue;
    }
    const attributes = new Map([...token.slice(match[0].length).matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)]
      .map(attr => [attr[1].toLowerCase(), attr[2] ?? attr[3] ?? attr[4] ?? '']));
    const hidden = !!stack.at(-1)?.hidden || /^(?:script|style|svg)$/.test(tag)
      || attributes.has('hidden') || attributes.get('aria-hidden') === 'true';
    if (!hidden) text.push(blocks.test(tag) ? '\n' : ' ');
    if (!voidTags.test(tag) && !token.endsWith('/>')) stack.push({ tag, hidden });
  }
  const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return text.join('').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, entity: string) => {
    if (entity.startsWith('#')) return String.fromCodePoint(Number.parseInt(entity.slice(/^#x/i.test(entity) ? 2 : 1), /^#x/i.test(entity) ? 16 : 10));
    return entities[entity.toLowerCase()];
  }).split('\n').map(line => line.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
}

export async function indexPublicSite() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const vite = await createServer({
    root, logLevel: 'error', server: { middlewareMode: true, watch: null }, appType: 'custom',
    // This server only renders pages; scanning browser HTML entries can race with its shutdown.
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { renderPublicPage } = await vite.ssrLoadModule('/scripts/render-sol-page.ts') as typeof import('./render-sol-page.js');
    const pages = [];
    for (const page of publicPages) {
      const { default: Page } = await vite.ssrLoadModule(`/${page.source}`) as { default: ComponentType };
      const text = extractPublicText(renderPublicPage(Page, page.path));
      if (!text) throw new Error(`No public text rendered for ${page.path}`);
      pages.push({ ...page, text });
    }
    const target = resolve(root, 'server/sol/site-content.ts');
    const output = `// Generated from the rendered public pages by scripts/index-sol-site.ts. Do not edit manually.\nexport const siteContent: { path: string; source: string; text: string }[] = ${JSON.stringify(pages, null, 2)};\n`;
    const previous = await readFile(target, 'utf8').catch(() => '');
    if (previous !== output) await writeFile(target, output);
    console.info(`Indexed ${pages.length} public website pages for Sol.`);
    return pages;
  } finally {
    await vite.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await indexPublicSite();
