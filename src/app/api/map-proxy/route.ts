import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return new NextResponse('Missing coordinates', { status: 400 });
  }

  const apiKey = process.env.VWORLD_API_KEY;
  // VWorld 정적 위성 지도 API (PHOTO 모드)
  // 좌표 형식: center=lng,lat / marker=point:lng lat
  const vworldUrl = `https://api.vworld.kr/req/image?service=image&request=getmap&key=${apiKey}&center=${lng},${lat}&level=17&size=300,300&marker=point:${lng}%20${lat}&basemap=PHOTO&format=png`;

  console.log('Fetching map for:', { lat, lng });

  try {
    const response = await fetch(vworldUrl);
    if (!response.ok) {
      console.error('VWorld API Error Status:', response.status);
      throw new Error('VWorld API response error');
    }
    
    const buffer = await response.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Map Proxy Error:', error);
    return new NextResponse('Failed', { status: 500 });
  }
}
