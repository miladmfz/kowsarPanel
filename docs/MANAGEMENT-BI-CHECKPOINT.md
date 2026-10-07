# Checkpoint پیاده‌سازی Kowsar BI Workspace

تاریخ آخرین به‌روزرسانی: ۲۰۲۶-۱۰-۰۶
وضعیت: `Phase 0` تا `Phase 6 complete` برای Workspace، Management Packs، Governance/Sharing، Operations و Advanced Analytics

راهنمای عملی کاربران و مدیران سامانه: [MANAGEMENT-BI-USER-GUIDE.md](./MANAGEMENT-BI-USER-GUIDE.md)

## خروجی قابل استفاده

- BI Home روی `/accounting/gozareshat/bi` و Workspace روی `/accounting/gozareshat/bi/workspace`
- پنج Semantic Dataset: `sales.summary`, `cash.flow`, `inventory.flow`, `purchase.summary`, `operations.quotation`
- پنج Pack تصمیم‌محور: Sales Executive، Cash/Receivables، Inventory، Purchase/Vendor و Operations
- نصب idempotent Pack به‌صورت Dashboard خصوصی، Favorites، Recent و search روی عنوان/Domain/شرح
- Widgetهای مجاز: `kpi`, `trend`, `table`, `stackedBar`, `donut`, `pivot`, `summaryList`
- Dashboard شخصی با ساخت، ویرایش، کپی، حذف نرم، پیش‌فرض شخصی و optimistic concurrency
- چیدمان `GridStack` با drag/resize، شبکه ۱۲ ستونی و breakpointهای ۶ و ۱ ستونی
- ذخیره مستقل layout و filterهای تاریخ، grain و Department برای هر `OwnerSubject`
- KPIهای Published: فروش خالص/ناخالص، مبلغ برگشت، تعداد فاکتور، تعداد خالص کالا، میانگین مبلغ فاکتور، نرخ برگشت و تازگی داده
- global filter تاریخ، روز/ماه و Department مجاز
- filter مستقل هر Widget، مقایسه دوره قبل/سال قبل/custom و فرمت number/currency/compact/percent
- Route مدیریتی `/accounting/gozareshat/bi/catalog` برای lifecycle و version history با مجوز `BI_CATALOG_MANAGE`
- نمایش source metadata، data-through، freshness SLA و warningهای کیفیت داده
- drill-through به Catalog گزارش‌های عملیاتی موجود
- نمایش loading، empty، error، warning، truncation، scope، latency و definition version
- Template سازمانی منتشرشده با `Copy to my dashboards` و حفظ `SourceDashboardRef`
- اشتراک dashboard منتشرشده به User/Role با سطح `View`، `Copy` یا `Edit`
- snapshot نسخه‌دار و immutable در هر publish و rollback به نسخه قبلی با ایجاد نسخه جدید
- bookmark شخصی شامل filter، sort و drill state و default مستقل برای User/Role/شخص
- صفحه audit مجزای BI برای مشاهده، share، publish، rollback و تغییر تعریف بدون ذخیره row data یا filter خام
- Analytics Lab روی `/accounting/gozareshat/bi/analytics` با anomaly توضیح‌پذیر، forecast دارای backtest/interval/seasonality، guided analysis و cross-filter واحد/دوره
- NLQ محدود به glossary، Dataset و Metric منتشرشده با تأیید اجباری کاربر؛ بدون تولید یا پذیرش SQL آزاد
- cross-filter دوره‌ای سراسری روی Widgetهای Workspace و re-query سمت Server برای Department drill

## تصمیم معماری

مرورگر فقط `DatasetKey`، تاریخ، grain و Department انتخاب‌شده را می‌فرستد. Backend فقط handlerهای ثابت `SalesSummaryV1`, `CashFlowV1`, `InventoryFlowV1`, `PurchaseSummaryV1` و `QuotationOperationsV1` را اجرا می‌کند؛ SQL، نام Table/View/Procedure و `XCondition` از Browser پذیرفته نمی‌شود.

Scope واحد سازمانی از claimهای JWT و `DepartmentUser` حل می‌شود. `ADMIN` تمام Departmentهای ثبت‌شده را می‌بیند؛ سایر کاربران فقط تقاطع درخواست با Departmentهای server-derived خود را می‌بینند. اجرای Dataset هم‌زمان به `BI_DASHBOARD_VIEW` و permission حوزه (`REPORT_SALES_VIEW`, `REPORT_CASH_VIEW` یا `REPORT_WAREHOUSE_VIEW`) نیاز دارد.

