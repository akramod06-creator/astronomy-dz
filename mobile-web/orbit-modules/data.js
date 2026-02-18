// Shared orbital datasets used by orbit.js

export const bodies = [
    { id: "mercury", name: "عطارد", tex: "mercury", color: 0xb4bac3, r: 0.92, a: 0.387, e: 0.206, i: 7.0, O: 48.3, w: 29.1, L0: 252.2, period: 87.97 },
    { id: "venus", name: "الزهرة", tex: "venus", color: 0xe2bf90, r: 1.37, a: 0.723, e: 0.007, i: 3.4, O: 76.6, w: 54.9, L0: 181.9, period: 224.7 },
    { id: "earth", name: "الأرض", tex: "earth", color: 0x7cb2ff, r: 1.5, a: 1.0, e: 0.017, i: 0.0, O: -11.26, w: 102.9, L0: 100.4, period: 365.25 },
    { id: "mars", name: "المريخ", tex: "mars", color: 0xc76d4f, r: 1.2, a: 1.524, e: 0.093, i: 1.85, O: 49.5, w: 286.5, L0: -4.5, period: 687 },
    { id: "jupiter", name: "المشتري", tex: "jupiter", color: 0xdfc19e, r: 3.15, a: 5.203, e: 0.048, i: 1.3, O: 100.4, w: 273.2, L0: 34.3, period: 4332.6 },
    { id: "saturn", name: "زحل", tex: "saturn", color: 0xdec9a8, r: 2.85, a: 9.537, e: 0.054, i: 2.48, O: 113.6, w: 339.3, L0: 49.9, period: 10759.2 },
    { id: "uranus", name: "أورانوس", tex: "uranus", color: 0x95d2e1, r: 2.0, a: 19.19, e: 0.047, i: 0.77, O: 74.0, w: 96.9, L0: 313.2, period: 30688.5 },
    { id: "neptune", name: "نبتون", tex: "neptune", color: 0x80a7ea, r: 2.0, a: 30.07, e: 0.009, i: 1.77, O: 131.7, w: 273.1, L0: -55.1, period: 60182 },
    { id: "pluto", name: "بلوتو", tex: "pluto", color: 0xc8c9ce, r: 0.58, a: 39.48, e: 0.249, i: 17.16, O: 110.3, w: 113.8, L0: 238.9, period: 90560 }
  ];

export const moons = [
    { id: "moon", name: "القمر", host: "earth", r: 0.42, orbitR: 2.9, period: 27.32, tilt: 0.7 },
    { id: "phobos", name: "فوبوس", host: "mars", r: 0.09, orbitR: 1.45, period: 0.32, tilt: 0.04 },
    { id: "deimos", name: "ديموس", host: "mars", r: 0.07, orbitR: 2.2, period: 1.26, tilt: 0.03 },
    { id: "io", name: "آيو", host: "jupiter", r: 0.33, orbitR: 4.8, period: 1.77, tilt: 0.5 },
    { id: "europa", name: "يوروبا", host: "jupiter", r: 0.29, orbitR: 5.6, period: 3.55, tilt: 0.35 },
    { id: "ganymede", name: "غانيميد", host: "jupiter", r: 0.41, orbitR: 6.5, period: 7.15, tilt: 0.22 },
    { id: "callisto", name: "كاليستو", host: "jupiter", r: 0.38, orbitR: 7.4, period: 16.69, tilt: 0.18 },
    { id: "enceladus", name: "إنسيلادوس", host: "saturn", r: 0.19, orbitR: 3.6, period: 1.37, tilt: 0.32 },
    { id: "dione", name: "ديون", host: "saturn", r: 0.22, orbitR: 3.95, period: 2.74, tilt: 0.25 },
    { id: "rhea", name: "ريا", host: "saturn", r: 0.24, orbitR: 4.45, period: 4.52, tilt: 0.29 },
    { id: "titan", name: "تيتان", host: "saturn", r: 0.4, orbitR: 5.5, period: 15.95, tilt: 0.26 },
    { id: "iapetus", name: "إيابيتوس", host: "saturn", r: 0.29, orbitR: 7.9, period: 79.3, tilt: 0.5 },
    { id: "miranda", name: "ميراندا", host: "uranus", r: 0.12, orbitR: 2.8, period: 1.41, tilt: 0.26 },
    { id: "ariel", name: "أرييل", host: "uranus", r: 0.17, orbitR: 3.4, period: 2.52, tilt: 0.28 },
    { id: "umbriel", name: "أومبريل", host: "uranus", r: 0.16, orbitR: 3.9, period: 4.14, tilt: 0.22 },
    { id: "titania", name: "تيتانيا", host: "uranus", r: 0.23, orbitR: 4.7, period: 8.71, tilt: 0.2 },
    { id: "oberon", name: "أوبرون", host: "uranus", r: 0.22, orbitR: 5.2, period: 13.46, tilt: 0.17 },
    { id: "triton", name: "ترايتون", host: "neptune", r: 0.3, orbitR: 3.5, period: 5.88, tilt: 0.3 },
    { id: "charon", name: "شارون", host: "pluto", r: 0.21, orbitR: 1.6, period: 6.39, tilt: 0.12 }
  ];

