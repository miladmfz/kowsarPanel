Kowsar Modern Overrides
=======================

این فایل‌ها برای override کردن تم Modern قالب Minton ساخته شده‌اند، بدون اینکه فایل‌های اصلی Minton دستکاری شوند.

روش پیشنهادی:
1) فایل اصلی Minton را طبق حالت موردنیاز لود کن.
2) بلافاصله بعدش فایل override متناظر را لود کن.

نمونه Light LTR:
<link rel="stylesheet" href="assets/css/app.min.css">
<link rel="stylesheet" href="assets/css/kowsar-app.override.css">

نمونه Light RTL:
<link rel="stylesheet" href="assets/css/app-rtl.min.css">
<link rel="stylesheet" href="assets/css/kowsar-app-rtl.override.css">

نمونه Dark RTL:
<link rel="stylesheet" href="assets/css/app-dark-rtl.min.css">
<link rel="stylesheet" href="assets/css/kowsar-app-dark-rtl.override.css">

ساده‌ترین روش:
فقط فایل kowsar-theme-all.override.css را بعد از همه CSSهای Minton لود کن.

نکته:
مسیر تصویر Dashboard در فایل‌ها این است:
../images/Dashboard.jpg
اگر مسیر پروژه‌ات فرق دارد، فقط همین path را تغییر بده.
