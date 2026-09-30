/**
 * GitHub Pages처럼 서버 없이 배포할 때 켠다 (빌드 시 NEXT_PUBLIC_STATIC_MODE=true).
 * 켜지면 API 서버 대신 브라우저 저장소와 미리 수집한 programs.json을 쓴다.
 */
export const STATIC_MODE = process.env.NEXT_PUBLIC_STATIC_MODE === 'true';

/** 예: '/game-app'. 정적 파일(programs.json)을 fetch할 때 앞에 붙인다. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** 정적 모드에서 수집을 직접 돌리는 곳 (GitHub Actions의 Run workflow) */
export const CRAWL_WORKFLOW_URL =
  process.env.NEXT_PUBLIC_CRAWL_WORKFLOW_URL ||
  'https://github.com/imsplendid8/game-app/actions/workflows/pages.yml';
