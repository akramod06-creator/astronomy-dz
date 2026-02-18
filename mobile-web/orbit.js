import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  bodies,
  moons,
  comets,
  climateProfiles,
  acousticClassById,
  envModeById,
  geoProfiles,
  landingProfileByMode,
  landingProfileById,
  nasaAudioSamples
} from "./orbit-modules/data.js";
import { PLANET_AUDIO_SIGNATURES } from "./orbit-modules/audio-signatures.js";
import { getScienceSourcesForId } from "./orbit-modules/science-sources.js";
import { ADAPTIVE_QUALITY_PROFILES, pickAdaptiveTier } from "./orbit-modules/adaptive-quality.js";
import { EPHEMERIS_PRESETS, createEphemerisEngine } from "./orbit-modules/ephemeris-engine.js";
import { createTimeSystem } from "./orbit-modules/time-system.js";

(() => {
  const $ = (id) => document.getElementById(id);
  const ui = {
    viewportRoot: $("viewportRoot"),
    canvas: $("orbitCanvas"),
    toggleBtn: $("toggleBtn"),
    resetBtn: $("resetBtn"),
    uiDensityBtn: $("uiDensityBtn"),
    uiModeTag: $("uiModeTag"),
    quickFocusSelect: $("quickFocusSelect"),
    quickExploreBtn: $("quickExploreBtn"),
    quickLandBtn: $("quickLandBtn"),
    quickAudioBtn: $("quickAudioBtn"),
    quickFollowBtn: $("quickFollowBtn"),
    scopePresetBtn: $("scopePresetBtn"),
    speedRange: $("speedRange"),
    speedValue: $("speedValue"),
    orbitPrecisionSelect: $("orbitPrecisionSelect"),
    orbitPrecisionTag: $("orbitPrecisionTag"),
    timeNowBtn: $("timeNowBtn"),
    timeJ2000Btn: $("timeJ2000Btn"),
    validationCheckpointSelect: $("validationCheckpointSelect"),
    validationGoBtn: $("validationGoBtn"),
    validationStatus: $("validationStatus"),
    timeScaleTag: $("timeScaleTag"),
    zoomRange: $("zoomRange"),
    zoomValue: $("zoomValue"),
    stats: $("simStats"),
    objectInfo: $("objectInfo"),
    scienceSources: $("scienceSources"),
    showOrbits: $("showOrbits"),
    showInnerOrbits: $("showInnerOrbits"),
    showAsteroids: $("showAsteroids"),
    showComets: $("showComets"),
    showDust: $("showDust"),
    showTech: $("showTech"),
    showLabels: $("showLabels"),
    floatingOriginEnable: $("floatingOriginEnable"),
    focusSelect: $("focusSelect"),
    followBtn: $("followBtn"),
    freeCamBtn: $("freeCamBtn"),
    fcModeTag: $("fcModeTag"),
    fcTargetBtn: $("fcTargetBtn"),
    fcProgradeBtn: $("fcProgradeBtn"),
    fcRetrogradeBtn: $("fcRetrogradeBtn"),
    fcNormalBtn: $("fcNormalBtn"),
    cameraState: $("cameraState"),
    seControlTag: $("seControlTag"),
    seSpeedTag: $("seSpeedTag"),
    exploreBtn: $("exploreBtn"),
    resetClimateBtn: $("resetClimateBtn"),
    tempOffsetRange: $("tempOffsetRange"),
    tempOffsetValue: $("tempOffsetValue"),
    pressureRange: $("pressureRange"),
    pressureValue: $("pressureValue"),
    windRange: $("windRange"),
    windValue: $("windValue"),
    presetCalmBtn: $("presetCalmBtn"),
    presetStormBtn: $("presetStormBtn"),
    presetFreezeBtn: $("presetFreezeBtn"),
    presetHeatBtn: $("presetHeatBtn"),
    explorerInfo: $("explorerInfo"),
    surfaceEnterBtn: $("surfaceEnterBtn"),
    surfaceExitBtn: $("surfaceExitBtn"),
    walkModeBtn: $("walkModeBtn"),
    walkStatus: $("walkStatus"),
    surfaceTraverseBtn: $("surfaceTraverseBtn"),
    surfaceTraverseStatus: $("surfaceTraverseStatus"),
    skyLookBtn: $("skyLookBtn"),
    skyStatus: $("skyStatus"),
    surfaceAltitudeRange: $("surfaceAltitudeRange"),
    surfaceAltitudeValue: $("surfaceAltitudeValue"),
    landingRealismSelect: $("landingRealismSelect"),
    landingRealismTag: $("landingRealismTag"),
    terrainDetailSelect: $("terrainDetailSelect"),
    terrainDetailTag: $("terrainDetailTag"),
    touchSensitivityRange: $("touchSensitivityRange"),
    touchSensitivityValue: $("touchSensitivityValue"),
    touchSensitivityRangeVr: $("touchSensitivityRangeVr"),
    handednessSelect: $("handednessSelect"),
    onScreenControls: $("onScreenControls"),
    movePanel: $("movePanel"),
    lookPanel: $("lookPanel"),
    movePad: $("movePad"),
    lookPad: $("lookPad"),
    audioEnable: $("audioEnable"),
    audioVolume: $("audioVolume"),
    audioVolumeValue: $("audioVolumeValue"),
    audioMode: $("audioMode"),
    audioStatus: $("audioStatus"),
    navToggleBtn: $("navToggleBtn"),
    immersiveBtn: $("immersiveBtn"),
    vrFx: $("vrFx"),
    vrReticle: $("vrReticle"),
    vrTelemetry: $("vrTelemetry"),
    mouseMenu: $("mouseMenu"),
    mouseMenuTitle: $("mouseMenuTitle")
  };

  if (Object.values(ui).some((el) => !el)) {
    // eslint-disable-next-line no-console
    console.error("Orbit UI is missing required elements.");
    return;
  }

  const DEG = Math.PI / 180;
  const AU = 22;
  const coarsePointerQuery = window.matchMedia?.("(pointer: coarse)") || null;
  const isNativeApp = (
    location.protocol === "capacitor:"
    || (
      typeof window.Capacitor?.isNativePlatform === "function"
      && window.Capacitor.isNativePlatform()
    )
  );
  const isTouchLikeDevice = (
    !!coarsePointerQuery?.matches
    || ("ontouchstart" in window)
    || window.innerWidth <= 900
  );
  const queryParams = new URLSearchParams(window.location.search);
  const profileParam = queryParams.get("profile");
  const userAgent = navigator.userAgent || "";
  const isGalaxyF13 = /SM-E135/i.test(userAgent) || /Galaxy\s*F13/i.test(userAgent);
  const forceSafeMobileProfile = (
    queryParams.get("safe") === "1"
    || queryParams.get("safe") === "true"
    || profileParam === "safe"
  );
  const forceMobileProfile = (
    profileParam === "mobile"
    || profileParam === "phone"
    || profileParam === "lite"
    || queryParams.get("mobile") === "1"
  );
  const mobileLiteMode = forceMobileProfile || isNativeApp || isTouchLikeDevice;
  const mobileCpuCores = Math.max(1, Number(navigator.hardwareConcurrency || 4));
  const mobileMemoryGb = Number(navigator.deviceMemory || 0);
  const lowEndMobile = (
    mobileLiteMode
    && (
      (mobileMemoryGb > 0 && mobileMemoryGb <= 4)
      || mobileCpuCores <= 6
      || isGalaxyF13
      || forceSafeMobileProfile
    )
  );
  const ultraLowEndMobile = (
    lowEndMobile
    && (
      (mobileMemoryGb > 0 && mobileMemoryGb <= 3)
      || mobileCpuCores <= 4
      || isGalaxyF13
      || forceSafeMobileProfile
    )
  );
  const immersiveRestrictedMobile = lowEndMobile;
  const PERF = mobileLiteMode
    ? {
        starCount: ultraLowEndMobile ? 1500 : (lowEndMobile ? 2400 : 4200),
        milkyWayCount: ultraLowEndMobile ? 220 : (lowEndMobile ? 460 : 1100),
        starLabelCount: ultraLowEndMobile ? 3 : (lowEndMobile ? 4 : 7),
        orbitSegments: ultraLowEndMobile ? 96 : 120,
        dustCount: ultraLowEndMobile ? 120 : (lowEndMobile ? 260 : 1100),
        asteroidCount: ultraLowEndMobile ? 100 : (lowEndMobile ? 220 : 640),
        planetSegW: ultraLowEndMobile ? 40 : (lowEndMobile ? 50 : 68),
        planetSegH: ultraLowEndMobile ? 26 : (lowEndMobile ? 32 : 44),
        moonSegW: ultraLowEndMobile ? 28 : (lowEndMobile ? 34 : 44),
        moonSegH: ultraLowEndMobile ? 18 : (lowEndMobile ? 22 : 30),
        orbitalAtmoSegW: ultraLowEndMobile ? 24 : (lowEndMobile ? 30 : 44),
        orbitalAtmoSegH: ultraLowEndMobile ? 16 : (lowEndMobile ? 20 : 28),
        earthOverlaySegments: ultraLowEndMobile ? 28 : (lowEndMobile ? 34 : 58),
        atmosphereSegW: ultraLowEndMobile ? 18 : (lowEndMobile ? 22 : 32),
        atmosphereSegH: ultraLowEndMobile ? 14 : (lowEndMobile ? 18 : 24),
        skyDomeSegW: ultraLowEndMobile ? 24 : 28,
        skyDomeSegH: ultraLowEndMobile ? 16 : 20,
        reliefSolidW: ultraLowEndMobile ? 256 : (lowEndMobile ? 320 : 576),
        reliefSolidH: ultraLowEndMobile ? 128 : (lowEndMobile ? 160 : 288),
        reliefGasW: ultraLowEndMobile ? 192 : (lowEndMobile ? 256 : 416),
        reliefGasH: ultraLowEndMobile ? 96 : (lowEndMobile ? 128 : 208),
        earthMaskW: ultraLowEndMobile ? 384 : 512,
        earthMaskH: ultraLowEndMobile ? 192 : 256,
        maxAnisotropy: lowEndMobile ? 1 : 2,
        targetLodBase: ultraLowEndMobile ? 92 : (lowEndMobile ? 108 : 132),
        targetLodBoost: ultraLowEndMobile ? 18 : 26,
        targetLodCapBalanced: ultraLowEndMobile ? 132 : (lowEndMobile ? 156 : 192),
        targetLodCapUltra: ultraLowEndMobile ? 176 : (lowEndMobile ? 208 : 242),
        heavyUpdateDivider: ultraLowEndMobile ? 4 : (lowEndMobile ? 3 : 2),
        antialias: false,
        powerPreference: "low-power"
      }
    : {
        starCount: 14000,
        milkyWayCount: 2600,
        starLabelCount: 14,
        orbitSegments: 260,
        dustCount: 3800,
        asteroidCount: 2200,
        planetSegW: 112,
        planetSegH: 72,
        moonSegW: 96,
        moonSegH: 64,
        orbitalAtmoSegW: 88,
        orbitalAtmoSegH: 56,
        earthOverlaySegments: 96,
        atmosphereSegW: 48,
        atmosphereSegH: 48,
        skyDomeSegW: 48,
        skyDomeSegH: 48,
        reliefSolidW: 1024,
        reliefSolidH: 512,
        reliefGasW: 704,
        reliefGasH: 352,
        earthMaskW: 1024,
        earthMaskH: 512,
        maxAnisotropy: 16,
        targetLodBase: 240,
        targetLodBoost: 92,
        targetLodCapBalanced: 320,
        targetLodCapUltra: 416,
        heavyUpdateDivider: 1,
        antialias: true,
        powerPreference: "high-performance"
      };
  const HIGH_PRIORITY_MOBILE_RELIEF = new Set(["earth", "mars", "moon"]);
  const MOBILE_TEXTURE_PRIORITY = lowEndMobile
    ? new Set(["sun", "moon", "earth", "mars"])
    : new Set(["sun", "moon", "mercury", "venus", "earth", "mars", "jupiter", "saturn"]);
  const STAR_COUNT = PERF.starCount;
  const ZOOM_MIN = 0.12;
  const ZOOM_MAX = 4.5;
  const ZOOM_BASE_DISTANCE = 760;

  let running = true;
  let speed = 1;
  let lastT = performance.now();
  let audioProbe = 0;
  let fps = 0;
  let fpsFrames = 0;
  let fpsTime = 0;
  let followId = null;
  let lastOrbitCommandIssuedAt = 0;
  let selected = null;
  let explorerTargetId = "sun";
  const climateAdjust = { tempOffset: 0, pressure: 1, wind: 1 };
  const flight = { active: false, targetId: null, distance: 120, smooth: 0.05 };
  const surface = {
    active: false,
    targetId: null,
    mode: "orbital",
    traverseMode: false,
    traverseDir: new THREE.Vector3(0, 1, 0),
    traverseHeading: 0,
    traverseTargetAltitude: 0,
    atmosphere: null,
    skyDome: null,
    weather: null,
    terrainSampler: null,
    cycloneTime: 0,
    lastTarget: new THREE.Vector3(),
    blockSpaceView: false,
    stormFlash: 0,
    crackleLock: 0,
    landingSequence: null,
    starVisibility: 1,
    skyAssist: 0,
    entryStabilizer: 0,
    baseMinDistance: 18,
    baseMaxDistance: 7000,
    lodMesh: null,
    lodOriginalGeometry: null
  };
  const immersion = {
    enabled: false,
    targetFov: 54,
    altitudeR: 0,
    descentRps: 0,
    gForce: 1,
    turbulence: 0,
    lastAltitudeR: null,
    lastDescentRps: 0,
    phase: 0,
    landingPulseLock: 0
  };
  const keys = Object.create(null);
  const virtualKeys = Object.create(null);
  const eva = {
    active: false,
    pointerLocked: false,
    yaw: 0,
    pitch: 0,
    radialDir: new THREE.Vector3(0, 1, 0),
    hover: 0,
    verticalVel: 0,
    grounded: true,
    jumpQueued: false,
    thruster: 0,
    sinkRate: 0
  };
  const touchControls = {
    moveActive: false,
    lookActive: false,
    moveStart: new THREE.Vector2(),
    moveDelta: new THREE.Vector2(),
    lookStart: new THREE.Vector2(),
    lookDelta: new THREE.Vector2(),
    sprintHeld: false,
    brakeHeld: false,
    jumpHeld: false
  };
  const controlPrefs = {
    touchSensitivity: 1,
    handedness: "right"
  };
  const mobileProfile = {
    applied: false
  };
  let landingRealismMode = "realistic";
  let terrainDetailPreset = "balanced";
  const spaceNav = {
    enabled: false,
    speedStep: 0,
    minStep: -3,
    maxStep: 10,
    baseVelocity: 18,
    boostMultiplier: 2.2,
    brakeMultiplier: 0.25
  };

  const audio = {
    ctx: null,
    master: null,
    comp: null,
    dryGain: null,
    wetGain: null,
    convolver: null,
    envFilter: null,
    stereoPan: null,
    impulseBank: null,
    impulseKey: "vacuum",
    hissFilter: null,
    hissGain: null,
    resonanceOsc: null,
    resonanceGain: null,
    bedGain: null,
    windGain: null,
    rumbleGain: null,
    oscGain: null,
    noiseFilter: null,
    windFilter: null,
    rumbleFilter: null,
    lfo: null,
    lfoGain: null,
    source: null,
    oscA: null,
    oscB: null,
    rumbleOsc: null,
    sampleMaster: null,
    marsMicGain: null,
    marsWindGain: null,
    marsRotorGain: null,
    marsMicSrc: null,
    marsWindSrc: null,
    marsRotorSrc: null,
    sampleBuffers: {},
    cinemaGain: null,
    cinemaFilter: null,
    cinemaLfo: null,
    cinemaLfoGain: null,
    enabled: false
  };

  const settings = {
    showOrbits: true,
    showInnerOrbits: true,
    showAsteroids: true,
    showComets: true,
    showDust: true,
    showTech: true,
    showLabels: true,
    floatingOrigin: true
  };

  const appSettingsApi = window.ADZSettings || null;
  const appSettingsFallback = {
    lang: "ar",
    quality: "auto",
    soundMode: "realism",
    soundVolume: 0.45,
    soundEnabled: true,
    motion: "full"
  };
  let appSettings = appSettingsApi?.load ? appSettingsApi.load() : appSettingsFallback;
  const UI_MODE_KEY = "adz_orbit_ui_mode_v2";
  const ORBIT_EPH_KEY = "adz_orbit_ephemeris_v1";
  const ORBIT_TERRAIN_DETAIL_KEY = "adz_orbit_terrain_detail_v1";
  const ORBIT_COMMAND_KEY = "adz_orbit_command_v1";
  const uiState = { compact: true };
  const adaptiveQuality = {
    mobileHint: mobileLiteMode,
    tier: "high",
    fpsSampleSec: 0,
    fpsSampleFrames: 0,
    pixelRatioScale: 1,
    starDrawRatio: 1,
    weatherScale: 1,
    audioUpdateInterval: 0.15,
    hideDust: false,
    hideLabels: false,
    hideTech: false
  };
  const runtimeState = {
    pageHidden: document.visibilityState === "hidden",
    contextLost: false
  };
  const mobilePerfGuard = {
    emergency: ultraLowEndMobile,
    lowFpsHits: 0
  };
  let starGeometry = null;
  let dustPoints = null;
  let asteroidPoints = null;
  const ephemeris = createEphemerisEngine({ AU, DEG, defaultPreset: "precise" });
  const simClock = createTimeSystem();
  simClock.setDaysSinceJ2000Tt(0);
  const floatingOrigin = {
    enabled: true,
    threshold: AU * 18,
    offset: new THREE.Vector3()
  };
  const previousWorldPosMap = new Map();
  const velocityMap = new Map();
  const moonDefById = new Map(moons.map((m) => [m.id, m]));
  const bodyDefById = new Map(bodies.map((b) => [b.id, b]));
  const cometDefById = new Map(comets.map((c) => [c.id, c]));
  const flightComputer = {
    mode: "off",
    targetId: "sun",
    lockStrength: 0.16,
    vectorLead: 36
  };
  const mouseContext = {
    open: false,
    pointerDown: false,
    moved: 0,
    startX: 0,
    startY: 0,
    targetId: "sun",
    suppressClick: false
  };
  const validationCheckpoints = {
    j2000: {
      key: "j2000",
      label: "J2000 Epoch",
      utcIso: "2000-01-01T11:58:55.816Z",
      focusId: "earth",
      note: "Reference epoch used by modern ephemerides."
    },
    apollo11: {
      key: "apollo11",
      label: "Apollo 11 Landing",
      utcIso: "1969-07-20T20:17:40Z",
      focusId: "moon",
      note: "First human lunar landing."
    },
    cassini_soi: {
      key: "cassini_soi",
      label: "Cassini SOI",
      utcIso: "2004-07-01T01:12:00Z",
      focusId: "saturn",
      note: "Cassini Saturn Orbit Insertion."
    },
    new_horizons_pluto: {
      key: "new_horizons_pluto",
      label: "New Horizons Pluto Flyby",
      utcIso: "2015-07-14T11:49:00Z",
      focusId: "pluto",
      note: "Closest approach to Pluto."
    },
    europa_clipper_launch: {
      key: "europa_clipper_launch",
      label: "Europa Clipper Launch",
      utcIso: "2024-10-14T16:00:00Z",
      focusId: "jupiter",
      note: "Recent mission era checkpoint."
    }
  };
  const FLIGHT_MODE_LABEL = {
    off: "FC: OFF",
    target: "FC: TARGET LOCK",
    prograde: "FC: PROGRADE",
    retrograde: "FC: RETROGRADE",
    normal: "FC: NORMAL"
  };
  let perfFrameCounter = 0;
  const toJulianDateUtc = (utcIso) => (Date.parse(utcIso) / 86400000) + 2440587.5;

  const getSimDaysTt = () => simClock.getDaysSinceJ2000Tt();

  const syncTouchUiMode = () => {
    const isTouchLike = (
      !!coarsePointerQuery?.matches
      || ("ontouchstart" in window)
      || window.innerWidth <= 900
    );
    document.body.classList.toggle("touch-ui", isTouchLike);
    document.body.classList.toggle("mobile-simple", isTouchLike || mobileLiteMode);
    document.body.classList.toggle("mobile-profile", mobileLiteMode);
  };

  function getPixelRatioCap(quality) {
    if (mobileLiteMode) {
      if (quality === "high") return ultraLowEndMobile ? 0.82 : (lowEndMobile ? 0.9 : 1.08);
      if (quality === "balanced") return ultraLowEndMobile ? 0.74 : (lowEndMobile ? 0.82 : 0.95);
      if (quality === "low") return ultraLowEndMobile ? 0.66 : (lowEndMobile ? 0.72 : 0.82);
      return ultraLowEndMobile ? 0.72 : (lowEndMobile ? 0.8 : 0.9);
    }
    if (quality === "low") return 1.15;
    if (quality === "balanced") return 1.7;
    if (quality === "high") return 2.5;
    return 2.0;
  }

  const hash01 = (a, b, seed = 0) => {
    let h = (
      Math.imul(a + seed * 17 + 1, 374761393)
      ^ Math.imul(b + seed * 31 + 7, 668265263)
      ^ Math.imul(seed + 13, 2246822519)
    ) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };

  const getStarColorFromBv = (bv, out = new THREE.Color()) => {
    const value = THREE.MathUtils.clamp(bv, STAR_COLOR_STOPS[0].bv, STAR_COLOR_STOPS[STAR_COLOR_STOPS.length - 1].bv);
    for (let i = 1; i < STAR_COLOR_STOPS.length; i += 1) {
      const prev = STAR_COLOR_STOPS[i - 1];
      const next = STAR_COLOR_STOPS[i];
      if (value <= next.bv) {
        const t = THREE.MathUtils.clamp((value - prev.bv) / Math.max(0.0001, next.bv - prev.bv), 0, 1);
        return out.setHex(prev.color).lerp(TMP_COLOR.setHex(next.color), t);
      }
    }
    return out.setHex(STAR_COLOR_STOPS[STAR_COLOR_STOPS.length - 1].color);
  };

  const getDirectionFromRaDec = (raDeg, decDeg, out = new THREE.Vector3()) => {
    const ra = raDeg * DEG;
    const dec = decDeg * DEG;
    const cosDec = Math.cos(dec);
    out.set(
      cosDec * Math.cos(ra),
      Math.sin(dec),
      cosDec * Math.sin(ra)
    );
    return out.normalize();
  };

  const getSolarActivityFactor = (simDays, sunClimate) => {
    const cycleDays = 11 * 365.25;
    const cyclePhase = (simDays % cycleDays) / cycleDays;
    const cycleWave = 0.5 + 0.5 * Math.sin(cyclePhase * Math.PI * 2 - 0.7);
    const windNorm = THREE.MathUtils.clamp((sunClimate?.windKmh || 0) / 7600, 0, 1.8);
    const pulse = 0.5 + 0.5 * Math.sin(simDays * 0.91 + 1.4);
    return THREE.MathUtils.clamp(0.24 + cycleWave * 0.48 + windNorm * 0.32 + pulse * 0.09, 0, 1.5);
  };

  const terrainRuntime = new Map();
  const bodyVisualRuntime = new Map();
  const texturePath = (name) => `assets/textures/${name}.jpg`;
  const BRIGHT_STAR_CATALOG = [
    { name: "Sirius", ra: 101.287, dec: -16.716, mag: -1.46, bv: 0.0 },
    { name: "Canopus", ra: 95.987, dec: -52.696, mag: -0.74, bv: 0.15 },
    { name: "Arcturus", ra: 213.915, dec: 19.182, mag: -0.05, bv: 1.23 },
    { name: "Vega", ra: 279.234, dec: 38.783, mag: 0.03, bv: 0.0 },
    { name: "Capella", ra: 79.172, dec: 45.998, mag: 0.08, bv: 0.8 },
    { name: "Rigel", ra: 78.634, dec: -8.202, mag: 0.13, bv: -0.03 },
    { name: "Procyon", ra: 114.825, dec: 5.225, mag: 0.38, bv: 0.42 },
    { name: "Achernar", ra: 24.428, dec: -57.236, mag: 0.46, bv: -0.16 },
    { name: "Betelgeuse", ra: 88.793, dec: 7.407, mag: 0.5, bv: 1.85 },
    { name: "Hadar", ra: 210.955, dec: -60.373, mag: 0.61, bv: -0.23 },
    { name: "Altair", ra: 297.695, dec: 8.868, mag: 0.76, bv: 0.22 },
    { name: "Acrux", ra: 186.65, dec: -63.099, mag: 0.76, bv: -0.24 },
    { name: "Aldebaran", ra: 68.98, dec: 16.509, mag: 0.87, bv: 1.54 },
    { name: "Spica", ra: 201.298, dec: -11.161, mag: 0.98, bv: -0.23 },
    { name: "Antares", ra: 247.351, dec: -26.432, mag: 1.06, bv: 1.83 },
    { name: "Pollux", ra: 116.329, dec: 28.026, mag: 1.14, bv: 1.0 },
    { name: "Fomalhaut", ra: 344.412, dec: -29.622, mag: 1.16, bv: 0.09 },
    { name: "Deneb", ra: 310.358, dec: 45.28, mag: 1.25, bv: 0.09 },
    { name: "Regulus", ra: 152.093, dec: 11.967, mag: 1.35, bv: -0.11 },
    { name: "Adhara", ra: 104.656, dec: -28.972, mag: 1.5, bv: -0.23 },
    { name: "Shaula", ra: 263.402, dec: -37.103, mag: 1.62, bv: -0.22 },
    { name: "Bellatrix", ra: 81.283, dec: 6.35, mag: 1.64, bv: -0.21 },
    { name: "Elnath", ra: 81.572, dec: 28.607, mag: 1.65, bv: -0.13 },
    { name: "Miaplacidus", ra: 138.301, dec: -69.717, mag: 1.67, bv: -0.08 },
    { name: "Alnilam", ra: 84.053, dec: -1.202, mag: 1.69, bv: -0.19 },
    { name: "Alnair", ra: 332.058, dec: -46.961, mag: 1.74, bv: -0.03 },
    { name: "Alioth", ra: 193.507, dec: 55.959, mag: 1.76, bv: 0.0 },
    { name: "Alnitak", ra: 85.19, dec: -1.943, mag: 1.77, bv: -0.19 },
    { name: "Dubhe", ra: 165.932, dec: 61.751, mag: 1.79, bv: 1.07 },
    { name: "Mirfak", ra: 51.081, dec: 49.861, mag: 1.79, bv: 0.48 },
    { name: "Wezen", ra: 104.657, dec: -26.393, mag: 1.83, bv: 0.67 },
    { name: "Sargas", ra: 263.734, dec: -42.997, mag: 1.86, bv: 0.11 },
    { name: "Avior", ra: 125.628, dec: -59.51, mag: 1.86, bv: 1.47 },
    { name: "Alkaid", ra: 206.885, dec: 49.313, mag: 1.86, bv: -0.02 },
    { name: "Menkent", ra: 211.671, dec: -36.37, mag: 2.06, bv: 1.6 },
    { name: "Atria", ra: 252.166, dec: -69.027, mag: 1.91, bv: 1.44 },
    { name: "Peacock", ra: 309.392, dec: -56.735, mag: 1.94, bv: -0.16 },
    { name: "Alhena", ra: 99.428, dec: 16.399, mag: 1.93, bv: 0.0 },
    { name: "Mirzam", ra: 95.675, dec: -17.955, mag: 1.98, bv: -0.15 },
    { name: "Polaris", ra: 37.955, dec: 89.264, mag: 1.98, bv: 0.6 },
    { name: "Hamal", ra: 31.793, dec: 23.462, mag: 2.01, bv: 1.15 },
    { name: "Nunki", ra: 283.816, dec: -26.297, mag: 2.05, bv: -0.1 },
    { name: "Alpheratz", ra: 2.097, dec: 29.09, mag: 2.06, bv: -0.03 },
    { name: "Kochab", ra: 222.676, dec: 74.155, mag: 2.07, bv: 1.47 },
    { name: "Algol", ra: 47.043, dec: 40.956, mag: 2.12, bv: -0.04 },
    { name: "Algieba", ra: 154.993, dec: 19.842, mag: 2.14, bv: 1.13 },
    { name: "Rasalhague", ra: 263.733, dec: 12.56, mag: 2.07, bv: 0.15 },
    { name: "Denebola", ra: 177.266, dec: 14.572, mag: 2.14, bv: 0.09 },
    { name: "Caph", ra: 2.294, dec: 59.15, mag: 2.28, bv: 0.38 },
    { name: "Mimosa", ra: 191.93, dec: -59.688, mag: 1.25, bv: -0.24 }
  ];
  const STAR_COLOR_STOPS = [
    { bv: -0.35, color: 0x9bbcff },
    { bv: 0.0, color: 0xc8dcff },
    { bv: 0.35, color: 0xf6f7ff },
    { bv: 0.8, color: 0xffefcf },
    { bv: 1.3, color: 0xffd2a1 },
    { bv: 2.0, color: 0xffad76 }
  ];


  const renderer = new THREE.WebGLRenderer({
    canvas: ui.canvas,
    antialias: PERF.antialias,
    alpha: true,
    powerPreference: PERF.powerPreference
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, getPixelRatioCap(appSettings.quality)));

  const scene = new THREE.Scene();
  const SPACE_BG_COLOR = new THREE.Color(0x02060f);
  const TMP_COLOR = new THREE.Color();
  const TMP_COLOR_B = new THREE.Color();
  scene.background = SPACE_BG_COLOR.clone();
  scene.fog = new THREE.FogExp2(0x01040a, 0.00042);

  const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 9000);
  camera.position.set(0, 74, 190);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 18;
  controls.maxDistance = 7000;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
  };
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
  };

  const root = new THREE.Group();
  const groups = {
    stars: new THREE.Group(),
    orbits: new THREE.Group(),
    innerOrbits: new THREE.Group(),
    dust: new THREE.Group(),
    asteroids: new THREE.Group(),
    comets: new THREE.Group(),
    labels: new THREE.Group(),
    tech: new THREE.Group()
  };
  root.add(groups.orbits, groups.innerOrbits, groups.dust, groups.asteroids, groups.comets, groups.tech, groups.labels);
  scene.add(root, groups.stars);
  const ambientLight = new THREE.AmbientLight(0x7ca5e3, 0.26);
  const hemisphereLight = new THREE.HemisphereLight(0x9dc1ff, 0x060b19, 0.3);
  scene.add(ambientLight, hemisphereLight);
  const surfaceSunLight = new THREE.DirectionalLight(0xfff1d2, 0);
  const surfaceRimLight = new THREE.DirectionalLight(0x8db8ff, 0);
  surfaceSunLight.position.set(0, 0, 1);
  surfaceRimLight.position.set(0, 0, -1);
  scene.add(surfaceSunLight, surfaceSunLight.target, surfaceRimLight, surfaceRimLight.target);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const loader = new THREE.TextureLoader();
  const bodyMap = new Map();
  const moonMap = new Map();
  const entityMap = new Map();
  const clickable = [];
  const starTwinkle = [];
  const tmpV1 = new THREE.Vector3();
  const tmpV2 = new THREE.Vector3();
  const tmpV3 = new THREE.Vector3();
  const tmpV4 = new THREE.Vector3();
  const navForward = new THREE.Vector3();
  const navRight = new THREE.Vector3();
  const navUp = new THREE.Vector3();
  const navMove = new THREE.Vector3();
  const traverseForward = new THREE.Vector3();
  const traverseEast = new THREE.Vector3();
  const traverseNorth = new THREE.Vector3();

  let sunMesh = null;
  let sunGlow = null;

  function applyRendererQualityFromSettings() {
    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      getPixelRatioCap(appSettings.quality) * adaptiveQuality.pixelRatioScale
    );
    renderer.setPixelRatio(pixelRatio);
  }

  function applyGlobalAudioSettingsToUi() {
    const desiredMode = typeof appSettings.soundMode === "string" ? appSettings.soundMode : "realism";
    const hasMode = Array.from(ui.audioMode.options).some((option) => option.value === desiredMode);
    ui.audioMode.value = hasMode ? desiredMode : "realism";

    const volume = Number(appSettings.soundVolume);
    const safeVolume = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0.45;
    ui.audioVolume.value = safeVolume.toFixed(2);
    ui.audioVolumeValue.textContent = `${Math.round(safeVolume * 100)}%`;

    const enabled = appSettings.soundMode !== "off" && appSettings.soundEnabled !== false;
    ui.audioEnable.checked = enabled;
  }

  function persistGlobalAudioSettings() {
    if (!appSettingsApi?.update) return;
    appSettings = appSettingsApi.update({
      soundMode: ui.audioMode.value,
      soundVolume: Number(ui.audioVolume.value),
      soundEnabled: ui.audioEnable.checked
    });
  }

  function handleGlobalSettingsChange(nextSettings = null) {
    appSettings = nextSettings || (appSettingsApi?.load ? appSettingsApi.load() : appSettings);
    applyAdaptiveTier(adaptiveQuality.tier);
    applyGlobalAudioSettingsToUi();

    const shouldEnableAudio = ui.audioEnable.checked && ui.audioMode.value !== "off";
    if (!shouldEnableAudio && audio.enabled) setAudioEnabled(false);
    if (shouldEnableAudio) updateAudioFromSimulation();
  }

  const applyAdaptiveTier = (tier) => {
    const baseProfile = ADAPTIVE_QUALITY_PROFILES[tier] || ADAPTIVE_QUALITY_PROFILES.high;
    let profile = baseProfile;
    if (mobileLiteMode) {
      const mobileProfiles = lowEndMobile
        ? {
            high: { pixel: 0.82, star: 0.58, weather: 0.32, audioTick: 0.28, hideDust: true, hideLabels: true, hideTech: true },
            balanced: { pixel: 0.72, star: 0.46, weather: 0.22, audioTick: 0.34, hideDust: true, hideLabels: true, hideTech: true },
            eco: { pixel: 0.62, star: 0.34, weather: 0, audioTick: 0.42, hideDust: true, hideLabels: true, hideTech: true }
          }
        : {
            high: { pixel: 0.95, star: 0.84, weather: 0.62, audioTick: 0.22, hideDust: false, hideLabels: false, hideTech: false },
            balanced: { pixel: 0.84, star: 0.68, weather: 0.46, audioTick: 0.26, hideDust: true, hideLabels: false, hideTech: true },
            eco: { pixel: 0.74, star: 0.5, weather: 0.28, audioTick: 0.32, hideDust: true, hideLabels: true, hideTech: true }
          };
      profile = mobileProfiles[tier] || mobileProfiles.balanced;
      if (mobilePerfGuard.emergency) {
        profile = {
          ...profile,
          pixel: Math.min(profile.pixel, lowEndMobile ? 0.6 : 0.7),
          star: Math.min(profile.star, 0.32),
          weather: 0,
          audioTick: Math.max(profile.audioTick, 0.42),
          hideDust: true,
          hideLabels: true,
          hideTech: true
        };
      }
    }
    adaptiveQuality.tier = tier;
    adaptiveQuality.pixelRatioScale = profile.pixel;
    adaptiveQuality.starDrawRatio = profile.star;
    adaptiveQuality.weatherScale = profile.weather;
    adaptiveQuality.audioUpdateInterval = profile.audioTick;
    adaptiveQuality.hideDust = profile.hideDust;
    adaptiveQuality.hideLabels = profile.hideLabels;
    adaptiveQuality.hideTech = profile.hideTech;
    if (adaptiveQuality.weatherScale <= 0.01 && surface.weather) {
      const { points } = surface.weather;
      if (points && points.parent) points.parent.remove(points);
      points?.geometry?.dispose();
      points?.material?.dispose();
      surface.weather = null;
    }

    applyRendererQualityFromSettings();
    if (starGeometry) {
      const minStars = mobileLiteMode
        ? (ultraLowEndMobile ? 120 : (lowEndMobile ? 180 : 260))
        : 400;
      const drawCount = Math.max(minStars, Math.floor(STAR_COUNT * adaptiveQuality.starDrawRatio));
      starGeometry.setDrawRange(0, drawCount);
    }
    if (dustPoints?.material) {
      dustPoints.material.opacity = adaptiveQuality.hideDust ? 0.12 : 0.26;
    }
    if (asteroidPoints?.material) {
      asteroidPoints.material.opacity = adaptiveQuality.hideDust ? 0.44 : 0.74;
    }
  };

  const updateAdaptiveQuality = (dt) => {
    adaptiveQuality.fpsSampleSec += dt;
    adaptiveQuality.fpsSampleFrames += 1;
    if (adaptiveQuality.fpsSampleSec < 2) return;
    const sampledFps = adaptiveQuality.fpsSampleFrames / adaptiveQuality.fpsSampleSec;
    adaptiveQuality.fpsSampleSec = 0;
    adaptiveQuality.fpsSampleFrames = 0;
    if (mobileLiteMode) {
      const lowFpsFloor = ultraLowEndMobile ? 15 : (lowEndMobile ? 18 : 22);
      if (sampledFps < lowFpsFloor) {
        mobilePerfGuard.lowFpsHits += 1;
      } else {
        mobilePerfGuard.lowFpsHits = Math.max(0, mobilePerfGuard.lowFpsHits - 1);
      }
      if (!mobilePerfGuard.emergency && mobilePerfGuard.lowFpsHits >= 3) {
        mobilePerfGuard.emergency = true;
        settings.showAsteroids = false;
        settings.showComets = false;
        settings.showDust = false;
        settings.showTech = false;
        settings.showLabels = false;
        ui.showAsteroids.checked = false;
        ui.showComets.checked = false;
        ui.showDust.checked = false;
        ui.showTech.checked = false;
        ui.showLabels.checked = false;
        if (surface.weather) {
          const { points } = surface.weather;
          if (points && points.parent) points.parent.remove(points);
          points?.geometry?.dispose();
          points?.material?.dispose();
          surface.weather = null;
        }
        setValidationStatus("MOBILE SAFE MODE: ON", true);
        applyAdaptiveTier("eco");
        return;
      }
      if (mobilePerfGuard.emergency) {
        if (adaptiveQuality.tier !== "eco") applyAdaptiveTier("eco");
        return;
      }
    }

    const nextTier = pickAdaptiveTier({
      mobileHint: adaptiveQuality.mobileHint,
      sampledFps,
      currentTier: adaptiveQuality.tier
    });
    if (nextTier !== adaptiveQuality.tier) applyAdaptiveTier(nextTier);
  };

  function getMotionScale() {
    if (appSettingsApi?.motionScale) return appSettingsApi.motionScale(appSettings.motion);
    if (appSettings.motion === "reduced") return 0.6;
    if (appSettings.motion === "minimal") return 0.25;
    return 1;
  }

  const loadTex = (name) => new Promise((resolve) => {
    loader.load(
      texturePath(name),
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(PERF.maxAnisotropy, renderer.capabilities.getMaxAnisotropy());
        resolve(tex);
      },
      undefined,
      () => resolve(null)
    );
  });

  // Localized relief accents to make iconic formations readable at landing scale.
  const LANDMARK_RELIEF_PRESETS = {
    mercury: [{ lat: 30, lon: 160, size: 16, amp: -0.16 }],
    venus: [{ lat: 66, lon: 4, size: 13, amp: 0.14 }],
    earth: [
      { lat: 28, lon: 86, size: 12, amp: 0.13 },
      { lat: -25, lon: -70, size: 15, amp: 0.1 },
      { lat: 64, lon: -42, size: 18, amp: 0.08 },
      { lat: 11, lon: 142, size: 11, amp: -0.14 }
    ],
    mars: [
      { lat: 18.5, lon: -133.8, size: 12, amp: 0.32 }, // Olympus Mons
      { lat: -14, lon: -59, size: 23, amp: -0.26, stretch: 2.9, angleDeg: -13 } // Valles Marineris
    ],
    moon: [{ lat: -53, lon: 169, size: 20, amp: -0.2 }],
    titan: [{ lat: -15, lon: 180, size: 20, amp: 0.08, stretch: 2.5 }],
    pluto: [{ lat: 20, lon: 180, size: 18, amp: -0.16 }],
    triton: [{ lat: -50, lon: 110, size: 15, amp: 0.08 }]
  };
  const fallbackLandmarkCache = new Map();

  const wrapLonDelta = (a, b) => {
    let d = a - b;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  };

  const getLandmarkReliefDelta = (id, latDeg, lonDeg) => {
    let marks = LANDMARK_RELIEF_PRESETS[id];
    if (!marks?.length) {
      const geo = geoProfiles[id];
      if (!geo?.solid) return 0;
      if (!fallbackLandmarkCache.has(id)) {
        const hash = Array.from(id).reduce((acc, ch) => ((acc * 131) + ch.charCodeAt(0)) >>> 0, 17);
        const lat = ((hash % 140) - 70);
        const lon = (((hash * 53) % 360) - 180);
        const size = 10 + ((hash >> 3) % 10);
        const amp = ((hash & 1) === 0 ? 1 : -1) * (0.08 + ((hash >> 5) % 5) * 0.02);
        fallbackLandmarkCache.set(id, [{ lat, lon, size, amp }]);
      }
      marks = fallbackLandmarkCache.get(id);
    }
    if (!marks?.length) return 0;
    const latCos = Math.max(0.22, Math.cos(latDeg * DEG));
    let delta = 0;
    for (const mark of marks) {
      const size = Math.max(2, mark.size || 10);
      const dLon = wrapLonDelta(lonDeg, mark.lon) * latCos;
      const dLat = latDeg - mark.lat;
      let nx = dLon / size;
      let ny = dLat / size;
      if (mark.angleDeg) {
        const a = mark.angleDeg * DEG;
        const c = Math.cos(a);
        const s = Math.sin(a);
        const rx = nx * c - ny * s;
        const ry = nx * s + ny * c;
        nx = rx;
        ny = ry;
      }
      const stretch = Math.max(0.25, mark.stretch || 1);
      const r2 = (nx / stretch) * (nx / stretch) + ny * ny;
      delta += (mark.amp || 0) * Math.exp(-r2 * 2.4);
    }
    return delta;
  };

  const makeReliefFromTexture = (mapTex, id) => {
    if (!mapTex?.image) return null;
    const profile = geoProfiles[id];
    if (!profile) return null;

    const srcW = mapTex.image.width || 0;
    const srcH = mapTex.image.height || 0;
    if (srcW < 8 || srcH < 8) return null;

    const solid = profile.solid;
    const outW = solid ? PERF.reliefSolidW : PERF.reliefGasW;
    const outH = solid ? PERF.reliefSolidH : PERF.reliefGasH;

    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = outW;
    srcCanvas.height = outH;
    const srcCtx = srcCanvas.getContext("2d", { willReadFrequently: true });
    srcCtx.drawImage(mapTex.image, 0, 0, outW, outH);
    const src = srcCtx.getImageData(0, 0, outW, outH);
    const px = src.data;

    const luma = new Float32Array(outW * outH);
    for (let i = 0, p = 0; i < luma.length; i += 1, p += 4) {
      luma[i] = (px[p] * 0.2126 + px[p + 1] * 0.7152 + px[p + 2] * 0.0722) / 255;
    }

    const outCanvas = document.createElement("canvas");
    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext("2d");
    const out = outCtx.createImageData(outW, outH);
    const outPx = out.data;
    const sampler = new Float32Array(outW * outH);

    for (let y = 0; y < outH; y += 1) {
      const yn = y > 0 ? y - 1 : y;
      const ys = y < outH - 1 ? y + 1 : y;
      const vNorm = outH > 1 ? y / (outH - 1) : 0;
      const latDeg = 90 - vNorm * 180;
      for (let x = 0; x < outW; x += 1) {
        const xl = x > 0 ? x - 1 : outW - 1;
        const xr = x < outW - 1 ? x + 1 : 0;
        const uNorm = outW > 1 ? x / (outW - 1) : 0;
        const lonDeg = uNorm * 360 - 180;
        const i = y * outW + x;
        const c = luma[i];
        const n = luma[yn * outW + x];
        const s = luma[ys * outW + x];
        const w = luma[y * outW + xl];
        const e = luma[y * outW + xr];
        const localVar = Math.abs(c - n) + Math.abs(c - s) + Math.abs(c - w) + Math.abs(c - e);
        let h;
        if (solid) {
          // Emphasize local relief edges for rocky/icy bodies.
          const macroA = Math.sin((uNorm * Math.PI * 6.2) + (vNorm * Math.PI * 2.1));
          const macroB = Math.cos((uNorm * Math.PI * 11.8) - (vNorm * Math.PI * 5.3));
          const macro = macroA * 0.038 + macroB * 0.026;
          const landmark = getLandmarkReliefDelta(id, latDeg, lonDeg);
          h = THREE.MathUtils.clamp(c * 0.61 + localVar * 0.82 + macro + landmark, 0, 1);
        } else {
          // Gas giants: derive subtle cloud-top undulation from band gradients.
          const band = Math.abs(n - s) * 1.2 + Math.abs(w - e) * 0.4;
          const macro = Math.sin(vNorm * Math.PI * 9.2 + uNorm * Math.PI * 2.1) * 0.018;
          h = THREE.MathUtils.clamp(c * 0.68 + band * 0.46 + macro, 0, 1);
        }
        sampler[i] = h;
        const v = Math.round(h * 255);
        const p = i * 4;
        outPx[p] = v;
        outPx[p + 1] = v;
        outPx[p + 2] = v;
        outPx[p + 3] = 255;
      }
    }
    outCtx.putImageData(out, 0, 0);

    const normalCanvas = document.createElement("canvas");
    normalCanvas.width = outW;
    normalCanvas.height = outH;
    const normalCtx = normalCanvas.getContext("2d");
    const normalImage = normalCtx.createImageData(outW, outH);
    const normalPx = normalImage.data;
    const normalStrength = solid ? 6.2 : 2.4;
    for (let y = 0; y < outH; y += 1) {
      const yn = y > 0 ? y - 1 : y;
      const ys = y < outH - 1 ? y + 1 : y;
      for (let x = 0; x < outW; x += 1) {
        const xl = x > 0 ? x - 1 : outW - 1;
        const xr = x < outW - 1 ? x + 1 : 0;
        const i = y * outW + x;
        const hL = sampler[y * outW + xl];
        const hR = sampler[y * outW + xr];
        const hN = sampler[yn * outW + x];
        const hS = sampler[ys * outW + x];
        const nx = -(hR - hL) * normalStrength;
        const ny = -(hS - hN) * normalStrength;
        const nz = 1;
        const invLen = 1 / Math.hypot(nx, ny, nz);
        const p = i * 4;
        normalPx[p] = Math.round((nx * invLen * 0.5 + 0.5) * 255);
        normalPx[p + 1] = Math.round((ny * invLen * 0.5 + 0.5) * 255);
        normalPx[p + 2] = Math.round((nz * invLen * 0.5 + 0.5) * 255);
        normalPx[p + 3] = 255;
      }
    }
    normalCtx.putImageData(normalImage, 0, 0);

    const reliefTex = new THREE.CanvasTexture(outCanvas);
    reliefTex.colorSpace = THREE.NoColorSpace;
    reliefTex.anisotropy = Math.min(PERF.maxAnisotropy, renderer.capabilities.getMaxAnisotropy());
    reliefTex.minFilter = THREE.LinearMipmapLinearFilter;
    reliefTex.magFilter = THREE.LinearFilter;
    reliefTex.wrapS = THREE.RepeatWrapping;
    reliefTex.needsUpdate = true;

    const normalTex = new THREE.CanvasTexture(normalCanvas);
    normalTex.colorSpace = THREE.NoColorSpace;
    normalTex.anisotropy = Math.min(PERF.maxAnisotropy, renderer.capabilities.getMaxAnisotropy());
    normalTex.minFilter = THREE.LinearMipmapLinearFilter;
    normalTex.magFilter = THREE.LinearFilter;
    normalTex.wrapS = THREE.RepeatWrapping;
    normalTex.needsUpdate = true;
    return {
      texture: reliefTex,
      normalTexture: normalTex,
      sampler: { width: outW, height: outH, data: sampler }
    };
  };

  const createMaskTextureFromCanvas = (canvas) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.NoColorSpace;
    tex.anisotropy = Math.min(PERF.maxAnisotropy, renderer.capabilities.getMaxAnisotropy());
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  };

  const ensureBodyVisualRecord = (id, hostMesh = null) => {
    const existing = bodyVisualRuntime.get(id) || {};
    if (hostMesh) existing.hostMesh = hostMesh;
    bodyVisualRuntime.set(id, existing);
    return existing;
  };

  // Build Earth-specific masks from the base albedo for water glint + cloud layer.
  const makeEarthDerivedMaps = (mapTex) => {
    if (!mapTex?.image) return null;
    const srcW = mapTex.image.width || 0;
    const srcH = mapTex.image.height || 0;
    if (srcW < 8 || srcH < 8) return null;

    const outW = mobileLiteMode
      ? PERF.earthMaskW
      : Math.max(PERF.earthMaskW, Math.min(PERF.earthMaskW * 2, srcW));
    const outH = mobileLiteMode
      ? PERF.earthMaskH
      : Math.max(PERF.earthMaskH, Math.min(PERF.earthMaskH * 2, srcH));
    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = outW;
    srcCanvas.height = outH;
    const srcCtx = srcCanvas.getContext("2d", { willReadFrequently: true });
    if (!srcCtx) return null;
    srcCtx.drawImage(mapTex.image, 0, 0, outW, outH);
    const src = srcCtx.getImageData(0, 0, outW, outH).data;

    const roughCanvas = document.createElement("canvas");
    roughCanvas.width = outW;
    roughCanvas.height = outH;
    const roughCtx = roughCanvas.getContext("2d");
    if (!roughCtx) return null;
    const roughData = roughCtx.createImageData(outW, outH);

    const waterCanvas = document.createElement("canvas");
    waterCanvas.width = outW;
    waterCanvas.height = outH;
    const waterCtx = waterCanvas.getContext("2d");
    if (!waterCtx) return null;
    const waterData = waterCtx.createImageData(outW, outH);

    const cloudCanvas = document.createElement("canvas");
    cloudCanvas.width = outW;
    cloudCanvas.height = outH;
    const cloudCtx = cloudCanvas.getContext("2d");
    if (!cloudCtx) return null;
    const cloudData = cloudCtx.createImageData(outW, outH);

    const cityCanvas = document.createElement("canvas");
    cityCanvas.width = outW;
    cityCanvas.height = outH;
    const cityCtx = cityCanvas.getContext("2d");
    if (!cityCtx) return null;
    const cityData = cityCtx.createImageData(outW, outH);

    const roughPx = roughData.data;
    const waterPx = waterData.data;
    const cloudPx = cloudData.data;
    const cityPx = cityData.data;
    const waterMask = new Float32Array(outW * outH);
    const dryMask = new Float32Array(outW * outH);
    for (let i = 0, p = 0; p < src.length; i += 1, p += 4) {
      const r = src[p] / 255;
      const g = src[p + 1] / 255;
      const b = src[p + 2] / 255;
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const sat = maxC > 0.0001 ? (maxC - minC) / maxC : 0;
      const luma = r * 0.2126 + g * 0.7152 + b * 0.0722;

      const blueBias = b - Math.max(r, g * 0.98);
      let water = THREE.MathUtils.clamp(
        blueBias * 3.7 + (sat - 0.06) * 1.8 - Math.max(0, luma - 0.72) * 0.78,
        0,
        1
      );
      if (luma < 0.05) water = 0;
      waterMask[i] = water;
      dryMask[i] = THREE.MathUtils.clamp(
        (r - g) * 1.3 + (r - b) * 0.8 + Math.max(0, luma - 0.28) * 0.2 - sat * 0.45,
        0,
        1
      );

      const warmBias = r - b;
      let cloud = THREE.MathUtils.clamp(
        (luma - 0.62) * 2.2 + (0.22 - sat) * 1.4 - warmBias * 0.48,
        0,
        1
      );
      if (water > 0.72 && cloud < 0.2) cloud *= 0.25;

      const roughness = THREE.MathUtils.clamp(0.9 - water * 0.84, 0.04, 0.96);

      const roughByte = Math.round(roughness * 255);
      roughPx[p] = roughByte;
      roughPx[p + 1] = roughByte;
      roughPx[p + 2] = roughByte;
      roughPx[p + 3] = 255;

      const waterByte = Math.round(water * 255);
      waterPx[p] = waterByte;
      waterPx[p + 1] = waterByte;
      waterPx[p + 2] = waterByte;
      waterPx[p + 3] = 255;

      const cloudByte = Math.round(cloud * 255);
      cloudPx[p] = cloudByte;
      cloudPx[p + 1] = cloudByte;
      cloudPx[p + 2] = cloudByte;
      cloudPx[p + 3] = 255;
    }

    roughCtx.putImageData(roughData, 0, 0);
    waterCtx.putImageData(waterData, 0, 0);
    cloudCtx.putImageData(cloudData, 0, 0);

    for (let y = 0; y < outH; y += 1) {
      const yn = y > 0 ? y - 1 : y;
      const ys = y < outH - 1 ? y + 1 : y;
      const vNorm = outH > 1 ? y / (outH - 1) : 0;
      const absLat = Math.abs(90 - vNorm * 180);
      for (let x = 0; x < outW; x += 1) {
        const xl = x > 0 ? x - 1 : outW - 1;
        const xr = x < outW - 1 ? x + 1 : 0;
        const i = y * outW + x;
        const p = i * 4;
        const land = 1 - waterMask[i];
        if (land <= 0.1) {
          cityPx[p] = 0;
          cityPx[p + 1] = 0;
          cityPx[p + 2] = 0;
          cityPx[p + 3] = 255;
          continue;
        }

        const coast = THREE.MathUtils.clamp(
          Math.abs(
            (
              waterMask[y * outW + xl]
              + waterMask[y * outW + xr]
              + waterMask[yn * outW + x]
              + waterMask[ys * outW + x]
            ) * 0.25 - waterMask[i]
          ) * 3.2,
          0,
          1
        );
        const temperate = Math.exp(-((absLat - 32) * (absLat - 32)) / 540);
        const subtropic = Math.exp(-((absLat - 18) * (absLat - 18)) / 420);
        const polarPenalty = THREE.MathUtils.clamp((absLat - 62) / 22, 0, 1);
        const dryPenalty = dryMask[i] * 0.62;
        const n1 = hash01(x, y, 17);
        const n2 = hash01(x, y, 37);
        const cluster = Math.pow(n1, 4) * 1.15 + Math.pow(n2, 9) * 0.82;
        const infra = THREE.MathUtils.clamp(
          0.14 + temperate * 0.84 + subtropic * 0.22 + coast * 0.58 - dryPenalty - polarPenalty * 0.7,
          0,
          1.35
        );
        let city = THREE.MathUtils.clamp(land * infra * cluster * 1.45, 0, 1);
        city = Math.pow(city, 0.72);
        const cityByte = Math.round(city * 255);
        cityPx[p] = cityByte;
        cityPx[p + 1] = cityByte;
        cityPx[p + 2] = cityByte;
        cityPx[p + 3] = 255;
      }
    }
    cityCtx.putImageData(cityData, 0, 0);

    return {
      roughnessTexture: createMaskTextureFromCanvas(roughCanvas),
      waterMaskTexture: createMaskTextureFromCanvas(waterCanvas),
      cloudMaskTexture: createMaskTextureFromCanvas(cloudCanvas),
      cityLightsTexture: createMaskTextureFromCanvas(cityCanvas)
    };
  };

  const getOrbitalAtmosphereProfile = (id) => {
    const climate = climateProfiles[id];
    if (!climate) return null;
    const mode = getEnvMode(id);
    const pressure = Math.max(0, climate.pressureBar || 0);
    const hasAtmo = (
      pressure > 0.0005
      || mode === "gas_storm"
      || mode === "gas_ice_storm"
      || mode === "titan_haze"
      || mode === "rocky_dense"
      || mode === "rocky_sky"
      || mode === "rocky_dust"
      || mode === "dwarf_ice"
    );
    if (!hasAtmo) return null;
    if (id === "earth") return null;

    if (mode === "gas_storm") {
      return { color: getAtmosphereTint(climate.kind), scale: 1.075, base: 0.2, day: 0.12, twilight: 0.16, night: 0.06, power: 2.15 };
    }
    if (mode === "gas_ice_storm") {
      return { color: getAtmosphereTint(climate.kind), scale: 1.072, base: 0.2, day: 0.1, twilight: 0.18, night: 0.06, power: 2.2 };
    }
    if (mode === "titan_haze") {
      return { color: getAtmosphereTint(climate.kind), scale: 1.05, base: 0.18, day: 0.1, twilight: 0.17, night: 0.07, power: 2.4 };
    }
    if (mode === "rocky_dense") {
      return { color: getAtmosphereTint(climate.kind), scale: 1.042, base: 0.14, day: 0.1, twilight: 0.15, night: 0.05, power: 2.55 };
    }
    if (mode === "rocky_dust") {
      return { color: getAtmosphereTint(climate.kind), scale: 1.024, base: 0.06, day: 0.06, twilight: 0.12, night: 0.03, power: 2.85 };
    }
    if (mode === "dwarf_ice") {
      return { color: getAtmosphereTint(climate.kind), scale: 1.028, base: 0.05, day: 0.04, twilight: 0.09, night: 0.04, power: 2.95 };
    }
    return { color: getAtmosphereTint(climate.kind), scale: 1.03, base: 0.08, day: 0.06, twilight: 0.11, night: 0.04, power: 2.75 };
  };

  const applyBodyOrbitalAtmosphereVisuals = (id, mesh) => {
    const atmoProfile = getOrbitalAtmosphereProfile(id);
    if (!atmoProfile || !mesh) return;
    const radius = getEntityRadius(id);
    const segW = PERF.orbitalAtmoSegW;
    const segH = PERF.orbitalAtmoSegH;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uDayColor: { value: new THREE.Color(atmoProfile.color) },
        uNightColor: { value: new THREE.Color(0x243a5c) },
        uIntensity: { value: atmoProfile.base },
        uPower: { value: atmoProfile.power },
        uDayMix: { value: 1 }
      },
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uDayColor;
        uniform vec3 uNightColor;
        uniform float uIntensity;
        uniform float uPower;
        uniform float uDayMix;
        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fres = pow(clamp(1.0 - max(dot(normalize(vWorldNormal), viewDir), 0.0), 0.0, 1.0), uPower);
          vec3 tint = mix(uNightColor, uDayColor, clamp(uDayMix, 0.0, 1.0));
          gl_FragColor = vec4(tint, fres * uIntensity);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const atmoMesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius * atmoProfile.scale, segW, segH),
      material
    );
    atmoMesh.renderOrder = 1;
    mesh.add(atmoMesh);

    const record = ensureBodyVisualRecord(id, mesh);
    record.orbitalAtmosphereMesh = atmoMesh;
    record.orbitalAtmosphereMaterial = material;
    record.orbitalAtmosphereProfile = atmoProfile;
  };

  const applyEarthOrbitalVisuals = (mesh, material, mapTex) => {
    const derived = makeEarthDerivedMaps(mapTex);
    if (!derived || !mesh || !material) return;

    const radius = getEntityRadius("earth");
    material.roughnessMap = derived.roughnessTexture;
    material.roughness = 1;
    material.bumpScale = Math.max(material.bumpScale * 0.7, radius * 0.0035);
    if (material.normalScale) material.normalScale.set(1.35, 1.35);

    const overlaySegments = PERF.earthOverlaySegments;

    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uDayColor: { value: new THREE.Color(0x7bc4ff) },
        uNightColor: { value: new THREE.Color(0x315a89) },
        uIntensity: { value: 0.22 },
        uPower: { value: 2.7 },
        uDayMix: { value: 1 }
      },
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uDayColor;
        uniform vec3 uNightColor;
        uniform float uIntensity;
        uniform float uPower;
        uniform float uDayMix;
        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fres = pow(clamp(1.0 - max(dot(normalize(vWorldNormal), viewDir), 0.0), 0.0, 1.0), uPower);
          vec3 tint = mix(uNightColor, uDayColor, clamp(uDayMix, 0.0, 1.0));
          gl_FragColor = vec4(tint, fres * uIntensity);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const atmosphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.06, overlaySegments, Math.max(40, Math.floor(overlaySegments * 0.62))),
      atmosphereMaterial
    );
    atmosphereMesh.renderOrder = 1;

    const oceanMaterial = new THREE.MeshPhongMaterial({
      color: 0x9fcfff,
      emissive: 0x11355a,
      emissiveIntensity: 0.12,
      specular: 0xeaf6ff,
      shininess: 170,
      transparent: true,
      opacity: 0.28,
      alphaMap: derived.waterMaskTexture,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const oceanMesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.004, overlaySegments, Math.max(40, Math.floor(overlaySegments * 0.62))),
      oceanMaterial
    );
    oceanMesh.renderOrder = 2;

    const cityMaterial = new THREE.MeshBasicMaterial({
      color: 0xffbf86,
      transparent: true,
      opacity: 0,
      alphaMap: derived.cityLightsTexture,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false
    });
    const cityMesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.008, overlaySegments, Math.max(40, Math.floor(overlaySegments * 0.62))),
      cityMaterial
    );
    cityMesh.renderOrder = 3;

    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.44,
      alphaMap: derived.cloudMaskTexture,
      roughness: 0.94,
      metalness: 0,
      depthWrite: false
    });
    const cloudMesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.014, overlaySegments, Math.max(40, Math.floor(overlaySegments * 0.62))),
      cloudMaterial
    );
    cloudMesh.rotation.y = 1.3;
    cloudMesh.renderOrder = 4;

    const auroraMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uActivity: { value: 0 },
        uNorthColor: { value: new THREE.Color(0x52ffbf) },
        uSouthColor: { value: new THREE.Color(0x5d9bff) }
      },
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uActivity;
        uniform vec3 uNorthColor;
        uniform vec3 uSouthColor;
        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;
        void main() {
          vec3 n = normalize(vWorldNormal);
          float polar = smoothstep(0.42, 0.92, abs(n.y));
          float lon = atan(n.z, n.x);
          float waveA = sin(lon * 24.0 + uTime * 1.9 + n.y * 18.0);
          float waveB = sin(lon * 59.0 - uTime * 2.7 + n.y * 34.0);
          float curtain = 0.5 + 0.5 * (waveA * 0.65 + waveB * 0.35);
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float limb = pow(clamp(1.0 - abs(dot(n, viewDir)), 0.0, 1.0), 1.45);
          float alpha = polar * limb * (0.15 + curtain * 0.85) * uActivity;
          vec3 tint = mix(uSouthColor, uNorthColor, step(0.0, n.y));
          gl_FragColor = vec4(tint, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const auroraMesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.03, overlaySegments, Math.max(40, Math.floor(overlaySegments * 0.62))),
      auroraMaterial
    );
    auroraMesh.renderOrder = 5;
    auroraMesh.visible = false;

    mesh.add(atmosphereMesh, oceanMesh, cityMesh, cloudMesh, auroraMesh);
    const record = ensureBodyVisualRecord("earth", mesh);
    record.atmosphereMesh = atmosphereMesh;
    record.oceanMesh = oceanMesh;
    record.cityMesh = cityMesh;
    record.cloudMesh = cloudMesh;
    record.auroraMesh = auroraMesh;
    record.atmosphereMaterial = atmosphereMaterial;
    record.oceanMaterial = oceanMaterial;
    record.cityMaterial = cityMaterial;
    record.cloudMaterial = cloudMaterial;
    record.auroraMaterial = auroraMaterial;
  };

  const setupTerrainMaterial = (id, mesh, material, mapTex) => {
    const profile = geoProfiles[id];
    if (!profile || !mesh || !material) return;
    if (!mapTex) {
      material.roughness = profile.solid ? 0.95 : 0.9;
      material.metalness = profile.solid ? 0.01 : 0;
      applyBodyOrbitalAtmosphereVisuals(id, mesh);
      material.needsUpdate = true;
      return;
    }
    if (mobileLiteMode && (lowEndMobile || !HIGH_PRIORITY_MOBILE_RELIEF.has(id))) {
      material.roughness = profile.solid ? 0.95 : 0.9;
      material.metalness = profile.solid ? 0.01 : 0;
      applyBodyOrbitalAtmosphereVisuals(id, mesh);
      material.needsUpdate = true;
      return;
    }
    const relief = makeReliefFromTexture(mapTex, id);
    if (!relief) return;
    const radius = getEntityRadius(id);
    const reliefRatio = profile.radiusKm > 0 ? profile.reliefKm / profile.radiusKm : 0;
    const landmarkBoost = id === "mars" ? 1.34 : (profile.solid ? 1.12 : 1);
    const exaggeration = profile.solid ? 3.15 * landmarkBoost : 1.2;
    const displacementScale = THREE.MathUtils.clamp(radius * reliefRatio * exaggeration, radius * 0.001, radius * 0.14);
    const displacementBias = -displacementScale * 0.5;

    material.displacementMap = relief.texture;
    material.displacementScale = displacementScale;
    material.displacementBias = displacementBias;
    material.bumpMap = relief.texture;
    material.bumpScale = profile.solid ? displacementScale * 0.84 : displacementScale * 0.28;
    material.normalMap = relief.normalTexture || null;
    if (material.normalScale) {
      const normalScale = profile.solid ? 1.8 : 0.9;
      material.normalScale.set(normalScale, normalScale);
    }
    material.roughness = profile.solid ? 0.93 : 0.88;
    material.metalness = profile.solid ? 0.02 : 0;
    if (id === "earth") applyEarthOrbitalVisuals(mesh, material, mapTex);
    else applyBodyOrbitalAtmosphereVisuals(id, mesh);
    material.needsUpdate = true;

    terrainRuntime.set(id, {
      sampler: relief.sampler,
      solid: profile.solid,
      mesh,
      material,
      baseDisplacementScale: displacementScale,
      baseDisplacementBias: displacementBias,
      baseBumpScale: material.bumpScale,
      baseNormalScale: material.normalScale ? material.normalScale.x : 1,
      displacementScale,
      displacementBias
    });
  };

  const sampleTerrainOffset = (id, dirNorm) => {
    const terrain = terrainRuntime.get(id);
    if (!terrain?.sampler || !dirNorm) return 0;
    const { width, height, data } = terrain.sampler;
    let u = 0.5 + Math.atan2(dirNorm.z, dirNorm.x) / (Math.PI * 2);
    u = ((u % 1) + 1) % 1;
    const y = THREE.MathUtils.clamp(dirNorm.y, -1, 1);
    const v = THREE.MathUtils.clamp(0.5 - Math.asin(y) / Math.PI, 0, 1);
    const x = u * (width - 1);
    const yy = v * (height - 1);
    const x0 = Math.floor(x);
    const y0 = Math.floor(yy);
    const x1 = (x0 + 1) % width;
    const y1 = Math.min(height - 1, y0 + 1);
    const tx = x - x0;
    const ty = yy - y0;
    const i00 = y0 * width + x0;
    const i10 = y0 * width + x1;
    const i01 = y1 * width + x0;
    const i11 = y1 * width + x1;
    const h0 = data[i00] * (1 - tx) + data[i10] * tx;
    const h1 = data[i01] * (1 - tx) + data[i11] * tx;
    const h = h0 * (1 - ty) + h1 * ty;
    return h * terrain.displacementScale + terrain.displacementBias;
  };

  const getGeoFromDirection = (dirNorm) => {
    const y = THREE.MathUtils.clamp(dirNorm.y, -1, 1);
    const lat = Math.asin(y) / DEG;
    let lon = Math.atan2(dirNorm.z, dirNorm.x) / DEG;
    if (lon > 180) lon -= 360;
    if (lon < -180) lon += 360;
    return { lat, lon };
  };

  const makeLabel = (text, scale = [14, 3.6, 1], opts = {}) => {
    const { alwaysOnTop = false } = opts;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const x = c.getContext("2d");
    x.font = "bold 50px Cairo, Segoe UI";
    x.fillStyle = "rgba(226,238,255,0.96)";
    x.shadowColor = "rgba(90,145,230,0.9)";
    x.shadowBlur = 14;
    x.fillText(text, 20, 82);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: t,
      transparent: true,
      depthWrite: false,
      depthTest: !alwaysOnTop
    }));
    s.scale.set(...scale);
    return s;
  };

  const makeSaturnRingTexture = () => {
    const c = document.createElement("canvas");
    c.width = mobileLiteMode ? 512 : 1024;
    c.height = 64;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, c.width, 0);
    [[0, "rgba(220,205,160,0)"], [0.08, "rgba(225,210,170,.55)"], [0.24, "rgba(195,175,130,.95)"], [0.46, "rgba(235,220,180,.85)"], [0.74, "rgba(175,155,120,.88)"], [1, "rgba(220,205,160,0)"]]
      .forEach((v) => g.addColorStop(v[0], v[1]));
    x.fillStyle = g;
    x.fillRect(0, 0, c.width, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };

  const makeOrbitLine = (d, color, opacity, dashed = false) => {
    const pts = [];
    for (let i = 0; i <= PERF.orbitSegments; i += 1) {
      const f = (i / PERF.orbitSegments) * Math.PI * 2;
      const r = (d.a * (1 - d.e * d.e)) / (1 + d.e * Math.cos(f));
      const arg = d.w * DEG + f;
      const O = d.O * DEG;
      const inc = d.i * DEG;
      pts.push(new THREE.Vector3(
        (r * (Math.cos(O) * Math.cos(arg) - Math.sin(O) * Math.sin(arg) * Math.cos(inc))) * AU,
        (r * Math.sin(arg) * Math.sin(inc)) * AU,
        (r * (Math.sin(O) * Math.cos(arg) + Math.cos(O) * Math.sin(arg) * Math.cos(inc))) * AU
      ));
    }
    const mat = dashed
      ? new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize: 0.95, gapSize: 0.48 })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat);
    if (dashed) line.computeLineDistances();
    return line;
  };

  const setCameraState = () => {
    if (surface.active && surface.targetId) {
      const entity = entityMap.get(surface.targetId) || getEntityById(surface.targetId);
      if (eva.active) {
        ui.cameraState.textContent = entity ? `الكاميرا: EVA FPS على ${entity.name}` : "الكاميرا: EVA FPS";
      } else if (surface.traverseMode) {
        ui.cameraState.textContent = entity ? `الكاميرا: تنقل كوكبي على ${entity.name}` : "الكاميرا: تنقل كوكبي";
      } else {
        ui.cameraState.textContent = entity ? `الكاميرا: هبوط على ${entity.name}` : "الكاميرا: هبوط سطحي";
      }
      if (flightComputer.mode !== "off") {
        ui.cameraState.textContent += ` | ${FLIGHT_MODE_LABEL[flightComputer.mode]}`;
      }
      updateSpaceNavHud();
      return;
    }
    if (!followId) {
      ui.cameraState.textContent = "الكاميرا: حر";
      if (flightComputer.mode !== "off") {
        ui.cameraState.textContent += ` | ${FLIGHT_MODE_LABEL[flightComputer.mode]}`;
      }
      updateSpaceNavHud();
      return;
    }
    const entity = entityMap.get(followId);
    ui.cameraState.textContent = entity ? `الكاميرا: تتبع ${entity.name}` : "الكاميرا: حر";
    if (flightComputer.mode !== "off") {
      ui.cameraState.textContent += ` | ${FLIGHT_MODE_LABEL[flightComputer.mode]}`;
    }
    updateSpaceNavHud();
  };

  const getSpaceNavSpeedMultiplier = () => Math.pow(1.8, spaceNav.speedStep);

  const updateSpaceNavToggleUi = () => {
    ui.navToggleBtn.textContent = spaceNav.enabled ? "NAV ON" : "NAV OFF";
    ui.navToggleBtn.classList.toggle("active", spaceNav.enabled);
    ui.navToggleBtn.setAttribute("aria-pressed", spaceNav.enabled ? "true" : "false");
  };

  const setSpaceNavEnabled = (enabled) => {
    const next = !!enabled;
    if (spaceNav.enabled === next) {
      updateSpaceNavToggleUi();
      updateSpaceNavHud();
      return;
    }
    spaceNav.enabled = next;
    if (!spaceNav.enabled) {
      ["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE", "ShiftLeft", "ControlLeft"].forEach((code) => {
        setVirtualKey(code, false);
      });
      touchControls.sprintHeld = false;
      touchControls.brakeHeld = false;
      touchControls.moveDelta.set(0, 0);
      touchControls.lookDelta.set(0, 0);
    }
    updateSpaceNavToggleUi();
    updateSpaceNavHud();
  };

  const updateSpaceNavHud = () => {
    let mode = "ORBIT EASY";
    if (spaceNav.enabled) {
      mode = "FREE NAV";
      if (surface.active) mode = eva.active ? "EVA SURFACE" : (surface.traverseMode ? "SURFACE TRAVERSE" : "LANDING");
      else if (followId) mode = "TARGET LOCK";
      else if (flight.active) mode = "TRANSIT";
    } else if (surface.active) {
      mode = surface.traverseMode ? "SURFACE TRAVERSE" : (eva.active ? "EVA SURFACE" : "LANDING");
    } else if (followId) {
      mode = "TARGET LOCK";
    }
    ui.seControlTag.textContent = `SE NAV: ${mode}`;

    if (!spaceNav.enabled) {
      ui.seSpeedTag.textContent = "SE SPEED: EASY";
      return;
    }
    const speedMul = getSpaceNavSpeedMultiplier();
    const precision = speedMul >= 10 ? 1 : 2;
    ui.seSpeedTag.textContent = `SE SPEED: ${speedMul.toFixed(precision)}x`;
  };

  const stepSpaceNavSpeed = (delta) => {
    if (!spaceNav.enabled) return;
    const next = THREE.MathUtils.clamp(spaceNav.speedStep + delta, spaceNav.minStep, spaceNav.maxStep);
    if (next === spaceNav.speedStep) return;
    spaceNav.speedStep = next;
    updateSpaceNavHud();
  };

  const updateSpaceEngineNavigation = (dt) => {
    if (!spaceNav.enabled || eva.active || surface.active) return;

    const inputForward = (isKeyPressed("KeyW") || isKeyPressed("ArrowUp") ? 1 : 0) - (isKeyPressed("KeyS") || isKeyPressed("ArrowDown") ? 1 : 0);
    const inputRight = (isKeyPressed("KeyD") || isKeyPressed("ArrowRight") ? 1 : 0) - (isKeyPressed("KeyA") || isKeyPressed("ArrowLeft") ? 1 : 0);
    const inputUp = (isKeyPressed("KeyE") ? 1 : 0) - (isKeyPressed("KeyQ") ? 1 : 0);
    const rollModifier = isKeyPressed("AltLeft") || isKeyPressed("AltRight");
    const inputRoll = rollModifier ? ((isKeyPressed("KeyX") ? 1 : 0) - (isKeyPressed("KeyZ") ? 1 : 0)) : 0;
    const hasTranslation = Math.abs(inputForward) + Math.abs(inputRight) + Math.abs(inputUp) > 0;

    navForward.copy(controls.target).sub(camera.position);
    if (navForward.lengthSq() < 0.000001) navForward.set(0, 0, -1);
    else navForward.normalize();

    if (inputRoll !== 0) {
      const rollRate = 1.4 * dt * inputRoll;
      navUp.copy(camera.up);
      if (navUp.lengthSq() < 0.000001) navUp.set(0, 1, 0);
      navUp.applyAxisAngle(navForward, rollRate).normalize();
      camera.up.copy(navUp);
    }

    if (!hasTranslation) return;
    if (followId || flight.active) {
      followId = null;
      flight.active = false;
      setCameraState();
    }

    navUp.copy(camera.up);
    if (navUp.lengthSq() < 0.000001 || Math.abs(navUp.dot(navForward)) > 0.98) {
      navUp.set(0, 1, 0);
      if (Math.abs(navUp.dot(navForward)) > 0.98) navUp.set(1, 0, 0);
    }
    navRight.crossVectors(navForward, navUp).normalize();
    navUp.crossVectors(navRight, navForward).normalize();

    let velocity = spaceNav.baseVelocity * getSpaceNavSpeedMultiplier();
    const boosting = isKeyPressed("ShiftLeft") || isKeyPressed("ShiftRight") || touchControls.sprintHeld;
    const braking = isKeyPressed("ControlLeft") || isKeyPressed("ControlRight") || touchControls.brakeHeld;
    if (boosting) velocity *= spaceNav.boostMultiplier;
    if (braking) velocity *= spaceNav.brakeMultiplier;

    navMove.set(0, 0, 0)
      .addScaledVector(navForward, inputForward)
      .addScaledVector(navRight, inputRight)
      .addScaledVector(navUp, inputUp);
    if (navMove.lengthSq() < 0.000001) return;

    navMove.normalize().multiplyScalar(velocity * dt);
    camera.position.add(navMove);
    controls.target.add(navMove);
  };

  const setAudioStatus = (text, active = false) => {
    ui.audioStatus.textContent = text;
    ui.audioStatus.style.color = active ? "#b9ecff" : "#a9d0ff";
    ui.audioStatus.style.borderColor = active ? "rgba(134, 226, 255, 0.44)" : "rgba(131, 188, 255, 0.22)";
    updateQuickAudioButton();
  };

  const setWalkStatus = (text, active = false) => {
    ui.walkStatus.textContent = text;
    ui.walkStatus.style.color = active ? "#b9ecff" : "#a9d0ff";
    ui.walkStatus.style.borderColor = active ? "rgba(134, 226, 255, 0.44)" : "rgba(131, 188, 255, 0.22)";
  };

  const setSkyStatus = (text, active = false) => {
    ui.skyStatus.textContent = text;
    ui.skyStatus.style.color = active ? "#b9ecff" : "#a9d0ff";
    ui.skyStatus.style.borderColor = active ? "rgba(134, 226, 255, 0.44)" : "rgba(131, 188, 255, 0.22)";
  };

  const setTraverseStatus = (text, active = false) => {
    ui.surfaceTraverseStatus.textContent = text;
    ui.surfaceTraverseStatus.style.color = active ? "#b9ecff" : "#a9d0ff";
    ui.surfaceTraverseStatus.style.borderColor = active ? "rgba(134, 226, 255, 0.44)" : "rgba(131, 188, 255, 0.22)";
  };

  const setUiModeTag = (compact) => {
    ui.uiModeTag.textContent = compact ? "وضع مبسط" : "وضع متقدم";
    ui.uiModeTag.style.color = compact ? "#b9ecff" : "#ffd7a3";
    ui.uiModeTag.style.borderColor = compact ? "rgba(134, 226, 255, 0.44)" : "rgba(255, 206, 148, 0.36)";
  };

  const applyUiDensity = (compact, persist = false) => {
    uiState.compact = !!compact;
    document.body.classList.toggle("ui-compact", uiState.compact);
    ui.uiDensityBtn.textContent = uiState.compact ? "إظهار الأدوات المتقدمة" : "إخفاء الأدوات المتقدمة";
    setUiModeTag(uiState.compact);
    if (!persist) return;
    try {
      localStorage.setItem(UI_MODE_KEY, uiState.compact ? "compact" : "advanced");
    } catch {
      // Ignore storage restrictions in privacy contexts.
    }
  };

  const restoreUiDensity = () => {
    let saved = null;
    try {
      saved = localStorage.getItem(UI_MODE_KEY);
    } catch {
      saved = null;
    }
    applyUiDensity(saved !== "advanced");
  };

  const applyMobileStartupProfile = () => {
    if (!mobileLiteMode && !document.body.classList.contains("touch-ui")) {
      ui.uiDensityBtn.disabled = false;
      ui.uiDensityBtn.title = "";
      mobileProfile.applied = false;
      return;
    }

    applyUiDensity(true);
    ui.uiDensityBtn.disabled = true;
    ui.uiDensityBtn.title = "وضع الهاتف المبسط مفعّل تلقائياً";
    if (mobileProfile.applied) return;

    settings.showAsteroids = false;
    settings.showComets = false;
    settings.showDust = false;
    settings.showTech = false;
    settings.showLabels = false;

    if (appSettings.quality === "auto" || appSettings.quality === "high") {
      appSettings = { ...appSettings, quality: ultraLowEndMobile ? "low" : "balanced" };
    }
    applyRendererQualityFromSettings();
    if (landingRealismMode !== "assist") {
      landingRealismMode = "assist";
      ui.landingRealismSelect.value = "assist";
    }

    ui.showAsteroids.checked = false;
    ui.showComets.checked = false;
    ui.showDust.checked = false;
    ui.showTech.checked = false;
    ui.showLabels.checked = false;

    mobileProfile.applied = true;
  };

  const setEphemerisPreset = (key, persist = false) => {
    const preset = ephemeris.setPreset(key);
    if (ui.orbitPrecisionSelect.value !== preset.key) ui.orbitPrecisionSelect.value = preset.key;
    ui.orbitPrecisionTag.textContent = `Ephemeris: ${preset.label}`;
    ui.orbitPrecisionTag.style.borderColor = "rgba(131, 188, 255, 0.22)";
    ui.orbitPrecisionTag.style.color = "#a9d0ff";
    if (!persist) return;
    try {
      localStorage.setItem(ORBIT_EPH_KEY, preset.key);
    } catch {
      // Ignore storage restrictions in privacy contexts.
    }
  };

  const restoreEphemerisPreset = () => {
    let saved = null;
    try {
      saved = localStorage.getItem(ORBIT_EPH_KEY);
    } catch {
      saved = null;
    }
    const mobileDefault = lowEndMobile ? EPHEMERIS_PRESETS.fast.key : EPHEMERIS_PRESETS.precise.key;
    let safeSaved = saved;
    if (lowEndMobile) {
      safeSaved = EPHEMERIS_PRESETS.fast.key;
    } else if (mobileLiteMode && safeSaved === EPHEMERIS_PRESETS.research.key) {
      safeSaved = EPHEMERIS_PRESETS.precise.key;
    }
    setEphemerisPreset(safeSaved || mobileDefault);
  };

  const updateTimeScaleTag = () => {
    const delta = simClock.constants.TT_MINUS_UTC_SEC.toFixed(3);
    ui.timeScaleTag.textContent = `Time: TT-UTC +${delta}s`;
    ui.timeScaleTag.style.borderColor = "rgba(131, 188, 255, 0.22)";
    ui.timeScaleTag.style.color = "#a9d0ff";
  };

  const setSimTimeNow = () => {
    simClock.setNow();
    updateTimeScaleTag();
  };

  const setSimTimeJ2000 = () => {
    simClock.setDaysSinceJ2000Tt(0);
    updateTimeScaleTag();
  };

  const setValidationStatus = (text, active = false) => {
    ui.validationStatus.textContent = text;
    ui.validationStatus.style.color = active ? "#b9ecff" : "#a9d0ff";
    ui.validationStatus.style.borderColor = active ? "rgba(134, 226, 255, 0.44)" : "rgba(131, 188, 255, 0.22)";
  };

  const applyValidationCheckpoint = (key, shouldFocus = true) => {
    const cp = validationCheckpoints[key];
    if (!cp) {
      setValidationStatus("Validation: INVALID");
      return;
    }
    simClock.setUtcJd(toJulianDateUtc(cp.utcIso));
    updateTimeScaleTag();
    setValidationStatus(`Validation: ${cp.label}`, true);
    if (!shouldFocus) return;
    const targetId = cp.focusId || "sun";
    if (surface.active) exitSurfaceMode();
    explorerTargetId = targetId;
    setFocusValue(targetId);
    followId = targetId;
    setCameraState();
    beginExploreFlight(targetId);
    selected = getEntityById(targetId) || selected;
    if (selected) updateInfo(selected);
    updateExplorerInfo(targetId);
    renderScienceSources(targetId);
  };

  const updateFlightComputerUi = () => {
    const fcEntity = getEntityById(flightComputer.targetId || explorerTargetId || "sun");
    ui.fcModeTag.textContent = `${FLIGHT_MODE_LABEL[flightComputer.mode] || FLIGHT_MODE_LABEL.off} • ${fcEntity?.name || "—"}`;
    ui.fcModeTag.style.borderColor = flightComputer.mode === "off"
      ? "rgba(149, 210, 255, 0.3)"
      : "rgba(164, 226, 255, 0.46)";
    ui.fcModeTag.style.color = flightComputer.mode === "off" ? "#bfe3ff" : "#e2f5ff";

    const modeButtons = [
      [ui.fcTargetBtn, "target"],
      [ui.fcProgradeBtn, "prograde"],
      [ui.fcRetrogradeBtn, "retrograde"],
      [ui.fcNormalBtn, "normal"]
    ];
    modeButtons.forEach(([btn, mode]) => {
      btn.classList.toggle("active", flightComputer.mode === mode);
      btn.setAttribute("aria-pressed", flightComputer.mode === mode ? "true" : "false");
    });
  };

  const setFlightComputerMode = (mode, targetId = null) => {
    const allowed = new Set(["off", "target", "prograde", "retrograde", "normal"]);
    const nextMode = allowed.has(mode) ? mode : "off";
    let focusId = targetId || explorerTargetId || followId || "earth";
    if (nextMode !== "target" && focusId === "sun") focusId = "earth";
    if (nextMode === flightComputer.mode && flightComputer.targetId === focusId) {
      flightComputer.mode = "off";
    } else {
      flightComputer.mode = nextMode;
      flightComputer.targetId = focusId;
    }
    if (flightComputer.mode !== "off") {
      followId = focusId;
      setFocusValue(focusId);
    }
    setCameraState();
    updateFlightComputerUi();
  };

  const updateQuickAudioButton = () => {
    const on = ui.audioEnable.checked && audio.enabled;
    ui.quickAudioBtn.textContent = on ? "الصوت: ON" : "الصوت: OFF";
    ui.quickAudioBtn.classList.toggle("active", on);
  };

  const updateQuickLandButton = () => {
    const onSurface = surface.active;
    ui.quickLandBtn.textContent = onSurface ? "خروج مداري" : "هبوط";
    ui.quickLandBtn.classList.toggle("active", onSurface);
  };

  const updateImmersiveControlState = () => {
    const blocked = immersiveRestrictedMobile;
    ui.immersiveBtn.disabled = blocked;
    if (blocked) {
      ui.immersiveBtn.classList.remove("immersive-on");
      ui.immersiveBtn.textContent = "VR غير متاح";
      ui.immersiveBtn.title = "وضع الغمر مُعطّل على هذا الهاتف لتحسين الثبات";
    } else if (!immersion.enabled) {
      ui.immersiveBtn.textContent = "وضع الغمر VR";
      ui.immersiveBtn.title = "";
    }
    ui.onScreenControls?.querySelectorAll('[data-action="immersive"]').forEach((btn) => {
      btn.classList.toggle("active", !blocked && immersion.enabled);
      btn.setAttribute("aria-pressed", !blocked && immersion.enabled ? "true" : "false");
      if ("disabled" in btn) btn.disabled = blocked;
    });
  };

  const pickEntityAtClient = (clientX, clientY) => {
    const rect = ui.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(clickable, false)[0];
    return hit?.object?.userData?.entity || null;
  };

  const setSelectedEntity = (entity) => {
    if (!entity?.id) return;
    selected = entity;
    explorerTargetId = entity.id;
    if (flightComputer.mode !== "off") {
      flightComputer.targetId = entity.id;
      updateFlightComputerUi();
    }
    updateInfo(entity);
    updateExplorerInfo(entity.id);
    renderScienceSources(entity.id);
    setFocusValue(entity.id);
  };

  const getMouseTargetId = () => selected?.id || ui.focusSelect.value || explorerTargetId || followId || "sun";

  const closeMouseMenu = (options = {}) => {
    if (!mouseContext.open) return;
    ui.mouseMenu.classList.remove("open");
    if (options.suppressClick) mouseContext.suppressClick = true;
    mouseContext.open = false;
  };

  const updateMouseMenuLabels = (targetId) => {
    const entity = getEntityById(targetId);
    ui.mouseMenuTitle.textContent = `هدف الفأرة: ${entity?.name || "الشمس"}`;
    const landBtn = ui.mouseMenu.querySelector('[data-menu-action="land"]');
    const traverseBtn = ui.mouseMenu.querySelector('[data-menu-action="traverse"]');
    const audioBtn = ui.mouseMenu.querySelector('[data-menu-action="audio"]');
    if (landBtn) {
      const canLand = isSurfaceLandable(targetId);
      if (surface.active) {
        landBtn.textContent = "خروج مداري";
        landBtn.disabled = false;
      } else {
        landBtn.textContent = canLand ? "هبوط على الهدف" : "هبوط غير متاح";
        landBtn.disabled = !canLand;
      }
    }
    if (audioBtn) {
      const on = ui.audioEnable.checked && audio.enabled;
      audioBtn.textContent = on ? "إيقاف الصوت" : "تشغيل الصوت";
    }
    if (traverseBtn) {
      const canTraverseTarget = canUseEva(targetId);
      if (!surface.active) {
        traverseBtn.textContent = canTraverseTarget ? "تنقل كوكبي (بعد الهبوط)" : "تنقل كوكبي غير متاح";
        traverseBtn.disabled = !canTraverseTarget;
      } else if (!canUseEva(surface.targetId)) {
        traverseBtn.textContent = "تنقل كوكبي غير متاح";
        traverseBtn.disabled = true;
      } else {
        traverseBtn.textContent = surface.traverseMode ? "إيقاف التنقل الكوكبي" : "تشغيل التنقل الكوكبي";
        traverseBtn.disabled = false;
      }
    }
  };

  const openMouseMenu = (clientX, clientY, targetId) => {
    const nextTarget = targetId || getMouseTargetId();
    mouseContext.targetId = nextTarget;
    mouseContext.suppressClick = false;
    updateMouseMenuLabels(nextTarget);

    ui.mouseMenu.classList.add("open");
    const rootRect = ui.viewportRoot.getBoundingClientRect();
    const menuRect = ui.mouseMenu.getBoundingClientRect();
    const pad = 10;
    const localX = clientX - rootRect.left;
    const localY = clientY - rootRect.top;
    const x = Math.max(pad, Math.min(localX + 8, rootRect.width - menuRect.width - pad));
    const y = Math.max(pad, Math.min(localY + 8, rootRect.height - menuRect.height - pad));
    ui.mouseMenu.style.left = `${x}px`;
    ui.mouseMenu.style.top = `${y}px`;
    mouseContext.open = true;
  };

  const applyMouseMenuAction = (action) => {
    const targetId = mouseContext.targetId || getMouseTargetId();
    if (!action) return;
    if (action === "explore") {
      beginExploreFlight(targetId);
    } else if (action === "follow") {
      if (surface.active) exitSurfaceMode();
      followId = targetId;
      explorerTargetId = targetId;
      setFocusValue(targetId);
      if (flightComputer.mode !== "off") {
        flightComputer.targetId = explorerTargetId;
        updateFlightComputerUi();
      }
      setCameraState();
      updateExplorerInfo(targetId);
      renderScienceSources(targetId);
      selected = getEntityById(targetId) || selected;
      if (selected) updateInfo(selected);
    } else if (action === "land") {
      if (surface.active) {
        exitSurfaceMode();
        if (explorerTargetId) beginExploreFlight(explorerTargetId);
      } else if (isSurfaceLandable(targetId)) {
        setFocusValue(targetId);
        enterSurfaceMode(targetId);
        if (audio.enabled) triggerLandingPulse(0.8);
      }
    } else if (action === "traverse") {
      if (surface.active) {
        setSurfaceTraverseMode(!surface.traverseMode);
      } else if (isSurfaceLandable(targetId) && canUseEva(targetId)) {
        setFocusValue(targetId);
        enterSurfaceMode(targetId);
        setSurfaceTraverseMode(true);
      }
    } else if (action === "fc_target") {
      setFlightComputerMode("target", targetId);
    } else if (action === "fc_prograde") {
      setFlightComputerMode("prograde", targetId);
    } else if (action === "fc_retrograde") {
      setFlightComputerMode("retrograde", targetId);
    } else if (action === "fc_normal") {
      setFlightComputerMode("normal", targetId);
    } else if (action === "fc_off") {
      setFlightComputerMode("off");
    } else if (action === "immersive") {
      setImmersiveMode(!immersion.enabled).catch(() => {
        // Ignore immersive toggle promise errors.
      });
    } else if (action === "audio") {
      const next = !ui.audioEnable.checked;
      if (next && ui.audioMode.value === "off") ui.audioMode.value = "realism";
      ui.audioEnable.checked = next;
      setAudioEnabled(next);
      persistGlobalAudioSettings();
      updateQuickAudioButton();
    } else if (action === "close") {
      // no-op
    }
    closeMouseMenu();
  };

  const setFocusValue = (id) => {
    const next = id || "sun";
    if (ui.focusSelect.value !== next) ui.focusSelect.value = next;
    if (ui.quickFocusSelect.value !== next) ui.quickFocusSelect.value = next;
  };

  const setVirtualKey = (code, pressed) => {
    virtualKeys[code] = pressed;
  };

  const isKeyPressed = (code) => !!(keys[code] || virtualKeys[code]);

  const applyHandedness = (mode = "right") => {
    controlPrefs.handedness = mode === "left" ? "left" : "right";
    document.body.classList.toggle("left-handed", controlPrefs.handedness === "left");
    ui.handednessSelect.value = controlPrefs.handedness;
  };

  const updateTouchSensitivityLabel = () => {
    ui.touchSensitivityValue.textContent = `${controlPrefs.touchSensitivity.toFixed(2)}x`;
    ui.touchSensitivityRange.value = String(controlPrefs.touchSensitivity);
    ui.touchSensitivityRangeVr.value = String(controlPrefs.touchSensitivity);
  };

  const bindPad = (pad, stateKey) => {
    if (!pad) return;
    const baseKey = stateKey.endsWith("Active") ? stateKey.slice(0, -6) : stateKey;
    const startKey = `${baseKey}Start`;
    const deltaKey = `${baseKey}Delta`;
    if (!touchControls[startKey] || !touchControls[deltaKey]) return;
    const start = (ev) => {
      const point = ev.touches ? ev.touches[0] : ev;
      touchControls[stateKey] = true;
      touchControls[startKey].set(point.clientX, point.clientY);
      touchControls[deltaKey].set(0, 0);
      if (typeof ev.pointerId === "number" && pad.setPointerCapture) {
        try {
          pad.setPointerCapture(ev.pointerId);
        } catch {
          // Ignore unsupported pointer capture environments.
        }
      }
    };
    const move = (ev) => {
      if (!touchControls[stateKey]) return;
      const point = ev.touches ? ev.touches[0] : ev;
      touchControls[deltaKey].set(
        point.clientX - touchControls[startKey].x,
        point.clientY - touchControls[startKey].y
      );
      ev.preventDefault();
    };
    const end = () => {
      touchControls[stateKey] = false;
      touchControls[deltaKey].set(0, 0);
    };
    pad.addEventListener("pointerdown", start);
    pad.addEventListener("pointermove", move);
    pad.addEventListener("pointerup", end);
    pad.addEventListener("pointerleave", end);
    pad.addEventListener("touchstart", start, { passive: false });
    pad.addEventListener("touchmove", move, { passive: false });
    pad.addEventListener("touchend", end);
    pad.addEventListener("touchcancel", end);
  };

  const updateVirtualControls = () => {
    const move = touchControls.moveDelta;
    const look = touchControls.lookDelta;
    const moveX = THREE.MathUtils.clamp(move.x / 48, -1, 1);
    const moveY = THREE.MathUtils.clamp(move.y / 48, -1, 1);
    const lookX = THREE.MathUtils.clamp(look.x / 40, -1, 1);
    const lookY = THREE.MathUtils.clamp(look.y / 40, -1, 1);

    setVirtualKey("KeyW", moveY < -0.2);
    setVirtualKey("KeyS", moveY > 0.2);
    setVirtualKey("KeyA", moveX < -0.2);
    setVirtualKey("KeyD", moveX > 0.2);
    setVirtualKey("ShiftLeft", touchControls.sprintHeld);
    setVirtualKey("ControlLeft", touchControls.brakeHeld);
    if (touchControls.jumpHeld) {
      eva.jumpQueued = true;
    }

    if (touchControls.lookActive) {
      const scale = 0.0024 * controlPrefs.touchSensitivity;
      if (eva.active) {
        eva.yaw -= lookX * scale * 18;
        eva.pitch = THREE.MathUtils.clamp(eva.pitch - lookY * scale * 18, -1.45, 1.45);
      } else {
        controls.rotateLeft(lookX * scale * 8);
        controls.rotateUp(lookY * scale * 8);
      }
    }
  };

  const setImmersiveMode = async (enabled, options = {}) => {
    if (enabled && immersiveRestrictedMobile && options.force !== true) {
      immersion.enabled = false;
      document.body.classList.remove("vr-mode");
      controls.dampingFactor = 0.06;
      ui.vrFx.style.opacity = "0";
      ui.vrReticle.style.opacity = "0";
      ui.vrTelemetry.style.opacity = "0";
      updateImmersiveControlState();
      setValidationStatus("IMMERSIVE: DISABLED (MOBILE SAFE)", true);
      return false;
    }
    const allowFullscreen = options.allowFullscreen !== false;
    immersion.enabled = enabled;
    document.body.classList.toggle("vr-mode", enabled);
    updateImmersiveControlState();
    if (enabled) {
      controls.dampingFactor = 0.12;
      ui.immersiveBtn.classList.add("immersive-on");
      ui.immersiveBtn.textContent = "إيقاف الغمر";
      ui.vrReticle.style.opacity = "0.92";
      ui.vrTelemetry.style.opacity = surface.active ? "1" : "0";
      if (allowFullscreen && ui.viewportRoot.requestFullscreen && !document.fullscreenElement) {
        try {
          await ui.viewportRoot.requestFullscreen();
        } catch {
          // Ignore fullscreen rejections to keep mode functional.
        }
      }
    } else {
      controls.dampingFactor = 0.06;
      ui.immersiveBtn.classList.remove("immersive-on");
      ui.immersiveBtn.textContent = "وضع الغمر VR";
      ui.vrFx.style.opacity = "0";
      ui.vrReticle.style.opacity = "0";
      ui.vrTelemetry.style.opacity = "0";
      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch {
          // Ignore fullscreen exit failures.
        }
      }
      immersion.targetFov = 54;
      camera.fov += (54 - camera.fov) * 0.35;
      camera.updateProjectionMatrix();
    }
  };

  const updateInfo = (e) => {
    if (!e) {
      ui.objectInfo.textContent = "اختر جرمًا بالنقر عليه لعرض البيانات العلمية.";
      return;
    }
    const profile = climateProfiles[e.id];
    if (!profile) {
      ui.objectInfo.innerHTML = `<strong>${e.name}</strong><br />النوع: ${e.type}`;
      return;
    }
    const climate = getCurrentClimate(e.id);
    const geo = geoProfiles[e.id];
    const terrainText = geo
      ? `${geo.solid ? "Solid" : "Gas"} | dH~${geo.reliefKm.toFixed(1)} km | g=${geo.gravity.toFixed(2)} m/s2`
      : "N/A";
    ui.objectInfo.innerHTML =
      `<strong>${e.name}</strong><br />` +
      `Terrain model: ${terrainText}<br />` +
      `النوع: ${e.type}<br />` +
      `المناخ الأساسي: ${profile.kind}<br />` +
      `الحرارة: ${climate.tempC.toFixed(1)}°C<br />` +
      `الضغط: ${climate.pressureBar.toFixed(3)} bar<br />` +
      `الرياح: ${climate.windKmh.toFixed(0)} كم/س`;
  };

  const renderScienceSources = (id = explorerTargetId) => {
    const entity = getEntityById(id);
    const items = getScienceSourcesForId(id);
    const rows = items
      .map((item) => `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.label}</a>`)
      .join("<br />");
    ui.scienceSources.innerHTML =
      `<strong>المصادر العلمية</strong><br />` +
      `الهدف: ${entity?.name || "الشمس"}<br />` +
      `المراجع:<br />${rows}`;
  };

  const getEntityById = (id) => {
    if (id === "sun") return { id: "sun", name: "الشمس", type: "نجم" };
    const b = bodies.find((x) => x.id === id);
    if (b) return { id: b.id, name: b.name, type: "كوكب" };
    const m = moons.find((x) => x.id === id);
    if (m) return { id: m.id, name: m.name, type: "قمر" };
    const c = comets.find((x) => x.id === id);
    if (c) return { id: c.id, name: c.name, type: "مذنب" };
    return null;
  };

  const getEntityRadius = (id) => {
    if (id === "sun") return 5.2;
    const b = bodies.find((x) => x.id === id);
    if (b) return b.r;
    const m = moons.find((x) => x.id === id);
    if (m) return m.r;
    const c = comets.find((x) => x.id === id);
    if (c) return Math.max(0.32, c.r);
    return 1;
  };

  const getMeshWorldPosition = (mesh, out = new THREE.Vector3()) => {
    if (!mesh) return out.set(0, 0, 0);
    return mesh.getWorldPosition(out);
  };

  const getEntityPosition = (id) => {
    if (id === "sun") return getMeshWorldPosition(sunMesh);
    const b = bodyMap.get(id);
    if (b) return getMeshWorldPosition(b.mesh);
    const m = moonMap.get(id);
    if (m) return getMeshWorldPosition(m.mesh);
    const c = comets.find((x) => x.id === id);
    if (c?.mesh) return getMeshWorldPosition(c.mesh);
    return new THREE.Vector3();
  };

  const getEntityMeshById = (id) => {
    if (id === "sun") return sunMesh;
    const b = bodyMap.get(id);
    if (b) return b.mesh;
    const m = moonMap.get(id);
    if (m) return m.mesh;
    const c = comets.find((x) => x.id === id);
    if (c?.mesh) return c.mesh;
    return null;
  };

  const isKnownTargetId = (id) => (
    id === "sun"
    || bodyDefById.has(id)
    || moonDefById.has(id)
    || cometDefById.has(id)
  );

  const normalizeExternalOrbitCommand = (payload) => {
    if (!payload || typeof payload !== "object") return null;
    const action = typeof payload.action === "string" ? payload.action.trim().toLowerCase() : "";
    const targetId = typeof payload.targetId === "string" ? payload.targetId.trim().toLowerCase() : "";
    const issuedAt = Number(payload.issuedAt);
    if (!["focus", "follow", "land", "free", "traverse_on", "traverse_off"].includes(action)) return null;
    if (!Number.isFinite(issuedAt) || issuedAt <= 0) return null;
    return { action, targetId, issuedAt };
  };

  const applyExternalOrbitCommand = (cmd) => {
    if (!cmd) return false;
    const requiresTarget = ["focus", "follow", "land", "traverse_on"].includes(cmd.action);
    if (requiresTarget && !isKnownTargetId(cmd.targetId)) return false;

    if (cmd.action === "free") {
      if (surface.active) exitSurfaceMode();
      followId = null;
      flight.active = false;
      setFlightComputerMode("off");
      setCameraState();
      updateExplorerInfo(explorerTargetId || "sun");
      return true;
    }

    if (cmd.action === "focus") {
      if (surface.active) exitSurfaceMode();
      setFocusValue(cmd.targetId);
      beginExploreFlight(cmd.targetId);
      return true;
    }

    if (cmd.action === "follow") {
      if (surface.active) exitSurfaceMode();
      setFocusValue(cmd.targetId);
      followId = cmd.targetId;
      explorerTargetId = cmd.targetId;
      flight.active = false;
      if (flightComputer.mode !== "off") {
        flightComputer.targetId = cmd.targetId;
        updateFlightComputerUi();
      }
      setCameraState();
      updateExplorerInfo(cmd.targetId);
      return true;
    }

    if (cmd.action === "land") {
      if (!isSurfaceLandable(cmd.targetId)) return false;
      setFocusValue(cmd.targetId);
      enterSurfaceMode(cmd.targetId);
      return true;
    }

    if (cmd.action === "traverse_on") {
      if (!isSurfaceLandable(cmd.targetId)) return false;
      if (!surface.active || surface.targetId !== cmd.targetId) enterSurfaceMode(cmd.targetId);
      if (surface.active && surface.targetId === cmd.targetId) setSurfaceTraverseMode(true);
      return true;
    }

    if (cmd.action === "traverse_off") {
      if (surface.active && surface.traverseMode) setSurfaceTraverseMode(false);
      return true;
    }
    return false;
  };

  const consumeOrbitCommandRaw = (raw) => {
    if (!raw) return false;
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return false;
    }
    const cmd = normalizeExternalOrbitCommand(parsed);
    if (!cmd || cmd.issuedAt <= lastOrbitCommandIssuedAt) return false;
    const applied = applyExternalOrbitCommand(cmd);
    if (applied) lastOrbitCommandIssuedAt = cmd.issuedAt;
    return applied;
  };

  const consumeOrbitCommandFromStorage = () => {
    try {
      const raw = localStorage.getItem(ORBIT_COMMAND_KEY);
      consumeOrbitCommandRaw(raw);
    } catch {
      // Ignore storage restrictions.
    }
  };

  const onOrbitCommandStorage = (event) => {
    if (!event || event.key !== ORBIT_COMMAND_KEY) return;
    if (!event.newValue) return;
    consumeOrbitCommandRaw(event.newValue);
  };

  const isSurfaceLandable = (id) => bodyMap.has(id) || moonMap.has(id);
  const getEnvMode = (id) => envModeById[id] || "rocky_airless";
  const getAcousticClass = (id) => acousticClassById[id] || "vacuum";

  const getAtmosphereTint = (kind) => {
    if (kind === "habitable") return 0x7fb8ff;
    if (kind === "acidic") return 0xf4c385;
    if (kind === "dusty") return 0xe3b38a;
    if (kind === "gas") return 0xd7c4a5;
    if (kind === "ice" || kind === "ice-ocean" || kind === "ice-rock") return 0xaed6ff;
    if (kind === "methane") return 0xb9d4ff;
    if (kind === "nitrogen") return 0xc7dfff;
    if (kind === "volcanic") return 0xffa17a;
    return 0x9dc6ff;
  };

  const clearSurfaceAtmosphere = () => {
    if (!surface.atmosphere) return;
    const { mesh, host } = surface.atmosphere;
    if (host && mesh) host.remove(mesh);
    if (mesh?.geometry) mesh.geometry.dispose();
    if (mesh?.material) mesh.material.dispose();
    surface.atmosphere = null;
  };

  const clearSurfaceEnvironment = () => {
    if (surface.skyDome) {
      const { mesh, host } = surface.skyDome;
      if (host && mesh) host.remove(mesh);
      if (mesh?.geometry) mesh.geometry.dispose();
      if (mesh?.material) mesh.material.dispose();
      surface.skyDome = null;
    }
    if (surface.weather) {
      const { points } = surface.weather;
      if (points && points.parent) points.parent.remove(points);
      points?.geometry?.dispose();
      points?.material?.dispose();
      surface.weather = null;
    }
    surface.blockSpaceView = false;
    surface.mode = "orbital";
    surface.stormFlash = 0;
    surface.crackleLock = 0;
    surface.terrainSampler = null;
    surface.cycloneTime = 0;
    surface.landingSequence = null;
    surface.skyAssist = 0;
    surface.entryStabilizer = 0;
  };

  const getSkyPreset = (mode) => {
    if (mode === "rocky_sky") return { color: 0x7da9d8, opacity: 0.52, blockStars: true };
    if (mode === "rocky_dense") return { color: 0xd5a56e, opacity: 0.74, blockStars: true };
    if (mode === "titan_haze") return { color: 0xd3a25d, opacity: 0.86, blockStars: true };
    if (mode === "rocky_dust") return { color: 0xc7956f, opacity: 0.22, blockStars: false };
    if (mode === "gas_storm") return { color: 0xc8b18f, opacity: 0.82, blockStars: true };
    if (mode === "gas_ice_storm") return { color: 0x8eb7d9, opacity: 0.78, blockStars: true };
    if (mode === "dwarf_ice") return { color: 0x9fc7e6, opacity: 0.4, blockStars: false };
    return { color: 0x0c1323, opacity: 0.08, blockStars: false };
  };

  const createSurfaceWeather = (mode, radius) => {
    if (mode !== "gas_storm" && mode !== "gas_ice_storm" && mode !== "dwarf_ice" && mode !== "rocky_dust" && mode !== "titan_haze") return;
    if (lowEndMobile || adaptiveQuality.weatherScale <= 0.01) return;
    const baseCount = mode === "dwarf_ice"
      ? 900
      : (mode === "gas_storm" || mode === "gas_ice_storm" ? 2200 : (mode === "titan_haze" ? 1800 : 1400));
    const count = mobileLiteMode ? Math.max(180, Math.round(baseCount * 0.32)) : baseCount;
    const bounds = mode === "dwarf_ice" ? 26 : (mode === "titan_haze" ? 28 : 22);
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const angle = new Float32Array(count);
    const radial = new Float32Array(count);
    const altitude = new Float32Array(count);
    const spin = new Float32Array(count);
    const drift = new Float32Array(count);
    const gasMode = mode === "gas_storm" || mode === "gas_ice_storm";
    for (let i = 0; i < count; i += 1) {
      const x = (Math.random() * 2 - 1) * bounds;
      const y = (Math.random() * 2 - 1) * bounds;
      const z = -2 - Math.random() * bounds * 2.2;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      if (gasMode) {
        const a = Math.random() * Math.PI * 2;
        const r = 1.4 + (Math.random() ** 0.8) * bounds * 0.9;
        angle[i] = a;
        radial[i] = r;
        altitude[i] = (Math.random() * 2 - 1) * bounds * 0.85;
        spin[i] = 0.85 + Math.random() * 1.65;
        drift[i] = 1.8 + Math.random() * 3.2;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = altitude[i];
        pos[i * 3 + 2] = -2 - Math.random() * bounds * 2.2;
      } else if (mode === "dwarf_ice") {
        vel[i * 3] = (Math.random() * 2 - 1) * 0.22;
        vel[i * 3 + 1] = -0.6 - Math.random() * 0.9;
        vel[i * 3 + 2] = 0.6 + Math.random() * 0.8;
      } else if (mode === "titan_haze") {
        vel[i * 3] = 0.22 + Math.random() * 0.55;
        vel[i * 3 + 1] = (Math.random() * 2 - 1) * 0.12;
        vel[i * 3 + 2] = 0.46 + Math.random() * 0.5;
      } else if (mode === "rocky_dust") {
        vel[i * 3] = 0.5 + Math.random() * 1.2;
        vel[i * 3 + 1] = (Math.random() * 2 - 1) * 0.4;
        vel[i * 3 + 2] = 1.0 + Math.random() * 1.3;
      } else {
        vel[i * 3] = 1.4 + Math.random() * 2.1;
        vel[i * 3 + 1] = (Math.random() * 2 - 1) * 0.7;
        vel[i * 3 + 2] = 2.1 + Math.random() * 2.6;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const color = mode === "dwarf_ice"
      ? 0xdcf0ff
      : (mode === "gas_ice_storm" ? 0xbdd8ee : (mode === "titan_haze" ? 0xe2bf86 : 0xe0ceb2));
    const m = new THREE.PointsMaterial({
      color,
      size: mode === "dwarf_ice"
        ? 0.1 + radius * 0.03
        : (gasMode ? 0.11 + radius * 0.03 : (mode === "titan_haze" ? 0.16 + radius * 0.04 : 0.14 + radius * 0.035)),
      transparent: true,
      opacity: mode === "dwarf_ice" ? 0.54 : (gasMode ? 0.42 : (mode === "titan_haze" ? 0.48 : 0.34)),
      depthWrite: false
    });
    const points = new THREE.Points(g, m);
    camera.add(points);
    surface.weather = {
      points,
      mode,
      count,
      bounds,
      positions: pos,
      velocities: vel,
      angle,
      radial,
      altitude,
      spin,
      drift,
      gasMode,
      baseSize: m.size,
      baseOpacity: m.opacity
    };
  };

  const restoreSurfaceTargetLod = () => {
    if (!surface.lodMesh || !surface.lodOriginalGeometry) return;
    const current = surface.lodMesh.geometry;
    if (current && current !== surface.lodOriginalGeometry) current.dispose();
    surface.lodMesh.geometry = surface.lodOriginalGeometry;
    surface.lodMesh = null;
    surface.lodOriginalGeometry = null;
  };

  const applySurfaceTargetLod = (id) => {
    restoreSurfaceTargetLod();
    const mesh = getEntityMeshById(id);
    const geo = geoProfiles[id];
    if (!mesh || !geo?.solid || !mesh.geometry) return;
    const radius = getEntityRadius(id);
    const terrainPreset = getTerrainDetailPreset();
    const baseSeg = PERF.targetLodBase;
    const boost = terrainPreset.lodBoost ? PERF.targetLodBoost : 0;
    const reliefFactor = terrainPreset.lodBoost ? 3.4 : 2.2;
    const segCap = terrainPreset.lodBoost ? PERF.targetLodCapUltra : PERF.targetLodCapBalanced;
    const segW = THREE.MathUtils.clamp(baseSeg + boost + Math.round(geo.reliefKm * reliefFactor), PERF.targetLodBase, segCap);
    const segH = Math.max(Math.floor(PERF.targetLodBase * 0.55), Math.floor(segW * 0.55));
    const currSeg = mesh.geometry.parameters?.widthSegments || 0;
    if (currSeg >= segW) return;
    surface.lodMesh = mesh;
    surface.lodOriginalGeometry = mesh.geometry;
    mesh.geometry = new THREE.SphereGeometry(radius, segW, segH);
  };

  const createSurfaceEnvironment = (id) => {
    clearSurfaceEnvironment();
    const host = getEntityMeshById(id);
    if (!host) return;
    const mode = getEnvMode(id);
    const radius = getEntityRadius(id);
    const preset = getSkyPreset(mode);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 58, PERF.skyDomeSegW, PERF.skyDomeSegH),
      new THREE.MeshBasicMaterial({
        color: preset.color,
        transparent: true,
        opacity: preset.opacity,
        side: THREE.BackSide,
        depthWrite: false
      })
    );
    host.add(dome);
    surface.skyDome = { mesh: dome, host };
    surface.mode = mode;
    surface.blockSpaceView = preset.blockStars;
    createSurfaceWeather(mode, radius);
  };

  const updateSurfaceWeather = (dt) => {
    if (!surface.weather || !surface.active) return;
    if (adaptiveQuality.weatherScale <= 0.01) return;
    const weatherDt = dt * adaptiveQuality.weatherScale;
    const {
      points,
      positions,
      velocities,
      count,
      bounds,
      mode,
      gasMode,
      angle,
      radial,
      altitude,
      spin,
      drift
    } = surface.weather;
    const wind = Math.max(0.1, getCurrentClimate(surface.targetId).windKmh / 220);
    if (gasMode) {
      surface.cycloneTime += weatherDt;
      for (let i = 0; i < count; i += 1) {
        const ix = i * 3;
        const swirl = (0.34 + spin[i] * 0.27 + (bounds - radial[i]) * 0.012) * wind;
        angle[i] += weatherDt * swirl;
        radial[i] += Math.sin(surface.cycloneTime * 0.9 + i * 0.013) * weatherDt * 0.36 * spin[i];
        radial[i] = THREE.MathUtils.clamp(radial[i], 1.0, bounds * 0.98);
        const shear = Math.sin(surface.cycloneTime * 0.5 + altitude[i] * 0.13) * 0.28;
        positions[ix] = Math.cos(angle[i]) * radial[i] + shear;
        positions[ix + 1] = altitude[i] + Math.sin(surface.cycloneTime * 0.8 + i * 0.019) * 0.46;
        positions[ix + 2] += drift[i] * weatherDt * wind;
        if (positions[ix + 2] > 3.5) positions[ix + 2] = -bounds * 2.2;
      }
      const baseOpacity = surface.weather.baseOpacity ?? (mode === "gas_ice_storm" ? 0.36 : 0.4);
      const baseSize = surface.weather.baseSize ?? points.material.size;
      points.material.opacity = THREE.MathUtils.clamp(baseOpacity + Math.sin(surface.cycloneTime * 0.9) * 0.08, 0.22, 0.62);
      points.material.size = THREE.MathUtils.clamp(baseSize + Math.sin(surface.cycloneTime * 0.7) * 0.006, 0.05, 0.5);
    } else {
      for (let i = 0; i < count; i += 1) {
        const ix = i * 3;
        positions[ix] += velocities[ix] * weatherDt * wind;
        positions[ix + 1] += velocities[ix + 1] * weatherDt * wind;
        positions[ix + 2] += velocities[ix + 2] * weatherDt * wind;
        if (positions[ix] > bounds) positions[ix] = -bounds;
        if (positions[ix] < -bounds) positions[ix] = bounds;
        if (positions[ix + 1] > bounds) positions[ix + 1] = -bounds;
        if (positions[ix + 1] < -bounds) positions[ix + 1] = bounds;
        if (positions[ix + 2] > 2) positions[ix + 2] = -bounds * 2;
        if (positions[ix + 2] < -bounds * 2.1) positions[ix + 2] = 2;
      }
    }
    points.geometry.attributes.position.needsUpdate = true;

    if ((mode === "gas_storm" || mode === "gas_ice_storm") && Math.random() < weatherDt * 0.55) {
      surface.stormFlash = 0.85;
    }
    if (mode === "dwarf_ice" && Math.random() < weatherDt * 0.2) {
      surface.stormFlash = 0.22;
    }
  };

  const createSurfaceAtmosphere = (id) => {
    clearSurfaceAtmosphere();
    const host = getEntityMeshById(id);
    const profile = climateProfiles[id];
    if (!host || !profile) return;
    const pressure = getCurrentClimate(id).pressureBar;
    if (pressure <= 0.0001) return;
    const radius = getEntityRadius(id);
    const tint = getAtmosphereTint(profile.kind);
    const mode = getEnvMode(id);
    const gasMode = mode === "gas_storm" || mode === "gas_ice_storm";
    const titanMode = mode === "titan_haze";
    const scale = gasMode ? 1.16 : (titanMode ? 1.11 : 1.065);
    const opacityBase = gasMode ? 0.14 : (titanMode ? 0.18 : 0.08);
    const opacityCap = gasMode ? 0.62 : (titanMode ? 0.72 : 0.42);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius * scale, PERF.atmosphereSegW, PERF.atmosphereSegH),
      new THREE.MeshBasicMaterial({
        color: tint,
        transparent: true,
        opacity: Math.min(opacityCap, opacityBase + pressure * 0.03),
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
      })
    );
    host.add(mesh);
    surface.atmosphere = { mesh, host, baseTint: new THREE.Color(tint) };
  };

  const setSurfaceButtonsState = () => {
    ui.surfaceEnterBtn.disabled = surface.active;
    ui.surfaceExitBtn.disabled = !surface.active;
    updateQuickLandButton();
    syncWalkUi();
    syncTraverseUi();
  };

  const updateSurfaceAltitudeLabel = () => {
    ui.surfaceAltitudeValue.textContent = `${Number(ui.surfaceAltitudeRange.value).toFixed(2)}xR`;
  };

  const getSurfaceGravity = (id) => Math.max(0.001, geoProfiles[id]?.gravity ?? 1.62);

  const canUseEva = (id) => {
    const geo = geoProfiles[id];
    if (!geo?.solid) return false;
    const mode = getEnvMode(id);
    return mode !== "gas_storm" && mode !== "gas_ice_storm";
  };

  const getEvaEyeHeight = (radius, gravity) => {
    const gravityFactor = THREE.MathUtils.clamp(Math.sqrt(9.81 / Math.max(0.001, gravity)), 0.7, 2.4);
    return THREE.MathUtils.clamp(radius * 0.08 * gravityFactor, 0.09, 0.55);
  };

  const syncWalkUi = () => {
    const allowed = surface.active && !!surface.targetId && canUseEva(surface.targetId);
    ui.walkModeBtn.disabled = !allowed;
    if (!allowed) {
      ui.walkModeBtn.textContent = "FPS / EVA";
      setWalkStatus(surface.active ? "EVA: N/A" : "EVA: OFF");
      return;
    }
    ui.walkModeBtn.textContent = eva.active ? "Exit EVA" : "FPS / EVA";
    if (!eva.active) setWalkStatus("EVA: READY");
  };

  const syncTraverseUi = () => {
    const allowed = surface.active && !!surface.targetId && canUseEva(surface.targetId);
    ui.surfaceTraverseBtn.disabled = !allowed;
    if (!allowed) {
      ui.surfaceTraverseBtn.textContent = "تنقل كوكبي كامل";
      setTraverseStatus(surface.active ? "TRAVERSE: N/A" : "TRAVERSE: OFF");
      return;
    }
    ui.surfaceTraverseBtn.textContent = surface.traverseMode ? "إيقاف التنقل الكوكبي" : "تنقل كوكبي كامل";
    setTraverseStatus(surface.traverseMode ? "TRAVERSE: ON" : "TRAVERSE: READY", surface.traverseMode);
  };

  const triggerSkyLook = () => {
    if (!surface.active || !surface.targetId) {
      setSkyStatus("SKY: ORBIT MODE");
      return;
    }
    if (surface.traverseMode) {
      setSkyStatus("SKY: TRAVERSE");
      return;
    }
    if (eva.active) {
      eva.pitch = THREE.MathUtils.clamp(Math.max(eva.pitch, 1.06), -1.45, 1.45);
      surface.skyAssist = 1.25;
      setSkyStatus("SKY: EVA UP", true);
      return;
    }
    const target = getEntityPosition(surface.targetId);
    const radius = getEntityRadius(surface.targetId);
    tmpV1.copy(camera.position).sub(target).normalize();
    const ref = Math.abs(tmpV1.y) > 0.92 ? tmpV2.set(1, 0, 0) : tmpV2.set(0, 1, 0);
    tmpV3.crossVectors(ref, tmpV1).normalize();
    tmpV4.copy(tmpV1).multiplyScalar(0.95).addScaledVector(tmpV3, 0.25).normalize();
    controls.target.copy(camera.position).addScaledVector(tmpV4, Math.max(8, radius * 4));
    surface.skyAssist = 1.3;
    setSkyStatus("SKY: LOCKED", true);
  };

  const requestEvaPointerLock = () => {
    if (!eva.active) return;
    if (document.pointerLockElement === ui.canvas) return;
    if (ui.canvas.requestPointerLock) {
      try {
        ui.canvas.requestPointerLock();
      } catch {
        // Keep EVA mode usable even if pointer lock is denied.
      }
    }
  };

  const exitEvaMode = (unlockPointer = true) => {
    if (!eva.active) {
      syncWalkUi();
      return;
    }
    eva.active = false;
    eva.pointerLocked = false;
    eva.hover = 0;
    eva.verticalVel = 0;
    eva.thruster = 0;
    eva.sinkRate = 0;
    controls.enabled = true;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = !surface.active;
    if (unlockPointer && document.pointerLockElement === ui.canvas && document.exitPointerLock) {
      try {
        document.exitPointerLock();
      } catch {
        // Ignore pointer lock exit failures.
      }
    }
    setCameraState();
    syncWalkUi();
  };

  const enterEvaMode = () => {
    if (!surface.active || !surface.targetId || !canUseEva(surface.targetId)) {
      syncWalkUi();
      return;
    }
    surface.landingSequence = null;
    const target = getEntityPosition(surface.targetId);
    tmpV1.copy(camera.position).sub(target);
    if (tmpV1.lengthSq() < 0.000001) tmpV1.set(0.35, 0.62, 0.48);
    eva.radialDir.copy(tmpV1.normalize());
    tmpV2.set(0, 1, 0);
    if (Math.abs(tmpV2.dot(eva.radialDir)) > 0.96) tmpV2.set(1, 0, 0);
    tmpV3.crossVectors(tmpV2, eva.radialDir).normalize(); // east
    tmpV4.crossVectors(eva.radialDir, tmpV3).normalize(); // north
    tmpV2.copy(controls.target).sub(camera.position);
    if (tmpV2.lengthSq() < 0.000001) tmpV2.copy(tmpV4);
    tmpV2.normalize();
    eva.pitch = THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(tmpV2.dot(eva.radialDir), -1, 1)), -1.2, 1.2);
    tmpV1.copy(tmpV2).addScaledVector(eva.radialDir, -tmpV2.dot(eva.radialDir));
    if (tmpV1.lengthSq() < 0.000001) tmpV1.copy(tmpV4);
    tmpV1.normalize();
    eva.yaw = Math.atan2(tmpV1.dot(tmpV3), tmpV1.dot(tmpV4));
    eva.active = true;
    eva.hover = 0;
    eva.verticalVel = 0;
    eva.grounded = true;
    eva.jumpQueued = false;
    eva.thruster = 0;
    eva.sinkRate = 0;
    controls.enabled = false;
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enablePan = false;
    requestEvaPointerLock();
    setCameraState();
    syncWalkUi();
  };

  const toggleEvaMode = () => {
    if (eva.active) {
      exitEvaMode();
    } else {
      if (surface.traverseMode) setSurfaceTraverseMode(false);
      enterEvaMode();
    }
  };

  const setSurfaceTraverseMode = (enabled) => {
    if (!surface.active || !surface.targetId || !canUseEva(surface.targetId)) {
      surface.traverseMode = false;
      syncTraverseUi();
      return;
    }
    const next = !!enabled;
    if (surface.traverseMode === next) {
      syncTraverseUi();
      return;
    }
    surface.traverseMode = next;
    if (surface.traverseMode) {
      if (eva.active) exitEvaMode();
      surface.landingSequence = null;
      followId = surface.targetId;
      surface.skyAssist = 0;
      controls.enableRotate = false;
      controls.enablePan = false;
      controls.enableZoom = false;
      const target = getEntityPosition(surface.targetId);
      const radius = getEntityRadius(surface.targetId);
      tmpV1.copy(camera.position).sub(target);
      if (tmpV1.lengthSq() < 0.000001) tmpV1.set(0.32, 0.84, 0.42);
      surface.traverseDir.copy(tmpV1.normalize());
      const viewDir = controls.target.clone().sub(camera.position);
      if (viewDir.lengthSq() < 0.000001) viewDir.set(0, 0, -1);
      else viewDir.normalize();
      const ref = Math.abs(surface.traverseDir.y) > 0.92 ? tmpV2.set(1, 0, 0) : tmpV2.set(0, 1, 0);
      tmpV3.crossVectors(ref, surface.traverseDir).normalize();
      tmpV4.crossVectors(surface.traverseDir, tmpV3).normalize();
      tmpV1.copy(viewDir).addScaledVector(surface.traverseDir, -viewDir.dot(surface.traverseDir));
      if (tmpV1.lengthSq() < 0.000001) tmpV1.copy(tmpV4);
      tmpV1.normalize();
      surface.traverseHeading = Math.atan2(tmpV1.dot(tmpV3), tmpV1.dot(tmpV4));
      surface.traverseTargetAltitude = THREE.MathUtils.clamp(radius * 0.02, radius * 0.006, radius * 0.08);
    } else {
      controls.enableRotate = true;
      controls.enablePan = false;
      controls.enableZoom = true;
      surface.skyAssist = 0;
      if (!eva.active) applySurfaceDistance();
    }
    setCameraState();
    syncTraverseUi();
    updateExplorerInfo(surface.targetId);
  };

  const updateSurfaceTraverse = (dt) => {
    if (!surface.active || !surface.targetId || !surface.traverseMode || eva.active) return;
    const target = getEntityPosition(surface.targetId);
    const radius = Math.max(0.0001, getEntityRadius(surface.targetId));
    const normal = surface.traverseDir;
    if (normal.lengthSq() < 0.000001) normal.set(0, 1, 0);
    normal.normalize();

    traverseEast.set(0, 1, 0);
    if (Math.abs(traverseEast.dot(normal)) > 0.96) traverseEast.set(1, 0, 0);
    traverseEast.crossVectors(traverseEast, normal).normalize();
    traverseNorth.crossVectors(normal, traverseEast).normalize();

    const inputForward = (isKeyPressed("KeyW") || isKeyPressed("ArrowUp") ? 1 : 0) - (isKeyPressed("KeyS") || isKeyPressed("ArrowDown") ? 1 : 0);
    const inputSide = (isKeyPressed("KeyD") || isKeyPressed("ArrowRight") ? 1 : 0) - (isKeyPressed("KeyA") || isKeyPressed("ArrowLeft") ? 1 : 0);
    const inputTurn = (isKeyPressed("KeyQ") ? 1 : 0) - (isKeyPressed("KeyE") ? 1 : 0);

    if (inputTurn !== 0) {
      surface.traverseHeading += inputTurn * dt * 1.4;
    }

    const inputLen = Math.hypot(inputForward, inputSide);
    if (inputLen > 0.001) {
      const boost = (isKeyPressed("ShiftLeft") || isKeyPressed("ShiftRight")) ? 2.4 : 1;
      const baseSpeed = radius * 0.11 * boost;
      const arc = baseSpeed * dt / radius;
      traverseForward.copy(traverseNorth).multiplyScalar(inputForward / inputLen)
        .addScaledVector(traverseEast, inputSide / inputLen).normalize();
      normal.addScaledVector(traverseForward, arc).normalize();
      surface.traverseDir.copy(normal);
    }

    traverseEast.set(0, 1, 0);
    if (Math.abs(traverseEast.dot(normal)) > 0.96) traverseEast.set(1, 0, 0);
    traverseEast.crossVectors(traverseEast, normal).normalize();
    traverseNorth.crossVectors(normal, traverseEast).normalize();

    const heightMul = Number(ui.surfaceAltitudeRange.value);
    const desiredAbove = THREE.MathUtils.clamp(
      radius * Math.max(0.0016, (heightMul - 1) * 0.045),
      radius * 0.0016,
      radius * 0.075
    );
    surface.traverseTargetAltitude += (desiredAbove - surface.traverseTargetAltitude) * Math.min(1, dt * 2.2);

    const terrainOffset = sampleTerrainOffset(surface.targetId, normal);
    const dist = radius + Math.max(-radius * 0.12, terrainOffset) + surface.traverseTargetAltitude;
    camera.position.copy(target).addScaledVector(normal, dist);

    traverseForward.copy(traverseNorth).multiplyScalar(Math.cos(surface.traverseHeading))
      .addScaledVector(traverseEast, Math.sin(surface.traverseHeading)).normalize();
    const lookDist = Math.max(radius * 1.25, 1.8);
    controls.target.copy(camera.position)
      .addScaledVector(traverseForward, lookDist)
      .addScaledVector(normal, -surface.traverseTargetAltitude * 0.5);
    camera.up.copy(normal);
  };

  const onEvaPointerLockChange = () => {
    eva.pointerLocked = document.pointerLockElement === ui.canvas;
    if (!eva.active) return;
    if (eva.pointerLocked) setWalkStatus("EVA: ON", true);
    else setWalkStatus("EVA: ON (Click Canvas)", true);
  };

  const onEvaMouseMove = (event) => {
    if (!eva.active || !eva.pointerLocked) return;
    const sensitivity = 0.0019;
    eva.yaw -= event.movementX * sensitivity;
    eva.pitch = THREE.MathUtils.clamp(eva.pitch - event.movementY * sensitivity, -1.45, 1.45);
  };

  const onSimKeyDown = (event) => {
    if (event.code === "Escape" && mouseContext.open) {
      event.preventDefault();
      closeMouseMenu();
      return;
    }
    if (event.code === "KeyM") {
      event.preventDefault();
      setSpaceNavEnabled(!spaceNav.enabled);
      return;
    }
    if (event.code === "KeyG" && surface.active) {
      event.preventDefault();
      setSurfaceTraverseMode(!surface.traverseMode);
      return;
    }
    if (event.code === "Digit1" || event.code === "Digit2" || event.code === "Digit3") {
      const mode = event.code === "Digit1" ? "assist" : (event.code === "Digit2" ? "realistic" : "hardcore");
      landingRealismMode = mode;
      updateLandingRealismUi();
      if (surface.active && !eva.active && !surface.traverseMode) startSurfaceLandingSequence();
      updateExplorerInfo(surface.targetId || explorerTargetId);
      return;
    }
    const tag = (event.target?.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea" || event.target?.isContentEditable) return;
    if ((event.code === "PageUp" || event.code === "Equal") && spaceNav.enabled) {
      event.preventDefault();
      stepSpaceNavSpeed(1);
      return;
    }
    if ((event.code === "PageDown" || event.code === "Minus") && spaceNav.enabled) {
      event.preventDefault();
      stepSpaceNavSpeed(-1);
      return;
    }
    if (event.code === "Home" && spaceNav.enabled) {
      event.preventDefault();
      spaceNav.speedStep = 0;
      updateSpaceNavHud();
      return;
    }
    if (event.repeat && event.code === "KeyV") return;
    keys[event.code] = true;
    if (event.code === "Space") eva.jumpQueued = true;
    if (event.code === "KeyV" && surface.active) {
      event.preventDefault();
      toggleEvaMode();
    }
    if (event.code === "KeyH" && surface.active) {
      event.preventDefault();
      triggerSkyLook();
    }
    if (event.code === "KeyT") {
      event.preventDefault();
      setFlightComputerMode("target", explorerTargetId || followId || "earth");
    }
    if (event.code === "KeyP") {
      event.preventDefault();
      setFlightComputerMode("prograde", explorerTargetId || followId || "earth");
    }
    if (event.code === "KeyR") {
      event.preventDefault();
      setFlightComputerMode("retrograde", explorerTargetId || followId || "earth");
    }
    if (event.code === "KeyN") {
      event.preventDefault();
      setFlightComputerMode("normal", explorerTargetId || followId || "earth");
    }
    if (event.code === "KeyF") {
      event.preventDefault();
      setFlightComputerMode("off");
    }
    if (spaceNav.enabled && !eva.active && (
      event.code === "Space"
      || event.code === "KeyW"
      || event.code === "KeyA"
      || event.code === "KeyS"
      || event.code === "KeyD"
      || event.code === "KeyQ"
      || event.code === "KeyE"
      || event.code === "KeyZ"
      || event.code === "KeyX"
      || event.code === "ArrowUp"
      || event.code === "ArrowLeft"
      || event.code === "ArrowDown"
      || event.code === "ArrowRight"
    )) {
      event.preventDefault();
    }
    if (surface.traverseMode && !eva.active && (
      event.code === "Space"
      || event.code === "KeyW"
      || event.code === "KeyA"
      || event.code === "KeyS"
      || event.code === "KeyD"
      || event.code === "KeyQ"
      || event.code === "KeyE"
      || event.code === "ArrowUp"
      || event.code === "ArrowLeft"
      || event.code === "ArrowDown"
      || event.code === "ArrowRight"
      || event.code === "ShiftLeft"
      || event.code === "ShiftRight"
    )) {
      event.preventDefault();
    }
    if (eva.active && (
      event.code === "Space"
      || event.code === "KeyW"
      || event.code === "KeyA"
      || event.code === "KeyS"
      || event.code === "KeyD"
      || event.code === "ArrowUp"
      || event.code === "ArrowLeft"
      || event.code === "ArrowDown"
      || event.code === "ArrowRight"
      || event.code === "ShiftLeft"
      || event.code === "ShiftRight"
    )) {
      event.preventDefault();
    }
  };

  const onSimKeyUp = (event) => {
    keys[event.code] = false;
  };

  const onWindowBlur = () => {
    closeMouseMenu();
    Object.keys(keys).forEach((code) => {
      keys[code] = false;
    });
    touchControls.sprintHeld = false;
    touchControls.brakeHeld = false;
    touchControls.jumpHeld = false;
    if (surface.traverseMode) setSurfaceTraverseMode(false);
  };

  const onVisibilityChange = () => {
    runtimeState.pageHidden = document.visibilityState === "hidden";
    if (runtimeState.pageHidden) onWindowBlur();
  };

  const onWebGlContextLost = (event) => {
    event?.preventDefault?.();
    runtimeState.contextLost = true;
    onWindowBlur();
    setValidationStatus("WEBGL: CONTEXT LOST", true);
  };

  const onWebGlContextRestored = () => {
    runtimeState.contextLost = false;
    setValidationStatus("WEBGL: RESTORING", true);
    window.setTimeout(() => window.location.reload(), 120);
  };

  const updateEvaMotion = (dt) => {
    if (!eva.active || !surface.active || !surface.targetId) return;
    const id = surface.targetId;
    if (!canUseEva(id)) {
      exitEvaMode();
      return;
    }

    const gravity = getSurfaceGravity(id);
    const target = getEntityPosition(id);
    const radius = Math.max(0.0001, getEntityRadius(id));
    const gravityNorm = gravity / 9.81;

    tmpV1.copy(eva.radialDir).normalize();
    if (tmpV1.lengthSq() < 0.000001) tmpV1.set(0, 1, 0);
    eva.radialDir.copy(tmpV1);

    tmpV2.set(0, 1, 0);
    if (Math.abs(tmpV1.dot(tmpV2)) > 0.96) tmpV2.set(1, 0, 0);
    tmpV3.crossVectors(tmpV2, tmpV1).normalize(); // east
    tmpV4.crossVectors(tmpV1, tmpV3).normalize(); // north
    const yawCos = Math.cos(eva.yaw);
    const yawSin = Math.sin(eva.yaw);
    tmpV2.copy(tmpV4).multiplyScalar(yawCos).addScaledVector(tmpV3, yawSin).normalize(); // forward on tangent
    tmpV3.crossVectors(tmpV2, tmpV1).normalize(); // right on tangent

    const moveZ = (isKeyPressed("KeyW") || isKeyPressed("ArrowUp") ? 1 : 0) - (isKeyPressed("KeyS") || isKeyPressed("ArrowDown") ? 1 : 0);
    const moveX = (isKeyPressed("KeyD") || isKeyPressed("ArrowRight") ? 1 : 0) - (isKeyPressed("KeyA") || isKeyPressed("ArrowLeft") ? 1 : 0);
    const inputLen = Math.hypot(moveX, moveZ);
    if (inputLen > 0.001) {
      const sprint = (isKeyPressed("ShiftLeft") || isKeyPressed("ShiftRight")) ? 1.45 : 1;
      const speed = radius * THREE.MathUtils.clamp(0.7 + Math.sqrt(9.81 / gravity) * 0.4, 0.65, 2.2) * sprint;
      const arc = speed * dt / Math.max(0.0001, radius);
      tmpV4.copy(tmpV2).multiplyScalar(moveZ / inputLen).addScaledVector(tmpV3, moveX / inputLen).normalize();
      eva.radialDir.addScaledVector(tmpV4, arc).normalize();
    }

    if (eva.jumpQueued && eva.grounded) {
      const jumpImpulse = radius * THREE.MathUtils.clamp(0.45 + Math.sqrt(9.81 / gravity) * 0.18, 0.36, 1.2);
      eva.verticalVel = jumpImpulse;
      eva.grounded = false;
    }
    eva.jumpQueued = false;
    const gravityScene = radius * THREE.MathUtils.clamp(gravityNorm, 0.05, 2.8) * 0.9;
    eva.verticalVel -= gravityScene * dt;
    eva.hover += eva.verticalVel * dt;
    if (eva.hover <= 0) {
      eva.hover = 0;
      eva.verticalVel = 0;
      eva.grounded = true;
    } else {
      eva.grounded = false;
    }
    eva.sinkRate = -eva.verticalVel;

    tmpV1.copy(eva.radialDir).normalize();
    const terrainOffset = sampleTerrainOffset(id, tmpV1);
    const eyeHeight = getEvaEyeHeight(radius, gravity);
    const dist = radius + Math.max(-radius * 0.12, terrainOffset) + eyeHeight + eva.hover;
    camera.position.copy(target).addScaledVector(tmpV1, dist);

    tmpV2.set(0, 1, 0);
    if (Math.abs(tmpV1.dot(tmpV2)) > 0.96) tmpV2.set(1, 0, 0);
    tmpV3.crossVectors(tmpV2, tmpV1).normalize();
    tmpV4.crossVectors(tmpV1, tmpV3).normalize();
    const forwardFlat = tmpV2.copy(tmpV4).multiplyScalar(Math.cos(eva.yaw)).addScaledVector(tmpV3, Math.sin(eva.yaw)).normalize();
    const pitchCos = Math.cos(eva.pitch);
    const pitchSin = Math.sin(eva.pitch);
    tmpV3.copy(forwardFlat).multiplyScalar(pitchCos).addScaledVector(tmpV1, pitchSin).normalize();
    controls.target.copy(camera.position).addScaledVector(tmpV3, Math.max(4.2, radius * 2.2));

    if (eva.active && !eva.pointerLocked) setWalkStatus("EVA: ON (Click Canvas)", true);
    else setWalkStatus("EVA: ON", true);
  };

  const applyAtmosphereLayers = (altitudeR) => {
    if (!surface.active || !surface.targetId) return;
    const id = surface.targetId;
    const mode = getEnvMode(id);
    const sky = surface.skyDome?.mesh;
    const atmo = surface.atmosphere?.mesh;
    const layerFade = THREE.MathUtils.clamp(1 - altitudeR * 1.6, 0.08, 1);
    if (sky?.material) {
      const base = getSkyPreset(mode).opacity;
      sky.material.opacity = base * layerFade;
    }
    if (atmo?.material) {
      const pressure = getCurrentClimate(id).pressureBar;
      const gasMode = mode === "gas_storm" || mode === "gas_ice_storm";
      const titanMode = mode === "titan_haze";
      const cap = gasMode ? 0.68 : (titanMode ? 0.74 : 0.42);
      const base = gasMode ? 0.14 : (titanMode ? 0.18 : 0.08);
      atmo.material.opacity = Math.min(cap, (base + pressure * 0.03) * layerFade);
    }
  };

  const enforceSurfaceClearance = (clearanceMul = 0.012) => {
    if (!surface.active || !surface.targetId || eva.active) return;
    const target = getEntityPosition(surface.targetId);
    const radius = getEntityRadius(surface.targetId);
    const mode = getEnvMode(surface.targetId);
    const dir = camera.position.clone().sub(target);
    if (dir.lengthSq() < 0.0000001) dir.set(0.3, 0.22, 1);
    dir.normalize();
    const terrainOffset = sampleTerrainOffset(surface.targetId, dir);
    const atmosphericPad = mode === "gas_storm" || mode === "gas_ice_storm"
      ? radius * 0.16
      : radius * clearanceMul;
    const minDist = radius + Math.max(-radius * 0.16, terrainOffset) + atmosphericPad;
    const currentDist = camera.position.distanceTo(target);
    if (currentDist < minDist) {
      const correction = target.clone().add(dir.multiplyScalar(minDist));
      camera.position.lerp(correction, 0.42);
      if (camera.position.distanceTo(correction) < radius * 0.0008) {
        camera.position.copy(correction);
      }
    }
  };

  const DEFAULT_LANDING_PROFILE = {
    maxSinkMul: 1,
    thrustMul: 1,
    dragMul: 1,
    driftMul: 1,
    lateralMul: 1,
    hoverBrakeMul: 1,
    touchdownSoftness: 1,
    stageSink: {
      entry: 1,
      retro: 1,
      approach: 1,
      flare: 1,
      hover: 1,
      touchdown: 1
    },
    pid: { p: 1, i: 1, d: 1 }
  };

  const LANDING_REALISM_MODELS = {
    assist: {
      key: "assist",
      label: "ASSIST",
      sink: 0.82,
      thrust: 1.16,
      drag: 1.2,
      drift: 0.78,
      pid: 1.12,
      chuteDrag: 1.3,
      chuteDeploy: 1.28,
      heat: 0.76,
      touchdownTolerance: 1.25
    },
    realistic: {
      key: "realistic",
      label: "REALISTIC",
      sink: 1,
      thrust: 1,
      drag: 1,
      drift: 1,
      pid: 1,
      chuteDrag: 1.15,
      chuteDeploy: 1,
      heat: 1,
      touchdownTolerance: 1
    },
    hardcore: {
      key: "hardcore",
      label: "HARDCORE",
      sink: 1.18,
      thrust: 0.9,
      drag: 0.88,
      drift: 1.22,
      pid: 0.9,
      chuteDrag: 1.04,
      chuteDeploy: 0.9,
      heat: 1.24,
      touchdownTolerance: 0.82
    }
  };

  const getLandingRealismModel = (mode = landingRealismMode) => LANDING_REALISM_MODELS[mode] || LANDING_REALISM_MODELS.realistic;

  const updateLandingRealismUi = () => {
    const model = getLandingRealismModel();
    landingRealismMode = model.key;
    ui.landingRealismSelect.value = model.key;
    ui.landingRealismTag.textContent = `Landing Model: ${model.label}`;
  };

  const TERRAIN_DETAIL_PRESETS = {
    balanced: {
      key: "balanced",
      label: "BALANCED",
      displacementSolidMul: 1,
      displacementGasMul: 1,
      bumpMul: 1,
      normalMul: 1,
      lodBoost: 0
    },
    ultra: {
      key: "ultra",
      label: "ULTRA",
      displacementSolidMul: 1.28,
      displacementGasMul: 1.12,
      bumpMul: 1.18,
      normalMul: 1.28,
      lodBoost: 1
    }
  };

  const getTerrainDetailPreset = (key = terrainDetailPreset) => TERRAIN_DETAIL_PRESETS[key] || TERRAIN_DETAIL_PRESETS.balanced;

  const updateTerrainDetailUi = () => {
    const preset = getTerrainDetailPreset();
    terrainDetailPreset = preset.key;
    ui.terrainDetailSelect.value = preset.key;
    ui.terrainDetailTag.textContent = `Terrain: ${preset.label}`;
    const ultra = preset.key === "ultra";
    ui.terrainDetailTag.style.color = ultra ? "#ffd9a6" : "#a9d0ff";
    ui.terrainDetailTag.style.borderColor = ultra ? "rgba(255, 196, 120, 0.38)" : "rgba(131, 188, 255, 0.22)";
  };

  const applyTerrainDetailRuntime = () => {
    const preset = getTerrainDetailPreset();
    terrainRuntime.forEach((runtime) => {
      if (!runtime?.material) return;
      const dispBase = runtime.baseDisplacementScale || runtime.displacementScale || 0;
      const dispMul = runtime.solid ? preset.displacementSolidMul : preset.displacementGasMul;
      const disp = dispBase * dispMul;
      runtime.displacementScale = disp;
      runtime.displacementBias = -(Math.abs(runtime.baseDisplacementBias ?? dispBase * 0.5)) * dispMul;

      runtime.material.displacementScale = runtime.displacementScale;
      runtime.material.displacementBias = runtime.displacementBias;
      runtime.material.bumpScale = (runtime.baseBumpScale || runtime.material.bumpScale || 0) * preset.bumpMul;
      if (runtime.material.normalScale) {
        const n = (runtime.baseNormalScale || 1) * preset.normalMul;
        runtime.material.normalScale.set(n, n);
      }
      runtime.material.needsUpdate = true;
    });
    if (surface.active && surface.targetId && canUseEva(surface.targetId)) {
      applySurfaceTargetLod(surface.targetId);
    }
    updateExplorerInfo(surface.targetId || explorerTargetId);
  };

  const setTerrainDetailPreset = (key, persist = false) => {
    const preset = getTerrainDetailPreset(mobileLiteMode ? "balanced" : key);
    terrainDetailPreset = preset.key;
    updateTerrainDetailUi();
    applyTerrainDetailRuntime();
    if (!persist) return;
    try {
      localStorage.setItem(ORBIT_TERRAIN_DETAIL_KEY, preset.key);
    } catch {
      // Ignore storage restrictions in privacy contexts.
    }
  };

  const restoreTerrainDetailPreset = () => {
    let saved = null;
    try {
      saved = localStorage.getItem(ORBIT_TERRAIN_DETAIL_KEY);
    } catch {
      saved = null;
    }
    const key = (!mobileLiteMode && saved === "ultra") ? "ultra" : "balanced";
    setTerrainDetailPreset(key);
  };

  const mergeLandingProfile = (base, override = null) => {
    if (!override) return base;
    return {
      ...base,
      ...override,
      stageSink: { ...base.stageSink, ...(override.stageSink || {}) },
      pid: { ...base.pid, ...(override.pid || {}) }
    };
  };

  const getLandingProfile = (id, mode) => {
    const modeProfile = landingProfileByMode[mode] || null;
    const idProfile = landingProfileById[id] || null;
    const merged = mergeLandingProfile(mergeLandingProfile(DEFAULT_LANDING_PROFILE, modeProfile), idProfile);
    return {
      ...merged,
      tag: idProfile ? id.toUpperCase() : mode.toUpperCase().replace(/_/g, "-")
    };
  };

  const LANDING_STAGE_LABEL = {
    entry: "ENTRY",
    retro: "RETRO",
    chute: "CHUTE",
    approach: "APPROACH",
    flare: "FLARE",
    hover: "HOVER",
    touchdown: "TOUCHDOWN",
    landed: "LANDED"
  };

  const getLandingStageLabel = (stage) => LANDING_STAGE_LABEL[stage] || "DESCENT";

  const getLandingStage = (seq, alt) => {
    const radius = Math.max(0.0001, seq.radius);
    const initAlt = Math.max(0.0001, seq.initialAltitude);
    if (alt > Math.max(radius * 0.42, initAlt * 0.58)) return "entry";
    if (alt > Math.max(radius * 0.18, initAlt * 0.26)) return "retro";
    if (seq.parachuteEligible && alt > Math.max(radius * 0.09 * (seq.realism?.chuteDeploy ?? 1), initAlt * 0.14 * (seq.realism?.chuteDeploy ?? 1))) return "chute";
    if (alt > Math.max(radius * 0.06, initAlt * 0.09)) return "approach";
    if (alt > Math.max(radius * 0.02, initAlt * 0.028)) return "flare";
    if (alt > Math.max(radius * 0.006, initAlt * 0.01)) return "hover";
    return "touchdown";
  };

  const getLandingTargetSink = (seq, stage, alt) => {
    const radius = Math.max(0.0001, seq.radius);
    const initAlt = Math.max(0.0001, seq.initialAltitude);
    const altRatio = THREE.MathUtils.clamp(alt / initAlt, 0, 1.8);
    const gasMode = seq.mode === "gas_storm" || seq.mode === "gas_ice_storm";
    const gasMul = gasMode ? 1.18 : 1;
    const stageMul = seq.profile?.stageSink?.[stage] ?? 1;
    if (stage === "entry") {
      return THREE.MathUtils.clamp(seq.maxSink * (0.82 + altRatio * 0.22) * gasMul * stageMul, radius * 0.02, seq.maxSink * 1.1);
    }
    if (stage === "retro") {
      return THREE.MathUtils.clamp(seq.maxSink * (0.58 + altRatio * 0.2) * gasMul * stageMul, radius * 0.012, seq.maxSink * 0.92);
    }
    if (stage === "chute") {
      return THREE.MathUtils.clamp(seq.maxSink * (0.24 + altRatio * 0.12) * gasMul * stageMul, radius * 0.004, seq.maxSink * 0.42);
    }
    if (stage === "approach") {
      return THREE.MathUtils.clamp(seq.maxSink * (0.34 + altRatio * 0.14) * stageMul, radius * 0.005, seq.maxSink * 0.56);
    }
    if (stage === "flare") {
      return THREE.MathUtils.clamp(seq.maxSink * (0.16 + altRatio * 0.06) * stageMul, radius * 0.0022, seq.maxSink * 0.28);
    }
    if (stage === "hover") {
      return THREE.MathUtils.clamp((radius * 0.0011 + alt * 0.055) * stageMul, radius * 0.0007, radius * 0.02);
    }
    return THREE.MathUtils.clamp(alt * 0.48 * stageMul, radius * 0.00042, radius * 0.009);
  };

  const getLandingControlProfile = (stage, profile, realism = null) => {
    const pid = profile?.pid || DEFAULT_LANDING_PROFILE.pid;
    const pidScale = realism?.pid ?? 1;
    const lateralMul = profile?.lateralMul ?? 1;
    const base = (
      stage === "entry" ? { p: 1.25, i: 0.02, d: 0.12, lateral: 0.42, floor: 0.05 }
        : stage === "retro" ? { p: 1.9, i: 0.03, d: 0.2, lateral: 0.54, floor: 0.12 }
          : stage === "chute" ? { p: 2.2, i: 0.033, d: 0.23, lateral: 0.6, floor: 0.14 }
          : stage === "approach" ? { p: 2.5, i: 0.04, d: 0.3, lateral: 0.72, floor: 0.2 }
            : stage === "flare" ? { p: 3.1, i: 0.045, d: 0.43, lateral: 0.84, floor: 0.28 }
              : stage === "hover" ? { p: 3.9, i: 0.05, d: 0.55, lateral: 0.96, floor: 0.34 }
                : { p: 4.4, i: 0.05, d: 0.62, lateral: 1.05, floor: 0.38 }
    );
    return {
      p: base.p * (pid.p ?? 1) * pidScale,
      i: base.i * (pid.i ?? 1) * pidScale,
      d: base.d * (pid.d ?? 1) * pidScale,
      lateral: base.lateral * lateralMul,
      floor: base.floor
    };
  };

  const startSurfaceLandingSequence = () => {
    if (!surface.active || !surface.targetId) return;
    if (surface.traverseMode) setSurfaceTraverseMode(false);
    if (eva.active) exitEvaMode();
    surface.entryStabilizer = Math.max(surface.entryStabilizer, 0.95);
    const target = getEntityPosition(surface.targetId);
    const radius = getEntityRadius(surface.targetId);
    const mode = getEnvMode(surface.targetId);
    const gravity = getSurfaceGravity(surface.targetId);
    const climate = getCurrentClimate(surface.targetId);
    const profile = getLandingProfile(surface.targetId, mode);
    const realism = getLandingRealismModel();
    const minMul = mode === "gas_storm" || mode === "gas_ice_storm" ? 1.12 : 1.01;
    const desiredMul = Number(ui.surfaceAltitudeRange.value);
    const desiredDist = Math.max(radius * minMul, radius * desiredMul);
    const currentDist = camera.position.distanceTo(target);
    const maxStartMul = mode === "gas_storm" || mode === "gas_ice_storm" ? 1.92 : 1.58;
    const startDist = THREE.MathUtils.clamp(currentDist, desiredDist + 0.001, radius * maxStartMul);
    const startDir = camera.position.clone().sub(target);
    if (startDir.lengthSq() < 0.0000001) startDir.set(0.3, 0.2, 1);
    startDir.normalize();
    const tangentRef = Math.abs(startDir.y) > 0.92 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const tangentA = new THREE.Vector3().crossVectors(tangentRef, startDir).normalize();
    const tangentB = new THREE.Vector3().crossVectors(startDir, tangentA).normalize();
    const initialAltitude = Math.max(0.0002, startDist - desiredDist);
    const pressureNorm = THREE.MathUtils.clamp(climate.pressureBar / 30, 0, 3.2);
    const windNorm = THREE.MathUtils.clamp(climate.windKmh / 1100, 0, 3.4);
    const initialDriftScale = THREE.MathUtils.clamp(
      (0.012 + pressureNorm * 0.008 + windNorm * 0.014) * profile.driftMul * realism.drift,
      0.004,
      0.14
    );
    const initialDrift = radius * (mode === "gas_storm" || mode === "gas_ice_storm" ? initialDriftScale * 1.28 : initialDriftScale);
    const gravityScene = radius * THREE.MathUtils.clamp(gravity / 9.81, 0.05, 2.9) * 0.82;
    const maxSink = Math.max(
      radius * (mode === "gas_storm" || mode === "gas_ice_storm" ? 0.12 : 0.075) * profile.maxSinkMul * realism.sink,
      initialAltitude * 0.72 * profile.maxSinkMul * realism.sink
    );
    const maxThrust = gravityScene * (mode === "gas_storm" || mode === "gas_ice_storm" ? 2.12 : 2.72) * profile.thrustMul * realism.thrust;
    const dragCoefficient = THREE.MathUtils.clamp(
      (0.006 + climate.pressureBar * 0.011 + windNorm * 0.02) * profile.dragMul * realism.drag,
      0.0018,
      0.42
    );
    const parachuteEligible = climate.pressureBar >= 0.12
      && !(mode === "gas_storm" || mode === "gas_ice_storm")
      && !!geoProfiles[surface.targetId]?.solid;
    const stage = getLandingStage({
      radius,
      initialAltitude,
      parachuteEligible,
      realism
    }, initialAltitude);
    surface.landingSequence = {
      active: true,
      currentDist: startDist,
      targetDist: desiredDist,
      initialAltitude,
      radius,
      mode,
      profile,
      realism,
      realismLabel: realism.label,
      profileTag: profile.tag,
      dir: startDir,
      tangentA,
      tangentB,
      lateralOffset: new THREE.Vector2((Math.random() * 2 - 1) * initialDrift, (Math.random() * 2 - 1) * initialDrift),
      lateralVel: new THREE.Vector2(
        (Math.random() * 2 - 1) * radius * 0.015 * profile.driftMul * realism.drift,
        (Math.random() * 2 - 1) * radius * 0.015 * profile.driftMul * realism.drift
      ),
      windBias: new THREE.Vector2((Math.random() * 2 - 1) * initialDriftScale, (Math.random() * 2 - 1) * initialDriftScale),
      windPhaseA: Math.random() * Math.PI * 2,
      windPhaseB: Math.random() * Math.PI * 2,
      parachuteEligible,
      parachuteDeployed: false,
      gravityScene,
      maxThrust,
      dragCoefficient,
      verticalSpeed: 0,
      maxSink,
      thruster: 0,
      correction: 0,
      targetSink: 0,
      etaSec: Math.max(0, initialAltitude / Math.max(0.0001, maxSink * 0.6)),
      stage,
      stageTime: 0,
      elapsed: 0,
      verticalErrPrev: 0,
      verticalErrInt: 0,
      impactSpeed: 0,
      dynamicPressure: 0,
      maxDynamicPressure: 0,
      heatLoad: 0,
      peakHeatLoad: 0,
      currentG: 1,
      peakG: 1,
      touchdownScore: null,
      telemetryTick: 0
    };
    controls.enableRotate = false;
  };

  const updateSurfaceLandingSequence = (dt) => {
    if (!surface.landingSequence?.active || !surface.targetId) return;
    const seq = surface.landingSequence;
    const target = getEntityPosition(surface.targetId);
    const climate = getCurrentClimate(surface.targetId);
    const alt = Math.max(0, seq.currentDist - seq.targetDist);
    const pressureNorm = THREE.MathUtils.clamp(climate.pressureBar / 36, 0, 3.2);
    const windNorm = THREE.MathUtils.clamp(climate.windKmh / 980, 0, 3.6);
    const stage = getLandingStage(seq, alt);
    if (stage !== seq.stage) {
      seq.stage = stage;
      seq.stageTime = 0;
      if (stage === "chute" && seq.parachuteEligible) {
        seq.parachuteDeployed = true;
      }
      if (audio.enabled && (stage === "flare" || stage === "touchdown")) {
        triggerLandingPulse(stage === "flare" ? 0.9 : 1.05);
      }
      if (audio.enabled && stage === "chute" && seq.parachuteDeployed) {
        triggerLandingPulse(0.62);
      }
    }
    seq.stageTime += dt;
    seq.elapsed += dt;

    const atmoScaleH = Math.max(seq.radius * 0.12, seq.initialAltitude * 0.22);
    const atmoDensity = pressureNorm * Math.exp(-alt / Math.max(0.0001, atmoScaleH));
    const qTarget = atmoDensity
      * Math.pow(Math.abs(seq.verticalSpeed) + seq.maxSink * 0.08, 2)
      * (1.8 + windNorm * 0.22)
      * (seq.realism?.heat ?? 1)
      * 2.3;
    seq.dynamicPressure += (qTarget - seq.dynamicPressure) * Math.min(1, dt * 2.2);
    seq.maxDynamicPressure = Math.max(seq.maxDynamicPressure, seq.dynamicPressure);
    const heatTarget = seq.dynamicPressure * (0.42 + windNorm * 0.16) * (seq.realism?.heat ?? 1);
    seq.heatLoad += (heatTarget - seq.heatLoad) * Math.min(1, dt * 1.8);
    if (seq.parachuteDeployed) seq.heatLoad *= Math.max(0.74, 1 - dt * 0.86);
    seq.peakHeatLoad = Math.max(seq.peakHeatLoad, seq.heatLoad);

    const control = getLandingControlProfile(seq.stage, seq.profile, seq.realism);
    const targetSink = getLandingTargetSink(seq, seq.stage, alt);
    seq.targetSink = targetSink;
    seq.etaSec = alt > 0.0001 ? alt / Math.max(0.0001, Math.abs(seq.verticalSpeed) + targetSink * 0.38) : 0;

    const speedErr = targetSink - seq.verticalSpeed;
    seq.verticalErrInt = THREE.MathUtils.clamp(seq.verticalErrInt + speedErr * dt, -seq.maxSink * 0.35, seq.maxSink * 0.35);
    const deriv = (speedErr - seq.verticalErrPrev) / Math.max(0.0001, dt);
    seq.verticalErrPrev = speedErr;

    let throttleCmd = (
      seq.gravityScene +
      speedErr * control.p +
      seq.verticalErrInt * control.i +
      deriv * control.d +
      seq.correction * seq.gravityScene * 0.14
    ) / Math.max(0.0001, seq.maxThrust);
    const floorMul = THREE.MathUtils.clamp(alt / Math.max(0.0001, seq.initialAltitude * 0.24 + seq.radius * 0.025), 0, 1);
    throttleCmd = Math.max(throttleCmd, control.floor * floorMul);
    if (seq.parachuteDeployed && (seq.stage === "chute" || seq.stage === "approach")) {
      throttleCmd = Math.min(throttleCmd, 0.72);
    }
    throttleCmd = THREE.MathUtils.clamp(throttleCmd, 0, 1);
    seq.thruster += (throttleCmd - seq.thruster) * Math.min(1, dt * (2.8 + control.p * 0.45));

    seq.windPhaseA += dt * (0.6 + windNorm * 1.1 + pressureNorm * 0.24);
    seq.windPhaseB += dt * (0.94 + windNorm * 0.82 + pressureNorm * 0.2);
    const gustA = Math.sin(seq.windPhaseA * 1.8 + seq.elapsed * 0.34);
    const gustB = Math.cos(seq.windPhaseB * 1.6 - seq.elapsed * 0.28);
    const windAmp = seq.radius * (0.0009 + windNorm * 0.0018 + pressureNorm * 0.0011) * (seq.profile?.driftMul ?? 1);
    const windTargetX = seq.windBias.x * seq.radius * 0.12 + gustA * windAmp;
    const windTargetY = seq.windBias.y * seq.radius * 0.12 + gustB * windAmp;

    const lateralGoalX = windTargetX * (0.38 + pressureNorm * 0.12);
    const lateralGoalY = windTargetY * (0.38 + pressureNorm * 0.12);
    const lateralErrX = seq.lateralOffset.x - lateralGoalX;
    const lateralErrY = seq.lateralOffset.y - lateralGoalY;
    const maxCorridor = Math.max(
      seq.radius * (seq.stage === "touchdown" ? 0.0028 : (seq.stage === "hover" ? 0.006 : 0.014)),
      seq.initialAltitude * (seq.stage === "entry" ? 0.22 : 0.14)
    );
    const correctionX = -lateralErrX * (0.85 + control.lateral * 1.35) - seq.lateralVel.x * (1.15 + control.lateral * 1.8);
    const correctionY = -lateralErrY * (0.85 + control.lateral * 1.35) - seq.lateralVel.y * (1.15 + control.lateral * 1.8);
    seq.lateralVel.x += (correctionX + windTargetX * 0.8) * dt;
    seq.lateralVel.y += (correctionY + windTargetY * 0.8) * dt;
    const chuteBoost = seq.parachuteDeployed ? (0.08 + pressureNorm * 0.2) * (seq.realism?.chuteDrag ?? 1) : 0;
    const dynamicDragBoost = THREE.MathUtils.clamp(seq.dynamicPressure * 0.012, 0, 0.44);
    const runtimeDrag = THREE.MathUtils.clamp(seq.dragCoefficient + chuteBoost + dynamicDragBoost, 0.0018, 0.92);
    const lateralDamping = Math.max(
      0,
      1 - dt * (0.2 + runtimeDrag * 0.42 + control.lateral * 0.26 + (seq.stage === "touchdown" ? 0.95 : 0))
    );
    seq.lateralVel.multiplyScalar(lateralDamping);
    seq.lateralOffset.addScaledVector(seq.lateralVel, dt);

    const offsetLen = seq.lateralOffset.length();
    if (offsetLen > maxCorridor) {
      seq.lateralOffset.multiplyScalar(maxCorridor / offsetLen);
      seq.lateralVel.multiplyScalar(0.62);
    }
    seq.correction = THREE.MathUtils.clamp(offsetLen / Math.max(0.0001, maxCorridor), 0, 1);

    const prevVerticalSpeed = seq.verticalSpeed;
    seq.verticalSpeed += seq.gravityScene * dt;
    seq.verticalSpeed -= seq.maxThrust * seq.thruster * dt;
    const verticalDamping = Math.max(0.36, 1 - runtimeDrag * (0.18 + pressureNorm * 0.14) * dt);
    seq.verticalSpeed *= verticalDamping;
    const maxRise = seq.maxSink * 0.42;
    seq.verticalSpeed = THREE.MathUtils.clamp(seq.verticalSpeed, -maxRise, seq.maxSink * 1.2);
    const verticalAccel = Math.abs(seq.verticalSpeed - prevVerticalSpeed) / Math.max(0.0001, dt);
    seq.currentG = THREE.MathUtils.clamp(
      1 + verticalAccel / Math.max(0.0001, seq.gravityScene * 0.9) + seq.dynamicPressure * 0.02,
      0.8,
      8.4
    );
    seq.peakG = Math.max(seq.peakG, seq.currentG);

    if (seq.stage === "hover" || seq.stage === "touchdown") {
      const hoverBrake = Math.max(0, 1 - dt * (1.2 + seq.thruster * 1.8) * (seq.profile?.hoverBrakeMul ?? 1));
      seq.verticalSpeed *= hoverBrake;
    }

    const preStepSpeed = seq.verticalSpeed;
    seq.currentDist = Math.max(seq.targetDist, seq.currentDist - seq.verticalSpeed * dt);
    if (seq.currentDist <= seq.targetDist + 0.0006 && preStepSpeed > 0) {
      seq.impactSpeed = Math.max(seq.impactSpeed, preStepSpeed);
      seq.verticalSpeed *= 0.22;
      seq.lateralVel.multiplyScalar(0.5);
    }

    const visualLateralGain = immersion.enabled ? 0.48 : 0.36;
    camera.position.copy(target)
      .addScaledVector(seq.dir, seq.currentDist)
      .addScaledVector(seq.tangentA, seq.lateralOffset.x * visualLateralGain)
      .addScaledVector(seq.tangentB, seq.lateralOffset.y * visualLateralGain);
    enforceSurfaceClearance(0.013);

    const softMul = (seq.profile?.touchdownSoftness ?? 1) * (seq.realism?.touchdownTolerance ?? 1);
    const settleAltitude = Math.max(0.0009, seq.radius * 0.00045 * softMul);
    const settleSink = Math.max(0.0022, seq.radius * 0.00075 * softMul);
    const settleOffset = Math.max(0.0015, seq.radius * 0.0024 * softMul);
    const settled = alt <= settleAltitude
      && Math.abs(seq.verticalSpeed) <= settleSink
      && seq.lateralOffset.length() <= settleOffset
      && seq.stage === "touchdown";
    if (settled) {
      const touchdownIntensity = THREE.MathUtils.clamp(
        (seq.impactSpeed / Math.max(0.0001, seq.maxSink * 0.7)) * (1.1 - Math.min(0.5, (softMul - 1) * 0.4)),
        0.25,
        1.45
      );
      const impactPenalty = THREE.MathUtils.clamp(seq.impactSpeed / Math.max(0.0001, seq.maxSink) * 54, 0, 54);
      const lateralPenalty = THREE.MathUtils.clamp(seq.correction * 22, 0, 22);
      const heatPenalty = THREE.MathUtils.clamp(seq.peakHeatLoad * 18, 0, 18);
      const gPenalty = THREE.MathUtils.clamp((seq.peakG - 1) * 8, 0, 16);
      seq.touchdownScore = Math.round(THREE.MathUtils.clamp(100 - impactPenalty - lateralPenalty - heatPenalty - gPenalty, 0, 100));
      seq.active = false;
      seq.stage = "landed";
      seq.thruster = 0;
      seq.verticalSpeed = 0;
      seq.targetSink = 0;
      seq.correction = 0;
      seq.etaSec = 0;
      controls.enableRotate = true;
      if (audio.enabled) triggerLandingPulse(touchdownIntensity);
    }
    seq.telemetryTick += dt;
    if (seq.telemetryTick > 0.24) {
      seq.telemetryTick = 0;
      updateExplorerInfo(surface.targetId);
    }
  };

  const applySurfaceDistance = () => {
    if (!surface.active || !surface.targetId || eva.active) return;
    const radius = getEntityRadius(surface.targetId);
    const mult = Number(ui.surfaceAltitudeRange.value);
    const mode = getEnvMode(surface.targetId);
    const minMul = mode === "gas_storm" || mode === "gas_ice_storm" ? 1.12 : 1.01;
    const dist = Math.max(radius * minMul, radius * mult);
    const target = getEntityPosition(surface.targetId);
    const dir = camera.position.clone().sub(target);
    if (dir.lengthSq() < 0.0001) dir.set(0.3, 0.22, 1);
    dir.normalize();
    camera.position.copy(target.clone().add(dir.multiplyScalar(dist)));
    controls.minDistance = radius * 1.02;
    controls.maxDistance = Math.max(radius * 6.2, dist * 1.5);
    enforceSurfaceClearance(0.012);
    updateSurfaceAltitudeLabel();
  };

  const enterSurfaceMode = (id) => {
    if (!isSurfaceLandable(id)) {
      ui.explorerInfo.innerHTML = "وضع السطح متاح للكواكب والأقمار فقط. اختر هدفًا مناسبًا.";
      return;
    }
    if (eva.active) exitEvaMode();
    surface.active = true;
    surface.targetId = id;
    surface.traverseMode = false;
    explorerTargetId = id;
    selected = getEntityById(id) || selected;
    followId = id;
    flight.active = false;
    surface.lastTarget.copy(getEntityPosition(id));
    surface.terrainSampler = terrainRuntime.get(id)?.sampler || null;
    controls.enablePan = false;
    const radius = getEntityRadius(id);
    controls.minDistance = radius * 1.02;
    controls.maxDistance = Math.max(radius * 6.5, radius * 2.8);
    applySurfaceTargetLod(id);
    updateSurfaceAltitudeLabel();
    startSurfaceLandingSequence();
    createSurfaceEnvironment(id);
    createSurfaceAtmosphere(id);
    setCameraState();
    setSurfaceButtonsState();
    syncTraverseUi();
    updateExplorerInfo(id);
    immersion.lastAltitudeR = null;
    immersion.descentRps = 0;
    immersion.lastDescentRps = 0;
    immersion.gForce = 1;
    immersion.landingPulseLock = 0;
    surface.entryStabilizer = 1;
    eva.yaw = 0;
    eva.pitch = 0;
    surface.skyAssist = 0;
    syncWalkUi();
    setSkyStatus("SKY: READY");
    if (immersion.enabled) ui.vrTelemetry.style.opacity = "1";
    if (selected) updateInfo(selected);
  };

  const exitSurfaceMode = () => {
    if (!surface.active) return;
    if (surface.traverseMode) setSurfaceTraverseMode(false);
    exitEvaMode();
    surface.active = false;
    surface.targetId = null;
    surface.traverseMode = false;
    surface.lastTarget.set(0, 0, 0);
    restoreSurfaceTargetLod();
    clearSurfaceEnvironment();
    clearSurfaceAtmosphere();
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.minDistance = surface.baseMinDistance;
    controls.maxDistance = surface.baseMaxDistance;
    setSurfaceButtonsState();
    setCameraState();
    updateExplorerInfo(explorerTargetId);
    immersion.lastAltitudeR = null;
    immersion.descentRps = 0;
    immersion.lastDescentRps = 0;
    immersion.gForce = 1;
    surface.entryStabilizer = 0;
    if (immersion.enabled) {
      ui.vrFx.style.opacity = "0";
      ui.vrTelemetry.style.opacity = "0";
    }
    syncWalkUi();
    syncTraverseUi();
    setSkyStatus("SKY: ORBIT MODE");
  };

  const getCurrentClimate = (id) => {
    const base = climateProfiles[id] || { tempC: -80, pressureBar: 0, windKmh: 0, note: "لا توجد بيانات." };
    return {
      ...base,
      tempC: base.tempC + climateAdjust.tempOffset,
      pressureBar: Math.max(0, base.pressureBar * climateAdjust.pressure),
      windKmh: Math.max(0, base.windKmh * climateAdjust.wind)
    };
  };

  const updateClimateLabels = () => {
    ui.tempOffsetValue.textContent = `${climateAdjust.tempOffset.toFixed(0)}°`;
    ui.pressureValue.textContent = `${climateAdjust.pressure.toFixed(2)}x`;
    ui.windValue.textContent = `${climateAdjust.wind.toFixed(2)}x`;
  };

  const updateExplorerInfo = (id = explorerTargetId) => {
    const entity = getEntityById(id);
    if (!entity) {
      ui.explorerInfo.textContent = "اختر جرمًا صالحًا للاستكشاف.";
      return;
    }
    const climate = getCurrentClimate(id);
    const geo = geoProfiles[id] || null;
    const envMode = getEnvMode(id);
    const hasAtmo = (
      climate.pressureBar > 0.0005
      || envMode === "gas_storm"
      || envMode === "gas_ice_storm"
      || envMode === "titan_haze"
      || envMode === "rocky_dense"
      || envMode === "rocky_sky"
      || envMode === "rocky_dust"
      || envMode === "dwarf_ice"
    );
    const modeText = surface.active && surface.targetId === id
      ? "Surface/Atmospheric Mode"
      : (hasAtmo ? "Orbit Mode + Atmospheric Rim" : "Orbit Mode");
    const terrainMode = geo ? (geo.solid ? "Solid terrain landing" : "Atmospheric dive only") : "Unknown mode";
    const terrainLine = geo
      ? `Relief: ~${geo.reliefKm.toFixed(1)} km | gravity: ${geo.gravity.toFixed(2)} m/s2`
      : "Relief: N/A";
    const landmarkLine = geo?.landmark ? `Landmark focus: ${geo.landmark}` : "Landmark focus: N/A";
    const opticalDepth = getSurfaceOpticalDepth(id, climate);
    const skyLine = canSurfaceSkyShowNearbyBodies(id)
      ? `Sky visibility model: thin-to-clear | optical depth=${opticalDepth.toFixed(2)}`
      : `Sky visibility model: dense-occluded | optical depth=${opticalDepth.toFixed(2)}`;
    const atmoPhaseLine = !hasAtmo
      ? "Atmosphere phase: none"
      : (
        surface.active && surface.targetId === id
          ? "Atmosphere phase: entry/inside atmosphere (full scattering active)"
          : "Atmosphere phase: orbital limb view from space"
      );
    const evaLine = canUseEva(id)
      ? "EVA: First-person walk enabled"
      : "EVA: unavailable (no solid walkable surface)";
    const seq = surface.active && surface.targetId === id ? surface.landingSequence : null;
    let surfacePositionLine = "";
    if (surface.active && surface.targetId === id) {
      const targetPos = getEntityPosition(id);
      const dir = surface.traverseMode
        ? surface.traverseDir.clone()
        : camera.position.clone().sub(targetPos);
      if (dir.lengthSq() < 0.000001) dir.set(0, 1, 0);
      dir.normalize();
      const geoPos = getGeoFromDirection(dir);
      const navTag = surface.traverseMode ? "GLOBAL TRAVERSE" : "LANDER";
      surfacePositionLine = `الإحداثيات: LAT ${geoPos.lat.toFixed(2)}° | LON ${geoPos.lon.toFixed(2)}° | ${navTag}`;
    }
    const descentLine = seq?.active
      ? `Descent: ${getLandingStageLabel(seq.stage)} | sink=${seq.verticalSpeed.toFixed(3)} u/s | target=${seq.targetSink.toFixed(3)} u/s | thruster=${Math.round(seq.thruster * 100)}% | correction=${Math.round(seq.correction * 100)}% | ETA=${seq.etaSec.toFixed(1)}s | profile=${seq.profileTag} | model=${seq.realismLabel} | Q=${seq.dynamicPressure.toFixed(2)} | heat=${seq.heatLoad.toFixed(2)} | G=${seq.currentG.toFixed(2)}g`
      : (seq?.stage === "landed"
        ? `Descent: landed and stabilized | score=${seq.touchdownScore ?? "--"}/100 | peakG=${seq.peakG?.toFixed(2) ?? "--"}g | maxQ=${seq.maxDynamicPressure?.toFixed(2) ?? "--"} | peakHeat=${seq.peakHeatLoad?.toFixed(2) ?? "--"} | model=${seq.realismLabel || getLandingRealismModel().label}`
        : `Descent: stabilized | model=${getLandingRealismModel().label}`);
    const surfaceNote =
      envMode === "gas_storm" || envMode === "gas_ice_storm"
        ? "ملاحظة هامة: لا يوجد سطح صلب، التجربة هنا هبوط داخل الغلاف العاصف."
        : climate.note || "بدون ملاحظة.";
    const dynamicAtmoNote = hasAtmo
      ? (
        surface.active && surface.targetId === id
          ? "أنت الآن داخل طبقات الغلاف الجوي (تشتت/ضباب/تأثيرات دخول فعالة)."
          : "من المدار يظهر توهج الحافة الجوية؛ التأثيرات الداخلية تتفعل بعد الدخول."
      )
      : "";
    ui.explorerInfo.innerHTML =
      `Landing profile: ${terrainMode}<br />` +
      `${terrainLine}<br />` +
      `${landmarkLine}<br />` +
      `${skyLine}<br />` +
      `${atmoPhaseLine}<br />` +
      `${evaLine}<br />` +
      `${descentLine}<br />` +
      (surfacePositionLine ? `${surfacePositionLine}<br />` : "") +
      `<strong>وضع الاستكشاف: ${entity.name}</strong><br />` +
      `النمط: ${modeText}<br />` +
      `النوع: ${entity.type}<br />` +
      `حرارة السطح/الطبقة: ${climate.tempC.toFixed(1)}°C<br />` +
      `الضغط: ${climate.pressureBar.toFixed(3)} bar<br />` +
      `الرياح: ${climate.windKmh.toFixed(0)} كم/س<br />` +
      `ملحوظة: ${surfaceNote}${dynamicAtmoNote ? ` ${dynamicAtmoNote}` : ""}`;
  };

  const applyClimatePreset = (name) => {
    if (name === "calm") {
      climateAdjust.tempOffset = 0;
      climateAdjust.pressure = 1;
      climateAdjust.wind = 1;
    } else if (name === "storm") {
      climateAdjust.tempOffset = 12;
      climateAdjust.pressure = 1.35;
      climateAdjust.wind = 2.8;
    } else if (name === "freeze") {
      climateAdjust.tempOffset = -120;
      climateAdjust.pressure = 0.85;
      climateAdjust.wind = 0.7;
    } else if (name === "heat") {
      climateAdjust.tempOffset = 140;
      climateAdjust.pressure = 1.15;
      climateAdjust.wind = 1.4;
    }
    ui.tempOffsetRange.value = String(climateAdjust.tempOffset);
    ui.pressureRange.value = climateAdjust.pressure.toFixed(2);
    ui.windRange.value = climateAdjust.wind.toFixed(2);
    updateClimateLabels();
    updateExplorerInfo();
    if (surface.active && surface.targetId) createSurfaceAtmosphere(surface.targetId);
    if (selected) updateInfo(selected);
    updateAudioFromSimulation();
  };

  const beginExploreFlight = (id) => {
    if (surface.active) exitSurfaceMode();
    const radius = getEntityRadius(id);
    const targetDistance = Math.max(14, Math.min(340, radius * 20 + 22));
    explorerTargetId = id;
    selected = getEntityById(id) || selected;
    followId = id;
    flight.active = true;
    flight.targetId = id;
    flight.distance = targetDistance;
    flight.smooth = 0.05;
    setCameraState();
    setFocusValue(id);
    updateExplorerInfo(id);
    renderScienceSources(id);
    if (selected) updateInfo(selected);
  };

  const createImpulseResponse = (ctx, seconds, decay, brightness = 0.5) => {
    const len = Math.max(32, Math.floor(ctx.sampleRate * seconds));
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch += 1) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < len; i += 1) {
        const t = i / len;
        const env = Math.pow(1 - t, decay);
        const white = Math.random() * 2 - 1;
        const shimmer = Math.sin((i / ctx.sampleRate) * (180 + brightness * 620 + ch * 31)) * 0.16;
        data[i] = (white * (0.62 + brightness * 0.3) + shimmer) * env;
      }
    }
    return impulse;
  };

  const getImpulseKey = (acousticClass, mode, pressureBar) => {
    const map = {
      vacuum: "vacuum",
      mars_thin: "thin",
      earthlike: "habitable",
      dense_atmo: "dense",
      titan_dense: "dense",
      gas_storm: "gas",
      ice_giant: "ice",
      dwarf_ice: "ice"
    };
    let key = map[acousticClass] || "vacuum";
    if (mode === "realism" && pressureBar > 8) key = "dense";
    return key;
  };

  const planetAudioSignatures = PLANET_AUDIO_SIGNATURES;

  const loadAudioBuffer = async (ctx, url) => {
    try {
      const res = await fetch(url, { cache: "force-cache" });
      if (!res.ok) return null;
      const ab = await res.arrayBuffer();
      return await ctx.decodeAudioData(ab);
    } catch {
      return null;
    }
  };

  const startBufferedLoop = (ctx, buffer, gain) => {
    if (!ctx || !buffer || !gain) return null;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(gain);
    src.start();
    return src;
  };

  const ensureAudio = async () => {
    if (audio.ctx) return true;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      setAudioStatus("المتصفح لا يدعم WebAudio");
      return false;
    }

    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 20;
    comp.ratio.value = 5;
    comp.attack.value = 0.01;
    comp.release.value = 0.28;
    const dryGain = ctx.createGain();
    dryGain.gain.value = 1;
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.08;
    const convolver = ctx.createConvolver();
    const envFilter = ctx.createBiquadFilter();
    envFilter.type = "lowpass";
    envFilter.frequency.value = 18000;
    envFilter.Q.value = 0.4;
    const stereoPan = ctx.createStereoPanner();
    stereoPan.pan.value = 0;
    const impulseBank = {
      vacuum: createImpulseResponse(ctx, 0.22, 1.2, 0.2),
      thin: createImpulseResponse(ctx, 0.66, 1.7, 0.42),
      habitable: createImpulseResponse(ctx, 1.2, 2.4, 0.62),
      dense: createImpulseResponse(ctx, 1.9, 3.0, 0.46),
      gas: createImpulseResponse(ctx, 2.3, 3.4, 0.35),
      ice: createImpulseResponse(ctx, 1.5, 2.8, 0.76)
    };
    convolver.buffer = impulseBank.vacuum;

    master.connect(stereoPan);
    stereoPan.connect(envFilter);
    envFilter.connect(dryGain);
    envFilter.connect(convolver);
    convolver.connect(wetGain);
    dryGain.connect(comp);
    wetGain.connect(comp);
    comp.connect(ctx.destination);

    const bedGain = ctx.createGain();
    bedGain.gain.value = 0.35;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.28;
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.2;
    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.18;
    const sampleMaster = ctx.createGain();
    sampleMaster.gain.value = 0.54;
    const marsMicGain = ctx.createGain();
    marsMicGain.gain.value = 0;
    const marsWindGain = ctx.createGain();
    marsWindGain.gain.value = 0;
    const marsRotorGain = ctx.createGain();
    marsRotorGain.gain.value = 0;
    const hissFilter = ctx.createBiquadFilter();
    hissFilter.type = "highpass";
    hissFilter.frequency.value = 1600;
    hissFilter.Q.value = 0.4;
    const hissGain = ctx.createGain();
    hissGain.gain.value = 0.03;
    const resonanceOsc = ctx.createOscillator();
    resonanceOsc.type = "sine";
    resonanceOsc.frequency.value = 126;
    const resonanceGain = ctx.createGain();
    resonanceGain.gain.value = 0.0001;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 620;
    noiseFilter.Q.value = 0.8;
    const cinemaFilter = ctx.createBiquadFilter();
    cinemaFilter.type = "bandpass";
    cinemaFilter.frequency.value = 240;
    cinemaFilter.Q.value = 0.6;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.value = 420;
    windFilter.Q.value = 0.7;
    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = "lowpass";
    rumbleFilter.frequency.value = 118;
    rumbleFilter.Q.value = 0.5;
    const cinemaGain = ctx.createGain();
    cinemaGain.gain.value = 0.0;

    const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.82;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const oscA = ctx.createOscillator();
    oscA.type = "sine";
    oscA.frequency.value = 58;
    const oscB = ctx.createOscillator();
    oscB.type = "triangle";
    oscB.frequency.value = 87;
    const rumbleOsc = ctx.createOscillator();
    rumbleOsc.type = "sawtooth";
    rumbleOsc.frequency.value = 32;
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.16;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 18;
    const cinemaLfo = ctx.createOscillator();
    cinemaLfo.type = "sine";
    cinemaLfo.frequency.value = 0.05;
    const cinemaLfoGain = ctx.createGain();
    cinemaLfoGain.gain.value = 32;

    lfo.connect(lfoGain);
    lfoGain.connect(noiseFilter.frequency);
    cinemaLfo.connect(cinemaLfoGain);
    cinemaLfoGain.connect(cinemaFilter.frequency);

    src.connect(noiseFilter);
    src.connect(windFilter);
    src.connect(rumbleFilter);
    src.connect(cinemaFilter);
    src.connect(hissFilter);
    noiseFilter.connect(bedGain);
    windFilter.connect(windGain);
    rumbleFilter.connect(rumbleGain);
    cinemaFilter.connect(cinemaGain);
    hissFilter.connect(hissGain);
    cinemaGain.connect(master);
    hissGain.connect(master);
    bedGain.connect(master);
    windGain.connect(master);
    rumbleGain.connect(master);
    marsMicGain.connect(sampleMaster);
    marsWindGain.connect(sampleMaster);
    marsRotorGain.connect(sampleMaster);
    sampleMaster.connect(master);

    oscA.connect(oscGain);
    oscB.connect(oscGain);
    rumbleOsc.connect(rumbleGain);
    oscGain.connect(master);
    resonanceOsc.connect(resonanceGain);
    resonanceGain.connect(master);

    src.start();
    oscA.start();
    oscB.start();
    rumbleOsc.start();
    resonanceOsc.start();
    lfo.start();
    cinemaLfo.start();

    const [marsMicBuf, marsWindBuf, marsRotorBuf] = await Promise.all([
      loadAudioBuffer(ctx, nasaAudioSamples.marsMic),
      loadAudioBuffer(ctx, nasaAudioSamples.marsWind),
      loadAudioBuffer(ctx, nasaAudioSamples.marsRotor)
    ]);
    const marsMicSrc = startBufferedLoop(ctx, marsMicBuf, marsMicGain);
    const marsWindSrc = startBufferedLoop(ctx, marsWindBuf, marsWindGain);
    const marsRotorSrc = startBufferedLoop(ctx, marsRotorBuf, marsRotorGain);

    audio.ctx = ctx;
    audio.master = master;
    audio.comp = comp;
    audio.dryGain = dryGain;
    audio.wetGain = wetGain;
    audio.convolver = convolver;
    audio.envFilter = envFilter;
    audio.stereoPan = stereoPan;
    audio.impulseBank = impulseBank;
    audio.impulseKey = "vacuum";
    audio.hissFilter = hissFilter;
    audio.hissGain = hissGain;
    audio.resonanceOsc = resonanceOsc;
    audio.resonanceGain = resonanceGain;
    audio.bedGain = bedGain;
    audio.windGain = windGain;
    audio.rumbleGain = rumbleGain;
    audio.oscGain = oscGain;
    audio.noiseFilter = noiseFilter;
    audio.windFilter = windFilter;
    audio.rumbleFilter = rumbleFilter;
    audio.cinemaFilter = cinemaFilter;
    audio.cinemaGain = cinemaGain;
    audio.cinemaLfo = cinemaLfo;
    audio.cinemaLfoGain = cinemaLfoGain;
    audio.lfo = lfo;
    audio.lfoGain = lfoGain;
    audio.source = src;
    audio.oscA = oscA;
    audio.oscB = oscB;
    audio.rumbleOsc = rumbleOsc;
    audio.sampleMaster = sampleMaster;
    audio.marsMicGain = marsMicGain;
    audio.marsWindGain = marsWindGain;
    audio.marsRotorGain = marsRotorGain;
    audio.marsMicSrc = marsMicSrc;
    audio.marsWindSrc = marsWindSrc;
    audio.marsRotorSrc = marsRotorSrc;
    audio.sampleBuffers = { marsMicBuf, marsWindBuf, marsRotorBuf };
    setAudioStatus("جاهز للصوت - اضغط أي مكان");
    return true;
  };

  const triggerLandingPulse = (strength = 1) => {
    if (!audio.ctx || !audio.enabled || !audio.master) return;
    const now = audio.ctx.currentTime;
    const gain = audio.ctx.createGain();
    const osc = audio.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.33);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08 * Math.min(1.2, Math.max(0.25, strength)), now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start(now);
    osc.stop(now + 0.38);
  };

  const triggerAcousticCrackle = (strength = 1, icy = false) => {
    if (!audio.ctx || !audio.enabled || !audio.master) return;
    const now = audio.ctx.currentTime;
    const dur = icy ? 0.08 : 0.11;
    const frameCount = Math.floor(audio.ctx.sampleRate * dur);
    const buf = audio.ctx.createBuffer(1, frameCount, audio.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frameCount; i += 1) {
      const env = 1 - i / frameCount;
      data[i] = (Math.random() * 2 - 1) * env * (icy ? 0.6 : 0.85);
    }
    const src = audio.ctx.createBufferSource();
    src.buffer = buf;
    const filt = audio.ctx.createBiquadFilter();
    filt.type = icy ? "highpass" : "bandpass";
    filt.frequency.value = icy ? 1800 : 720;
    filt.Q.value = icy ? 0.9 : 1.4;
    const g = audio.ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.11 * Math.min(1.6, Math.max(0.25, strength)), now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(filt);
    filt.connect(g);
    g.connect(audio.master);
    src.start(now);
    src.stop(now + dur + 0.02);
  };

  const updateAudioFromSimulation = () => {
    if (!audio.ctx || !audio.enabled) return;
    const targetId = surface.active && surface.targetId ? surface.targetId : explorerTargetId;
    const climate = getCurrentClimate(targetId);
    const acousticClass = getAcousticClass(targetId);
    const now = audio.ctx.currentTime;
    const mode = ui.audioMode.value;

    const presetMap = {
      vacuum: { base: 38, bed: 0.05, osc: 0.07, wind: 0.01, rumble: 0.07, hf: 260, plasma: 0.16, cinema: 0.16, wet: 0.02, cutoff: 17800 },
      mars_thin: { base: 48, bed: 0.14, osc: 0.1, wind: 0.18, rumble: 0.09, hf: 420, plasma: 0.08, cinema: 0.18, wet: 0.08, cutoff: 6900 },
      earthlike: { base: 56, bed: 0.2, osc: 0.13, wind: 0.22, rumble: 0.1, hf: 840, plasma: 0.08, cinema: 0.16, wet: 0.16, cutoff: 8200 },
      dense_atmo: { base: 44, bed: 0.24, osc: 0.11, wind: 0.28, rumble: 0.15, hf: 520, plasma: 0.05, cinema: 0.2, wet: 0.24, cutoff: 5200 },
      titan_dense: { base: 41, bed: 0.2, osc: 0.1, wind: 0.2, rumble: 0.11, hf: 360, plasma: 0.07, cinema: 0.22, wet: 0.3, cutoff: 3900 },
      gas_storm: { base: 37, bed: 0.28, osc: 0.2, wind: 0.34, rumble: 0.28, hf: 300, plasma: 0.32, cinema: 0.24, wet: 0.28, cutoff: 3500 },
      ice_giant: { base: 35, bed: 0.24, osc: 0.19, wind: 0.3, rumble: 0.23, hf: 280, plasma: 0.36, cinema: 0.22, wet: 0.25, cutoff: 4200 },
      dwarf_ice: { base: 34, bed: 0.09, osc: 0.09, wind: 0.12, rumble: 0.11, hf: 340, plasma: 0.12, cinema: 0.14, wet: 0.14, cutoff: 5600 }
    };

    const p = presetMap[acousticClass] || presetMap.vacuum;
    let base = p.base;
    let bed = p.bed;
    let osc = p.osc;
    let cinema = p.cinema;
    let wet = p.wet;
    let cutoff = p.cutoff;
    if (mode === "deep") {
      base *= 0.8;
      bed *= 1.18;
      osc *= 0.74;
      cinema *= 0.6;
      wet *= 1.14;
      cutoff *= 0.86;
    } else if (mode === "nasa") {
      base *= 0.9;
      bed *= 1.06;
      osc *= 0.82;
      cinema *= 0.7;
      wet *= 1.06;
    } else if (mode === "orbital") {
      base *= 1.22;
      bed *= 0.86;
      osc *= 1.2;
      cinema *= 0.4;
      wet *= 0.72;
      cutoff *= 1.18;
    } else if (mode === "cinematic") {
      base *= 1.05;
      bed *= 1.08;
      osc *= 1.02;
      cinema *= 1.4;
      wet *= 0.95;
    } else if (mode === "realism") {
      base *= 0.84;
      bed *= 0.98;
      osc *= 0.55;
      cinema *= 0.32;
      wet *= 1.34;
      cutoff *= 0.8;
    }

    const signature = planetAudioSignatures[targetId] || planetAudioSignatures.default;
    base *= signature.baseMul;
    bed *= signature.bedMul;
    osc *= signature.oscMul;
    wet *= signature.wetMul;
    cutoff *= signature.cutoffMul;

    const windFactor = Math.min(3.6, 1 + climate.windKmh / 780);
    const tempFactor = Math.max(0.68, Math.min(2.6, 1 + climate.tempC / 720));
    const pressureFactor = Math.max(0.35, Math.min(3.1, 1 + climate.pressureBar / 25));
    const altitudeFactor = surface.active ? Math.max(0, Math.min(1.45, 1.35 - immersion.altitudeR * 1.2)) : 0.05;
    const descentFactor = Math.min(2.1, Math.abs(immersion.descentRps) * 7.5);
    const turbulence = Math.min(2.6, immersion.turbulence * 3.4 + descentFactor * 0.5);
    const plasmaFactor = p.plasma * (surface.active ? 1.22 : 1);
    const seq = surface.active ? surface.landingSequence : null;
    const thrusterFactor = seq?.active ? seq.thruster : 0;
    const rcsFactor = seq?.active ? seq.correction : 0;
    const stageAudioMul = seq?.active
      ? (
        seq.stage === "entry" ? 0.66
          : seq.stage === "retro" ? 0.82
            : seq.stage === "approach" ? 1
              : seq.stage === "flare" ? 1.16
                : seq.stage === "hover" ? 1.22
                  : 1.08
      )
      : 0.38;
    const landingEnergy = THREE.MathUtils.clamp(thrusterFactor * stageAudioMul + rcsFactor * 0.34, 0, 1.8);

    if (audio.convolver && audio.impulseBank) {
      const nextImpulseKey = getImpulseKey(acousticClass, mode, climate.pressureBar);
      if (audio.impulseKey !== nextImpulseKey && audio.impulseBank[nextImpulseKey]) {
        audio.convolver.buffer = audio.impulseBank[nextImpulseKey];
        audio.impulseKey = nextImpulseKey;
      }
    }
    if (audio.wetGain) {
      const wetTarget = THREE.MathUtils.clamp(
        wet * (surface.active ? 1.18 : 0.82) * (immersion.enabled ? 1.08 : 1) + turbulence * 0.015 + landingEnergy * 0.02,
        0.02,
        0.65
      );
      audio.wetGain.gain.setTargetAtTime(wetTarget, now, 0.2);
    }
    if (audio.dryGain) {
      const dryTarget = THREE.MathUtils.clamp(1 - wet * 0.45, 0.52, 1);
      audio.dryGain.gain.setTargetAtTime(dryTarget, now, 0.2);
    }
    if (audio.envFilter) {
      const envCutoff = THREE.MathUtils.clamp(cutoff + windFactor * 260 + pressureFactor * 96 + turbulence * 120, 1300, 18000);
      audio.envFilter.frequency.setTargetAtTime(envCutoff, now, 0.18);
    }
    if (audio.stereoPan) {
      const panRange = Math.min(0.36, 0.04 + turbulence * 0.14 + rcsFactor * 0.06 + (immersion.enabled ? 0.06 : 0));
      const panValue = Math.sin(now * 0.43 + immersion.phase * 0.25) * panRange;
      audio.stereoPan.pan.setTargetAtTime(panValue, now, 0.2);
    }
    if (audio.hissFilter && audio.hissGain) {
      const hissCut = THREE.MathUtils.clamp(1100 + windFactor * 900 + pressureFactor * 240 + landingEnergy * 380, 900, 5600);
      audio.hissFilter.frequency.setTargetAtTime(hissCut, now, 0.18);
      const hissAmt = THREE.MathUtils.clamp(
        0.01 + 0.02 * signature.hissMul + windFactor * 0.012 + turbulence * 0.008 + landingEnergy * 0.018,
        0.004,
        0.18
      );
      audio.hissGain.gain.setTargetAtTime(hissAmt, now, 0.16);
    }
    if (audio.resonanceOsc && audio.resonanceGain) {
      const resHz = THREE.MathUtils.clamp(
        signature.resonanceHz * (0.8 + tempFactor * 0.25 + pressureFactor * 0.08),
        38,
        380
      );
      const resGain = THREE.MathUtils.clamp(
        signature.resonanceGain * (0.65 + pressureFactor * 0.34 + turbulence * 0.14 + landingEnergy * 0.3),
        0.0002,
        0.22
      );
      audio.resonanceOsc.frequency.setTargetAtTime(resHz, now, 0.18);
      audio.resonanceGain.gain.setTargetAtTime(resGain, now, 0.22);
    }

    audio.noiseFilter.frequency.setTargetAtTime(p.hf + windFactor * 330 + altitudeFactor * 210, now, 0.11);
    audio.windFilter.frequency.setTargetAtTime(220 + windFactor * 520 + turbulence * 95, now, 0.11);
    audio.rumbleFilter.frequency.setTargetAtTime(62 + pressureFactor * 76 + descentFactor * 52 + landingEnergy * 86, now, 0.11);
    audio.oscA.frequency.setTargetAtTime(base * tempFactor * (1 + thrusterFactor * 0.08), now, 0.12);
    audio.oscB.frequency.setTargetAtTime(base * (1.42 + plasmaFactor) * pressureFactor * (1 + thrusterFactor * 0.15), now, 0.12);
    audio.rumbleOsc.frequency.setTargetAtTime(23 + altitudeFactor * 14 + descentFactor * 24 + landingEnergy * 18, now, 0.12);

    audio.bedGain.gain.setTargetAtTime(bed * (0.7 + altitudeFactor * 0.5 + landingEnergy * 0.08), now, 0.12);
    audio.windGain.gain.setTargetAtTime((p.wind * signature.windMul) * windFactor + 0.1 * turbulence + rcsFactor * 0.07, now, 0.12);
    audio.rumbleGain.gain.setTargetAtTime(
      (p.rumble * signature.rumbleMul) * pressureFactor + 0.09 * descentFactor + landingEnergy * 0.18,
      now,
      0.12
    );
    audio.oscGain.gain.setTargetAtTime(osc * pressureFactor * (0.7 + plasmaFactor + thrusterFactor * 0.2), now, 0.12);
    if (audio.cinemaGain) {
      const cinemaBoost = (surface.active ? 1.1 : 0.9) * (immersion.enabled ? 1.2 : 1);
      audio.cinemaGain.gain.setTargetAtTime(cinema * cinemaBoost, now, 0.2);
    }

    const nasaBoost = mode === "nasa" ? 1.32 : 1;
    const marsFocus = targetId === "mars" ? (surface.active ? 1 : 0.55) * nasaBoost : 0;
    const rotorKick = targetId === "mars"
      ? Math.min(1.2, descentFactor * 0.7 + Math.abs(immersion.descentRps) * 1.4 + landingEnergy * 0.36)
      : 0;
    if (audio.sampleMaster) {
      audio.sampleMaster.gain.setTargetAtTime(0.45 + (surface.active ? 0.1 : 0), now, 0.18);
    }
    if (audio.marsMicGain) {
      audio.marsMicGain.gain.setTargetAtTime(0.14 * marsFocus * (0.7 + altitudeFactor * 0.45), now, 0.18);
    }
    if (audio.marsWindGain) {
      audio.marsWindGain.gain.setTargetAtTime(0.22 * marsFocus * Math.min(1.35, windFactor * 0.62), now, 0.18);
    }
    if (audio.marsRotorGain) {
      audio.marsRotorGain.gain.setTargetAtTime(0.12 * marsFocus * rotorKick, now, 0.14);
    }
    if (audio.marsMicSrc?.playbackRate) {
      const rate = THREE.MathUtils.clamp(0.9 + pressureFactor * 0.02 + turbulence * 0.01, 0.82, 1.25);
      audio.marsMicSrc.playbackRate.setTargetAtTime(rate, now, 0.2);
    }
    if (audio.marsWindSrc?.playbackRate) {
      const rate = THREE.MathUtils.clamp(0.92 + windFactor * 0.05 + turbulence * 0.02, 0.8, 1.4);
      audio.marsWindSrc.playbackRate.setTargetAtTime(rate, now, 0.2);
    }
    if (audio.marsRotorSrc?.playbackRate) {
      const rate = THREE.MathUtils.clamp(0.9 + rotorKick * 0.22 + descentFactor * 0.06, 0.75, 1.45);
      audio.marsRotorSrc.playbackRate.setTargetAtTime(rate, now, 0.16);
    }

    const baseVol = Number(ui.audioVolume.value);
    const immersiveBoost = immersion.enabled && surface.active ? 1.14 : 1;
    audio.master.gain.setTargetAtTime(Math.min(1, baseVol * immersiveBoost), now, 0.18);
  };

  const setAudioEnabled = async (enabled) => {
    const ok = await ensureAudio();
    if (!ok || !audio.ctx) {
      ui.audioEnable.checked = false;
      setAudioStatus("الصوت غير متاح");
      return;
    }
    if (audio.ctx.state === "suspended") await audio.ctx.resume();
    audio.enabled = enabled;
    const v = Number(ui.audioVolume.value);
    const now = audio.ctx.currentTime;
    audio.master.gain.setTargetAtTime(enabled ? v : 0, now, 0.12);
    if (audio.cinemaGain) audio.cinemaGain.gain.setTargetAtTime(enabled ? audio.cinemaGain.gain.value : 0, now, 0.12);
    if (enabled) {
      setAudioStatus(`الصوت الغامر نشط (${ui.audioMode.value})`, true);
      updateAudioFromSimulation();
    } else {
      if (audio.marsMicGain) audio.marsMicGain.gain.setTargetAtTime(0, now, 0.08);
      if (audio.marsWindGain) audio.marsWindGain.gain.setTargetAtTime(0, now, 0.08);
      if (audio.marsRotorGain) audio.marsRotorGain.gain.setTargetAtTime(0, now, 0.08);
      setAudioStatus("الصوت متوقف");
    }
  };

  const armAudioUnlock = () => {
    const unlock = async () => {
      const ok = await ensureAudio();
      if (!ok || !audio.ctx) return;
      if (audio.ctx.state === "suspended") await audio.ctx.resume();
      if (ui.audioEnable.checked) {
        await setAudioEnabled(true);
      } else {
        setAudioStatus("الصوت جاهز - فعّل مفتاح الصوت");
      }
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
  };

  function buildStarfield() {
    const pos = new Float32Array(STAR_COUNT * 3);
    const col = new Float32Array(STAR_COUNT * 3);
    const c = new THREE.Color();
    const dir = new THREE.Vector3();
    const catalog = [...BRIGHT_STAR_CATALOG].sort((a, b) => a.mag - b.mag);
    let cursor = 0;

    catalog.forEach((s) => {
      if (cursor >= STAR_COUNT) return;
      getDirectionFromRaDec(s.ra, s.dec, dir);
      const magNorm = THREE.MathUtils.clamp((s.mag + 1.5) / 8, 0, 1);
      const radius = 1700 + magNorm * 2500 + (1 - magNorm) * 140;
      pos[cursor * 3] = dir.x * radius;
      pos[cursor * 3 + 1] = dir.y * radius;
      pos[cursor * 3 + 2] = dir.z * radius;
      getStarColorFromBv(s.bv, c);
      const brightness = THREE.MathUtils.clamp(1.28 - magNorm * 0.92, 0.28, 1.35);
      col[cursor * 3] = c.r * brightness;
      col[cursor * 3 + 1] = c.g * brightness;
      col[cursor * 3 + 2] = c.b * brightness;
      cursor += 1;
    });

    for (let i = cursor; i < STAR_COUNT; i += 1) {
      const seed = i - cursor + 1;
      const bandChance = hash01(seed, 11, 3);
      let lon;
      let lat;
      if (bandChance < 0.76) {
        lon = hash01(seed, 13, 5) * Math.PI * 2;
        lat = (hash01(seed, 17, 7) - 0.5) * 0.42 + Math.sin(lon * 2.9 + 0.7) * 0.05;
      } else {
        lon = hash01(seed, 19, 11) * Math.PI * 2;
        const n = hash01(seed, 23, 13) * 2 - 1;
        lat = Math.asin(THREE.MathUtils.clamp(n, -1, 1));
      }
      const radius = 1650 + hash01(seed, 29, 17) * 2850;
      const cosLat = Math.cos(lat);
      pos[i * 3] = radius * cosLat * Math.cos(lon);
      pos[i * 3 + 1] = radius * Math.sin(lat);
      pos[i * 3 + 2] = radius * cosLat * Math.sin(lon);
      const bv = -0.2 + hash01(seed, 31, 19) * 2.1;
      getStarColorFromBv(bv, c);
      const brightness = 0.14 + Math.pow(hash01(seed, 37, 23), 2.8) * 0.36;
      col[i * 3] = c.r * brightness;
      col[i * 3 + 1] = c.g * brightness;
      col[i * 3 + 2] = c.b * brightness;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m1 = new THREE.PointsMaterial({ size: 1.1, transparent: true, opacity: 0.65, depthWrite: false, vertexColors: true });
    const m2 = new THREE.PointsMaterial({ size: 2.2, transparent: true, opacity: 0.45, depthWrite: false, vertexColors: true });
    const layerA = new THREE.Points(g, m1);
    const layerB = new THREE.Points(g, m2);
    groups.stars.add(layerA);
    if (!mobileLiteMode) groups.stars.add(layerB);
    starGeometry = g;
    if (mobileLiteMode) starTwinkle.push(m1);
    else starTwinkle.push(m1, m2);

    // Faint Milky-Way style band for a more natural night sky look.
    const mwCount = PERF.milkyWayCount;
    const mwPos = new Float32Array(mwCount * 3);
    const mwCol = new Float32Array(mwCount * 3);
    const mwColor = new THREE.Color();
    for (let i = 0; i < mwCount; i += 1) {
      const lon = hash01(i + 1, 41, 3) * Math.PI * 2;
      const lat = (hash01(i + 1, 43, 7) - 0.5) * 0.3 + Math.sin(lon * 2.9) * 0.05;
      const radius = 1600 + hash01(i + 1, 47, 11) * 2600;
      mwPos[i * 3] = radius * Math.cos(lat) * Math.cos(lon);
      mwPos[i * 3 + 1] = radius * Math.sin(lat);
      mwPos[i * 3 + 2] = radius * Math.cos(lat) * Math.sin(lon);
      const t = hash01(i + 1, 53, 13);
      if (t < 0.22) mwColor.setRGB(0.75, 0.84, 1.0);
      else if (t < 0.86) mwColor.setRGB(0.93, 0.95, 1.0);
      else mwColor.setRGB(1.0, 0.9, 0.8);
      mwCol[i * 3] = mwColor.r;
      mwCol[i * 3 + 1] = mwColor.g;
      mwCol[i * 3 + 2] = mwColor.b;
    }
    const mwGeo = new THREE.BufferGeometry();
    mwGeo.setAttribute("position", new THREE.BufferAttribute(mwPos, 3));
    mwGeo.setAttribute("color", new THREE.BufferAttribute(mwCol, 3));
    const mwMat = new THREE.PointsMaterial({
      size: mobileLiteMode ? 1.05 : 1.35,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      vertexColors: true
    });
    const mwLayer = new THREE.Points(mwGeo, mwMat);
    groups.stars.add(mwLayer);
    starTwinkle.push(mwMat);

    const labeledStars = catalog.filter((s) => s.mag <= 1.25).slice(0, PERF.starLabelCount);
    labeledStars.forEach((s) => {
      getDirectionFromRaDec(s.ra, s.dec, dir);
      const labelRadius = 1280;
      getStarColorFromBv(s.bv, c);
      const size = THREE.MathUtils.clamp(3.4 - (s.mag + 1.6) * 0.52, 1.8, 3.4);
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(size, mobileLiteMode ? 10 : 16, mobileLiteMode ? 10 : 16),
        new THREE.MeshBasicMaterial({ color: c })
      );
      star.position.set(dir.x * labelRadius, dir.y * labelRadius, dir.z * labelRadius);
      groups.stars.add(star);
      const l = makeLabel(s.name, [17, 4, 1], { alwaysOnTop: true });
      l.position.set(0, 7.8, 0);
      star.add(l);
    });
  }

  function buildDustAndAsteroids() {
    const dustCount = PERF.dustCount;
    const dustArr = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i += 1) {
      const ring = 0.6 + Math.random() * 9.3;
      const t = Math.random() * Math.PI * 2;
      dustArr[i * 3] = Math.cos(t) * ring * AU;
      dustArr[i * 3 + 1] = (Math.random() - 0.5) * 2.8 + Math.sin(t * 1.7) * 0.2;
      dustArr[i * 3 + 2] = Math.sin(t) * ring * AU;
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(dustArr, 3));
    dustPoints = new THREE.Points(
      dg,
      new THREE.PointsMaterial({ color: 0xb8c5db, size: 0.32, transparent: true, opacity: 0.26, depthWrite: false })
    );
    groups.dust.add(dustPoints);

    const asteroidCount = PERF.asteroidCount;
    const astArr = new Float32Array(asteroidCount * 3);
    for (let i = 0; i < asteroidCount; i += 1) {
      const r = 1.95 + Math.random() * 1.7;
      const t = Math.random() * Math.PI * 2;
      astArr[i * 3] = Math.cos(t) * r * AU;
      astArr[i * 3 + 1] = (Math.random() - 0.5) * 2.7;
      astArr[i * 3 + 2] = Math.sin(t) * r * AU;
    }
    const ag = new THREE.BufferGeometry();
    ag.setAttribute("position", new THREE.BufferAttribute(astArr, 3));
    asteroidPoints = new THREE.Points(
      ag,
      new THREE.PointsMaterial({ color: 0xd2d7df, size: 0.38, transparent: true, opacity: 0.74, depthWrite: false })
    );
    groups.asteroids.add(asteroidPoints);
  }

  async function buildScene() {
    const textures = {};
    const textureQueue = mobileLiteMode
      ? ["sun", "moon", ...new Set(bodies.map((b) => b.tex).filter((t) => MOBILE_TEXTURE_PRIORITY.has(t)))]
      : ["sun", "moon", ...bodies.map((b) => b.tex)];
    for (const t of textureQueue) textures[t] = await loadTex(t);
    const planetSegW = PERF.planetSegW;
    const planetSegH = PERF.planetSegH;
    const moonSegW = PERF.moonSegW;
    const moonSegH = PERF.moonSegH;

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(5.2, mobileLiteMode ? 56 : 96, mobileLiteMode ? 40 : 96),
      new THREE.MeshStandardMaterial({ map: textures.sun || null, emissiveMap: textures.sun || null, emissive: 0xffcb83, emissiveIntensity: 1.2, roughness: 1, metalness: 0 })
    );
    sun.userData.entity = { id: "sun", name: "الشمس", type: "نجم" };
    root.add(sun);
    clickable.push(sun);
    entityMap.set("sun", sun.userData.entity);
    sunMesh = sun;

    const glow = document.createElement("canvas");
    glow.width = 256;
    glow.height = 256;
    const gx = glow.getContext("2d");
    const gg = gx.createRadialGradient(128, 128, 14, 128, 128, 128);
    gg.addColorStop(0, "rgba(255,245,210,1)");
    gg.addColorStop(0.35, "rgba(255,188,94,0.8)");
    gg.addColorStop(1, "rgba(255,150,70,0)");
    gx.fillStyle = gg;
    gx.fillRect(0, 0, 256, 256);
    sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glow), color: 0xffcd8c, transparent: true, opacity: 0.62, depthWrite: false, depthTest: false }));
    sunGlow.scale.set(26, 26, 1);
    sun.add(sunGlow);
    root.add(new THREE.PointLight(0xffe5b4, 5.2, 0, 2));
    const sunLabel = makeLabel("الشمس");
    sunLabel.position.set(0, 7.7, 0);
    sun.add(sunLabel);

    const satRingTex = makeSaturnRingTexture();
    bodies.forEach((b, idx) => {
      const bodyMat = new THREE.MeshStandardMaterial({
        map: textures[b.tex] || null,
        roughness: 0.9,
        metalness: 0,
        color: textures[b.tex] ? 0xffffff : b.color
      });
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(b.r, planetSegW, planetSegH),
        bodyMat
      );
      setupTerrainMaterial(b.id, mesh, bodyMat, textures[b.tex] || null);
      mesh.rotation.z = ((idx % 3) - 1) * 0.045;
      mesh.userData.entity = { id: b.id, name: b.name, type: "كوكب" };
      root.add(mesh);
      clickable.push(mesh);
      bodyMap.set(b.id, { def: b, mesh });
      entityMap.set(b.id, mesh.userData.entity);

      if (b.id === "saturn") {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(b.r * 1.42, b.r * 2.46, mobileLiteMode ? 72 : 120),
          new THREE.MeshBasicMaterial({ map: satRingTex, color: 0xe6d5ac, transparent: true, opacity: 0.84, side: THREE.DoubleSide })
        );
        ring.rotation.x = Math.PI / 2;
        ring.rotation.y = 0.22;
        mesh.add(ring);
      }

      const l = makeLabel(b.name);
      l.position.set(0, b.r + 1.9, 0);
      mesh.add(l);
      bodyMap.get(b.id).label = l;

      groups.orbits.add(makeOrbitLine(b, 0x7eb4f3, b.a <= 1.6 ? 0.46 : 0.24));
      if (b.a <= 1.6) groups.innerOrbits.add(makeOrbitLine(b, 0xd8f4ff, 0.86, true));
    });

    moons.forEach((m) => {
      const moonMat = new THREE.MeshStandardMaterial({
        map: textures.moon || null,
        color: textures.moon ? 0xffffff : 0xc9ced9,
        roughness: 0.95,
        metalness: 0
      });
      const moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(m.r, moonSegW, moonSegH),
        moonMat
      );
      setupTerrainMaterial(m.id, moonMesh, moonMat, textures.moon || null);
      moonMesh.userData.entity = { id: m.id, name: m.name, type: "قمر" };
      root.add(moonMesh);
      clickable.push(moonMesh);
      entityMap.set(m.id, moonMesh.userData.entity);
      const ml = makeLabel(m.name, [9, 2.2, 1]);
      ml.position.set(0, m.r + 0.85, 0);
      moonMesh.add(ml);
      moonMap.set(m.id, { def: { ...m, phase: Math.random() * Math.PI * 2 }, mesh: moonMesh, label: ml });
    });

    comets.forEach((c) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(c.r, mobileLiteMode ? 14 : 20, mobileLiteMode ? 14 : 20),
        new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.94, metalness: 0 })
      );
      mesh.userData.entity = { id: c.id, name: c.name, type: "مذنب" };
      groups.comets.add(mesh);
      clickable.push(mesh);
      entityMap.set(c.id, mesh.userData.entity);
      c.mesh = mesh;
      const tailGeometry = new THREE.BufferGeometry();
      tailGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      c.tail = new THREE.Line(
        tailGeometry,
        new THREE.LineBasicMaterial({ color: 0xdcefff, transparent: true, opacity: 0.74 })
      );
      groups.comets.add(c.tail);
      c.label = makeLabel(c.name, [8.6, 2.1, 1]);
      groups.comets.add(c.label);
      groups.orbits.add(makeOrbitLine(c, 0xa8ddff, 0.26));
    });

    buildStarfield();
    buildDustAndAsteroids();
  }

  const updateEntityKinematics = (id, mesh, dt) => {
    if (!mesh) return;
    getMeshWorldPosition(mesh, tmpV3);
    const prev = previousWorldPosMap.get(id);
    if (prev && dt > 0) {
      const vel = velocityMap.get(id) || new THREE.Vector3();
      vel.copy(tmpV3).sub(prev).divideScalar(dt);
      velocityMap.set(id, vel);
      prev.copy(tmpV3);
    } else {
      previousWorldPosMap.set(id, tmpV3.clone());
    }
  };

  function updatePositions(dt = 0.016) {
    const simDays = getSimDaysTt();
    updateEntityKinematics("sun", sunMesh, dt);
    bodyMap.forEach((entry) => {
      const p = ephemeris.getBodyPosition(entry.def, simDays);
      entry.mesh.position.set(p.x, p.y, p.z);
      updateEntityKinematics(entry.def.id, entry.mesh, dt);
    });
    moonMap.forEach((entry) => {
      const host = bodyMap.get(entry.def.host);
      if (!host) return;
      const p = ephemeris.getMoonPosition(entry.def, simDays, host.mesh.position);
      entry.mesh.position.set(p.x, p.y, p.z);
      updateEntityKinematics(entry.def.id, entry.mesh, dt);
    });
    const cometFocusId = (
      (selected && cometDefById.has(selected.id) && selected.id)
      || (followId && cometDefById.has(followId) && followId)
      || (surface.targetId && cometDefById.has(surface.targetId) && surface.targetId)
      || (explorerTargetId && cometDefById.has(explorerTargetId) && explorerTargetId)
      || null
    );
    const shouldUpdateComets = settings.showComets && !surface.active;
    comets.forEach((c) => {
      const forceUpdate = cometFocusId === c.id;
      if (!forceUpdate && !shouldUpdateComets) {
        if (c.tail) c.tail.visible = false;
        if (c.label) c.label.visible = false;
        return;
      }
      if (c.tail) c.tail.visible = true;
      if (c.label) c.label.visible = true;
      const p = ephemeris.getCometPosition(c, simDays);
      c.mesh.position.set(p.x, p.y, p.z);
      updateEntityKinematics(c.id, c.mesh, dt);
      const d = Math.max(1, Math.hypot(p.x, p.y, p.z));
      const len = ephemeris.getCometTailLength(d);
      tmpV1.set(p.x, p.y, p.z).normalize();
      tmpV2.set(p.x, p.y, p.z).add(tmpV1.multiplyScalar(len));
      const tailPos = c.tail.geometry.attributes.position.array;
      tailPos[0] = p.x;
      tailPos[1] = p.y;
      tailPos[2] = p.z;
      tailPos[3] = tmpV2.x;
      tailPos[4] = tmpV2.y;
      tailPos[5] = tmpV2.z;
      c.tail.geometry.attributes.position.needsUpdate = true;
      c.label.position.set(p.x + 1.3, p.y + 1, p.z);
    });
  }

  function updateBodyOrbitalVisuals(dt) {
    const sunPos = getEntityPosition("sun");
    const simDays = getSimDaysTt();
    bodyVisualRuntime.forEach((fx, id) => {
      if (!fx?.hostMesh) return;
      const hostVisible = fx.hostMesh.visible && !(surface.active && surface.targetId === id);
      if (fx.atmosphereMesh) fx.atmosphereMesh.visible = hostVisible;
      if (fx.oceanMesh) fx.oceanMesh.visible = hostVisible;
      if (fx.cityMesh) fx.cityMesh.visible = hostVisible;
      if (fx.cloudMesh) fx.cloudMesh.visible = hostVisible;
      if (fx.orbitalAtmosphereMesh) fx.orbitalAtmosphereMesh.visible = hostVisible;
      if (fx.auroraMesh) fx.auroraMesh.visible = hostVisible && !!fx.auroraMaterial;
      if (!hostVisible) return;

      const hostPos = getMeshWorldPosition(fx.hostMesh, tmpV1);
      tmpV2.copy(sunPos).sub(hostPos);
      if (tmpV2.lengthSq() < 0.000001) tmpV2.set(1, 0, 0);
      tmpV2.normalize();

      tmpV3.copy(camera.position).sub(hostPos);
      if (tmpV3.lengthSq() < 0.000001) tmpV3.set(0, 1, 0);
      tmpV3.normalize();

      const align = THREE.MathUtils.clamp(tmpV2.dot(tmpV3), -1, 1);
      const dayView = THREE.MathUtils.clamp(align * 0.5 + 0.5, 0, 1);
      const twilight = 1 - Math.abs(align);
      const night = THREE.MathUtils.clamp(-align, 0, 1);

      if (fx.orbitalAtmosphereMaterial?.uniforms && fx.orbitalAtmosphereProfile) {
        const profile = fx.orbitalAtmosphereProfile;
        fx.orbitalAtmosphereMaterial.uniforms.uDayMix.value = dayView;
        fx.orbitalAtmosphereMaterial.uniforms.uIntensity.value = THREE.MathUtils.clamp(
          profile.base + dayView * profile.day + twilight * profile.twilight + (1 - dayView) * profile.night,
          0.02,
          0.72
        );
      }

      if (id !== "earth") return;
      const sunglint = Math.pow(Math.max(0, align), 4.5);
      if (fx.cloudMesh) fx.cloudMesh.rotation.y += dt * 0.016;
      if (fx.cloudMaterial) {
        fx.cloudMaterial.opacity = THREE.MathUtils.clamp(
          0.2 + dayView * 0.34 + twilight * 0.11 + night * 0.08,
          0.18,
          0.62
        );
        const nightTint = THREE.MathUtils.clamp(night * 0.82 + twilight * 0.24, 0, 1);
        fx.cloudMaterial.color.setRGB(
          THREE.MathUtils.lerp(1, 0.69, nightTint),
          THREE.MathUtils.lerp(1, 0.77, nightTint),
          THREE.MathUtils.lerp(1, 0.9, nightTint)
        );
      }
      if (fx.oceanMaterial) {
        fx.oceanMaterial.opacity = THREE.MathUtils.clamp(
          0.15 + dayView * 0.16 + sunglint * 0.34,
          0.12,
          0.68
        );
        fx.oceanMaterial.shininess = 140 + sunglint * 220;
        fx.oceanMaterial.emissiveIntensity = THREE.MathUtils.clamp(
          0.07 + twilight * 0.15,
          0.05,
          0.24
        );
      }
      if (fx.cityMaterial) {
        const cloudOcclusion = fx.cloudMaterial
          ? THREE.MathUtils.clamp(1 - fx.cloudMaterial.opacity * 0.34, 0.58, 1)
          : 1;
        const cityPulse = 0.96 + Math.sin(simDays * 2.9 + 1.1) * 0.04;
        const cityNight = Math.pow(night, 1.25);
        const cityTwilight = Math.pow(twilight, 3.2) * 0.12;
        fx.cityMaterial.opacity = THREE.MathUtils.clamp(
          (cityNight * 0.86 + cityTwilight) * cloudOcclusion * cityPulse,
          0,
          0.94
        );
        fx.cityMaterial.color.setRGB(
          1,
          0.72 + cityNight * 0.12,
          0.45 + cityNight * 0.1
        );
      }
      if (fx.auroraMaterial?.uniforms) {
        const solarActivity = getSolarActivityFactor(simDays, getCurrentClimate("sun"));
        const auroraActivity = THREE.MathUtils.clamp(
          (night * 0.95 + twilight * 0.18) * solarActivity,
          0,
          1.4
        );
        fx.auroraMaterial.uniforms.uTime.value += dt * (0.55 + solarActivity * 1.8);
        fx.auroraMaterial.uniforms.uActivity.value = auroraActivity;
        if (fx.auroraMesh) fx.auroraMesh.visible = auroraActivity > 0.04;
      }
      if (fx.atmosphereMaterial?.uniforms) {
        fx.atmosphereMaterial.uniforms.uDayMix.value = dayView;
        fx.atmosphereMaterial.uniforms.uIntensity.value = THREE.MathUtils.clamp(
          0.16 + dayView * 0.08 + twilight * 0.19,
          0.14,
          0.46
        );
      }
    });
  }

  function updateFollow() {
    let target = null;
    if (surface.active && surface.targetId) {
      target = getEntityPosition(surface.targetId);
      const delta = target.clone().sub(surface.lastTarget);
      if (delta.lengthSq() > 0 && !eva.active && !surface.traverseMode) camera.position.add(delta);
      surface.lastTarget.copy(target);
    } else if (followId === "sun") {
      target = new THREE.Vector3();
    } else if (followId && followId !== "sun") {
      const body = bodyMap.get(followId);
      const moon = moonMap.get(followId);
      const comet = comets.find((c) => c.id === followId);
      if (body) target = getMeshWorldPosition(body.mesh);
      else if (moon) target = getMeshWorldPosition(moon.mesh);
      else if (comet) target = getMeshWorldPosition(comet.mesh);
    }
    if (!eva.active && target && !(surface.active && surface.traverseMode)) {
      controls.target.lerp(target, surface.active ? 0.2 : 0.09);
    }
    if (surface.active && surface.targetId && surface.skyAssist > 0 && !eva.active) {
      const focus = getEntityPosition(surface.targetId);
      tmpV1.copy(camera.position).sub(focus).normalize();
      const ref = Math.abs(tmpV1.y) > 0.92 ? tmpV2.set(1, 0, 0) : tmpV2.set(0, 1, 0);
      tmpV3.crossVectors(ref, tmpV1).normalize();
      tmpV4.copy(tmpV1).multiplyScalar(0.95).addScaledVector(tmpV3, 0.24).normalize();
      controls.target.lerp(camera.position.clone().add(tmpV4.multiplyScalar(Math.max(10, getEntityRadius(surface.targetId) * 4.5))), 0.34);
    }

    if (!flight.active || !flight.targetId) return;
    const t = getEntityPosition(flight.targetId);
    const dir = camera.position.clone().sub(controls.target);
    if (dir.lengthSq() < 0.0001) dir.set(0.2, 0.25, 1);
    dir.normalize();
    const desired = t.clone().add(dir.multiplyScalar(flight.distance));
    camera.position.lerp(desired, flight.smooth);
    if (camera.position.distanceTo(desired) < 0.6) {
      flight.active = false;
    }
  }

  const getFlightVector = (mode, targetId) => {
    const vel = velocityMap.get(targetId);
    if (mode === "target") {
      const target = getEntityPosition(targetId);
      const dir = target.sub(camera.position);
      if (dir.lengthSq() < 0.000001) return null;
      return dir.normalize();
    }
    if (!vel || vel.lengthSq() < 0.0000001) return null;
    if (mode === "prograde") return vel.clone().normalize();
    if (mode === "retrograde") return vel.clone().normalize().multiplyScalar(-1);
    if (mode === "normal") {
      const moonDef = moonDefById.get(targetId);
      const centerId = moonDef?.host || "sun";
      const center = getEntityPosition(centerId);
      const body = getEntityPosition(targetId);
      const radial = body.sub(center);
      if (radial.lengthSq() < 0.0000001) return null;
      const normal = new THREE.Vector3().crossVectors(radial, vel).normalize();
      if (normal.lengthSq() < 0.0000001) return null;
      return normal;
    }
    return null;
  };

  function updateFlightComputer() {
    if (flightComputer.mode === "off" || eva.active || surface.active) return;
    const targetId = flightComputer.targetId || explorerTargetId || followId || "earth";
    if (!bodyDefById.has(targetId) && !moonDefById.has(targetId) && !cometDefById.has(targetId) && targetId !== "sun") return;

    const dir = getFlightVector(flightComputer.mode, targetId);
    if (!dir) return;
    const lead = Math.max(10, getEntityRadius(targetId) * flightComputer.vectorLead);
    const desiredTarget = camera.position.clone().addScaledVector(dir, lead);
    controls.target.lerp(desiredTarget, flightComputer.lockStrength);
  }

  function applyFloatingOrigin() {
    if (!settings.floatingOrigin || !floatingOrigin.enabled) return;
    const threshold = floatingOrigin.threshold;
    const targetLenSq = controls.target.lengthSq();
    if (targetLenSq < threshold * threshold) return;
    const shiftX = Math.round(controls.target.x / threshold) * threshold;
    const shiftY = Math.round(controls.target.y / threshold) * threshold;
    const shiftZ = Math.round(controls.target.z / threshold) * threshold;
    tmpV1.set(shiftX, shiftY, shiftZ);
    if (tmpV1.lengthSq() < 0.0000001) return;

    root.position.sub(tmpV1);
    camera.position.sub(tmpV1);
    controls.target.sub(tmpV1);
    surface.lastTarget.sub(tmpV1);
    previousWorldPosMap.forEach((value) => value.sub(tmpV1));
    floatingOrigin.offset.add(tmpV1);
  }

  function updateLabelReadability() {
    const visible = settings.showLabels;
    bodyMap.forEach((entry) => {
      const d = camera.position.distanceTo(getMeshWorldPosition(entry.mesh));
      const s = Math.max(9, Math.min(18, d * 0.045));
      entry.label.scale.set(s, s * 0.26, 1);
      let labelOpacity = visible ? 0.98 : 0;
      const hideNear = getEntityRadius(entry.def.id) * 7.5;
      if (d < hideNear) labelOpacity *= THREE.MathUtils.clamp((d - hideNear * 0.4) / Math.max(0.0001, hideNear * 0.6), 0, 1);
      if (surface.active && surface.targetId === entry.def.id) labelOpacity = 0;
      entry.label.material.opacity = labelOpacity;
    });
    moonMap.forEach((entry) => {
      const d = camera.position.distanceTo(getMeshWorldPosition(entry.mesh));
      const s = Math.max(6, Math.min(11, d * 0.03));
      entry.label.scale.set(s, s * 0.24, 1);
      let labelOpacity = visible ? 0.9 : 0;
      const hideNear = getEntityRadius(entry.def.id) * 7.8;
      if (d < hideNear) labelOpacity *= THREE.MathUtils.clamp((d - hideNear * 0.35) / Math.max(0.0001, hideNear * 0.65), 0, 1);
      if (surface.active && surface.targetId === entry.def.id) labelOpacity = 0;
      entry.label.material.opacity = labelOpacity;
    });
    comets.forEach((c) => {
      const d = camera.position.distanceTo(getMeshWorldPosition(c.mesh));
      const s = Math.max(6, Math.min(13, d * 0.035));
      c.label.scale.set(s, s * 0.24, 1);
      let labelOpacity = visible ? 0.88 : 0;
      const hideNear = getEntityRadius(c.id) * 16;
      if (d < hideNear) labelOpacity *= THREE.MathUtils.clamp((d - hideNear * 0.45) / Math.max(0.0001, hideNear * 0.55), 0, 1);
      c.label.material.opacity = labelOpacity;
    });
  }

  const getSurfaceSolarState = (id) => {
    if (!id) return { align: 1, dayView: 1, twilight: 0, night: 0 };
    const target = getEntityPosition(id);
    const sun = getEntityPosition("sun");
    tmpV1.copy(sun).sub(target);
    if (tmpV1.lengthSq() < 0.000001) tmpV1.set(1, 0, 0);
    tmpV1.normalize();
    tmpV2.copy(camera.position).sub(target);
    if (tmpV2.lengthSq() < 0.000001) tmpV2.set(0, 1, 0);
    tmpV2.normalize();
    const align = THREE.MathUtils.clamp(tmpV2.dot(tmpV1), -1, 1);
    const dayView = THREE.MathUtils.clamp(align * 0.5 + 0.5, 0, 1);
    const twilight = 1 - Math.abs(align);
    const night = THREE.MathUtils.clamp(-align, 0, 1);
    return { align, dayView, twilight, night };
  };

  const getSurfaceOpticalDepth = (id, climate) => {
    const mode = getEnvMode(id);
    const pressure = climate.pressureBar;
    const wind = climate.windKmh;
    if (mode === "gas_storm" || mode === "gas_ice_storm") return 3.2 + pressure * 0.45;
    if (mode === "titan_haze") return 2.6 + pressure * 0.38 + wind / 1800;
    if (mode === "rocky_dense") return 1.55 + pressure * 0.22 + wind / 2200;
    if (mode === "rocky_sky") return 0.74 + pressure * 0.14 + wind / 3000;
    if (mode === "rocky_dust") return 0.26 + pressure * 0.08 + wind / 1400;
    if (mode === "dwarf_ice") return 0.16 + pressure * 0.05 + wind / 2600;
    return 0.02 + pressure * 0.02;
  };

  const canSurfaceSkyShowNearbyBodies = (id) => {
    if (!id) return false;
    if (id === "venus") return false;
    const mode = getEnvMode(id);
    return mode !== "gas_storm" && mode !== "gas_ice_storm";
  };

  const isLookingAtSurfaceSky = () => {
    if (!surface.active || !surface.targetId) return false;
    const target = getEntityPosition(surface.targetId);
    tmpV1.copy(camera.position).sub(target);
    if (tmpV1.lengthSq() < 0.000001) return false;
    tmpV1.normalize(); // surface radial up
    tmpV2.copy(controls.target).sub(camera.position);
    if (tmpV2.lengthSq() < 0.000001) return false;
    tmpV2.normalize(); // camera look dir
    const skyDot = tmpV2.dot(tmpV1);
    return skyDot > 0.14 || surface.skyAssist > 0.06;
  };

  const getSurfaceSkyContextIds = (id) => {
    const ids = new Set();
    if (!id) return ids;
    if (moonDefById.has(id)) {
      const moonDef = moonDefById.get(id);
      const hostId = moonDef?.host;
      if (hostId) ids.add(hostId);
      if (hostId) {
        moons.forEach((m) => {
          if (m.host === hostId && m.id !== id) ids.add(m.id);
        });
      }
    } else if (bodyDefById.has(id)) {
      moons.forEach((m) => {
        if (m.host === id) ids.add(m.id);
      });
    }
    if (id !== "sun") ids.add("sun");
    return ids;
  };

  function updateSceneVisibility() {
    const inSurfaceMode = surface.active && !!surface.targetId;
    const orbitalLayerVisible = !inSurfaceMode;
    groups.orbits.visible = settings.showOrbits && orbitalLayerVisible;
    groups.innerOrbits.visible = settings.showOrbits && settings.showInnerOrbits && orbitalLayerVisible;
    groups.asteroids.visible = settings.showAsteroids && orbitalLayerVisible;
    groups.comets.visible = settings.showComets && orbitalLayerVisible;
    groups.dust.visible = settings.showDust && orbitalLayerVisible && !adaptiveQuality.hideDust;
    groups.tech.visible = settings.showTech && orbitalLayerVisible && !adaptiveQuality.hideTech;
    groups.labels.visible = settings.showLabels && orbitalLayerVisible && !adaptiveQuality.hideLabels;

    let skyContextIds = null;
    let showSkyContextBodies = false;
    if (inSurfaceMode) {
      const climate = getCurrentClimate(surface.targetId);
      const pressure = climate.pressureBar;
      const opticalDepth = getSurfaceOpticalDepth(surface.targetId, climate);
      const { dayView, twilight } = getSurfaceSolarState(surface.targetId);
      const denseSky = (
        surface.mode === "rocky_dense"
        || surface.mode === "titan_haze"
        || surface.mode === "gas_storm"
        || surface.mode === "gas_ice_storm"
      );
      let starVis = 0;
      if (!denseSky) {
        const darkness = THREE.MathUtils.clamp((0.62 - dayView) / 0.62, 0, 1);
        const extinction = Math.exp(-opticalDepth * 0.92);
        if (surface.mode === "rocky_sky") {
          const twilightBoost = twilight * 0.06;
          const atmosphericScatter = Math.exp(-opticalDepth * 0.58);
          const hazePenalty = THREE.MathUtils.clamp((pressure - 0.8) * 0.1, 0, 0.15);
          starVis = THREE.MathUtils.clamp(
            darkness * (0.14 + atmosphericScatter * 1.22) + twilightBoost - hazePenalty,
            0,
            1
          );
        } else {
          const twilightBoost = surface.mode === "rocky_dust" ? twilight * 0.12 : (surface.mode === "rocky_airless" ? twilight * 0.2 : 0);
          starVis = THREE.MathUtils.clamp(darkness * (0.16 + extinction * 0.96) + twilightBoost, 0, 1);
        }
      }
      surface.starVisibility = starVis;
      groups.stars.visible = starVis > (surface.mode === "rocky_sky" ? 0.06 : 0.16);

      if (canSurfaceSkyShowNearbyBodies(surface.targetId) && isLookingAtSurfaceSky()) {
        const externalClarity = THREE.MathUtils.clamp(Math.exp(-opticalDepth * 0.72), 0, 1);
        showSkyContextBodies = externalClarity > 0.2;
        if (showSkyContextBodies) skyContextIds = getSurfaceSkyContextIds(surface.targetId);
      }
    } else {
      surface.starVisibility = 1;
      groups.stars.visible = true;
    }

    const surfaceTargetId = inSurfaceMode ? surface.targetId : null;
    if (sunMesh) sunMesh.visible = !inSurfaceMode || surfaceTargetId === "sun" || (showSkyContextBodies && skyContextIds?.has("sun"));
    bodyMap.forEach((entry) => {
      const contextVisible = !!(showSkyContextBodies && skyContextIds?.has(entry.def.id));
      entry.mesh.visible = !inSurfaceMode || entry.def.id === surfaceTargetId || contextVisible;
    });
    moonMap.forEach((entry) => {
      const contextVisible = !!(showSkyContextBodies && skyContextIds?.has(entry.def.id));
      entry.mesh.visible = !inSurfaceMode || entry.def.id === surfaceTargetId || contextVisible;
    });
  }

  function updateSurfaceLighting() {
    if (!surface.active || !surface.targetId) {
      ambientLight.intensity += (0.26 - ambientLight.intensity) * 0.08;
      hemisphereLight.intensity += (0.3 - hemisphereLight.intensity) * 0.08;
      surfaceSunLight.intensity += (0 - surfaceSunLight.intensity) * 0.16;
      surfaceRimLight.intensity += (0 - surfaceRimLight.intensity) * 0.16;
      return;
    }
    const target = getEntityPosition(surface.targetId);
    const sun = getEntityPosition("sun");
    tmpV1.copy(sun).sub(target);
    if (tmpV1.lengthSq() < 0.000001) tmpV1.set(1, 0, 0);
    tmpV1.normalize(); // surface-to-sun direction
    tmpV2.copy(camera.position).sub(target);
    if (tmpV2.lengthSq() < 0.000001) tmpV2.set(0, 1, 0);
    tmpV2.normalize(); // surface-to-camera direction
    const alignment = THREE.MathUtils.clamp(tmpV2.dot(tmpV1), -1, 1);
    const dayView = THREE.MathUtils.clamp(alignment * 0.5 + 0.5, 0, 1);
    const twilight = 1 - Math.abs(alignment);
    const pressure = getCurrentClimate(surface.targetId).pressureBar;
    const haze = THREE.MathUtils.clamp(Math.log10(pressure + 1) * 0.95, 0, 1.3);
    const radius = getEntityRadius(surface.targetId);
    const lightDist = Math.max(22, radius * 16);

    ambientLight.intensity += ((0.05 + dayView * 0.14 + haze * 0.08) - ambientLight.intensity) * 0.1;
    hemisphereLight.intensity += ((0.08 + dayView * 0.12 + haze * 0.1) - hemisphereLight.intensity) * 0.1;

    const isWarmAtmo = surface.mode === "rocky_dense" || surface.mode === "titan_haze";
    surfaceSunLight.color.setHex(isWarmAtmo ? 0xffdeb4 : 0xfff1d5);
    surfaceSunLight.position.copy(target).addScaledVector(tmpV1, lightDist);
    surfaceSunLight.target.position.copy(target);
    surfaceSunLight.intensity += ((0.85 + dayView * 1.05) - surfaceSunLight.intensity) * 0.18;

    surfaceRimLight.color.setHex(isWarmAtmo ? 0x96b7ff : 0x89adff);
    surfaceRimLight.position.copy(target)
      .addScaledVector(tmpV1, -lightDist * 0.66)
      .addScaledVector(tmpV3.set(0, 1, 0), lightDist * 0.18);
    surfaceRimLight.target.position.copy(target);
    surfaceRimLight.intensity += ((0.08 + twilight * 0.52 + haze * 0.14) - surfaceRimLight.intensity) * 0.18;
  }

  function updateCameraClipRange() {
    let near = 0.1;
    let far = 9000;
    if (surface.active && surface.targetId) {
      const target = getEntityPosition(surface.targetId);
      const radius = Math.max(0.0001, getEntityRadius(surface.targetId));
      const dist = camera.position.distanceTo(target);
      near = Math.max(0.0012, radius * 0.0014);
      far = Math.max(radius * 140, dist + radius * 90);
    }
    if (Math.abs(camera.near - near) > 0.00005 || Math.abs(camera.far - far) > 0.05) {
      camera.near = near;
      camera.far = far;
      camera.updateProjectionMatrix();
    }
  }

  function updateClimateVisuals() {
    const targetId = surface.active && surface.targetId ? surface.targetId : explorerTargetId;
    const climate = getCurrentClimate(targetId);
    const mode = surface.active ? surface.mode : "orbital";
    updateSurfaceLighting();
    let baseFog = 0.00022;
    let minExp = 0.86;
    let maxExp = 1.35;
    if (mode === "gas_storm" || mode === "gas_ice_storm") {
      baseFog = 0.00072;
      minExp = 0.72;
      maxExp = 1.3;
    } else if (mode === "titan_haze") {
      baseFog = 0.00066;
      minExp = 0.68;
      maxExp = 1.08;
    } else if (mode === "dwarf_ice") {
      baseFog = 0.0003;
      minExp = 0.78;
      maxExp = 1.22;
    } else if (mode === "rocky_dense") {
      baseFog = 0.00052;
      minExp = 0.74;
      maxExp = 1.24;
    } else if (mode === "rocky_dust") {
      baseFog = 0.00028;
      minExp = 0.74;
      maxExp = 1.18;
    } else if (mode === "rocky_airless") {
      baseFog = 0.00015;
      minExp = 0.86;
      maxExp = 1.36;
    } else if (mode === "rocky_sky") {
      baseFog = 0.00034;
      minExp = 0.8;
      maxExp = 1.32;
    }

    let fogDensity = Math.min(0.00155, Math.max(0.00012, baseFog + climate.pressureBar * 0.000016 + climate.windKmh * 0.00000009));
    let exposure = Math.min(maxExp, Math.max(minExp, 1.04 + climate.tempC / 4200));
    const solarState = (surface.active && surface.targetId) ? getSurfaceSolarState(surface.targetId) : null;
    if (solarState) {
      if (mode === "rocky_dust") {
        fogDensity *= (0.34 + solarState.dayView * 0.92);
        exposure = THREE.MathUtils.clamp(exposure - solarState.night * 0.1, minExp - 0.16, maxExp);
      } else if (mode === "rocky_sky") {
        fogDensity *= (0.36 + solarState.dayView * 0.86 + solarState.twilight * 0.2);
        exposure = THREE.MathUtils.clamp(exposure - solarState.night * 0.14 + solarState.dayView * 0.04, minExp - 0.16, maxExp);
      } else if (mode === "rocky_airless") {
        fogDensity *= 0.24;
      }
    }
    scene.fog.density = fogDensity;
    renderer.toneMappingExposure += (exposure - renderer.toneMappingExposure) * 0.05;

    if (surface.active) {
      if (mode === "rocky_sky" && solarState) {
        TMP_COLOR.setHex(0x7eb4e8);
        TMP_COLOR.lerp(TMP_COLOR_B.setHex(0xf0a35f), THREE.MathUtils.clamp(solarState.twilight * 0.64, 0, 1));
        TMP_COLOR.lerp(TMP_COLOR_B.setHex(0x040814), solarState.night * 0.94);
        scene.background.lerp(TMP_COLOR, 0.08);
        const domeMat = surface.skyDome?.mesh?.material;
        if (domeMat?.color) {
          domeMat.color.copy(TMP_COLOR);
          domeMat.opacity = THREE.MathUtils.clamp(
            0.012 + solarState.dayView * 0.16 + solarState.twilight * 0.06 + solarState.night * 0.018,
            0.01,
            0.22
          );
        }
      } else if (mode === "rocky_dust" && solarState) {
        // Mars-like thin atmosphere: subtle day tint, dark night sky.
        TMP_COLOR.setHex(0xc9956f);
        TMP_COLOR.lerp(TMP_COLOR_B.setHex(0x615a6f), THREE.MathUtils.clamp(solarState.twilight * 0.82 + solarState.night * 0.24, 0, 1));
        TMP_COLOR.lerp(TMP_COLOR_B.setHex(0x050915), solarState.night * 0.92);
        scene.background.lerp(TMP_COLOR, 0.08);
        const domeMat = surface.skyDome?.mesh?.material;
        if (domeMat?.color) {
          const dustActivity = THREE.MathUtils.clamp(climate.windKmh / 140, 0, 1.4);
          domeMat.color.copy(TMP_COLOR);
          domeMat.opacity = THREE.MathUtils.clamp(
            0.025 + solarState.dayView * 0.13 + dustActivity * 0.035 + solarState.twilight * 0.03,
            0.018,
            0.21
          );
        }
      } else {
        const bg = getSkyPreset(mode).color;
        scene.background.lerp(TMP_COLOR.set(bg), 0.05);
        const domeMat = surface.skyDome?.mesh?.material;
        if (domeMat && solarState) {
          if (mode === "rocky_airless") {
            domeMat.opacity = THREE.MathUtils.clamp(0.012 + solarState.dayView * 0.042, 0.01, 0.065);
          } else if (mode === "dwarf_ice") {
            domeMat.opacity = THREE.MathUtils.clamp(0.05 + solarState.dayView * 0.1, 0.045, 0.22);
          }
        }
      }
      surface.stormFlash = Math.max(0, surface.stormFlash - 0.06);
      if (surface.stormFlash > 0.01) renderer.toneMappingExposure += surface.stormFlash * 0.17;
      if (
        surface.targetId === "jupiter"
        && (surface.mode === "gas_storm" || surface.mode === "gas_ice_storm")
      ) {
        renderer.toneMappingExposure += (Math.random() - 0.5) * 0.012;
      }
    } else {
      scene.background.lerp(SPACE_BG_COLOR, 0.08);
    }

    if (surface.active && surface.atmosphere?.mesh && surface.targetId) {
      const pressure = climate.pressureBar;
      const gasMode = surface.mode === "gas_storm" || surface.mode === "gas_ice_storm";
      const titanMode = surface.mode === "titan_haze";
      let cap = gasMode ? 0.68 : (titanMode ? 0.74 : 0.42);
      let base = gasMode ? 0.14 : (titanMode ? 0.18 : 0.08);
      let limbMul = 0.12;
      let nightMul = 0.05;
      if (surface.mode === "rocky_dust") {
        cap = Math.min(cap, 0.16);
        base = Math.min(base, 0.022);
        limbMul = 0.045;
        nightMul = 0.012;
      } else if (pressure <= 0.02 && !gasMode) {
        cap = Math.min(cap, 0.2);
        base = Math.min(base, 0.03);
        limbMul = 0.07;
        nightMul = 0.02;
      }
      const solar = solarState || getSurfaceSolarState(surface.targetId);
      const align = solar.align;
      const limb = 1 - Math.abs(align);
      const night = solar.night;
      const atmoMat = surface.atmosphere.mesh.material;
      atmoMat.opacity = Math.min(cap, base + pressure * 0.02 + limb * limbMul + night * nightMul);
      if (surface.atmosphere.baseTint && atmoMat.color) {
        const duskColor = (
          surface.mode === "rocky_dust" ? 0xe8b083
            : surface.mode === "rocky_dense" ? 0xffb57a
              : surface.mode === "titan_haze" ? 0xf0bc79
                : 0xffc795
        );
        const tintMix = surface.mode === "rocky_dust"
          ? Math.min(0.42, limb * 0.32 + night * 0.08)
          : Math.min(0.72, limb * 0.6 + night * 0.2);
        atmoMat.color.copy(surface.atmosphere.baseTint).lerp(TMP_COLOR.setHex(duskColor), tintMix);
      }
    }
  }

  function updateImmersiveFlight(dt) {
    if (!surface.active || !surface.targetId) {
      immersion.altitudeR = 0;
      immersion.descentRps *= 0.9;
      immersion.gForce += (1 - immersion.gForce) * 0.09;
      immersion.turbulence *= 0.9;
      immersion.lastAltitudeR = null;
      surface.entryStabilizer = 0;
      if (immersion.enabled) {
        ui.vrFx.style.opacity = "0";
        ui.vrTelemetry.style.opacity = "0";
        camera.fov += (58 - camera.fov) * 0.08;
        camera.updateProjectionMatrix();
      }
      return;
    }

    if (surface.entryStabilizer > 0) {
      surface.entryStabilizer = Math.max(0, surface.entryStabilizer - dt * 0.46);
    }

    updateSurfaceWeather(dt);
    if (eva.active) {
      updateEvaMotion(dt);
    } else if (surface.traverseMode) {
      updateSurfaceTraverse(dt);
      enforceSurfaceClearance(0.009);
    } else {
      updateSurfaceLandingSequence(dt);
      enforceSurfaceClearance(0.011);
    }

    const target = getEntityPosition(surface.targetId);
    const radius = Math.max(0.0001, getEntityRadius(surface.targetId));
    const dist = camera.position.distanceTo(target);
    const dir = camera.position.clone().sub(target).normalize();
    const terrainOffset = sampleTerrainOffset(surface.targetId, dir);
    const effectiveRadius = Math.max(0.0001, radius + terrainOffset);
    const altitudeR = Math.max(0, dist / effectiveRadius - 1);
    const altitudeUnits = Math.max(0, dist - effectiveRadius);
    if (immersion.lastAltitudeR === null) immersion.lastAltitudeR = altitudeR;
    const rawDescent = eva.active
      ? (eva.sinkRate / Math.max(0.0001, radius))
      : (immersion.lastAltitudeR - altitudeR) / Math.max(0.0001, dt);
    immersion.descentRps += (rawDescent - immersion.descentRps) * 0.18;
    const accelR = Math.abs(immersion.descentRps - immersion.lastDescentRps) / Math.max(0.0001, dt);
    immersion.lastDescentRps = immersion.descentRps;
    immersion.lastAltitudeR = altitudeR;
    immersion.altitudeR = altitudeR;
    applyAtmosphereLayers(altitudeR);

    const climate = getCurrentClimate(surface.targetId);
    const opticalDepth = getSurfaceOpticalDepth(surface.targetId, climate);
    const pressureTerm = Math.min(2.6, climate.pressureBar / 2.2 + 0.08);
    const windTerm = Math.min(2.9, climate.windKmh / 840 + 0.06);
    const proximity = Math.max(0, 1.15 - altitudeR * 1.3);
    immersion.turbulence = Math.min(1.35, windTerm * 0.28 + pressureTerm * 0.24 + Math.abs(immersion.descentRps) * 0.9 + proximity * 0.2 + opticalDepth * 0.06);
    if (eva.active) immersion.turbulence *= 0.45;
    immersion.gForce = Math.max(0.8, Math.min(5.8, 1 + accelR * 0.42 + immersion.turbulence * 0.35));

    if (immersion.enabled) {
      const motionScale = getMotionScale();
      const seq = surface.landingSequence;
      immersion.phase += dt * (2 + windTerm * 1.2 + Math.abs(immersion.descentRps) * 3.2);
      const landingStable = !seq?.active || seq?.stage === "touchdown" || seq?.stage === "landed";
      const entryDamp = 0.34 + (1 - surface.entryStabilizer) * 0.66;
      const baseShake = surface.traverseMode ? 0.2 : (landingStable ? 0.26 : 0.33);
      const descentEnergy = THREE.MathUtils.clamp(Math.abs(immersion.descentRps) * 0.46, 0, 0.42);
      const mobileShakeDamp = mobileLiteMode ? (lowEndMobile ? 0.34 : 0.55) : 1;
      const amp = Math.max(
        0.0018,
        radius * (0.0018 + immersion.turbulence * 0.0037 + proximity * 0.003 + descentEnergy)
      ) * motionScale * baseShake * entryDamp * mobileShakeDamp;
      const forward = controls.target.clone().sub(camera.position).normalize();
      const right = forward.clone().cross(camera.up).normalize();
      const up = right.clone().cross(forward).normalize();
      const shakeRight = (
        Math.sin(immersion.phase * 6.2)
        + Math.sin(immersion.phase * 2.7 + 1.3) * 0.4
      ) * amp * 0.22;
      const shakeUp = (
        Math.cos(immersion.phase * 5.3 + 0.4)
        + Math.cos(immersion.phase * 3.1) * 0.35
      ) * amp * 0.18;
      camera.position.add(right.multiplyScalar(shakeRight)).add(up.multiplyScalar(shakeUp));

      immersion.targetFov = Math.max(48, Math.min(72, 52 + proximity * 8 + Math.abs(immersion.descentRps) * 10));
      camera.fov += (immersion.targetFov - camera.fov) * 0.12;
      camera.updateProjectionMatrix();

      const heat = Math.min(1.4, pressureTerm * 0.4 + windTerm * 0.2 + Math.abs(immersion.descentRps) * 0.8 + proximity * 0.45);
      const opacity = Math.min(0.78, (0.08 + heat * 0.46) * motionScale);
      const warmHue = Math.round(18 + Math.min(1, heat) * 32);
      const coolHue = Math.round(42 + (1 - Math.min(1, heat)) * 34);
      ui.vrFx.style.opacity = `${opacity.toFixed(2)}`;
      ui.vrFx.style.background =
        `radial-gradient(circle at 50% 54%, rgba(0,0,0,0) 44%, rgba(0,0,0,${(0.38 + heat * 0.22).toFixed(2)}) 100%), ` +
        `linear-gradient(180deg, hsla(${warmHue},95%,62%,${(0.14 + heat * 0.16).toFixed(2)}), hsla(${coolHue},86%,58%,${(0.08 + heat * 0.12).toFixed(2)}))`;
      ui.vrTelemetry.style.opacity = "1";
      const layerStage = altitudeR > 0.9 ? "EXO" : (altitudeR > 0.35 ? "MID" : "LOW");
      const descentStage = seq?.active ? getLandingStageLabel(seq.stage) : (seq?.stage === "landed" ? "LANDED" : "STABLE");
      ui.vrTelemetry.textContent = [
        `ALT: ${altitudeUnits.toFixed(2)} u`,
        `R-ALT: ${altitudeR.toFixed(3)}R`,
        `DESC: ${immersion.descentRps.toFixed(3)} R/s`,
        `G-FORCE: ${immersion.gForce.toFixed(2)}g`,
        `WIND: ${Math.round(climate.windKmh)} km/h`,
        `LAYER: ${layerStage}`,
        `STAGE: ${descentStage}`,
        `THR: ${seq?.active ? `${Math.round(seq.thruster * 100)}%` : "IDLE"}`,
        `RCS: ${seq?.active ? `${Math.round(seq.correction * 100)}%` : "STABLE"}`,
        `V-TGT: ${seq?.active ? `${seq.targetSink.toFixed(3)} u/s` : "--"}`,
        `Q: ${seq ? seq.dynamicPressure.toFixed(2) : "--"}`,
        `HEAT: ${seq ? seq.heatLoad.toFixed(2) : "--"}`,
        `MODEL: ${seq?.realismLabel || getLandingRealismModel().label}`
      ].join("\n");
    }

    immersion.landingPulseLock = Math.max(0, immersion.landingPulseLock - dt);
    if (!eva.active && altitudeR < 0.085 && Math.abs(immersion.descentRps) > 0.08 && immersion.landingPulseLock <= 0) {
      triggerLandingPulse(1 + Math.abs(immersion.descentRps) * 2.4);
      immersion.landingPulseLock = 0.58;
    }

    // Crackle SFX disabled to keep immersion audio calm and non-fatiguing.
    surface.crackleLock = 0;
  }

  function syncZoomUi() {
    const d = camera.position.distanceTo(controls.target);
    const z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, ZOOM_BASE_DISTANCE / d));
    ui.zoomValue.textContent = `${z.toFixed(2)}x`;
    ui.zoomRange.value = z.toFixed(2);
  }

  function applyZoom(value) {
    if (eva.active) return;
    const z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
    const d = ZOOM_BASE_DISTANCE / z;
    const dir = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target.clone().add(dir.multiplyScalar(d)));
    ui.zoomValue.textContent = `${z.toFixed(2)}x`;
    ui.zoomRange.value = z.toFixed(2);
  }

  function updateStats() {
    const seq = surface.landingSequence;
    const simDays = getSimDaysTt();
    const focusId = surface.active && surface.targetId ? surface.targetId : explorerTargetId;
    const focusEntity = getEntityById(focusId);
    const climate = getCurrentClimate(focusId);
    const geo = geoProfiles[focusId] || null;
    const acousticClass = getAcousticClass(focusId);
    const utcIso = simClock.getFormattedUtc();
    const ttIso = simClock.getFormattedTt();
    const originShift = floatingOrigin.offset.length();
    const fcEntity = getEntityById(flightComputer.targetId || explorerTargetId || "sun");
    ui.stats.innerHTML =
      `اليوم المحاكى: ${Math.floor(simDays).toLocaleString("ar-DZ")}<br />` +
      `السنة الشمسية: ${(simDays / 365.256).toFixed(2)}<br />` +
      `UTC: ${utcIso}<br />` +
      `TT: ${ttIso}<br />` +
      `السرعة الزمنية: ${speed.toFixed(1)}x<br />` +
      `التكبير: ${ui.zoomRange.value}x<br />` +
      `FPS: ${fps.toFixed(0)}<br />` +
      `الهدف: ${focusEntity?.name || "الشمس"}<br />` +
      `الجاذبية: ${geo ? `${geo.gravity.toFixed(2)} m/s2` : "N/A"}<br />` +
      `الضغط: ${climate.pressureBar.toFixed(3)} bar<br />` +
      `الرياح: ${Math.round(climate.windKmh)} km/h<br />` +
      `الوضع: ${surface.active ? (surface.traverseMode ? "Surface Traverse" : "Surface Landing") : "Orbital Navigation"}<br />` +
      `EVA: ${eva.active ? "ON" : "OFF"}<br />` +
      `G-Force: ${immersion.gForce.toFixed(2)}g<br />` +
      `Landing Stage: ${seq ? getLandingStageLabel(seq.stage) : "N/A"}<br />` +
      `Landing Profile: ${seq?.profileTag || "DEFAULT"}<br />` +
      `Landing Model: ${seq?.realismLabel || getLandingRealismModel().label}<br />` +
      `Dynamic Q: ${seq?.active ? seq.dynamicPressure.toFixed(2) : (seq?.maxDynamicPressure?.toFixed(2) || "N/A")}<br />` +
      `Heat Load: ${seq?.active ? seq.heatLoad.toFixed(2) : (seq?.peakHeatLoad?.toFixed(2) || "N/A")}<br />` +
      `Landing Score: ${seq?.touchdownScore ?? "N/A"}<br />` +
      `Thruster: ${seq?.active ? `${Math.round(seq.thruster * 100)}%` : "Idle"}<br />` +
      `RCS: ${seq?.active ? `${Math.round(seq.correction * 100)}%` : "Stable"}<br />` +
      `Acoustic: ${acousticClass} / ${ui.audioMode.value}<br />` +
      `Terrain Detail: ${getTerrainDetailPreset().label}<br />` +
      `Ephemeris: ${ephemeris.getPreset().label}<br />` +
      `Flight Computer: ${(FLIGHT_MODE_LABEL[flightComputer.mode] || FLIGHT_MODE_LABEL.off).replace("FC: ", "")} (${fcEntity?.name || "—"})<br />` +
      `Origin Shift: ${originShift.toFixed(2)} u<br />` +
      `Render Tier: ${adaptiveQuality.tier}<br />` +
      `VR: ${immersion.enabled ? "Immersive ON" : "Immersive OFF"}<br />` +
      `وضع العرض: 4K Ready`;
  }

  function onClick(ev) {
    if (mouseContext.suppressClick) {
      mouseContext.suppressClick = false;
      return;
    }
    if (eva.active || mouseContext.open) return;
    const entity = pickEntityAtClient(ev.clientX, ev.clientY);
    if (!entity) return;
    setSelectedEntity(entity);
  }

  function onDoubleClick() {
    if (eva.active) return;
    if (mouseContext.open) {
      closeMouseMenu();
      return;
    }
    if (!selected?.id) return;
    beginExploreFlight(selected.id);
  }

  const RIGHT_CLICK_MENU_DRAG_PX = 8;

  function onCanvasPointerDown(ev) {
    if (ev.button !== 2) return;
    mouseContext.pointerDown = true;
    mouseContext.moved = 0;
    mouseContext.startX = ev.clientX;
    mouseContext.startY = ev.clientY;
  }

  function onCanvasPointerMove(ev) {
    if (!mouseContext.pointerDown) return;
    if ((ev.buttons & 2) === 0) return;
    const dx = ev.clientX - mouseContext.startX;
    const dy = ev.clientY - mouseContext.startY;
    mouseContext.moved = Math.max(mouseContext.moved, Math.hypot(dx, dy));
  }

  function onCanvasPointerUp(ev) {
    if (ev.button !== 2) return;
    mouseContext.pointerDown = false;
  }

  function onCanvasContextMenu(ev) {
    ev.preventDefault();
    if (eva.active) return;
    const dragDistance = mouseContext.moved;
    mouseContext.pointerDown = false;
    mouseContext.moved = 0;
    if (dragDistance > RIGHT_CLICK_MENU_DRAG_PX) {
      closeMouseMenu();
      return;
    }
    const entity = pickEntityAtClient(ev.clientX, ev.clientY);
    if (entity) setSelectedEntity(entity);
    openMouseMenu(ev.clientX, ev.clientY, entity?.id || getMouseTargetId());
  }

  function onMouseMenuClick(event) {
    const button = event.target.closest("button[data-menu-action]");
    if (!button) return;
    event.preventDefault();
    applyMouseMenuAction(button.dataset.menuAction);
  }

  function onDocumentPointerDown(event) {
    if (!mouseContext.open) return;
    if (ui.mouseMenu.contains(event.target)) return;
    const suppressClick = event.target === ui.canvas && event.button === 0;
    closeMouseMenu({ suppressClick });
  }

  function resize() {
    syncTouchUiMode();
    applyMobileStartupProfile();
    if (mouseContext.open) closeMouseMenu();
    const r = ui.canvas.getBoundingClientRect();
    applyRendererQualityFromSettings();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }

  function bindUi() {
    ui.uiDensityBtn.addEventListener("click", () => {
      applyUiDensity(!uiState.compact, true);
    });
    ui.toggleBtn.addEventListener("click", () => {
      running = !running;
      ui.toggleBtn.textContent = running ? "إيقاف" : "تشغيل";
    });
    ui.resetBtn.addEventListener("click", () => {
      exitSurfaceMode();
      setSimTimeJ2000();
      setFlightComputerMode("off");
      followId = null;
      explorerTargetId = "sun";
      setFocusValue("sun");
      climateAdjust.tempOffset = 0;
      climateAdjust.pressure = 1;
      climateAdjust.wind = 1;
      updateClimateLabels();
      controls.target.set(0, 0, 0);
      setCameraState();
      updateExplorerInfo("sun");
      renderScienceSources("sun");
      updateAudioFromSimulation();
    });
    ui.scopePresetBtn.addEventListener("click", () => {
      exitSurfaceMode();
      speed = 1.2;
      ui.speedRange.value = "1.2";
      ui.speedValue.textContent = "1.2x";
      followId = "sun";
      setFocusValue("sun");
      setCameraState();
      applyZoom(0.95);
    });
    ui.speedRange.addEventListener("input", (e) => {
      speed = Number(e.target.value);
      ui.speedValue.textContent = `${speed.toFixed(1)}x`;
    });
    ui.timeNowBtn.addEventListener("click", () => {
      setSimTimeNow();
    });
    ui.timeJ2000Btn.addEventListener("click", () => {
      setSimTimeJ2000();
    });
    ui.validationGoBtn.addEventListener("click", () => {
      applyValidationCheckpoint(ui.validationCheckpointSelect.value || "j2000", true);
    });
    ui.validationCheckpointSelect.addEventListener("change", () => {
      const cp = validationCheckpoints[ui.validationCheckpointSelect.value || "j2000"];
      setValidationStatus(`Validation: ${cp?.label || "READY"}`);
    });
    ui.orbitPrecisionSelect.addEventListener("change", (e) => {
      setEphemerisPreset(e.target.value || EPHEMERIS_PRESETS.precise.key, true);
    });
    ui.zoomRange.addEventListener("input", (e) => applyZoom(Number(e.target.value)));

    const handleFocusChange = (nextId) => {
      explorerTargetId = nextId || "sun";
      setFocusValue(explorerTargetId);
      if (surface.active) {
        if (isSurfaceLandable(explorerTargetId)) enterSurfaceMode(explorerTargetId);
        else exitSurfaceMode();
      }
      updateExplorerInfo(explorerTargetId);
      const entity = getEntityById(explorerTargetId);
      if (entity) {
        selected = entity;
        updateInfo(selected);
      }
      if (flightComputer.mode !== "off") {
        flightComputer.targetId = explorerTargetId;
        updateFlightComputerUi();
      }
      updateAudioFromSimulation();
      renderScienceSources(explorerTargetId);
    };

    ui.focusSelect.addEventListener("change", (e) => handleFocusChange(e.target.value || "sun"));
    ui.quickFocusSelect.addEventListener("change", (e) => handleFocusChange(e.target.value || "sun"));

    ui.quickExploreBtn.addEventListener("click", () => {
      const id = ui.quickFocusSelect.value || explorerTargetId || "sun";
      setFocusValue(id);
      beginExploreFlight(id);
    });
    ui.quickFollowBtn.addEventListener("click", () => {
      if (surface.active) exitSurfaceMode();
      followId = ui.quickFocusSelect.value || explorerTargetId || "sun";
      setFocusValue(followId);
      explorerTargetId = followId;
      if (flightComputer.mode !== "off") {
        flightComputer.targetId = explorerTargetId;
        updateFlightComputerUi();
      }
      setCameraState();
      updateExplorerInfo(explorerTargetId);
      renderScienceSources(explorerTargetId);
    });
    ui.quickLandBtn.addEventListener("click", () => {
      if (surface.active) {
        exitSurfaceMode();
        if (explorerTargetId) beginExploreFlight(explorerTargetId);
      } else {
        const id = ui.quickFocusSelect.value || selected?.id || "earth";
        setFocusValue(id);
        enterSurfaceMode(id);
        if (audio.enabled) triggerLandingPulse(0.8);
      }
      setSurfaceButtonsState();
    });
    ui.quickAudioBtn.addEventListener("click", () => {
      const next = !ui.audioEnable.checked;
      if (next && ui.audioMode.value === "off") {
        ui.audioMode.value = "realism";
      }
      ui.audioEnable.checked = next;
      setAudioEnabled(next);
      persistGlobalAudioSettings();
      updateQuickAudioButton();
    });

    ui.followBtn.addEventListener("click", () => {
      if (surface.active) exitSurfaceMode();
      followId = ui.focusSelect.value || "sun";
      setFocusValue(followId);
      explorerTargetId = followId;
      if (flightComputer.mode !== "off") {
        flightComputer.targetId = explorerTargetId;
        updateFlightComputerUi();
      }
      setCameraState();
      updateExplorerInfo(explorerTargetId);
      renderScienceSources(explorerTargetId);
    });
    ui.freeCamBtn.addEventListener("click", () => {
      exitSurfaceMode();
      followId = null;
      setFlightComputerMode("off");
      setCameraState();
    });
    ui.fcTargetBtn.addEventListener("click", () => {
      setFlightComputerMode("target", explorerTargetId || followId || "earth");
    });
    ui.fcProgradeBtn.addEventListener("click", () => {
      setFlightComputerMode("prograde", explorerTargetId || followId || "earth");
    });
    ui.fcRetrogradeBtn.addEventListener("click", () => {
      setFlightComputerMode("retrograde", explorerTargetId || followId || "earth");
    });
    ui.fcNormalBtn.addEventListener("click", () => {
      setFlightComputerMode("normal", explorerTargetId || followId || "earth");
    });
    ui.exploreBtn.addEventListener("click", () => {
      const id = ui.focusSelect.value || selected?.id || "sun";
      setFocusValue(id);
      beginExploreFlight(id);
    });
    ui.surfaceEnterBtn.addEventListener("click", () => {
      const id = ui.focusSelect.value || selected?.id || "earth";
      setFocusValue(id);
      enterSurfaceMode(id);
      if (audio.enabled) triggerLandingPulse(0.8);
    });
    ui.surfaceExitBtn.addEventListener("click", () => {
      exitSurfaceMode();
      if (explorerTargetId) beginExploreFlight(explorerTargetId);
    });
    ui.walkModeBtn.addEventListener("click", () => {
      toggleEvaMode();
    });
    ui.surfaceTraverseBtn.addEventListener("click", () => {
      setSurfaceTraverseMode(!surface.traverseMode);
    });
    ui.skyLookBtn.addEventListener("click", () => {
      triggerSkyLook();
    });
    ui.surfaceAltitudeRange.addEventListener("input", () => {
      updateSurfaceAltitudeLabel();
      if (surface.active) {
        if (!surface.traverseMode) {
          startSurfaceLandingSequence();
        }
      } else {
        applySurfaceDistance();
      }
    });
    ui.landingRealismSelect.addEventListener("change", (e) => {
      landingRealismMode = String(e.target.value || "realistic");
      updateLandingRealismUi();
      if (surface.active && !eva.active && !surface.traverseMode) {
        startSurfaceLandingSequence();
      }
      updateExplorerInfo(surface.targetId || explorerTargetId);
    });
    ui.terrainDetailSelect.addEventListener("change", (e) => {
      setTerrainDetailPreset(String(e.target.value || "balanced"), true);
    });
    ui.touchSensitivityRange.addEventListener("input", (e) => {
      controlPrefs.touchSensitivity = Number(e.target.value);
      updateTouchSensitivityLabel();
    });
    ui.touchSensitivityRangeVr.addEventListener("input", (e) => {
      controlPrefs.touchSensitivity = Number(e.target.value);
      updateTouchSensitivityLabel();
    });
    ui.handednessSelect.addEventListener("change", (e) => {
      applyHandedness(e.target.value);
    });
    ui.immersiveBtn.addEventListener("click", async () => {
      if (immersiveRestrictedMobile) {
        setValidationStatus("IMMERSIVE: DISABLED (MOBILE SAFE)", true);
        return;
      }
      await setImmersiveMode(!immersion.enabled);
      if (ui.audioEnable.checked && !audio.enabled) await setAudioEnabled(true);
    });
    ui.resetClimateBtn.addEventListener("click", () => applyClimatePreset("calm"));
    ui.tempOffsetRange.addEventListener("input", (e) => {
      climateAdjust.tempOffset = Number(e.target.value);
      updateClimateLabels();
      updateExplorerInfo();
      if (surface.active && surface.targetId) createSurfaceAtmosphere(surface.targetId);
      if (selected) updateInfo(selected);
      updateAudioFromSimulation();
    });
    ui.pressureRange.addEventListener("input", (e) => {
      climateAdjust.pressure = Number(e.target.value);
      updateClimateLabels();
      updateExplorerInfo();
      if (surface.active && surface.targetId) createSurfaceAtmosphere(surface.targetId);
      if (selected) updateInfo(selected);
      updateAudioFromSimulation();
    });
    ui.windRange.addEventListener("input", (e) => {
      climateAdjust.wind = Number(e.target.value);
      updateClimateLabels();
      updateExplorerInfo();
      if (surface.active && surface.targetId) createSurfaceAtmosphere(surface.targetId);
      if (selected) updateInfo(selected);
      updateAudioFromSimulation();
    });
    ui.presetCalmBtn.addEventListener("click", () => applyClimatePreset("calm"));
    ui.presetStormBtn.addEventListener("click", () => applyClimatePreset("storm"));
    ui.presetFreezeBtn.addEventListener("click", () => applyClimatePreset("freeze"));
    ui.presetHeatBtn.addEventListener("click", () => applyClimatePreset("heat"));

    ui.audioEnable.addEventListener("change", (e) => {
      if (ui.audioMode.value === "off" && e.target.checked) {
        ui.audioEnable.checked = false;
        setAudioEnabled(false);
        persistGlobalAudioSettings();
        return;
      }
      setAudioEnabled(e.target.checked);
      persistGlobalAudioSettings();
    });
    ui.audioVolume.addEventListener("input", (e) => {
      const value = Number(e.target.value);
      ui.audioVolumeValue.textContent = `${Math.round(value * 100)}%`;
      if (audio.ctx && audio.enabled) {
        audio.master.gain.setTargetAtTime(value, audio.ctx.currentTime, 0.1);
      }
      if (audio.enabled) setAudioStatus(`الصوت الغامر نشط (${ui.audioMode.value})`, true);
      persistGlobalAudioSettings();
    });
    ui.audioMode.addEventListener("change", () => {
      if (ui.audioMode.value === "off") {
        ui.audioEnable.checked = false;
        setAudioEnabled(false);
      } else if (!ui.audioEnable.checked) {
        ui.audioEnable.checked = true;
      }
      updateAudioFromSimulation();
      if (audio.enabled) setAudioStatus(`الصوت الغامر نشط (${ui.audioMode.value})`, true);
      persistGlobalAudioSettings();
    });

    ui.showOrbits.addEventListener("change", (e) => (settings.showOrbits = e.target.checked));
    ui.showInnerOrbits.addEventListener("change", (e) => (settings.showInnerOrbits = e.target.checked));
    ui.showAsteroids.addEventListener("change", (e) => (settings.showAsteroids = e.target.checked));
    ui.showComets.addEventListener("change", (e) => (settings.showComets = e.target.checked));
    ui.showDust.addEventListener("change", (e) => (settings.showDust = e.target.checked));
    ui.showTech.addEventListener("change", (e) => (settings.showTech = e.target.checked));
    ui.showLabels.addEventListener("change", (e) => (settings.showLabels = e.target.checked));
    ui.floatingOriginEnable.addEventListener("change", (e) => {
      settings.floatingOrigin = e.target.checked;
      floatingOrigin.enabled = settings.floatingOrigin;
    });

    controls.addEventListener("change", syncZoomUi);
    ui.canvas.addEventListener("pointerdown", (event) => {
      if (mouseContext.open && event.button !== 2) closeMouseMenu({ suppressClick: event.button === 0 });
      if (ui.audioEnable.checked && !audio.enabled) setAudioEnabled(true);
      if (eva.active && !eva.pointerLocked) requestEvaPointerLock();
    }, { passive: true });
    ui.canvas.addEventListener("pointerdown", onCanvasPointerDown, { passive: true });
    ui.canvas.addEventListener("pointermove", onCanvasPointerMove, { passive: true });
    ui.canvas.addEventListener("pointerup", onCanvasPointerUp, { passive: true });
    window.addEventListener("pointerup", onCanvasPointerUp, { passive: true });
    ui.canvas.addEventListener("pointercancel", () => {
      mouseContext.pointerDown = false;
      mouseContext.moved = 0;
    }, { passive: true });
    ui.canvas.addEventListener("wheel", () => {
      if (mouseContext.open) closeMouseMenu();
    }, { passive: true });
    ui.canvas.addEventListener("contextmenu", onCanvasContextMenu);
    ui.canvas.addEventListener("click", onClick);
    ui.canvas.addEventListener("dblclick", onDoubleClick);
    ui.mouseMenu.addEventListener("click", onMouseMenuClick);
    ui.mouseMenu.addEventListener("contextmenu", (event) => event.preventDefault());
    document.addEventListener("pointerdown", onDocumentPointerDown, true);
    document.addEventListener("pointerlockchange", onEvaPointerLockChange);
    document.addEventListener("mousemove", onEvaMouseMove, { passive: true });
    window.addEventListener("keydown", onSimKeyDown);
    window.addEventListener("keyup", onSimKeyUp);
    window.addEventListener("resize", resize);
    window.addEventListener("blur", onWindowBlur);
    document.addEventListener("visibilitychange", onVisibilityChange);
    ui.canvas.addEventListener("webglcontextlost", onWebGlContextLost, false);
    ui.canvas.addEventListener("webglcontextrestored", onWebGlContextRestored, false);
    window.addEventListener("storage", onOrbitCommandStorage);
    if (coarsePointerQuery) {
      if (typeof coarsePointerQuery.addEventListener === "function") {
        coarsePointerQuery.addEventListener("change", syncTouchUiMode);
      } else if (typeof coarsePointerQuery.addListener === "function") {
        coarsePointerQuery.addListener(syncTouchUiMode);
      }
    }
    window.addEventListener("adz:settings-changed", (event) => {
      if (!event.detail) return;
      handleGlobalSettingsChange(event.detail);
    });

    bindPad(ui.movePad, "moveActive");
    bindPad(ui.lookPad, "lookActive");
    ui.onScreenControls?.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("pointerdown", (e) => {
        const action = btn.dataset.action;
        if (action === "jump") touchControls.jumpHeld = true;
        if (action === "sprint" || action === "boost") touchControls.sprintHeld = true;
        if (action === "brake") touchControls.brakeHeld = true;
        if (action === "nav_toggle") setSpaceNavEnabled(!spaceNav.enabled);
        if (action === "speed_up") stepSpaceNavSpeed(1);
        if (action === "speed_down") stepSpaceNavSpeed(-1);
        if (action === "eva") toggleEvaMode();
        if (action === "hand") {
          const next = controlPrefs.handedness === "right" ? "left" : "right";
          applyHandedness(next);
        }
        if (action === "sky") triggerSkyLook();
        if (action === "immersive") {
          if (immersiveRestrictedMobile) {
            setValidationStatus("IMMERSIVE: DISABLED (MOBILE SAFE)", true);
            return;
          }
          setImmersiveMode(!immersion.enabled).catch(() => {
            // Ignore immersive toggle promise errors.
          });
        }
        if (action === "land") {
          const id = ui.focusSelect.value || selected?.id || "earth";
          enterSurfaceMode(id);
        }
        if (action === "exit") {
          exitSurfaceMode();
          if (explorerTargetId) beginExploreFlight(explorerTargetId);
        }
        if (action === "follow") {
          followId = ui.focusSelect.value || "sun";
          explorerTargetId = followId;
          if (flightComputer.mode !== "off") {
            flightComputer.targetId = explorerTargetId;
            updateFlightComputerUi();
          }
          setCameraState();
          updateExplorerInfo(explorerTargetId);
        }
        if (action === "free") {
          exitSurfaceMode();
          followId = null;
          flight.active = false;
          setFlightComputerMode("off");
          setCameraState();
        }
        if (action === "jump" || action === "sprint" || action === "boost" || action === "brake") btn.classList.add("active");
        e.preventDefault();
      });
      btn.addEventListener("pointerup", () => {
        const action = btn.dataset.action;
        if (action === "jump") touchControls.jumpHeld = false;
        if (action === "sprint" || action === "boost") touchControls.sprintHeld = false;
        if (action === "brake") touchControls.brakeHeld = false;
        if (action === "jump" || action === "sprint" || action === "boost" || action === "brake") btn.classList.remove("active");
      });
      btn.addEventListener("pointerleave", () => {
        const action = btn.dataset.action;
        if (action === "jump") touchControls.jumpHeld = false;
        if (action === "sprint" || action === "boost") touchControls.sprintHeld = false;
        if (action === "brake") touchControls.brakeHeld = false;
        if (action === "jump" || action === "sprint" || action === "boost" || action === "brake") btn.classList.remove("active");
      });
    });
  }

  function populateFocusList() {
    const options = [
      { id: "sun", name: "الشمس" },
      ...bodies.map((b) => ({ id: b.id, name: b.name })),
      ...moons.map((m) => ({ id: m.id, name: m.name })),
      ...comets.map((c) => ({ id: c.id, name: c.name }))
    ];
    ui.focusSelect.innerHTML = options.map((o) => `<option value="${o.id}">${o.name}</option>`).join("");
    ui.quickFocusSelect.innerHTML = ui.focusSelect.innerHTML;
    setFocusValue("sun");
  }

  function tick(now) {
    if (runtimeState.contextLost || runtimeState.pageHidden) {
      lastT = now;
      requestAnimationFrame(tick);
      return;
    }
    perfFrameCounter += 1;
    const dt = Math.min((now - lastT) / 1000, 0.1);
    const runHeavyUpdate = PERF.heavyUpdateDivider <= 1 || (perfFrameCounter % PERF.heavyUpdateDivider === 0);
    lastT = now;
    fpsFrames += 1;
    fpsTime += dt;
    if (fpsTime > 0.4) {
      fps = fpsFrames / fpsTime;
      fpsFrames = 0;
      fpsTime = 0;
    }

    if (running) simClock.advanceDays(dt * 9 * speed);
    if (surface.skyAssist > 0) {
      surface.skyAssist = Math.max(0, surface.skyAssist - dt);
      if (surface.skyAssist === 0 && surface.active) setSkyStatus("SKY: READY");
    }
    if (sunGlow) {
      const p = 1 + Math.sin(now * 0.00125) * 0.08;
      sunGlow.scale.set(26 * p, 26 * p, 1);
    }
    const starVis = surface.active ? THREE.MathUtils.clamp(surface.starVisibility, 0, 1) : 1;
    starTwinkle.forEach((m, i) => {
      const base = i === 0
        ? 0.58 + Math.sin(now * 0.0012) * 0.08
        : (i === 1
          ? 0.34 + Math.sin(now * 0.0009 + 1.2) * 0.07
          : 0.18 + Math.sin(now * 0.0006 + 0.5) * 0.04);
      m.opacity = base * starVis;
    });

    updateVirtualControls();
    updateSpaceEngineNavigation(dt);
    updatePositions(dt);
    updateFollow();
    updateFlightComputer();
    applyFloatingOrigin();
    updateSceneVisibility();
    if (runHeavyUpdate) updateBodyOrbitalVisuals(dt * PERF.heavyUpdateDivider);
    if (mobileLiteMode) {
      if (runHeavyUpdate) updateClimateVisuals();
    } else if (surface.active || runHeavyUpdate) {
      updateClimateVisuals();
    }
    controls.update();
    updateImmersiveFlight(dt);
    updateCameraClipRange();
    if (runHeavyUpdate) updateLabelReadability();
    updateStats();
    updateSpaceNavHud();
    updateAdaptiveQuality(dt);
    audioProbe += dt;
    if (audioProbe > adaptiveQuality.audioUpdateInterval) {
      audioProbe = 0;
      updateAudioFromSimulation();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  async function init() {
    syncTouchUiMode();
    const startupTier = adaptiveQuality.mobileHint ? (ultraLowEndMobile ? "eco" : "balanced") : "high";
    applyAdaptiveTier(startupTier);
    applyRendererQualityFromSettings();
    applyGlobalAudioSettingsToUi();
    resize();
    restoreUiDensity();
    applyMobileStartupProfile();
    restoreEphemerisPreset();
    restoreTerrainDetailPreset();
    if (mobileLiteMode) setTerrainDetailPreset("balanced", false);
    updateTimeScaleTag();
    updateFlightComputerUi();
    setValidationStatus("Validation: READY");
    if (mobilePerfGuard.emergency) setValidationStatus("MOBILE SAFE MODE: ON", true);
    ui.validationCheckpointSelect.value = "j2000";
    ui.floatingOriginEnable.checked = settings.floatingOrigin;
    bindUi();
    setSpaceNavEnabled(false);
    await setImmersiveMode(!immersiveRestrictedMobile && !mobileLiteMode, { allowFullscreen: false });
    armAudioUnlock();
    populateFocusList();
    setCameraState();
    updateInfo(null);
    updateClimateLabels();
    updateSurfaceAltitudeLabel();
    updateLandingRealismUi();
    updateTerrainDetailUi();
    applyHandedness("right");
    updateTouchSensitivityLabel();
    setSurfaceButtonsState();
    setWalkStatus("EVA: OFF");
    setSkyStatus("SKY: ORBIT MODE");
    updateExplorerInfo("sun");
    renderScienceSources("sun");
    setAudioStatus(ui.audioEnable.checked ? "جاهز للصوت - اضغط أي مكان" : "الصوت متوقف من الإعدادات");
    ui.speedValue.textContent = "1.0x";
    await buildScene();
    setTerrainDetailPreset(terrainDetailPreset, false);
    applyAdaptiveTier(adaptiveQuality.tier);
    updateSceneVisibility();
    consumeOrbitCommandFromStorage();
    applyZoom(Number(ui.zoomRange.value || 1));
    requestAnimationFrame((t) => {
      lastT = t;
      tick(t);
    });
  }

  init();
})();

