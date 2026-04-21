import { FengShuiResult } from './types';

export interface ElevationData {
  center: number;
  north: number;
  northeast: number;
  east: number;
  southeast: number;
  south: number;
  southwest: number;
  west: number;
  northwest: number;
  all: number[];
}

export interface POIData {
  riverCount: number;
  stationCount: number;
}

export const calculateScores = (elev: ElevationData, poi: POIData): FengShuiResult => {
  const eC = elev.center;
  
  // A. 배산 (Mountain)
  const maxNorthElev = Math.max(elev.north, elev.northeast, elev.northwest);
  const northDiff = maxNorthElev - eC;
  
  let mountainScore = 35;
  if (northDiff > 2) {
    mountainScore = Math.round(Math.min(100, 80 + (northDiff * 1.5)));
  } else if (eC > 150) {
    mountainScore = Math.round(Math.min(85, 70 + (eC / 20)));
  }

  const mountainReason = mountainScore > 80 
    ? `해발 ${Math.round(eC)}m 높이의 산자락에 위치하여 뒤쪽의 ${Math.round(maxNorthElev)}m 지형이 기운을 완벽히 갈무리해줍니다.`
    : `주변보다 고도가 낮거나 뒤쪽이 트여 있어 산의 정기를 받기에 다소 아쉬운 지형입니다.`;

  // B. 임수 (Water)
  const minSouthElev = Math.min(elev.south, elev.southeast, elev.southwest);
  const southDiff = eC - minSouthElev;
  
  const waterBase = poi.riverCount > 0 ? 85 : 50;
  const waterScore = Math.round(Math.min(100, waterBase + (southDiff * 2)));
  
  const waterReason = poi.riverCount > 0 
    ? `인근의 물길과 함께 지형이 남쪽으로 시원하게 낮아져 재물운의 흐름이 매우 활발합니다.` 
    : `앞쪽 개방감은 양호하나 실제 하천이 멀리 있어 현대적 비보가 권장됩니다.`;

  // C. 안정성 (Stability)
  const avg = elev.all.reduce((a, b) => a + b, 0) / elev.all.length;
  const stdDev = Math.sqrt(elev.all.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / elev.all.length);
  const stabilityScore = Math.round(Math.max(0, 100 - (stdDev * 3.5)));
  const stabilityReason = stabilityScore > 75 
    ? `지형의 기복이 완만하고 고르게 형성되어 마음이 편안해지는 안정적인 터입니다.` 
    : `경사가 급하고 지형이 험준하여 기운이 거칠게 흐를 수 있습니다.`;

  // D. 현대/균형
  const balanceDiff = Math.abs(elev.east - elev.west);
  const balanceScore = Math.round(Math.max(0, 100 - (balanceDiff * 5)));
  const modernScore = Math.round(Math.min(100, 55 + (poi.stationCount * 12)));

  const totalScore = Math.round((mountainScore * 0.3 + waterScore * 0.25 + stabilityScore * 0.15 + modernScore * 0.15 + balanceScore * 0.15));

  // 리포트 멘트 생성
  let summary = "";
  if (totalScore >= 90) summary = "천하의 명당입니다. 기운이 한곳으로 모여드는 혈처(穴處)에 가깝습니다.";
  else if (totalScore >= 80) summary = "좋은 기운이 깃든 길지입니다. 안정적인 주거 환경과 발전하는 운세를 동시에 가졌습니다.";
  else if (totalScore >= 60) summary = "무난하고 평탄한 터입니다. 본인의 노력 여하에 따라 기운을 얼마든지 길하게 바꿀 수 있습니다.";
  else summary = "기운이 다소 불안정하게 흐르는 곳입니다. 인테리어 처방을 통한 기운의 중화가 필수적입니다.";

  // 역사적 매칭 (4번 결정 반영)
  let historicalMatch = "평범한 생활의 터전";
  if (mountainScore > 90 && waterScore > 90) historicalMatch = "조선 왕릉 명당 (천하명당)";
  else if (mountainScore > 85) historicalMatch = "선비의 안식처 (정신적 안정)";
  else if (waterScore > 85) historicalMatch = "만상객주 터 (재물운 폭발)";

  return {
    score: totalScore,
    scores: [mountainScore, waterScore, stabilityScore, modernScore, balanceScore],
    reasons: [
      mountainReason, 
      waterReason, 
      stabilityReason, 
      `주변 교통 인프라를 통해 ${poi.stationCount > 0 ? '활발한' : '차분한'} 사회적 에너지가 유입됩니다.`,
      `좌우 고도차가 ${Math.round(balanceDiff)}m로 ${balanceDiff < 5 ? '조화로운' : '다소 치우친'} 균형을 보여줍니다.`
    ],
    analysis: {
      total: `${summary} ${mountainReason} ${waterReason}`,
    },
    historicalMatch
  };
};
