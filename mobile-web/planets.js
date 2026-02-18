(() => {
  const OBJECTS = [
    {
      id: "mercury",
      type: "planet",
      typeLabel: "كوكب",
      name: "عطارد",
      image: "assets/images/mercury.png",
      symbol: "☿",
      diameter: "4,879 كم",
      mass: "3.30 × 10²³ كغ",
      day: "58.6 يوم أرضي",
      gravity: "3.7 م/ث²",
      year: "88 يوم",
      diameterKm: 4879,
      gravityMs2: 3.7,
      dayHours: 1407.6,
      yearEarthYears: 0.24,
      discovery: "معروف منذ العصور القديمة",
      moons: "لا توجد أقمار معروفة."
    },
    {
      id: "venus",
      type: "planet",
      typeLabel: "كوكب",
      name: "الزهرة",
      image: "assets/images/venus.png",
      symbol: "♀",
      diameter: "12,104 كم",
      mass: "4.87 × 10²⁴ كغ",
      day: "243 يوم أرضي",
      gravity: "8.87 م/ث²",
      year: "225 يوم",
      diameterKm: 12104,
      gravityMs2: 8.87,
      dayHours: 5832,
      yearEarthYears: 0.62,
      discovery: "معروف منذ العصور القديمة",
      moons: "لا توجد أقمار معروفة."
    },
    {
      id: "earth",
      type: "planet",
      typeLabel: "كوكب",
      name: "الأرض",
      image: "assets/images/earth.png",
      symbol: "⊕",
      diameter: "12,742 كم",
      mass: "5.97 × 10²⁴ كغ",
      day: "24 ساعة",
      gravity: "9.81 م/ث²",
      year: "365.25 يوم",
      diameterKm: 12742,
      gravityMs2: 9.81,
      dayHours: 24,
      yearEarthYears: 1,
      discovery: "موطن الإنسان - معروف تاريخيًا",
      moons: "القمر (قمر واحد)."
    },
    {
      id: "mars",
      type: "planet",
      typeLabel: "كوكب",
      name: "المريخ",
      image: "assets/images/mars.png",
      symbol: "♂",
      diameter: "6,779 كم",
      mass: "6.40 × 10²³ كغ",
      day: "24.6 ساعة",
      gravity: "3.71 م/ث²",
      year: "687 يوم",
      diameterKm: 6779,
      gravityMs2: 3.71,
      dayHours: 24.6,
      yearEarthYears: 1.88,
      discovery: "معروف منذ العصور القديمة",
      moons: "فوبوس وديموس (اكتُشفا عام 1877)."
    },
    {
      id: "jupiter",
      type: "planet",
      typeLabel: "كوكب",
      name: "المشتري",
      image: "assets/images/jupiter.png",
      symbol: "♃",
      diameter: "139,820 كم",
      mass: "1.90 × 10²⁷ كغ",
      day: "9.9 ساعة",
      gravity: "24.79 م/ث²",
      year: "11.86 سنة",
      diameterKm: 139820,
      gravityMs2: 24.79,
      dayHours: 9.9,
      yearEarthYears: 11.86,
      discovery: "معروف منذ العصور القديمة",
      moons: "أبرز الأقمار: آيو، أوروبا، غانيميد، كاليستو (رُصدت 1610)."
    },
    {
      id: "saturn",
      type: "planet",
      typeLabel: "كوكب",
      name: "زحل",
      image: "assets/images/saturn.png",
      symbol: "♄",
      diameter: "116,460 كم",
      mass: "5.70 × 10²⁶ كغ",
      day: "10.7 ساعة",
      gravity: "10.44 م/ث²",
      year: "29.4 سنة",
      diameterKm: 116460,
      gravityMs2: 10.44,
      dayHours: 10.7,
      yearEarthYears: 29.4,
      discovery: "معروف منذ العصور القديمة",
      moons: "أبرز الأقمار: تيتان (1655)، ريا، إيابيتوس، ديون."
    },
    {
      id: "uranus",
      type: "planet",
      typeLabel: "كوكب",
      name: "أورانوس",
      image: "assets/images/uranus.png",
      symbol: "♅",
      diameter: "50,724 كم",
      mass: "8.70 × 10²⁵ كغ",
      day: "17.2 ساعة",
      gravity: "8.69 م/ث²",
      year: "84 سنة",
      diameterKm: 50724,
      gravityMs2: 8.69,
      dayHours: 17.2,
      yearEarthYears: 84,
      discovery: "1781 - ويليام هيرشل",
      moons: "أبرز الأقمار: تيتانيا، أوبرون، أرييل، أمبرييل، ميراندا."
    },
    {
      id: "neptune",
      type: "planet",
      typeLabel: "كوكب",
      name: "نبتون",
      image: "assets/images/neptune.png",
      symbol: "♆",
      diameter: "49,244 كم",
      mass: "1.02 × 10²⁶ كغ",
      day: "16.1 ساعة",
      gravity: "11.15 م/ث²",
      year: "164.8 سنة",
      diameterKm: 49244,
      gravityMs2: 11.15,
      dayHours: 16.1,
      yearEarthYears: 164.8,
      discovery: "1846 - يوهان غاله (تنبؤ لو فيرييه)",
      moons: "أبرز الأقمار: ترايتون (1846)، نيريد (1949)، بروتيوس."
    },
    {
      id: "pluto",
      type: "dwarf",
      typeLabel: "كوكب قزم",
      name: "بلوتو",
      image: "assets/textures/pluto.jpg",
      symbol: "♇",
      diameter: "2,377 كم",
      mass: "1.31 × 10²² كغ",
      day: "6.4 يوم",
      gravity: "0.62 م/ث²",
      year: "248 سنة",
      diameterKm: 2377,
      gravityMs2: 0.62,
      dayHours: 153.3,
      yearEarthYears: 248,
      discovery: "1930 - كلايد تومبو",
      moons: "شارون (1978)، نيكس، هيدرا، كيربيروس، ستيكس."
    },
    {
      id: "ceres",
      type: "dwarf",
      typeLabel: "كوكب قزم",
      name: "سيريس",
      image: "assets/textures/moon.jpg",
      symbol: "⚳",
      diameter: "940 كم",
      mass: "9.39 × 10²⁰ كغ",
      day: "9.1 ساعة",
      gravity: "0.27 م/ث²",
      year: "4.6 سنة",
      diameterKm: 940,
      gravityMs2: 0.27,
      dayHours: 9.1,
      yearEarthYears: 4.6,
      discovery: "1801 - جوزيبي بياتزي",
      moons: "لا توجد أقمار معروفة."
    },
    {
      id: "eris",
      type: "dwarf",
      typeLabel: "كوكب قزم",
      name: "إيريس",
      image: "assets/textures/mercury.jpg",
      symbol: "⯰",
      diameter: "≈2,326 كم",
      mass: "1.66 × 10²² كغ",
      day: "25.9 ساعة",
      gravity: "0.82 م/ث²",
      year: "557 سنة",
      diameterKm: 2326,
      gravityMs2: 0.82,
      dayHours: 25.9,
      yearEarthYears: 557,
      discovery: "2005 - فريق مايكل براون",
      moons: "ديسنوميا (2005)."
    },
    {
      id: "haumea",
      type: "dwarf",
      typeLabel: "كوكب قزم",
      name: "هاوميا",
      image: "assets/textures/neptune.jpg",
      symbol: "◍",
      diameter: "≈1,632 كم",
      mass: "4.0 × 10²¹ كغ",
      day: "3.9 ساعة",
      gravity: "0.44 م/ث²",
      year: "284 سنة",
      diameterKm: 1632,
      gravityMs2: 0.44,
      dayHours: 3.9,
      yearEarthYears: 284,
      discovery: "2004 (أُعلن 2005)",
      moons: "هياكا وناماكا."
    },
    {
      id: "makemake",
      type: "dwarf",
      typeLabel: "كوكب قزم",
      name: "ماكيماكي",
      image: "assets/textures/mars.jpg",
      symbol: "◎",
      diameter: "≈1,430 كم",
      mass: "≈3.1 × 10²¹ كغ",
      day: "22.8 ساعة",
      gravity: "≈0.5 م/ث²",
      year: "305 سنة",
      diameterKm: 1430,
      gravityMs2: 0.5,
      dayHours: 22.8,
      yearEarthYears: 305,
      discovery: "2005 - فريق مايكل براون",
      moons: "القمر MK2 (اكتشاف 2016)."
    }
  ];

  const PLANET_IDS = OBJECTS.filter((obj) => obj.type === "planet").map((obj) => obj.id);
  const DWARF_IDS = OBJECTS.filter((obj) => obj.type === "dwarf").map((obj) => obj.id);
  const BASE_QUIZ_LEN = 3;
  const STORAGE_KEY = "adz_planets_progress_v2";

  const BADGES = [
    { id: "first_visit", title: "أول زيارة", desc: "سجلت أول زيارة لأي جرم." },
    { id: "planets_complete", title: "مستكشف الكواكب", desc: "زرت الكواكب الثمانية." },
    { id: "dwarfs_complete", title: "جامع القزمة", desc: "زرت الكواكب القزمة الخمسة." },
    { id: "quiz_master", title: "عقل مداري", desc: "أحرزت الدرجة الكاملة في مسابقة." },
    { id: "streak_3", title: "التزام كوني", desc: "حافظت على سلسلة يومية 3 أيام." }
  ];

  const QUIZ_POOL = [
    { q: "أكبر كوكب في النظام الشمسي هو:", options: ["المشتري", "زحل", "نبتون"], answer: "المشتري", objectId: "jupiter" },
    { q: "أقرب كوكب للشمس هو:", options: ["عطارد", "الزهرة", "الأرض"], answer: "عطارد", objectId: "mercury" },
    { q: "الكوكب الأحمر هو:", options: ["المريخ", "أورانوس", "بلوتو"], answer: "المريخ", objectId: "mars" },
    { q: "أي كوكب قزم اكتُشف سنة 1930؟", options: ["بلوتو", "إيريس", "ماكيماكي"], answer: "بلوتو", objectId: "pluto" },
    { q: "أي جرم لديه القمر ديسنوميا؟", options: ["إيريس", "سيريس", "هاوميا"], answer: "إيريس", objectId: "eris" },
    { q: "أي كوكب له القمران فوبوس وديموس؟", options: ["المريخ", "الأرض", "الزهرة"], answer: "المريخ", objectId: "mars" },
    { q: "من يملك يومًا أقصر بين الكواكب الرئيسية؟", options: ["المشتري", "الأرض", "زحل"], answer: "المشتري", objectId: "jupiter" },
    { q: "أي كوكب قزم لا يملك أقمارًا معروفة؟", options: ["سيريس", "بلوتو", "هاوميا"], answer: "سيريس", objectId: "ceres" },
    { q: "الكوكب ذو السنة الأطول بين الكواكب الرئيسية:", options: ["نبتون", "زحل", "المشتري"], answer: "نبتون", objectId: "neptune" },
    { q: "أي كوكب اكتشفه ويليام هيرشل عام 1781؟", options: ["أورانوس", "نبتون", "زحل"], answer: "أورانوس", objectId: "uranus" },
    { q: "أي كوكب قزم يدور سنة تقارب 305 سنة أرضية؟", options: ["ماكيماكي", "سيريس", "بلوتو"], answer: "ماكيماكي", objectId: "makemake" },
    { q: "أي كوكب قزم يمتلك القمرين هياكا وناماكا؟", options: ["هاوميا", "إيريس", "بلوتو"], answer: "هاوميا", objectId: "haumea" },
    { q: "أعلى جاذبية بين الكواكب القزمة في القائمة هي:", options: ["إيريس", "بلوتو", "سيريس"], answer: "إيريس", objectId: "eris" },
    { q: "أي جرم يدور حول الشمس في نحو 4.6 سنة فقط؟", options: ["سيريس", "بلوتو", "ماكيماكي"], answer: "سيريس", objectId: "ceres" },
    { q: "أي كوكب رئيسي لا يملك أقمارًا معروفة؟", options: ["الزهرة", "الأرض", "المريخ"], answer: "الزهرة", objectId: "venus" },
    { q: "أي جرم هو الأبطأ مداريًا ضمن القزمة هنا؟", options: ["إيريس", "بلوتو", "هاوميا"], answer: "إيريس", objectId: "eris" }
  ];

  const QUIZ_MODES = {
    quick: {
      label: "سريعة",
      length: 3,
      filter: () => true
    },
    dwarf: {
      label: "القزمة",
      length: 5,
      filter: (q) => DWARF_IDS.includes(q.objectId || "")
    },
    pro: {
      label: "المحترفين",
      length: 7,
      filter: () => true
    }
  };

  const dom = {
    cards: document.getElementById("objectCards"),
    missionDate: document.getElementById("missionDateText"),
    missionBody: document.getElementById("missionBody"),
    missionStatus: document.getElementById("missionStatus"),
    statVisitedAll: document.getElementById("statVisitedAll"),
    statVisitedPlanets: document.getElementById("statVisitedPlanets"),
    statVisitedDwarfs: document.getElementById("statVisitedDwarfs"),
    statStreak: document.getElementById("statStreak"),
    statQuizBest: document.getElementById("statQuizBest"),
    compareA: document.getElementById("compareA"),
    compareB: document.getElementById("compareB"),
    compareRows: document.getElementById("compareRows"),
    badgeList: document.getElementById("badgeList"),
    modeQuickBtn: document.getElementById("modeQuickBtn"),
    modeDwarfBtn: document.getElementById("modeDwarfBtn"),
    modeProBtn: document.getElementById("modeProBtn"),
    startQuizBtn: document.getElementById("startQuizBtn"),
    restartQuizBtn: document.getElementById("restartQuizBtn"),
    quizProgress: document.getElementById("quizProgress"),
    quizScoreLive: document.getElementById("quizScoreLive"),
    quizModeLabel: document.getElementById("quizModeLabel"),
    quizMedia: document.getElementById("quizMedia"),
    quizMediaImg: document.getElementById("quizMediaImg"),
    quizQuestion: document.getElementById("quizQuestion"),
    quizOptions: document.getElementById("quizOptions"),
    quizFlash: document.getElementById("quizFlash"),
    resetProgressBtn: document.getElementById("resetProgressBtn")
  };

  const state = {
    progress: loadProgress(),
    quiz: { active: false, questions: [], index: 0, score: 0, mode: "quick", total: BASE_QUIZ_LEN }
  };

  function defaultProgress() {
    return {
      visited: [],
      badges: [],
      mission: { lastCompletedDate: null, streak: 0, totalCompleted: 0 },
      quizBest: 0,
      quizBestTotal: BASE_QUIZ_LEN
    };
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultProgress();
      const parsed = JSON.parse(raw);
      return {
        visited: Array.isArray(parsed.visited) ? parsed.visited : [],
        badges: Array.isArray(parsed.badges) ? parsed.badges : [],
        mission: parsed.mission && typeof parsed.mission === "object"
          ? parsed.mission
          : { lastCompletedDate: null, streak: 0, totalCompleted: 0 },
        quizBest: Number.isFinite(parsed.quizBest) ? parsed.quizBest : 0,
        quizBestTotal: Number.isFinite(parsed.quizBestTotal) ? parsed.quizBestTotal : BASE_QUIZ_LEN
      };
    } catch {
      return defaultProgress();
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
  }

  function localIso(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function yesterdayIso() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return localIso(d);
  }

  function todayObject() {
    const d = new Date();
    const serial = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    return OBJECTS[serial % OBJECTS.length];
  }

  function getById(id) {
    return OBJECTS.find((obj) => obj.id === id) || null;
  }

  function addBadge(id) {
    if (!state.progress.badges.includes(id)) state.progress.badges.push(id);
  }

  function syncBadges() {
    const visited = state.progress.visited;
    if (visited.length > 0) addBadge("first_visit");
    if (PLANET_IDS.every((id) => visited.includes(id))) addBadge("planets_complete");
    if (DWARF_IDS.every((id) => visited.includes(id))) addBadge("dwarfs_complete");
    if ((state.progress.mission.streak || 0) >= 3) addBadge("streak_3");
    const bestScore = state.progress.quizBest || 0;
    const bestTotal = state.progress.quizBestTotal || BASE_QUIZ_LEN;
    if (bestTotal >= BASE_QUIZ_LEN && bestScore >= bestTotal) addBadge("quiz_master");
  }

  function missionDoneToday() {
    return state.progress.mission.lastCompletedDate === localIso();
  }

  function completeMissionIfNeeded(id) {
    const target = todayObject();
    if (id !== target.id || missionDoneToday()) return;
    const last = state.progress.mission.lastCompletedDate;
    state.progress.mission.streak = last === yesterdayIso() ? (state.progress.mission.streak || 0) + 1 : 1;
    state.progress.mission.lastCompletedDate = localIso();
    state.progress.mission.totalCompleted = (state.progress.mission.totalCompleted || 0) + 1;
  }

  function markVisited(id) {
    if (!state.progress.visited.includes(id)) state.progress.visited.push(id);
    completeMissionIfNeeded(id);
    syncBadges();
    saveProgress();
    renderCards();
    renderMission();
    renderStats();
    renderBadges();
  }

  function cardMedia(obj) {
    if (obj.image) return `<img src="${obj.image}" alt="${obj.name}" loading="lazy" />`;
    return `<div class="symbol-ball ${obj.type === "dwarf" ? "dwarf" : ""}">${obj.symbol || "○"}</div>`;
  }

  function cardTemplate(obj) {
    const visited = state.progress.visited.includes(obj.id);
    return `
      <article class="object-card ${visited ? "visited" : ""}">
        <div class="image-wrap">${cardMedia(obj)}</div>
        <div class="content">
          <div class="title-row">
            <h3>${obj.name}</h3>
            <span class="kind-chip ${obj.type === "dwarf" ? "dwarf" : ""}">${obj.typeLabel}</span>
          </div>
          <ul>
            <li>القطر: ${obj.diameter}</li>
            <li>الكتلة: ${obj.mass}</li>
            <li>اليوم: ${obj.day}</li>
            <li>الجاذبية: ${obj.gravity}</li>
            <li>السنة: ${obj.year}</li>
            <li>تاريخ الاكتشاف: ${obj.discovery}</li>
            <li>الأقمار المكتشفة: ${obj.moons}</li>
          </ul>
          <div class="actions">
            <button type="button" data-visit="${obj.id}">تسجيل زيارة</button>
            <a href="./orbit.html">فتح المدارات</a>
            <a href="./space-explorer.html">فتح الهبوط</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderCards() {
    dom.cards.innerHTML = OBJECTS.map(cardTemplate).join("");
  }

  function renderMission() {
    const target = todayObject();
    dom.missionDate.textContent = `تاريخ اليوم: ${new Date().toLocaleDateString("ar-DZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;
    dom.missionBody.textContent = `مهمة اليوم: زر بطاقة ${target.name} واضغط "تسجيل زيارة" للحفاظ على السلسلة اليومية.`;
    dom.missionStatus.textContent = missionDoneToday() ? "الحالة: مكتملة اليوم" : "الحالة: غير مكتملة";
    dom.missionStatus.style.borderColor = missionDoneToday() ? "rgba(125, 255, 191, 0.65)" : "rgba(138, 217, 255, 0.38)";
  }

  function renderStats() {
    const visited = state.progress.visited;
    const pv = PLANET_IDS.filter((id) => visited.includes(id)).length;
    const dv = DWARF_IDS.filter((id) => visited.includes(id)).length;
    dom.statVisitedAll.textContent = `${visited.length}/${OBJECTS.length}`;
    dom.statVisitedPlanets.textContent = `${pv}/${PLANET_IDS.length}`;
    dom.statVisitedDwarfs.textContent = `${dv}/${DWARF_IDS.length}`;
    dom.statStreak.textContent = String(state.progress.mission.streak || 0);
    const bestTotal = Math.max(BASE_QUIZ_LEN, state.progress.quizBestTotal || BASE_QUIZ_LEN);
    dom.statQuizBest.textContent = `${state.progress.quizBest || 0}/${bestTotal}`;
  }

  function renderBadges() {
    dom.badgeList.innerHTML = BADGES.map((badge) => {
      const unlocked = state.progress.badges.includes(badge.id);
      return `
        <article class="badge ${unlocked ? "unlocked" : "locked"}">
          <strong>${badge.title}</strong>
          <span>${badge.desc}</span>
          <span>${unlocked ? "الحالة: مفتوحة" : "الحالة: مقفلة"}</span>
        </article>
      `;
    }).join("");
  }

  function winner(a, b, key, mode) {
    if (a[key] === b[key]) return "تعادل";
    if (mode === "min") return a[key] < b[key] ? a.name : b.name;
    return a[key] > b[key] ? a.name : b.name;
  }

  function renderCompare() {
    const a = getById(dom.compareA.value);
    const b = getById(dom.compareB.value);
    if (!a || !b) return;
    dom.compareRows.innerHTML = [
      `<div class="compare-row"><span>الأكبر قطرًا</span><strong>${winner(a, b, "diameterKm", "max")}</strong></div>`,
      `<div class="compare-row"><span>الأعلى جاذبية</span><strong>${winner(a, b, "gravityMs2", "max")}</strong></div>`,
      `<div class="compare-row"><span>الأقصر يومًا</span><strong>${winner(a, b, "dayHours", "min")}</strong></div>`,
      `<div class="compare-row"><span>الأطول سنة</span><strong>${winner(a, b, "yearEarthYears", "max")}</strong></div>`,
      `<div class="compare-row"><span>${a.name} - الاكتشاف</span><strong>${a.discovery}</strong></div>`,
      `<div class="compare-row"><span>${b.name} - الاكتشاف</span><strong>${b.discovery}</strong></div>`
    ].join("");
  }

  function initCompare() {
    const options = OBJECTS.map((obj) => `<option value="${obj.id}">${obj.name} (${obj.typeLabel})</option>`).join("");
    dom.compareA.innerHTML = options;
    dom.compareB.innerHTML = options;
    dom.compareA.value = "earth";
    dom.compareB.value = "mars";
    renderCompare();
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function currentQuizMode() {
    return QUIZ_MODES[state.quiz.mode] || QUIZ_MODES.quick;
  }

  function setQuizMode(modeId) {
    state.quiz.mode = QUIZ_MODES[modeId] ? modeId : "quick";
    const mode = currentQuizMode();
    state.quiz.total = mode.length;
    dom.quizModeLabel.textContent = `الوضع: ${mode.label}`;

    dom.modeQuickBtn.classList.toggle("active", state.quiz.mode === "quick");
    dom.modeDwarfBtn.classList.toggle("active", state.quiz.mode === "dwarf");
    dom.modeProBtn.classList.toggle("active", state.quiz.mode === "pro");
  }

  function renderQuizHud(progressText, score) {
    dom.quizProgress.textContent = progressText;
    dom.quizScoreLive.textContent = `النقاط: ${score}`;
    dom.quizModeLabel.textContent = `الوضع: ${currentQuizMode().label}`;
  }

  function renderQuizMedia(objectId) {
    const obj = objectId ? getById(objectId) : null;
    if (obj && obj.image) {
      dom.quizMediaImg.src = obj.image;
      dom.quizMediaImg.alt = "صورة مرجعية للسؤال";
      dom.quizMedia.hidden = false;
      return;
    }
    dom.quizMedia.hidden = true;
    dom.quizMediaImg.removeAttribute("src");
  }

  function renderQuizQuestion() {
    if (!state.quiz.active) {
      dom.quizQuestion.textContent = "اضغط \"ابدأ الاختبار\" لبدء الجولة.";
      dom.quizOptions.innerHTML = "";
      renderQuizHud(`0/${state.quiz.total}`, 0);
      renderQuizMedia(null);
      return;
    }

    const q = state.quiz.questions[state.quiz.index];
    if (!q) return finishQuiz();

    renderQuizHud(`${state.quiz.index + 1}/${state.quiz.total}`, state.quiz.score);
    renderQuizMedia(q.objectId);
    dom.quizQuestion.textContent = `س${state.quiz.index + 1}/${state.quiz.total}: ${q.q}`;
    dom.quizOptions.innerHTML = q.options.map((opt) => `<button type="button" data-answer="${opt}">${opt}</button>`).join("");
  }

  function startQuiz(modeId = state.quiz.mode) {
    setQuizMode(modeId);
    const mode = currentQuizMode();
    const pool = QUIZ_POOL.filter(mode.filter);
    const total = Math.max(1, Math.min(mode.length, pool.length));

    state.quiz.active = true;
    state.quiz.questions = shuffle(pool).slice(0, total);
    state.quiz.index = 0;
    state.quiz.score = 0;
    state.quiz.total = total;
    dom.quizFlash.textContent = "";
    renderQuizQuestion();
  }

  function finishQuiz() {
    const score = state.quiz.score;
    const total = state.quiz.total || BASE_QUIZ_LEN;

    const prevScore = state.progress.quizBest || 0;
    const prevTotal = state.progress.quizBestTotal || BASE_QUIZ_LEN;
    const prevRatio = prevTotal > 0 ? prevScore / prevTotal : 0;
    const nextRatio = total > 0 ? score / total : 0;
    if (nextRatio > prevRatio || (nextRatio === prevRatio && score > prevScore)) {
      state.progress.quizBest = score;
      state.progress.quizBestTotal = total;
    }

    syncBadges();
    saveProgress();
    renderStats();
    renderBadges();
    renderQuizHud(`${total}/${total}`, score);
    dom.quizQuestion.textContent = `انتهت مسابقة ${currentQuizMode().label}. نتيجتك: ${score}/${total}`;
    dom.quizOptions.innerHTML = "";
    dom.quizFlash.textContent = score === total ? "ممتاز! فتحت شارة عقل مداري." : "جيد. أعد المحاولة لنتيجة كاملة.";
    state.quiz.active = false;
  }

  function answerQuiz(answer, button) {
    if (!state.quiz.active) return;
    const q = state.quiz.questions[state.quiz.index];
    const buttons = [...dom.quizOptions.querySelectorAll("button")];
    buttons.forEach((b) => (b.disabled = true));

    if (answer === q.answer) {
      state.quiz.score += 1;
      button.classList.add("correct");
      dom.quizFlash.textContent = "إجابة صحيحة.";
    } else {
      button.classList.add("wrong");
      const correct = buttons.find((b) => b.dataset.answer === q.answer);
      if (correct) correct.classList.add("correct");
      dom.quizFlash.textContent = `الإجابة الصحيحة: ${q.answer}`;
    }

    renderQuizHud(`${state.quiz.index + 1}/${state.quiz.total}`, state.quiz.score);
    setTimeout(() => {
      state.quiz.index += 1;
      renderQuizQuestion();
    }, 550);
  }

  function bindEvents() {
    dom.cards.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const id = target.dataset.visit;
      if (id) {
        markVisited(id);
        dom.quizFlash.textContent = `تم تسجيل زيارة ${getById(id)?.name || ""}.`;
      }
    });

    dom.compareA.addEventListener("change", renderCompare);
    dom.compareB.addEventListener("change", renderCompare);
    dom.modeQuickBtn.addEventListener("click", () => startQuiz("quick"));
    dom.modeDwarfBtn.addEventListener("click", () => startQuiz("dwarf"));
    dom.modeProBtn.addEventListener("click", () => startQuiz("pro"));
    dom.startQuizBtn.addEventListener("click", () => startQuiz(state.quiz.mode));
    dom.restartQuizBtn.addEventListener("click", () => startQuiz(state.quiz.mode));

    dom.quizOptions.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      answerQuiz(target.dataset.answer || "", target);
    });

    dom.resetProgressBtn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      state.progress = defaultProgress();
      state.quiz.active = false;
      setQuizMode("quick");
      state.quiz.total = BASE_QUIZ_LEN;
      syncBadges();
      renderCards();
      renderMission();
      renderStats();
      renderBadges();
      renderQuizQuestion();
      dom.quizFlash.textContent = "تم تصفير التقدم بالكامل.";
    });
  }

  function init() {
    dom.quizMediaImg.addEventListener("error", () => {
      dom.quizMedia.hidden = true;
    });
    setQuizMode("quick");
    syncBadges();
    renderCards();
    renderMission();
    renderStats();
    renderBadges();
    renderQuizQuestion();
    initCompare();
    bindEvents();
  }

  init();
})();