برای حفظ backward compatibility، endpointهای Legacy گزارش در این فاز تغییر نکردند. Domain permission و Department scope در BI Adapter مستقل enforce شده است.

در Phase 1 cache فعال نشده و `cacheHit=false` است؛ این تصمیم جلوی اشتراک تصادفی داده بین Scopeها را می‌گیرد. cache آینده باید کلید شامل subject، scope، dataset version و filter داشته باشد.

Trend با SVG داخلی پیاده‌سازی شد و dependency قدیمی ApexCharts مبنای BI نیست. Layout از `gridstack@14.0.0` با مجوز MIT استفاده می‌کند. GridStack فقط در lazy chunk صفحه BI بارگذاری می‌شود.

Config هر Widget دارای `ConfigVersion` و `schemaVersion` است. Client نسخه v1 را به مدل v2 با defaultهای امن migrate می‌کند و مختصات layout را تغییر نمی‌دهد؛ نسخه آینده یا Metric/Widget ناشناخته در Backend رد می‌شود. Handler و Fieldهای اجرایی در `BiSemanticContracts` allow-list شده‌اند و UI مدیریتی امکان ورود SQL یا تغییر Handler ندارد.

تغییر Metric همیشه `DefinitionVersion` را افزایش می‌دهد و snapshot آن در `BiMetricVersion` ثبت می‌شود. تغییر Field وابسته بدون تأیید صریح با `409 DEPENDENCY_WARNING` متوقف می‌شود. dependency analyzer فقط Widgetهای داشبورد فعال را لحاظ می‌کند و dashboardهای soft-deleted وابستگی کاذب ایجاد نمی‌کنند.

## منبع و تعریف اعداد

منبع authoritative با تعریف `dbo.spPeriodicSell` و جدول‌های واقعی تطبیق داده شد:

- فروش: `Factor` + `FactorSummary`
- برگشت: `ReturnFactor` + `ReturnFactorSummary`
- نوع فروش مجاز: `Factor.isShopFactor IN (0,1,4,5,6)`
- فروش خالص: `SUM(FactorSummary.SumPrice) - SUM(ReturnFactorSummary.SumPrice)`
- تعداد فاکتور: `COUNT(DISTINCT Factor.FactorCode)`
- میانگین مبلغ: فروش خالص تقسیم بر تعداد فاکتور، با guard مخرج صفر
- نرخ برگشت: مبلغ برگشت تقسیم بر فروش ناخالص، ضربدر صد، با guard مخرج صفر

Reconciliation روی Department `1`:

| بازه | خروجی authoritative | خروجی BI | نتیجه |
| --- | ---: | ---: | --- |
| `1403/02` | Amount=`758`، Net Sales=`2,300,000` | Quantity=`758`، Net Sales=`2,300,000` | برابر |
| `1403/03` | Amount=`549`، Net Sales=`4,000,000` | Quantity=`549`، Net Sales=`4,000,000` | برابر |

داده محیط توسعه بعد از `1403/03/20` sparse است؛ این محدودیت داده است، نه خطای Query.

منابع Phase 3 نیز پیش از پیاده‌سازی از schema واقعی استخراج شدند:

- Cash: `vwCashReceive` و `vwCashPayment`؛ مانده Receivables از `vwCustomerMandeh` وارد Pack نشد چون Department/date قابل اتکا ندارد.
- Inventory: `GoodReceipt`/`GoodReceiptSummary` و `GoodIssue`/`GoodIssueSummary`.
- Purchase: `PurchaseInvoice`/`PurchaseSummary` و `ReturnPurchase`/`ReturnPurchaseSummary`.
- Operations: `PreFactor`/`PreFactorSummary` و رابطه `Factor.PreFactorRef`.

پروفایل کیفیت داده توسعه صادقانه در پاسخ API منعکس می‌شود: Cash و PreFactor فعلاً بدون داده‌اند، Purchase دو header بدون summary و Inventory یک receipt بدون summary دارد. بنابراین Packها برای بازه جاری به‌جای صفر گمراه‌کننده، warningهای `NoData` یا `BehindSelectedRange` ارائه می‌کنند.

## ماتریس امنیت Pilot

