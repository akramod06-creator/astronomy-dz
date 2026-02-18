// Orbit-only ephemeris engine.
// Current implementation: Kepler solver with selectable precision tiers.
// Future extension point: JPL/NAIF kernels.

const TWO_PI = Math.PI * 2;

export const EPHEMERIS_PRESETS = {
  fast: {
    key: "fast",
    label: "Kepler Fast",
    keplerIterations: 7,
    moonInclinationMul: 0.22,
    cometTailBase: 3.6,
    cometTailScale: 130
  },
  precise: {
    key: "precise",
    label: "Kepler Precise",
    keplerIterations: 12,
    moonInclinationMul: 0.24,
    cometTailBase: 4,
    cometTailScale: 140
  },
  research: {
    key: "research",
    label: "Kepler Research",
    keplerIterations: 18,
    moonInclinationMul: 0.26,
    cometTailBase: 4.3,
    cometTailScale: 150
  }
};

const normalizeAngle = (angle) => ((angle % TWO_PI) + TWO_PI) % TWO_PI;

const solveKepler = (meanAnomaly, eccentricity, iterations) => {
  let E = meanAnomaly;
  for (let i = 0; i < iterations; i += 1) {
    E -= (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
  }
  return E;
};

const computeOrbitalPosition = (def, day, settings) => {
  const n = TWO_PI / def.period;
  const meanAnomaly0 = def.M0 ?? normalizeAngle(def.L0 * settings.DEG - (def.w + def.O) * settings.DEG);
  const M = normalizeAngle(meanAnomaly0 + n * day);
  const E = solveKepler(M, def.e, settings.preset.keplerIterations);
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + def.e) * Math.sin(E / 2),
    Math.sqrt(1 - def.e) * Math.cos(E / 2)
  );
  const r = def.a * (1 - def.e * Math.cos(E));
  const arg = def.w * settings.DEG + nu;
  const O = def.O * settings.DEG;
  const inc = def.i * settings.DEG;

  return {
    x: (r * (Math.cos(O) * Math.cos(arg) - Math.sin(O) * Math.sin(arg) * Math.cos(inc))) * settings.AU,
    y: (r * Math.sin(arg) * Math.sin(inc)) * settings.AU,
    z: (r * (Math.sin(O) * Math.cos(arg) + Math.cos(O) * Math.sin(arg) * Math.cos(inc))) * settings.AU
  };
};

export const createEphemerisEngine = (options = {}) => {
  const settings = {
    AU: options.AU ?? 22,
    DEG: options.DEG ?? (Math.PI / 180),
    preset: EPHEMERIS_PRESETS[options.defaultPreset] || EPHEMERIS_PRESETS.precise
  };

  const setPreset = (key) => {
    settings.preset = EPHEMERIS_PRESETS[key] || EPHEMERIS_PRESETS.precise;
    return settings.preset;
  };

  const getPreset = () => settings.preset;

  const getBodyPosition = (def, day) => computeOrbitalPosition(def, day, settings);

  const getMoonPosition = (def, day, hostPosition) => {
    const a = day * (TWO_PI / def.period) + def.phase;
    return {
      x: hostPosition.x + Math.cos(a) * def.orbitR,
      y: hostPosition.y + Math.sin(a * def.tilt) * (def.orbitR * settings.preset.moonInclinationMul),
      z: hostPosition.z + Math.sin(a) * def.orbitR
    };
  };

  const getCometPosition = (def, day) => computeOrbitalPosition(def, day, settings);

  const getCometTailLength = (distanceUnits) => {
    const d = Math.max(1, distanceUnits);
    return Math.min(22, settings.preset.cometTailBase + settings.preset.cometTailScale / d);
  };

  return {
    setPreset,
    getPreset,
    getBodyPosition,
    getMoonPosition,
    getCometPosition,
    getCometTailLength
  };
};
