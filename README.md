# 🎓 ذاكر بذكاء - المساعد التعليمي الذكي (Zakir Smart)

منصة تعليمية متكاملة مدعومة بالذكاء الاصطناعي للمذاكرة الذكية، تلخيص المواد الدراسية، قراءة ملفات PDF، توليد الاختبارات والبطاقات التعليمية، والخرائط الذهنية باللغة العربية، ومجهزة للتحويل إلى تطبيق أندرويد (APK / PWA).

---

## 📁 هيكلية ملفات المشروع (Project Structure)

```
├── index.html                  # الصفحة الرئيسية وتهيئة الـ PWA و PDF.js
├── package.json                # التبعيات وحزم التطبيق
├── vite.config.ts              # إعدادات Vite و Tailwind CSS
├── tsconfig.json               # إعدادات TypeScript
├── capacitor.config.json       # إعدادات تحويل التطبيق إلى Android APK
├── server.ts                   # خادم Express ودمج واجهات API
├── README.md                   # دليل التشغيل والاستخدام
│
├── public/                     # الملفات الثابتة والأيقونات
│   ├── manifest.webmanifest    # ملف بيان PWA و WebAPK لنظام أندرويد
│   ├── manifest.json           # توافق إضافي للمتصفحات
│   ├── sw.js                   # Service Worker للعمل أوفلاين والتحميل السريع
│   ├── icon.svg                # أيقونة التطبيق المتجهة عالية الدقة
│   ├── pwa-192x192.png         # أيقونة شاشة الهاتف (192px)
│   ├── pwa-512x512.png         # أيقونة شاشة الهاتف والمتجر (512px)
│   ├── apple-touch-icon.png    # أيقونة أجهزة iOS
│   ├── pdf.min.js              # مكتبة قراءة ملفات PDF محلياً
│   └── pdf.worker.min.js       # Worker قراءة PDF في الخلفية
│
├── src/
│   ├── App.tsx                 # المكون الرئيسي وإدارة التبويبات والمودالز
│   ├── main.tsx                # نقطة الانطلاق لتطبيق React
│   ├── index.css               # استايلات Tailwind والخطوط العربية
│   │
│   ├── components/             # واجهات التطبيق الرئيسية
│   │   ├── Navbar.tsx          # شريط التنقل العلوي وزر تحميل APK السريع
│   │   ├── Sidebar.tsx         # القائمة الجانبية للتنقل بين الأقسام
│   │   ├── DashboardHome.tsx   # لوحة التحكم الرئيسية والبطاقات وبانر الهاتف
│   │   ├── PdfReader.tsx       # قارئ ومحلل ملفات PDF الذكي بدون استهلاك للذاكرة
│   │   ├── Summarizer.tsx      # ملخص الدروس والمستندات الذكي
│   │   ├── QuizGenerator.tsx   # مولد الاختبارات التفاعلية وحساب الدرجات
│   │   ├── FlashcardsView.tsx  # البطاقات التعليمية التفاعلية مع التقليب
│   │   ├── AiAssistant.tsx     # المساعد الأكاديمي الذكي الصوتي والكتابي
│   │   ├── MindMaps.tsx        # صانع ومستعرض الخرائط الذهنية التفاعلي
│   │   ├── StudyPlanner.tsx    # جدول وخطة المذاكرة اليومية والأسبوعية
│   │   ├── LectureTranscription.tsx # تفريغ المحاضرات الصوتية وتسجيل الصوت
│   │   ├── ProgressDashboard.tsx    # إحصائيات الإنجاز وساعات المذاكرة
│   │   ├── SavedMaterials.tsx  # المواد والملخصات المحفوظة
│   │   ├── Logo.tsx            # شعار وهوية ذاكر بذكاء
│   │   └── AndroidApkModal.tsx # نافذة تحميل وتثبيت تطبيق الأندرويد APK
│   │
│   ├── hooks/
│   │   └── usePWAInstall.ts    # مراقبة وتفعيل تثبيت WebAPK على أندرويد
│   │
│   ├── utils/
│   │   └── storage.ts          # إدارة التخزين الآمن وتفادي أخطاء السعة
│   │
│   ├── types/
│   │   └── index.ts            # تعريفات TypeScript لجميع النماذج والبيانات
│   │
│   └── data/
│       └── sampleContent.ts    # بيانات ونماذج دراسية جاهزة للاختبار الفوري
│
└── scripts/
    └── generate-icons.js       # أداة توليد أيقونات PWA تلقائياً
```

---

## 💻 طريقة التشغيل على جهازك (Local Development)

1. **فك الضغط** عن ملف المشروع في مجلد على حاسوبك.
2. تأكد من تثبيت **Node.js** (الإصدار 18 أو أحدث).
3. افتح موجه الأوامر (Terminal / CMD) داخل مجلد المشروع ونفذ:
   ```bash
   npm install
   ```
4. لتشغيل التطبيق في وضع التطوير المحلي:
   ```bash
   npm run dev
   ```
5. افتح المتصفح على: `http://localhost:3000`

---

## 📱 طريقة تحويل التطبيق إلى ملف APK

### الطريقة الأولى: عبر PWABuilder (الأسهل بدون تثبيت برامج):
1. افتح موقع [PWABuilder.com](https://www.pwabuilder.com/).
2. ضع رابط التطبيق المنشور واضغط Start.
3. اختر **Package for Android** واضغط تنزيل ملف الـ `.apk`.

### الطريقة الثانية: عبر Capacitor وأندرويد ستوديو (مشروع أصلي كامل):
الملف `capacitor.config.json` جاهز مسبقاً في المشروع. فقط شغّل:
```bash
npm install @capacitor/core @capacitor/android @capacitor/cli
npm run build
npx cap add android
npx cap copy
npx cap open android
```
سيفتح لك **Android Studio**، ومن القائمة العلوية اضغط:
`Build > Build Bundle(s) / APK(s) > Build APK(s)`
وسيتم إنشاء ملف الـ APK وتثبيته مباشرة على هاتفك أو محاكي الأندرويد!