export const comets = [
    { id: "halley", name: "مذنب هالي", color: 0xdbefff, r: 0.24, a: 17.8, e: 0.967, i: 162.3, O: 58.4, w: 111.3, period: 27515, M0: 1.2 },
    { id: "encke", name: "مذنب إنكه", color: 0xd5ebff, r: 0.24, a: 2.22, e: 0.85, i: 11.8, O: 334.6, w: 186.5, period: 1200, M0: 2.8 }
  ];

export const climateProfiles = {
    sun: { kind: "plasma", tempC: 5505, pressureBar: 0, windKmh: 7200, note: "رياح شمسية ومجال مغناطيسي شديد." },
    mercury: { kind: "rocky", tempC: 167, pressureBar: 0, windKmh: 0, note: "بدون غلاف جوي فعلي." },
    venus: { kind: "acidic", tempC: 464, pressureBar: 92, windKmh: 360, note: "غلاف كثيف وسحب حمضية." },
    earth: { kind: "habitable", tempC: 15, pressureBar: 1, windKmh: 25, note: "توازن مائي وجوي مناسب للحياة." },
    mars: { kind: "dusty", tempC: -63, pressureBar: 0.006, windKmh: 60, note: "عواصف غبار موسمية." },
    jupiter: { kind: "gas", tempC: -145, pressureBar: 2.2, windKmh: 540, note: "عواصف ضخمة مثل البقعة الحمراء." },
    saturn: { kind: "gas", tempC: -178, pressureBar: 1.4, windKmh: 1800, note: "رياح عالية وسحب طبقية." },
    uranus: { kind: "ice", tempC: -224, pressureBar: 1.2, windKmh: 900, note: "ميل محوري متطرف وشتاء طويل." },
    neptune: { kind: "ice", tempC: -214, pressureBar: 1.5, windKmh: 2100, note: "أسرع رياح في المجموعة الشمسية." },
    moon: { kind: "airless", tempC: -53, pressureBar: 0, windKmh: 0, note: "لا غلاف جوي قابل للرصد." },
    phobos: { kind: "airless", tempC: -40, pressureBar: 0, windKmh: 0, note: "سطح صخري منخفض الجاذبية." },
    deimos: { kind: "airless", tempC: -40, pressureBar: 0, windKmh: 0, note: "قمر صغير بهبوط دقيق جدًا." },
    io: { kind: "volcanic", tempC: -143, pressureBar: 0.00001, windKmh: 15, note: "نشاط بركاني قوي." },
    europa: { kind: "ice-ocean", tempC: -160, pressureBar: 0.000001, windKmh: 5, note: "قشرة جليدية ومحيط محتمل تحتها." },
    ganymede: { kind: "ice-rock", tempC: -163, pressureBar: 0.000001, windKmh: 6, note: "أكبر أقمار المجموعة." },
    callisto: { kind: "ice-rock", tempC: -139, pressureBar: 0.000001, windKmh: 4, note: "سطح فوهات قديم ومستقر نسبيًا." },
    enceladus: { kind: "ice-ocean", tempC: -201, pressureBar: 0.00001, windKmh: 8, note: "نفاثات جليدية نشطة قرب القطب." },
    dione: { kind: "airless-ice", tempC: -186, pressureBar: 0, windKmh: 0, note: "سطح جليدي مخدد." },
    rhea: { kind: "airless-ice", tempC: -174, pressureBar: 0, windKmh: 0, note: "فوهات كثيفة وحرارة منخفضة جدًا." },
    titan: { kind: "methane", tempC: -179, pressureBar: 1.45, windKmh: 22, note: "غلاف كثيف وغيوم ميثان." },
    iapetus: { kind: "airless-ice", tempC: -143, pressureBar: 0, windKmh: 0, note: "تباين لوني حاد بين نصفي السطح." },
    miranda: { kind: "airless-ice", tempC: -187, pressureBar: 0, windKmh: 0, note: "منحدرات ضخمة وتضاريس متكسرة." },
    ariel: { kind: "airless-ice", tempC: -213, pressureBar: 0, windKmh: 0, note: "أودية وأسطح جليدية شابة نسبيًا." },
    umbriel: { kind: "airless-ice", tempC: -214, pressureBar: 0, windKmh: 0, note: "سطح داكن وبارد." },
    titania: { kind: "airless-ice", tempC: -203, pressureBar: 0, windKmh: 0, note: "أكبر أقمار أورانوس." },
    oberon: { kind: "airless-ice", tempC: -200, pressureBar: 0, windKmh: 0, note: "فوهات عميقة وسهول جليدية." },
    triton: { kind: "nitrogen", tempC: -235, pressureBar: 0.000014, windKmh: 20, note: "ينابيع نيتروجين جليدية." },
    pluto: { kind: "dwarf-ice", tempC: -229, pressureBar: 0.00001, windKmh: 12, note: "سطح جليدي نيتروجيني مع ضباب خفيف." },
    charon: { kind: "airless-ice", tempC: -220, pressureBar: 0, windKmh: 0, note: "قمر جليدي بلا غلاف جوي فعّال." },
    halley: { kind: "comet", tempC: -70, pressureBar: 0, windKmh: 5, note: "نشاط قوي عند الاقتراب من الشمس." },
    encke: { kind: "comet", tempC: -40, pressureBar: 0, windKmh: 4, note: "دورة سريعة نسبيًا حول الشمس." }
  };

  // Mission-informed acoustic classes:
  // - Mars microphones (InSight, Perseverance, NASA/JPL).
  // - Plasma-wave sonifications (Voyager/Juno/Cassini, NASA/JPL/ESA).
  // - Planetary pressure context from NASA planetary fact sheets.
