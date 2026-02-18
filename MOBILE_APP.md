# تحويل Astronomy DZ إلى تطبيق أندرويد (APK)

## المتطلبات
- Node.js (مثبت عندك)
- Android Studio + Android SDK
- JDK 17

## ملاحظة Windows (JAVA_HOME)
إذا ظهر خطأ `JAVA_HOME is not set`:
1. افتح Android Studio وتأكد أنه مثبت بالكامل.
2. عادةً مسار Java يكون:
`C:\Program Files\Android\Android Studio\jbr`
3. أضف المتغيرات:
- `JAVA_HOME` = المسار أعلاه
- أضف `%JAVA_HOME%\bin` إلى `Path`
4. أغلق وافتح الطرفية ثم أعد المحاولة.

## أول مرة فقط
1. تثبيت الحزم:
```bash
npm install
```
2. تجهيز نسخة الهاتف (تجميع ملفات الويب إلى `mobile-web`):
```bash
npm run mobile:prepare
```
3. إنشاء مشروع Android:
```bash
npm run mobile:init
```

## أثناء التطوير
1. مزامنة آخر تعديلات الواجهة إلى Android:
```bash
npm run mobile:sync
```
2. فتح المشروع في Android Studio:
```bash
npm run mobile:open
```

## بناء APK للتجربة
```bash
npm run mobile:apk:debug
```
الملف الناتج غالبًا:
`android/app/build/outputs/apk/debug/app-debug.apk`

## ملاحظات
- التطبيق يجبر وضع الهاتف الخفيف داخل واجهة المدارات تلقائيًا.
- `Service Worker` يتعطل داخل التطبيق الأصلي لتجنب مشاكل الكاش.
- إذا عدلت ملفات الويب، نفذ دائمًا: `npm run mobile:sync` قبل إعادة البناء.
