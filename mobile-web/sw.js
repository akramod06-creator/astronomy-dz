const CACHE_NAME = "astronomydz-v79-orbit-mobile-immersive-off-20260217";

const ASSETS = [
  "./",
  "./index.html",
  "./orbit.html",
  "./orbit.js?v=20260217-33",
  "./orbit-modules/data.js",
  "./orbit-modules/audio-signatures.js",
  "./orbit-modules/science-sources.js",
  "./orbit-modules/adaptive-quality.js",
  "./orbit-modules/ephemeris-engine.js",
  "./orbit-modules/time-system.js",
  "./space-explorer.html",
  "./space-explorer.js",
  "./space-explorer.js?v=20260217-cdnthree1",
  "./planets.html",
  "./planets.js",
  "./bot.html",
  "./bot.js",
  "./bot.js?v=20260217-hybrid5-astrochat",
  "./style.css",
  "./script.js",
  "./app-settings.js",
  "./tabs.js",
  "./quran.html",
  "./scholars.html",
  "./settings.html",
  "./offline.html",
  "./404.html",
  "./manifest.webmanifest",
  "./pwa-register.js",
  "./favicon.ico",
  "./assets/logo.png",
  "./assets/menu-icons/bot.jpg",
  "./assets/menu-icons/planets.png",
  "./assets/menu-icons/scholars.png",
  "./assets/menu-icons/quran.png",
  "./assets/menu-icons/orbit.png",
  "./assets/menu-icons/space-explorer.png",
  "./assets/menu-icons/settings.png",
  "./assets/menu-icons/README.txt",
  "./assets/images/earth.png",
  "./assets/images/jupiter.png",
  "./assets/images/mars.png",
  "./assets/images/mercury.png",
  "./assets/images/neptune.png",
  "./assets/images/saturn.png",
  "./assets/images/astro-bot-bg.jpg",
  "./assets/images/developer-about-bg.jpg",
  "./assets/images/space-bg.jpg",
  "./assets/images/uranus.png",
  "./assets/images/venus.png",
  "./assets/textures/earth.jpg",
  "./assets/textures/jupiter.jpg",
  "./assets/textures/mars.jpg",
  "./assets/textures/mercury.jpg",
  "./assets/textures/moon.jpg",
  "./assets/textures/neptune.jpg",
  "./assets/textures/pluto.jpg",
  "./assets/textures/saturn.jpg",
  "./assets/textures/sun.jpg",
  "./assets/textures/uranus.jpg",
  "./assets/textures/venus.jpg",
  "./assets/vendor/three/build/three.module.js",
  "./assets/vendor/three/examples/jsm/controls/OrbitControls.js",
  "./assets/audio/nasa/mars_sol1_microphone.mp3",
  "./assets/audio/nasa/mars_sol4_wind.mp3",
  "./assets/audio/nasa/mars_ingenuity_flight.mp3"
];

const NETWORK_FIRST_DESTINATIONS = new Set(["document", "script", "style", "worker", "sharedworker"]);
const NETWORK_FIRST_EXTENSIONS = /\.(js|mjs|css|html)$/i;

self.addEventListener("message", (event) => {
  if (event?.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((k) => k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigate = event.request.mode === "navigate";
  const isDynamicAsset = NETWORK_FIRST_DESTINATIONS.has(event.request.destination)
    || NETWORK_FIRST_EXTENSIONS.test(url.pathname);

  if (isNavigate || isDynamicAsset) {
    event.respondWith((async () => {
      try {
        const network = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, network.clone());
        return network;
      } catch {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (isNavigate) return (await caches.match("./offline.html")) || Response.error();
        return Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const network = await fetch(event.request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, network.clone());
      return network;
    } catch {
      return cached || Response.error();
    }
  })());
});