export const acousticClassById = {
    mercury: "vacuum",
    venus: "dense_atmo",
    earth: "earthlike",
    mars: "mars_thin",
    jupiter: "gas_storm",
    saturn: "gas_storm",
    uranus: "ice_giant",
    neptune: "ice_giant",
    pluto: "dwarf_ice",
    moon: "vacuum",
    phobos: "vacuum",
    deimos: "vacuum",
    io: "vacuum",
    europa: "vacuum",
    ganymede: "vacuum",
    callisto: "vacuum",
    enceladus: "vacuum",
    dione: "vacuum",
    rhea: "vacuum",
    titan: "titan_dense",
    iapetus: "vacuum",
    miranda: "vacuum",
    ariel: "vacuum",
    umbriel: "vacuum",
    titania: "vacuum",
    oberon: "vacuum",
    triton: "dwarf_ice",
    charon: "vacuum"
  };

export const envModeById = {
    mercury: "rocky_airless",
    venus: "rocky_dense",
    earth: "rocky_sky",
    mars: "rocky_dust",
    jupiter: "gas_storm",
    saturn: "gas_storm",
    uranus: "gas_ice_storm",
    neptune: "gas_ice_storm",
    pluto: "dwarf_ice",
    moon: "rocky_airless",
    phobos: "rocky_airless",
    deimos: "rocky_airless",
    io: "rocky_airless",
    europa: "dwarf_ice",
    ganymede: "dwarf_ice",
    callisto: "dwarf_ice",
    enceladus: "dwarf_ice",
    dione: "dwarf_ice",
    rhea: "dwarf_ice",
    titan: "titan_haze",
    iapetus: "dwarf_ice",
    miranda: "dwarf_ice",
    ariel: "dwarf_ice",
    umbriel: "dwarf_ice",
    titania: "dwarf_ice",
    oberon: "dwarf_ice",
    triton: "dwarf_ice",
    charon: "rocky_airless"
  };

  // Approximate relief, gravity, and mission context values from NASA/USGS sources.
