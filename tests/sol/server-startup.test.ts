import { it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

it('starts compiled Vercel entrypoints in plain Node without a TypeScript loader', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const directory = mkdtempSync(join(tmpdir(), 'sol-server-startup-'));
  const compiler = createRequire(import.meta.url).resolve('typescript/bin/tsc');
  try {
    execFileSync(process.execPath, [compiler, '--project', 'config/tsconfig.sol-server.json', '--noEmit', 'false', '--outDir', directory], {
      cwd: root, timeout: 20000, encoding: 'utf8',
    });
    writeFileSync(join(directory, 'package.json'), '{"type":"module"}');
    // A bundler or tsx would accept extensionless imports and hide the deployment bug.
    // Import both emitted entrypoints in a fresh Node process with no loaders or secrets.
    const statusUrl = pathToFileURL(join(directory, 'api/status.js')).href;
    const chatUrl = pathToFileURL(join(directory, 'api/chat.js')).href;
    const script = `
      import assert from 'node:assert/strict';
      import { createServer } from 'node:http';
      import { once } from 'node:events';
      const { default: status } = await import(${JSON.stringify(statusUrl)});
      const { default: chat } = await import(${JSON.stringify(chatUrl)});
      const server = createServer((req, res) => {
        void (req.url === '/api/status' ? status : chat)(req, res);
      });
      server.listen(0, '127.0.0.1');
      await once(server, 'listening');
      try {
        const base = 'http://127.0.0.1:' + server.address().port;
        const ready = await fetch(base + '/api/status');
        assert.equal(ready.status, 200);
        assert.equal((await ready.json()).available, false);
        const reply = await fetch(base + '/api/chat', { method: 'POST' });
        assert.equal(reply.status, 503);
        assert.equal((await reply.json()).error.code, 'unavailable');
        console.log('Compiled API startup passed');
      } finally {
        server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
      }
    `;
    const output = execFileSync(process.execPath, ['--input-type=module', '--eval', script], {
      cwd: directory, env: {}, timeout: 10000, encoding: 'utf8',
    });
    expect(output.trim()).toBe('Compiled API startup passed');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 30000);
