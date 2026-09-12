# Database Schema - Kids Experience Booking Tracker

## Database: PostgreSQL

---

## Core Tables

### 1. institutions (기관)
```sql
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website_url VARCHAR(2048),
  phone VARCHAR(20),
  address VARCHAR(500),
  latitude FLOAT,
  longitude FLOAT,
  institution_type ENUM('PUBLIC', 'MUSEUM', 'SCIENCE_CENTER', 'FACTORY', 'BROADCASTING', 'OTHER'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(name, address)
);

CREATE INDEX idx_institutions_type ON institutions(institution_type);
CREATE INDEX idx_institutions_active ON institutions(is_active);
```

### 2. experiences (체험 프로그램)
```sql
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  
  -- 프로그램 기본 정보
  program_name VARCHAR(255) NOT NULL,
  description TEXT,
  program_url VARCHAR(2048),
  booking_url VARCHAR(2048),
  
  -- 반복 여부
  is_recurring BOOLEAN DEFAULT false,
  
  -- 카테고리/태그
  experience_category ENUM(
    'DOCENT', 
    'WORKSHOP', 
    'FACTORY_TOUR', 
    'EXHIBITION', 
    'PERFORMANCE', 
    'EDUCATIONAL', 
    'OUTDOOR',
    'SPECIAL_EVENT',
    'OTHER'
  ),
  
  -- 대상
  target_age_min INT,          -- 최소 나이
  target_age_max INT,          -- 최대 나이
  target_grade_min INT,        -- 최소 학년 (1=초1, 7=중1)
  target_grade_max INT,        -- 최대 학년
  required_guardian BOOLEAN,   -- 보호자 동반 필수 여부
  
  -- 예약 방식
  booking_method ENUM('FIRST_COME', 'LOTTERY', 'ALWAYS_AVAILABLE'),
  
  -- 상태
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_verified_at TIMESTAMP,
  
  -- 외부 추적용
  external_id VARCHAR(500),
  external_source VARCHAR(100)  -- 어느 adapter에서 발견했는가
);

CREATE INDEX idx_experiences_institution ON experiences(institution_id);
CREATE INDEX idx_experiences_category ON experiences(experience_category);
CREATE INDEX idx_experiences_active ON experiences(is_active);
CREATE INDEX idx_experiences_external_id ON experiences(external_id, external_source);
```

### 3. experience_runs (체험 회차)
```sql
CREATE TABLE experience_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  
  -- 회차 정보
  run_number INT,              -- 회차 번호 (1, 2, 3...)
  experience_date DATE NOT NULL, -- 체험 날짜
  
  -- 접수 정보
  booking_open_at TIMESTAMP,   -- 접수 시작 일시 (예측 가능 전: NULL)
  booking_close_at TIMESTAMP,  -- 접수 종료 일시
  booking_method ENUM('FIRST_COME', 'LOTTERY', 'ALWAYS_AVAILABLE'),
  
  -- 정원 및 가격
  capacity INT,
  capacity_remaining INT,      -- 잔여석 (실시간 추적 가능 시)
  price INT DEFAULT 0,         -- 가격 (원 단위, 0 = 무료)
  
  -- 상태
  status ENUM(
    'UNKNOWN',        -- 접수 정보 아직 미공개
    'OPENING_SOON',   -- 접수 예정
    'OPEN',          -- 신청 중
    'CLOSED',        -- 신청 종료
    'CANCELLED'      -- 프로그램 취소
  ) DEFAULT 'UNKNOWN',
  
  -- 자동화 상태
  automation_status ENUM(
    'AVAILABLE',           -- 자동 신청 가능
    'CAPTCHA_REQUIRED',    -- CAPTCHA로 자동화 불가
    'QUEUE_REQUIRED',      -- 대기열 우회 불가
    'MANUAL_REQUIRED'      -- 기타 이유로 수동 필요
  ),
  automation_note TEXT,      -- 자동화 불가 이유
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- 외부 추적용
  external_run_id VARCHAR(500),
  
  UNIQUE(experience_id, experience_date, run_number)
);

CREATE INDEX idx_experience_runs_experience ON experience_runs(experience_id);
CREATE INDEX idx_experience_runs_status ON experience_runs(status);
CREATE INDEX idx_experience_runs_booking_open ON experience_runs(booking_open_at);
CREATE INDEX idx_experience_runs_experience_date ON experience_runs(experience_date);
```

