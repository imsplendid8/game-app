# WithDKIS - 아이 체험 프로그램 추적 시스템

아이와 함께 참여할 수 있는 공공기관, 박물관, 과학관, 기업 공장견학 등의 저가·무료·희소 체험 프로그램을 발견하고, 선착순 접수 시작일을 놓치지 않도록 추적하는 개인용 예약 시스템입니다.

## 🎯 프로젝트 목표

**핵심 목표**: 사용자의 관심사는 "어디서 할 수 있는가"가 아니라 **"언제 신청할 수 있는가"**입니다.

- 📋 다양한 체험 프로그램 발견 및 추적
- 🔔 중요한 신청 시간 알림
- 📊 과거 패턴 분석으로 다음 신청 시간 예측
- 🤖 향후 자동화 신청 기능

## 📁 프로젝트 구조

```
game-app/
├── apps/
│   ├── api/              # Nest.js Backend API
│   └── web/              # Next.js Frontend
├── packages/
│   ├── database/         # Database entities & constants
│   ├── types/            # Shared TypeScript types
│   └── utils/            # Utility functions
├── docker-compose.yml    # Database & Redis containers
├── .env.example          # Environment variables template
└── package.json          # Root monorepo config
```

## 🚀 빠른 시작

### 필수 요구사항

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (optional for database)

### 설치

1. **저장소 클론**
   ```bash
   git clone https://github.com/imsplendid8/game-app.git
   cd game-app
   ```

2. **환경 변수 설정**
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

3. **Docker 컨테이너 시작** (선택사항)
   ```bash
   docker-compose up -d
   # PostgreSQL이 localhost:5432에서 실행됩니다
   # Adminer(관리 도구)는 localhost:8080에서 실행됩니다
   ```

4. **의존성 설치**
   ```bash
   npm install
   ```

### 개발 서버 실행

#### 모두 실행
```bash
npm run dev
# Backend: http://localhost:3001
# Frontend: http://localhost:3000
# API Docs: http://localhost:3001/api/docs
```

#### 개별 실행
```bash
npm run dev:api    # Backend만
npm run dev:web    # Frontend만
```

## 🏗️ 기술 스택

### Backend
- **Framework**: Nest.js
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Caching**: Redis
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: Zustand

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest

## 📝 주요 파일 가이드

| 파일 | 설명 |
|------|------|
| `ARCHITECTURE.md` | 전체 시스템 아키텍처 설계 |
| `DATABASE-SCHEMA.md` | PostgreSQL 스키마 상세 문서 |
| `IMPLEMENTATION_ROADMAP.md` | 6단계 구현 계획 (8-12주) |
| `design-docs.html` | 공개 웹 페이지 설계 문서 |

## 🔗 API 엔드포인트

### Health Check
```
GET /health
```

### Institutions (기관)
```
GET    /institutions          # 모든 기관 조회
POST   /institutions          # 기관 생성
GET    /institutions/:id      # 특정 기관 조회
PUT    /institutions/:id      # 기관 수정
DELETE /institutions/:id      # 기관 삭제 (soft delete)
```

### Experiences (체험 프로그램)
```
GET    /experiences           # 모든 프로그램 조회
POST   /experiences           # 프로그램 생성
GET    /experiences/:id       # 특정 프로그램 조회
PUT    /experiences/:id       # 프로그램 수정
DELETE /experiences/:id       # 프로그램 삭제 (soft delete)
```

### Swagger 문서
Backend 실행 시 http://localhost:3001/api/docs에서 확인 가능

## 💾 데이터베이스

### 초기화 및 마이그레이션
```bash
npm run db:migrate    # 마이그레이션 실행
npm run db:seed       # 샘플 데이터 입력
```

### Adminer로 데이터 관리
Docker Compose 실행 시 http://localhost:8080에서 접근 가능
- **Server**: postgres
- **Username**: postgres
- **Password**: password

## 📚 개발 가이드

### 코드 스타일
```bash
npm run lint           # ESLint 실행
npm run lint:fix       # 자동 수정
npm run format         # Prettier 포맷팅
npm run format:check   # 포맷 확인
```

### 테스트
```bash
npm run test           # 모든 테스트 실행
npm run test:watch     # Watch 모드
npm run test:cov       # Coverage 리포트
```

### 빌드
```bash
npm run build          # 모든 패키지 빌드
npm run build:api      # Backend만 빌드
npm run build:web      # Frontend만 빌드
```

## 🎓 Phase 1 체크리스트

- [x] 프로젝트 구조 설정
- [x] Backend (Nest.js) 기본 세팅
- [x] Frontend (Next.js) 기본 세팅
- [x] Docker Compose 설정
- [x] TypeScript & ESLint 설정
- [ ] 데이터베이스 마이그레이션 작성
- [ ] 샘플 데이터 입력
- [ ] API 테스트

## 🔗 중요 링크

- 📖 [설계 문서](https://claude.ai/code/artifact/08230054-7346-4990-84a6-65533ac7f7c5) - 공개 웹 페이지
- 🏗️ [아키텍처](./ARCHITECTURE.md)
- 🗄️ [데이터베이스](./DATABASE-SCHEMA.md)
- 📋 [로드맵](./IMPLEMENTATION_ROADMAP.md)

## 👥 기여자

- WithDKIS Team

## 📄 라이선스

MIT License - 자세한 사항은 LICENSE 파일을 참조하세요.

## 📞 지원

이슈는 GitHub Issues에 등록해주세요.

---

**현재 Phase**: Phase 1 (Foundation & Core Infrastructure)

**다음 단계**: Phase 2 (Crawler Infrastructure) - 자동 데이터 수집