| Role | BI Permission | Domain Permission | Department Scope |
| --- | --- | --- | --- |
| `ADMIN` | هر ۷ مجوز BI | bypass مدیریتی موجود | تمام Departmentها |
| `REPORT_VIEWER` | `VIEW`, `EDIT_OWN`, `EXPORT` | `REPORT_SALES_VIEW` | فقط `DepartmentUser` کاربر |

Smoke با دو subject مستقل تأیید کرد هر کاربر فقط Dashboardهای خود را می‌بیند. درخواست Department خارج از Scope با `403`، Dataset یا Metric ثبت‌نشده با `400`، درخواست ناشناس با `401` و update با `rowversion` قدیمی با `409` رد شد.

Query aggregate دارای timeout سی ثانیه، cancellation، سقف بازه دو سال و rate limit مستقل ۶۰ درخواست در دقیقه به‌ازای subject است. Audit فقط scope hash، زمان، تعداد ردیف و status را نگه می‌دارد و filter خام یا row data ثبت نمی‌کند.

در Phase 4، دسترسی share جایگزین permission حوزه یا Department scope نیست. هر بازکردن Dashboard و هر Query همچنان permission دامنه را بررسی و Departmentهای ذخیره‌شده را با scope server-derived تقاطع می‌دهد. فقط مالک می‌تواند publish/share/rollback کند؛ dashboard باید پیش از share منتشر شده باشد. Default و Favorite برای هر subject مستقل‌اند و کپی از Template، مالکیت جدید و lineage قابل ممیزی ایجاد می‌کند.

## Migration و بازیابی

Migrationها:

- `webapikits/Database/Migrations/20260928_ManagementBI_P0_P1.sql`
- `webapikits/Database/Migrations/20260929_ManagementBI_P2_CatalogWidgetPlatform.sql`
- `webapikits/Database/Migrations/20260930_ManagementBI_P3_ManagementPacks.sql`
- `webapikits/Database/Migrations/20261001_ManagementBI_P4_SharingTemplatesBookmarks.sql`
- `webapikits/Database/Migrations/20261002_ManagementBI_P5_PerformanceOperations.sql`
- `webapikits/Database/Migrations/20261003_ManagementBI_P6_AdvancedAnalytics.sql`
- `webapikits/Database/Migrations/20261004_ManagementBI_PersianEncodingRepair.sql`

Target اجراشده: `DESKTOP-O538D18\SQL2019 / MaliKowsar99` از `Kowsar_Connection`.

Backup قبل از تغییر:

`MaliKowsar99_Pre_ManagementBI_20260928_110155.bak`

`MaliKowsar99_Pre_ManagementBI_P2_20260929_142227.bak`

`MaliKowsar99_PreBIPhase3_20260929_01.bak`

`MaliKowsar99_BI_Persian_20261001_0130.bak`

Backupهای هر فاز با `COPY_ONLY`, `CHECKSUM`, `COMPRESSION` گرفته و با `RESTORE VERIFYONLY` معتبر اعلام شدند. Migration Phase 3 ابتدا روی clone بازیابی‌شده `MaliKowsar99_BIP3_DryRun` دو بار اجرا شد؛ اجرای دوم insert تکراری نداشت. سپس همان migration روی target واقعی اجرا شد. clone موقت پس از verification حذف و نبود فایل‌های MDF/LDF آن تأیید شد؛ backup معتبر حفظ شده است. خروجی Phase 3 شامل ۴ Dataset جدید، ۲۴ Metric جدید و ستون‌های `IsFavorite`, `LastViewedAt`, `PackKey` است؛ در مجموع Catalog پنج Dataset Published دارد.

برای Phase 4 نیز Full Backup تازه با `CHECKSUM` گرفته و با `RESTORE VERIFYONLY` تأیید شد. Migration ابتدا دو بار روی clone بازیابی‌شده و همراه integration test تراکنشی اجرا شد، سپس دو بار روی target واقعی اجرا و idempotency تأیید شد. post-check نهایی روی `MaliKowsar99` وجود هر ۶ جدول و هر ۷ ستون Phase 4 را تأیید کرد؛ clone دقیقاً پس از پایان smoke حذف و backup معتبر حفظ شد.

