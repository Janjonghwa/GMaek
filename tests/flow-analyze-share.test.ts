import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/fengshui/engine', () => ({
  analyzeFengShui: vi.fn(),
}));

import { GET as analyzeGET } from '@/app/api/analyze/route';
import { GET as shareGET } from '@/app/api/share/route';
import { analyzeFengShui } from '@/lib/fengshui/engine';
import { generateSignature } from '@/lib/fengshui/signature';

describe('minimal flow: analyze -> share', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('analyze 응답의 signature로 share 이미지를 생성할 수 있다', async () => {
    process.env.SIGNING_KEY = 'test-flow-signing-key';
    const historicalMatch = '조선 왕릉 명당 (천하명당)';
    const signature = await generateSignature(93, historicalMatch);

    vi.mocked(analyzeFengShui).mockResolvedValue({
      score: 93,
      scores: [95, 94, 90, 89, 88],
      analysis: { total: 'flow-result' },
      reasons: ['a', 'b', 'c', 'd', 'e'],
      historicalMatch,
      signature,
      isPartial: false,
    });

    const analyzeReq = new Request('http://localhost/api/analyze?lat=37.5665&lng=126.9780', {
      headers: {
        'x-forwarded-for': '198.51.100.1',
      },
    });

    const analyzeRes = await analyzeGET(analyzeReq);
    const analyzeBody = await analyzeRes.json();

    const shareReq = new Request(
      `http://localhost/api/share?score=${analyzeBody.score}&match=${encodeURIComponent(analyzeBody.historicalMatch)}&lat=37.5665&lng=126.9780&sig=${analyzeBody.signature}`
    ) as any;

    const shareRes = await shareGET(shareReq);

    expect(analyzeRes.status).toBe(200);
    expect(analyzeBody.signature).toBeTruthy();
    expect(shareRes.status).toBe(200);
  });
});
