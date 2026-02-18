(() => {
  const STORAGE_KEY = "astronomydz_settings_v1";
  const DEFAULTS = Object.freeze({
    lang: "ar",
    quality: "auto",
    soundMode: "cinematic",
    soundVolume: 0.45,
    soundEnabled: true,
    motion: "full"
  });

  const QUALITY_SET = new Set(["auto", "high", "balanced", "low"]);
  const SOUND_SET = new Set(["cinematic", "nasa", "deep", "orbital", "off"]);
  const MOTION_SET = new Set(["full", "reduced", "minimal"]);

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function motionScale(motion) {
    if (motion === "reduced") return 0.6;
    if (motion === "minimal") return 0.25;
    return 1;
  }

  function normalize(input) {
    const raw = (input && typeof input === "object") ? input : {};
    const migratedSoundMode = typeof raw.soundMode === "string"
      ? raw.soundMode
      : (typeof raw.sound === "string" ? raw.sound : DEFAULTS.soundMode);

    const normalized = {
      lang: raw.lang === "en" ? "en" : "ar",
      quality: QUALITY_SET.has(raw.quality) ? raw.quality : DEFAULTS.quality,
      soundMode: SOUND_SET.has(migratedSoundMode) ? migratedSoundMode : DEFAULTS.soundMode,
      soundVolume: clamp(Number(raw.soundVolume), 0, 1),
      soundEnabled: typeof raw.soundEnabled === "boolean" ? raw.soundEnabled : DEFAULTS.soundEnabled,
      motion: MOTION_SET.has(raw.motion) ? raw.motion : DEFAULTS.motion
    };

    if (!Number.isFinite(normalized.soundVolume)) {
      normalized.soundVolume = DEFAULTS.soundVolume;
    }

    if (normalized.soundMode === "off") {
      normalized.soundEnabled = false;
    }

    return normalized;
  }

  function emit(settings) {
    window.dispatchEvent(new CustomEvent("adz:settings-changed", { detail: settings }));
  }

  function applyToDocument(settings) {
    const cfg = normalize(settings);
    const root = document.documentElement;
    if (!root) return cfg;

    root.lang = cfg.lang;
    root.dir = cfg.lang === "ar" ? "rtl" : "ltr";
    root.dataset.quality = cfg.quality;
    root.dataset.motion = cfg.motion;
    root.dataset.soundMode = cfg.soundMode;
    root.style.setProperty("--adz-motion-scale", String(motionScale(cfg.motion)));
    return cfg;
  }

  function readRaw() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  }

  function load() {
    return normalize({ ...DEFAULTS, ...(readRaw() || {}) });
  }

  function save(nextSettings) {
    const finalSettings = normalize({ ...DEFAULTS, ...(nextSettings || {}) });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalSettings));
    applyToDocument(finalSettings);
    emit(finalSettings);
    return finalSettings;
  }

  function update(partialSettings) {
    const merged = { ...load(), ...(partialSettings || {}) };
    return save(merged);
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    const cfg = load();
    applyToDocument(cfg);
    emit(cfg);
  });

  const initial = load();
  applyToDocument(initial);

  window.ADZSettings = {
    STORAGE_KEY,
    DEFAULTS,
    normalize,
    load,
    save,
    update,
    applyToDocument,
    motionScale
  };
})();