برای Phase 5 نیز schema واقعی و Query audit پیش از DDL خوانده شد. baseline شامل ۱۲ Query موفق با میانگین `103.75ms` و بیشینه `336ms` بود؛ چون نمونه کمتر از ۱۰۰ است، تغییر حدسی روی index یا aggregate جدول‌های عملیاتی انجام نشد. Full Backup تازه با `COPY_ONLY`, `CHECKSUM`, `COMPRESSION` و `RESTORE VERIFYONLY` تأیید شد. Migration دو بار روی clone بازیابی‌شده اجرا و Job/Schedule/Snapshot داخل transaction آزموده و rollback شد؛ سپس دو بار روی `MaliKowsar99` اجرا شد. بازبینی least-privilege نیز با backup و clone تازه تکرار شد. post-check وجود ۵ جدول، ۴ ستون audit، ۲ Permission و ۳ Role grant فعال را تأیید کرد؛ `REPORT_VIEWER` مجوز schedule ندارد، clone حذف و backup معتبر حفظ شد.

برای Phase 6، schema و قرارداد واقعی `BiQueryAudit` پیش از DDL بررسی شد. backup `MaliKowsar99_BI_P6_20260930.bak` با `COPY_ONLY`, `CHECKSUM`, `COMPRESSION` گرفته و `RESTORE VERIFYONLY` شد. migration `20261003_ManagementBI_P6_AdvancedAnalytics.sql` دو بار روی clone و دو بار روی `MaliKowsar99` اجرا شد؛ constraint `CK_BiQueryAudit_QueryMode` روی target trusted/enabled و شامل `Analytics` است. insert تراکنشی `Analytics` روی clone موفق و rollback شد. smoke نهایی روی clone بازیابی‌شده اجرا، سپس clone دقیق حذف و backup معتبر حفظ شد. target اصلی نیز یک رخداد واقعی Analytics metadata-only دارد.

در ۲۰۲۶-۱۰-۰۱ خرابی نمایش فارسی Catalog ریشه‌یابی شد. متن‌های Source و Template سالم بودند و مقدارهای ذخیره‌شده در `BiDataset`, `BiDatasetField`, `BiMetric`, `BiMetricVersion` و عنوان Permissionهای BI با UTF-8 اشتباه ذخیره شده بودند. migration محافظت‌شده `20261004_ManagementBI_PersianEncodingRepair.sql` با payload کاملاً ASCII و Unicode escape ساخته شد تا اجرای آن به encoding فایل یا ابزار SQL وابسته نباشد. پس از Full Backup دارای `COPY_ONLY`, `CHECKSUM`, `COMPRESSION` و `RESTORE VERIFYONLY`، migration دو بار روی clone و دو بار روی `MaliKowsar99` اجرا شد. ۵ Dataset، ۳۴ Field، ۳۲ Metric و ۹ Permission با mapping canonical پوشش داده شدند؛ فقط مقدارهای دارای marker خرابی تغییر کردند. اسکن نهایی ۱۰۶ ستون متنی تمام جدول‌های `Bi*` و `Permission` صفر مورد باقی‌مانده گزارش کرد. clone و فایل‌های MDF/LDF آن حذف و backup معتبر حفظ شد.

در ۲۰۲۶-۱۰-۰۳ Pilot governance تکمیل شد. Migration `20261005_ManagementBI_PilotGovernance.sql` دو جدول `BiPilotReview` و `BiPilotReviewAudit` و Permission مستقل `BI_PILOT_REVIEW` را اضافه کرد؛ Permission فقط به `ADMIN` grant شد. بازبینی به Central/Dataset/DefinitionVersion متصل است، Actor از JWT گرفته می‌شود، توضیحات محدودند، تغییر هم‌زمان با `RowVersion` رد می‌شود و `ApproveWithActions` یا Gate فنی ناقص نمی‌تواند `RolloutReady` را فعال کند. Full Backup `MaliKowsar99_BI_Pilot_20261003.bak` با `COPY_ONLY`, `CHECKSUM`, `COMPRESSION` و `RESTORE VERIFYONLY` تأیید شد؛ Migration دو بار روی clone و دو بار روی `MaliKowsar99` اجرا شد، تمام constraintها trusted ماندند، smoke تراکنشی rollback و clone دقیق حذف شد.

