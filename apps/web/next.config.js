/** @type {import('next').NextConfig} */

// 브라우저는 항상 웹과 같은 오리진의 /api 를 호출하고, Next가 API 서버로 넘긴다.
// 터널 주소가 바뀌어도 프런트를 다시 빌드할 필요가 없고 CORS도 생기지 않는다.
const apiProxyTarget = process.env.API_PROXY_TARGET || 'http://localhost:3001';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Docker 이미지에서 .next/standalone 으로 실행하기 위해 필요
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
