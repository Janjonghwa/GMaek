import axios from 'axios';
import { calculateScores, ElevationData, POIData } from './strategies';
import { FengShuiResult } from './types';
import { generateSignature } from './signature';

const isWithinKorea = (lat: number, lng: number) => {
  return lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132;
};

interface ElevationResult {
  latitude: number;
  longitude: number;
  elevation: number;
}

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

  const vworldApiKey = process.env.VWORLD_API_KEY;
  if (!vworldApiKey) throw new Error('VWORLD_API_KEY is missing');

  const startTime = Date.now();
  let isPartial = false;

  try {
    let elevs: number[];
    try {
      // VWorld 고도 API (DEM) 사용 - 9개 지점 병렬 요청
      const elevationPromises = samplePoints.map(p =>
        axios.get('http://api.vworld.kr/req/dem', {
          params: {
            key: vworldApiKey,
            service: 'dem',
            request: 'getdem',
            location: `${p.lng},${p.lat}`,
            format: 'json',
            domain: 'localhost' // 브이월드 API는 호출 도메인 인증이 엄격할 수 있습니다
          },
          timeout: 5000
        }).then(res => {
          // VWorld 응답 구조는 res.data.response.result.den 입니다.
          // 만약 404나 에러가 나면 0을 반환하여 시뮬레이션으로 넘어가게 합니다.
          if (res.data?.response?.status === 'NOT_FOUND' || res.data?.response?.status === 'ERROR') {
            return 0;
          }
          const val = res.data?.response?.result?.den;
          return val ? parseFloat(val) : 0;
        })
      );

      elevs = await Promise.all(elevationPromises);

      // 만약 모든 고도가 0이라면 실패로 간주하고 시뮬레이션으로 전환
      if (elevs.every(e => e === 0)) {
        throw new Error('All elevation values returned 0');
      }
    } catch (e) {
      console.warn("VWorld Elevation API error. Using mock elevation data.", e);
      isPartial = true;
      // 가상 고도 데이터 생성 (에러 방지용)
      const baseElev = Math.floor(Math.random() * 50) + 20;
      elevs = samplePoints.map((p, i) => {
        if (i === 0) return baseElev;
        if (i === 1 || i === 2 || i === 8) return baseElev + (Math.random() * 15 + 5);
        if (i === 4 || i === 5 || i === 6) return Math.max(0, baseElev - (Math.random() * 10 + 2));
        return baseElev + (Math.random() * 10 - 5);
      });
    }

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

    const stationLookup = async () => {
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
    };

    const [riverCount, stationCount] = await Promise.all([
      kakaoSearch('물'),
      stationLookup(),
    ]);

    const result = calculateScores(elevData, { riverCount, stationCount });

    // 최종 결과에 서명 및 신뢰도 추가
    result.isPartial = isPartial;
    result.signature = await generateSignature(result.score, result.historicalMatch || '명당');

    const duration = Date.now() - startTime;
    console.log(JSON.stringify({ type: 'FENGSHUI_ANALYSIS_SUCCESS', lat, lng, durationMs: duration, score: result.score }));

    return result;

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(JSON.stringify({ type: 'FENGSHUI_ANALYSIS_ERROR', lat, lng, durationMs: duration, error: error.message }));
    throw error;
  }
};
