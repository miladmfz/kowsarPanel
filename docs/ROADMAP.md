# نقشه راه عملیاتی KowsarPanel

## هدف

تبدیل تدریجی KowsarPanel به یک پنل پایدار، قابل تست، امن و قابل توسعه، بدون بازنویسی یک‌باره و بدون متوقف کردن توسعه قابلیت‌های جاری.

## اصول اجرا

- هر فاز باید خروجی قابل نمایش و معیار پایان مشخص داشته باشد.
- تغییرات کوچک، قابل بازبینی و مستقل انجام شوند.
- قبل از Refactor، رفتار موجود با تست یا سناریوی پذیرش ثبت شود.
- تغییرات جاری تیم در Automation، Attendance و Runtime Config حفظ شوند.
- قابلیت‌های جدید تا جای ممکن از الگوی Standalone و Lazy Loading فعلی پیروی کنند.

## فاز ۰ — خط مبنا و کنترل ریسک

وضعیت: شروع شده

خروجی‌ها:

- [x] شناسایی ساختار اصلی و ماژول‌های پروژه
- [x] اجرای TypeScript check با `tsc --noEmit`
- [x] اجرای Angular development build
- [x] ثبت وضعیت اولیه Bundle و پوشش تست
- [x] تعریف سناریوهای حیاتی کسب‌وکار و Release Gate در `docs/PHASE-1-OPERATIONS.md`
- [x] تهیه ماتریس محیط‌های اجرا و Backendهای وابسته در `docs/PHASE-1-OPERATIONS.md`

خط مبنای ثبت‌شده در ۱۴۰۵/۰۶/۱۴:

- Angular 20.3 و TypeScript 5.8
- ۵۳۸ Component و ۱۲۴ Service
- ۲۲ فایل Route
- ۱۴ فایل تست و ۴۶ سناریوی تست موفق
- TypeScript check موفق
- Development build موفق
- Initial development bundle: حدود 6.02 MB

خط مبنای Backend و Database:

- ASP.NET Core با Target Framework فعلی `net8.0-windows`
- ۱۰۲ Controller و یک پروژه تست Backend با ۴۳ تست موفق
- Build موفق Backend با ۰ Error
- اتصال موفق همه ۱۶ Connection String بدون نمایش Credential
- SQL Server 2019 و دیتابیس‌های MaliKowsar99، KowsarIdentityDb، KowsarImage، wedding و ddd
- نصب بودن Schema و Procedureهای Chat V2/V3 تأیید شد؛ اجرای Script جدید لازم نبود
- حذف Logging رمز عبور از `KowsarLogin`
- ریسک‌های فوری قبلیِ .NET 7، Package آسیب‌پذیر، CORS باز و Authentication غیرفعال برطرف شدند؛ بدهی اصلی باقی‌مانده SQLهای Legacy و تکمیل TLS برای Profileهای IPمحور است.

خط مبنای API سانترال PHP:

- مسیر واقعی پروژه: `C:\xampp\htdocs\login_cdr`
- PHP 7.3.3، تعداد ۲۰ فایل PHP برنامه و حدود ۱۸٬۷۸۸ خط کد (بدون `vendor`)
- ۱۳۰ متد public در کلاس‌های Route؛ Routing فعلی بر اساس پارامتر `tag` انجام می‌شود
- پروژه در حال حاضر Git repository نیست و Test Suite خودکار ندارد
- تمام فایل‌های PHP برنامه، Config و Script از نظر Syntax بررسی و تأیید شدند
- ریسک‌های فوری: نبود Authentication واقعی روی API، وجود عملیات مدیریتی/مخرب در Routeهای عمومی، PHP قدیمی و ناسازگاری نسخه Imagick/ImageMagick

معیار پایان:

- Build و TypeScript check قابل تکرار باشند.
- پنج سناریوی حیاتی محصول و محیط‌های مورد استفاده مشخص شده باشند.

## فاز ۱ — تثبیت هسته برنامه

زمان پیشنهادی: ۱ تا ۲ Sprint

کارها:

- [x] اصلاح و یکپارچه‌سازی جریان Login، Logout و Redirect
- [x] تست `AuthGuard` برای Session، HostName و تغییر اجباری رمز
- [x] تعریف Type برای Runtime Config و اعتبارسنجی تنظیمات هنگام Bootstrap
- [x] یکپارچه‌سازی رفتار خطاهای 401، 403، 404 و 500
- [x] بررسی Loading سراسری در درخواست‌های هم‌زمان
- [x] افزودن دستورهای استاندارد `typecheck` و تست CI
- [x] حذف پوشه نسخه پشتیبان `santral0 - Copy` (۹۵ فایل tracked و قابل بازیابی از Git)
- [x] ایجاد پروژه تست Backend و Smoke Test برای Startup و Database Connectivity
- [x] ثبت قرارداد Login فعلی و طراحی Cutover از Session-based به معماری JWT جدید در `docs/AUTH-CONTRACT-AND-JWT-MIGRATION.md`

معیار پایان:

- [x] مسیرهای عمومی و محافظت‌شده تست خودکار داشته باشند.
- [x] Config ناقص با پیام مشخص و قابل فهم متوقف شود.
- [x] خطاهای احراز هویت باعث وضعیت نیمه‌واردشده نشوند.

## فاز ۲ — امنیت و مدیریت تنظیمات

زمان پیشنهادی: ۱ Sprint

وضعیت تأییدشده در ۲۰۲۶-۰۹-۱۴: تکمیل (`۱۰۰٪`). بررسی عملی URL/TLS پروفایل `qoqnooscoffee` با تصمیم مالک محصول به گیت استقرار منتقل شد؛ تا آن زمان fail-fast مانع Publish عمومی روی HTTP می‌شود.

کارها:

- [x] تفکیک تنظیمات عمومی Frontend از Secretها و اطلاعات حساس
- [x] بازبینی نگهداری Token و Session در Storage و انتقال Access Token از Local Storage به Session Storage
- [x] محدود کردن ارسال Authorization Header به Originها و Endpointهای مجاز
- [x] حذف Logging اطلاعات حساس در Production
- [x] بازبینی HTTPS/WSS و Mixed Content برای API، SignalR و WebPhone و افزودن Fail-fast در Bootstrap و Build Profile
- [x] ثبت سیاست دسترسی Routeها و فعال‌سازی RoleGuard برای مسیر مدیریتی RBAC
- [x] حذف Credentialها و کلیدهای واقعی از فایل‌های Track‌شده Backend و انتقال ۱۹ مقدار به User Secrets/Environment Variables
- [x] پارامتری‌سازی Queryهای ساخته‌شده با ورودی Request و حذف SQL Injection در مسیرهای فعال Backend .NET
- [x] حذف Logging رمز، Token و محتوای حساس از Backend و کاهش Logging پیش‌فرض به Information
- [x] محدود کردن CORS به Originهای شناخته‌شده هر Profile

معیار پایان:

- [x] هیچ Secret واقعی در Bundle فرانت‌اند وجود نداشته باشد.
- [x] مسیر مدیریتی RBAC فقط برای Role برابر `ADMIN` قابل فعال‌سازی باشد.
- [x] Publish عمومی فقط با HTTPS/WSS مجاز باشد؛ `itmaliIp` به endpoint معتبر `https://itmali.ir/webapi/` منتقل شد و `qoqnooscoffee` تا زمان تأمین URL/TLS معتبر توسط runtime audit از Build/Publish متوقف می‌شود. تست نهایی URL این Profile طبق تصمیم مالک محصول به گیت استقرار موکول شد.

## فاز ۳ — معماری و کاهش بدهی فنی

زمان پیشنهادی: ۲ تا ۴ Sprint

وضعیت: تکمیل‌شده در ۲۰۲۶-۰۹-۱۴؛ قراردادهای معماری و استثناءهای legacy در `docs/PHASE-3-ARCHITECTURE.md` ثبت شده‌اند.

کارها:

- [x] تعریف مدل‌های TypeScript برای پاسخ‌های پرتکرار API
  - [x] تعریف قراردادهای اولیه Auth، Token، Permission و RBAC و اعمال آن‌ها در مرز HTTP
  - [x] تعریف قراردادهای Base API، Grid/Lookup/Date و Workforce Absence Type و اعمال آن‌ها در مرز HTTP
