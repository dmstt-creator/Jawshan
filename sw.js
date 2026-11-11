/* سرویس‌ورکر دعای جوشن کبیر: اپ بعد از اولین باز شدن، بدون اینترنت هم کار می‌کند.
   با هر به‌روزرسانی index.html در گیت‌هاب، عدد VERSION را یکی بالا ببرید. */
const VERSION = 'jawshan-v1';
const ASSETS = [
  './',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // صفحهٔ برنامه: اول از اینترنت (برای گرفتن نسخهٔ تازه)، اگر نشد از حافظه
  if (req.mode === 'navigate'){
    event.respondWith(
      fetch(req).then(res => {
        if (res.ok){ const copy = res.clone(); caches.open(VERSION).then(c => c.put('./', copy)); }
        return res;
      }).catch(() => caches.match('./', { ignoreSearch: true }))
    );
    return;
  }

  // آیکون‌ها و فایل‌های دیگر: اول از حافظه
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok){ const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
