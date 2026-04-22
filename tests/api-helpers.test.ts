import { afterEach, describe, expect, it } from 'vitest';
import { checkRateLimit, extractClientId } from '../src/lib/api/rate-limit';

afterEach(() => {
  delete process.env.ANALYZE_RATE_LIMIT_MAX;
  delete process.env.ANALYZE_RATE_LIMIT_WINDOW_MS;
});

describe('api helper utilities', () => {
  it('x-forwarded-for의 첫 번째 IP를 client id로 사용한다', () => {
    const request = new Request('http://localhost/api/analyze', {
      headers: {
        'x-forwarded-for': '203.0.113.10, 10.0.0.2',
      },
    });

    expect(extractClientId(request)).toBe('203.0.113.10');
  });

  it('rate limit이 임계치를 넘기면 차단한다', () => {
    process.env.ANALYZE_RATE_LIMIT_MAX = '2';
    process.env.ANALYZE_RATE_LIMIT_WINDOW_MS = '60000';

    const first = checkRateLimit('limit-test-user');
    const second = checkRateLimit('limit-test-user');
    const third = checkRateLimit('limit-test-user');

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
  });
});
