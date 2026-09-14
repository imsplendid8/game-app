# Implementation Roadmap - Kids Experience Booking Tracker

## Overall Timeline: 8-12 Weeks

---

## Phase 1: Foundation & Core Infrastructure (Weeks 1-2)

### Goals
- Project setup 완료
- Database schema 구현
- Basic API 구조 완성
- Manual data 입력 가능

### Tasks

#### 1.1 Project Setup
- [ ] Git repository 초기화 (이미 완료)
- [ ] Next.js + Node.js 프로젝트 구조 생성
  ```
  game-app/
  ├── apps/
  │   ├── web/              # Next.js frontend
  │   └── api/              # Nest.js backend
  ├── packages/
  │   ├── database/         # TypeORM entities & migrations
  │   ├── types/            # Shared types
  │   └── utils/            # Shared utilities
  ├── docs/
  └── docker-compose.yml
  ```
- [ ] Docker setup (PostgreSQL, Redis)
- [ ] Environment configuration (.env.example)
- [ ] CI/CD pipeline (.github/workflows)

#### 1.2 Database Implementation
- [ ] PostgreSQL 마이그레이션 도구 설정 (TypeORM or Prisma)
- [ ] 모든 core tables 생성 (institutions, experiences, experience_runs)
- [ ] 모든 views 생성
- [ ] 시드 데이터 스크립트 작성 (샘플 기관 3-5개)

#### 1.3 Backend API - Experience Management
- [ ] NestJS modules 구조
  ```
  src/
  ├── institutions/
  ├── experiences/
  ├── experience-runs/
  ├── database/
  └── common/
  ```
- [ ] REST endpoints:
  ```
  GET    /api/institutions
  POST   /api/institutions
  
  GET    /api/experiences
  POST   /api/experiences
  PUT    /api/experiences/:id
  
  GET    /api/experiences/:id/runs
  POST   /api/experiences/:id/runs
  PUT    /api/experiences/:id/runs/:runId
  GET    /api/experiences/:id/runs/:runId
  ```
- [ ] Database service layer
- [ ] Error handling & validation

#### 1.4 Frontend - Basic Experience List
- [ ] Next.js app structure
- [ ] Experience list page (`/experiences`)
- [ ] Experience detail page (`/experiences/:id`)
- [ ] Basic filtering (by status, date range)
- [ ] Responsive design (mobile-first)

#### 1.5 Testing & Documentation
- [ ] Unit tests for data models
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database documentation (schema descriptions)

**Deliverable**: "한 기관의 프로그램 목록을 수동으로 등록하고 웹에서 조회 가능"

---

## Phase 2: Crawler Infrastructure (Weeks 3-4)

### Goals
- Crawler 기본 구조 완성
- First adapter 구현 (데이터 수집 증명)
- Change detection 동작 확인
- Crawl history 추적

### Tasks

#### 2.1 Crawler Core Architecture
- [ ] Crawler/Watcher service 구현
  ```
  src/crawler/
  ├── crawler.service.ts
  ├── watcher.service.ts
  ├── adapter.interface.ts
  └── adapters/
  ```
- [ ] Bull job queue 설정 (scheduled crawlers)
- [ ] Adapter interface 정의
- [ ] Error handling & retry logic

#### 2.2 Change Detection Engine
- [ ] Change detection service
  ```
  src/change-detection/
  ├── detector.service.ts
  ├── change.entity.ts
  └── change.repository.ts
  ```
- [ ] Change logging (change_logs table)
- [ ] Change type 분류
- [ ] Change notification trigger

#### 2.3 First Adapter: Manual Seed + Mock Adapter
- [ ] 수동 입력한 기관의 데이터를 프로그래밍 방식으로 다시 가져오는 mock adapter
- [ ] OR 실제 사이트 하나 (예: 서울우유 공장견학 페이지)
  ```
  src/crawler/adapters/
  ├── seoul-milk-factory.adapter.ts
  └── __tests__/
  ```
