interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const bucket = new Map<string, RateLimitEntry>();
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 20;

const getWindowMs = () => {
  const parsed = Number.parseInt(process.env.ANALYZE_RATE_LIMIT_WINDOW_MS || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_WINDOW_MS;
};

const getMaxRequests = () => {
  const parsed = Number.parseInt(process.env.ANALYZE_RATE_LIMIT_MAX || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_REQUESTS;
};

export const extractClientId = (request: Request) => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  return request.headers.get('x-real-ip') || 'anonymous';
};

export const checkRateLimit = (clientId: string): RateLimitResult => {
  const now = Date.now();
  const windowMs = getWindowMs();
  const maxRequests = getMaxRequests();

  const current = bucket.get(clientId);
  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    bucket.set(clientId, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  const nextCount = current.count + 1;
  current.count = nextCount;
  bucket.set(clientId, current);

  if (nextCount > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  return { allowed: true, remaining: maxRequests - nextCount, resetAt: current.resetAt };
};
