import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { transformWithEsbuild } from 'vite';

const base = new URL('../moodle/tiny/ignite_markdown/amd/', import.meta.url);
const source = await readFile(new URL('src/plugin.js', base), 'utf8');
const { code } = await transformWithEsbuild(source, 'plugin.js', {
  target: 'es2020', minify: true, legalComments: 'inline', sourcemap: false,
});
await mkdir(new URL('build/', base), { recursive: true });
await writeFile(new URL('build/plugin.min.js', base), code);