در ۲۰۲۶-۱۰-۰۴ انتخاب نسخه‌دار شرکت‌کنندگان Pilot اضافه شد. Migration `20261006_ManagementBI_PilotParticipants.sql` جدول‌های `BiPilotEnrollment`, `BiPilotParticipant` و `BiPilotEnrollmentAudit` را با FKهای واقعی `Users` و `Department`، constraintهای persona و `RowVersion` ایجاد کرد. Full Backup `MaliKowsar99_BI_PilotParticipants_20261004.bak` با `COPY_ONLY`, `CHECKSUM`, `COMPRESSION` گرفته و با `RESTORE VERIFYONLY` تأیید شد. Migration دو بار روی clone بازیابی‌شده و دو بار روی target واقعی اجرا شد؛ تمام FK و Check constraintها trusted/enabled هستند و target با صفر enrollment اولیه باقی ماند. گزینه‌ها فقط از کاربران فعال Kowsar همان Central مشتق‌شده از JWT می‌آیند؛ Browser Central یا Actor ارسال نمی‌کند و ذخیره با بازاعتبارسنجی membership، یکتایی persona، hash امن پیکربندی و audit metadata-only انجام می‌شود. پس از smoke، clone دقیق `MaliKowsar99_BI_PilotParticipants_Verify_20261004` و فایل‌های آن حذف شدند و backup معتبر حفظ شد.

Rollback با SQL حدسی انجام نشود. در صورت rollback کامل، backup معتبر restore شود؛ در rollback application، نسخه قبلی Backend/Frontend deploy شود و جدول‌های BI تا تعیین retention حذف نشوند.

## شواهد پذیرش

