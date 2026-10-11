import type { IncomingMessage, ServerResponse } from 'node:http';
import { isIP } from 'node:net';
import { configuredOrigins, readConfig } from './config.js';
import { MAX_BODY_BYTES, parseChatInput } from '../../src/sol/shared/protocol.js';
import { resolveDestination } from '../../src/sol/shared/destinations.js';
import { reserveRequest } from './rate-limit.js';
import { askOpenAI } from './openai.js';

type ApiRequest = IncomingMessage & { body?: unknown };
type Dependencies = {
  env?: Record<string, string | undefined>;
  fetcher?: typeof fetch;
};

class BodyTooLarge extends Error {}

async function readBody(req: ApiRequest) {
  if (Number(req.headers['content-length']) > MAX_BODY_BYTES) throw new BodyTooLarge();
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) throw new BodyTooLarge();
    return JSON.parse(raw) as unknown;
  }
  let bytes = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    bytes += buffer.length;
    if (bytes > MAX_BODY_BYTES) throw new BodyTooLarge();
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

const UNAVAILABLE = 'Sol’s conversational replies are unavailable. You can still explore Ignite using the links below.';

export function createHandler(endpoint: 'chat' | 'status', dependencies: Dependencies = {}) {
  return async (req: ApiRequest, res: ServerResponse) => {
    const env = dependencies.env || process.env;
    const fetcher = dependencies.fetcher || fetch;
    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
    const origins = configuredOrigins(env);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Origin');
    if (origins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Expose-Headers', 'Retry-After');
    }
    const send = (status: number, body: unknown) => { res.statusCode = status; res.end(JSON.stringify(body)); };
    if (origin && !origins.includes(origin)) {
      return send(403, { error: { code: 'origin_not_allowed', message: 'This website is not configured for Sol.' } });
    }
    if (req.method === 'OPTIONS') {
      if (!origin || !origins.includes(origin)) return send(403, { error: { code: 'origin_not_allowed', message: 'Origin not allowed.' } });
      res.statusCode = 204; return res.end();
    }
    const expectedMethod = endpoint === 'status' ? 'GET' : 'POST';
    if (req.method !== expectedMethod) {
      res.setHeader('Allow', `${expectedMethod}, OPTIONS`);
      return send(405, { error: { code: 'method_not_allowed', message: 'Method not allowed.' } });
    }
    const config = readConfig(env);
    if (endpoint === 'status') return send(200, { available: !!config, message: config ? 'Sol is ready to help.' : UNAVAILABLE });
    if (!config) return send(503, { error: { code: 'unavailable', message: UNAVAILABLE } });
    if (!origin || !config.allowedOrigins.includes(origin)) {
      return send(403, { error: { code: 'origin_not_allowed', message: 'This website is not configured for Sol.' } });
    }
    if (!/^application\/json(?:\s*;|$)/i.test(String(req.headers['content-type'] || ''))) {
      return send(415, { error: { code: 'invalid_content_type', message: 'Send application/json.' } });
    }
    let input;
    try { input = parseChatInput(await readBody(req)); }
    catch (error) {
      return send(error instanceof BodyTooLarge ? 413 : 400, {
        error: { code: 'invalid_input', message: error instanceof BodyTooLarge ? 'Request is too large.' : 'Please send a question of 1–1000 characters with a short conversation history.' },
      });
    }
    // Trust Vercel's overwritten header only when actually running on Vercel.
    // Other deployments need their own trusted proxy adapter; never trust caller X-Forwarded-For locally.
    const ip = env.VERCEL === '1'
      ? String(req.headers['x-vercel-forwarded-for'] || '').trim()
      : req.socket.remoteAddress || '';
    if (!isIP(ip)) return send(503, { error: { code: 'unavailable', message: UNAVAILABLE } });
    try {
      const limit = await reserveRequest(config, ip, fetcher);
      if (!limit.allowed) {
        res.setHeader('Retry-After', limit.retryAfter);
        return send(429, { error: { code: 'rate_limited', message: 'Sol has reached a request limit. Please try again later; the quick links still work.', retryAfter: limit.retryAfter } });
      }
    } catch {
      return send(503, { error: { code: 'protection_unavailable', message: UNAVAILABLE } });
    }
    try {
      const reply = await askOpenAI(config, input, fetcher);
      const navigation = reply.destinationIds.map(id => resolveDestination(id, config.websiteBaseUrl));
      return send(200, { ...reply, navigation });
    } catch {
      // Deliberately do not log prompts, history, keys, or provider error payloads.
      return send(502, { error: { code: 'reply_failed', message: 'Sol couldn’t get a reply. Please retry or use a quick link.' } });
    }
  };
}
