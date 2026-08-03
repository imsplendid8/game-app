import type { ReactNode } from "react";

interface AppShellProps {
  /** 상단 헤더 영역 (선택) */
  header?: ReactNode;
  /** 본문 (세로 스크롤) */
  children: ReactNode;
  /** 하단 고정 행동 영역 (선택) */
  footer?: ReactNode;
}

/** 공통 화면 골격: 헤더 / 스크롤 본문 / 하단 행동 영역 (기획서 4.1). */
export function AppShell({ header, children, footer }: AppShellProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      {header && (
        <header className="sticky top-0 z-10 border-b border-white/40 bg-white/40 px-5 py-3 backdrop-blur-md">
          {header}
        </header>
      )}
      <main className="flex-1 overflow-y-auto px-5 py-4">{children}</main>
      {footer && (
        <footer className="sticky bottom-0 border-t border-white/40 bg-white/55 px-5 py-3 backdrop-blur-md">
          {footer}
        </footer>
      )}
    </div>
  );
}
