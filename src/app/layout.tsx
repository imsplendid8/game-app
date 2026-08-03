import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "신입사원 김넵 키우기",
  description:
    "회사어를 해석하고 무사히 수습을 통과하세요. 5일간 15개의 메신저 상황에 답하는 캐주얼 직장생활 시뮬레이션.",
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
      <body>
        <div className="idol-stage min-h-[100dvh] w-full">
          <div className="idol-stage mx-auto flex min-h-[100dvh] w-full max-w-app flex-col shadow-2xl shadow-grape/20">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
