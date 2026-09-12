# Kids Experience Booking Tracker - System Architecture

## Overview

**Core Purpose**: 아이와 함께 참여할 수 있는 공공기관, 박물관, 과학관, 기업 공장견학 등의 저가·무료·희소 체험 프로그램을 발견하고, 선착순 접수 시작일을 놓치지 않도록 추적하는 개인용 예약 시스템.

**Key Principle**: 사용자의 핵심 관심사는 "어디서 할 수 있는가"가 아니라 "언제 신청할 수 있는가"이다.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js/React)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Dashboard   │  │  Experience  │  │  Settings    │           │
│  │  (Timeline   │  │  Details     │  │  (관심 기관,  │           │
│  │  View)       │  │  & Booking   │  │   연령대)    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
           │                                    │
           └────────────────┬──────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API (Node.js/Nest.js)              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Experience  │  │  Crawler /   │  │  Pattern     │           │
│  │ Management  │  │  Watcher     │  │  Analyzer    │           │
│  │ Service     │  │  Service     │  │  Service     │           │
│  └─────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
           │                  │                  │
           └──────────────────┼──────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer (PostgreSQL)                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  experiences  │ experience_runs  │ pattern_history     │   │
│  │  institutions │ notifications    │ change_logs         │   │
│  │  user_prefs   │ bookmarks        │ crawl_history       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           ▲                  │
           └──────────────────┴────────────────┐
                                               ▼
┌─────────────────────────────────────────────────────────────────┐
│           External Data Sources (Crawlers / Adapters)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Seoul Public │  │  Museum      │  │  Science     │           │
│  │ Service Site │  │  Sites       │  │  Centers     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  Factory     │  │  Broadcasting│                             │
│  │  Tour Sites  │  │  Stations    │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Experience Management Service
**책임**: 체험 프로그램 CRUD 및 상태 관리

```typescript
// 주요 기능:
- createExperience()       // 신규 프로그램 등록
- updateExperience()       // 프로그램 정보 업데이트
- updateRunStatus()        // 특정 접수 회차 상태 변경
- getExperiencesByDeadline() // 시간 기반 필터링
```

### 2. Crawler / Watcher Service
**책임**: 정기적으로 외부 사이트 확인 및 변화 감지

**Workflow**:
```
1. 등록된 기관/프로그램 목록 로드
2. 각 adapter 실행
3. 신규 프로그램 발견 / 기존 프로그램 변화 감지
4. 변화 로그 기록
5. 변화 알림 발송
```

**핵심 감지 항목**:
- 신규 체험 프로그램 생성
- 접수 상태 변경 (OPENING_SOON → OPEN → CLOSED)
- 접수 시간 공개
- 정원/잔여석 변화
- 가격 변화
- 취소표 발생
- 프로그램 취소

### 3. Pattern Analyzer Service
**책임**: 과거 프로그램 패턴 분석 및 다음 접수일 예측

**분석 대상**:
```
- 반복 주기 (매월, 매주, 특정 요일)
- 접수 시간 (월요일 10시, 1일 9시 등)
- 체험일 기준 상대 시간 (체험 14일 전 등)
- 계절성 (방학, 특정 시즌)
```

**예측 결과**:
```typescript
{
  confidence: 0.95,           // 0.0 ~ 1.0
  nextBookingOpenAt: Date,
  pattern: "monthly_third_monday_10am",
  evidence: [
    "2024-09 opened on Sept 16 at 10:00",
    "2024-08 opened on Aug 19 at 10:00",
    ...
  ]
}
```

### 4. Adapter Framework (Playwright-ready)
**설계**: Site-specific crawlers with standardized interface

```
adapters/
├── seoul-public-service/      # 서울시 공공서비스
├── museum/                     # 박물관 연합 등
│   ├── national-museum.ts
│   ├── seoul-museum.ts
│   └── ...
├── science-center/             # 과학관
├── factory-tour/               # 공장견학
│   ├── seoul-milk.ts
│   ├── samsung-factory.ts
│   └── ...
└── broadcasting/               # 방송국/기업
```

