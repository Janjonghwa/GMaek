import { describe, expect, it, beforeEach, vi } from 'vitest';
import { generateSignature, verifySignature } from '../src/lib/fengshui/signature';

describe('signature module', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.SIGNING_KEY = 'test-signing-secret';
  });

  it('같은 입력에는 동일한 서명을 생성한다', async () => {
    const a = await generateSignature(88, '조선 왕릉 명당 (천하명당)');
    const b = await generateSignature(88, '조선 왕릉 명당 (천하명당)');

    expect(a).toBe(b);
    expect(a).toHaveLength(12);
  });

  it('verifySignature는 올바른 서명만 통과시킨다', async () => {
    const sig = await generateSignature(91, '명당');

    await expect(verifySignature(91, '명당', sig)).resolves.toBe(true);
    await expect(verifySignature(91, '명당', 'deadbeefdead')).resolves.toBe(false);
    await expect(verifySignature(91, '명당', '')).resolves.toBe(false);
  });
});