### 4. change_logs (변화 추적)
```sql
CREATE TABLE change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_run_id UUID NOT NULL REFERENCES experience_runs(id) ON DELETE CASCADE,
  
  change_type ENUM(
    'PROGRAM_CREATED',
    'PROGRAM_UPDATED',
    'STATUS_CHANGED',
    'BOOKING_OPENED',
    'BOOKING_CLOSED',
    'BOOKING_TIME_REVEALED',
    'CAPACITY_CHANGED',
    'PRICE_CHANGED',
    'CANCELLATION_OCCURRED',
    'PROGRAM_CANCELLED'
  ) NOT NULL,
  
  severity ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') DEFAULT 'MEDIUM',
  
  changed_field VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  
  detected_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_change_logs_experience_run ON change_logs(experience_run_id);
CREATE INDEX idx_change_logs_change_type ON change_logs(change_type);
CREATE INDEX idx_change_logs_severity ON change_logs(severity);
CREATE INDEX idx_change_logs_detected_at ON change_logs(detected_at);
```

---

## Pattern Analysis Tables

### 5. booking_patterns (학습된 패턴)
```sql
CREATE TABLE booking_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  
  -- 패턴 정보
  pattern_type ENUM(
    'FIXED_DAY_OF_MONTH',      -- 매월 3일
    'RELATIVE_DAY_OF_MONTH',   -- 매월 3번째 월요일
    'FIXED_WEEKDAY',           -- 매주 월요일
    'RELATIVE_TO_EXPERIENCE',  -- 체험일 기준 N일 전
    'SEASONAL',                -- 계절성
    'IRREGULAR'                -- 불규칙
  ),
  
  pattern_rule VARCHAR(500),   -- 패턴 설명
  -- 예시:
  -- "FIXED_DAY_OF_MONTH:3" -> 매월 3일
  -- "RELATIVE_DAY_OF_MONTH:1,1" -> 매월 첫 번째 월요일 (1=월요일)
  -- "FIXED_WEEKDAY:1,10:00" -> 매주 월요일 10시
  -- "RELATIVE_TO_EXPERIENCE:-14,10:00" -> 체험 14일 전 10시
  
  time_of_day TIME,          -- 접수 시간
  confidence FLOAT DEFAULT 0.5, -- 0.0 ~ 1.0
  
  -- 증거
  evidence_count INT DEFAULT 0, -- 몇 개의 회차로 학습했는가
  last_verified_at TIMESTAMP,   -- 마지막으로 이 패턴 적중한 회차 날짜
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(experience_id, pattern_type, pattern_rule)
);

CREATE INDEX idx_booking_patterns_experience ON booking_patterns(experience_id);
CREATE INDEX idx_booking_patterns_confidence ON booking_patterns(confidence DESC);
```

### 6. pattern_evidence (패턴 증거)
```sql
CREATE TABLE pattern_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_pattern_id UUID NOT NULL REFERENCES booking_patterns(id) ON DELETE CASCADE,
  experience_run_id UUID NOT NULL REFERENCES experience_runs(id),
  
  predicted_booking_open_at TIMESTAMP,
  actual_booking_open_at TIMESTAMP,
  matched BOOLEAN,  -- 예측이 맞았는가
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pattern_evidence_pattern ON pattern_evidence(booking_pattern_id);
CREATE INDEX idx_pattern_evidence_run ON pattern_evidence(experience_run_id);
```

