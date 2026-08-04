import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";

// GitHub Pages 하위 경로(/game-app). Next가 manifest 링크에는 basePath를
// 자동으로 붙이지 않으므로 직접 지정한다.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "신입사원 김넵 키우기",
  description:
    "회사어를 해석하고 무사히 수습을 통과하세요. 5일간 15개의 메신저 상황에 답하는 캐주얼 직장생활 시뮬레이션.",
  applicationName: "김넵 키우기",
  // iOS 홈 화면 추가 시 전체화면 앱처럼 실행
  appleWebApp: {
    capable: true,
    title: "김넵 키우기",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffd9ec",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        {/* Next의 metadata manifest는 basePath를 누락하므로 링크를 직접 삽입 */}
        <link rel="manifest" href={`${basePath}/manifest.webmanifest`} />
      </head>
      <body>
        <div className="idol-stage min-h-[100dvh] w-full">
          <div className="idol-stage mx-auto flex min-h-[100dvh] w-full max-w-app flex-col shadow-2xl shadow-grape/20">
            {children}
          </div>
          <ServiceWorkerRegister />
        </div>
      </body>
    </html>
  );
}