export const geoProfiles = {
    mercury: { radiusKm: 2439.7, reliefKm: 10.0, gravity: 3.7, solid: true, landmark: "Caloris Basin" },
    venus: { radiusKm: 6051.8, reliefKm: 13.0, gravity: 8.87, solid: true, landmark: "Maxwell Montes" },
    earth: { radiusKm: 6371.0, reliefKm: 19.8, gravity: 9.81, solid: true, landmark: "Himalaya / Mariana" },
    mars: { radiusKm: 3389.5, reliefKm: 29.0, gravity: 3.71, solid: true, landmark: "Olympus Mons / Valles Marineris" },
    jupiter: { radiusKm: 69911, reliefKm: 90.0, gravity: 24.79, solid: false, landmark: "Great Red Spot" },
    saturn: { radiusKm: 58232, reliefKm: 70.0, gravity: 10.44, solid: false, landmark: "North Polar Hexagon" },
    uranus: { radiusKm: 25362, reliefKm: 45.0, gravity: 8.69, solid: false, landmark: "Methane cloud bands" },
    neptune: { radiusKm: 24622, reliefKm: 80.0, gravity: 11.15, solid: false, landmark: "Great Dark Spot winds" },
    pluto: { radiusKm: 1188.3, reliefKm: 5.5, gravity: 0.62, solid: true, landmark: "Sputnik Planitia" },
    moon: { radiusKm: 1737.4, reliefKm: 16.0, gravity: 1.62, solid: true, landmark: "South Pole-Aitken" },
    phobos: { radiusKm: 11.3, reliefKm: 1.2, gravity: 0.0057, solid: true, landmark: "Stickney crater" },
    deimos: { radiusKm: 6.2, reliefKm: 0.8, gravity: 0.003, solid: true, landmark: "Voltaire crater" },
    io: { radiusKm: 1821.6, reliefKm: 12.0, gravity: 1.8, solid: true, landmark: "Loki Patera" },
    europa: { radiusKm: 1560.8, reliefKm: 2.0, gravity: 1.31, solid: true, landmark: "Chaos terrains" },
    ganymede: { radiusKm: 2634.1, reliefKm: 7.0, gravity: 1.43, solid: true, landmark: "Galileo Regio" },
    callisto: { radiusKm: 2410.3, reliefKm: 5.0, gravity: 1.24, solid: true, landmark: "Valhalla basin" },
    enceladus: { radiusKm: 252.1, reliefKm: 1.1, gravity: 0.11, solid: true, landmark: "Tiger stripes" },
    dione: { radiusKm: 561.4, reliefKm: 2.1, gravity: 0.23, solid: true, landmark: "Padua Chasmata" },
    rhea: { radiusKm: 763.8, reliefKm: 3.0, gravity: 0.26, solid: true, landmark: "Inktomi crater" },
    titan: { radiusKm: 2574.7, reliefKm: 4.0, gravity: 1.35, solid: true, landmark: "Methane dune seas" },
    iapetus: { radiusKm: 734.5, reliefKm: 13.0, gravity: 0.22, solid: true, landmark: "Equatorial ridge" },
    miranda: { radiusKm: 235.8, reliefKm: 20.0, gravity: 0.08, solid: true, landmark: "Verona Rupes" },
    ariel: { radiusKm: 578.9, reliefKm: 6.0, gravity: 0.27, solid: true, landmark: "Kachina Chasmata" },
    umbriel: { radiusKm: 584.7, reliefKm: 5.0, gravity: 0.23, solid: true, landmark: "Wunda crater" },
    titania: { radiusKm: 788.9, reliefKm: 8.0, gravity: 0.37, solid: true, landmark: "Messina Chasma" },
    oberon: { radiusKm: 761.4, reliefKm: 7.0, gravity: 0.35, solid: true, landmark: "Mommur Chasma" },
    triton: { radiusKm: 1353.4, reliefKm: 3.5, gravity: 0.78, solid: true, landmark: "Nitrogen plumes" },
    charon: { radiusKm: 606.0, reliefKm: 9.0, gravity: 0.29, solid: true, landmark: "Serenity Chasma" }
  };

