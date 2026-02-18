(() => {
  const $ = (id) => document.getElementById(id);
  const ui = {
    botTitle: $("botTitle"),
    botSubtitle: $("botSubtitle"),
    detailModeLabel: $("detailModeLabel"),
    detailMode: $("detailMode"),
    aiHeading: $("aiHeading"),
    aiModeLabel: $("aiModeLabel"),
    aiMode: $("aiMode"),
    aiEndpoint: $("aiEndpoint"),
    aiModel: $("aiModel"),
    aiKey: $("aiKey"),
    aiSaveBtn: $("aiSaveBtn"),
    aiTestBtn: $("aiTestBtn"),
    aiStatus: $("aiStatus"),
    voiceStatus: $("voiceStatus"),
    syncBtn: $("syncBtn"),
    clearBtn: $("clearBtn"),
    syncStatus: $("syncStatus"),
    feedHeading: $("feedHeading"),
    homeLink: $("homeLink"),
    brandText: $("brandText"),
    messages: $("messages"),
    quickLatest: $("quickLatest"),
    quickObjects: $("quickObjects"),
    quickBlackHoles: $("quickBlackHoles"),
    quickCompare: $("quickCompare"),
    quickActions: $("quickActions"),
    userInput: $("userInput"),
    sendBtn: $("sendBtn"),
    latestBtn: $("latestBtn"),
    regenBtn: $("regenBtn"),
    editLastBtn: $("editLastBtn"),
    micBtn: $("micBtn"),
    ttsBtn: $("ttsBtn"),
    missionFeed: $("missionFeed")
  };
  if (Object.values(ui).some((node) => !node)) return;

  const YEAR = new Date().getUTCFullYear();
  const MAX_HISTORY = 60;
  const NEWS_TTL_MS = 1000 * 60 * 30;
  const EARTH_GRAVITY = 9.81;
  const NEWS_HINTS = ["اخر", "آخر", "الجديد", "استكشاف", "اخبار", "news", "latest", "this year"];
  const SCIENCE_SOURCES = [
    { tags: ["نجم", "star", "planet", "moon", "كوكب", "قمر"], ar: "NASA Solar System", en: "NASA Solar System", url: "https://science.nasa.gov/solar-system/" },
    { tags: ["black hole", "ثقب", "event horizon"], ar: "NASA Black Holes", en: "NASA Black Holes", url: "https://science.nasa.gov/universe/black-holes/" },
    { tags: ["dark matter", "مظلمة"], ar: "NASA Dark Matter", en: "NASA Dark Matter", url: "https://science.nasa.gov/universe/dark-matter-dark-energy/" },
    { tags: ["big bang", "انفجار", "cosmology", "كون"], ar: "NASA Universe", en: "NASA Universe", url: "https://science.nasa.gov/universe/" },
    { tags: ["spectroscopy", "doppler", "مطياف", "طيف"], ar: "ESA Space Science", en: "ESA Space Science", url: "https://www.esa.int/Science_Exploration/Space_Science" },
    { tags: ["mars", "مريخ", "rover", "perseverance", "curiosity"], ar: "NASA Mars Exploration", en: "NASA Mars Exploration", url: "https://science.nasa.gov/mars/" },
    { tags: ["titan", "europa", "يوروبا", "تيتان", "icy"], ar: "NASA Outer Planets", en: "NASA Outer Planets", url: "https://science.nasa.gov/solar-system/planets/" },
    { tags: ["orbit", "مدار", "ephemeris"], ar: "JPL SSD", en: "JPL SSD", url: "https://ssd.jpl.nasa.gov/" },
    { tags: ["exoplanet", "كواكب خارجية"], ar: "NASA Exoplanets", en: "NASA Exoplanets", url: "https://science.nasa.gov/exoplanets/" }
  ];

  let settings = window.ADZSettings?.load ? window.ADZSettings.load() : { lang: "ar" };
  let lang = settings.lang === "en" ? "en" : "ar";

  const T = {
    ar: {
      title: "الموسوعة الفلكية الذكية",
      subtitle: "مساعد فلكي عربي يشرح بأسلوب مبسط أو عميق، مع دعم أحدث أخبار الاستكشافات الفضائية.",
      detailLabel: "نمط الإجابة",
      detailDeep: "تحليل عميق (أستاذ فيزياء)",
      detailBalanced: "متوازن",
      detailBrief: "مختصر",
      aiHeading: "المحرك الهجين (AI + محلي)",
      aiModeLabel: "وضع المحرك",
      aiModeAuto: "تلقائي",
      aiModeLocal: "محلي فقط",
      aiModeAi: "AI فقط",
      aiEndpointPlaceholder: "https://.../v1/chat/completions",
      aiModelPlaceholder: "gpt-4.1-mini",
      aiKeyPlaceholder: "API Key (Bearer)",
      aiSave: "حفظ إعدادات AI",
      aiTest: "اختبار AI",
      aiStatusLocalOnly: "AI: غير مهيأ (سيعمل المحرك المحلي)",
      aiStatusReady: "AI: مهيأ وجاهز",
      aiStatusSaved: "AI: تم حفظ الإعدادات",
      aiStatusTesting: "AI: جاري الاختبار...",
      aiStatusOk: "AI: الاتصال ناجح",
      aiStatusFail: "AI: فشل الاتصال، سيتم استخدام المحرك المحلي",
      aiStatusInvalid: "AI: أدخل endpoint و API key أولًا",
      mic: "MIC",
      micStop: "MIC ON",
      ttsOff: "TTS OFF",
      ttsOn: "TTS ON",
      voiceOff: "الصوت: غير مفعل",
      voiceReady: "الصوت: جاهز (إدخال/إخراج)",
      voiceNoMic: "الصوت: إدخال MIC غير مدعوم في هذا المتصفح",
      voiceListening: "الصوت: جاري الاستماع...",
      voiceError: "الصوت: حدث خطأ في الإدخال الصوتي",
      sync: "تحديث الاستكشافات",
      clear: "مسح المحادثة",
      feedHeading: "استكشافات السنة الحالية",
      home: "العودة للرئيسية",
      brand: "Astronomy DZ / Astro Bot",
      inputPlaceholder: "اكتب سؤالك الفلكي هنا...",
      send: "إرسال",
      yearNews: "أخبار السنة",
      regenerate: "إعادة التوليد",
      editLast: "تعديل آخر سؤال",
      editModeOn: "وضع التعديل مفعّل: عدّل السؤال ثم اضغط إرسال",
      editModeMissing: "لا توجد رسالة مستخدم سابقة لتعديلها.",
      regenerateMissing: "لا توجد رسالة سابقة لإعادة التوليد.",
      astroModeTeacher: "أستاذ فيزياء فلكية",
      astroModeObserver: "راصد سماء",
      astroModeMission: "مخطط بعثة",
      astroModeResearcher: "باحث علمي",
      astroUnitsSi: "SI",
      astroUnitsAstronomical: "فلكية",
      astroFocusAuto: "تلقائي",
      astroProfileTitle: "الملف الفلكي الحالي",
      astroProfileRole: "الدور",
      astroProfileFocus: "التركيز",
      astroProfileUnits: "الوحدات",
      astroProfileEscape: "سرعة الإفلات",
      astroProfileOrbitSpeed: "سرعة المدار",
      astroProfileHelp: "أوامر الدردشة: /astro role teacher|observer|mission|researcher | /astro focus mars | /astro units si|astro | /astro profile | /astro reset",
      astroCmdUpdated: (item, value) => `تم تحديث ${item}: ${value}`,
      astroCmdUnknown: "أمر فلكي غير واضح. اكتب: /astro help",
      astroCmdReset: "تمت إعادة التخصيص الفلكي للوضع الافتراضي.",
      q1: "آخر الاستكشافات",
      q2: "قوانين كبلر",
      q3: "مناورة هوهمان",
      q4: "منطقة الحياة",
      sourcesTitle: "مصادر موصى بها",
      sourcesNewsTitle: "مصادر الخبر والتحقق",
      orbitCmdNoTarget: "لم أحدد جرمًا واضحًا للأمر. اذكر مثلًا: اذهب إلى المريخ.",
      orbitCmdQueued: (verb, targetName) => `تم إرسال أمر المدار: ${verb}${targetName ? ` -> ${targetName}` : ""}. افتح واجهة المدارات لتطبيقه.`,
      orbitCmdHelp: "أوامر المدار: اذهب إلى [جرم] | تتبع [جرم] | اهبط على [جرم] | كاميرا حرة",
      p1: "ما الجديد في الاستكشافات الفضائية هذا العام؟",
      p2: "اشرح قوانين كبلر الثلاثة مع مثال عددي",
      p3: "اشرح مناورة هوهمان بين الأرض والمريخ",
      p4: "كيف نحدد منطقة الحياة حول النجوم؟",
      statusReady: "الحالة: جاهز للمزامنة",
      statusSync: "الحالة: جاري مزامنة أحدث الاستكشافات...",
      statusSyncDone: (n) => `الحالة: تمت المزامنة (${n} تحديثًا)`,
      statusFallback: "الحالة: تعذر الاتصال المباشر، تم استخدام بيانات احتياطية",
      statusFile: "الحالة: وضع ملف محلي (file://) - بيانات احتياطية",
      feedEmpty: "لا توجد بيانات متاحة الآن.",
      source: "المصدر",
      latestHeader: `أحدث استكشافات ${YEAR}:`,
      latestNone: "لم أجد تحديثات الآن. حاول مرة أخرى بعد قليل.",
      analyzing: "جاري التحليل الفيزيائي...",
      error: "حدث خطأ أثناء تجهيز الإجابة. حاول مرة أخرى.",
      greeting: "أهلًا. اسألني أي سؤال فلكي وسأشرح بأسلوب أستاذ فيزياء: الفكرة، المعادلة، التعويض العددي، ثم الخلاصة.",
      welcome: "مرحبًا، أنا البوت الفلكي. أعطيك شرحًا عميقًا بلغة الأرقام كأستاذ فيزياء: مفهوم + قانون + مثال حسابي + نتيجة. لتخصيصي من الدردشة اكتب: /astro help",
      cleared: "مرحبًا. اسألني في الفيزياء الفلكية وسأشرح لك كمدرّس: مفهوم + معادلة + مثال رقمي + خلاصة. للتخصيص السريع: /astro help",
      unclear: "اكتب السؤال بصيغة أوضح قليلًا وسأجيبك مباشرة.",
      partial: "فهمت جزءًا من السؤال. أعد صياغته مع الموضوع العلمي بدقة لأعطيك إجابة أوضح.",
      direct: "لم ألتقط محور السؤال بدقة. جرّب صيغة مباشرة مثل: اشرح الثقوب السوداء مع مثال عددي.",
      followup: "إذا أردت، أتابع بنفس السؤال بحل تفصيلي خطوة بخطوة مع تعويض كامل."
    },
    en: {
      title: "Smart Astronomy Encyclopedia",
      subtitle: "An astronomy assistant that explains concepts in simple or deep physics style, with current-year exploration updates.",
      detailLabel: "Answer Mode",
      detailDeep: "Deep Analysis (Physics Teacher)",
      detailBalanced: "Balanced",
      detailBrief: "Brief",
      aiHeading: "Hybrid Engine (AI + Local)",
      aiModeLabel: "Engine Mode",
      aiModeAuto: "Auto",
      aiModeLocal: "Local Only",
      aiModeAi: "AI Only",
      aiEndpointPlaceholder: "https://.../v1/chat/completions",
      aiModelPlaceholder: "gpt-4.1-mini",
      aiKeyPlaceholder: "API Key (Bearer)",
      aiSave: "Save AI Settings",
      aiTest: "Test AI",
      aiStatusLocalOnly: "AI: not configured (local engine active)",
      aiStatusReady: "AI: configured and ready",
      aiStatusSaved: "AI: settings saved",
      aiStatusTesting: "AI: testing connection...",
      aiStatusOk: "AI: connection successful",
      aiStatusFail: "AI: connection failed, local engine will be used",
      aiStatusInvalid: "AI: set endpoint and API key first",
      mic: "MIC",
      micStop: "MIC ON",
      ttsOff: "TTS OFF",
      ttsOn: "TTS ON",
      voiceOff: "Voice: disabled",
      voiceReady: "Voice: ready (input/output)",
      voiceNoMic: "Voice: MIC input not supported by this browser",
      voiceListening: "Voice: listening...",
      voiceError: "Voice: speech input error",
      sync: "Refresh Discoveries",
      clear: "Clear Chat",
      feedHeading: "Current-Year Discoveries",
      home: "Back to Home",
      brand: "Astronomy DZ / Astro Bot",
      inputPlaceholder: "Ask your astronomy question...",
      send: "Send",
      yearNews: "Year News",
      regenerate: "Regenerate",
      editLast: "Edit Last Prompt",
      editModeOn: "Edit mode enabled: update the prompt then press Send",
      editModeMissing: "No previous user message to edit.",
      regenerateMissing: "No previous message to regenerate.",
      astroModeTeacher: "Astrophysics Teacher",
      astroModeObserver: "Sky Observer",
      astroModeMission: "Mission Planner",
      astroModeResearcher: "Scientific Researcher",
      astroUnitsSi: "SI",
      astroUnitsAstronomical: "Astronomical",
      astroFocusAuto: "Auto",
      astroProfileTitle: "Current Astro Profile",
      astroProfileRole: "Role",
      astroProfileFocus: "Focus",
      astroProfileUnits: "Units",
      astroProfileEscape: "Escape Velocity",
      astroProfileOrbitSpeed: "Orbital Speed",
      astroProfileHelp: "Chat commands: /astro role teacher|observer|mission|researcher | /astro focus mars | /astro units si|astro | /astro profile | /astro reset",
      astroCmdUpdated: (item, value) => `Updated ${item}: ${value}`,
      astroCmdUnknown: "Unclear astro command. Type: /astro help",
      astroCmdReset: "Astro profile reset to default.",
      q1: "Latest Discoveries",
      q2: "Kepler Laws",
      q3: "Hohmann Transfer",
      q4: "Habitable Zone",
      sourcesTitle: "Recommended Sources",
      sourcesNewsTitle: "News / Verification Sources",
      orbitCmdNoTarget: "No clear target body detected. Example: go to Mars.",
      orbitCmdQueued: (verb, targetName) => `Orbit command sent: ${verb}${targetName ? ` -> ${targetName}` : ""}. Open Orbit UI to apply.`,
      orbitCmdHelp: "Orbit commands: go to [body] | follow [body] | land on [body] | free camera",
      p1: "What are the latest space exploration updates this year?",
      p2: "Explain Kepler's three laws with a numeric example",
      p3: "Explain a Hohmann transfer from Earth to Mars",
      p4: "How do we estimate the habitable zone around stars?",
      statusReady: "Status: Ready to sync",
      statusSync: "Status: Syncing latest exploration updates...",
      statusSyncDone: (n) => `Status: Synced (${n} updates)`,
      statusFallback: "Status: Live fetch failed, using fallback data",
      statusFile: "Status: local file mode (file://) - using fallback data",
      feedEmpty: "No data available right now.",
      source: "Source",
      latestHeader: `Latest ${YEAR} space discoveries:`,
      latestNone: "No updates found right now. Please try again in a moment.",
      analyzing: "Running physics analysis...",
      error: "An error occurred while preparing the answer. Please try again.",
      greeting: "Hello. Ask me any astronomy question and I will explain it like a physics instructor: concept, equation, numeric substitution, and conclusion.",
      welcome: "Hello, I am your astro bot. I provide deep, numbers-first explanations like a physics teacher: concept + law + worked example + result. To customize me in chat, type: /astro help",
      cleared: "Hi. Ask me about astrophysics and I will explain with concept + equation + numeric example + takeaway. Quick customization: /astro help",
      unclear: "Please rephrase your question a bit more clearly and I will answer directly.",
      partial: "I understood part of your question. Rephrase it with a clearer scientific target and I will give a better answer.",
      direct: "I could not detect the exact topic. Try: Explain black holes with a numeric example.",
      followup: "If you want, I can continue with a full step-by-step solved example for the same question."
    }
  };

  const P = {
    sun: { name: { ar: "الشمس", en: "Sun" }, g: 274, day: 609.1, year: 0, moons: 0, note: { ar: "النجم المركزي للنظام الشمسي ومصدر الطاقة الأساسي للأرض.", en: "Central star of the Solar System and Earth's primary energy source." } },
    mercury: { name: { ar: "عطارد", en: "Mercury" }, g: 3.7, day: 1407.6, year: 88, moons: 0, note: { ar: "أقرب كوكب للشمس وتباينه الحراري كبير جدًا.", en: "Closest planet to the Sun with extreme thermal contrast." } },
    venus: { name: { ar: "الزهرة", en: "Venus" }, g: 8.87, day: 5832.5, year: 225, moons: 0, note: { ar: "غلاف جوي شديد الكثافة وحرارة سطح عالية جدًا.", en: "Very dense atmosphere and extreme surface temperature." } },
    earth: { name: { ar: "الأرض", en: "Earth" }, g: 9.81, day: 24, year: 365.25, moons: 1, note: { ar: "البيئة الوحيدة المعروفة حاليًا الداعمة للحياة المعقدة.", en: "The only known world currently supporting complex life." } },
    mars: { name: { ar: "المريخ", en: "Mars" }, g: 3.71, day: 24.6, year: 687, moons: 2, note: { ar: "هدف رئيسي للبحث عن آثار حياة قديمة.", en: "A key target in searching for ancient life traces." } },
    jupiter: { name: { ar: "المشتري", en: "Jupiter" }, g: 24.79, day: 9.9, year: 4333, moons: 95, note: { ar: "أكبر كواكب النظام الشمسي ومجاله المغناطيسي قوي.", en: "Largest planet with a powerful magnetic field." } },
    saturn: { name: { ar: "زحل", en: "Saturn" }, g: 10.44, day: 10.7, year: 10759, moons: 146, note: { ar: "يمتلك حلقات مميزة وعددًا كبيرًا من الأقمار.", en: "Iconic ring system with many moons." } },
    uranus: { name: { ar: "أورانوس", en: "Uranus" }, g: 8.69, day: 17.2, year: 30687, moons: 27, note: { ar: "محوره مائل بشكل حاد مقارنة ببقية الكواكب.", en: "Has an unusually tilted rotation axis." } },
    neptune: { name: { ar: "نبتون", en: "Neptune" }, g: 11.15, day: 16.1, year: 60190, moons: 14, note: { ar: "رياحه من الأسرع في النظام الشمسي.", en: "Hosts some of the fastest winds in the Solar System." } },
    pluto: { name: { ar: "بلوتو", en: "Pluto" }, g: 0.62, day: 153.3, year: 90560, moons: 5, note: { ar: "كوكب قزم بسطح جليدي متنوع.", en: "A dwarf planet with diverse icy terrain." } },
    moon: { name: { ar: "القمر", en: "Moon" }, g: 1.62, day: 708.7, year: 27.3, moons: 0, note: { ar: "أقرب مختبر طبيعي لدراسة الجيولوجيا خارج الأرض.", en: "Nearest natural lab for off-Earth geology." } },
    titan: { name: { ar: "تيتان", en: "Titan" }, g: 1.35, day: 382.7, year: 15.95, moons: 0, note: { ar: "قمر ذو غلاف جوي كثيف ومركبات عضوية.", en: "Moon with thick atmosphere and organic chemistry." } },
    europa: { name: { ar: "يوروبا", en: "Europa" }, g: 1.31, day: 85.2, year: 3.55, moons: 0, note: { ar: "مرشح قوي لوجود محيط تحت السطح الجليدي.", en: "Strong candidate for a subsurface ocean." } }
  };
  const X = {
    sun: { r: 696340.0, d: 1.41, v: 0 },
    mercury: { r: 2439.7, d: 5.43, v: 47.4 }, venus: { r: 6051.8, d: 5.24, v: 35.0 }, earth: { r: 6371.0, d: 5.51, v: 29.8 }, mars: { r: 3389.5, d: 3.93, v: 24.1 },
    jupiter: { r: 69911.0, d: 1.33, v: 13.1 }, saturn: { r: 58232.0, d: 0.69, v: 9.7 }, uranus: { r: 25362.0, d: 1.27, v: 6.8 }, neptune: { r: 24622.0, d: 1.64, v: 5.4 },
    pluto: { r: 1188.3, d: 1.85, v: 4.7 }, moon: { r: 1737.4, d: 3.34, v: 1.0 }, titan: { r: 2574.7, d: 1.88, v: 5.6 }, europa: { r: 1560.8, d: 3.01, v: 13.7 }
  };

  const ALIASES = [
    ["sun", ["الشمس", "sun", "sol"]],
    ["mercury", ["عطارد", "mercury"]], ["venus", ["الزهرة", "venus"]], ["earth", ["الأرض", "ارض", "earth"]], ["mars", ["المريخ", "mars"]],
    ["jupiter", ["المشتري", "jupiter"]], ["saturn", ["زحل", "saturn"]], ["uranus", ["أورانوس", "uranus"]], ["neptune", ["نبتون", "neptune"]],
    ["pluto", ["بلوتو", "pluto"]], ["moon", ["القمر", "moon"]], ["titan", ["تيتان", "titan"]], ["europa", ["يوروبا", "europa"]]
  ];

  const KB = [
    { k: ["نجم", "كوكب", "قمر", "star", "planet", "moon"], arT: "الفرق بين النجم والكوكب والقمر", enT: "Difference Between Star, Planet, and Moon", ar: "النجم ينتج طاقة من الاندماج النووي. الكوكب لا يصدر ضوءًا ذاتيًا بل يعكس ضوء النجم. القمر يدور حول كوكب.", en: "A star produces energy by nuclear fusion. A planet does not emit its own light and mostly reflects starlight. A moon orbits a planet." },
    { k: ["ثقب", "اسود", "black hole", "event horizon"], arT: "الثقوب السوداء", enT: "Black Holes", ar: "الثقب الأسود منطقة جاذبية شديدة جدًا؛ بعد أفق الحدث لا يمكن حتى للضوء الإفلات.", en: "A black hole is a region of extremely strong gravity; beyond the event horizon, even light cannot escape." },
    { k: ["kepler", "كبلر", "مدار اهليجي"], arT: "قوانين كبلر", enT: "Kepler's Laws", ar: "قوانين كبلر الثلاثة تصف شكل المدار البيضوي، وثبات مساحة المسح في أزمنة متساوية، وعلاقة T² ∝ a³ بين زمن الدورة ونصف المحور الأكبر.", en: "Kepler's three laws describe elliptical orbits, equal area in equal time, and the relation T² ∝ a³ between period and semi-major axis." },
    { k: ["hohmann", "هوهمان", "transfer orbit", "مناورة"], arT: "مناورة هوهمان", enT: "Hohmann Transfer", ar: "مناورة هوهمان هي انتقال ثنائي الدفع بين مدارين دائريين: دفعة للمغادرة ودفعة للالتحام، وتعد اقتصادية في الوقود نسبيًا.", en: "A Hohmann transfer is a two-impulse transfer between circular orbits: one burn to depart and one to circularize, usually fuel-efficient." },
    { k: ["escape velocity", "سرعة الافلات", "سرعة الإفلات"], arT: "سرعة الإفلات", enT: "Escape Velocity", ar: "سرعة الإفلات تُعطى بالعلاقة v = √(2GM/R)، وهي أقل سرعة ابتدائية تمكّن الجسم من مغادرة مجال الجاذبية دون دفع إضافي.", en: "Escape velocity is given by v = √(2GM/R), the minimum initial speed required to leave a body's gravity without extra thrust." },
    { k: ["habitable zone", "منطقة الحياة", "goldilocks"], arT: "منطقة الحياة", enT: "Habitable Zone", ar: "منطقة الحياة هي نطاق المسافات حول نجم حيث يمكن - مبدئيًا - بقاء الماء سائلاً على سطح كوكب، مع اعتماد قوي على الغلاف الجوي.", en: "The habitable zone is the distance range around a star where liquid water can potentially persist on a planet's surface, strongly atmosphere-dependent." },
    { k: ["tidal lock", "locked rotation", "مقيد مديا", "مدي"], arT: "القفل المدي", enT: "Tidal Locking", ar: "القفل المدي يحدث عندما تتساوى فترة دوران الجرم حول نفسه مع فترة دورانه حول الجرم الأم، مثل حالة القمر مع الأرض.", en: "Tidal locking occurs when a body's rotation period matches its orbital period around its primary, like Earth's Moon." },
    { k: ["مادة", "مظلمة", "dark matter"], arT: "المادة المظلمة", enT: "Dark Matter", ar: "المادة المظلمة لا تُرصد مباشرة بالضوء، لكن تأثيرها الجاذبي ضروري لتفسير دوران المجرات وبنية الكون.", en: "Dark matter is not directly observed in light, but its gravity explains galaxy rotation and large-scale structure." },
    { k: ["انفجار", "عظيم", "big bang"], arT: "الانفجار العظيم", enT: "Big Bang", ar: "الانفجار العظيم يصف بداية تمدد الكون قبل نحو 13.8 مليار سنة.", en: "The Big Bang model describes the beginning of cosmic expansion about 13.8 billion years ago." },
    { k: ["مطياف", "طيف", "spectroscopy", "doppler"], arT: "التحليل الطيفي", enT: "Spectroscopy", ar: "التحليل الطيفي يكشف التركيب الكيميائي والسرعات ودرجة الحرارة عبر خطوط الامتصاص والانبعاث.", en: "Spectroscopy reveals composition, velocity, and temperature from absorption and emission lines." },
    { k: ["مريخ", "mars", "rover", "perseverance", "curiosity"], arT: "استكشاف المريخ", enT: "Mars Exploration", ar: "استكشاف المريخ يركز على الجيولوجيا القديمة وإمكان آثار الحياة الميكروبية وتحضير بعثات بشرية.", en: "Mars exploration targets ancient geology, potential biosignatures, and preparation for human missions." }
  ];

  let latestItems = [];
  const HYBRID_KEY = "astro_ai_hybrid_v1";
  const ASTRO_PROFILE_KEY = "astro_chat_profile_v1";
  const HYBRID_DEFAULT = {
    mode: "auto",
    endpoint: "",
    model: "gpt-4.1-mini",
    apiKey: ""
  };
  const ASTRO_DEFAULT = {
    role: "teacher",
    focus: "auto",
    units: "si"
  };
  const ORBIT_CMD_KEY = "adz_orbit_command_v1";
  const VOICE_KEY = "astro_voice_pref_v1";
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let hybrid = { ...HYBRID_DEFAULT };
  const voice = {
    ttsEnabled: false,
    recognition: null,
    micSupported: !!SpeechRecognitionCtor,
    listening: false
  };
  const chatState = {
    busy: false,
    editingLast: false,
    streamRunId: 0
  };
  let astroProfile = { ...ASTRO_DEFAULT };

  const keyNews = () => `astro_news_${YEAR}_v3_${lang}`;
  const keyChat = () => `astro_chat_v3_${lang}`;
  const tt = () => T[lang];
  const num = (v, p = 2) => Number.isFinite(v) ? new Intl.NumberFormat(lang === "en" ? "en-US" : "ar-DZ", { maximumFractionDigits: p }).format(v) : "-";
  const escape = (s) => (s || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
  const norm = (s) => (s || "").toLowerCase().replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  const digits = (s) => (s || "").replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const has = (q, arr) => arr.some((w) => norm(q).includes(norm(w)));
  const astroRoleSystemStyle = (role = astroProfile.role) => {
    if (role === "observer") {
      return lang === "en"
        ? "Write with observational skywatch style: practical observing tips, visibility, and orientation cues."
        : "اكتب بأسلوب الراصد: نصائح رصد عملية، قابلية الرؤية، واتجاهات السماء.";
    }
    if (role === "mission") {
      return lang === "en"
        ? "Write like a mission planner: stages, constraints, delta-v mindset, risk-aware checklist."
        : "اكتب كأسلوب مخطط بعثة: مراحل، قيود، عقلية delta-v، وقائمة تحقق للمخاطر.";
    }
    if (role === "researcher") {
      return lang === "en"
        ? "Write like a scientific researcher: assumptions, equations, uncertainty notes, and references."
        : "اكتب كأسلوب الباحث العلمي: افتراضات، معادلات، ملاحظات عدم يقين، ومراجع.";
    }
    return lang === "en"
      ? "Write like an astrophysics teacher: concept, equation, worked numeric example, conclusion."
      : "اكتب كأسلوب أستاذ فيزياء فلكية: مفهوم، معادلة، مثال عددي محلول، ثم خلاصة.";
  };
  const normalizeEndpoint = (value) => {
    const v = (value || "").trim();
    if (!v) return "";
    if (!/^https?:\/\//i.test(v)) return "";
    return v;
  };
  const isHybridConfigured = () => !!(hybrid.endpoint && hybrid.apiKey);

  function escapeVelocityKmS(bodyId) {
    const body = P[bodyId];
    const ex = X[bodyId];
    if (!body || !ex || !Number.isFinite(body.g) || !Number.isFinite(ex.r)) return null;
    return Math.sqrt(2 * body.g * ex.r * 1000) / 1000;
  }

  function formatGravity(g) {
    if (!Number.isFinite(g)) return "-";
    if (astroProfile.units === "astro") return `${num(g / EARTH_GRAVITY, 2)} g⊕ (${num(g, 2)} m/s²)`;
    return `${num(g, 2)} m/s²`;
  }

  function formatSpeedKmS(v) {
    if (!Number.isFinite(v)) return "-";
    if (astroProfile.units === "astro") return `${num(v, 2)} km/s (${num(v / 29.78, 2)} v⊕)`;
    return `${num(v, 2)} km/s`;
  }

  function loadHybridConfig() {
    try {
      const raw = localStorage.getItem(HYBRID_KEY);
      if (!raw) return { ...HYBRID_DEFAULT };
      const parsed = JSON.parse(raw);
      return {
        mode: ["auto", "local", "ai"].includes(parsed?.mode) ? parsed.mode : HYBRID_DEFAULT.mode,
        endpoint: normalizeEndpoint(parsed?.endpoint || ""),
        model: (parsed?.model || HYBRID_DEFAULT.model).trim() || HYBRID_DEFAULT.model,
        apiKey: (parsed?.apiKey || "").trim()
      };
    } catch {
      return { ...HYBRID_DEFAULT };
    }
  }

  function saveHybridConfig() {
    try {
      localStorage.setItem(HYBRID_KEY, JSON.stringify(hybrid));
    } catch {
      // Ignore storage errors in restricted browser contexts.
    }
  }

  function loadAstroProfile() {
    try {
      const raw = localStorage.getItem(ASTRO_PROFILE_KEY);
      if (!raw) return { ...ASTRO_DEFAULT };
      const parsed = JSON.parse(raw);
      return {
        role: ["teacher", "observer", "mission", "researcher"].includes(parsed?.role) ? parsed.role : ASTRO_DEFAULT.role,
        focus: (parsed?.focus === "auto" || !!P[parsed?.focus]) ? parsed.focus : ASTRO_DEFAULT.focus,
        units: ["si", "astro"].includes(parsed?.units) ? parsed.units : ASTRO_DEFAULT.units
      };
    } catch {
      return { ...ASTRO_DEFAULT };
    }
  }

  function saveAstroProfile() {
    try {
      localStorage.setItem(ASTRO_PROFILE_KEY, JSON.stringify(astroProfile));
    } catch {
      // Ignore storage restrictions.
    }
  }

  function astroRoleLabel(role = astroProfile.role) {
    if (role === "observer") return tt().astroModeObserver;
    if (role === "mission") return tt().astroModeMission;
    if (role === "researcher") return tt().astroModeResearcher;
    return tt().astroModeTeacher;
  }

  function astroUnitsLabel(units = astroProfile.units) {
    return units === "astro" ? tt().astroUnitsAstronomical : tt().astroUnitsSi;
  }

  function setAiStatus(text, active = false) {
    ui.aiStatus.textContent = text;
    ui.aiStatus.style.color = active ? "#c6ecff" : "#9fc5e8";
    ui.aiStatus.style.borderColor = active ? "rgba(128, 216, 255, 0.45)" : "rgba(117, 213, 255, 0.2)";
  }

  function applyHybridUiTexts() {
    const t = tt();
    ui.aiHeading.textContent = t.aiHeading;
    ui.aiModeLabel.textContent = t.aiModeLabel;
    if (ui.aiMode.options[0]) ui.aiMode.options[0].textContent = t.aiModeAuto;
    if (ui.aiMode.options[1]) ui.aiMode.options[1].textContent = t.aiModeLocal;
    if (ui.aiMode.options[2]) ui.aiMode.options[2].textContent = t.aiModeAi;
    ui.aiEndpoint.placeholder = t.aiEndpointPlaceholder;
    ui.aiModel.placeholder = t.aiModelPlaceholder;
    ui.aiKey.placeholder = t.aiKeyPlaceholder;
    ui.aiSaveBtn.textContent = t.aiSave;
    ui.aiTestBtn.textContent = t.aiTest;
  }

  function renderHybridUiState() {
    ui.aiMode.value = hybrid.mode;
    ui.aiEndpoint.value = hybrid.endpoint;
    ui.aiModel.value = hybrid.model;
    ui.aiKey.value = hybrid.apiKey;
    setAiStatus(isHybridConfigured() ? tt().aiStatusReady : tt().aiStatusLocalOnly, isHybridConfigured());
  }

  function setVoiceStatus(text, active = false) {
    ui.voiceStatus.textContent = text;
    ui.voiceStatus.style.color = active ? "#c6ecff" : "#9fc5e8";
    ui.voiceStatus.style.borderColor = active ? "rgba(128, 216, 255, 0.45)" : "rgba(117, 213, 255, 0.2)";
  }

  function loadVoicePrefs() {
    try {
      const raw = localStorage.getItem(VOICE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      voice.ttsEnabled = !!parsed?.ttsEnabled;
    } catch {
      voice.ttsEnabled = false;
    }
  }

  function saveVoicePrefs() {
    try {
      localStorage.setItem(VOICE_KEY, JSON.stringify({ ttsEnabled: voice.ttsEnabled }));
    } catch {
      // Ignore storage restrictions.
    }
  }

  function updateVoiceUi() {
    ui.micBtn.textContent = voice.listening ? tt().micStop : tt().mic;
    ui.micBtn.classList.toggle("active", voice.listening);
    ui.ttsBtn.textContent = voice.ttsEnabled ? tt().ttsOn : tt().ttsOff;
    ui.ttsBtn.classList.toggle("active", voice.ttsEnabled);
    if (!voice.micSupported) setVoiceStatus(tt().voiceNoMic);
    else if (voice.listening) setVoiceStatus(tt().voiceListening, true);
    else setVoiceStatus(voice.ttsEnabled ? tt().voiceReady : tt().voiceOff, voice.ttsEnabled);
  }

  function ensureVoiceRecognition() {
    if (!voice.micSupported || voice.recognition) return;
    voice.recognition = new SpeechRecognitionCtor();
    voice.recognition.continuous = false;
    voice.recognition.interimResults = false;
    voice.recognition.maxAlternatives = 1;
    voice.recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript?.trim() || "";
      if (!transcript) return;
      ui.userInput.value = ui.userInput.value ? `${ui.userInput.value} ${transcript}` : transcript;
      ui.userInput.focus();
    };
    voice.recognition.onend = () => {
      voice.listening = false;
      updateVoiceUi();
    };
    voice.recognition.onerror = () => {
      voice.listening = false;
      setVoiceStatus(tt().voiceError);
      updateVoiceUi();
    };
  }

  function toggleMic() {
    if (!voice.micSupported) {
      setVoiceStatus(tt().voiceNoMic);
      return;
    }
    ensureVoiceRecognition();
    if (!voice.recognition) return;
    if (voice.listening) {
      voice.recognition.stop();
      voice.listening = false;
      updateVoiceUi();
      return;
    }
    try {
      voice.recognition.lang = lang === "en" ? "en-US" : "ar-DZ";
      voice.recognition.start();
      voice.listening = true;
      updateVoiceUi();
    } catch {
      voice.listening = false;
      setVoiceStatus(tt().voiceError);
      updateVoiceUi();
    }
  }

  function toggleTts() {
    voice.ttsEnabled = !voice.ttsEnabled;
    saveVoicePrefs();
    updateVoiceUi();
  }

  function htmlToSpeechText(html) {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    const text = (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
    return text;
  }

  function speakResponse(html) {
    if (!voice.ttsEnabled || !("speechSynthesis" in window)) return;
    const text = htmlToSpeechText(html).slice(0, 900);
    if (!text) return;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "en" ? "en-US" : "ar-DZ";
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis failures.
    }
  }

  function setStatus(text, active = false) {
    ui.syncStatus.textContent = text;
    ui.syncStatus.style.color = active ? "#bce7ff" : "#aed6ff";
    ui.syncStatus.style.borderColor = active ? "rgba(142, 213, 255, 0.45)" : "rgba(136, 194, 255, 0.24)";
  }

  function setEditMode(active) {
    chatState.editingLast = !!active;
    ui.editLastBtn.classList.toggle("active", chatState.editingLast);
    if (chatState.editingLast) setStatus(tt().editModeOn, true);
    else if (!chatState.busy) setStatus(tt().statusReady);
  }

  function setChatBusy(active) {
    chatState.busy = !!active;
    ui.sendBtn.disabled = chatState.busy;
    ui.latestBtn.disabled = chatState.busy;
    ui.regenBtn.disabled = chatState.busy;
    ui.editLastBtn.disabled = chatState.busy;
    ui.quickActions.querySelectorAll("button[data-prompt]").forEach((btn) => { btn.disabled = chatState.busy; });
  }

  function getLastMessageNode(role) {
    const all = ui.messages.querySelectorAll(`.message.${role}`);
    return all.length ? all[all.length - 1] : null;
  }

  function dropMessagesAfter(node) {
    if (!node || !node.parentNode) return;
    while (ui.messages.lastElementChild && ui.messages.lastElementChild !== node) {
      ui.messages.removeChild(ui.messages.lastElementChild);
    }
  }

  function htmlToStreamText(html) {
    const div = document.createElement("div");
    div.innerHTML = (html || "").replace(/<br\s*\/?>/gi, "\n");
    return (div.textContent || div.innerText || "").replace(/\n{3,}/g, "\n\n").trim();
  }

  async function streamBotMessage(node, html) {
    const plain = htmlToStreamText(html);
    if (!plain) {
      node.innerHTML = html;
      return;
    }

    const runId = ++chatState.streamRunId;
    const delay = plain.length > 1200 ? 5 : plain.length > 600 ? 8 : 11;
    const chunk = plain.length > 900 ? 6 : plain.length > 400 ? 3 : 2;
    node.textContent = "";
    for (let i = 0; i < plain.length; i += chunk) {
      if (runId !== chatState.streamRunId) return;
      node.textContent = plain.slice(0, i + chunk);
      ui.messages.scrollTop = ui.messages.scrollHeight;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    if (runId !== chatState.streamRunId) return;
    node.innerHTML = html;
    ui.messages.scrollTop = ui.messages.scrollHeight;
  }

  function applyTexts() {
    const t = tt();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = lang === "ar" ? "الموسوعة الفلكية الذكية | Astronomy DZ" : "Smart Astronomy Encyclopedia | Astronomy DZ";
    ui.botTitle.textContent = t.title;
    ui.botSubtitle.textContent = t.subtitle;
    ui.detailModeLabel.textContent = t.detailLabel;
    ui.detailMode.options[0].textContent = t.detailDeep;
    ui.detailMode.options[1].textContent = t.detailBalanced;
    ui.detailMode.options[2].textContent = t.detailBrief;
    applyHybridUiTexts();
    ui.syncBtn.textContent = t.sync;
    ui.clearBtn.textContent = t.clear;
    ui.feedHeading.textContent = t.feedHeading;
    ui.homeLink.textContent = t.home;
    ui.brandText.textContent = t.brand;
    ui.userInput.placeholder = t.inputPlaceholder;
    ui.sendBtn.textContent = t.send;
    ui.latestBtn.textContent = t.yearNews;
    ui.regenBtn.textContent = t.regenerate;
    ui.editLastBtn.textContent = t.editLast;
    ui.quickLatest.textContent = t.q1;
    ui.quickObjects.textContent = t.q2;
    ui.quickBlackHoles.textContent = t.q3;
    ui.quickCompare.textContent = t.q4;
    ui.quickLatest.dataset.prompt = t.p1;
    ui.quickObjects.dataset.prompt = t.p2;
    ui.quickBlackHoles.dataset.prompt = t.p3;
    ui.quickCompare.dataset.prompt = t.p4;
    updateVoiceUi();
    setStatus(t.statusReady);
    setEditMode(chatState.editingLast);
    renderFeed(latestItems);
  }

  function saveHistory() {
    const items = Array.from(ui.messages.querySelectorAll(".message")).map((node) => ({ role: node.classList.contains("user") ? "user" : "bot", html: node.innerHTML }));
    localStorage.setItem(keyChat(), JSON.stringify(items.slice(-MAX_HISTORY)));
  }
  function addMessage(role, html) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    div.innerHTML = html;
    ui.messages.appendChild(div);
    ui.messages.scrollTop = ui.messages.scrollHeight;
    saveHistory();
    return div;
  }
  function loadHistory() {
    const raw = localStorage.getItem(keyChat());
    if (!raw) return false;
    try {
      const items = JSON.parse(raw);
      if (!Array.isArray(items) || !items.length) return false;
      ui.messages.innerHTML = "";
      items.forEach((item) => item?.role && item?.html && addMessage(item.role === "user" ? "user" : "bot", item.html));
      return true;
    } catch { return false; }
  }
  function clearChat() {
    chatState.streamRunId += 1;
    setEditMode(false);
    ui.messages.innerHTML = "";
    localStorage.removeItem(keyChat());
    addMessage("bot", tt().cleared);
  }

  function renderFeed(items) {
    if (!items.length) { ui.missionFeed.innerHTML = `<div class='feed-item'>${tt().feedEmpty}</div>`; return; }
    ui.missionFeed.innerHTML = items.slice(0, 10).map((it) => {
      const title = escape(it.title);
      const source = escape(it.source || "Unknown");
      const date = escape((it.published || "").slice(0, 10));
      const link = it.url ? `<a href="${it.url}" target="_blank" rel="noopener noreferrer">${title}</a>` : title;
      return `<div class="feed-item">${link}<br><span style="color:#9fc4e9;">${source} - ${date}</span></div>`;
    }).join("");
  }

  function parseNewsCache() {
    try {
      const raw = localStorage.getItem(keyNews());
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.items) || typeof parsed.savedAt !== "number") return null;
      if (Date.now() - parsed.savedAt > NEWS_TTL_MS) return null;
      return parsed.items;
    } catch { return null; }
  }
  const saveNewsCache = (items) => localStorage.setItem(keyNews(), JSON.stringify({ savedAt: Date.now(), items }));
  async function fetchJson(url, timeoutMs = 12000) {
    const c = new AbortController();
    const timer = setTimeout(() => c.abort(), timeoutMs);
    try {
      const r = await fetch(url, { signal: c.signal });
      if (!r.ok) throw new Error(String(r.status));
      return await r.json();
    } finally { clearTimeout(timer); }
  }
  const fallback = () => lang === "en"
    ? [
      { title: "Artemis lunar program updates", source: "NASA", published: `${YEAR}-01-15`, url: "https://www.nasa.gov/" },
      { title: "Improved exoplanet observation instrumentation", source: "ESA", published: `${YEAR}-02-02`, url: "https://www.esa.int/" },
      { title: "Trajectory updates for icy-moon missions", source: "JPL", published: `${YEAR}-03-08`, url: "https://www.jpl.nasa.gov/" }
    ]
    : [
      { title: "تحديثات برامج القمر ضمن Artemis", source: "NASA", published: `${YEAR}-01-15`, url: "https://www.nasa.gov/" },
      { title: "تحسين أدوات رصد الكواكب الخارجية", source: "ESA", published: `${YEAR}-02-02`, url: "https://www.esa.int/" },
      { title: "تحديث مسارات بعثات الأقمار الجليدية", source: "JPL", published: `${YEAR}-03-08`, url: "https://www.jpl.nasa.gov/" }
    ];

  async function fetchLatest(force = false) {
    if (location.protocol === "file:") { setStatus(tt().statusFile); return fallback(); }
    if (!force) { const c = parseNewsCache(); if (c?.length) return c; }
    try {
      setStatus(tt().statusSync, true);
      const json = await fetchJson("https://api.spaceflightnewsapi.net/v4/articles/?limit=40&ordering=-published_at");
      const records = Array.isArray(json?.results) ? json.results : [];
      const normalized = records.map((x) => ({ title: x.title || "", source: x.news_site || "Spaceflight News", published: x.published_at || "", url: x.url || "" }));
      const filtered = normalized.filter((x) => x.title && x.published.startsWith(String(YEAR)));
      const final = (filtered.length ? filtered : normalized.slice(0, 12)).slice(0, 12);
      if (!final.length) throw new Error("No records");
      saveNewsCache(final);
      setStatus(tt().statusSyncDone(final.length), true);
      return final;
    } catch { setStatus(tt().statusFallback); return fallback(); }
  }

  function toSafeHtml(text) {
    return escape(text).replace(/\n{2,}/g, "\n\n").replace(/\n/g, "<br>");
  }

  function buildHybridSystemPrompt(mode) {
    const t = tt();
    const newsContext = latestItems.slice(0, 5)
      .map((x, i) => `${i + 1}) ${x.title || "-"} | ${(x.source || "-")} | ${(x.published || "").slice(0, 10)}`)
      .join("\n");
    const focusId = astroProfile.focus !== "auto" ? astroProfile.focus : "";
    const focusName = focusId ? getBodyName(focusId) : (lang === "en" ? "Auto by user question" : "تلقائي حسب سؤال المستخدم");
    const focusBody = focusId ? P[focusId] : null;
    const focusEx = focusId ? X[focusId] : null;
    const style = (
      mode === "brief"
        ? "Keep answer concise and practical."
        : (mode === "balanced"
          ? "Use balanced depth with key numbers."
          : "Answer as a physics teacher: concept + law + numeric worked example + takeaway.")
    );
    return [
      lang === "en"
        ? "You are Astro Bot inside Astronomy DZ app."
        : "أنت Astro Bot داخل تطبيق Astronomy DZ.",
      lang === "en"
        ? `Current UTC year: ${YEAR}.`
        : `السنة الحالية UTC: ${YEAR}.`,
      lang === "en"
        ? "Prefer verified physics facts, SI units, and clear assumptions."
        : "اعتمد حقائق فيزيائية موثوقة، ووحدات SI، واذكر الافتراضات بوضوح.",
      astroRoleSystemStyle(),
      style,
      lang === "en"
        ? `Preferred units: ${astroUnitsLabel()}.`
        : `الوحدات المفضلة: ${astroUnitsLabel()}.`,
      lang === "en"
        ? `Preferred focus target: ${focusName}.`
        : `التركيز المفضل: ${focusName}.`,
      (focusBody && focusEx)
        ? (lang === "en"
          ? `Focus body data: gravity=${focusBody.g} m/s^2, radius=${focusEx.r} km, orbital speed=${focusEx.v} km/s.`
          : `بيانات جرم التركيز: الجاذبية=${focusBody.g} m/s^2، نصف القطر=${focusEx.r} km، سرعة المدار=${focusEx.v} km/s.`)
        : "",
      lang === "en"
        ? "If uncertain, say uncertainty explicitly instead of hallucinating."
        : "إذا لم تكن متأكدًا فاذكر عدم اليقين صراحةً بدل اختلاق معلومات.",
      newsContext
        ? (lang === "en" ? `Recent exploration context:\n${newsContext}` : `سياق الاستكشافات الحديثة:\n${newsContext}`)
        : "",
      lang === "en"
        ? `If asked for latest news, prioritize this year's items (${YEAR}) and mention date.`
        : `إذا طُلبت أحدث الأخبار فركّز على عناصر سنة ${YEAR} واذكر التاريخ.`
    ].filter(Boolean).join("\n\n");
  }

  async function queryHybridAi(question, mode) {
    if (!isHybridConfigured()) throw new Error("AI_NOT_CONFIGURED");
    const endpoint = normalizeEndpoint(hybrid.endpoint);
    if (!endpoint) throw new Error("AI_ENDPOINT_INVALID");
    const model = (hybrid.model || HYBRID_DEFAULT.model).trim() || HYBRID_DEFAULT.model;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hybrid.apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: mode === "deep" ? 0.25 : 0.35,
        max_tokens: mode === "brief" ? 360 : 900,
        messages: [
          { role: "system", content: buildHybridSystemPrompt(mode) },
          { role: "user", content: question }
        ]
      })
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`AI_HTTP_${res.status}:${errText.slice(0, 180)}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content
      || data?.output_text
      || "";
    const trimmed = String(content || "").trim();
    if (!trimmed) throw new Error("AI_EMPTY_RESPONSE");
    return toSafeHtml(trimmed);
  }
  function formatLatest(items) {
    if (!items.length) return tt().latestNone;
    const rows = items.slice(0, 6).map((it, i) => {
      const date = (it.published || "").slice(0, 10);
      const src = it.source || "Source";
      const title = escape(it.title);
      const srcLink = it.url ? ` <a href="${it.url}" target="_blank" rel="noopener noreferrer">${tt().source}</a>` : "";
      return `${i + 1}. ${title} <span style="color:#9ec7ef;">(${src} - ${date})</span>${srcLink}`;
    });
    return `<strong>${tt().latestHeader}</strong><br>${rows.join("<br>")}`;
  }

  function pickCitations(question, opts = {}) {
    const q = norm(question);
    const out = [];
    const seen = new Set();
    const push = (label, url) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      out.push({ label, url });
    };

    if (opts.preferNews && Array.isArray(latestItems)) {
      latestItems.slice(0, 3).forEach((item) => {
        if (!item?.url) return;
        push(item.source || "Space News", item.url);
      });
    }

    SCIENCE_SOURCES.forEach((s) => {
      if (s.tags.some((tag) => q.includes(norm(tag)))) {
        push(lang === "en" ? s.en : s.ar, s.url);
      }
    });

    if (!out.length) {
      push("NASA Science", "https://science.nasa.gov/");
      push("ESA Science", "https://www.esa.int/Science_Exploration/Space_Science");
      push("JPL", "https://www.jpl.nasa.gov/");
    }

    if (opts.preferNews && !seen.has("https://api.spaceflightnewsapi.net/v4/articles/")) {
      push("Spaceflight News API", "https://api.spaceflightnewsapi.net/v4/articles/");
    }

    return out.slice(0, opts.preferNews ? 5 : 4);
  }

  function appendCitationBlock(html, question, opts = {}) {
    const citations = pickCitations(question, opts);
    if (!citations.length) return html;
    const title = opts.preferNews ? tt().sourcesNewsTitle : tt().sourcesTitle;
    const lines = citations.map(
      (c, i) => `${i + 1}. <a href="${c.url}" target="_blank" rel="noopener noreferrer">${escape(c.label)}</a>`
    );
    return `${html}<br><br><strong>${title}:</strong><br>${lines.join("<br>")}`;
  }

  function extractMass(question) {
    const m = digits(question).replace(/,/g, ".").match(/(\d+(?:\.\d+)?)/);
    const v = m ? Number(m[1]) : 70;
    return Number.isFinite(v) && v >= 20 && v <= 300 ? v : 70;
  }
  function detectObjects(question) {
    const q = norm(question);
    return ALIASES.filter(([, words]) => words.some((w) => q.includes(norm(w)))).map(([k]) => k);
  }
  const getBodyName = (id) => (P[id]?.name?.[lang] || id || "");

  function detectAstroRole(text) {
    const q = norm(text);
    if (has(q, ["observer", "sky", "راصد"])) return "observer";
    if (has(q, ["mission", "planner", "بعثه", "بعثة", "مهمه", "مهمة"])) return "mission";
    if (has(q, ["research", "scientific", "باحث", "بحث"])) return "researcher";
    if (has(q, ["teacher", "prof", "physics", "استاذ", "أستاذ", "مدرس"])) return "teacher";
    return "";
  }

  function detectAstroUnits(text) {
    const q = norm(text);
    if (has(q, ["astro", "astronomical", "فلك", "g⊕"])) return "astro";
    if (has(q, ["si", "metric", "متر", "معياري"])) return "si";
    return "";
  }

  function detectAstroCommand(question) {
    const q = norm(question);
    const isAstroPrefix = q === "astro" || q.startsWith("astro ") || q === "فلك" || q.startsWith("فلك ");
    if (!isAstroPrefix) return null;
    const payload = q.replace(/^(astro|فلك)\s*/, "").trim();

    if (!payload || has(payload, ["profile", "حاله", "حالة", "ملف"])) return { action: "profile" };
    if (has(payload, ["help", "مساعده", "مساعدة"])) return { action: "help" };
    if (has(payload, ["reset", "default", "افتراضي"])) return { action: "reset" };

    if (has(payload, ["role", "mode", "دور", "وضع"])) {
      const role = detectAstroRole(payload);
      return role ? { action: "role", value: role } : { action: "unknown" };
    }
    if (has(payload, ["focus", "target", "تركيز", "هدف"])) {
      if (has(payload, ["auto", "تلقائي"])) return { action: "focus", value: "auto" };
      const target = detectObjects(payload)[0] || "";
      return target ? { action: "focus", value: target } : { action: "unknown" };
    }
    if (has(payload, ["units", "وحدات"])) {
      const units = detectAstroUnits(payload);
      return units ? { action: "units", value: units } : { action: "unknown" };
    }

    const roleFallback = detectAstroRole(payload);
    if (roleFallback) return { action: "role", value: roleFallback };
    return { action: "unknown" };
  }

  function buildAstroProfileHtml(question = "") {
    const qTarget = detectObjects(question)[0] || "";
    const focusId = qTarget || (astroProfile.focus !== "auto" ? astroProfile.focus : "");
    const focusName = focusId ? getBodyName(focusId) : tt().astroFocusAuto;
    const body = focusId ? P[focusId] : null;
    const ex = focusId ? X[focusId] : null;
    const esc = focusId ? escapeVelocityKmS(focusId) : null;
    const lines = [
      `<strong>${tt().astroProfileTitle}</strong>`,
      `- ${tt().astroProfileRole}: ${escape(astroRoleLabel())}`,
      `- ${tt().astroProfileFocus}: ${escape(focusName)}`,
      `- ${tt().astroProfileUnits}: ${escape(astroUnitsLabel())}`
    ];
    if (body) lines.push(`- g: ${formatGravity(body.g)}`);
    if (ex?.v) lines.push(`- ${tt().astroProfileOrbitSpeed}: ${formatSpeedKmS(ex.v)}`);
    if (Number.isFinite(esc)) lines.push(`- ${tt().astroProfileEscape}: ${formatSpeedKmS(esc)}`);
    return lines.join("<br>");
  }

  function applyAstroCommand(cmd, question = "") {
    if (!cmd) return tt().astroCmdUnknown;
    if (cmd.action === "help") return `${tt().astroProfileHelp}<br><br>${buildAstroProfileHtml(question)}`;
    if (cmd.action === "profile") return `${buildAstroProfileHtml(question)}<br><br>${tt().astroProfileHelp}`;
    if (cmd.action === "reset") {
      astroProfile = { ...ASTRO_DEFAULT };
      saveAstroProfile();
      return `${tt().astroCmdReset}<br><br>${buildAstroProfileHtml(question)}`;
    }
    if (cmd.action === "role" && cmd.value) {
      astroProfile.role = cmd.value;
      saveAstroProfile();
      return `${tt().astroCmdUpdated(tt().astroProfileRole, astroRoleLabel())}<br><br>${buildAstroProfileHtml(question)}`;
    }
    if (cmd.action === "focus" && cmd.value) {
      astroProfile.focus = cmd.value;
      saveAstroProfile();
      const valueText = cmd.value === "auto" ? tt().astroFocusAuto : getBodyName(cmd.value);
      return `${tt().astroCmdUpdated(tt().astroProfileFocus, valueText)}<br><br>${buildAstroProfileHtml(question)}`;
    }
    if (cmd.action === "units" && cmd.value) {
      astroProfile.units = cmd.value;
      saveAstroProfile();
      return `${tt().astroCmdUpdated(tt().astroProfileUnits, astroUnitsLabel())}<br><br>${buildAstroProfileHtml(question)}`;
    }
    return tt().astroCmdUnknown;
  }

  function appendAstroContext(html, question, mode) {
    if (!html) return html;
    if (mode === "brief" && astroProfile.focus === "auto" && astroProfile.role === "teacher" && astroProfile.units === "si") return html;
    return `${html}<br><br>${buildAstroProfileHtml(question)}`;
  }

  function pushOrbitCommand(cmd) {
    try {
      localStorage.setItem(ORBIT_CMD_KEY, JSON.stringify({
        ...cmd,
        issuedAt: Date.now(),
        lang
      }));
      return true;
    } catch {
      return false;
    }
  }

  function detectOrbitCommand(question) {
    const q = norm(question);
    const target = detectObjects(question)[0] || "";
    const hasGo = has(q, ["اذهب", "روح", "انتقل", "focus", "go to", "explore", "target"]);
    const hasFollow = has(q, ["تتبع", "تابع", "follow", "track"]);
    const hasLand = has(q, ["اهبط", "هبوط", "land"]);
    const hasFree = has(q, ["حر", "كاميرا حرة", "free camera", "freecam"]);
    const hasTraverseOn = has(q, ["تنقل", "traverse on", "surface traverse"]);
    const hasTraverseOff = has(q, ["اوقف التنقل", "stop traverse", "traverse off"]);

    if (hasFree) return { action: "free", targetId: "" };
    if (hasTraverseOff) return { action: "traverse_off", targetId: "" };
    if (hasTraverseOn) return { action: "traverse_on", targetId: target || "" };
    if (hasLand) return target ? { action: "land", targetId: target } : { action: "land", targetId: "" };
    if (hasFollow) return target ? { action: "follow", targetId: target } : { action: "follow", targetId: "" };
    if (hasGo) return target ? { action: "focus", targetId: target } : { action: "focus", targetId: "" };
    return null;
  }

  function orbitCommandResponse(cmd) {
    if (!cmd) return "";
    const needsTarget = ["focus", "follow", "land", "traverse_on"].includes(cmd.action);
    if (needsTarget && !cmd.targetId) return tt().orbitCmdNoTarget;
    const ok = pushOrbitCommand(cmd);
    if (!ok) return tt().error;
    const verb = (
      cmd.action === "focus" ? (lang === "en" ? "Focus" : "تركيز")
        : cmd.action === "follow" ? (lang === "en" ? "Follow" : "تتبع")
          : cmd.action === "land" ? (lang === "en" ? "Land" : "هبوط")
            : cmd.action === "traverse_on" ? (lang === "en" ? "Traverse ON" : "تنقل ON")
              : cmd.action === "traverse_off" ? (lang === "en" ? "Traverse OFF" : "تنقل OFF")
                : (lang === "en" ? "Free Camera" : "كاميرا حرة")
    );
    const targetName = cmd.targetId ? getBodyName(cmd.targetId) : "";
    const openOrbit = `<br><a href="./orbit.html" target="_blank" rel="noopener noreferrer">${lang === "en" ? "Open Orbit Interface" : "فتح واجهة المدارات"}</a>`;
    return `${tt().orbitCmdQueued(verb, targetName)}<br>${tt().orbitCmdHelp}${openOrbit}`;
  }

  function physicsDrill(question) {
    const q = norm(question);
    if (q.includes("black hole") || q.includes("ثقب")) {
      const ms = 10;
      const rs = (2 * 6.674e-11 * ms * 1.98847e30) / (299792458 ** 2);
      return lang === "en"
        ? `- Schwarzschild radius: R<sub>s</sub>=2GM/c²<br>- Example (10 M☉): R<sub>s</sub>≈${num(rs / 1000, 1)} km`
        : `- نصف قطر شفارتزشيلد: R<sub>s</sub>=2GM/c²<br>- مثال (10 كتلة شمسية): R<sub>s</sub>≈${num(rs / 1000, 1)} كم`;
    }
    return lang === "en"
      ? "- Tell me the target quantity (mass/speed/time/distance), and I will compute it step by step."
      : "- اذكر الكمية المطلوب حسابها (كتلة/سرعة/زمن/مسافة) وسأحسبها لك خطوة بخطوة.";
  }
  function objectAnswer(keys, mode, question) {
    const uniq = [...new Set(keys)].slice(0, 2);
    if (!uniq.length) return "";
    const deep = mode === "deep";
    const m = extractMass(question);
    if (uniq.length === 2) {
      const a = P[uniq[0]], b = P[uniq[1]];
      if (!a || !b) return "";
      const an = a.name[lang], bn = b.name[lang];
      if (deep) {
        const aw = m * a.g, bw = m * b.g;
        const ax = X[uniq[0]], bx = X[uniq[1]];
        return lang === "en"
          ? [`<strong>Deep physics comparison: ${an} vs ${bn}</strong>`, "- Weight law: W = m × g", `- At ${num(m, 1)} kg -> ${an}: ${num(aw, 1)} N, ${bn}: ${num(bw, 1)} N`, `- Gravity ratio: ${num(a.g / b.g, 2)}`, ax && bx ? `- Radius: ${num(ax.r, 1)} km vs ${num(bx.r, 1)} km` : "", `- Summary: ${a.note.en} | ${b.note.en}`].filter(Boolean).join("<br>")
          : [`<strong>مقارنة فيزيائية معمقة: ${an} مقابل ${bn}</strong>`, "- قانون الوزن: W = m × g", `- عند ${num(m, 1)} كغ -> ${an}: ${num(aw, 1)} نيوتن، ${bn}: ${num(bw, 1)} نيوتن`, `- نسبة الجاذبية: ${num(a.g / b.g, 2)}`, ax && bx ? `- نصف القطر: ${num(ax.r, 1)} كم مقابل ${num(bx.r, 1)} كم` : "", `- خلاصة: ${a.note.ar} | ${b.note.ar}`].filter(Boolean).join("<br>");
      }
      return lang === "en"
        ? `<strong>Quick comparison: ${an} vs ${bn}</strong><br>- Gravity: ${formatGravity(a.g)} vs ${formatGravity(b.g)}<br>- Day length: ${num(a.day, 2)} vs ${num(b.day, 2)} h<br>- Moons: ${a.moons} vs ${b.moons}`
        : `<strong>مقارنة سريعة: ${an} vs ${bn}</strong><br>- الجاذبية: ${formatGravity(a.g)} مقابل ${formatGravity(b.g)}<br>- طول اليوم: ${num(a.day, 2)} مقابل ${num(b.day, 2)} ساعة<br>- عدد الأقمار: ${a.moons} مقابل ${b.moons}`;
    }
    const item = P[uniq[0]]; if (!item) return "";
    const n = item.name[lang], ex = X[uniq[0]];
    if (deep) {
      const w = m * item.g, ew = m * EARTH_GRAVITY;
      return lang === "en"
        ? [`<strong>${n} | Deep physics analysis</strong>`, "- W = m × g", `- At ${num(m, 1)} kg:`, `  • Weight on ${n}: ${num(w, 1)} N`, `  • Weight on Earth: ${num(ew, 1)} N`, ex ? `- Radius: ${num(ex.r, 1)} km | Density: ${num(ex.d, 2)} g/cm³` : "", `- Note: ${item.note.en}`].filter(Boolean).join("<br>")
        : [`<strong>${n} | شرح فيزيائي عميق</strong>`, "- W = m × g", `- عند ${num(m, 1)} كغ:`, `  • الوزن على ${n}: ${num(w, 1)} نيوتن`, `  • الوزن على الأرض: ${num(ew, 1)} نيوتن`, ex ? `- نصف القطر: ${num(ex.r, 1)} كم | الكثافة: ${num(ex.d, 2)} غ/سم³` : "", `- ملاحظة: ${item.note.ar}`].filter(Boolean).join("<br>");
    }
    const escapeV = escapeVelocityKmS(uniq[0]);
    return lang === "en"
      ? `<strong>${n}</strong><br>- Gravity: ${formatGravity(item.g)}<br>- Day length: ${num(item.day, 2)} h<br>- Orbital year: ${item.year > 0 ? `${num(item.year, 2)} d` : "N/A"}<br>- ${tt().astroProfileOrbitSpeed}: ${ex ? formatSpeedKmS(ex.v) : "-"}<br>- ${tt().astroProfileEscape}: ${Number.isFinite(escapeV) ? formatSpeedKmS(escapeV) : "-"}<br>- Moons: ${item.moons}<br>- Note: ${item.note.en}`
      : `<strong>${n}</strong><br>- الجاذبية: ${formatGravity(item.g)}<br>- طول اليوم: ${num(item.day, 2)} ساعة<br>- طول السنة المدارية: ${item.year > 0 ? `${num(item.year, 2)} يوم` : "غير متاح"}<br>- ${tt().astroProfileOrbitSpeed}: ${ex ? formatSpeedKmS(ex.v) : "-"}<br>- ${tt().astroProfileEscape}: ${Number.isFinite(escapeV) ? formatSpeedKmS(escapeV) : "-"}<br>- عدد الأقمار: ${item.moons}<br>- ملاحظة: ${item.note.ar}`;
  }

  function kbAnswer(question, mode) {
    const tokens = norm(question).split(" ").filter(Boolean);
    if (!tokens.length) return tt().unclear;
    const detectedBodies = detectObjects(question);
    const oAns = objectAnswer(detectedBodies.length ? detectedBodies : (astroProfile.focus !== "auto" ? [astroProfile.focus] : []), mode, question);
    if (oAns) return oAns;
    let best = null, bestScore = 0;
    KB.forEach((entry) => {
      let s = 0;
      const text = norm(`${entry.arT} ${entry.enT} ${entry.k.join(" ")} ${entry.ar} ${entry.en}`);
      tokens.forEach((tk) => tk.length > 1 && text.includes(tk) && (s += 2));
      if (s > bestScore) { bestScore = s; best = entry; }
    });
    if (!best || bestScore < 2) return mode === "brief" ? tt().partial : tt().direct;
    const title = lang === "en" ? best.enT : best.arT;
    const ans = lang === "en" ? best.en : best.ar;
    if (mode === "deep") return `<strong>${title}</strong><br>${ans}<br>${physicsDrill(question)}<br><span style='color:#9ec7ef;'>${tt().followup}</span>`;
    if (mode === "brief") return `${(lang === "en" ? ans.split(".").slice(0, 2).join(".") : ans.split("،").slice(0, 2).join("،")).trim()}.`;
    return `<strong>${title}</strong><br>${ans}`;
  }

  const resolveMode = (question) => (
    ui.detailMode.value === "balanced" && has(question, ["شرح مفصل", "بالتفصيل", "بعمق", "deep", "equation", "calculate"])
      ? "deep"
      : ui.detailMode.value
  );

  async function answerLocal(question, mode) {
    const astroCmd = detectAstroCommand(question);
    if (astroCmd) return applyAstroCommand(astroCmd, question);
    if (has(question, ["السلام", "مرحبا", "اهلا", "hi", "hello", "hey"])) return tt().greeting;
    const orbitCmd = detectOrbitCommand(question);
    if (orbitCmd) return orbitCommandResponse(orbitCmd);
    if (has(question, [...NEWS_HINTS, String(YEAR)])) {
      latestItems = await fetchLatest(false);
      renderFeed(latestItems);
      return appendCitationBlock(formatLatest(latestItems), question, { preferNews: true });
    }
    const core = appendAstroContext(kbAnswer(question, mode), question, mode);
    return appendCitationBlock(core, question);
  }

  async function answer(question) {
    const mode = resolveMode(question);
    const isNewsQuery = has(question, [...NEWS_HINTS, String(YEAR)]);
    const isOrbitCmd = !!detectOrbitCommand(question);
    const isAstroCmd = !!detectAstroCommand(question);
    const localResult = await answerLocal(question, mode);
    if (isNewsQuery || isOrbitCmd || isAstroCmd) return localResult;
    if (hybrid.mode === "local") return localResult;

    if (!isHybridConfigured()) {
      if (hybrid.mode === "ai") setAiStatus(tt().aiStatusInvalid);
      return localResult;
    }

    const localLooksWeak = (
      localResult === tt().partial
      || localResult === tt().direct
      || localResult === tt().unclear
    );
    const tokenCount = norm(question).split(" ").filter(Boolean).length;
    const asksMath = has(question, ["equation", "derive", "proof", "احسب", "معادلة", "برهان", "حل"]);
    const shouldTryAi = (
      hybrid.mode === "ai"
      || (hybrid.mode === "auto" && (localLooksWeak || tokenCount >= 9 || asksMath))
    );
    if (!shouldTryAi) return localResult;

    try {
      setAiStatus(tt().aiStatusTesting, true);
      const aiHtml = await queryHybridAi(question, mode);
      setAiStatus(tt().aiStatusOk, true);
      return appendCitationBlock(appendAstroContext(aiHtml, question, mode), question);
    } catch {
      setAiStatus(tt().aiStatusFail);
      return localResult;
    }
  }

  async function send(forcedPrompt = "") {
    if (chatState.busy) return;
    const raw = forcedPrompt || ui.userInput.value;
    const text = raw.trim();
    if (!text) return;

    const isEditFlow = !forcedPrompt && chatState.editingLast;
    if (!isEditFlow && chatState.editingLast) setEditMode(false);
    if (!forcedPrompt) ui.userInput.value = "";
    setChatBusy(true);

    let ph = null;
    try {
      if (isEditFlow) {
        const lastUser = getLastMessageNode("user");
        if (!lastUser) {
          setEditMode(false);
          addMessage("bot", tt().editModeMissing);
          return;
        }
        lastUser.innerHTML = escape(text);
        dropMessagesAfter(lastUser);
        setEditMode(false);
      } else {
        addMessage("user", escape(text));
      }

      ph = addMessage("bot", `<span style='color:#a5d3ff;'>${tt().analyzing}</span>`);
      const html = await answer(text);
      await streamBotMessage(ph, html);
      speakResponse(html);
    } catch {
      if (ph) ph.innerHTML = tt().error;
      else addMessage("bot", tt().error);
      speakResponse(tt().error);
    } finally {
      setChatBusy(false);
      saveHistory();
    }
  }

  async function regenerateLastAnswer() {
    if (chatState.busy) return;
    const lastUser = getLastMessageNode("user");
    if (!lastUser) {
      addMessage("bot", tt().regenerateMissing);
      return;
    }
    const prompt = (lastUser.textContent || "").trim();
    if (!prompt) {
      addMessage("bot", tt().regenerateMissing);
      return;
    }

    setEditMode(false);
    dropMessagesAfter(lastUser);
    setChatBusy(true);

    let ph = null;
    try {
      ph = addMessage("bot", `<span style='color:#a5d3ff;'>${tt().analyzing}</span>`);
      const html = await answer(prompt);
      await streamBotMessage(ph, html);
      speakResponse(html);
    } catch {
      if (ph) ph.innerHTML = tt().error;
      else addMessage("bot", tt().error);
      speakResponse(tt().error);
    } finally {
      setChatBusy(false);
      saveHistory();
    }
  }

  function startEditLastUser() {
    if (chatState.busy) return;
    const lastUser = getLastMessageNode("user");
    if (!lastUser) {
      addMessage("bot", tt().editModeMissing);
      return;
    }
    const text = (lastUser.textContent || "").trim();
    if (!text) {
      addMessage("bot", tt().editModeMissing);
      return;
    }
    ui.userInput.value = text;
    ui.userInput.focus();
    ui.userInput.select();
    setEditMode(true);
  }

  async function sync(force = true) {
    latestItems = await fetchLatest(force);
    renderFeed(latestItems);
  }

  function readHybridUi() {
    return {
      mode: ["auto", "local", "ai"].includes(ui.aiMode.value) ? ui.aiMode.value : HYBRID_DEFAULT.mode,
      endpoint: normalizeEndpoint(ui.aiEndpoint.value),
      model: (ui.aiModel.value || HYBRID_DEFAULT.model).trim() || HYBRID_DEFAULT.model,
      apiKey: (ui.aiKey.value || "").trim()
    };
  }

  function saveHybridFromUi() {
    hybrid = readHybridUi();
    saveHybridConfig();
    setAiStatus(isHybridConfigured() ? tt().aiStatusSaved : tt().aiStatusLocalOnly, isHybridConfigured());
  }

  async function testHybridFromUi() {
    hybrid = readHybridUi();
    if (!isHybridConfigured()) {
      setAiStatus(tt().aiStatusInvalid);
      return;
    }
    setAiStatus(tt().aiStatusTesting, true);
    try {
      await queryHybridAi(
        lang === "en" ? "Reply with one line: AI link ok." : "رد بسطر واحد: تم ربط الذكاء الاصطناعي بنجاح.",
        "brief"
      );
      setAiStatus(tt().aiStatusOk, true);
    } catch {
      setAiStatus(tt().aiStatusFail);
    }
  }

  function bind() {
    ui.sendBtn.addEventListener("click", () => send());
    ui.latestBtn.addEventListener("click", () => send(tt().p1));
    ui.regenBtn.addEventListener("click", regenerateLastAnswer);
    ui.editLastBtn.addEventListener("click", startEditLastUser);
    ui.clearBtn.addEventListener("click", clearChat);
    ui.syncBtn.addEventListener("click", () => sync(true));
    ui.aiSaveBtn.addEventListener("click", saveHybridFromUi);
    ui.aiTestBtn.addEventListener("click", () => testHybridFromUi());
    ui.micBtn.addEventListener("click", toggleMic);
    ui.ttsBtn.addEventListener("click", toggleTts);
    ui.userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        send();
      } else if (e.key === "Escape" && chatState.editingLast) {
        setEditMode(false);
      }
    });
    ui.quickActions.querySelectorAll("button[data-prompt]").forEach((btn) => btn.addEventListener("click", () => send(btn.dataset.prompt || "")));
  }

  async function refreshLanguage(newSettings = null) {
    settings = newSettings || (window.ADZSettings?.load ? window.ADZSettings.load() : settings);
    const next = settings.lang === "en" ? "en" : "ar";
    const changed = next !== lang;
    lang = next;
    applyTexts();
    renderHybridUiState();
    if (changed) {
      const restored = loadHistory();
      if (!restored) addMessage("bot", tt().welcome);
      await sync(false);
    }
  }

  async function init() {
    hybrid = loadHybridConfig();
    astroProfile = loadAstroProfile();
    loadVoicePrefs();
    applyTexts();
    setChatBusy(false);
    setEditMode(false);
    renderHybridUiState();
    bind();
    const restored = loadHistory();
    if (!restored) addMessage("bot", tt().welcome);
    await sync(false);
    window.addEventListener("adz:settings-changed", (e) => e.detail && refreshLanguage(e.detail));
  }

  init();
})();
