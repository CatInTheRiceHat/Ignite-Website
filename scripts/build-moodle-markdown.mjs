import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build, transformWithEsbuild } from 'vite';

const base = new URL('../moodle/tiny/ignite_markdown/amd/', import.meta.url);
const source = await readFile(new URL('src/plugin.js', base), 'utf8');
const { code } = await transformWithEsbuild(source, 'plugin.js', {
  target: 'es2020', minify: true, legalComments: 'inline', sourcemap: false,
});
await mkdir(new URL('build/', base), { recursive: true });
await writeFile(new URL('build/plugin.min.js', base), code);
const bundle = await build({
  configFile: false,
  publicDir: false,
  build: {
    emptyOutDir: false,
    write: false,
    outDir: fileURLToPath(new URL('build/', base)),
    lib: {entry: fileURLToPath(new URL('src/source.js', base)), name: 'IgniteMarkdown', formats: ['iife'],
      fileName: () => 'source.min.js'},
  },
});
const chunk = (Array.isArray(bundle) ? bundle[0] : bundle).output.find(chunk => chunk.type === 'chunk');
const dependencies = [...new Set(Object.keys(chunk.modules).map(id =>
  id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1]).filter(Boolean))].sort();
const notices = await Promise.all(dependencies.map(async name =>
  `${name}\n${await readFile(new URL(`../node_modules/${name}/LICENSE`, import.meta.url), 'utf8')}`));
const licenses = `/*! Bundled dependency licenses\n\n${notices.join('\n\n')}\n*/\n`;
await writeFile(new URL('build/source.min.js', base),
  `${licenses}define("tiny_ignite_markdown/source", [], function() {\n${chunk.code}\nreturn IgniteMarkdown;\n});\n`);
