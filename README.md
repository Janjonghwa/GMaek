
<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Kakao_Map_API-FFCD00?style=for-the-badge&logo=kakao&logoColor=black" alt="Kakao Map" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  
  <br />
  <br />

  <h1>🧭 지맥 (G-Maek)</h1>
  <p><b>당신의 일상을 바꾸는 2030 모던 풍수지리 & 인테리어 처방전</b></p>

  <br />
</div>

## 🌐 라이브 데모 (Live Demo)

현재 Vercel을 통해 안정적으로 배포되어 운영 중입니다. 아래 링크를 통해 별도의 설치 없이 바로 서비스를 체험해 보실 수 있습니다!

👉 **[지맥(G-Maek) 웹사이트 바로가기](https://g-maek.vercel.app)**

---

## 🌌 소개 (Introduction)

**지맥(G-Maek)**은 전통 풍수지리(Geomancy) 사상을 현대적 데이터와 세련된 UI/UX로 재해석한 웹 애플리케이션입니다. 
원하는 땅(지도)을 클릭하기만 하면 해당 위치의 **지형 고도, 하천, 교통 인프라(POI) 데이터**를 실시간으로 분석하여 그곳의 기운을 감정해 줍니다. 
단순한 운세가 아닌 실제 지리 데이터를 기반으로 한 **'초개인화 인테리어 처방전'**을 받아보세요!

---

## ✨ 핵심 기능 (Features)

- 🗺️ **인터랙티브 풍수 지도**: 카카오 지도의 지형도(Terrain)와 다크 테마를 활용한 프리미엄 지도 탐색.
- 📡 **팔괘(八卦) 정밀 스캔**: 좌표 클릭 시 8방위의 고도 데이터와 주변 인프라를 스캔하는 화려한 레이더 애니메이션 제공.
- 📊 **5대 기운 분석 시스템**: 배산, 임수, 안정, 현대, 균형 등 5가지 지표를 분석하여 레이더 차트로 시각화.
- 📜 **다이내믹 풍수 총평 (Geomancy Report)**: 지표의 장단점을 분석해 "한양 도성의 중심", "거상의 금고" 등 위트 있는 칭호와 맞춤형 가구 배치 조언 제공.
- 🗂️ **나만의 명당 컬렉션 (My Collection)**: 분석한 명당 기록을 로컬 스토리지에 자동 저장하고 언제든 다시 열람 가능.
- 📸 **명당 카드 저장**: 분석 결과를 아름다운 이미지 카드 형태로 다운로드하여 공유 가능 (html2canvas 활용).

---

## 🔮 풍수 분석 알고리즘 (The 5 Pillars)

지맥의 분석 엔진은 다음과 같은 실제 지리적 데이터를 수집하여 점수화합니다.

1. **배산 (Mountain)** ⛰️ : 북쪽 방위의 고도 상승률을 계산하여 뒤를 든든하게 받쳐주는 산의 기운을 측정.
2. **임수 (Water)** 💧 : 남쪽의 개방감 및 카카오 로컬 API를 통한 반경 2km 내 하천/수계 존재 여부 분석.
3. **안정 (Stability)** 🧘‍♂️ : 중심 좌표와 8방위 고도의 표준편차를 계산하여 지형의 기복과 삶의 평안함 측정.
4. **현대 (Modern)** 🏙️ : 지하철역 및 주요 교통 인프라 개수를 통해 현대 풍수의 핵심인 '사람과 재물의 흐름' 계산.
5. **균형 (Balance)** ⚖️ : 동쪽(좌청룡)과 서쪽(우백호)의 고도차를 비교하여 음양오행의 조화와 대인관계운 측정.

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Glassmorphism, Custom Animations, Gold Gradients)
- **Icons:** Lucide-React
- **Charts:** Recharts (Radar Chart)

### APIs & Data
- **Maps & Geocoding:** Kakao Maps JS SDK, Kakao Local REST API
- **Elevation Data:** Open-Elevation API (with dynamic mock data fallback)

---

## 🚀 시작하기 (Getting Started)

### 1. 환경 변수 설정
루트 디렉토리에 `.env.local` 파일을 생성하고 발급받은 API 키를 입력하세요.

```env
# 카카오맵 JavaScript API 키 (developers.kakao.com 에서 발급)
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id_here

# 카카오 REST API 키 (로컬 API 상권/하천 분석용)
KAKAO_REST_KEY=your_kakao_rest_key_here
```

### 2. 패키지 설치
```bash
npm install
# 또는
yarn install
```

### 3. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 지맥을 경험해 보세요!

---

## 🎨 디자인 프리뷰 (Design Preview)

*(여기에 나중에 스크린샷 이미지들을 추가해 주세요)*

- **Main Map & Radar Scanner**:
 <img width="1272" height="1056" alt="스크린샷 2026-04-22 163541" src="https://github.com/user-attachments/assets/1528e901-5cc1-4c2c-8f8c-922940a12d32" />
 <img width="1265" height="1025" alt="image" src="https://github.com/user-attachments/assets/50352efc-7798-4cf9-a41c-64cd2370d9b1" />
 
- **Result Card & Radar Chart**:
<img width="2373" height="1287" alt="image" src="https://github.com/user-attachments/assets/a331fef1-40fb-480e-aedb-927b6ef50e39" />

- **My Collection Dashboard**: `![Collection](placeholder)`
  <img width="1080" height="1920" alt="지맥-부적-1776843477869" src="https://github.com/user-attachments/assets/f1a0fa8c-9e48-476b-81a5-f5936778e749" />
  
---

## 📝 라이선스 (License)

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.
