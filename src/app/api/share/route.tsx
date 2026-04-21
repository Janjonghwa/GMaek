import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

export const runtime = 'edge';

// 1A: 서명 검증 함수
const verifySignature = (score: string, match: string, sig: string) => {
  const secret = process.env.KAKAO_REST_KEY || 'gmaek-fallback-secret';
  const expected = crypto.createHmac('sha256', secret)
    .update(`${score}:${match}`)
    .digest('hex')
    .substring(0, 12);
  return expected === sig;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const score = searchParams.get('score') || '0';
    const match = searchParams.get('match') || '풍수 명당';
    const lat = searchParams.get('lat') || '0.0000';
    const lng = searchParams.get('lng') || '0.0000';
    const sig = searchParams.get('sig') || '';

    // 서명 검증 실패 시 에러 이미지 혹은 빈 이미지 반환
    if (!verifySignature(score, match, sig)) {
      return new Response('Invalid Signature', { status: 403 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0c0c1e',
            color: 'white',
            position: 'relative',
            padding: '80px',
          }}
        >
          <div style={{ position: 'absolute', top: '40px', left: '40px', right: '40px', bottom: '40px', border: '4px solid #fbc531', opacity: 0.8 }} />
          <div style={{ position: 'absolute', top: '60px', left: '60px', right: '60px', bottom: '60px', border: '1px solid rgba(251,197,49,0.3)' }} />

          <div style={{ position: 'absolute', top: '25%', left: '10%', width: '80%', height: '50%', backgroundImage: 'radial-gradient(circle, rgba(251,197,49,0.1) 0%, rgba(12,12,30,0) 70%)' }} />

          <div style={{ position: 'absolute', top: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 28, color: '#fbc531', fontWeight: 700, letterSpacing: '0.2em' }}>GEOMANCY COORDINATES</span>
            <span style={{ fontSize: 36, marginTop: 15, color: 'white', opacity: 0.7 }}>{lat}N / {lng}E</span>
          </div>
          
          <div style={{ fontSize: 180, marginBottom: 40 }}>{parseInt(score) >= 90 ? '🌻' : parseInt(score) >= 80 ? '🌿' : '🌱'}</div>
          
          <h1 style={{ fontSize: 110, color: '#fbc531', margin: '30px 0', letterSpacing: '-0.05em', textAlign: 'center', fontWeight: 900 }}>{match}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', marginTop: 60 }}>
            <span style={{ fontSize: 260, fontWeight: 900, lineHeight: 1 }}>{score}</span>
            <div style={{ height: 14, width: 180, backgroundColor: '#fbc531', marginTop: 40 }} />
            <span style={{ fontSize: 32, marginTop: 50, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.6em', fontWeight: 700 }}>INTEGRATED ENERGY</span>
          </div>

          <div style={{ position: 'absolute', bottom: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ padding: '25px 80px', border: '2px solid rgba(251,197,49,0.5)', borderRadius: '100px', display: 'flex' }}>
              <span style={{ fontSize: 40, color: '#fbc531', fontWeight: 800 }}>지맥(G-Maek) 정밀 풍수</span>
            </div>
            <span style={{ fontSize: 24, marginTop: 30, color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>VERIFIED GIS ALGORITHM v2.0</span>
          </div>
        </div>
      ),
      { width: 1080, height: 1920 }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
