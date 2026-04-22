import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/fengshui/signature', () => ({
  verifySignature: vi.fn(),
}));

import { GET } from '@/app/api/share/route';
import { verifySignature } from '@/lib/fengshui/signature';

describe('/api/share route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('서명 검증 실패 시 SIGNATURE_INVALID를 반환한다', async () => {
    vi.mocked(verifySignature).mockResolvedValue(false);

    const req = new Request('http://localhost/api/share?score=88&match=%EB%AA%85%EB%8B%B9&lat=37.5&lng=126.9&sig=bad') as any;
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.code).toBe('SIGNATURE_INVALID');
  });

  it('서명 검증 성공 시 이미지 응답을 생성한다', async () => {
    vi.mocked(verifySignature).mockResolvedValue(true);

    const req = new Request('http://localhost/api/share?score=91&match=%EB%AA%85%EB%8B%B9&lat=37.5&lng=126.9&sig=good') as any;
    const response = await GET(req);

    expect(response.status).toBe(200);
  });

  it('예외 발생 시 IMAGE_GENERATION_FAILED를 반환한다', async () => {
    vi.mocked(verifySignature).mockRejectedValue(new Error('boom'));

    const req = new Request('http://localhost/api/share?score=91&match=%EB%AA%85%EB%8B%B9&lat=37.5&lng=126.9&sig=good') as any;
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('IMAGE_GENERATION_FAILED');
  });
});
