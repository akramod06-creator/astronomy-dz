(() => {
  const isNativeApp = (
    location.protocol === "capacitor:"
    || (
      typeof window.Capacitor?.isNativePlatform === "function"
      && window.Capacitor.isNativePlatform()
    )
  );
  if (isNativeApp) return;
  if (location.protocol !== "http:" && location.protocol !== "https:") return;
  if (!("serviceWorker" in navigator)) return;

  const SW_URL = "./sw.js";
  const MIGRATION_KEY = "astronomydz_sw_migration_v15";
  const APP_CACHE_PREFIX = "astronomydz-";
  let refreshed = false;

  const activateWaiting = (registration) => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  const runOneTimeMigration = async () => {
    try {
      if (localStorage.getItem(MIGRATION_KEY) === "done") return;

      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));

      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((key) => key.startsWith(APP_CACHE_PREFIX))
            .map((key) => caches.delete(key))
        );
      }

      localStorage.setItem(MIGRATION_KEY, "done");
      window.location.reload();
      throw new Error("migration-reload");
    } catch (error) {
      if (error && error.message === "migration-reload") throw error;
      // Continue safely if migration cleanup fails.
    }
  };

  window.addEventListener("load", async () => {
    try {
      await runOneTimeMigration();

      const registration = await navigator.serviceWorker.register(SW_URL, { updateViaCache: "none" });
      activateWaiting(registration);
      registration.update().catch(() => {});

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed") activateWaiting(registration);
        });
      });

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshed) return;
        refreshed = true;
        window.location.reload();
      });
    } catch (error) {
      if (error && error.message === "migration-reload") return;
      // Keep app functional even if SW registration fails.
    }
  });
})();
