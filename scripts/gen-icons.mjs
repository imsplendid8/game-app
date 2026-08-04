// PWA 아이콘 생성 스크립트. sharp로 SVG → PNG 래스터화.
// 김넵(신입사원) 캐릭터 얼굴을 아이콘에 사용.
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

// 512 좌표계에 그린 김넵 얼굴 (머리·눈·볼터치·미소·셔츠 깃)
const HAIR = "#4b3a36";
const SKIN = "#ffdcc1";
const INK = "#2f2740";

const FACE = `
  <g>
    <!-- 셔츠 어깨 + 깃 (신입사원 느낌) -->
    <path d="M150 470 C150 424 198 402 256 402 C314 402 362 424 362 470 Z" fill="#ffffff"/>
    <path d="M232 404 L256 430 L256 404 Z" fill="#eef2ff"/>
    <path d="M280 404 L256 430 L256 404 Z" fill="#e6ecff"/>
    <path d="M256 408 L244 424 L256 462 L268 424 Z" fill="#ff6f9c"/>

    <!-- 뒷머리 -->
    <ellipse cx="256" cy="232" rx="136" ry="130" fill="${HAIR}"/>
    <!-- 살짝 솟은 머리 (신입 삐침머리) -->
    <path d="M250 128 C246 150 250 162 256 168 C262 158 268 150 262 126 C258 124 253 124 250 128 Z" fill="${HAIR}"/>

    <!-- 얼굴 -->
    <ellipse cx="256" cy="272" rx="112" ry="110" fill="${SKIN}"/>

    <!-- 앞머리(뱅) -->
    <path d="M148 250
             C148 184 196 158 256 158
             C316 158 364 184 364 250
             C352 230 338 242 324 250
             C314 226 298 238 288 252
             C276 228 258 238 250 252
             C238 228 222 240 212 252
             C200 240 176 232 148 250 Z" fill="${HAIR}"/>

    <!-- 볼터치 -->
    <circle cx="196" cy="300" r="18" fill="#ff9db5" opacity="0.6"/>
    <circle cx="316" cy="300" r="18" fill="#ff9db5" opacity="0.6"/>

    <!-- 눈 -->
    <ellipse cx="214" cy="270" rx="13" ry="18" fill="${INK}"/>
    <ellipse cx="298" cy="270" rx="13" ry="18" fill="${INK}"/>
    <circle cx="210" cy="263" r="4.5" fill="#ffffff"/>
    <circle cx="294" cy="263" r="4.5" fill="#ffffff"/>

    <!-- 미소 -->
    <path d="M236 308 Q256 330 276 308" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  </g>`;

const rounded = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${GRAD}
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  ${FACE}
</svg>`;

// 마스커블: 세이프존 확보를 위해 캐릭터를 약간 축소·중앙 배치, 배경 풀블리드
const maskable = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${GRAD}
  <rect width="512" height="512" fill="url(#g)"/>
  <g transform="translate(51,58) scale(0.8)">${FACE}</g>
</svg>`;

async function render(svg, size, outPath) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outPath);
  console.log("wrote", outPath);
}

mkdirSync(join(root, "public"), { recursive: true });
await render(rounded, 192, join(root, "public", "icon-192.png"));
await render(rounded, 512, join(root, "public", "icon-512.png"));
await render(maskable, 512, join(root, "public", "icon-512-maskable.png"));
await render(rounded, 180, join(root, "src", "app", "apple-icon.png"));
// 파비콘도 동일 캐릭터로 (앱 탭 아이콘)
await render(rounded, 64, join(root, "src", "app", "icon.png"));
