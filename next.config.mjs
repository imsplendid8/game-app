/** @type {import('next').NextConfig} */

// GitHub Pages 프로젝트 페이지는 /<repo> 하위 경로로 서빙되므로
// CI에서 NEXT_PUBLIC_BASE_PATH=/game-app 를 주입한다. 로컬 개발/빌드에서는
// 값이 없어 basePath 없이 동작한다.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  // 서버 없이 정적 파일로 내보낸다 (out/).
  output: "export",
  reactStrictMode: true,
  // 정적 export에서는 이미지 최적화 서버를 쓸 수 없다 (next/image 미사용이지만 안전).
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