**Adapter Interface**:
```typescript
interface Adapter {
  name: string;
  baseUrl: string;
  schedule: CrawlSchedule;  // hourly, daily, weekly 등
  
  fetchPrograms(): Promise<ExperienceData[]>;
  // 또는
  fetchProgramUpdates(
    lastCrawlAt: Date,
    previousPrograms: ExperienceData[]
  ): Promise<CrawlResult>;
}

interface ExperienceData {
  externalId: string;
  institutionName: string;
  programName: string;
  description: string;
  programUrl: string;
  bookingUrl: string;
  experienceDate: Date;
  bookingOpenAt?: Date;
  bookingCloseAt?: Date;
  capacity?: number;
  price?: number;
  ageGroup?: string;
  status: 'OPENING_SOON' | 'OPEN' | 'CLOSED' | 'UNKNOWN';
}
```

### 5. Change Detection Engine
**책임**: 프로그램 변화 감지 및 로깅

**Change Types**:
```typescript
enum ChangeType {
  PROGRAM_CREATED,
  PROGRAM_UPDATED,
  STATUS_CHANGED,
  BOOKING_OPENED,
  BOOKING_CLOSED,
  BOOKING_TIME_REVEALED,
  CAPACITY_CHANGED,
  PRICE_CHANGED,
  CANCELLATION_OCCURRED,
  PROGRAM_CANCELLED
}

interface ChangeLog {
  id: string;
  experienceId: string;
  changeType: ChangeType;
  oldValue?: any;
  newValue?: any;
  detectedAt: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
}
```

### 6. Notification Service
**책임**: 사용자에게 중요한 이벤트 알림

**우선순위 이벤트**:
1. 오늘 신청 시작 (CRITICAL)
2. 내일 신청 시작 (HIGH)
3. 7일 이내 신청 시작 (HIGH)
4. 새로운 프로그램 발견 (사용자 조건 매칭 시 HIGH, 아니면 MEDIUM)
5. 가격/정원 변화 (MEDIUM)
6. 취소표 발생 (HIGH)

---

## Data Flow

### 1. Program Discovery Flow
```
External Site
    ↓
Adapter.fetchPrograms()
    ↓
Change Detection
    ├─ NEW_PROGRAM?
    │  └─ Create + HIGH Priority Notification
    ├─ STATUS_CHANGED?
    │  ├─ OPENING_SOON → OPEN: CRITICAL Notification
    │  └─ Log Change
    └─ OTHER_UPDATES?
       └─ Log Change + MEDIUM Priority Notification
    ↓
Database Update
    ↓
Dashboard Refresh (Real-time or Polling)
```

### 2. Booking Time Revelation Flow
```
Crawler detects bookingOpenAt is now set
    ↓
Pattern Analyzer learns from this revelation
    ├─ Pattern: "2주 전 오전 10시"
    ├─ Updates confidence if similar patterns exist
    └─ Logs evidence
    ↓
Next program with same institution
    └─ Predicts: "Next booking: estimated 2025-10-15 10:00 (95% confidence)"
```

### 3. Pattern Learning Flow
```
New Program Added
    ↓
Look for same institution's past programs
    ↓
Analyze booking patterns
    ├─ Monthly 3rd Monday 10:00? (2+ instances)
    ├─ Monthly 1st day 9:00?
    └─ Experience date relative (-14 days)?
    ↓
Generate prediction
    ├─ confidence >= 0.80 → Display as "estimated"
    ├─ confidence < 0.80 → Mark as "uncertain"
    └─ Store for future refinement
```

---

## Key Design Decisions

### 1. Data Unit: Experience vs ExperienceRun
```typescript
// Experience: 프로그램의 "틀"
{
  id: string,
  institutionId: string,
  programName: string,
  recurring: boolean,
  baseDescription: string,
  ...
}

// ExperienceRun: 해당 프로그램의 "회차"
{
  id: string,
  experienceId: string,
  experienceDate: Date,
  bookingOpenAt: Date | null,
  bookingCloseAt: Date | null,
  status: 'OPENING_SOON' | 'OPEN' | 'CLOSED',
  runNumber: number,
  ...
}
```

**이유**: 
- 정기적인 프로그램은 여러 회차가 있음
- 각 회차마다 접수일이 다를 수 있음
- 패턴 분석은 회차 데이터 기반

### 2. Booking Status as State Machine
```
┌─────────────────┐
│   UNKNOWN       │ (초기 상태, 아직 접수 정보 없음)
└────────┬────────┘
         │ booking_open_at 공개됨
         ▼
┌─────────────────┐
│  OPENING_SOON   │ (접수 예정)
└────────┬────────┘
         │ 현재시각 >= booking_open_at
         ▼
┌─────────────────┐
│      OPEN       │ (신청 중)
└────────┬────────┘
         │ 현재시각 >= booking_close_at OR 정원 찬 경우
         ▼
┌─────────────────┐
│     CLOSED      │ (신청 종료)
└─────────────────┘
```