- [x] کاهش تدریجی `any`، ابتدا در Auth، Base API و Shared Services
  - [x] حذف `any` از امضای تمام متدهای `AuthKowsarWebApiService`، مدل Refresh Token، `PermissionService` و accessor مربوط به `CurrentUser`
  - [x] حذف `any` از مرزهای Base API و Shared utilities و استفاده از `unknown` برای مرزهای واقعاً پویا
- [x] تفکیک Serviceهای بزرگ بر اساس Domain و Use Case
  - [x] استخراج `AuthSessionService` و `WorkforceAbsenceTypeApiService` و حفظ routeهای legacy
- [x] ایجاد الگوی مشترک برای List/Edit/Grid و عملیات CRUD
  - [x] ایجاد و تست `CrudListState<T>` و اعمال آن روی Workforce Absence Type List/Grid
- [x] یکسان‌سازی Naming فایل‌ها، کلاس‌ها و Routeها
  - [x] ثبت استاندارد `kebab-case`/`PascalCase`، افزودن مسیر canonical برای `header.service.ts` و مستندسازی حفظ routeهای legacy
- [x] جدا کردن Assetهای قدیمی jQuery از بخش‌هایی که Angular-native هستند
  - [x] حذف jQuery از bundle، جایگزینی استفاده‌های runtime با DOM/Angular و حذف ۷۹ declaration بلااستفاده `$`
- [x] حذف کد مرده و نسخه‌های کپی فقط پس از تأیید رفتاری
  - [x] حذف پیاده‌سازی‌های تکراری login/session پس از پوشش تست؛ نگهداری نسخه divergent و untracked سنترال خارج از bundle برای جلوگیری از حذف کار کاربر
- [x] ارتقای مرحله‌ای Backend به نسخه پشتیبانی‌شده .NET و هم‌تراز کردن Packageها
  - [x] ارتقا به `.NET 10` LTS و هم‌ترازی packageهای ASP.NET Core، Hosting، JWT، Serilog، Swagger و test SDK
- [x] مهاجرت از `System.Data.SqlClient` به Provider پشتیبانی‌شده پس از تست سازگاری
  - [x] مهاجرت کد به `Microsoft.Data.SqlClient 7.0.3` و حذف dependency آسیب‌پذیر transitive با محدودکردن SQLite به `System.Data.SQLite.Core`
- [x] تفکیک Query/Data Access از Controllerهای Backend
  - [x] استخراج `IBaseReadRepository`/`BaseReadRepository` برای Lookup، server date و Grid Schema همراه با تست parameterization و fallback

معیار پایان:

- [x] در کد جدید `any` بدون دلیل پذیرفته نشود.
- [x] هر Domain مرز روشن برای Component، Service، Model و Route داشته باشد.
- [x] الگوی توسعه صفحه جدید مستند و قابل کپی باشد.

Checkpoint نهایی Phase 3 (۲۰۲۶-۰۹-۱۴): `npm run verify` موفق، `72/72` تست Angular موفق، build پروفایل `itmaliIp` موفق، Release build روی `.NET 10` موفق، `148/148` تست Backend موفق و NuGet vulnerability audit بدون مورد آسیب‌پذیر. Smoke موقت روی `60007` برای live/auth/authorization موفق بود؛ readiness در محیط تست بدون ConnectionString واقعی عمداً `503` برگرداند و تست اتصال deployment به گیت محیط مقصد موکول است. پورت موجود `60006` متوقف نشد.

## فاز ۴ — تست و تضمین کیفیت

زمان پیشنهادی: پیوسته، شروع با ۲ Sprint

اولویت تست‌ها:

1. Login و Session
2. Runtime Config و Interceptorها
3. عملیات مالی حساس
4. نامه، مرخصی و حضور و غیاب
5. منوی آنلاین و سبد
6. سانترال و Realtime

کارها:

- [x] Unit Test برای Serviceها و Guardها
  - [x] پوشش Login/Session/Token/Refresh، Guardهای Auth/Role، Permission/RBAC، Runtime Config و Interceptorهای امنیت/خطا
  - [x] حفظ و اجرای تست‌های parameterization عملیات مالی، گزارش، حقوق، تنظیمات و endpointهای حساس Backend
- [x] Component Test برای فرم‌ها و Gridهای کلیدی
  - [x] تست فرم Login شامل Kowsar، Customer OTP، Permission و خطا؛ تست Grid مرجع Workforce Absence Type شامل load/error/navigation
- [x] Smoke Test مسیرهای اصلی
  - [x] integration test میزبان واقعی ASP.NET برای liveness، readiness، authorization و validation و اسکریپت process-level ایزوله روی `60007`
- [x] تعریف Fixture برای پاسخ‌های API
  - [x] fixtureهای typed برای Login، OTP، Permission و Workforce Absence Type در `src/testing/fixtures/api-response.fixtures.ts`
- [x] افزودن Quality Gate برای TypeScript check، Build و Test
  - [x] workflow مستقل Angular و Backend برای Pull Request و branch اصلی؛ شامل Runtime Config audit، vulnerability audit و smoke test

معیار پایان:

- [x] مسیرهای حیاتی در هر Merge به‌صورت خودکار بررسی شوند.
- [x] هر Bug مهم همراه Regression Test بسته شود.

Checkpoint نهایی Phase 4 (۲۰۲۶-۰۹-۱۴): تحلیل gap و ماتریس ریسک در `docs/PHASE-4-QUALITY.md` ثبت شد. تست‌های Angular از `72` به `84` و تست‌های Backend از `148` به `163` رسیدند. پوشش diagnostic Backend از `40.06%/22.29%` line/branch به `41.67%/23.69%` رسید. Quality Gateهای مستقل، fixtureهای typed و Smoke Test ایزوله `60007` اضافه شدند؛ readiness واقعی دیتابیس و URL واقعی `qoqnooscoffee` طبق تصمیم محیطی به deployment موکول ماندند.

## فاز ۵ — کارایی و تجربه کاربری

زمان پیشنهادی: ۱ تا ۲ Sprint

وضعیت: تکمیل‌شده در ۲۰۲۶-۰۹-۱۵؛ گزارش خط مبنا، بودجه‌ها، سناریوهای پذیرش و قرارداد Cache/UI در `docs/PHASE-5-PERFORMANCE.md` ثبت شده‌اند.

کارها:

- [x] تحلیل Production bundle و Chunkهای بزرگ
- [x] Lazy Load واقعی کتابخانه‌های سنگین مانند AG Grid، D3، Leaflet و WebPhone
  - [x] خارج کردن AG Grid Community/Enterprise از initial bundle و ثبت lazy placement کتابخانه‌های AG Grid، Leaflet و JsSIP در audit خودکار
  - [x] تأیید عدم انتشار D3 در build فعلی به‌دلیل نداشتن consumer فعال و حفظ component موجود برای route آینده
- [x] حذف Assetها و کتابخانه‌های بلااستفاده از artifact انتشار بدون حذف فایل‌های source یا تغییر قرارداد runtime
- [x] استانداردسازی Loading، Empty State و Error State با component مشترک و اعمال آن در Gridهای مرجع
- [x] بررسی دسترس‌پذیری، RTL، Responsive و Keyboard Navigation
  - [x] سناریوی خودکار Chrome Headless برای صفحه ورود در desktop `1440x900` و mobile `390x844`
- [x] بازبینی Cache و Service Worker
  - [x] جلوگیری از cache شدن Runtime Config، عدم تعریف cache برای APIهای حساس و اعتبارسنجی manifest/iconها

معیار پایان:

- [x] Budgetهای Bundle تعریف و در Build کنترل شوند.
- [x] صفحات اصلی روی موبایل و دسکتاپ سناریوی پذیرش داشته باشند.
- [x] خطا، Loading و نبود داده در UI رفتار یکسان داشته باشند.

Checkpoint نهایی Phase 5 (۲۰۲۶-۰۹-۱۵): initial production JS/CSS از حدود `2.79 MB` به `665,194 bytes` رسید و هیچ‌کدام از AG Grid، D3، Leaflet و JsSIP در initial graph باقی نماندند. حجم Assetهای منتشرشده از `62,842,223` به `22,796,543 bytes` کاهش یافت. Budgetهای Angular، bundle/PWA audit و پذیرش خودکار RTL/responsive/keyboard به `npm run verify` متصل شدند. تست‌های Angular از `84` به `91` سناریو افزایش یافتند. جزئیات و استثناءها در `docs/PHASE-5-PERFORMANCE.md` ثبت شده‌اند.

