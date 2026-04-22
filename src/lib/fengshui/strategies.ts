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
  // 점수 조정: 표준편차 1당 2점 감점 (이전 3.5점은 너무 가혹함)
  const stabilityScore = Math.round(Math.max(40, Math.min(100, 100 - (stdDev * 2))));
  
  let stabilityReason = "";
  if (stabilityScore > 90) stabilityReason = `지형의 기복이 거의 없이 평탄하여 심리적 안정감을 극대화해주는 포근한 터입니다.`;
  else if (stabilityScore > 70) stabilityReason = `완만한 굴곡을 띄고 있어 삶의 기복이 적고 편안한 일상을 누리기 좋습니다.`;
  else stabilityReason = `고도 변화(표준편차 ${stdDev.toFixed(1)}m)가 다소 큰 편이므로, 가구 배치를 통해 심리적 안정감을 보완하는 것이 좋습니다.`;

  // D. 현대 (Modern)
  // 역세권이나 교통 인프라는 현대 풍수에서 '사람과 재물의 통로'로 봅니다.
  const modernScore = Math.round(Math.min(100, 60 + (poi.stationCount * 15)));
  let modernReason = "";
  if (poi.stationCount >= 3) modernReason = `반경 내 ${poi.stationCount}개의 역(통로)이 있어 사통팔달의 에너지가 넘치며, 재물과 사람이 빠르게 모여드는 현대적 명당입니다.`;
  else if (poi.stationCount > 0) modernReason = `적절한 교통 인프라를 끼고 있어 외부의 긍정적인 에너지가 집 안으로 원활하게 유입됩니다.`;
  else modernReason = `도심의 번잡함에서 벗어나 고즈넉하고 차분한 기운을 간직하고 있습니다. 조용한 집중이 필요한 분께 어울립니다.`;

  // E. 균형 (Balance - 좌청룡 우백호)
  const balanceDiff = Math.abs(elev.east - elev.west);
  // 점수 조정: 1m 차이당 1.5점 감점
  const balanceScore = Math.round(Math.max(50, Math.min(100, 100 - (balanceDiff * 1.5))));
  
  let balanceReason = "";
  if (balanceDiff < 3) {
    balanceReason = `좌청룡(동쪽)과 우백호(서쪽)의 높낮이가 조화로워 대인관계와 건강의 밸런스가 완벽에 가깝습니다.`;
  } else if (elev.east > elev.west) {
    balanceReason = `좌청룡(동쪽)이 우백호보다 ${Math.round(balanceDiff)}m 높아 명예와 학업운(관운)이 유리한 지형입니다.`;
  } else {
    balanceReason = `우백호(서쪽)가 좌청룡보다 ${Math.round(balanceDiff)}m 높아 재물운과 실속을 챙기기 좋은 지형입니다.`;
  }

  const totalScore = Math.round((mountainScore * 0.3 + waterScore * 0.25 + stabilityScore * 0.15 + modernScore * 0.15 + balanceScore * 0.15));

  // -----------------------------------------------------
  // 리포트 멘트 생성 (동적 분석)
  // -----------------------------------------------------
  const allScores = [
    { name: '배산', score: mountainScore },
    { name: '임수', score: waterScore },
    { name: '안정', score: stabilityScore },
    { name: '현대', score: modernScore },
    { name: '균형', score: balanceScore }
  ];
  allScores.sort((a, b) => b.score - a.score);
  const bestAttr = allScores[0];
  const worstAttr = allScores[allScores.length - 1];

  let summary = "";
  if (totalScore >= 90) summary = "기운이 한곳으로 모여드는 천하의 명당(혈처)입니다.";
  else if (totalScore >= 80) summary = "좋은 기운이 고르게 깃든 길지(吉地)입니다.";
  else if (totalScore >= 60) summary = "무난하고 평범한 일상을 지켜주는 터입니다.";
  else summary = "기운의 보완이 조금 필요한 터입니다.";

  let highlight = "";
  if (bestAttr.name === '배산') highlight = "특히 든든한 등고가 있어 귀인을 만나고 보호받는 기운이 강합니다.";
  else if (bestAttr.name === '임수') highlight = "특히 앞이 트여있어 재물의 흐름이 원활하고 막힘이 없는 것이 장점입니다.";
  else if (bestAttr.name === '안정') highlight = "특히 지형의 기복이 없어 평안한 일상과 정신적 휴식을 취하기에 최적화되어 있습니다.";
  else if (bestAttr.name === '현대') highlight = "특히 대중교통 등 인프라 에너지가 뛰어나 현대 사회의 부를 축적하기 좋은 입지입니다.";
  else if (bestAttr.name === '균형') highlight = "특히 좌우 지형의 밸런스가 뛰어나 가족 간의 화목이나 대인관계운이 아주 좋습니다.";

  let advice = "";
  if (worstAttr.name === '균형' && worstAttr.score < 70) advice = "다만 좌우 지형이 다소 치우쳐 있으니, 부족한 쪽(낮은 곳)에 키 큰 화분을 두어 수평을 맞추면 완벽합니다.";
  else if (worstAttr.name === '안정' && worstAttr.score < 70) advice = "지형의 경사가 있는 편이니 집안에 키가 크고 잎이 넓은 식물을 두어 기운의 흔들림을 잡아주세요.";
  else if (worstAttr.name === '현대' && worstAttr.score < 70) advice = "상대적으로 외부 에너지가 정적이므로 현관에 밝은 조명이나 종(Bell)을 달아 활기를 불어넣으세요.";
  else if (worstAttr.name === '임수' && worstAttr.score < 70) advice = "물(재물)의 기운이 약한 편이므로 거실 창가나 입구에 작은 어항이나 수경 식물을 두면 좋습니다.";
  else if (worstAttr.name === '배산' && worstAttr.score < 70) advice = "등을 받쳐주는 기운이 얕으니, 침대 헤드를 튼튼한 벽 쪽에 바짝 붙여 안정감을 보완하세요.";
  else advice = "전반적인 밸런스가 훌륭하여 특별히 흠잡을 곳이 없는 멋진 공간입니다. 지금의 기운을 잘 유지하세요!";

  const totalReport = `${summary} ${highlight} ${advice}`;

  // 역사적 매칭 (다양한 기준 반영)
  let historicalMatch = "소박한 일상의 터전 (평온한 일상)";
  if (totalScore >= 95) historicalMatch = "비룡승운의 터 (천하제일 명당)";
  else if (mountainScore > 90 && waterScore > 90) historicalMatch = "조선 왕릉급 명당 (천하명당)";
  else if (mountainScore > 85 && stabilityScore > 85) historicalMatch = "학이 깃드는 청학동 (정신적 힐링)";
  else if (mountainScore > 85) historicalMatch = "선비의 안식처 (정신적 안정)";
  else if (waterScore > 85 && modernScore > 80) historicalMatch = "거상의 금고 (재물운 잭팟)";
  else if (waterScore > 85) historicalMatch = "만상객주 터 (활발한 교류)";
  else if (modernScore > 90) historicalMatch = "한양 도성의 중심 (현대적 편리함)";
  else if (balanceScore > 90) historicalMatch = "음양오행의 조화 (무병장수)";
  else if (totalScore >= 75) historicalMatch = "안정적인 둥지 (소소한 행복)";

  return {
    score: totalScore,
    scores: [mountainScore, waterScore, stabilityScore, modernScore, balanceScore],
    reasons: [
      mountainReason, 
      waterReason, 
      stabilityReason, 
      modernReason,
      balanceReason
    ],
    analysis: {
      total: totalReport,
    },
    historicalMatch
  };
};
