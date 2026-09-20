const CACHE_NAME = 'python-data-cache-2026-09-20b'; // update after changing assets

// Uncomment Assets when development complete to actually cache them on install.
const ASSETS_TO_CACHE = [
    '/index.html',
    '/index.js',
    '/style.css',
    '/data.zip',
    '/wheels/duckdb-1.5.0-cp313-cp313-pyodide_2025_0_wasm32.whl',
    '/wheels/polars-1.33.1-cp313-cp313-pyodide_2025_0_wasm32.whl',
    'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/micropip-0.11.1-py3-none-any.whl',
    'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/pydantic-2.12.5-py3-none-any.whl',
    'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/typing_extensions-4.15.0-py3-none-any.whl',
    'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/pydantic_core-2.41.5-cp313-cp313-pyemscripten_2025_0_wasm32.whl',
    'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/annotated_types-0.7.0-py3-none-any.whl',
    'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/typing_inspection-0.4.2-py3-none-any.whl',
    'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/pyodide.js',
    'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/pyodide.asm.js',
    'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/pyodide-lock.json',
    'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/python_stdlib.zip',
    'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/pyodide.asm.wasm'
];

self.addEventListener('install', (event) => {
    console.log('[SW] install');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            cache.addAll(ASSETS_TO_CACHE).catch((err) => {
                console.error('[SW] cache.addAll failed:', err);
                // attempt to cache assets individually so we can still install if some fail
                return Promise.allSettled(
                    ASSETS_TO_CACHE.map((url) => fetch(url).then((r) => {
                        if (!r || r.status !== 200) throw new Error(`Bad response for ${url}: ${r && r.status}`);
                        return cache.put(url, r);
                    }))
                );
            })
        ).then(() => {
            // Activate faster
            return self.skipWaiting();
        })
    );
});

// Deletes old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] activate');
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) {
                console.log('[SW] cache HIT for', event.request.url);
                return cached;
            }
            console.log('[SW] cache MISS for', event.request.url, '- fetching');
            return fetch(event.request).then((response) => {
                // Cache all successful responses (including opaque ones) -- aggressive, turn on only when dev complete
                if (response && (response.status === 200 || response.type === 'opaque')) {
                    const respClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, respClone).then(() => {
                            console.log('[SW] cached response for', event.request.url);
                        }).catch((err) => {
                            console.warn('[SW] cache.put failed for', event.request.url, err);
                        });
                    });
                }
                return response;
            }).catch((err) => {
                console.warn('[SW] fetch failed, falling back to cache:', err);
                return caches.match('/');
            });
        })
    );
});
