# نشر Astronomy DZ بدون سيرفر محلي

## 1) GitHub Pages (مباشر للناس)
1. ارفع المشروع إلى GitHub.
2. اجعل الفرع الرئيسي `main` أو `master`.
3. من إعدادات المستودع: `Settings > Pages` اختر `GitHub Actions`.
4. الملف `.github/workflows/deploy-pages.yml` سينشر التطبيق تلقائيًا بعد كل `push`.
5. الرابط النهائي سيكون بصيغة:
   `https://USERNAME.github.io/REPO/`

## 2) Netlify (بديل سريع)
1. اربط المستودع بـ Netlify.
2. إعدادات النشر جاهزة مسبقًا عبر `netlify.toml`.
3. سيكون لك رابط مباشر قابل للمشاركة فور النشر.

## 3) Offline بعد أول زيارة
- تم تفعيل `Service Worker` و`manifest.webmanifest`.
- بعد أول تحميل ناجح، يمكن فتح الصفحات الأساسية حتى بدون إنترنت.

## ملاحظة مهمة
- فتح `index.html` مباشرة من `file://` قد يقيّد بعض الميزات الحديثة (خاصة WebAudio/Modules/Service Worker).
- الأفضل دائمًا رابط نشر فعلي (GitHub Pages أو Netlify).