- Backend Release build: موفق، صفر warning و صفر error
- Backend tests: `298/298` موفق؛ شامل قرارداد Permission، invariant بازبینی Pilot، قرارداد Migration/انتخاب شرکت‌کنندگان، مرز نسخه/زمان شواهد، read-only بودن preflight و امنیت مدیریت Roleهای Central
- Frontend typecheck: موفق
- Frontend tests: `224/224` موفق در Chrome Headless؛ شامل Visual Builder، Modal مشترک `GridSchema`، فرم بازبینی، انتخاب نسخه‌دار شرکت‌کنندگان، Setup Assistant، مدیریت Roleهای Central و نمایش فارسی شمارنده سابقه پیش از Pilot
- Angular Development build: موفق
- Angular Production build: موفق
- Security audit: `1406` فایل، موفق
- Runtime config audit: چهار profile موفق با warningهای مستند HTTP خصوصی on-premise
- Dark theme audit: صفر failure زیر `3:1`
- API smoke Phase 2 روی instance موقت `60008`: health=`200`، anonymous=`401`، scope غیرمجاز=`403`، query واقعی سه period/segment و comparison حاضر، source/freshness حاضر
- API smoke Phase 3 روی instance موقت `60008`: catalog=`5` Dataset، packs=`5`، query هر پنج Handler موفق؛ Sales=`Current`، Cash/Operations=`NoData` و Inventory/Purchase=`BehindSelectedRange`
- نصب Cash Pack، favorite، recent و حذف نرم همگی موفق؛ کاربر محدود Sales-only روی Sales پاسخ `200` و روی Cash پاسخ `403` گرفت
- lifecycle smoke: config v1 و v2 بازخوانی شدند، Metric published از version 1 به 2 رفت، stale rowversion و تغییر Field وابسته هر دو `409` دادند و layout قبل/بعد نسخه‌گذاری برابر ماند
- داده‌های disposable smoke پاک و instance موقت متوقف شد؛ instanceهای موجود `60006/60007` متوقف نشدند
- query latency مشاهده‌شده: `17ms`, `67ms`, `74ms`؛ بسیار کمتر از هدف اولیه دو ثانیه
- CRUD/copy/filter restore/ownership/concurrency: موفق
- Render test در Chrome Headless: شش Widget، عنوان فارسی و scope داده حاضر
- Production lazy chunk صفحه BI: `208.40kB` raw و `44.92kB` estimated transfer؛ کل initial bundle برابر `769.07kB` و زیر سقف audit برابر `850kB`
- UI acceptance: هر چهار viewport در desktop/mobile و light/dark با RTL، keyboard و contrast موفق
- API smoke Phase 4 روی instance موقت `60007`: health live/ready=`200`، anonymous=`401`، publish version=`1`، Role share=`Copy`، User share=`Edit`، bookmark=`1`، rollback version=`2`، copy lineage صحیح، favorite/default شخصی فعال و `19` رخداد audit برای lifecycle ثبت شد
- API smoke Phase 5 روی instance موقت `60007`: health live/ready=`200`، anonymous operations=`401`، Catalog=`5` Dataset، cache miss سپس hit، health query موفق با P95 واقعی، async Query/Export هر دو `Succeeded`، نتیجه JSON و CSV هر دو `200`، Snapshot و Alert هر دو ساخته شدند و retention cleanup موفق بود
- API smoke Phase 6 روی instance موقت `60007`: live/ready=`200`، anonymous analytics=`401`، تحلیل واقعی=`200` با ۲۹ observation، `SeasonalNaive`، backtest و سه نقطه forecast؛ نبود permission دامنه=`403`، Metric خارج allow-list=`400`، NLQ نیازمند confirmation و SQL-shaped input رد شد
- API smoke اصلاح فارسی روی instance موقت `60008`: Catalog=`200`، پنج Dataset و عنوان فارسی canonical برای `sales.summary`؛ هیچ marker خرابی در پاسخ نبود. تغییر Kestrel override در smoke script باعث شد پورت موقت واقعاً مستقل از instanceهای `60006/60007` اجرا و پس از آزمون متوقف شود
- Pilot readiness smoke روی instance موقت `60007`: endpoint تجمیعی=`200`، نبود مجوز Operations=`403`، metric منتشرشده `sales.net` حاضر، `RolloutReady=false` و baseline scope واقعی `0/100`؛ ۱۴ رخداد synthetic و ۶ رخداد automated از پیشرفت حذف شدند
- Pilot configuration preflight روی instance موقت `60007`: شمارش tenant-safe کاربر=`0`، Department=`0`، `HasReportViewerRole=false` و `ConfigurationReady=false`؛ ممیزی read-only کل topology نیز نشان داد هیچ Central فعالی شرط دو کاربر در دو Department را ندارد. پورت `60007` پس از smoke بسته و سرویس موجود `60006` با PID `4268` دست‌نخورده ماند
- Pilot governance smoke روی clone و instance موقت `60007`: anonymous=`401`، نبود `BI_PILOT_REVIEW`=`403`، invariant نامعتبر=`400`، create/update=`200`، stale `RowVersion`=`409`، دو audit ثبت و cleanup شد؛ `TechnicalGate=false` با وجود تصمیم `Approve` همچنان `RolloutReady=false` ماند. clone حذف، پورت `60007` بسته و سرویس `60006` با PID `4268` دست‌نخورده ماند
- Pilot participant smoke روی clone و instance موقت `60007`: live=`200`، anonymous=`401`، نبود Permission=`403`، دریافت گزینه‌ها=`200`، create/update=`200`، candidate نامعتبر=`400`، stale `RowVersion`=`409`، persona گزارش‌گیر در readiness حاضر و `ConfigurationReady=false` ماند؛ دو audit فقط metadata ثبت کردند و داده smoke از clone پاک شد. سرویس موجود `60006` با PID `4268` دست‌نخورده ماند
- Pilot preflight فقط‌خواندنی در ۲۰۲۶-۱۰-۰۴ روی target واقعی و instance موقت `60007`: live=`200`، anonymous=`401`، گزینه واقعی=`1`، Department=`1`، participant انتخاب‌شده=`0` و `HasReportViewerRole=false`. در قرارداد قدیمی ۱۲ Query قبل از enrollment به‌اشتباه به‌صورت `12/100` و stale=`12` وارد Gate می‌شدند؛ این مشاهده علت اصلاح مرز شواهد شد. ابزار هیچ endpoint نوشتنی یا SQL اجرا نکرد، هویت کاربران را چاپ نکرد، پورت موقت را بست و سرویس `60006` را متوقف نکرد
- اصلاح مرز شواهد در ۲۰۲۶-۱۰-۰۶ بدون migration یا تغییر داده انجام شد: readiness اکنون فقط نسخه جاری و Queryهای بعد از enrollment کامل دو persona را می‌شمارد. preflight واقعی `MaliKowsar99 / CentralRef=1843` پاسخ live=`200`، anonymous=`401`، نسخه Dataset=`2`، گزینه/کاربر/Department=`1/1/1`، انتخاب=`0/0`، `EligibleQueries=0/100`، `PrePilotEligibleQueries=12`، `PilotEvidenceFrom=null`، stale کنترل‌شده=`0` و `ConfigurationReady/RolloutReady=false` داد. listener موقت `60007` بسته شد و instance موجود `60006` دست‌نخورده ماند
- بازاعتبارسنجی نهایی ۲۰۲۶-۱۰-۰۶: Backend Release build با صفر warning/error و `297/297` تست موفق شد؛ preflight فقط‌خواندنی همان وضعیت واقعی `0/100` و سابقه پیش از Pilot=`12` را دوباره تأیید کرد. شمارنده سابقه در Operations برای هماهنگی کامل RTL با رقم‌های فارسی رندر شد و `npm run verify` شامل `224/224` تست، Development/Production build، bundle audit، PWA audit و UI acceptance برابر `4/4` با موفقیت پایان یافت. listener موقت `60007` بسته و سرویس موجود `60006` دست‌نخورده باقی ماند
- Setup Assistant صفحه Operations در ۲۰۲۶-۱۰-۰۴ شش Gate را مستقیماً از readiness نمایش می‌دهد؛ Route مدیریت Role فقط برای Admin و به `/rbac/centralrole` متصل است، هیچ شناسه یا Route مربوط به User/Department hardcode نشده و تست اختصاصی `8/8` و verify کامل Frontend با `221/221` تست موفق بود
- مدیریت Roleهای Central در ۲۰۲۶-۱۰-۰۴ از حالت read-only خارج شد: `GET/PUT /api/Auth/v2/central-roles/current` فقط برای `ADMIN`، Central فقط از JWT، Roleها فقط از Catalog فعال Database، `ADMIN` قفل و write با version hash محافظت می‌شود. smoke فقط‌خواندنی روی `MaliKowsar99` و پورت موقت `60007` پاسخ `200`، Catalog برابر ۱۰ Role، `ADMIN locked=true` و version معتبر را تأیید کرد؛ anonymous=`401` و هیچ Role واقعی تغییر نکرد. پورت موقت بسته و سرویس `60006` دست‌نخورده ماند
- ممیزی read-only provisioning در ۲۰۲۶-۱۰-۰۴ schema، keyها و moduleهای SQL مربوط به `Users`/`DepartmentUser` را بررسی کرد: کلید unique عضویت `(UserRef,DepartmentRef)` موجود است، اما Procedure عملیاتی معتبر برای ساخت/عضویت کاربر پیدا نشد. `spAux_DoAfterUpdate_16` صرفاً bootstrap دیتابیس خالی و `TDepartmentUser` فقط metadata محصول Legacy است؛ source معتبر فرم در repositoryهای موجود پیدا نشد. بنابراین هیچ SQL یا endpoint حدسی برای ساخت User اضافه یا اجرا نشد
- ممیزی read-only واقعی در ۲۰۲۶-۱۰-۰۳ روی `MaliKowsar99`: از ۲۵ عضویت Kowsar، ۲۰ مورد فعال بودند، اما هیچ Central دو کاربر در دو Department نداشت. `CentralRef=1843` دارای ۱۲ Query موفق تاریخی از یک Actor و دو Scope بود؛ failure صفر، میانگین `254.50ms`، P95 برابر `1224ms` و بیشینه `1396ms` و هر ۱۲ پاسخ `BehindSelectedRange` بودند. چون این رخدادها پیش از enrollment کامل اجرا شده‌اند، اکنون در `PrePilotEligibleQueries` نگهداری و از پیشرفت کنترل‌شده حذف می‌شوند. این Central `REPORT_VIEWER` و review نسخه ۲ ندارد و `ConfigurationReady`/`RolloutReady` همچنان false است
- audit Phase 6 فقط metadata استاندارد با `QueryMode=Analytics` ثبت کرد و هیچ ستون prompt/SQL/result/payload ندارد
- artifactهای disposable Phase 5 از مسیر API پاک شدند؛ Job/Schedule/Snapshot/Alert آزمایشی صفر و فقط ۱۰ ردیف telemetry بدون row/filter حساس در `BiQueryAudit` باقی ماند
- cleanup smoke از مسیر API انجام و instance موقت متوقف شد؛ listener پورت `60007` باقی نماند و instance موجود `60006` متوقف نشد
- Theme audit پس از افزودن dark coverage صفحه audit با صفر contrast/coverage failure موفق شد
- Visual Builder پرسش فارسی و انتخاب دستی Dataset/Metric را به چیدمان تک-Dataset کنترل‌شده تبدیل می‌کند؛ مبنای X/Y و تعریف Metric پیش از اجرا و زیر عنوان Widget دیده می‌شود و Table/Stacked Bar فقط Metricهای انتخاب‌شده را نمایش می‌دهند
- Modal سراسری جدول با `GetAllGridSchema` ستون‌های Visible و hidden را می‌خواند، ستون‌های Runtime را حفظ و Caption/Width/Visibility/Order/Sort/Filter را User/Grid-scoped ذخیره می‌کند؛ row data وارد Browser Storage نمی‌شود
- build پروفایل `itmaliIp`: موفق؛ `494` فایل عمومی، `315` source map خصوصی و صفر source map عمومی
- NuGet vulnerability audit: هیچ package آسیب‌پذیری در Backend یا test project گزارش نشد

