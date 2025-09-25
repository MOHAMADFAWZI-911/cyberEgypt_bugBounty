# BugBounty Demo — Full Local Version (React + json-server)

نسخة محسّنة من ديمو منصة Bug Bounty تعمل محليًا، بما يلي:
- تسجيل / تسجيل دخول (بناءً على بيانات في `db.json`، كلمات المرور في هذا الديمو تُخزن نصًا واضحًا فقط للعرض)
- 3 أدوار: researcher, company, provider
- واجهة محسّنة باستخدام Tailwind CSS (via CDN) — لا تتطلب بناء Tailwind
- إدارة Reward Options (Cash / Gift / Points) مع شروط eligibility
- Assignments flow: company can assign provider; provider can accept/complete
- Report detail page with timeline

## تشغيل محلي
1. فك الضغط أو انسخ المجلد `bugbounty-demo-full` إلى جهازك.
2. افتح Terminal داخل المجلد ثم شغّل:
```bash
npm install
npm run dev
```
3. افتح المتصفح على: http://localhost:5173

## ملاحظات مهمة
- هذا ديمو محلي فقط — لا تستخدم هذه التركيبة في الإنتاج.
- json-server يعمل على http://localhost:4000 ويخدم `db.json`.
- لإعدادات Tailwind/Build الحقيقي يمكنك لاحقًا إدخال Tailwind كـ devDependency وبناءه.
- الملفات المعدّلة: `src/components/*`, `db.json` (seed data).

تم إنشاء الحزمة بتاريخ 2025-09-16T13:02:12.365280Z