Extension نهایی Dark Theme (۲۰۲۶-۰۹-۱۶): هر `217` فایل CSS/SCSS و `23` بلوک inline style در `208,930` خط بررسی شد؛ selectorهای scoped نامعتبر، surfaceهای روشن بدون dark override، stateهای form/framework و contrastهای ناکافی اصلاح شدند. `theme:audit` با صفر parse/selector/contrast/coverage failure به `npm run verify` متصل شد و UI acceptance در چهار حالت desktop/mobile × light/dark اجرا می‌شود. Phase 5 همچنان `100%` تکمیل است.

## فاز ۶ — انتشار و عملیات

زمان پیشنهادی: ۱ Sprint

وضعیت: پیاده‌سازی فنی تکمیل‌شده در ۲۰۲۶-۰۹-۱۶؛ gate محیطی `qoqnooscoffee` تا تأمین DNS/TLS معتبر باز است. قراردادها و runbook در `docs/PHASE-6-RELEASE-OPERATIONS.md` ثبت شده‌اند.

کارها:

- [x] قابل تکرار کردن Build Profileها بدون تغییر موقت فایل‌های سورس
- [x] تعریف Versioning، Changelog و Release Checklist
- [x] افزودن Source Map امن و Error Monitoring برای Production
- [x] Health Check وابستگی‌های Backend و Realtime
- [x] تعریف Rollback و Smoke Test پس از انتشار
- تأمین DNS/TLS یا reverse proxy معتبر برای `qoqnooscoffee` و اجرای probe و build نهایی URLها پیش از اولین Publish این Profile (موکول‌شده از Phase 2 با تصمیم مالک محصول)

معیار پایان:

- [x] هر Profile با یک فرمان مستقل و بدون باقی گذاشتن تغییر در Git ساخته شود.
- [x] انتشار و Rollback مستند و قابل تکرار باشند.

Checkpoint فنی Phase 6 (۲۰۲۶-۰۹-۱۶): `npm run verify` با `95/95` تست Angular و `4/4` سناریوی UI موفق شد؛ build پروفایل `itmaliIp` با `477` فایل عمومی، صفر source map عمومی و `298` source map آرشیوشده خصوصی عبور کرد. Release build Backend با صفر خطا، `166/166` تست و NuGet vulnerability audit بدون مورد آسیب‌پذیر کامل شد. Smoke پس از انتشار روی Frontend موقت `41739` و Backend موقت `60007` برای shell/config/release metadata، live/ready/dependencies، session/login، browser monitoring و SignalR برابر `10/10` موفق بود؛ instanceهای موقت متوقف شدند و سرویس موجود `60006` دست‌نخورده باقی ماند. تنها gate باز، تأمین DNS/TLS معتبر و اجرای probe نهایی Profile `qoqnooscoffee` در محیط استقرار است.

## افزونه Kowsar Collaboration — P0/P1

وضعیت فنی: تکمیل‌شده در ۲۰۲۶-۰۹-۲۷؛ source، migration، permission assignment و smoke دیتابیس/Realtime روی محیط توسعه تأیید شده‌اند.

- [x] Contextual Room، Thread، User/Group Mention و Follow Thread
- [x] Read/Unread، Priority و Require Acknowledgement
- [x] Action Card allow-listed با اجرای idempotent
- [x] Attachment امن و permission-aware
- [x] Bookmark، Reminder و Scheduled Message
- [x] Advanced Search مبتنی بر membership و CentralRef
- [x] Playbook Template، Run، Step و Room اختصاصی Run
- [x] Event/System Actor و Webhook queue با retry و host allow-list
- [x] SignalR Room/User group و جلوگیری از broadcast بین Centralها
- [x] Angular standalone/lazy، responsive RTL و light/dark theme
- [x] پنل مدیریت عضو اتاق، گروه Mention و Event Integration با RBAC مستقل
- [x] hardening اجرای Playbook بر اساس `CentralRef` و webhook lease اتمیک برای اجرای چند-instance
- [x] migration idempotent و `PARSEONLY` روی `MaliKowsar99` بدون اجرای DDL
- [x] preflight فقط‌خواندنی مقصد توسعه: `MaliKowsar99`، صفر جدول/Procedure از Collaboration؛ آخرین Full Backup ثبت‌شده `2026-09-13 14:45:00`
- [x] Release gate نهایی: `npm run verify` با `135/135` تست Angular و UI acceptance برابر `4/4`؛ Release test بک‌اند `206/206`؛ smoke موقت `60007` شامل live/ready=`200`، Collaboration API/Hub بدون JWT=`401` و rate limit مسیر SMS=`429`
- [x] اجرای migration در پنجره استقرار، assign permissionها و smoke test دیتابیس‌محور
- [x] User Directory واقعی، Direct Room خصوصی دو نفره و حذف ورود دستی Subject از UI
- [x] اعلان پایدار Direct/Mention/Reply/Ack/Thread در دیتابیس، SignalR و Header
- [x] اصلاح مرز دسترسی Room بر اساس membership؛ `CentralRef` شناسه کاربر است و tenant مشترک نیست
- [x] migration تکمیلی `20260926_Collaboration_DirectMessaging.sql` و بررسی `PARSEONLY` بدون اجرای DDL
- [x] اجرای migration تکمیلی ۲۰۲۶-۰۹-۲۶ و smoke دوکاربره Direct/Notification

قرارداد، ترتیب استقرار و سناریوی smoke در `docs/COLLABORATION-P0-P1.md` ثبت شده است.

Checkpoint نهایی ۲۰۲۶-۰۹-۲۷: مقصد `MaliKowsar99` دارای ۲۳ جدول و ۵ Procedure از Collaboration، ستون `DirectKey`، جدول/Index اعلان و هر ۱۲ Permission است. هر ۱۰ Role فعال دو دسترسی پایه را دارند و تعداد grant مفقود صفر است. داده زنده یک Direct Room یکتا با دقیقاً دو عضو، دو Post و دو Notification را نشان داد؛ نویسنده/گیرنده نامعتبر و self-notification صفر بود و کاربر سوم با خطای `51001` رد شد. اتصال Kestrel/SignalR با transport اجباری WebSocket روی instance موقت `60008` برقرار و instance پس از تست متوقف شد؛ سرویس‌های موجود `60006` و `60007` دست‌نخورده ماندند. پوشش Angular Collaboration با چهار سناریوی component-level برای reload پس از ارسال، جلوگیری از پاسخ stale، رویدادهای realtime/unread و recovery اتصال به `15/15` تست موفق رسید.

### چک‌لیست Deferred برای UAT و انتشار Collaboration

این موارد مانع تکمیل فنی P0/P1 نیستند و طبق تصمیم مالک محصول باید بعداً دانه‌دانه بررسی و Done شوند:

- [ ] UAT دیداری با دو Browser/Profile و دو کاربر واقعی: بازکردن Direct Room، ارسال دوطرفه و نمایش فوری پیام بدون refresh
- [ ] کنترل badge اعلان و تغییر unread به read برای کاربر گیرنده پس از بازکردن Room
- [ ] قطع و وصل کنترل‌شده Backend در پنجره تست مستقل و تأیید reconnect و rejoin خودکار SignalR؛ processهای موجود `60006` و `60007` بدون تصمیم صریح متوقف نشوند
- [ ] revoke یا `logout all` برای Session/JWT قبلی که احتمال افشا داشته و سپس login مجدد با JWT تازه
- [ ] بازبینی نهایی Source Control و commit کردن فایل‌های Collaboration، migrationها، تست‌ها و مستندات untracked/modified مرتبط
- [ ] در محیط Published: تأیید مقصد واقعی `Kowsar_Connection` با `SELECT DB_NAME()`، گرفتن Full Backup تازه، اجرای idempotent migrationها و smoke نهایی Health/Auth/WebSocket

## Sprint اول پیشنهادی

هدف Sprint: ایمن‌سازی Bootstrap و Authentication بدون ورود به Domainهای در حال تغییر.