- [ ] Adapter 실행 및 데이터 정규화
- [ ] 기존 데이터와 비교하여 변화 감지

#### 2.4 Crawl History & Monitoring
- [ ] Crawl history table 활용
- [ ] Adapter state 관리
  ```
  GET /api/admin/crawler/history
  GET /api/admin/crawler/adapters
  GET /api/admin/crawler/adapters/:name/status
  ```
- [ ] 대시보드: 최근 크롤 결과 조회

#### 2.5 Testing
- [ ] Adapter 테스트 (실제 사이트 vs mock)
- [ ] Change detection 테스트
- [ ] Integration test (full crawl flow)

**Deliverable**: "웹사이트에서 프로그램 정보를 자동으로 가져오고, 변화를 감지할 수 있음"

---

## Phase 3: Pattern Analysis (Weeks 5-6)

### Goals
- 과거 데이터 분석 구현
- 접수 패턴 학습
- 다음 접수일 예측
- 예측 정확도 추적

### Tasks

#### 3.1 Pattern Analyzer Service
- [ ] Pattern analyzer service 구현
  ```
  src/pattern-analysis/
  ├── analyzer.service.ts
  ├── pattern.entity.ts
  ├── pattern-evidence.entity.ts
  └── prediction.entity.ts
  ```
- [ ] Pattern 유형 정의:
  - FIXED_DAY_OF_MONTH (예: 매월 3일)
  - RELATIVE_DAY_OF_MONTH (예: 매월 3번째 월요일)
  - FIXED_WEEKDAY (예: 매주 월요일 10시)
  - RELATIVE_TO_EXPERIENCE (예: 체험 14일 전 10시)
  - SEASONAL (계절성)

#### 3.2 Pattern Learning Algorithm
- [ ] 같은 기관의 과거 프로그램 수집
- [ ] 접수 시간 비교 및 패턴 찾기
- [ ] Confidence score 계산
  ```
  if pattern_count >= 3:
    confidence = 0.8 + (0.1 * min(pattern_count - 3, 2))  // max 1.0
  elif pattern_count == 2:
    confidence = 0.6
  elif pattern_count == 1:
    confidence = 0.3
  ```

#### 3.3 Prediction Engine
- [ ] 신규 프로그램 또는 다음 회차에 대한 접수 시간 예측
  ```
  predictNextBookingTime(experienceId, upcomingExperienceDate) {
    // 1. 같은 기관의 패턴 검색
    // 2. 가장 높은 confidence 패턴 선택
    // 3. 예상 날짜/시간 계산
    // 4. booking_predictions table에 저장
  }
  ```
- [ ] 예측 저장 (booking_predictions)
- [ ] 유효기간 설정 (예: 30일 후 자동 만료)

#### 3.4 Pattern Validation & Feedback Loop
- [ ] 실제 booking_open_at이 공개되면 예측과 비교
- [ ] Pattern evidence 기록
- [ ] Confidence 업데이트

#### 3.5 API & Dashboard
- [ ] 패턴 조회 API
  ```
  GET /api/experiences/:id/patterns
  GET /api/experiences/:id/predictions
  ```
- [ ] 패턴 시각화 (timeline, frequency)
- [ ] 예측 정확도 리포트

**Deliverable**: "같은 기관의 과거 프로그램을 분석하여 다음 접수 시간을 예측할 수 있음"

---

## Phase 4: Smart Notifications (Weeks 7-8)

### Goals
- 사용자 알림 시스템 완성
- 우선순위 기반 필터링
- 실시간 대시보드 업데이트
- 사용자 선호도 관리

### Tasks

#### 4.1 User & Preference Management
- [ ] User 테이블 및 관련 API
  ```
  POST   /api/auth/signup
  POST   /api/auth/login
  GET    /api/users/profile
  PUT    /api/users/profile
  ```
