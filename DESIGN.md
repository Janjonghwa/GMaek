# DESIGN.md

Status: ACTIVE  
Updated: 2026-04-21

## 1) Design Principles

1. **Map First**: 첫 화면의 주행동은 항상 지도 클릭이다.
2. **Explainability**: 점수보다 근거를 먼저 납득시킨다.
3. **One Surface, One Job**: 홈/설문/로딩/결과 각 화면은 단일 목적을 유지한다.

## 2) Design Tokens

### Colors
- `fengshui-gold`: `#fbc531`
- `fengshui-navy`: `#1a1a2e`
- `bg-base`: `#0c0c1e`

### Radius
- Large card: `40px`
- Modal / sheet: `32px ~ 48px`

### Motion
- Standard transitions: `300ms ~ 1000ms`
- Loading scan animation: 순차 지연 기반(8방위 리듬 유지)

## 3) Typography

- 본문 최소 크기: `16px`
- 큰 수치/점수 텍스트는 대비 3:1 이상
- 본문 텍스트 대비 4.5:1 이상

## 4) Component Contracts

- `MapView`: 좌표 선택의 단일 진입점, 로딩/오류 오버레이와 충돌 금지
- `ResultCard`: 점수/매칭/근거를 우선순위대로 배치
- `CollectionList`: 최근 10개 FIFO 히스토리 표시
- `RadarChart`: 각 축 포인트는 클릭 + 키보드 포커스 가능

## 5) Interaction States

- Loading: 진행 감각(스캔 애니메이션 + 상태 문구)
- Empty: 첫 액션을 명확히 유도
- Error: 복구 액션(재시도/닫기) 제공
- Success: 핵심 결과와 후속 액션(저장/재분석/다운로드) 제공
- Partial: 누락 배지와 보수적 안내 문구 노출

## 6) Accessibility Baseline

1. 터치 타깃은 최소 `44x44px`.
2. 모달/오버레이는 ESC 닫기 + 포커스 트랩 + aria-label 필수.
3. 차트 상호작용은 마우스 전용 금지(키보드 접근 가능).

## 7) Responsive Rules

- Mobile (<=768): 히스토리 FAB + 바텀시트 중심
- Tablet (769~1279): 결과 카드 폭 420px 이하
- Desktop (>=1280): 우측 히스토리 패널 + 중앙 결과 축 유지