### 3. Adapter Failure Isolation
- 특정 adapter 실패 시 다른 adapter 영향 없음
- 실패 로그 기록 및 재시도 스케줄링
- MANUAL_REQUIRED 상태로 표시하여 자동화 불가 프로그램 구분

### 4. Frontend Priority: Time-based View
메인 화면은 사용자의 행동 시간 기준으로 정렬:

1. **ACTION_REQUIRED_TODAY**: 오늘 신청해야 함
2. **ACTION_REQUIRED_TOMORROW**: 내일 신청 예정
3. **COMING_SOON_7DAYS**: 7일 이내 신청 예정
4. **CURRENTLY_AVAILABLE**: 지금 신청 가능
5. **FREE_PROGRAMS**: 무료 (정렬 순서: 신청 가능 시간 기준)
6. **BUDGET_FRIENDLY**: 1만원 이하 (정렬 순서: 신청 가능 시간 기준)
7. **FIRST_COME**: 선착순 (정렬 순서: 신청 가능 시간 기준)
8. **AGE_MATCHED**: 아이 연령 기준 (정렬 순서: 신청 가능 시간 기준)

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Database schema 설계 및 구현
- [ ] Experience/ExperienceRun CRUD API
- [ ] Basic frontend: Experience list 페이지
- [ ] Manual data seeding (수동 프로그램 등록)

### Phase 2: Crawler Infrastructure (Weeks 3-4)
- [ ] Crawler/Watcher service 기본 구조
- [ ] Change detection engine
- [ ] First adapter (예: 서울시 공공서비스)
- [ ] Crawl history 추적

### Phase 3: Pattern Analysis (Weeks 5-6)
- [ ] Pattern analyzer service
- [ ] Past program analysis
- [ ] Next booking prediction
- [ ] Pattern visualization

### Phase 4: Smart Notifications (Weeks 7-8)
- [ ] Notification service
- [ ] Email/Push 알림
- [ ] Real-time dashboard updates
- [ ] User preference filtering

### Phase 5: Advanced Features (Weeks 9+)
- [ ] Additional adapters (Museum, Science centers, etc.)
- [ ] Playwright-based automation framework
- [ ] Bookmark/wishlist feature
- [ ] User profile & preference management
- [ ] Analytics & reporting

### Phase 6: Automation (Future)
- [ ] Playwright adapters for select sites
- [ ] Auto-booking with user consent
- [ ] CAPTCHA handling strategy
- [ ] Queue management

---

## Technology Stack

**Backend**:
- Runtime: Node.js (v18+)
- Framework: Nest.js (modularity, testability)
- ORM: TypeORM or Prisma
- Database: PostgreSQL
- Job Queue: Bull (for scheduled crawlers)
- Caching: Redis (for crawler state, pattern cache)

**Frontend**:
- Framework: Next.js 14+
- UI: React 18+, Tailwind CSS
- State: TanStack Query (data fetching)
- Date: Day.js or date-fns

**Crawler**:
- Cheerio for static HTML
- Playwright (future) for JavaScript-heavy sites
- Puppeteer (alternative for headless browsing)

**Infrastructure**:
- Docker for containerization
- GitHub Actions for CI/CD
- PostgreSQL for persistence
- Redis for caching & job queue

---

## Security & Rate Limiting

1. **Crawler Politeness**:
   - User-Agent 명시
   - robots.txt 준수
   - 사이트별 crawl delay 설정
   - Rate limiting (초당 요청 수 제한)

2. **Data Privacy**:
   - User bookmarks/preferences 암호화
   - API 인증 (JWT)
   - User data 격리

3. **Automation Safety**:
   - CAPTCHA 감지 시 MANUAL_REQUIRED 표시
   - 자동화 금지 TOS 준수
   - 대기열(queue) 우회 금지

---

## Success Metrics

1. **Coverage**: 지원하는 기관/프로그램 수
2. **Accuracy**: 패턴 예측의 정확도 (80%+ 목표)
3. **Timeliness**: 접수 오픈 감지 시간 (< 30분 목표)
4. **User Engagement**: 활성 사용자, 북마크 추가율
5. **Notification Relevance**: 사용자가 실제 신청한 프로그램 / 추천한 프로그램