- [x] تست واحد `AuthGuard`
- [x] اتصال Test Target به Angular و اجرای Headless پایدار
- [x] اصلاح Redirect بدون اثر در `AppComponent` و افزودن ۴ تست سناریوی Session/Route
- [x] Type کردن و اعتبارسنجی `AppConfigService`
- [x] ایمن‌سازی تطبیق Origin/Path و تست `SecurityInterceptor`
- [x] افزودن Script استاندارد TypeScript check و Verify
- [x] اجرای Build و ثبت نتیجه نهایی
- [x] اتصال Read-only به Databaseها و تأیید Chat Schema
- [x] ثبت Baseline Build پروژه Backend
- [x] حذف Logging رمزهای Login از Backend
- [x] ایجاد اولین Test Project برای Backend و اجرای ۳ تست Password Hashing
- [x] پارامتری‌سازی Queryهای فعال Auth با ورودی Request
- [x] استفاده از مقایسه Constant-time برای Password Hash
- [x] یکپارچه‌سازی قرارداد Session در سه جریان Login و حذف Double JSON Serialization
- [x] حذف Log اطلاعات Session/User در لایه Storage و Login
- [x] افزودن ۴ تست Regression برای String، Object و Permissionهای Session (مجموع ۳۵ تست موفق Frontend)
- [x] اضافه کردن API سانترال PHP به محدوده Roadmap و ثبت Baseline فنی
- [x] حذف CORS wildcard و بازتاب دلخواه Header در API سانترال
- [x] پشتیبانی از `SANTRAL_ALLOWED_ORIGINS` برای تنظیم Originهای مجاز هر محیط
- [x] جلوگیری از Dispatch متدهای private/non-callable و تبدیل آن‌ها به پاسخ 404
- [x] اجرای Syntax Check کامل PHP و Smoke Test برای CORS و Router
- [x] جایگزینی CORS باز Backend با Allowlist قابل تنظیم از `Cors:AllowedOrigins`
- [x] افزودن Fail-fast برای نبودن Origin مجاز در تنظیمات Backend
- [x] یکپارچه‌سازی Logout در Header، Sidebar، تغییر رمز، Guard و Interceptor
- [x] حذف Redirectهای شکسته `/auth/login` و انتخاب Login متناسب با نوع کاربر
- [x] شمارنده‌ای کردن Loading سراسری برای درخواست‌های هم‌زمان و حذف Timer تداخلی Bootstrap
- [x] استانداردسازی پیام خطاهای HTTP و پوشش خطاهای Blob/Download
- [x] حذف URL و بدنه Response از Log خطای فرانت و افزودن ۷ تست Regression
- [x] افزودن Liveness endpoint در `/health/live`
- [x] افزودن Readiness endpoint دیتابیس در `/health/ready` با Query فقط‌خواندنی `SELECT 1`
- [x] اجرای واقعی Smoke Test و دریافت پاسخ `200 Healthy` از هر دو endpoint سلامت
- [x] اجرای ۵ تست Backend و ۴۲ تست Frontend بدون شکست
- [x] ثبت سناریوهای P0/P1، Release Gate و ماتریس پنج Runtime Profile
- [x] مستندسازی قرارداد Legacy Login و تصمیم Cutover به معماری JWT جدید
- [x] انتقال ۱۶ Connection String و ۳ کلید حساس Backend به .NET User Secrets بدون نمایش مقادیر
- [x] حذف Secretها از `appsettings.json` Track‌شده و تأیید مجدد Readiness دیتابیس
- [x] پارامتری‌سازی ثبت/به‌روزرسانی Session Activity در `DbService`
- [x] انتقال Access Token فرانت از Local Storage به Session Storage
- [x] فعال‌سازی RoleGuard مسیر `/rbac` برای Role مدیریتی `ADMIN` و افزودن ۳ تست
- [x] افزودن Role/Permission و `sid`/`token_version` به JWT، مدیریت نشست‌های فعال، خروج یک دستگاه یا همه دستگاه‌ها و صفحه مدیریتی `/rbac/sessions`
- [x] فعال‌سازی JWT Bearer validation و صدور Access Token در Loginهای CUSTOMER/KOWSAR
- [x] افزودن endpoint محافظت‌شده `/api/Auth/v2/session` و تأیید پاسخ 401 بدون Token
- [x] انتقال کامل OTP به Server با Challenge یک‌بارمصرف ۵ دقیقه‌ای و سقف ۵ تلاش
- [x] حذف Route عمومی ارسال SMS و افزودن Rate Limit برای Login و OTP
- [x] اجرای ۱۲ تست Backend شامل Password Hash، Health Check، JWT و OTP
- [x] افزودن Refresh Token هفت‌روزه با Hash دیتابیسی و Rotation اتمیک
- [x] افزودن Logout سمت Server و ابطال Refresh Token
- [x] بازیابی خودکار درخواست 401 در Frontend با یک Refresh مشترک برای درخواست‌های هم‌زمان
- [x] اجرای Migration جدول `AuthRefreshTokens` و Procedureهای اتمیک V2 مبتنی بر Subject
- [x] تأیید جلوگیری از Replay در تست تراکنشی واقعی بدون باقی‌گذاشتن داده تست
- [x] اجرای ۱۴ تست Backend و ۴۶ تست Frontend بدون شکست
- [x] تفکیک شناسه احراز هویت به Subjectهای `CUSTOMER:*` و `KOWSAR:*` برای جلوگیری از تداخل دو منبع کاربر
- [x] ایمن‌سازی Console در Production با حذف payloadهای حساس و افزودن ۳ تست (مجموع ۴۹ تست موفق Frontend)
- [x] بازنویسی Build Profileها با staging قطعی و بازیابی `config.json` در `finally`؛ ساخت هر چهار Profile بدون تغییر در سورس تأیید شد
- [x] رفع خطای کامپایل Backend در فیلتر تاریخ نامه و افزایش تست‌های Backend به ۴۳ تست موفق
- [x] ارتقای Target Framework Backend و تست‌ها به `net8.0-windows` و حذف Packageهای بلااستفاده ناسازگار
- [x] ارتقای `System.Data.SqlClient` به نسخه بدون Advisory و تأیید صفر Package آسیب‌پذیر در NuGet audit
- [x] ایمن‌سازی Queryهای فعال Auth، LeaveRequest، AutLetter و Row-Level Security با پارامتر و اعتبارسنجی ورودی
- [x] پارامتری‌سازی کامل ۱۱ endpoint حوزه WorkforceAbsence پس از تطبیق قرارداد ۸۵ پارامتر با metadata زنده SQL Server
- [x] پارامتری‌سازی کامل ۹ endpoint حوزه Salary/Employee پس از تطبیق قرارداد ۴۴ پارامتر و ستون با metadata زنده SQL Server
- [x] پارامتری‌سازی کامل ۲ endpoint حوزه GoodsGrp و جلوگیری از ورود JSON و Header کاربر به متن SQL
- [x] پارامتری‌سازی ۱۱ endpoint حوزه Unit، CentralGrp، City، Stack و InternalWorkItem و افزودن تست‌های تزریق در سطح Controller
- [x] بازیابی تعریف معتبر `spWeb_GetUnits` و `spWeb_GetCentralGrp` از `Update_Mali99`، تطبیق schema/result contract و افزودن migration قابل‌اجرا
- [x] اجرای migration بازیابی `spWeb_GetUnits` و `spWeb_GetCentralGrp` روی `MaliKowsar99` در Instance توسعه `.\SQL2019` و تأیید result contract با Smoke Test خواندنی
- [x] پارامتری‌سازی DbSetup و جلوگیری از ثبت `DataValue` و JSON حساس در WebLog پس از بررسی trigger و blast radius
- [x] پارامتری‌سازی ۸ مسیر Customer در `InternalCustomerController` و `InternalFactorController` پس از تطبیق قرارداد SPها و بررسی side-effectهای Customer
- [x] پارامتری‌سازی کامل ۲۱ query پویا در `InternalFactorController` و افزودن پوشش تست برای خواندن، درج، ویرایش، حذف و گزارش
- [x] بازیابی یک تعریف تاریخی `spWeb_EditFactorProperty` از Backup محلی و بررسی آن؛ تعریف قدیمی با قرارداد فعلی Controller (`@worktime` و `@Barbary`) سازگار نیست و نباید نصب شود
- [x] بازسازی `spWeb_EditFactorProperty` با اتکا به تعریف تاریخی، قرارداد پنج‌پارامتری Controller، metadata زنده `PropertyValue` و aliasهای زنده `vwFactor`؛ migration با mapping فعلی `Nvarchar15/Nvarchar9/Int1/Nvarchar14` ساخته و با `PARSEONLY` بدون اجرای DDL تأیید شد
- [x] جلوگیری از Path Traversal آپلود پیوست، حذف round-trip غیرضروری دیسک و جلوگیری از افشای خطای داخلی Realtime
- [x] محافظت JWT از SignalR و WebSocket تلفنی و افزودن Access Token به handshake فرانت‌اند
- [x] پشتیبانی Publish از ۱۶ Connection String قبلی با `appsettings.Runtime.json`، مسیر خارجی `KITS_CONFIG_PATH` و Environment Variable بدون ثبت Secret در Git
- [x] پارامتری‌سازی ۲۱ مسیر در Central، lookupهای Good و PersonInfo شامل username/password و flagهای دسترسی با metadata واقعی `MaliKowsar99`
- [x] پارامتری‌سازی ۳۳ query پویا در `FactorController` و `PreFactorController` شامل عملیات فاکتور، ردیف، نامه و فیلترهای validate‌شده
- [x] پارامتری‌سازی کامل ۱۵ مسیر باقی‌مانده `GoodController` با تطبیق قرارداد SPها و ستون‌ها از اتصال‌های واقعی `MaliKowsar99` و `KowsarImage`، ایمن‌سازی نام فایل آپلود و اعتبارسنجی Base64
- [x] پارامتری‌سازی کامل ۳۳ مسیر `InternalTaskController` شامل Pattern، GoodTask، CustomerGood، Task tree، ترتیب و dependency پس از تطبیق قرارداد ۲۵ Procedure و ستون‌های مستقیم با `MaliKowsar99`
- [x] پارامتری‌سازی کامل ۱۵ مسیر پویا در `SupportAppController` شامل activation، گزارش لاگ، وب‌سایت و تنظیمات ماژول پس از تطبیق قرارداد واقعی `SupportApp_Connection`
- [x] تکمیل ایمن‌سازی مسیرهای ورودی‌دار `BaseController` شامل property، credential، notification، attendance، report و attachment؛ پارامتری‌سازی SQL، quote امن نام دیتابیس و جلوگیری از path traversal فایل
- [x] پارامتری‌سازی کامل مسیرهای پویا در `ModuleWebApi/OrderWebController` شامل پنل سفارش، تنظیم ستون/پرینتر، کالا، گروه و تصویر؛ اعتبارسنجی selectorها و جلوگیری از افشای خطای آپلود
- [x] پارامتری‌سازی کامل مسیرهای فعال `MobileWebApi/OrderController` شامل سبد، رزرو، ردیف، تبدیل فاکتور و فیلترهای SQL؛ افزودن اعتبارسنجی identifier و جلوگیری از اجرای fragmentهای خطرناک
- [x] پارامتری‌سازی کامل مسیرهای فعال `ModuleWebApi/OcrWebController` شامل پنل OCR، تنظیم ستون/پرینتر، جزئیات بسته و پیوست؛ اصلاح query ویرایش بسته و حذف نوشتن فایل موقت هنگام دانلود
- [x] ممیزی `MobileWebApi/OcrController` و تأیید اینکه تمام endpointهای قدیمی آن داخل block comment هستند و هیچ route اجرایی برای تغییر یا تست ندارد
- [x] پارامتری‌سازی کامل مسیرهای فعال `ModuleWebApi/BrokerWebController` شامل گزارش، GPS، مشتری، تنظیم ستون/پرینتر و تصویر پس از تطبیق metadata واقعی `Broker_Connection` و `ImageConnection`
- [x] پارامتری‌سازی کامل مسیرهای فعال `MobileWebApi/BrokerController` شامل lookup، replication، سفارش چندمرحله‌ای، GPS و ثبت مشتری؛ اعتبارسنجی نام جدول پیکربندی‌شده و حذف SQL غیرضروری از پاسخ سفارش
- [x] پارامتری‌سازی کامل مسیرهای فعال `MobileWebApi/CompanyController` شامل سبد، علاقه‌مندی، گروه/کالای پویا، ساخت کاربر و ثبت سفارش؛ اعتبارسنجی سخت‌گیرانه `Where`/`OrderBy` و اصلاح پاسخ Banner
- [x] پارامتری‌سازی کامل مسیرهای فعال `ModuleWebApi/CompanyWebController` شامل تنظیم ستون، DbSetup، property و پرینتر؛ محدودسازی selectorها و جلوگیری از اجرای query خالی
- [x] پارامتری‌سازی کامل ۹ مسیر `ModuleWebApi/MenuController`، تطبیق امضای Procedureهای سفارش با `Order_Connection` و اعمال امن تنظیم حذف گروه‌های منوی آنلاین خارج از SQL
- [x] پارامتری‌سازی مسیرهای ورودی‌دار `MobileWebApi/KowsarController` شامل DbSetup، ستون‌ها و distinct lookup و محدودسازی identifier/filterهای Procedure داینامیک
- [x] پارامتری‌سازی کامل ۲۱ مسیر `WeddingWebApi/WeddingController` پس از تطبیق تمام Procedureها با دیتابیس واقعی `wedding`، تکمیل پارامتر حذف مهمان و حذف SQL حاوی payload از لاگ خطا
- [x] پارامتری‌سازی کامل ۴۳ مسیر `WeddingWebApi/EventManagementController` و تطبیق بدون اختلاف ۳۷ Procedure موجود با metadata واقعی `EventConnection`؛ حذف Query و جزئیات داخلی از پاسخ خطا
- [x] بازنویسی و پارامتری‌سازی کامل ۱۱۳ مسیر `GozareshatWebApi/ReportWebController`، حذف Queryهای بلااستفاده، جایگزینی امن وابستگی مفقود `spWeb_GetXUserReportCondition` و تطبیق زنده قرارداد `spCustomerForosh` و `spGoodForosh` با `ReportConnection`
- [x] ایمن‌سازی و حفظ قرارداد ۱۳ مسیر `KowsarBaseWebApi/KitsController`؛ پارامتری‌سازی lookup، Activation و ثبت لاگ، غیرفعال‌سازی اجرای SQL دلخواه `KowsarQuery` با پاسخ 410 و امن‌سازی SMS، دانلود و RSS
- [x] سخت‌سازی PBX Gateway؛ حذف IP پیش‌فرض از کد، validation تنظیمات runtime، حذف آدرس‌های شبکه داخلی از پاسخ Health، timeout قابل لغو و مستندسازی overrideهای محیطی Asterisk
- [x] اجرای Sweep نهایی SQL روی مسیرهای فعال Backend .NET و پارامتری‌سازی `MobileWebApi/Order/GetOrdergroupList` که هنوز `GroupCode` را مستقیم وارد SQL می‌کرد
- [x] افزودن Transport Validation به Runtime Config و Build Profile؛ رد URL دارای credential یا protocol نامعتبر و جلوگیری از Publish عمومی HTTP
- [x] انتقال `itmaliIp` از HTTP مستقیم به `https://itmali.ir/webapi/` پس از تأیید DNS یکسان، Certificate معتبر و برابری کامل پاسخ endpoint واقعی؛ security audit و Production build اختصاصی این Profile موفق بود
- [x] تعیین تکلیف HTTPS مربوط به `qoqnooscoffee` در محدوده Phase 2: runtime audit و build profile هر URL عمومی HTTP را رد می‌کنند. بررسی مجدد ۲۰۲۶-۰۹-۱۴ نشان داد فقط HTTP روی `94.139.164.68:60005` در دسترس است و دامنه رسمی نیز قرارداد API/Menu را ارائه نمی‌کند؛ تست URL و تأمین DNS/TLS با تصمیم مالک محصول به گیت استقرار موکول شد
  - ورودی لازم از محیط: یک hostname دارای گواهی معتبر که API و PHP Menu را reverse proxy کند، یا دسترسی مدیریت DNS/TLS سرور qoq برای ساخت آن
  - گام نهایی پس از تأمین زیرساخت: جایگزینی `apiUrl` و `MenuapiUrl`، اجرای probe قرارداد endpointها، `npm run security:audit` و `npm run build:qoqnooscoffee`
