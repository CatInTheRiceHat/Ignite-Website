import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pageMetadata } from '../src/config/pageMetadata';

// The standalone sharing URL gets its own metadata before JavaScript executes.
// Reuse Vite's emitted shell so script hashes and the existing app stay identical.
const path = '/demo/boundaries';
const metadata = pageMetadata[path];
const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
let html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
html = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(metadata.title)}</title>`);
const meta = [
  ['name', 'description', metadata.description],
  ['property', 'og:title', metadata.title],
  ['property', 'og:description', metadata.description],
  ['property', 'og:url', `https://ignitefindyourfire.org${path}`],
] as const;
for (const [attribute, key, value] of meta) {
  html = html.replace(new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`), `<meta ${attribute}="${key}" content="${escape(value)}" />`);
}
html = html.replace(/<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="https://ignitefindyourfire.org${path}" />`);
const directory = new URL('../dist/demo/boundaries/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('index.html', directory), html);
