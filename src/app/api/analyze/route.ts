import { NextResponse } from 'next/server';
import { analyzeFengShui } from '@/lib/fengshui/engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');

  if (!lat || !lng) {
    return NextResponse.json({ error: '위도와 경도 좌표가 필요합니다.' }, { status: 400 });
  }

  try {
    const result = await analyzeFengShui(lat, lng);
    return NextResponse.json(result);
  } catch (error: any) {
    // 3A/7A Error Handling
    if (error.message.includes('지원하지 않는 지역')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return NextResponse.json({ error: '고도 분석 서버의 응답이 지연되고 있습니다. 다시 시도해주세요.' }, { status: 504 });
    }
    
    return NextResponse.json({ error: '지형 분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