### 7. booking_predictions (다음 접수일 예측)
```sql
CREATE TABLE booking_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id),
  
  predicted_experience_date DATE,    -- 예상 체험 날짜
  predicted_booking_open_at TIMESTAMP, -- 예상 접수 일시
  
  confidence FLOAT,                  -- 예측 신뢰도
  pattern_id UUID REFERENCES booking_patterns(id),
  
  -- 이 예측이 나중에 실제로 일어났는가
  actual_booking_open_at TIMESTAMP,
  verified_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP  -- 예측 유효 기한
);

CREATE INDEX idx_booking_predictions_experience ON booking_predictions(experience_id);
CREATE INDEX idx_booking_predictions_predicted_date ON booking_predictions(predicted_booking_open_at);
```

---

## Crawler/Sync Tables

### 8. crawl_history (크롤링 이력)
```sql
CREATE TABLE crawl_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adapter_name VARCHAR(100) NOT NULL,
  
  crawl_started_at TIMESTAMP NOT NULL,
  crawl_completed_at TIMESTAMP,
  
  status ENUM('RUNNING', 'SUCCESS', 'PARTIAL_FAILURE', 'FAILURE'),
  
  -- 통계
  programs_found INT DEFAULT 0,
  programs_updated INT DEFAULT 0,
  programs_created INT DEFAULT 0,
  changes_detected INT DEFAULT 0,
  
  error_message TEXT,
  error_stacktrace TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crawl_history_adapter ON crawl_history(adapter_name);
CREATE INDEX idx_crawl_history_status ON crawl_history(status);
CREATE INDEX idx_crawl_history_completed_at ON crawl_history(crawl_completed_at DESC);
```

### 9. adapter_state (Adapter 상태)
```sql
CREATE TABLE adapter_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adapter_name VARCHAR(100) NOT NULL UNIQUE,
  
  last_crawl_at TIMESTAMP,
  last_successful_crawl_at TIMESTAMP,
  
  consecutive_failures INT DEFAULT 0,
  is_disabled BOOLEAN DEFAULT false,
  disable_reason TEXT,
  
  next_scheduled_crawl_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## User/Preference Tables

### 10. users (사용자)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  
  profile_name VARCHAR(100),
  profile_image_url VARCHAR(2048),
  
  -- 자녀 정보
  children_ages INT[] DEFAULT ARRAY[]::INT[],  -- [4, 7, 10] 등
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### 11. user_preferences (사용자 선호도)
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- 관심 카테고리
  interested_categories TEXT[],  -- ['DOCENT', 'FACTORY_TOUR']
  
  -- 관심 기관
  interested_institutions UUID[],
  
  -- 선호 가격대
  max_price_per_program INT DEFAULT 50000,
  prefer_free BOOLEAN DEFAULT true,
  
  -- 알림 설정
  notify_opening_soon BOOLEAN DEFAULT true,
  notify_opened_today BOOLEAN DEFAULT true,
  notify_new_programs BOOLEAN DEFAULT true,
  notify_cancellations BOOLEAN DEFAULT true,
  
  -- 대기열 알림
  notify_cancellation_returns BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);
```

### 12. user_bookmarks (사용자 북마크/위시리스트)
```sql
CREATE TABLE user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  experience_run_id UUID NOT NULL REFERENCES experience_runs(id) ON DELETE CASCADE,
  
  bookmark_type ENUM('WISHLIST', 'INTERESTED', 'COMPLETED', 'BOOKED'),
  
  -- 실제 예약 정보 (향후)
  booked_at TIMESTAMP,
  external_booking_id VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, experience_run_id)
);

CREATE INDEX idx_user_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_run ON user_bookmarks(experience_run_id);
CREATE INDEX idx_user_bookmarks_type ON user_bookmarks(bookmark_type);
```

---

## Notification Tables

