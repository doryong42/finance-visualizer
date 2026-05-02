# 재무 데이터 시각화 분석 서비스

> 누구나 쉽게 이해할 수 있는 국내 상장기업 재무제표 분석 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **기업 검색** | 3,864개 상장기업을 회사명·영문명·종목코드로 즉시 검색 |
| **재무 차트** | 재무상태표·손익계산서 3개년 비교 차트 (Recharts) |
| **핵심 지표** | 부채비율, 영업이익률, 순이익률, ROE 자동 계산 |
| **연결/별도 전환** | CFS(연결재무제표) / OFS(별도재무제표) 선택 |
| **AI 분석** | Gemini AI가 재무 데이터를 쉬운 말로 설명 (스트리밍) |
| **실시간 데이터** | 금융감독원 OpenDART API 연동 (데모 데이터 없음) |

---

## 스크린샷

### 메인 검색 페이지
- 다크 테마 히어로 섹션
- 실시간 자동완성 검색창
- 인기 기업 바로가기

### 재무 분석 페이지
- 핵심 지표 카드 (자산, 부채비율, 영업이익률 등)
- 재무상태표 막대 차트 (자산/부채/자본)
- 손익계산서 복합 차트 (매출/이익 + 영업이익률 꺾은선)
- 주요 계정 상세 테이블
- AI 재무 해설 패널

---

## 기술 스택

```
Frontend   Next.js 14 (App Router) + TypeScript + Tailwind CSS
Charts     Recharts
AI         Google Gemini API (gemini-2.0-flash / gemini-2.5-flash)
Data API   금융감독원 OpenDART (단일회사 주요계정 fnlttSinglAcnt)
DB         corp.xml → public/corps.json (빌드 타임 변환)
Deploy     Vercel (Serverless Functions)
```

---

## 로컬 실행

### 1. 저장소 클론

```bash
git clone https://github.com/doryong42/finance-visualizer.git
cd finance-visualizer
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열고 API 키를 입력합니다:

```env
OPENDART_API_KEY=your_opendart_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

- **OpenDART API 키**: [dart.fss.or.kr](https://opendart.fss.or.kr) 에서 발급
- **Gemini API 키**: [aistudio.google.com](https://aistudio.google.com) 에서 발급

### 4. 기업 데이터 변환

`corp.xml` 파일을 프로젝트 상위 디렉토리 또는 루트에 위치시킨 후 실행:

```bash
npm run convert
```

`public/corps.json` 파일이 생성됩니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인

---

## Vercel 배포

### 1. Vercel 프로젝트 연결

[vercel.com](https://vercel.com) → **Add New Project** → `finance-visualizer` 저장소 선택

### 2. 환경 변수 등록

Vercel 대시보드 → Settings → Environment Variables:

| 키 | 값 |
|----|-----|
| `OPENDART_API_KEY` | OpenDART API 키 |
| `GEMINI_API_KEY` | Gemini API 키 |

### 3. 배포

**Deploy** 클릭. `prebuild` 스크립트가 자동으로 `corps.json`을 생성합니다.

> `corp.xml`은 Vercel 빌드 환경에 포함되어 있지 않으므로, `public/corps.json`을 저장소에 포함시키거나 빌드 전에 생성해야 합니다. 현재 저장소에는 `public/corps.json`이 포함되어 있습니다.

---

## 프로젝트 구조

```
finance/
├── .env.example                    # 환경 변수 템플릿
├── .env.local                      # 실제 API 키 (gitignore)
├── scripts/
│   └── convert-corp-xml.mjs        # corp.xml → corps.json 변환 스크립트
├── public/
│   └── corps.json                  # 3,864개 기업 데이터
└── src/
    ├── app/
    │   ├── page.tsx                # 메인 검색 페이지
    │   ├── company/
    │   │   └── [corpCode]/
    │   │       └── page.tsx        # 재무 분석 페이지
    │   └── api/
    │       ├── financial/
    │       │   └── route.ts        # OpenDART API 프록시
    │       └── analyze/
    │           └── route.ts        # Gemini AI 분석 API
    ├── components/
    │   ├── SearchBar.tsx           # 자동완성 검색창
    │   ├── YearSelector.tsx        # 연도/보고서/연결별도 선택
    │   ├── FinancialCharts.tsx     # 재무 차트 컴포넌트
    │   └── AIAnalysis.tsx          # AI 분석 패널 (스트리밍)
    └── lib/
        ├── types.ts                # TypeScript 타입 정의
        └── formatters.ts           # 숫자 포맷 유틸 (조/억원)
```

---

## API 구조

### `GET /api/financial`

OpenDART 단일회사 주요계정 API 프록시

| 파라미터 | 필수 | 설명 |
|----------|------|------|
| `corp_code` | O | 기업 고유번호 (8자리) |
| `bsns_year` | O | 사업연도 (예: 2023) |
| `reprt_code` | - | 보고서 코드 (기본: 11011 사업보고서) |

보고서 코드:
- `11011` 사업보고서 (연간)
- `11012` 반기보고서
- `11013` 1분기보고서
- `11014` 3분기보고서

### `POST /api/analyze`

Gemini AI 재무 분석 (Server-Sent Events 스트리밍)

```json
{
  "corpName": "삼성전자",
  "items": [ ...FinancialItem[] ]
}
```

---

## 데이터 출처

- **기업 목록**: 금융감독원 전자공시시스템 (DART) corp.xml
- **재무 데이터**: [OpenDART API](https://opendart.fss.or.kr) - 단일회사 주요계정 (`fnlttSinglAcnt`)
- **AI 분석**: Google Gemini API

---

## 주의사항

- 이 서비스의 AI 분석은 **투자 참고용**이며 투자 권유가 아닙니다.
- 실제 투자 결정은 전문가와 상담하시기 바랍니다.
- API 키는 절대 공개 저장소에 커밋하지 마세요.
