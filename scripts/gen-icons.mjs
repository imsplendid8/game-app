// PWA 아이콘 생성 스크립트. sharp로 SVG → PNG 래스터화.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const GRAD = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff8fb8"/>
      <stop offset="0.55" stop-color="#c78bef"/>
      <stop offset="1" stop-color="#9b7cf6"/>
    </linearGradient>
  </defs>`;

const HEART = (tx, ty, s) =>
  `<g transform="translate(${tx},${ty}) scale(${s})">
     <path d="M32 46s-14-8.5-14-18a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 9.5-14 18-14 18z" fill="#ffffff"/>
   </g>`;

// 일반 아이콘: 둥근 사각 배경 + 하트 + 반짝이
const rounded = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${GRAD}
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  ${HEART(64, 79, 6)}
  <text x="366" y="150" font-size="70" fill="#ffffff" opacity="0.9" font-family="sans-serif">✨</text>
</svg>`;

// 마스커블: 여백(세이프존) 확보를 위해 하트를 더 작게, 전체 배경 채움
const maskable = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${GRAD}
  <rect width="512" height="512" fill="url(#g)"/>
  ${HEART(96, 108, 5)}
</svg>`;

async function render(svg, size, outPath) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log("wrote", outPath);
}

mkdirSync(join(root, "public"), { recursive: true });

await render(rounded, 192, join(root, "public", "icon-192.png"));
await render(rounded, 512, join(root, "public", "icon-512.png"));
await render(maskable, 512, join(root, "public", "icon-512-maskable.png"));
// iOS 홈 화면 아이콘 (Next 파일 컨벤션: app/apple-icon.png)
await render(rounded, 180, join(root, "src", "app", "apple-icon.png"));
