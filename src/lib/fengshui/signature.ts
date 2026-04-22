const DEFAULT_SIGNING_SECRET = 'gmaek-fallback-secret';

const getSigningSecret = () => {
  return process.env.SIGNING_KEY || process.env.KAKAO_REST_KEY || DEFAULT_SIGNING_SECRET;
};

const toHex = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const hmacSha256 = async (secret: string, message: string) => {
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await globalThis.crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return toHex(signature);
};

export const generateSignature = async (score: number | string, match: string) => {
  const digest = await hmacSha256(getSigningSecret(), `${score}:${match}`);
  return digest.substring(0, 12);
};

export const verifySignature = async (score: number | string, match: string, received: string) => {
  if (!received) return false;

  const expected = await generateSignature(score, match);
  if (expected.length !== received.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ received.charCodeAt(i);
  }

  return mismatch === 0;
};
