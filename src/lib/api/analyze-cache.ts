import { FengShuiResult } from '@/lib/fengshui/types';

interface CacheEntry {
  expiresAt: number;
  value: FengShuiResult;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 60_000;

const getTtlMs = () => {
  const parsed = Number.parseInt(process.env.ANALYZE_CACHE_TTL_MS || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_MS;
};

const toKey = (lat: number, lng: number) => {
  return `${lat.toFixed(5)}:${lng.toFixed(5)}`;
};

const pruneExpiredEntries = (now: number) => {
  cache.forEach((entry, key) => {
    if (entry.expiresAt <= now) {
      cache.delete(key);
    }
  });
};

export const getCachedAnalysis = (lat: number, lng: number) => {
  const now = Date.now();
  pruneExpiredEntries(now);

  const key = toKey(lat, lng);
  const hit = cache.get(key);
  if (!hit || hit.expiresAt <= now) {
    return null;
  }

  return hit.value;
};

export const setCachedAnalysis = (lat: number, lng: number, value: FengShuiResult) => {
  const now = Date.now();
  const ttl = getTtlMs();

  cache.set(toKey(lat, lng), {
    value,
    expiresAt: now + ttl,
  });
};
