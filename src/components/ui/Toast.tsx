"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  /** 표시 여부 트리거 */
  show: boolean;
  durationMs?: number;
}

/** 화면 하단에 잠깐 떴다 사라지는 알림. */
export function Toast({ message, show, durationMs = 3200 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(timer);
  }, [show, durationMs]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 w-[min(90%,380px)] -translate-x-1/2 rounded-xl bg-ink/90 px-4 py-3 text-center text-sm font-medium text-white shadow-lg"
    >
      {message}
    </div>
  );
}
