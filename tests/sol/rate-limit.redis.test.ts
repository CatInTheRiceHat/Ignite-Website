import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawn, execFile, type ChildProcess } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { readConfig } from '../../server/sol/config';
import { reserveRequest } from '../../server/sol/rate-limit';
import { createHandler } from '../../server/sol/http';

// Optional real Redis integration: no network credentials and no production database.
const execute = promisify(execFile);
const enabled = !!process.env.REDIS_SERVER_BIN && !!process.env.REDIS_CLI_BIN;

describe.skipIf(!enabled)('real Redis atomic budgets', () => {
  let redis: ChildProcess;
  let directory: string;
  let socket: string;
  const env = {
    OPENAI_API_KEY: 'test-only', WEBSITE_BASE_URL: 'https://ignitefindyourfire.org', ALLOWED_ORIGINS: 'https://ignitefindyourfire.org',
    UPSTASH_REDIS_REST_URL: 'https://test.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'test-only',
    RATE_LIMIT_SALT: 'this-is-a-test-only-salt-longer-than-32-characters',
    RATE_LIMIT_PER_MINUTE: '100', GLOBAL_RATE_LIMIT_PER_MINUTE: '100', DAILY_REQUEST_CAP: '7',
  };
  async function command(args: string[]) {
    const { stdout } = await execute(process.env.REDIS_CLI_BIN!, ['-s', socket, '--json', ...args]);
    return JSON.parse(stdout) as unknown;
  }
  const fetcher = (async (_url: unknown, options: RequestInit) => {
    const args = JSON.parse(options.body as string) as (string | number)[];
    return new Response(JSON.stringify({ result: await command(args.map(String)) }));
  }) as typeof fetch;

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), 'sol-redis-')); socket = join(directory, 'redis.sock');
    redis = spawn(process.env.REDIS_SERVER_BIN!, ['--port', '0', '--unixsocket', socket, '--save', '', '--appendonly', 'no'], { stdio: ['ignore', 'pipe', 'pipe'] });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Redis did not become ready.')), 10000);
      redis.stdout!.on('data', data => { if (String(data).includes('Ready to accept connections')) { clearTimeout(timer); resolve(); } });
      redis.once('error', error => { clearTimeout(timer); reject(error); });
    });
  });
  afterAll(async () => {
    if (redis && redis.exitCode === null) { redis.kill('SIGTERM'); await once(redis, 'exit'); }
    if (directory) await rm(directory, { recursive: true, force: true });
  });

  it('enforces the daily cap under 30 concurrent reservations from distinct visitors', async () => {
    const config = readConfig({ ...env, RATE_LIMIT_NAMESPACE: 'daily-test' })!;
    const results = await Promise.all(Array.from({ length: 30 }, (_, index) => reserveRequest({ ...config }, `192.0.2.${index + 1}`, fetcher)));
    expect(results.filter(result => result.allowed)).toHaveLength(7);
    expect(results.filter(result => !result.allowed).every(result => result.retryAfter > 0 && result.retryAfter <= 86400)).toBe(true);
  });

  it('enforces per-visitor limits across independent config instances', async () => {
    const config = readConfig({ ...env, RATE_LIMIT_NAMESPACE: 'visitor-test', RATE_LIMIT_PER_MINUTE: '2' })!;
    const results = await Promise.all(Array.from({ length: 10 }, () => reserveRequest({ ...config }, '192.0.2.1', fetcher)));
    expect(results.filter(result => result.allowed)).toHaveLength(2);
  });

  it('enforces the global minute budget for distinct visitors', async () => {
    const config = readConfig({ ...env, RATE_LIMIT_NAMESPACE: 'global-test', GLOBAL_RATE_LIMIT_PER_MINUTE: '3' })!;
    const results = await Promise.all(Array.from({ length: 10 }, (_, index) => reserveRequest({ ...config }, `192.0.2.${index}`, fetcher)));
    expect(results.filter(result => result.allowed)).toHaveLength(3);
  });

  it('protects two independent HTTP server instances with a shared daily cap', async () => {
    const config = { ...env, VERCEL: '1', RATE_LIMIT_NAMESPACE: 'instance-test', DAILY_REQUEST_CAP: '2' };
    let providerCalls = 0;
    const upstream = (async (url: unknown, options: RequestInit) => {
      if (String(url).includes('upstash')) return fetcher(url as string, options);
      providerCalls++;
      return new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: '{"answer":"See Ignite’s FAQs.","destinationIds":["faq"]}' }] }] }));
    }) as typeof fetch;
    const servers: Server[] = [];
    try {
      const urls = await Promise.all([0, 1].map(async () => {
        const handler = createHandler('chat', { env: config, fetcher: upstream });
        const server = createServer((req, res) => { void handler(req, res); }); servers.push(server);
        server.listen(0, '127.0.0.1'); await once(server, 'listening');
        return `http://127.0.0.1:${(server.address() as { port: number }).port}`;
      }));
      const responses = await Promise.all(Array.from({ length: 10 }, (_, index) => fetch(`${urls[index % 2]}/api/chat`, {
        method: 'POST', headers: { Origin: env.ALLOWED_ORIGINS, 'Content-Type': 'application/json', 'x-vercel-forwarded-for': `192.0.2.${index}` }, body: '{"message":"Where are the FAQs?"}',
      })));
      expect(responses.filter(response => response.status === 200)).toHaveLength(2);
      expect(responses.filter(response => response.status === 429)).toHaveLength(8);
      expect(providerCalls).toBe(2);
    } finally { await Promise.all(servers.map(server => new Promise<void>(resolve => server.close(() => resolve())))); }
  });
});
