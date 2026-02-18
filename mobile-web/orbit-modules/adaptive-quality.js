export const ADAPTIVE_QUALITY_PROFILES = {
  high: { pixel: 1, star: 1, weather: 1, audioTick: 0.15, hideDust: false, hideLabels: false, hideTech: false },
  balanced: { pixel: 0.82, star: 0.72, weather: 0.84, audioTick: 0.2, hideDust: false, hideLabels: false, hideTech: false },
  eco: { pixel: 0.66, star: 0.46, weather: 0.65, audioTick: 0.28, hideDust: true, hideLabels: true, hideTech: true }
};

export function pickAdaptiveTier({ mobileHint, sampledFps, currentTier }) {
  let nextTier = currentTier;
  if (mobileHint) {
    if (currentTier === "high") nextTier = "balanced";
    if (sampledFps < 27 && currentTier !== "eco") nextTier = "eco";
    else if (sampledFps > 48 && currentTier === "eco") nextTier = "balanced";
  } else {
    if (sampledFps < 36 && currentTier === "high") nextTier = "balanced";
    if (sampledFps > 52 && currentTier !== "high") nextTier = "high";
  }
  return nextTier;
}
