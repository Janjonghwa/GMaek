import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return new NextResponse('Missing coordinates', { status: 400 });
  }

  const apiKey = process.env.VWORLD_API_KEY;
  // VWorld 정적 지도 API 호출 (위도, 경도 순서 및 마커 포함)
  const vworldUrl = `https://api.vworld.kr/req/image?service=image&request=getmap&key=${apiKey}&center=${lng},${lat}&level=15&size=200,200&marker=point:${lng}%20${lat}&basemap=GRAPHIC`;

  try {
    const response = await fetch(vworldUrl);
    if (!response.ok) throw new Error('VWorld API response error');
    
    const buffer = await response.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Map Proxy Error:', error);
    return new NextResponse('Failed to fetch map image', { status: 500 });
  }
}
