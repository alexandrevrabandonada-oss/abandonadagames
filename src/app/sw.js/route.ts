const sw = `
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open("abandonada-static-v1").then((cache) => cache.addAll(["/", "/manifest.webmanifest"])));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
`;

export function GET() {
  return new Response(sw, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
