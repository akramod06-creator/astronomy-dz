# Orbit Interface Roadmap (Space-Engine Direction)

Scope: `orbit.html`, `orbit.js`, and `orbit-modules/*` only.

## Phase 1: Simulation Core (current sprint)
- Add swappable ephemeris engine abstraction (done).
- Keep current Kepler model as baseline with selectable precision tiers.
- Prepare integration point for external kernels (JPL/NAIF) without UI rewrite.

## Phase 2: Precision Upgrade
- Add high-precision time pipeline (TT/UTC separation for ephemerides).
- Add origin-rebasing / camera-relative transforms for deep-space stability.
- Add deterministic validation scenes (Earth-Moon-Mars checkpoints by date).

## Phase 3: Planetary Rendering
- Terrain LOD (chunked quadtree for near-surface detail).
- Atmospheric scattering model (space-to-ground continuity).
- Volumetric cloud/haze layers tied to climate profiles.

## Phase 4: Navigation & Immersion
- Flight computer (prograde/retrograde/normal/target vectors).
- Maneuver planner HUD with burn preview.
- Instrument-grade telemetry widgets and docking-style reticle modes.

## Phase 5: Data Integration
- Add optional JPL DE ephemeris mode.
- Add NAIF/SPICE ingest bridge for mission scenarios.
- Add cache/version strategy for large scientific datasets.

## Acceptance Targets
- Stable 60 FPS desktop / 30+ FPS mobile in orbital mode.
- Deterministic orbit playback for fixed timestamps.
- Visual transition continuity from orbit to descent with no camera jitter.
