/**
 * Service Worker for MAELSTROM PWA
 */

const CACHE_NAME = 'maelstrom-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.ts',
  '/src/core/Game.ts',
  '/src/core/Input.ts',
  '/src/systems/AssetManager.ts',
  '/src/systems/AudioSystem.ts',
  '/src/systems/CombatSystem.ts',
  '/src/systems/FleetSystem.ts',
  '/src/systems/OceanSystem.ts',
  '/src/systems/ParticleSystem.ts',
  '/src/systems/PhysicsSystem.ts',
  '/src/systems/SaveSystem.ts',
  '/src/systems/SpawnSystem.ts',
  '/src/systems/UIManager.ts',
  '/src/systems/UpgradeSystem.ts',
  '/src/entities/PlayerShip.ts',
  '/src/types/game.ts',
  '/src/types/entities.ts',
  '/src/types/upgrades.ts',
  '/src/utils/constants.ts',
  '/src/utils/math.ts',
  '/src/utils/random.ts',
  '/src/ui/styles/main.css',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Otherwise fetch from network
      return fetch(request).then((response) => {
        // Don't cache if not a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone response and cache it
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    }).catch(() => {
      // Fallback for offline - could return offline page
      return new Response('Offline');
    })
  );
});

// Background sync for leaderboard submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-leaderboard') {
    event.waitUntil(syncLeaderboard());
  }
});

async function syncLeaderboard() {
  // Would sync pending leaderboard submissions
  console.log('Syncing leaderboard...');
}
