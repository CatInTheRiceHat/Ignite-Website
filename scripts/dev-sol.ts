import { createServer as createHttpServer } from 'node:http';
import { once } from 'node:events';
import { createServer as createViteServer } from 'vite';
import { indexPublicSite } from './index-sol-site.js';

await indexPublicSite();
const { createHandler } = await import('../server/sol/http.js');

const handlers = { '/api/chat': createHandler('chat'), '/api/status': createHandler('status') };
const api = createHttpServer((req, res) => {
  const handler = handlers[new URL(req.url || '/', 'http://localhost').pathname as keyof typeof handlers];
  if (!handler) { res.statusCode = 404; res.end(); return; }
  void handler(req, res).catch(() => { if (!res.writableEnded) { res.statusCode = 500; res.end(); } });
});
api.requestTimeout = 25000;
api.listen(0, '127.0.0.1');
await once(api, 'listening');
const apiPort = (api.address() as { port: number }).port;

const vite = await createViteServer({ server: {
  host: '127.0.0.1', port: Number(process.env.SOL_DEV_PORT || 5173), strictPort: true,
  proxy: { '^/api/(chat|status)(?:\\?|$)': `http://127.0.0.1:${apiPort}` },
} });
await vite.listen();
vite.printUrls();
console.info(`Sol API: http://127.0.0.1:${apiPort} (no transcripts logged)`);
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => { void vite.close().then(() => { api.close(); process.exit(0); }); });
}
