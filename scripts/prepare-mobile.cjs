const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "mobile-web");

const MOBILE_ENTRIES = [
  "404.html",
  "app-settings.js",
  "astro-bot-bg.jpg",
  "bot.html",
  "bot.js",
  "favicon.ico",
  "index.html",
  "manifest.webmanifest",
  "offline.html",
  "orbit.html",
  "orbit.js",
  "orbit-modules",
  "planets.html",
  "planets.js",
  "pwa-register.js",
  "quran.html",
  "scholars.html",
  "script.js",
  "settings.html",
  "space-explorer.html",
  "space-explorer.js",
  "style.css",
  "sw.js",
  "tabs.js",
  "assets"
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanOutDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

function copyEntry(relativePath) {
  const src = path.join(ROOT, relativePath);
  if (!fs.existsSync(src)) {
    console.warn(`[mobile:prepare] skipped missing: ${relativePath}`);
    return;
  }
  const dest = path.join(OUT_DIR, relativePath);
  ensureDir(path.dirname(dest));
  fs.cpSync(src, dest, { recursive: true, force: true });
}

cleanOutDir(OUT_DIR);
MOBILE_ENTRIES.forEach(copyEntry);

fs.writeFileSync(path.join(OUT_DIR, ".generated-by-mobile-prepare"), "ok\n", "utf8");
console.log(`[mobile:prepare] done -> ${path.relative(ROOT, OUT_DIR)}`);
