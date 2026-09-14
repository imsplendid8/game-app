# 배포 가이드

WithDKIS 프로젝트의 배포 및 운영 가이드입니다.

## 목차

1. [로컬 개발 환경](#로컬-개발-환경)
2. [테스트](#테스트)
3. [빌드](#빌드)
4. [Docker 배포](#docker-배포)
5. [환경 변수](#환경-변수)
6. [CI/CD 파이프라인](#cicd-파이프라인)
7. [모니터링](#모니터링)
8. [문제 해결](#문제-해결)

## 로컬 개발 환경

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 9.0.0 이상
- Docker & Docker Compose (선택사항)
- PostgreSQL 14+ (로컬 DB 사용 시)

### 설치 및 시작

```bash
# 1. 저장소 클론
git clone https://github.com/imsplendid8/game-app.git
cd game-app

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local

# 4. 개발 서버 시작
npm run dev

# API 서버: http://localhost:3001
# Web 앱: http://localhost:3000
```

### 개발 스크립트

```bash
# 전체 개발 서버 시작
npm run dev

# 개별 서버 시작
npm run dev:api    # API 서버만
npm run dev:web    # 웹 앱만

# 타입 체크
npm run type-check --workspaces

# 린트
npm run lint --workspaces

# 포맷
npm run format --workspaces
```

## 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
npm run test --workspaces

# 웹 앱 테스트만
npm run test --workspace=apps/web

# 감시 모드
npm run test:watch --workspace=apps/web

# 커버리지 리포트
npm run test:coverage --workspace=apps/web
```

### 테스트 작성 가이드

- 테스트 파일: `src/**/__tests__/**/*.test.ts` 또는 `src/**/*.test.ts`
- 스토어 테스트: `renderHook`과 `act` 사용
- 컴포넌트 테스트: `@testing-library/react` 사용

예시:
```typescript
import { renderHook, act } from '@testing-library/react'
import { useStore } from '@/store'

describe('useStore', () => {
  it('should update state', () => {
    const { result } = renderHook(() => useStore())
    
    act(() => {
      result.current.setValue('new value')
    })
    
    expect(result.current.value).toBe('new value')
  })
})
```

## 빌드

### 프로덕션 빌드

```bash
# 전체 빌드
npm run build

# 개별 빌드
npm run build:api
npm run build:web
```

### 빌드 확인

```bash
# 웹 앱 빌드 결과 확인
npm run start --workspace=apps/web

# API 서버 빌드 결과 확인
npm run start --workspace=apps/api
```

## Docker 배포

### Docker Compose로 실행

```bash
# 개발 환경 (hot reload)
docker compose up

# 프로덕션 환경 (빌드됨)
docker compose -f docker-compose.yml up --build

# 백그라운드 실행
docker compose up -d

# 중지
docker compose down
```

### 개별 컨테이너 관리

```bash
# API만 실행
docker compose up api

# 웹만 실행
docker compose up web

# 특정 컨테이너 재시작
docker compose restart web

# 로그 보기
docker compose logs -f web
```

## 환경 변수

### 설정 파일

- `.env.example`: 필수 환경 변수 템플릿
- `.env.local`: 로컬 개발 환경 (git ignore)
- `.env.production`: 프로덕션 환경 변수

### 필수 환경 변수

#### API 서버 (`apps/api/.env`)

```env
# 데이터베이스
DATABASE_URL=postgresql://user:password@localhost:5432/withdkis

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h

# 서버
NODE_ENV=development
PORT=3001

# 이메일 (선택)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### 웹 앱 (`apps/web/.env.local`)

```env
# API 주소
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## CI/CD 파이프라인

### GitHub Actions 워크플로우

자동 실행:
- **main/develop/claude/** 브랜치 푸시
- 풀 리퀘스트 생성

자동 체크:
1. ✅ 타입 체크 (TypeScript)
2. ✅ 린트 (ESLint)
3. ✅ 테스트 (Jest)
4. ✅ 빌드
5. ✅ 보안 스캔 (npm audit)
6. 🐳 Docker 빌드 (main/develop만)

### 워크플로우 상태 확인

```bash
# GitHub Actions 상태 확인
gh run list

# 특정 워크플로우 로그
gh run view <run-id>
```

## 모니터링

### 로그 확인

```bash
# Docker 로그
docker compose logs -f web
docker compose logs -f api

# 특정 시간 이후 로그
docker compose logs --since 2024-09-13T10:00:00 web
```

### 헬스 체크

```bash
# API 헬스 체크
curl http://localhost:3001/health

# 웹 앱 확인
curl http://localhost:3000
```

## 문제 해결

### 포트 충돌

```bash
# 포트 사용 확인
lsof -i :3000
lsof -i :3001

# 프로세스 종료
kill -9 <PID>
```

### 의존성 문제

```bash
# 깨끗한 설치
rm -rf node_modules package-lock.json
npm install

# 캐시 삭제
npm cache clean --force
```

### 데이터베이스 연결 문제

```bash
# PostgreSQL 연결 테스트
psql postgresql://user:password@localhost:5432/withdkis

# 마이그레이션 실행
npm run db:migrate --workspace=apps/api

# 시드 데이터 생성
npm run db:seed --workspace=apps/api
```

### Docker 컨테이너 재설정

```bash
# 모든 컨테이너 및 볼륨 삭제
docker compose down -v

# 재구축 및 시작
docker compose up --build
```

## 배포 체크리스트

### 프로덕션 배포 전

- [ ] 모든 테스트 통과 (npm run test)
- [ ] 린트 오류 없음 (npm run lint)
- [ ] 빌드 성공 (npm run build)
- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 보안 스캔 완료 (npm audit)
- [ ] README 및 문서 업데이트
- [ ] CHANGELOG 업데이트
- [ ] 버전 번호 업데이트 (package.json)

### 배포 후

- [ ] 헬스 체크 통과
- [ ] 주요 기능 동작 확인
- [ ] 로그 모니터링
- [ ] 사용자 피드백 수집
- [ ] 백업 확인

## 추가 정보

- 아키텍처: [ARCHITECTURE.md](./ARCHITECTURE.md)
- 개발 가이드: [DEVELOPMENT.md](./DEVELOPMENT.md)
- 데이터베이스: [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md)