- [ ] User preferences 관리
  ```
  GET    /api/users/preferences
  PUT    /api/users/preferences
  ```
  - 관심 카테고리
  - 관심 기관
  - 최대 가격대
  - 알림 설정

#### 4.2 Notification Service
- [ ] Notification service 구현
  ```
  src/notifications/
  ├── notification.service.ts
  ├── notification.entity.ts
  └── notification.repository.ts
  ```
- [ ] 알림 유형 및 우선순위:
  1. **CRITICAL**: 오늘 신청 마감 임박
  2. **HIGH**: 
     - 오늘 신청 시작
     - 내일 신청 시작
     - 7일 이내 신청 시작
     - 취소표 발생
     - 신규 프로그램 (관심 카테고리/기관)
  3. **MEDIUM**:
     - 신규 프로그램 발견
     - 가격/정원 변화
  4. **LOW**: 기타 업데이트

#### 4.3 Notification Generation
- [ ] Change detection에서 notification trigger
  ```
  // 변화 감지 시
  if (changeType === 'BOOKING_OPENED') {
    if (isToday(bookingOpenAt)) {
      await notificationService.create({
        type: 'BOOKING_OPENED_TODAY',
        priority: 'CRITICAL'
      });
    }
  }
  ```
- [ ] User preference filtering
- [ ] Duplicate prevention (같은 프로그램에 대해 중복 알림 방지)

#### 4.4 Notification Delivery
- [ ] Email 통합 (SendGrid or similar)
- [ ] Push notification (optional: Firebase Cloud Messaging)
- [ ] In-app notification (웹사이트에 표시)
- [ ] Notification 상태 추적 (sent, read)

#### 4.5 Main Dashboard - Timeline View
- [ ] 메인 대시보드 (`/dashboard`)
  ```
  1. ACTION_REQUIRED_TODAY
     ├─ 오늘 신청 중인 프로그램
     └─ 마감 시간 순서
  
  2. ACTION_REQUIRED_TOMORROW
     ├─ 내일 신청이 열리는 프로그램
     └─ 신청 시간 순서
  
  3. COMING_SOON_7DAYS
     └─ 7일 이내 신청 예정
  
  4. CURRENTLY_AVAILABLE
     └─ 현재 신청 가능한 프로그램
  
  5. FREE_PROGRAMS
     ├─ 무료 프로그램
     └─ 신청 가능 시간 기준
  
  6. BUDGET_FRIENDLY (<10k)
     └─ 1만원 이하
  
  7. FIRST_COME
     └─ 선착순 프로그램
  
  8. AGE_MATCHED
     └─ 아이 연령 기준
  ```

#### 4.6 User Bookmark System
- [ ] User bookmarks table
- [ ] Bookmark API
  ```
  POST   /api/experiences/:runId/bookmark
  DELETE /api/experiences/:runId/bookmark
  GET    /api/users/bookmarks
  ```
- [ ] Bookmark 상태: WISHLIST, INTERESTED, COMPLETED, BOOKED

**Deliverable**: "사용자가 중요한 프로그램을 우선적으로 보고, 신청 시간 전에 알림을 받을 수 있음"

---

## Phase 5: Advanced Crawlers & Features (Weeks 9-10)

### Goals
- 추가 adapter 구현 (2-3개)
- 데이터 커버리지 확대
- 검색 및 필터링 개선
- 사용자 피드백 반영

### Tasks

#### 5.1 Additional Adapters
각 adapter는 다음 구조를 따름:
```typescript
export class MuseumAdapterService implements Adapter {
  name = 'museum-programs';
  baseUrl = 'https://museum-api.example.com';
  
  async fetchPrograms(): Promise<ExperienceData[]> {
    // 1. 사이트 데이터 수집
    // 2. 데이터 정규화
    // 3. ExperienceData[] 반환
  }
}
```

