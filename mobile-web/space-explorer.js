import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js";

(() => {
  const ui = {
    viewport: document.getElementById("viewport"),
    planetSelect: document.getElementById("planetSelect"),
    landBtn: document.getElementById("landBtn"),
    orbitBtn: document.getElementById("orbitBtn"),
    walkBtn: document.getElementById("walkBtn"),
    soundBtn: document.getElementById("soundBtn"),
    status: document.getElementById("status"),
    info: document.getElementById("info"),
    hudLeft: document.getElementById("hudLeft"),
    hudRight: document.getElementById("hudRight"),
    reticle: document.getElementById("reticle"),
    paneHost: document.getElementById("paneHost")
  };
  if (Object.values(ui).some((v) => !v)) return;

  const PLANETS = {
    mercury: { ar: "عطارد", gravity: 3.7, tempC: 167, pressureBar: 0, windKmh: 0, orbitAU: 0.39, orbitDays: 88, radius: 1.1, color: 0xa4aab4, env: "airless", solid: true, reliefKm: 10, tex: "mercury" },
    venus: { ar: "الزهرة", gravity: 8.87, tempC: 464, pressureBar: 92, windKmh: 360, orbitAU: 0.72, orbitDays: 225, radius: 1.45, color: 0xd9b58b, env: "dense", solid: true, reliefKm: 13, tex: "venus" },
    earth: { ar: "الأرض", gravity: 9.81, tempC: 15, pressureBar: 1, windKmh: 35, orbitAU: 1, orbitDays: 365, radius: 1.52, color: 0x76adff, env: "sky", solid: true, reliefKm: 20, tex: "earth" },
    mars: { ar: "المريخ", gravity: 3.71, tempC: -63, pressureBar: 0.006, windKmh: 60, orbitAU: 1.52, orbitDays: 687, radius: 1.24, color: 0xc67b58, env: "dust", solid: true, reliefKm: 29, tex: "mars" },
    jupiter: { ar: "المشتري", gravity: 24.79, tempC: -145, pressureBar: 2.2, windKmh: 540, orbitAU: 5.2, orbitDays: 4333, radius: 3.1, color: 0xe0bf98, env: "gas", solid: false, reliefKm: 90, tex: "jupiter" },
    saturn: { ar: "زحل", gravity: 10.44, tempC: -178, pressureBar: 1.4, windKmh: 1400, orbitAU: 9.58, orbitDays: 10759, radius: 2.8, color: 0xd7c3a2, env: "gas", solid: false, reliefKm: 70, tex: "saturn" },
    uranus: { ar: "أورانوس", gravity: 8.69, tempC: -224, pressureBar: 1.2, windKmh: 900, orbitAU: 19.2, orbitDays: 30687, radius: 2.1, color: 0x9bcfe0, env: "icegas", solid: false, reliefKm: 45, tex: "uranus" },
    neptune: { ar: "نبتون", gravity: 11.15, tempC: -214, pressureBar: 1.5, windKmh: 2100, orbitAU: 30.1, orbitDays: 60190, radius: 2.05, color: 0x7ba1e4, env: "icegas", solid: false, reliefKm: 80, tex: "neptune" },
    pluto: { ar: "بلوتو", gravity: 0.62, tempC: -229, pressureBar: 0.00001, windKmh: 12, orbitAU: 39.5, orbitDays: 90560, radius: 0.62, color: 0xc6c8ce, env: "ice", solid: true, reliefKm: 5.5, tex: "pluto" }
  };

  const settings = { tempOffset: 0, pressureScale: 1, windScale: 1, weatherFx: true, audioMaster: 0.45, orbitSpeed: 1.2 };
  const sim = { mode: "orbit", selected: "earth", orbitTime: 0, landing: 0, walk: false, audio: false, pointerLocked: false };
  const keys = {};
  const surface = { terrain: null, terrainSize: 920, weather: null, weatherTime: 0, target: null, eyeHeight: 1.7, heightFn: null, yaw: 0, pitch: 0, patchU: 0.5, patchV: 0.5, patchSpan: 0.16, dynamic: [] };
  const textures = new Map();
  const reliefs = new Map();
  const planets = new Map();
  const AU = 20;

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(ui.viewport.clientWidth, ui.viewport.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  ui.viewport.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const SPACE_BG = new THREE.Color(0x030711);
  scene.background = SPACE_BG.clone();
  scene.fog = new THREE.FogExp2(0x070b15, 0.00028);
  const camera = new THREE.PerspectiveCamera(58, ui.viewport.clientWidth / ui.viewport.clientHeight, 0.1, 9000);
  camera.position.set(0, 80, 220);
  scene.add(camera);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;

  const groups = { stars: new THREE.Group(), orbit: new THREE.Group(), solar: new THREE.Group(), surface: new THREE.Group() };
  groups.surface.visible = false;
  scene.add(groups.stars, groups.orbit, groups.solar, groups.surface);
  scene.add(new THREE.AmbientLight(0x90b6e2, 0.25));
  scene.add(new THREE.HemisphereLight(0xb7d4ff, 0x1e2430, 0.3));
  scene.add(new THREE.PointLight(0xffe1af, 4.2, 0, 2));
  groups.solar.add(new THREE.Mesh(new THREE.SphereGeometry(5.4, 72, 72), new THREE.MeshStandardMaterial({ color: 0xffc06e, emissive: 0xff9a42, emissiveIntensity: 1.2 })));

  const audio = { ctx: null, master: null, noiseGain: null, rumbleGain: null, toneGain: null, noiseFilter: null, rumbleOsc: null, toneOsc: null };
  let last = 0;

  init();

  async function init() {
    buildStars();
    await loadAssets();
    buildPlanets();
    buildPanel();
    fillSelect();
    bindUI();
    updateInfo();
    updateHud();
    setStatus("الحالة: وضع مداري");
    renderer.setAnimationLoop((t) => tick(t * 0.001));
  }

  function climate(p) { return { tempC: p.tempC + settings.tempOffset, pressureBar: Math.max(0, p.pressureBar * settings.pressureScale), windKmh: Math.max(0, p.windKmh * settings.windScale) }; }
  function setStatus(s) { ui.status.textContent = s; }

  function loadTex(url) { return new Promise((resolve) => { new THREE.TextureLoader().load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); resolve(t); }, undefined, () => resolve(null)); }); }

  function reliefFromTexture(tex, rocky) {
    if (!tex?.image) return null;
    const w = 512, h = 256;
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(tex.image, 0, 0, w, h);
    const src = x.getImageData(0, 0, w, h).data;
    const arr = new Float32Array(w * h);
    for (let y = 0; y < h; y += 1) {
      const yN = y > 0 ? y - 1 : y, yS = y < h - 1 ? y + 1 : y;
      for (let xx = 0; xx < w; xx += 1) {
        const xL = xx > 0 ? xx - 1 : w - 1, xR = xx < w - 1 ? xx + 1 : 0;
        const i = y * w + xx, p = i * 4;
        const pN = (yN * w + xx) * 4, pS = (yS * w + xx) * 4, pL = (y * w + xL) * 4, pR = (y * w + xR) * 4;
        const c0 = (src[p] * 0.2126 + src[p + 1] * 0.7152 + src[p + 2] * 0.0722) / 255;
        const n = (src[pN] * 0.2126 + src[pN + 1] * 0.7152 + src[pN + 2] * 0.0722) / 255;
        const s = (src[pS] * 0.2126 + src[pS + 1] * 0.7152 + src[pS + 2] * 0.0722) / 255;
        const l = (src[pL] * 0.2126 + src[pL + 1] * 0.7152 + src[pL + 2] * 0.0722) / 255;
        const r = (src[pR] * 0.2126 + src[pR + 1] * 0.7152 + src[pR + 2] * 0.0722) / 255;
        const edge = Math.abs(c0 - n) + Math.abs(c0 - s) + Math.abs(c0 - l) + Math.abs(c0 - r);
        arr[i] = THREE.MathUtils.clamp(c0 * 0.62 + edge * (rocky ? 0.78 : 0.4), 0, 1);
      }
    }
    const out = document.createElement("canvas"); out.width = w; out.height = h;
    const ox = out.getContext("2d"); const img = ox.createImageData(w, h);
    for (let i = 0; i < arr.length; i += 1) { const v = Math.round(arr[i] * 255), p = i * 4; img.data[p] = v; img.data[p + 1] = v; img.data[p + 2] = v; img.data[p + 3] = 255; }
    ox.putImageData(img, 0, 0);
    const map = new THREE.CanvasTexture(out);
    map.colorSpace = THREE.NoColorSpace; map.wrapS = THREE.RepeatWrapping; map.wrapT = THREE.ClampToEdgeWrapping; map.needsUpdate = true;
    return { map, arr, w, h };
  }

  function sampleRelief(r, u, v) {
    if (!r) return 0;
    const uu = ((u % 1) + 1) % 1, vv = THREE.MathUtils.clamp(v, 0, 1);
    const x = uu * (r.w - 1), y = vv * (r.h - 1), x0 = Math.floor(x), y0 = Math.floor(y), x1 = (x0 + 1) % r.w, y1 = Math.min(r.h - 1, y0 + 1), tx = x - x0, ty = y - y0;
    const i00 = y0 * r.w + x0, i10 = y0 * r.w + x1, i01 = y1 * r.w + x0, i11 = y1 * r.w + x1;
    const h0 = r.arr[i00] * (1 - tx) + r.arr[i10] * tx, h1 = r.arr[i01] * (1 - tx) + r.arr[i11] * tx;
    return h0 * (1 - ty) + h1 * ty;
  }

  async function loadAssets() {
    await Promise.all(Object.entries(PLANETS).map(async ([id, p]) => {
      const tex = await loadTex(`assets/textures/${p.tex}.jpg`);
      if (!tex) return;
      tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping;
      textures.set(id, tex);
      const rel = reliefFromTexture(tex, p.solid);
      if (rel) reliefs.set(id, rel);
    }));
  }

  function buildPanel() {
    ui.paneHost.innerHTML = `<div style="min-width:230px;background:rgba(6,14,28,.78);border:1px solid rgba(130,184,255,.24);border-radius:10px;padding:10px;color:#d8e9ff;font-size:12px;line-height:1.6">
      <div style="font-weight:700;margin-bottom:6px">Climate Panel</div>
      <label style="display:grid;gap:4px;margin-bottom:6px">Temp <input id="sxTemp" type="range" min="-220" max="220" step="1" value="0" /></label>
      <label style="display:grid;gap:4px;margin-bottom:6px">Pressure <input id="sxPressure" type="range" min="0.1" max="4" step="0.01" value="1" /></label>
      <label style="display:grid;gap:4px;margin-bottom:6px">Wind <input id="sxWind" type="range" min="0" max="4" step="0.01" value="1" /></label>
      <label style="display:grid;gap:4px;margin-bottom:6px">Orbit <input id="sxOrbit" type="range" min="0.1" max="20" step="0.1" value="1.2" /></label>
      <label style="display:flex;align-items:center;gap:6px"><input id="sxWeather" type="checkbox" checked />Weather FX</label>
    </div>`;
    const t = document.getElementById("sxTemp"), p = document.getElementById("sxPressure"), w = document.getElementById("sxWind"), o = document.getElementById("sxOrbit"), fx = document.getElementById("sxWeather");
    t?.addEventListener("input", () => { settings.tempOffset = Number(t.value); updateInfo(); });
    p?.addEventListener("input", () => { settings.pressureScale = Number(p.value); updateInfo(); });
    w?.addEventListener("input", () => { settings.windScale = Number(w.value); updateInfo(); });
    o?.addEventListener("input", () => { settings.orbitSpeed = Number(o.value); updateHud(); });
    fx?.addEventListener("change", () => { settings.weatherFx = fx.checked; updateHud(); });
  }

  function buildStars() {
    const n = 11000, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i += 1) {
      const r = 1200 + Math.random() * 2800, a = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(p) * Math.cos(a); pos[i * 3 + 1] = r * Math.cos(p); pos[i * 3 + 2] = r * Math.sin(p) * Math.sin(a);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    groups.stars.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xe4efff, size: 1.1, opacity: 0.7, transparent: true, depthWrite: false })));
  }

  function buildPlanets() {
    Object.entries(PLANETS).forEach(([id, p], i) => {
      const tex = textures.get(id) || null, rel = reliefs.get(id) || null;
      const mat = new THREE.MeshStandardMaterial({ map: tex, color: tex ? 0xffffff : p.color, roughness: p.solid ? 0.92 : 0.86, metalness: 0 });
      if (rel) {
        const m = THREE.MathUtils.clamp(p.reliefKm / 30, 0.2, 3), base = p.solid ? 0.028 : 0.01;
        mat.displacementMap = rel.map; mat.displacementScale = p.radius * base * m; mat.displacementBias = -mat.displacementScale * 0.5; mat.bumpMap = rel.map; mat.bumpScale = mat.displacementScale * (p.solid ? 0.65 : 0.35);
      }
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.radius, 92, 92), mat);
      mesh.position.set(p.orbitAU * AU, 0, 0); groups.solar.add(mesh); planets.set(id, { mesh, def: p, a: (i / 9) * Math.PI * 2 });
      const pts = []; for (let k = 0; k <= 220; k += 1) { const ang = (k / 220) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(ang) * p.orbitAU * AU, 0, Math.sin(ang) * p.orbitAU * AU)); }
      groups.orbit.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x85b8ee, transparent: true, opacity: 0.28 })));
    });
  }

  function fillSelect() { ui.planetSelect.innerHTML = Object.entries(PLANETS).map(([id, p]) => `<option value="${id}">${p.ar}</option>`).join(""); ui.planetSelect.value = sim.selected; }

  function bindUI() {
    ui.planetSelect.addEventListener("change", () => { sim.selected = ui.planetSelect.value; updateInfo(); updateHud(); });
    ui.landBtn.addEventListener("click", startLanding);
    ui.orbitBtn.addEventListener("click", goOrbit);
    ui.walkBtn.addEventListener("click", toggleWalk);
    ui.soundBtn.addEventListener("click", () => toggleAudio());
    window.addEventListener("keydown", (e) => { keys[e.code] = true; });
    window.addEventListener("keyup", (e) => { keys[e.code] = false; });
    window.addEventListener("resize", onResize);
    renderer.domElement.addEventListener("click", () => { if (sim.mode === "surface" && sim.walk && !sim.pointerLocked) renderer.domElement.requestPointerLock(); if (!sim.audio) toggleAudio(true); });
    document.addEventListener("pointerlockchange", () => { sim.pointerLocked = document.pointerLockElement === renderer.domElement; if (!sim.pointerLocked) { sim.walk = false; ui.walkBtn.textContent = "تفعيل التجول"; ui.reticle.style.opacity = "0"; } });
    document.addEventListener("mousemove", (e) => { if (!(sim.mode === "surface" && sim.walk && sim.pointerLocked)) return; const s = 0.0023; surface.yaw -= e.movementX * s; surface.pitch -= e.movementY * s; surface.pitch = THREE.MathUtils.clamp(surface.pitch, -1.45, 1.45); camera.rotation.order = "YXZ"; camera.rotation.y = surface.yaw; camera.rotation.x = surface.pitch; });
  }

  function toggleWalk() {
    if (sim.mode !== "surface") return;
    sim.walk = !sim.walk; ui.walkBtn.textContent = sim.walk ? "إيقاف التجول" : "تفعيل التجول"; ui.reticle.style.opacity = sim.walk ? "0.9" : "0";
    if (sim.walk && !sim.pointerLocked) renderer.domElement.requestPointerLock();
    if (!sim.walk && sim.pointerLocked) document.exitPointerLock();
  }

  function updateInfo() {
    const p = PLANETS[sim.selected], c = climate(p);
    ui.info.textContent = `الكوكب: ${p.ar}\nالنوع: ${p.solid ? "سطح صلب" : "عملاق غازي (لا سطح صلب)"}\nالتضرس التقريبي: ${p.reliefKm.toFixed(1)} كم\nالجاذبية: ${p.gravity.toFixed(2)} m/s²\nالحرارة: ${c.tempC.toFixed(1)} C\nالضغط: ${c.pressureBar.toFixed(4)} bar\nالرياح: ${Math.round(c.windKmh)} km/h\nReal Texture: ${textures.has(sim.selected) ? "مفعل" : "غير متاح"}\nالمصدر العلمي: NASA / JPL`;
  }

  function updateHud() {
    const p = PLANETS[sim.selected];
    ui.hudLeft.textContent = `MODE: ${sim.mode.toUpperCase()}\nPLANET: ${p.ar}\nWALK: ${sim.walk ? "ON" : "OFF"}`;
    ui.hudRight.textContent = `AUDIO: ${sim.audio ? "ON" : "OFF"}\nWEATHER: ${settings.weatherFx ? "ON" : "OFF"}\nORBIT: ${settings.orbitSpeed.toFixed(1)}x`;
  }

  function skyPreset(env) {
    if (env === "gas") return { c: 0xb8a486, fog: 0x9a8367, d: 0.0019, o: 0.82 };
    if (env === "icegas") return { c: 0x8db2d2, fog: 0x7d9cbb, d: 0.00175, o: 0.78 };
    if (env === "dense") return { c: 0xd09c67, fog: 0xbe8b5d, d: 0.0015, o: 0.74 };
    if (env === "dust") return { c: 0xbb825d, fog: 0xad784f, d: 0.0013, o: 0.66 };
    if (env === "ice") return { c: 0xa4c8e4, fog: 0x8db2cf, d: 0.0009, o: 0.45 };
    if (env === "sky") return { c: 0x7ca6d5, fog: 0x7b9abf, d: 0.0011, o: 0.62 };
    return { c: 0x111828, fog: 0x0d1321, d: 0.00025, o: 0.15 };
  }

  function baseHeight(x, z, env) { const h = Math.sin(x * 0.021) * 2.8 + Math.cos(z * 0.017) * 2.3 + Math.sin((x + z) * 0.007) * 1.9; return env === "ice" ? h * 0.55 : (env === "dust" ? h : h * 0.75); }
  function sampleHeight(x, z, env) { return surface.heightFn ? surface.heightFn(x, z) : baseHeight(x, z, env); }

  function patchTexture(base, u, v, span) {
    if (!base) return null;
    const t = base.clone(); t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping; t.repeat.set(span, span); t.offset.set(u - span * 0.5, 1 - (v + span * 0.5)); t.colorSpace = base.colorSpace; t.anisotropy = base.anisotropy; t.needsUpdate = true; surface.dynamic.push(t); return t;
  }

  function makeHeightFn(id, env) {
    const p = PLANETS[id], r = reliefs.get(id) || null, size = surface.terrainSize;
    surface.patchSpan = THREE.MathUtils.clamp(0.13 + p.radius * 0.008, 0.13, 0.22);
    surface.patchU = (Math.sin(sim.orbitTime * 0.17 + id.length * 0.91) + 1) * 0.5;
    surface.patchV = THREE.MathUtils.clamp((Math.cos(sim.orbitTime * 0.11 + id.length * 0.67) + 1) * 0.5, 0.12, 0.88);
    const amp = THREE.MathUtils.clamp(p.reliefKm * 0.16, 0.8, 10.5);
    return (x, z) => {
      const u = surface.patchU + (x / size) * surface.patchSpan, v = surface.patchV + (z / size) * surface.patchSpan;
      return (sampleRelief(r, u, v) - 0.5) * amp + baseHeight(x, z, env) * 0.3;
    };
  }

  function clearSurface() {
    if (surface.weather?.points?.parent) camera.remove(surface.weather.points);
    surface.weather?.points?.geometry?.dispose?.(); surface.weather?.points?.material?.dispose?.(); surface.weather = null; surface.weatherTime = 0;
    for (const ch of groups.surface.children) { ch.geometry?.dispose?.(); if (ch.material?.map && surface.dynamic.includes(ch.material.map)) ch.material.map.dispose(); if (ch.material?.bumpMap && surface.dynamic.includes(ch.material.bumpMap)) ch.material.bumpMap.dispose(); ch.material?.dispose?.(); }
    groups.surface.clear(); surface.dynamic.forEach((t) => t.dispose?.()); surface.dynamic = []; surface.terrain = null; surface.target = null; surface.heightFn = null;
  }

  function buildSurface(p) {
    clearSurface(); groups.surface.visible = true; groups.solar.visible = false; groups.orbit.visible = false; groups.stars.visible = p.env === "airless" || p.env === "ice"; surface.target = p;
    const s = skyPreset(p.env); scene.background.set(s.fog); scene.fog.color.set(s.fog); scene.fog.density = s.d;
    groups.surface.add(new THREE.HemisphereLight(0xbdd9ff, 0x1c2430, 0.48));
    const d = new THREE.DirectionalLight(0xffe8cb, 1.1); d.position.set(180, 240, 120); groups.surface.add(d);
    groups.surface.add(new THREE.Mesh(new THREE.SphereGeometry(1800, 44, 44), new THREE.MeshBasicMaterial({ color: s.c, transparent: true, opacity: s.o, side: THREE.BackSide, depthWrite: false })));
    if (p.solid) {
      surface.eyeHeight = 1.72; surface.heightFn = makeHeightFn(sim.selected, p.env);
      const size = surface.terrainSize, g = new THREE.PlaneGeometry(size, size, 150, 150); g.rotateX(-Math.PI / 2); const arr = g.attributes.position;
      for (let i = 0; i < arr.count; i += 1) arr.setY(i, surface.heightFn(arr.getX(i), arr.getZ(i)));
      g.computeVertexNormals();
      const base = textures.get(sim.selected) || null, rel = reliefs.get(sim.selected) || null, map = patchTexture(base, surface.patchU, surface.patchV, surface.patchSpan), bump = rel ? patchTexture(rel.map, surface.patchU, surface.patchV, surface.patchSpan) : null;
      surface.terrain = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map, color: map ? 0xffffff : (p.env === "ice" ? 0xb8d2df : (p.env === "dust" ? 0xae7853 : 0x8f9199)), roughness: p.env === "ice" ? 0.36 : 0.9, metalness: p.env === "ice" ? 0.08 : 0, bumpMap: bump, bumpScale: p.reliefKm * 0.016 }));
      groups.surface.add(surface.terrain); camera.position.set(0, 42, 70);
    } else {
      surface.eyeHeight = 0.6; surface.heightFn = null;
      groups.surface.add(new THREE.Mesh(new THREE.SphereGeometry(420, 42, 42), new THREE.MeshBasicMaterial({ color: p.env === "icegas" ? 0x8cb0d0 : 0xc2ae8c, transparent: true, opacity: 0.28, side: THREE.BackSide, depthWrite: false })));
      camera.position.set(0, 120, 90);
    }
    camera.lookAt(0, p.solid ? 6 : 40, -50); surface.yaw = camera.rotation.y; surface.pitch = camera.rotation.x; buildWeather(p);
  }

  function buildWeather(p) {
    if (!settings.weatherFx) return;
    const gas = p.env === "gas" || p.env === "icegas", count = gas ? 1800 : (p.env === "ice" ? 1200 : 900), pos = new Float32Array(count * 3), vel = new Float32Array(count * 3), ang = new Float32Array(count), rad = new Float32Array(count), b = p.solid ? 34 : 48;
    for (let i = 0; i < count; i += 1) {
      const k = i * 3;
      if (gas) { ang[i] = Math.random() * Math.PI * 2; rad[i] = 1 + Math.random() * b * 0.86; pos[k] = Math.cos(ang[i]) * rad[i]; pos[k + 1] = (Math.random() * 2 - 1) * b; pos[k + 2] = -Math.random() * b * 2; vel[k] = 0.8 + Math.random() * 1.8; vel[k + 1] = (Math.random() * 2 - 1) * 0.3; vel[k + 2] = 1.5 + Math.random() * 2.4; }
      else { pos[k] = (Math.random() * 2 - 1) * b; pos[k + 1] = (Math.random() * 2 - 1) * b; pos[k + 2] = -Math.random() * b * 2; vel[k] = p.env === "ice" ? (Math.random() * 2 - 1) * 0.2 : 1.0 + Math.random() * 1.8; vel[k + 1] = p.env === "ice" ? -0.8 - Math.random() * 1.1 : (Math.random() * 2 - 1) * 0.35; vel[k + 2] = 1.2 + Math.random() * 2.2; }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const color = p.env === "ice" ? 0xe4f2ff : (p.env === "icegas" ? 0xc2d9ed : 0xe0ceb8), opacityBase = p.env === "ice" ? 0.5 : (gas ? 0.42 : 0.34);
    const points = new THREE.Points(g, new THREE.PointsMaterial({ color, size: p.env === "ice" ? 0.11 : (gas ? 0.12 : 0.16), transparent: true, opacity: opacityBase, depthWrite: false }));
    camera.add(points); surface.weather = { points, pos, vel, ang, rad, count, b, gas, opacityBase };
  }

  function ensureAudio() {
    if (audio.ctx) return true;
    const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return false;
    const ctx = new Ctx(), master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const noiseGain = ctx.createGain(), rumbleGain = ctx.createGain(), toneGain = ctx.createGain(); noiseGain.connect(master); rumbleGain.connect(master); toneGain.connect(master);
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), data = buf.getChannelData(0); for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.8;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const filt = ctx.createBiquadFilter(); filt.type = "bandpass"; filt.frequency.value = 420; filt.Q.value = 0.7; src.connect(filt); filt.connect(noiseGain); src.start();
    const rumble = ctx.createOscillator(); rumble.type = "sawtooth"; rumble.frequency.value = 38; rumble.connect(rumbleGain); rumble.start();
    const tone = ctx.createOscillator(); tone.type = "triangle"; tone.frequency.value = 64; tone.connect(toneGain); tone.start();
    audio.ctx = ctx; audio.master = master; audio.noiseGain = noiseGain; audio.rumbleGain = rumbleGain; audio.toneGain = toneGain; audio.noiseFilter = filt; audio.rumbleOsc = rumble; audio.toneOsc = tone;
    return true;
  }

  async function toggleAudio(force = false) {
    const on = force ? true : !sim.audio; if (on && !ensureAudio()) return;
    sim.audio = on; if (audio.ctx && audio.ctx.state === "suspended") await audio.ctx.resume();
    ui.soundBtn.textContent = sim.audio ? "إيقاف الصوت" : "تشغيل الصوت"; updateHud();
  }

  function updateAudio() {
    if (!audio.ctx || !audio.master) return;
    const p = PLANETS[sim.selected], c = climate(p), w = Math.min(3, c.windKmh / 520 + 0.12), pressure = Math.min(2.4, c.pressureBar / 20 + 0.4), m = sim.mode === "orbit" ? 0.2 : (sim.mode === "descent" ? 0.7 : 1), t = audio.ctx.currentTime, on = sim.audio ? 1 : 0;
    audio.noiseGain.gain.setTargetAtTime(on * 0.12 * w * m, t, 0.09); audio.rumbleGain.gain.setTargetAtTime(on * 0.08 * pressure * m, t, 0.1); audio.toneGain.gain.setTargetAtTime(on * (p.solid ? 0.03 : 0.08) * m, t, 0.1);
    audio.noiseFilter.frequency.setTargetAtTime(220 + w * 380 + pressure * 60, t, 0.12); audio.rumbleOsc.frequency.setTargetAtTime(25 + pressure * 16, t, 0.12); audio.toneOsc.frequency.setTargetAtTime(48 + w * 18 + (sim.mode === "descent" ? sim.landing * 24 : 0), t, 0.12);
    audio.master.gain.setTargetAtTime(sim.audio ? settings.audioMaster : 0, t, 0.12);
  }

  function startLanding() {
    if (sim.mode !== "orbit") return;
    sim.selected = ui.planetSelect.value; const p = PLANETS[sim.selected]; buildSurface(p); sim.mode = "descent"; sim.landing = 0; sim.walk = false; controls.enabled = false;
    ui.landBtn.disabled = true; ui.orbitBtn.disabled = false; ui.walkBtn.disabled = true; ui.walkBtn.textContent = "تفعيل التجول"; ui.reticle.style.opacity = "0";
    setStatus("الحالة: هبوط جاري..."); updateHud(); updateInfo();
  }

  function goOrbit() {
    sim.mode = "orbit"; sim.walk = false; if (sim.pointerLocked) document.exitPointerLock(); clearSurface();
    groups.solar.visible = true; groups.orbit.visible = true; groups.stars.visible = true; groups.surface.visible = false; scene.background.copy(SPACE_BG); scene.fog.color.set(0x070b15); scene.fog.density = 0.00028;
    camera.fov = 58; camera.position.set(0, 80, 220); camera.rotation.set(0, 0, 0); camera.updateProjectionMatrix(); controls.target.set(0, 0, 0); controls.enabled = true;
    ui.landBtn.disabled = false; ui.orbitBtn.disabled = true; ui.walkBtn.disabled = true; ui.walkBtn.textContent = "تفعيل التجول"; ui.reticle.style.opacity = "0";
    setStatus("الحالة: وضع مداري"); updateHud(); updateInfo();
  }

  function onResize() { const w = ui.viewport.clientWidth, h = ui.viewport.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }

  function tick(now) {
    if (!last) last = now;
    const dt = Math.min(0.05, now - last);
    last = now;
    if (sim.mode === "orbit") {
      sim.orbitTime += dt * settings.orbitSpeed * 8;
      planets.forEach((it) => { it.a += (Math.PI * 2 / it.def.orbitDays) * dt * settings.orbitSpeed * 18; it.mesh.position.set(Math.cos(it.a) * it.def.orbitAU * AU, 0, Math.sin(it.a) * it.def.orbitAU * AU); it.mesh.rotation.y += dt * 0.25; });
      controls.update(); scene.background.lerp(SPACE_BG, dt * 2); scene.fog.color.set(0x070b15); scene.fog.density += (0.00028 - scene.fog.density) * dt * 2;
    } else if (sim.mode === "descent") {
      const p = PLANETS[sim.selected], dur = p.solid ? 3.1 : 3.8; sim.landing = Math.min(1, sim.landing + dt / dur);
      const e = sim.landing < 0.5 ? 2 * sim.landing * sim.landing : 1 - ((-2 * sim.landing + 2) ** 2) / 2, sy = p.solid ? 250 : 330, ty = p.solid ? 10 : 92;
      camera.position.set(0, sy + (ty - sy) * e, 240 + (34 - 240) * e); camera.lookAt(0, p.solid ? 5 : 42, -50); camera.fov += (66 - camera.fov) * 0.08; camera.updateProjectionMatrix();
      if (sim.landing >= 1) { sim.mode = "surface"; sim.walk = true; ui.walkBtn.disabled = false; ui.walkBtn.textContent = "إيقاف التجول"; ui.reticle.style.opacity = "0.9"; setStatus(p.solid ? "الحالة: هبوط مكتمل" : "الحالة: دخول طبقات جوية عاصفة"); if (!sim.pointerLocked) renderer.domElement.requestPointerLock(); }
    } else {
      const p = surface.target; if (p) {
        const c = climate(p), move = new THREE.Vector3();
        if (sim.walk) {
          const f = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation), r = new THREE.Vector3(1, 0, 0).applyEuler(camera.rotation); if (p.solid) { f.y = 0; r.y = 0; } f.normalize(); r.normalize();
          if (keys.KeyW) move.add(f); if (keys.KeyS) move.sub(f); if (keys.KeyA) move.sub(r); if (keys.KeyD) move.add(r); if (!p.solid) { if (keys.Space) move.y += 1; if (keys.ShiftLeft || keys.ShiftRight) move.y -= 1; }
        }
        if (move.lengthSq() > 0) move.normalize();
        const speed = p.solid ? (9 / (1 + c.pressureBar * 0.06)) : 12, wind = p.solid ? c.windKmh * 0.0006 : c.windKmh * 0.0009;
        camera.position.addScaledVector(move, dt * speed); camera.position.x += dt * wind; camera.position.z += dt * wind * 0.4;
        if (p.solid) { const h = sampleHeight(camera.position.x, camera.position.z, p.env); camera.position.y += ((h + surface.eyeHeight) - camera.position.y) * Math.min(1, dt * 14); } else camera.position.y = THREE.MathUtils.clamp(camera.position.y, 6, 220);
        const fb = p.solid ? 0.00042 : 0.00098; scene.fog.density = Math.min(0.0025, fb + c.pressureBar * 0.000015 + (settings.weatherFx ? c.windKmh * 0.0000011 : 0)); renderer.toneMappingExposure += ((p.solid ? 1.02 : 0.91) - renderer.toneMappingExposure) * dt * 2;
      }
      const wfx = surface.weather;
      if (wfx) {
        wfx.points.material.opacity = settings.weatherFx ? wfx.opacityBase : 0;
        if (settings.weatherFx && surface.target) {
          const wm = Math.max(0.2, climate(surface.target).windKmh / 220); surface.weatherTime += dt;
          for (let i = 0; i < wfx.count; i += 1) {
            const k = i * 3;
            if (wfx.gas) { wfx.ang[i] += dt * (0.45 + wm * 0.12); wfx.rad[i] += Math.sin(surface.weatherTime * 0.9 + i * 0.01) * dt * 0.4; wfx.rad[i] = THREE.MathUtils.clamp(wfx.rad[i], 1, wfx.b * 0.95); wfx.pos[k] = Math.cos(wfx.ang[i]) * wfx.rad[i]; wfx.pos[k + 1] += wfx.vel[k + 1] * dt * wm; wfx.pos[k + 2] += wfx.vel[k + 2] * dt * wm; }
            else { wfx.pos[k] += wfx.vel[k] * dt * wm; wfx.pos[k + 1] += wfx.vel[k + 1] * dt * wm; wfx.pos[k + 2] += wfx.vel[k + 2] * dt * wm; }
            const b = wfx.b; if (wfx.pos[k] > b) wfx.pos[k] = -b; if (wfx.pos[k] < -b) wfx.pos[k] = b; if (wfx.pos[k + 1] > b) wfx.pos[k + 1] = -b; if (wfx.pos[k + 1] < -b) wfx.pos[k + 1] = b; if (wfx.pos[k + 2] > 2) wfx.pos[k + 2] = -b * 2; if (wfx.pos[k + 2] < -b * 2.1) wfx.pos[k + 2] = 0;
          }
          wfx.points.geometry.attributes.position.needsUpdate = true;
        }
      }
    }
    updateAudio(); updateHud(); renderer.render(scene, camera);
  }
})();
