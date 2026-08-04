"use client";

import { useEffect } from "react";

/**
 * 서비스워커 등록 (PWA 오프라인 지원 + 설치 가능).
 * GitHub Pages 하위 경로(/game-app)를 고려해 basePath를 붙여 등록한다.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const swUrl = `${basePath}/sw.js`;

    const register = () => {
      navigator.serviceWorker
        .register(swUrl, { scope: `${basePath}/` })
        .catch(() => {
          // 등록 실패해도 게임은 그대로 동작한다.
        });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
