import axios from 'axios';
import { calculateScores, ElevationData, POIData } from './strategies';
import { FengShuiResult } from './types';
import crypto from 'crypto';

const isWithinKorea = (lat: number, lng: number) => {
  return lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132;
};

interface ElevationResult {
  latitude: number;
  longitude: number;
  elevation: number;
}

// 1A: HMAC 서명 생성 함수
const generateSignature = (score: number, match: string) => {
  const secret = process.env.KAKAO_REST_KEY || 'gmaek-fallback-secret';
  return crypto.createHmac('sha256', secret)
    .update(`${score}:${match}`)
    .digest('hex')
    .substring(0, 12); // 짧은 서명
};

export const analyzeFengShui = async (lat: number, lng: number): Promise<FengShuiResult> => {
  if (!isWithinKorea(lat, lng)) {
    throw new Error('지원하지 않는 지역입니다. (한국 영토만 지원)');
  }

  const kakaoApiKey = process.env.KAKAO_REST_KEY;
  if (!kakaoApiKey) throw new Error('KAKAO_REST_KEY is missing');

  const offset = 0.002; 
  const samplePoints = [
    { lat, lng, name: 'center' },
    { lat: lat + offset, lng, name: 'N' },
    { lat: lat + offset, lng: lng + offset, name: 'NE' },
    { lat, lng: lng + offset, name: 'E' },
    { lat: lat - offset, lng: lng + offset, name: 'SE' },
    { lat: lat - offset, lng, name: 'S' },
    { lat: lat - offset, lng: lng - offset, name: 'SW' },
    { lat, lng: lng - offset, name: 'W' },
    { lat: lat + offset, lng: lng - offset, name: 'NW' },
  ];

  const startTime = Date.now();
  let isPartial = false;

  try {
    const elevationRes = await axios.post('https://api.open-elevation.com/api/v1/lookup', {
      locations: samplePoints.map(p => ({ latitude: p.lat, longitude: p.lng }))
    }, { timeout: 5000 });

    const results = elevationRes.data.results as ElevationResult[];
    const elevs = results.map(r => r.elevation);
    const [eC, eN, eNE, eE, eSE, eS, eSW, eW, eNW] = elevs;

    const elevData: ElevationData = {
      center: eC, north: eN, northeast: eNE, east: eE, southeast: eSE, south: eS, southwest: eSW, west: eW, northwest: eNW, all: elevs
    };

    const kakaoSearch = async (query: string) => {
      try {
        const res = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
          params: { query, x: lng, y: lat, radius: 2000, size: 10 },
          headers: { Authorization: `KakaoAK ${kakaoApiKey}` },
          timeout: 2500
        });
        
        const filtered = res.data.documents.filter((item: any) => 
          item.category_name.includes('하천') || item.category_name.includes('강') || 
          item.category_name.includes('호수') || item.category_name.includes('물가')
        );
        
        return filtered.length;
      } catch (e) { 
        isPartial = true; // 2A: 검색 실패 시 부분 분석 플래그 설정
        return 0; 
      }
    };
    
    const riverCount = await kakaoSearch('물');
    const stationCount = await (async () => {
      try {
        const res = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
          params: { query: '역', x: lng, y: lat, radius: 2000, size: 5 },
          headers: { Authorization: `KakaoAK ${kakaoApiKey}` },
          timeout: 2000
        });
        return res.data.meta.total_count;
      } catch (e) { 
        isPartial = true; 
        return 0; 
      }
    })();

    const result = calculateScores(elevData, { riverCount, stationCount });
    
    // 최종 결과에 서명 및 신뢰도 추가
    result.isPartial = isPartial;
    result.signature = generateSignature(result.score, result.historicalMatch || '명당');

    const duration = Date.now() - startTime;
    console.log(JSON.stringify({ type: 'FENGSHUI_ANALYSIS_SUCCESS', lat, lng, durationMs: duration, score: result.score }));

    return result;

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(JSON.stringify({ type: 'FENGSHUI_ANALYSIS_ERROR', lat, lng, durationMs: duration, error: error.message }));
    throw error;
  }
};
