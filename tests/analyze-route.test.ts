import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/analyze/route';
import { analyzeFengShui } from '@/lib/fengshui/engine';
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/api/analyze-cache';
import { checkRateLimit, extractClientId } from '@/lib/api/rate-limit';

vi.mock('@/lib/fengshui/engine', () => ({
  analyzeFengShui: vi.fn(),
}));

vi.mock('@/lib/api/analyze-cache', () => ({
  getCachedAnalysis: vi.fn(),
  setCachedAnalysis: vi.fn(),
}));

vi.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  extractClientId: vi.fn(),
}));

describe('/api/analyze route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(extractClientId).mockReturnValue('test-client');
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetAt: Date.now() + 60_000,
    });
    vi.mocked(getCachedAnalysis).mockReturnValue(null);
  });

  it('좌표 누락 시 INVALID_COORDINATES를 반환한다', async () => {
    const response = await GET(new Request('http://localhost/api/analyze?lat=0&lng=0'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('INVALID_COORDINATES');
  });

  it('rate limit 초과 시 RATE_LIMITED를 반환한다', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 5_000,
    });

    const response = await GET(new Request('http://localhost/api/analyze?lat=37.5665&lng=126.9780'));
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error.code).toBe('RATE_LIMITED');
  });

  it('캐시 히트 시 엔진 호출 없이 cached=true를 반환한다', async () => {
    vi.mocked(getCachedAnalysis).mockReturnValue({
      score: 88,
      scores: [80, 85, 90, 88, 87],
      analysis: { total: 'cached-result' },
      reasons: ['a', 'b', 'c', 'd', 'e'],
      historicalMatch: '명당',
      signature: 'abc123abc123',
      isPartial: false,
    });

    const response = await GET(new Request('http://localhost/api/analyze?lat=37.5665&lng=126.9780'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.cached).toBe(true);
    expect(analyzeFengShui).not.toHaveBeenCalled();
  });

  it('정상 분석 시 캐시 저장 후 cached=false를 반환한다', async () => {
    vi.mocked(analyzeFengShui).mockResolvedValue({
      score: 91,
      scores: [95, 90, 88, 89, 92],
      analysis: { total: 'fresh-result' },
      reasons: ['a', 'b', 'c', 'd', 'e'],
      historicalMatch: '조선 왕릉 명당 (천하명당)',
      signature: 'feedbeefcafe',
      isPartial: false,
    });

    const response = await GET(new Request('http://localhost/api/analyze?lat=37.5665&lng=126.9780'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.cached).toBe(false);
    expect(setCachedAnalysis).toHaveBeenCalledTimes(1);
  });
});