- [x] بازیابی تعریف `spCentral_AddNew` از `Update_Mali99` و تأیید وجود تمام Table/Functionهای وابسته در `Kowsar_Connection`؛ نسخه بازیابی‌شده به‌علت الحاق مستقیم StringValue به Dynamic SQL قابل نصب مستقیم نیست
- [x] بازنویسی امن `spCentral_AddNew` با حفظ قرارداد `@Json` و خروجی فعلی و افزودن migration؛ مقادیر JSON پارامتری هستند و identifierها فقط از `sys.columns` و با `QUOTENAME` ساخته می‌شوند
- [x] اجرای migration مربوط به `spCentral_AddNew` روی `MaliKowsar99` پس از Full Backup تأییدشده و اجرای Smoke Test واقعی insert با JSON/apostrophe و پاک‌سازی کامل توسط `ROLLBACK`
- [x] بازیابی تعریف معتبر `spWeb_ChangeGoodActive` و `spWeb_UpdateGoodDetail`، تطبیق قرارداد آن‌ها با `OrderWebController` و افزودن migration قابل‌اجرا
- [x] بازطراحی امن `spWeb_InsertGood` و افزودن migration؛ وابستگی `spWeb_AddGoodToGroup` و نام دیتابیس Hard-coded حذف شد و ثبت `Good`، `GoodStack` و `GoodGroup` به‌صورت atomic انجام می‌شود
- [x] اجرای migration سه Procedure بازیابی/بازطراحی‌شده Good روی `MaliKowsar99` و تأیید زنجیره insert/update/active با داده تست یکتا و پاک‌سازی کامل توسط `ROLLBACK`
- [x] بازیابی تعریف معتبر `spApp_OrderMizData`، تطبیق قرارداد خروجی و وابستگی‌ها با `Order_Connection` و افزودن migration قابل‌اجرا
- [x] اجرای migration مربوط به `spApp_OrderMizData` روی `MaliKowsar99` و تأیید result schema با Smoke Test خواندنی
- [x] بازیابی تعریف معتبر ۶ Procedure مفقود Event از دیتابیس `wedding`، تطبیق Signature با Controller، تأیید ۲۲ جدول/ستون وابسته در `EventConnection` و افزودن migration قابل‌اجرا
- [x] اجرای migration بازیابی ۶ Procedure مربوط به Event روی دیتابیس توسعه `ddd` و عبور ۶/۶ Smoke Test قرارداد validation
- [x] افزودن runbook استقرار دیتابیس با ماتریس دقیق Connection/Migration، preflight، ترتیب اجرا، post-deployment verification و سیاست rollback
- [x] گرفتن Full Backup از `MaliKowsar99` و `ddd` با `COPY_ONLY`، `CHECKSUM` و `COMPRESSION` و تأیید هر دو با `RESTORE VERIFYONLY` پیش از migration
- [x] ثبت صریح `ANSI_NULLS ON` و `QUOTED_IDENTIFIER ON` در تمام migrationهای Procedure پس از کشف خطای واقعی SET options در Smoke Test و تأیید persisted metadata هر ۱۴ Procedure
- [x] اجرای migration جدید `spWeb_EditFactorProperty` روی `MaliKowsar99` در Instance توسعه `.\SQL2019` پس از Full Backup تأییدشده؛ Smoke Test نوشتن/خواندن چهار property داخل transaction موفق بود و `ROLLBACK` با صفر تغییر باقی‌مانده تأیید شد
- [x] افزودن diagnostic کاملاً read-only برای استخراج authoritative definition/parameter/dependency تمام ۱۰۶ Procedure گزارش، `spWeb_GetAppBrokerReport` و schema/index/constraint/trigger جدول `ErrorLogReport` از محیط مجاز؛ پوشش نام‌ها با Controller تطبیق و اجرای آزمایشی بدون تغییر دیتابیس موفق بود
- [x] تعیین تکلیف ۱۰۶ Procedure گزارش ساده بدون حدس‌زدن یا نصب تعریف غیرمعتبر؛ routeهای Legacy حفظ شدند، وجود Procedure متناظر در `ReportConnection` پیش از اجرا با query پارامتری بررسی می‌شود و در محیط فاقد dependency پاسخ کنترل‌شده `503` برمی‌گردد. اگر Procedure معتبر در محیط Published نصب باشد، قرارداد و اجرای قبلی بدون تغییر ادامه دارد
- [x] تعیین تکلیف `spWeb_GetAppBrokerReport` بدون ساخت Procedure جعلی؛ endpoint قبل از خواندن تنظیمات و اجرای گزارش، وجود Procedure را در `Broker_Connection` بررسی می‌کند و در نبود آن `503` می‌دهد. جست‌وجوی read-only در دیتابیس‌ها و backupهای مجاز (با حذف کامل `BaseDb`) نشان داد تعریف معتبر شش‌پارامتری موجود نیست و `spApp_BrokerRep` بازیابی‌شده قرارداد متفاوتی دارد
- [x] تعیین تکلیف جدول مفقود `ErrorLogReport` بدون حدس‌زدن schema؛ مسیر `Kits/ErrorLog` قبل از `INSERT` وجود `dbo.ErrorLogReport` را در `Kits_Connection` بررسی می‌کند و در نبود جدول `503` می‌دهد. در محیط دارای جدول معتبر، رفتار ثبت قبلی حفظ می‌شود
- [x] اجرای ۱۴۷ تست Backend و ۶۲ تست Frontend بدون شکست، build کامل Backend، verify کامل Frontend، build موفق `itmaliIp` و Smoke Test واقعی Health/Authorization روی پورت موقت `60007`