// Landing-control tuning profiles:
// - mode profiles apply broad behavior by atmospheric/terrain class
// - id profiles override specific worlds for mission-like handling
export const landingProfileByMode = {
  rocky_airless: {
    maxSinkMul: 0.9,
    thrustMul: 1.08,
    dragMul: 0.56,
    driftMul: 0.34,
    lateralMul: 0.92,
    hoverBrakeMul: 0.88,
    touchdownSoftness: 0.82,
    stageSink: { flare: 0.9, hover: 0.86, touchdown: 0.74 }
  },
  rocky_sky: {
    maxSinkMul: 1,
    thrustMul: 1,
    dragMul: 1,
    driftMul: 1,
    lateralMul: 1,
    hoverBrakeMul: 1,
    touchdownSoftness: 1,
    stageSink: { entry: 1, retro: 1, approach: 1, flare: 1, hover: 1, touchdown: 1 }
  },
  rocky_dust: {
    maxSinkMul: 1.05,
    thrustMul: 1.02,
    dragMul: 0.74,
    driftMul: 1.22,
    lateralMul: 1.16,
    hoverBrakeMul: 0.96,
    touchdownSoftness: 0.94,
    stageSink: { approach: 0.94, flare: 0.82, hover: 0.76, touchdown: 0.62 },
    pid: { p: 1.08, i: 1.05, d: 1.12 }
  },
  rocky_dense: {
    maxSinkMul: 0.76,
    thrustMul: 0.84,
    dragMul: 1.5,
    driftMul: 1.3,
    lateralMul: 0.94,
    hoverBrakeMul: 1.14,
    touchdownSoftness: 1.24,
    stageSink: { retro: 0.88, approach: 0.78, flare: 0.66, hover: 0.62, touchdown: 0.5 },
    pid: { p: 0.92, i: 1.08, d: 0.88 }
  },
  titan_haze: {
    maxSinkMul: 0.72,
    thrustMul: 0.82,
    dragMul: 1.36,
    driftMul: 0.92,
    lateralMul: 0.9,
    hoverBrakeMul: 1.18,
    touchdownSoftness: 1.22,
    stageSink: { retro: 0.86, approach: 0.78, flare: 0.62, hover: 0.56, touchdown: 0.46 },
    pid: { p: 0.9, i: 1.1, d: 0.86 }
  },
  dwarf_ice: {
    maxSinkMul: 0.82,
    thrustMul: 1.12,
    dragMul: 0.66,
    driftMul: 0.56,
    lateralMul: 0.9,
    hoverBrakeMul: 0.86,
    touchdownSoftness: 0.78,
    stageSink: { approach: 0.88, flare: 0.76, hover: 0.66, touchdown: 0.54 },
    pid: { p: 1.12, i: 0.92, d: 1.08 }
  },
  gas_storm: {
    maxSinkMul: 1.3,
    thrustMul: 1.28,
    dragMul: 1.34,
    driftMul: 2.35,
    lateralMul: 1.26,
    hoverBrakeMul: 1.08,
    touchdownSoftness: 1.3,
    stageSink: { entry: 1.16, retro: 1.1, approach: 1.04, flare: 0.92, hover: 0.88, touchdown: 0.82 },
    pid: { p: 1.16, i: 0.9, d: 1.24 }
  },
  gas_ice_storm: {
    maxSinkMul: 1.26,
    thrustMul: 1.22,
    dragMul: 1.38,
    driftMul: 2.6,
    lateralMul: 1.34,
    hoverBrakeMul: 1.12,
    touchdownSoftness: 1.32,
    stageSink: { entry: 1.14, retro: 1.08, approach: 1.02, flare: 0.9, hover: 0.86, touchdown: 0.8 },
    pid: { p: 1.18, i: 0.88, d: 1.28 }
  }
};

