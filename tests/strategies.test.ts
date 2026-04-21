import { describe, it, expect } from 'vitest';
import { calculateScores } from '../src/lib/fengshui/strategies';

describe('FengShui Strategies Algorithm', () => {
  it('천하명당(왕릉 터) 조건이 맞을 때 최고 점수를 반환한다', () => {
    const elev = {
      center: 100, north: 150, northeast: 140, northwest: 145, // 뒤가 50m 높음
      south: 80, southeast: 85, southwest: 82, // 앞이 20m 낮음
      east: 100, west: 100, // 좌우 균형 완벽
      all: [100, 150, 140, 145, 80, 85, 82, 100, 100]
    };
    const poi = { riverCount: 1, stationCount: 1 }; // 물이 있음

    const result = calculateScores(elev, poi);

    expect(result.scores[0]).toBe(100); // 배산 만점
    expect(result.scores[1]).toBe(100); // 임수 만점
    expect(result.historicalMatch).toBe('조선 왕릉 명당 (천하명당)');
  });

  it('뒤가 뚫린 지형일 때 배산 점수가 낮게 나와야 한다', () => {
    const elev = {
      center: 100, north: 90, northeast: 90, northwest: 90, // 뒤가 더 낮음
      south: 90, southeast: 90, southwest: 90,
      east: 100, west: 100,
      all: [100, 90, 90, 90, 90, 90, 90, 100, 100]
    };
    const poi = { riverCount: 0, stationCount: 0 };

    const result = calculateScores(elev, poi);
    expect(result.scores[0]).toBe(35); 
    expect(result.historicalMatch).not.toBe('조선 왕릉 명당 (천하명당)');
  });
});