## افزونه بازنویسی گزارش‌های Accounting

وضعیت فنی در ۲۰۲۶-۰۹-۲۷: کل catalog شامل ۱۵۱ فرم غیرخالی ممیزی و route شد؛ ۱۰۸ فرم فعلاً برای کاربر `admin` فعال‌اند و ۴۳ فرم dormant نیز پیشاپیش پوشش داده شدند. فقط دو فرم dormant به‌دلیل نبود source معتبر در `MaliKowsar99` قابل اجرا نیستند و تست دیداری گزارش‌به‌گزارش روی داده انتخابی مالک محصول باقی مانده است.

- [x] حفظ ۱۹ گزارش تخصصی دارای پیاده‌سازی مستقل و نمودار
- [x] جایگزینی ۱۳۲ Component خالی/تکراری با موتور مشترک Grid، فیلتر، جمع پویا و نمودار؛ `GoodFactorRptNew` خارج از محدوده و بدون تغییر باقی ماند
- [x] بازیابی mapping واقعی ۱۳۲ گزارش از Delphi و تطبیق فقط‌خواندنی sourceها با `MaliKowsar99`: تعداد ۷۸ mapping به Procedure، تعداد ۵۳ mapping به View و یک Table؛ source مشترک بعضی گزارش‌ها حفظ شد
- [x] تطبیق signature تمام Procedureها با `sys.parameters` و اجرای فقط نام‌های compile-time allow-listed با پارامترهای ADO.NET
- [x] اعمال `XUserReports.XCondition` بر همه گزارش‌ها؛ تمام ۵۱ Procedure یکتا پارامتر `WhereClause`/`WhereCluase` دارند و View/Tableها شرط را در query محدودشده خود دریافت می‌کنند
- [x] افزودن fallback عمومی برای گزارش‌های فاقد GridSchema یا دارای GridSchema قدیمی؛ API همراه هر پاسخ `ReportColumns` را از shape واقعی `DataTable` برمی‌گرداند، بنابراین حتی نتیجه صفرردیفی نیز header معتبر دارد
- [x] Smoke فقط‌خواندنی واقعی برای Procedure دارای GridSchema، Procedure فاقد GridSchema و View با نتیجه موفق؛ هیچ DDL/DML اجرا نشد
- [x] افزودن runner پذیرش API برای تمام ۱۳۲ قرارداد Legacy با JWT موقت، بدون ثبت token یا محتوای row؛ دو گزارش محاسبه موجودی و `VendorPurchaseNewRpt` که امکان side-effect دارند به‌صورت پیش‌فرض با `SKIPPED_MUTATING` اجرا نمی‌شوند
- [x] پیش از اصلاح دیتابیس، Full Backup تازه `MaliKowsar99_Pre_ReportFix_20260927_0942.bak` با `COPY_ONLY`، `CHECKSUM` و `COMPRESSION` گرفته شد؛ `RESTORE VERIFYONLY` و رکورد `msdb` معتبر بودن backup را تأیید کردند
- [x] migration محافظت‌شده `20260927_Report_FactorsSanadStack_AmbiguousColumn.sql` روی مقصد تأییدشده `DESKTOP-O538D18\SQL2019 / MaliKowsar99` اجرا شد؛ دو reference مبهم حذف و دو reference صریح `RegisteredinoutRow.TransferRowRef` در تعریف نهایی تأیید شدند
- [x] Smoke نهایی روی میزبان موقت `60008`: تعداد ۱۲۸ گزارش generic با HTTP 200 و حداقل یک ستون مؤثر، سه `SKIPPED_MUTATING`، صفر `REQUEST_ERROR` و یک `NOT_CONFIGURED` برای `CollectorGeneralRpt`؛ نبود Procedure مقصد برای `VendorPurchaseNewRpt` جداگانه با preflight فقط‌خواندنی تأیید شد و instanceهای موجود `60006` و `60007` دست‌نخورده ماندند
- [x] `AllTransactionRpt` و `KolFlowRpt` با پیش‌فرض `Department/SanadState/SanadType=0` مطابق Delphi اصلاح شدند؛ truncation قرارداد `varchar(10)` و SQL نامعتبر `IN()` حذف شد
- [x] `CollectorGeneralRpt` به `spCollector_Report_Value` وابسته است ولی تعریف معتبر آن در sourceهای Delphi و دیتابیس‌های مجاز پیدا نشد؛ `VendorPurchaseNewRpt` نیز در مقصد Procedure ندارد و نسخه موجود در `Update_Mali99` به‌علت `TRUNCATE/DELETE/UPDATE` روی جدول‌های مشترک برای نصب یا smoke خودکار امن نیست؛ هر دو در صورت فعال‌شدن پاسخ کنترل‌شده `503` می‌دهند
- [x] `npm run verify` موفق: تست Angular برابر `167/167`، build توسعه/Production، security/config/theme/bundle/PWA audit و UI acceptance برابر `4/4`؛ Release build و تست Backend نیز برابر `232/232` موفق
- [x] اجرای migration `20260927_Report_FactorsSanadStack_AmbiguousColumn.sql` روی `MaliKowsar99` پس از backup معتبر و تکرار smoke تا رسیدن به صفر `REQUEST_ERROR`
- [ ] تست دیداری نهایی header، row و chart روی داده انتخابی مالک محصول؛ پذیرش خودکار قرارداد header/row انجام شده، ولی browser surface تعاملی در محیط Codex در دسترس نبود