**Target adapters** (우선순위순):
- [ ] **서울시 공공서비스** (예: 서울시청 행사, 공공기관 프로그램)
  - 대규모 데이터, 중앙집중식 관리
  - 시간: 5-7일
  
- [ ] **박물관 연합** (예: 국립박물관, 서울박물관)
  - API 또는 웹사이트 스크래핑
  - 시간: 5-7일
  
- [ ] **과학관** (예: 국립과학관, 서울과학관)
  - 정기 프로그램 + 특별 프로그램
  - 시간: 3-5일

#### 5.2 Adapter Features
- [ ] HTML 스크래핑 (Cheerio)
- [ ] REST API 호출
- [ ] 데이터 캐싱 (중복 요청 방지)
- [ ] Rate limiting
- [ ] 오류 복구 로직

#### 5.3 Search & Filtering
- [ ] Full-text search (프로그램명, 기관명)
- [ ] Advanced filters
  ```
  GET /api/experiences?
      category=DOCENT
      &minAge=5&maxAge=10
      &maxPrice=15000
      &bookingMethod=FIRST_COME
      &status=OPEN
  ```
- [ ] Elasticsearch 통합 (선택사항)

#### 5.4 Analytics & Reporting
- [ ] 사용자 통계
  - 월별 신청 수
  - 카테고리별 관심도
  - 가격대별 분포
- [ ] 기관 통계
  - 프로그램 수
  - 평균 정원
  - 평균 가격
- [ ] 시스템 통계
  - Crawler 성공률
  - 변화 감지율

**Deliverable**: "다양한 기관의 프로그램을 자동으로 수집하고, 사용자가 원하는 조건으로 검색할 수 있음"

---

## Phase 6: Automation Foundation (Weeks 11-12)

### Goals
- Playwright adapter 구조 설계
- 자동화 가능 여부 판단 로직
- 자동화 테스트 (수동 개입 없이)
- 향후 자동화 확장 준비

### Tasks

#### 6.1 Automation Analysis
- [ ] 각 사이트별 자동화 가능성 분석
  ```
  // adapter에 자동화 메타데이터 추가
  {
    name: 'example-site',
    automation: {
      isAutomatable: false,
      blockers: ['CAPTCHA', 'QUEUE_SYSTEM'],
      notes: 'CAPTCHA로 인해 자동화 불가'
    }
  }
  ```

- [ ] CAPTCHA 감지
- [ ] 대기열(Queue) 시스템 감지
- [ ] 자동화 금지 TOS 검토

#### 6.2 Automation Status Management
- [ ] automation_status field 활용
  ```
  AVAILABLE        // 자동 신청 가능
  CAPTCHA_REQUIRED // CAPTCHA로 불가
  QUEUE_REQUIRED   // 대기열 우회 불가
  MANUAL_REQUIRED  // 기타 이유
  ```
- [ ] 사용자 안내 메시지
- [ ] 매뉴얼 예약 링크 제공

#### 6.3 Playwright Adapter Structure
```typescript
export class PlaywrightAdapterBase {
  protected browser: Browser;
  protected page: Page;
  
  async openBookingPage() { }
  async fillForm(data: BookingData) { }
  async submitForm() { }
  async handleCaptcha() { }  // 수동 개입 필요, 또는 skip
}

export class ExampleSitePlaywrightAdapter 
  extends PlaywrightAdapterBase {
  
  async bookExperience(bookingData) {
    // 1. 로그인 (필요시)
    // 2. 프로그램 선택
    // 3. 예약 데이터 입력
    // 4. CAPTCHA 처리 (또는 MANUAL_REQUIRED)
    // 5. 제출
    // 6. 결과 저장
  }
}
```

#### 6.4 Safety & Rate Limiting
- [ ] Concurrency 제한 (동시 예약 1-2개만)
- [ ] 사이트별 delay 설정
- [ ] User-Agent rotation (optional)
- [ ] 실패 시 알림

