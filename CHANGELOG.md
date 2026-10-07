# Changelog

تمام تغییرات قابل انتشار KowsarPanel در این فایل ثبت می‌شوند. نسخه‌ی نمایشی از
`appVersion` پروفایل‌های runtime می‌آید و نسخه‌ی `package.json` معادل SemVer آن
بدون صفرهای ابتدایی هر segment است.

## [15.02.05] - 2026-09-16

### Added

- release manifest دارای inventory و SHA-256 برای artifactهای frontend؛
- source map خصوصی و حذف source map از artifact عمومی؛
- smoke test استاندارد برای frontend، health، authentication و SignalR؛
- health تجمیعی وابستگی‌های Database و PBX/Realtime؛
- ثبت و ارسال کنترل‌شده‌ی خطاهای runtime فرانت‌اند به endpoint موجود Kowsar.

### Changed

- تکمیل quality gateهای Phase 4 و بهینه‌سازی bundle، PWA و Dark Theme در Phase 5؛
- استانداردسازی versioning و فرایند release/rollback در Phase 6.

[15.02.05]: docs/PHASE-6-RELEASE-OPERATIONS.md
