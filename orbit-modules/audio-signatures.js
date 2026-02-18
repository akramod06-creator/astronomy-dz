// Planetary audio identity multipliers for realism mode.

export const PLANET_AUDIO_SIGNATURES = {
    default: { baseMul: 1, bedMul: 1, oscMul: 1, wetMul: 1, cutoffMul: 1, windMul: 1, rumbleMul: 1, resonanceHz: 128, resonanceGain: 0.05, hissMul: 1 },
    sun: { baseMul: 0.9, bedMul: 1.18, oscMul: 1.24, wetMul: 0.56, cutoffMul: 0.92, windMul: 1.12, rumbleMul: 1.32, resonanceHz: 82, resonanceGain: 0.12, hissMul: 0.8 },
    mercury: { baseMul: 0.76, bedMul: 0.78, oscMul: 0.62, wetMul: 0.42, cutoffMul: 1.2, windMul: 0.2, rumbleMul: 0.7, resonanceHz: 164, resonanceGain: 0.03, hissMul: 0.32 },
    venus: { baseMul: 0.72, bedMul: 1.1, oscMul: 0.58, wetMul: 1.34, cutoffMul: 0.58, windMul: 1.24, rumbleMul: 1.42, resonanceHz: 74, resonanceGain: 0.14, hissMul: 1.18 },
    earth: { baseMul: 1.04, bedMul: 1.08, oscMul: 0.84, wetMul: 1.06, cutoffMul: 0.94, windMul: 1.05, rumbleMul: 1.02, resonanceHz: 112, resonanceGain: 0.08, hissMul: 1.06 },
    mars: { baseMul: 0.94, bedMul: 0.96, oscMul: 0.78, wetMul: 1.12, cutoffMul: 0.74, windMul: 1.32, rumbleMul: 0.94, resonanceHz: 101, resonanceGain: 0.1, hissMul: 1.2 },
    jupiter: { baseMul: 0.66, bedMul: 1.22, oscMul: 1.42, wetMul: 1.2, cutoffMul: 0.64, windMul: 1.4, rumbleMul: 1.62, resonanceHz: 58, resonanceGain: 0.18, hissMul: 0.86 },
    saturn: { baseMul: 0.68, bedMul: 1.16, oscMul: 1.24, wetMul: 1.12, cutoffMul: 0.68, windMul: 1.28, rumbleMul: 1.4, resonanceHz: 62, resonanceGain: 0.16, hissMul: 0.9 },
    uranus: { baseMul: 0.74, bedMul: 1.14, oscMul: 1.18, wetMul: 1.24, cutoffMul: 0.72, windMul: 1.22, rumbleMul: 1.34, resonanceHz: 65, resonanceGain: 0.14, hissMul: 0.96 },
    neptune: { baseMul: 0.7, bedMul: 1.2, oscMul: 1.26, wetMul: 1.28, cutoffMul: 0.66, windMul: 1.42, rumbleMul: 1.45, resonanceHz: 60, resonanceGain: 0.17, hissMul: 1.08 },
    titan: { baseMul: 0.74, bedMul: 1.24, oscMul: 0.62, wetMul: 1.46, cutoffMul: 0.54, windMul: 1.06, rumbleMul: 1.22, resonanceHz: 69, resonanceGain: 0.16, hissMul: 1.28 },
    moon: { baseMul: 0.78, bedMul: 0.82, oscMul: 0.68, wetMul: 0.48, cutoffMul: 1.14, windMul: 0.22, rumbleMul: 0.74, resonanceHz: 142, resonanceGain: 0.03, hissMul: 0.34 },
    pluto: { baseMul: 0.82, bedMul: 0.9, oscMul: 0.74, wetMul: 0.96, cutoffMul: 0.8, windMul: 0.62, rumbleMul: 0.82, resonanceHz: 118, resonanceGain: 0.07, hissMul: 0.82 }
  };
