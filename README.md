# Astronomy DZ

Astronomy DZ is a static astronomy web app with an optional Capacitor Android wrapper.

## Live deployment

This repository is configured for GitHub Pages via:

`.github/workflows/deploy-pages.yml`

After each push to `main`, GitHub Actions deploys the site automatically.

## Run locally

Option 1 (Python):

```bash
python run-local.py
```

Option 2 (batch script on Windows):

```bash
run.bat
```

Then open:

`http://localhost:8000`

## Mobile build (Capacitor)

```bash
npm install
npm run mobile:sync
npm run mobile:open
```

APK commands:

```bash
npm run mobile:apk:debug
npm run mobile:apk:release
```
