// 빌드 전 실행: NEXT_PUBLIC_BASE_PATH를 반영한 웹 매니페스트를 public/에 생성.
// (Next의 app/manifest 컨벤션은 링크 href에 basePath를 붙이지 않는 이슈가 있어
//  파일과 링크를 직접 관리한다.)
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const manifest = {
  name: "신입사원 김넵 키우기",
  short_name: "김넵 키우기",
  description:
    "회사어를 해석하고 무사히 수습을 통과시키는 캐주얼 직장생활 육성 게임.",
  lang: "ko",
  start_url: `${basePath}/`,
  scope: `${basePath}/`,
  display: "standalone",
  orientation: "portrait",
  background_color: "#fff4fb",
  theme_color: "#ff8fb8",
  icons: [
    { src: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
    { src: `${basePath}/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
    { src: `${basePath}/icon-512-maskable.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(
  join(root, "public", "manifest.webmanifest"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(`wrote public/manifest.webmanifest (basePath="${basePath || "(none)"}")`);