export const landingProfileById = {
  mercury: {
    maxSinkMul: 0.84,
    driftMul: 0.3,
    touchdownSoftness: 0.8,
    stageSink: { flare: 0.82, hover: 0.74, touchdown: 0.6 }
  },
  venus: {
    maxSinkMul: 0.62,
    thrustMul: 0.76,
    dragMul: 1.64,
    driftMul: 1.42,
    touchdownSoftness: 1.38,
    stageSink: { approach: 0.72, flare: 0.58, hover: 0.5, touchdown: 0.42 }
  },
  earth: {
    maxSinkMul: 1,
    thrustMul: 1,
    dragMul: 1,
    driftMul: 1,
    lateralMul: 1,
    hoverBrakeMul: 1,
    touchdownSoftness: 1,
    stageSink: { entry: 1, retro: 1, approach: 1, flare: 1, hover: 1, touchdown: 1 }
  },
  mars: {
    maxSinkMul: 0.98,
    thrustMul: 1.04,
    dragMul: 0.72,
    driftMul: 1.28,
    lateralMul: 1.22,
    hoverBrakeMul: 0.98,
    touchdownSoftness: 0.9,
    stageSink: { retro: 0.94, approach: 0.86, flare: 0.72, hover: 0.64, touchdown: 0.52 },
    pid: { p: 1.12, i: 1.06, d: 1.14 }
  },
  jupiter: {
    maxSinkMul: 1.38,
    thrustMul: 1.32,
    dragMul: 1.42,
    driftMul: 2.6,
    lateralMul: 1.34,
    hoverBrakeMul: 1.14,
    touchdownSoftness: 1.36,
    stageSink: { entry: 1.2, retro: 1.12, approach: 1.06, flare: 0.94, hover: 0.9, touchdown: 0.84 }
  },
  saturn: {
    maxSinkMul: 1.32,
    thrustMul: 1.26,
    dragMul: 1.38,
    driftMul: 2.75,
    lateralMul: 1.38,
    hoverBrakeMul: 1.16,
    touchdownSoftness: 1.34,
    stageSink: { entry: 1.18, retro: 1.1, approach: 1.04, flare: 0.92, hover: 0.88, touchdown: 0.82 }
  },
  uranus: {
    maxSinkMul: 1.28,
    thrustMul: 1.2,
    dragMul: 1.42,
    driftMul: 2.9,
    lateralMul: 1.42,
    hoverBrakeMul: 1.16,
    touchdownSoftness: 1.34,
    stageSink: { entry: 1.16, retro: 1.08, approach: 1.02, flare: 0.9, hover: 0.86, touchdown: 0.8 }
  },
  neptune: {
    maxSinkMul: 1.34,
    thrustMul: 1.26,
    dragMul: 1.48,
    driftMul: 3.1,
    lateralMul: 1.46,
    hoverBrakeMul: 1.18,
    touchdownSoftness: 1.4,
    stageSink: { entry: 1.2, retro: 1.12, approach: 1.06, flare: 0.92, hover: 0.88, touchdown: 0.82 }
  },
  pluto: {
    maxSinkMul: 0.74,
    thrustMul: 1.16,
    dragMul: 0.62,
    driftMul: 0.5,
    lateralMul: 0.86,
    hoverBrakeMul: 0.82,
    touchdownSoftness: 0.7,
    stageSink: { approach: 0.84, flare: 0.7, hover: 0.58, touchdown: 0.46 }
  },
  moon: {
    maxSinkMul: 0.68,
    thrustMul: 1.18,
    dragMul: 0.5,
    driftMul: 0.22,
    lateralMul: 0.9,
    hoverBrakeMul: 0.78,
    touchdownSoftness: 0.66,
    stageSink: { approach: 0.8, flare: 0.62, hover: 0.5, touchdown: 0.38 },
    pid: { p: 1.16, i: 0.9, d: 1.2 }
  },
  phobos: {
    maxSinkMul: 0.32,
    thrustMul: 0.88,
    dragMul: 0.42,
    driftMul: 0.16,
    lateralMul: 0.78,
    hoverBrakeMul: 0.66,
    touchdownSoftness: 0.44,
    stageSink: { entry: 0.62, retro: 0.52, approach: 0.4, flare: 0.28, hover: 0.2, touchdown: 0.16 }
  },
  deimos: {
    maxSinkMul: 0.28,
    thrustMul: 0.84,
    dragMul: 0.4,
    driftMul: 0.14,
    lateralMul: 0.76,
    hoverBrakeMul: 0.64,
    touchdownSoftness: 0.4,
    stageSink: { entry: 0.58, retro: 0.48, approach: 0.36, flare: 0.26, hover: 0.18, touchdown: 0.14 }
  },
  titan: {
    maxSinkMul: 0.64,
    thrustMul: 0.76,
    dragMul: 1.52,
    driftMul: 0.86,
    lateralMul: 0.86,
    hoverBrakeMul: 1.22,
    touchdownSoftness: 1.36,
    stageSink: { retro: 0.82, approach: 0.72, flare: 0.56, hover: 0.48, touchdown: 0.4 },
    pid: { p: 0.88, i: 1.12, d: 0.82 }
  },
  triton: {
    maxSinkMul: 0.7,
    thrustMul: 1.14,
    dragMul: 0.58,
    driftMul: 0.46,
    lateralMul: 0.84,
    hoverBrakeMul: 0.8,
    touchdownSoftness: 0.68,
    stageSink: { approach: 0.82, flare: 0.68, hover: 0.56, touchdown: 0.44 }
  },
  charon: {
    maxSinkMul: 0.72,
    thrustMul: 1.12,
    dragMul: 0.56,
    driftMul: 0.4,
    lateralMul: 0.84,
    hoverBrakeMul: 0.78,
    touchdownSoftness: 0.66,
    stageSink: { approach: 0.82, flare: 0.68, hover: 0.56, touchdown: 0.44 }
  }
};

export const nasaAudioSamples = {
    marsMic: "assets/audio/nasa/mars_sol1_microphone.mp3",
    marsWind: "assets/audio/nasa/mars_sol4_wind.mp3",
    marsRotor: "assets/audio/nasa/mars_ingenuity_flight.mp3"
  };
