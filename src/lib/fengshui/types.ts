export interface Coordinate {
  lat: number;
  lng: number;
}

export interface FengShuiScores {
  mountainScore: number;
  waterScore: number;
  stabilityScore: number;
  modernScore: number;
  balanceScore: number;
}

export interface FengShuiResult {
  score: number;
  scores: number[];
  analysis: {
    total: string;
  };
  reasons: string[];
  historicalMatch?: string;
  signature?: string; // 1A: 보안 서명
  isPartial?: boolean; // 2A: 데이터 누락 여부
  cached?: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  coord: Coordinate;
  result: FengShuiResult;
}

export interface StorageDataV1 {
  version: 'v1';
  history: HistoryItem[];
}
