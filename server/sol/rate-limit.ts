import { createHmac } from 'node:crypto';
import type { ServerConfig } from './config.js';

// One atomic reservation before any OpenAI call. Shared keys span Vercel instances.
// Redis TIME avoids disagreement between serverless clocks. No transcript or raw IP is stored.
export const RESERVE_SCRIPT = `
local now = tonumber(redis.call('TIME')[1])
local minute = math.floor(now / 60)
local day = math.floor(now / 86400)
local visitor = KEYS[1] .. ':visitor:' .. ARGV[1] .. ':' .. minute
local global = KEYS[1] .. ':minute:' .. minute
local daily = KEYS[1] .. ':day:' .. day
if tonumber(redis.call('GET', visitor) or '0') >= tonumber(ARGV[2]) then
  return {0, 60 - (now % 60)}
end
if tonumber(redis.call('GET', global) or '0') >= tonumber(ARGV[3]) then
  return {0, 60 - (now % 60)}
end
if tonumber(redis.call('GET', daily) or '0') >= tonumber(ARGV[4]) then
  return {0, 86400 - (now % 86400)}
end
redis.call('INCR', visitor)
redis.call('EXPIRE', visitor, 120)
redis.call('INCR', global)
redis.call('EXPIRE', global, 120)
redis.call('INCR', daily)
redis.call('EXPIRE', daily, 172800)
return {1, 0}
`;

export async function reserveRequest(config: ServerConfig, ip: string, fetcher: typeof fetch = fetch) {
  const visitor = createHmac('sha256', config.salt).update(ip).digest('hex');
  const response = await fetcher(config.redisUrl, {
    method: 'POST', headers: { Authorization: `Bearer ${config.redisToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['EVAL', RESERVE_SCRIPT, 1, `{${config.namespace}}`, visitor, config.perMinute, config.globalPerMinute, config.dailyCap]),
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error('Protection unavailable.');
  const data = await response.json() as { result?: unknown; error?: string };
  if (data.error || !Array.isArray(data.result) || data.result.length !== 2 ||
      ![0, 1].includes(data.result[0]) || !Number.isInteger(data.result[1]) || data.result[1] < 0 || data.result[1] > 86400) {
    throw new Error('Protection unavailable.');
  }
  return { allowed: data.result[0] === 1, retryAfter: data.result[1] as number };
}
