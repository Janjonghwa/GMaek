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
  signature?: string;
  isPartial?: boolean;
  cached?: boolean;
  address?: string;
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
