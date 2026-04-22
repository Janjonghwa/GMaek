# TODOS

Updated: 2026-04-22

## Active Backlog

| ID | Item | Priority | Status | Owner | Due |
|---|---|---|---|---|---|
| T-001 | 다운로드 실패 UX를 alert에서 toast 패턴으로 통일 | P1 | DONE | FE | 2026-04-22 |
| T-002 | 오버레이/모달 접근성 완료 (focus trap, ESC close, aria-label) | P0 | DONE | FE | 2026-04-22 |
| T-003 | `DESIGN.md` 정식 생성(토큰/타이포/모션 규격) | P1 | DONE | Design/FE | 2026-04-21 |

## Completed in Lane D (2026-04-22)

- `page.tsx`: 다운로드 실패 alert 제거, aria-live toast 도입
- `page.tsx`: 모바일 히스토리 오버레이 ESC 닫기 + dialog aria 속성 적용
- `ResultCard.tsx`: 상세 모달 focus trap + ESC + aria-label 적용
- `RadarChart.tsx`: 키보드(Enter/Space) 접근 + focus 가능한 인터랙션 적용

## Phase 2 Deferred

| ID | Item | Priority | Status | Notes |
|---|---|---|---|---|
| P2-001 | Supabase DB 연동 및 전국 명당 히트맵 | P2 | DEFERRED | 로컬 검증 루프 안정화 후 착수 |
| P2-002 | 카카오 공유 API 기반 배틀 초대장 발송 | P2 | DEFERRED | 핵심 분석 UX 안정화 이후 진행 |
| P2-003 | 실시간 멀티유저 랭킹/리더보드 | P3 | DEFERRED | Phase 2 후반 검토 |

## Definition of Done for Accessibility (T-002)

1. 모든 모달/오버레이는 키보드 포커스 트랩을 제공한다.
2. ESC 키로 닫기가 동작한다.
3. 닫기 버튼에는 명시적 `aria-label`이 있다.
4. 키보드 전용 사용자로 주요 흐름(지도 클릭→결과 확인→닫기) 재현 가능.
