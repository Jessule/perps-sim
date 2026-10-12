const C='perps-ro-v1';self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(['./','style.css','app.js','icon-192.png']))));
self.addEventListener('fetch',e=>{if(e.request.url.includes('raw.githubusercontent'))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
