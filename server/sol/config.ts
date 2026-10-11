import { safeHttpUrl } from '../../src/sol/shared/destinations.js';

export type ServerConfig = {
  apiKey: string;
  model: string;
  websiteBaseUrl: string;
  allowedOrigins: string[];
  redisUrl: string;
  redisToken: string;
  salt: string;
  namespace: string;
  perMinute: number;
  globalPerMinute: number;
  dailyCap: number;
};

function positiveInteger(value: string | undefined, fallback: number) {
  const n = value === undefined || value === '' ? fallback : Number(value);
  if (!Number.isSafeInteger(n) || n < 1 || n > 1000000) throw new Error('Invalid limit.');
  return n;
}

export function readConfig(env: Record<string, string | undefined>): ServerConfig | null {
  try {
    const required = ['OPENAI_API_KEY', 'WEBSITE_BASE_URL', 'ALLOWED_ORIGINS', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'RATE_LIMIT_SALT'];
    if (required.some(key => !env[key]?.trim())) return null;
    const origins = env.ALLOWED_ORIGINS!.split(',').map(value => value.trim());
    if (origins.some(origin => new URL(safeHttpUrl(origin)).origin !== origin)) return null;
    const redis = new URL(safeHttpUrl(env.UPSTASH_REDIS_REST_URL!));
    if (redis.protocol !== 'https:' || redis.pathname !== '/' || redis.search || redis.hash) return null;
    if (env.RATE_LIMIT_SALT!.length < 32) return null;
    const namespace = env.RATE_LIMIT_NAMESPACE || 'sol';
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(namespace)) return null;
    return {
      apiKey: env.OPENAI_API_KEY!, model: env.OPENAI_MODEL?.trim() || 'gpt-4.1-mini',
      websiteBaseUrl: safeHttpUrl(env.WEBSITE_BASE_URL!), allowedOrigins: [...new Set(origins)],
      redisUrl: redis.origin, redisToken: env.UPSTASH_REDIS_REST_TOKEN!, salt: env.RATE_LIMIT_SALT!, namespace,
      perMinute: positiveInteger(env.RATE_LIMIT_PER_MINUTE, 10),
      globalPerMinute: positiveInteger(env.GLOBAL_RATE_LIMIT_PER_MINUTE, 60),
      dailyCap: positiveInteger(env.DAILY_REQUEST_CAP, 500),
    };
  } catch { return null; }
}

export function configuredOrigins(env: Record<string, string | undefined>) {
  return (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(value => {
    try { return new URL(safeHttpUrl(value)).origin === value; } catch { return false; }
  });
}
