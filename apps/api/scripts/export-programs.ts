/**
 * 켜져 있는 수집원(서울시 공공서비스예약, 직접 추가한 JSON)에서 프로그램을 모아
 * 정적 웹(GitHub Pages)이 읽는 JSON 한 파일로 쓴다.
 *
 *   npm run export:programs --workspace=apps/api -- <출력 경로>
 *
 * GitHub Actions가 매일 실행한다. 서울시 인증키는 저장소 Secrets의
 * SEOUL_OPENAPI_KEY에서 온다. 수집원 하나가 실패해도 나머지는 쓰고,
 * 실패 이유는 sources에 남겨 화면에 보여준다.
 */
import * as fs from 'fs';
import * as path from 'path';
import { SeoulPublicServiceAdapter } from '../src/crawler/adapters/seoul-public-service.adapter';
import { DataLoaderAdapter } from '../src/crawler/adapters/data-loader.adapter';
import { collectPrograms } from '../src/crawler/static-export';

async function main() {
  const outPath = path.resolve(process.cwd(), process.argv[2] ?? 'programs.json');
  const hasKey = Boolean(process.env.SEOUL_OPENAPI_KEY?.trim());

  const result = await collectPrograms([new SeoulPublicServiceAdapter(), new DataLoaderAdapter()]);
  for (const source of result.sources) {
    if (!source.ok && source.adapterName === 'seoul-public-service' && !hasKey) {
      // 정적 배포에서는 .env가 아니라 GitHub Secrets에 넣는다
      source.errorMessage =
        '서울시 인증키가 없습니다. GitHub 저장소 Settings → Secrets and variables → Actions 에 SEOUL_OPENAPI_KEY를 추가해주세요.';
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result));

  console.log(`프로그램 ${result.programs.length}건 → ${outPath}`);
  for (const source of result.sources) {
    const detail = source.ok ? `${source.programsFound}건` : source.errorMessage;
    console.log(`  ${source.ok ? '✓' : '✗'} ${source.adapterName}: ${detail}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