### تنظیم جدول سراسری AG Grid

- [x] تحلیل `fGridColumnManager` دلفی و استخراج رفتارهای اصلی شامل ترتیب، نمایش، عرض، sort و ذخیره/بازنشانی تنظیمات کاربر
- [x] اصلاح مسیر مشترک `AgGridBaseComponent`؛ جلوگیری از overwrite شدن `onGridReady` توسط mixin، رفع context-menu معیوب و جایگزینی API منسوخ `columnApi` با `GridApi` نسخه ۳۴
- [x] افزودن Columns/Filters Tool Panel و منوی فارسی تنظیم جدول برای تمام Gridهای مبتنی بر Base مشترک
- [x] ذخیره خودکار و دستی ترتیب، visibility، width، pin، sort و filter و بازیابی پس از بارگذاری مجدد؛ state بر اساس کاربر، route، component و شماره Grid جدا می‌شود و هیچ row data ذخیره نمی‌شود
- [x] پوشش تمام ۱۱۴ نمونه Grid در ۱۱۲ template گزارش: همگی `gridOptions` و `onGridReady` مشترک دارند؛ هر ۹۸ override موجود نیز `super.onGridReady` را فراخوانی می‌کند
- [x] تست اختصاصی ذخیره/بازیابی/reset و جداسازی کاربران، typecheck، تعداد `180/180` تست Angular، build توسعه/Production، auditهای امنیت/config/theme/bundle/PWA و UI acceptance برابر `4/4`
- [x] تست یکپارچه با نمونه واقعی `AgGridAngular` در DOM: نمایش header/row، بازشدن Columns Tool Panel، مخفی‌سازی ستون، ذخیره عرض و بازیابی پس از destroy/recreate؛ race میان `firstDataRendered` و `sizeColumnsToFit` نیز با حفظ آخرین deadline بازیابی اصلاح شد
- [x] پاک‌سازی خروجی verification: تصاویر موردنیاز در Karma سرو می‌شوند و `404` لوگو حذف شد؛ dependencyهای CommonJS اجتناب‌ناپذیر فعلی نیز به‌صورت صریح در Angular ثبت شدند و Production build بدون warning مربوط به CommonJS اجرا شد
- [ ] در صورت نیاز تجاری به برابری کامل با Delphi: طراحی قرارداد Backend معتبر برای schemaهای اشتراکی/پیش‌فرض مدیر، ویرایش caption، separator، search type، mandatory و import/export فایل؛ نسخه فعلی تنظیمات شخصی هر کاربر را در همان مرورگر نگه می‌دارد و هیچ قرارداد دیتابیس حدس‌زده نشده است

## افزونه برنامه‌ریزی داشبورد مدیریتی و Self-Service BI

تحلیل معماری، قابلیت‌ها، مدل امنیت، Semantic Layer، Vertical Slice و Roadmap مرحله‌ای در [MANAGEMENT-BI-ROADMAP.md](./MANAGEMENT-BI-ROADMAP.md) ثبت شد.