ابزار مرورگر تعاملی Codex browser surface ارائه نکرد؛ بنابراین تست کلیک دیداری دستی جایگزین نشد. رندر واقعی template و GridStack داخل Chrome Headless و تمام contractها خودکار تأیید شدند.

## موارد باز پیش از rollout عمومی

- تنظیمات جدول در این نسخه User/Grid-scoped و داخل Browser Storage است. همگام‌سازی بین دستگاه‌ها عمداً اضافه نشد، چون Backend هنوز Write contract معتبر برای `GridSchema` و نگاشت server-derived از Identity به `UserCodeRef` ندارد؛ افزودن endpoint مبتنی بر header قابل جعل پذیرفته نیست.
- `npm audit --omit=dev` در dependencyهای موجود Angular 20.3.x تعداد ۹ advisory با شدت high گزارش می‌کند. `gridstack@14.0.0` خودش MIT و بدون dependency است و advisory جدیدی از آن نیامد. ارتقای هماهنگ Angular به patch اصلاح‌شده باید در یک change جدا با verify کامل انجام شود؛ `npm audit fix --force` خودکار اجرا نشد تا dependencyهای کل برنامه بدون review تغییر نکنند.
- Profileهای on-premise فعلی URLهای private HTTP/WSS دارند و runtime audit آن‌ها را warning ثبت می‌کند. برای exposure عمومی باید TLS/reverse proxy معتبر تأمین شود.
- تعریف‌های فنی KPIها با schema و source واقعی تطبیق داده شده‌اند، اما targetها و SLA freshness هنوز به sign-off مالکان Sales/Cash/Warehouse نیاز دارند.
- UI انتخاب شرکت‌کنندگان آماده است، اما Central منتخب Pilot هنوز دو گزینه فعال Kowsar در دو Department و grant فعال `REPORT_VIEWER` ندارد؛ ایجاد حساب/Department/Role یک اقدام پیکربندی عملیاتی و خارج از تغییر خودکار این فاز است.
- منبع Sales مربوط به `CentralRef=1843` برای بازه جاری stale است: هر ۱۲ Query واقعی `BehindSelectedRange` هستند و آخرین سند دارای Summary در Department مجاز `1405/05/19` است. داده مصنوعی یا تغییر صوری تاریخ برای عبور از Gate مجاز نیست.

## ادامه پیشنهادی

Phase 6، Pilot governance، انتخاب غیرهاردکد شرکت‌کنندگان و ابزار مدیریت tenant-safe Role بسته شده‌اند و زیرساخت فنی، preflight و ثبت sign-off آماده است. Pilot واقعی طبق [MANAGEMENT-BI-PILOT.md](./MANAGEMENT-BI-PILOT.md) در وضعیت کنترل‌شده `0/100` قرار دارد؛ ۱۲ Query تاریخی از یک Actor و دو Scope به‌درستی در `PrePilotEligibleQueries` نگهداری می‌شوند و چون پیش از enrollment کامل اجرا شده‌اند وارد پیشرفت Pilot نمی‌شوند. گام بعدی provision کردن Central منتخب با دو کاربر واقعی در دو Department، فعال‌کردن `REPORT_VIEWER` توسط Admin در `/rbac/centralrole`، Login مجدد کاربران، انتخاب دو persona در Operations و تازه‌کردن منبع Sales از مسیر عملیاتی معتبر است. سپس مصرف واقعی، reconciliation، ثبت sign-off نسخه‌دار و تصمیم evidence-based درباره index/pre-aggregation انجام می‌شود.