#### 6.5 Testing & Dry Run
- [ ] Playwright adapter 단위 테스트
- [ ] Staging 환경 테스트 (실제 예약 아님)
- [ ] 자동화 성공률 추적
- [ ] 오류 로그 수집

**Deliverable**: "Playwright 기반 자동화 구조가 준비되어, Phase 7에서 실제 구현 가능"

---

## Phase 7+: Full Automation & Scale (Future)

- [ ] 자동화 허용 사이트부터 실제 예약 구현
- [ ] 사용자별 예약 우선순위 설정
- [ ] 실패 시도 재시도 로직
- [ ] 모니터링 및 로깅
- [ ] 규정 준수 감시 (이용약관 등)

---

## Critical Implementation Details

### Authentication & Authorization
```typescript
// 현재 단계: 선택사항 (나중에 필수)
// Phase 4에 포함하여 user-specific features 활성화
- JWT-based authentication
- User isolation (각 사용자는 자신의 데이터만 볼 수 있음)
```

### Database Migrations
```bash
# Phase 1: 초기 스키마
npm run migration:run

# 각 phase에서:
npm run migration:create -- AddNewTable
npm run migration:run
```

### Environment Variables
```
# Phase 1
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Phase 2
CRAWLER_ENABLED=true
CRAWLER_INTERVAL=3600000  # 1hour

# Phase 4
SMTP_HOST=...
SMTP_PORT=...
JWT_SECRET=...

# Phase 6
BROWSER_EXECUTABLE_PATH=/opt/pw-browsers/chromium
```

---

## Testing Strategy

### Per Phase
1. **Unit tests**: Service layer (50%+ coverage)
2. **Integration tests**: API + Database (key flows)
3. **E2E tests**: Full user workflows (critical paths only)

### Priority
1. Change detection (정확성 필수)
2. Pattern analysis (예측 정확도 추적)
3. API endpoints (data consistency)
4. Notification system (사용자 경험)

---

## Success Criteria

### Phase 1
- ✅ 수동으로 입력한 프로그램 3-5개를 웹에서 조회 가능
- ✅ Database schema 완전 구현

### Phase 2
- ✅ 한 사이트에서 프로그램 자동 수집 성공
- ✅ 변화 감지 정확률 > 95%

### Phase 3
- ✅ 80%+ 확신도로 접수 시간 예측 가능
- ✅ 예측 정확률 > 70%

### Phase 4
- ✅ 사용자가 임박한 접수 시간을 놓치지 않음
- ✅ 알림 오픈율 > 50%

### Phase 5
- ✅ 5개 이상 기관의 프로그램 수집
- ✅ 총 100개+ 프로그램 데이터베이스

### Phase 6
- ✅ 자동화 구조 설계 완료
- ✅ 자동화 가능/불가 구분 로직 완성

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Crawler breaking (사이트 변경) | HIGH | 정기적인 모니터링, 빠른 adapter 수정 |
| Pattern analysis 정확도 저하 | MEDIUM | 충분한 historical data, threshold 낮춤 |
| Database 성능 저하 | MEDIUM | Indexing 최적화, caching (Redis) |
| Playwright automation 복잡성 | HIGH | Phase 6에서 충분히 시간 할당 |
| 데이터 정확성 | HIGH | 데이터 검증, 사용자 피드백 루프 |

---

## Next Steps (지금 바로)

1. **Repository 설정**
   ```bash
   # 현재 상황:
   git checkout claude/kids-experience-booking-tracker-pfuuqs
   
   # 진행:
   - Node.js project setup
   - Database 환경 구성
   - API skeleton 작성
   ```

2. **Phase 1 착수**
   - Docker 컨테이너 구성
   - 데이터베이스 마이그레이션
   - 기본 API endpoints 구현

3. **첫 번째 데이터 입력**
   - 샘플 기관 2-3개 선정
   - 프로그램 정보 수동 입력
   - 웹사이트에서 조회 확인