- [x] ممیزی read-only زیرساخت فعلی گزارش، Dashboard، RBAC و metadata دیتابیس توسعه `MaliKowsar99`
- [x] تعیین مرز محصول: Dashboard شخصی با Widgetهای governed؛ بدون SQL/DAX/Procedure دلخواه کاربر
- [x] تعریف معماری هدف، مدل داده پیشنهادی، API، Permission و تست‌های پذیرش
- [x] انتخاب `Sales Overview` به‌عنوان Vertical Slice پیشنهادی
- [x] Phase 0: Scope/RBAC، تعریف KPI فروش، reconciliation و Spike فنی Layout/Chart تکمیل شد
- [x] Phase 1: Foundation و Vertical Slice فروش پیاده‌سازی، migrate، test و smoke شد
- [x] Phase 2: Catalog و Widget Platform؛ lifecycle مدیریت‌شده Dataset/Field/Metric، versioning، config migration، هفت Widget type، فیلتر/مقایسه، freshness/data-quality و contract/smoke test تکمیل شد؛ شواهد در [MANAGEMENT-BI-CHECKPOINT.md](./MANAGEMENT-BI-CHECKPOINT.md)
- [x] Phase 3: پنج Management Pack برای Sales، Cash، Inventory، Purchase و Operations به‌همراه BI Home، Favorites، Recent و search؛ migration واقعی، تست قرارداد و smoke authorization/query تکمیل شد؛ شواهد در [MANAGEMENT-BI-CHECKPOINT.md](./MANAGEMENT-BI-CHECKPOINT.md)
- [x] Phase 4: Template سازمانی، share به User/Role با View/Copy/Edit، publish/version rollback، bookmark filter/sort/drill، default شخصی/Role و audit تکمیل شد؛ migration واقعی، backup/clone/idempotency، `266/266` تست Backend، `197/197` تست Frontend و smoke کامل lifecycle موفق بود؛ شواهد در [MANAGEMENT-BI-CHECKPOINT.md](./MANAGEMENT-BI-CHECKPOINT.md)
- [x] Phase 5: cache کاملاً scope/version-aware، async Query/Export، health telemetry، Snapshot/Alert زمان‌بندی‌شده با permission مستقل و retention cleanup تکمیل شد؛ review واقعی Query audit به‌علت نمونه کمتر از ۱۰۰، تغییر حدسی روی indexهای تجاری را رد کرد. migration واقعی با backup/clone/idempotency، `273/273` تست Backend، `202/202` تست Frontend و smoke کامل عملیات موفق بود؛ شواهد در [MANAGEMENT-BI-CHECKPOINT.md](./MANAGEMENT-BI-CHECKPOINT.md)
- [x] Phase 6: anomaly، forecast/backtest، cross-filter، guided analysis و NLQ governed تکمیل شد؛ شواهد در [MANAGEMENT-BI-CHECKPOINT.md](./MANAGEMENT-BI-CHECKPOINT.md)
- [x] اصلاح فارسی Catalog: migration مستقل از encoding روی clone و `MaliKowsar99` به‌صورت idempotent اجرا شد؛ اسکن ۱۰۶ ستون متنی صفر mojibake، API Catalog پنج Dataset با فارسی canonical و تست‌های رگرسیون migration را تأیید کردند. [راهنمای استفاده](./MANAGEMENT-BI-USER-GUIDE.md)
- [x] Self-service Visual Builder و تنظیم مشترک جدول: پرسش فارسی یا انتخاب Dataset/Metric به چیدمان governed با پیش‌نمایش X/Y تبدیل می‌شود؛ Table/Stacked Bar از چند Metric پشتیبانی می‌کنند و یک Modal مشترک تمام ستون‌های `GridSchema` را برای Caption، Width، Visibility و Order مدیریت می‌کند. تنظیم User/Grid بدون ذخیره row data بازیابی می‌شود؛ `216/216` تست Frontend و `npm run verify` کامل موفق است. [راهنمای استفاده](./MANAGEMENT-BI-USER-GUIDE.md)
- [x] Pilot governance: ثبت نسخه‌دار و tenant-safe پوشش persona، sign-off KPI/SLA و تصمیم نهایی با Permission مستقل `BI_PILOT_REVIEW`، optimistic concurrency، audit metadata-only و Gate واقعی `RolloutReady` تکمیل شد. Migration پس از backup/clone/idempotency روی `MaliKowsar99` اجرا شد؛ smoke API و `289/289` تست Backend، `218/218` تست Frontend و verify کامل موفق بودند.
- [x] انتخاب شرکت‌کنندگان Pilot بدون hardcode: فرم Operations گزینه‌ها را فقط از کاربران فعال Kowsar و عضویت واقعی Department در Central استخراج‌شده از JWT می‌گیرد؛ personaهای `Manager` و `ReportViewer` به نسخه Dataset متصل، با `RowVersion` محافظت و metadata-only ممیزی می‌شوند. Browser اجازه تعیین Central یا Actor ندارد و انتخاب persona هیچ Role امنیتی اعطا نمی‌کند. Migration `20261006_ManagementBI_PilotParticipants.sql` پس از backup/clone/idempotency روی `MaliKowsar99` اجرا، API smoke شامل `401/403/400/409` موفق و verify نهایی با `294/294` تست Backend و `220/220` تست Frontend پاس شد.
- [x] Preflight عملیاتی تکرارپذیر: `scripts/pilot-preflight.ps1` فقط با `GET` و Central ورودی، Backend واقعی را روی پورت موقت اجرا و topology، enrollment، Role، telemetry، freshness و blockerها را بدون چاپ هویت کاربران بررسی می‌کند. اجرای ۲۰۲۶-۱۰-۰۴ روی `CentralRef=1843` گزینه=`1`، Department=`1`، انتخاب=`0`، `REPORT_VIEWER=false` و ۱۲ Query تاریخی را آشکار کرد؛ قرارداد اولیه آن‌ها را `12/100` و stale=`12` نشان می‌داد که در checkpoint مرز شواهد ۲۰۲۶-۱۰-۰۶ اصلاح شد. پورت `60006` دست‌نخورده ماند و `295/295` تست Backend آن checkpoint موفق بود.
- [x] Setup Assistant مبتنی بر شواهد در Operations: شش Gate مربوط به topology، انتخاب persona، `REPORT_VIEWER`، freshness، مصرف واقعی و sign-off فقط از `BiPilotReadiness` نمایش داده می‌شوند. لینک RBAC فقط برای Admin و به Route تأییدشده `/rbac/centralrole` است و برای provision کاربر/Department هیچ Route حدسی ساخته نشد. تست Frontend به `221/221` رسید و `npm run verify` کامل، Bundle/PWA audit و UI acceptance برابر `4/4` موفق شدند.
- [x] مدیریت واقعی Roleهای Central: صفحه read-only قدیمی و لینک نامرتبط «جدید» با editor مبتنی بر Roleهای server-provided جایگزین شد. API فقط برای `ADMIN` و Central استخراج‌شده از JWT است، `ADMIN` را قفل می‌کند، Role نامعتبر را رد می‌کند و با version hash از overwrite هم‌زمان جلوگیری می‌کند. Smoke فقط‌خواندنی روی `CentralRef=1843` تعداد ۱۰ Role، وجود `REPORT_VIEWER` در Catalog، قفل بودن `ADMIN` و version معتبر را تأیید کرد؛ هیچ Role واقعی تغییر نکرد. verify با `297/297` تست Backend و `224/224` تست Frontend موفق شد.
- [x] تعیین مرز provision کاربر Pilot: schema و تمام moduleهای SQL واقعی `MaliKowsar99` و repositoryهای موجود به‌صورت read-only بررسی شدند. هیچ Procedure معتبر Web برای ساخت `Users`/`DepartmentUser` وجود ندارد؛ `spAux_DoAfterUpdate_16` فقط bootstrap اولیه است و metadata فرم Legacy `TDepartmentUser` بدون سورس اجرایی معتبر باقی مانده است. برای جلوگیری از حساب یا عضویت حدسی، BI هیچ write مستقیمی به این جدول‌ها اضافه نکرد.
- [x] مرز شواهد کنترل‌شده Pilot: readiness فقط Queryهای `DefinitionVersion` جاری و بعد از ثبت کامل `Manager + ReportViewer` در دو Department را برای volume/latency/failure/freshness می‌شمارد. Queryهای قدیمی در `PrePilotEligibleQueries` حفظ می‌شوند و حذف یا جعل نمی‌شوند. smoke فقط‌خواندنی ۲۰۲۶-۱۰-۰۶ روی `CentralRef=1843` پیشرفت صحیح `0/100`، سابقه قبل از Pilot=`12`، `PilotEvidenceFrom=null` و stale کنترل‌شده=`0` را تأیید کرد؛ Release build بدون warning/error، تست Backend برابر `298/298` و verify Frontend برابر `224/224` موفق شد.
- [ ] Pilot کنترل‌شده: ابزار readiness، انتخاب نسخه‌دار شرکت‌کنندگان و [Runbook](./MANAGEMENT-BI-PILOT.md) آماده است. preflight فقط‌خواندنی در ۲۰۲۶-۱۰-۰۶ روی `CentralRef=1843` گزینه=`1`، Department=`1`، انتخاب=`0`، `REPORT_VIEWER=false`، پیشرفت کنترل‌شده=`0/100`، سابقه قبل از Pilot=`12` و `RolloutReady=false` را گزارش کرد. بازاعتبارسنجی نهایی با `298/298` تست Backend و `npm run verify` شامل `224/224` تست Frontend، هر دو build، bundle/PWA audit و UI acceptance برابر `4/4` موفق شد. هیچ Central واجد دو کاربر واقعی در دو Department نیست؛ ابتدا باید Central منتخب از مسیر عملیاتی معتبر provision، Role فعال، دو شرکت‌کننده واقعی در UI انتخاب و منبع Sales تازه شود، سپس Queryهای جدید بعد از `PilotEvidenceFrom` و sign-off نسخه‌دار مالک تجاری تکمیل شود. داده ساختگی، Query مصنوعی یا SQL حدسی برای عبور از Gate مجاز نیست

نکته امنیتی تأییدشده در ۲۰۲۶-۰۹-۲۸: `XUserReports` در دیتابیس توسعه فعلی صفر رکورد دارد و `spWeb_GetReports` در این حالت Catalog را بدون محدودیت گزارش-به-کاربر برمی‌گرداند. بنابراین احراز هویت موجود به‌تنهایی برای BI کافی نیست و enforce کردن Domain permission و server-derived data scope، پیش‌نیاز Pilot است.

## تصمیم‌های مورد نیاز از مالک محصول

- پنج جریان حیاتی که اختلال در آن‌ها بیشترین زیان را دارد کدام‌اند؟
- محیط اصلی هدف کدام Profile است؟
- اولویت تجاری فعلی بین Accounting، Automation، Online Menu و Santral چیست؟
- Backend و قراردادهای API در همین مخزن مدیریت می‌شوند یا مخزن جدا دارند؟