### 13. notifications (알림)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  experience_run_id UUID REFERENCES experience_runs(id),
  
  -- 알림 내용
  notification_type ENUM(
    'BOOKING_OPENED_TODAY',
    'BOOKING_OPENED_TOMORROW',
    'BOOKING_OPENING_SOON',
    'NEW_PROGRAM_DISCOVERED',
    'CANCELLATION_OCCURRED',
    'PROGRAM_CANCELLED',
    'PRICE_CHANGED',
    'CAPACITY_CHANGED'
  ),
  
  title VARCHAR(255),
  message TEXT,
  
  -- 우선순위
  priority ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
  
  -- 전달 상태
  is_sent BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_priority ON notifications(priority DESC);
```

---

## Views

### V1: Upcoming Bookings (사용자 뷰)
```sql
CREATE VIEW upcoming_bookings AS
SELECT 
  er.id as experience_run_id,
  er.experience_id,
  e.program_name,
  i.name as institution_name,
  er.experience_date,
  er.booking_open_at,
  er.booking_close_at,
  er.status,
  er.price,
  er.capacity,
  er.capacity_remaining,
  CASE 
    WHEN er.booking_open_at > CURRENT_TIMESTAMP THEN 'UPCOMING'
    WHEN er.status = 'OPEN' THEN 'OPEN_NOW'
    ELSE 'CLOSED'
  END as timeline_status
FROM experience_runs er
JOIN experiences e ON er.experience_id = e.id
JOIN institutions i ON e.institution_id = i.id
WHERE er.status IN ('OPENING_SOON', 'OPEN')
  AND er.experience_date >= CURRENT_DATE
ORDER BY er.booking_open_at ASC;
```

### V2: Pattern Summary
```sql
CREATE VIEW pattern_summary AS
SELECT 
  e.id as experience_id,
  e.program_name,
  i.name as institution_name,
  COUNT(bp.id) as pattern_count,
  MAX(bp.confidence) as max_confidence,
  STRING_AGG(DISTINCT bp.pattern_type, ', ') as pattern_types,
  MAX(bp.last_verified_at)::DATE as last_verified_date
FROM experiences e
JOIN institutions i ON e.institution_id = i.id
LEFT JOIN booking_patterns bp ON e.id = bp.experience_id
WHERE e.is_recurring = true
GROUP BY e.id, e.program_name, i.name;
```

---

## Data Relationships

```
institutions (1) ──── (N) experiences
                        │
                        ├──── (N) experience_runs
                        │        │
                        │        ├──── (N) change_logs
                        │        └──── (N) user_bookmarks
                        │
                        ├──── (N) booking_patterns
                        │        └──── (N) pattern_evidence
                        │
                        └──── (N) booking_predictions

users (1) ──── (N) user_bookmarks
       │
       ├──── (1) user_preferences
       └──── (N) notifications
```

---

## Indexing Strategy

**Priority**:
1. Frequently searched columns: `status`, `booking_open_at`, `experience_date`
2. Foreign keys: `experience_id`, `user_id`, `experience_run_id`
3. Time-based queries: `created_at`, `updated_at`, `detected_at`
4. Filter operations: `is_active`, `priority`

**Example query patterns**:
```sql
-- Pattern 1: "오늘 신청해야 할 프로그램"
SELECT * FROM experience_runs
WHERE status = 'OPEN' 
  AND booking_close_at::DATE = CURRENT_DATE
ORDER BY booking_close_at ASC;

-- Pattern 2: "내일 신청이 열리는 프로그램"
SELECT * FROM experience_runs
WHERE status = 'OPENING_SOON'
  AND booking_open_at::DATE = CURRENT_DATE + 1
ORDER BY booking_open_at ASC;

-- Pattern 3: "특정 기관의 패턴"
SELECT * FROM booking_patterns
WHERE experience_id = $1
ORDER BY confidence DESC;

-- Pattern 4: "변화 감지"
SELECT * FROM change_logs
WHERE detected_at >= NOW() - INTERVAL '1 hour'
  AND severity = 'CRITICAL'
ORDER BY detected_at DESC;
```

