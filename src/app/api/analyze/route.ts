import { NextResponse } from 'next/server';
import { analyzeFengShui } from '@/lib/fengshui/engine';
import { jsonError } from '@/lib/api/error-response';
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/api/analyze-cache';
import { checkRateLimit, extractClientId } from '@/lib/api/rate-limit';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');

  if (!lat || !lng) {
    return jsonError(400, 'INVALID_COORDINATES', '위도와 경도 좌표가 필요합니다.');
  }

  const clientId = extractClientId(request);
  const limit = checkRateLimit(clientId);
  if (!limit.allowed) {
    return jsonError(429, 'RATE_LIMITED', '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', {
      retryAfterSeconds: Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000)),
    });
  }

  const cached = getCachedAnalysis(lat, lng);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  try {
    const result = await analyzeFengShui(lat, lng);
    setCachedAnalysis(lat, lng, result);
    return NextResponse.json({ ...result, cached: false });
  } catch (error: any) {
    // 3A/7A Error Handling
    if (error.message.includes('지원하지 않는 지역')) {
      return jsonError(400, 'REGION_NOT_SUPPORTED', error.message);
    }
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return jsonError(504, 'UPSTREAM_TIMEOUT', '고도 분석 서버의 응답이 지연되고 있습니다. 다시 시도해주세요.');
    }

    return jsonError(500, 'ANALYSIS_FAILED', '지형 분석 중 오류가 발생했습니다.');
  }
}
