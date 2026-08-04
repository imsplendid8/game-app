/* 신입사원 김넵 키우기 — 서비스워커 (오프라인 지원)
 * 게임은 완전 클라이언트 사이드라 첫 방문 후 오프라인에서도 플레이 가능.
 * 경로는 등록 scope에서 계산하므로 GitHub Pages 하위 경로(/game-app)에서도 동작. */

const CACHE = "kimnep-cache-v1";
// 등록 scope 기준 시작 URL (예: /game-app/)
const START_URL = new URL("./", self.registration.scope).pathname;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // 시작 페이지를 미리 캐시 (오프라인 진입점)
      try {
        await cache.add(new Request(START_URL, { cache: "reload" }));
      } catch {
        // 실패해도 설치는 계속
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 페이지 이동: 네트워크 우선, 실패 시 캐시(해당 페이지 → 시작 페이지)
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(CACHE);
          return (
            (await cache.match(req)) ||
            (await cache.match(START_URL)) ||
            Response.error()
          );
        }
      })(),
    );
    return;
  }

  // 그 외 정적 자원: 캐시 우선 + 백그라운드 갱신 (stale-while-revalidate)
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      return cached || (await network) || Response.error();
    })(),
  );
});
