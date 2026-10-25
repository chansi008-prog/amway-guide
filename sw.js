// 제품 가이드 서비스 워커: 앱 파일을 미리 저장해 오프라인에서도 열리게 한다
const VERSION = "guide-v1";
const CORE = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // 앱 화면: 네트워크 우선(업데이트 바로 반영), 안 되면 저장본
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put("index.html", c)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // 아이콘 등: 저장본 우선
  if (new URL(e.request.url).origin === location.origin) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
  }
});
