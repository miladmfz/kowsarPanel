# Runbook پایلوت کنترل‌شده Kowsar BI

تاریخ شروع فنی: ۲۰۲۶-۰۹-۳۰  
Domain: `Sales`  
Dataset: `sales.summary`  
وضعیت: preflight و انتخاب نسخه‌دار شرکت‌کنندگان آماده است؛ ۱۲ Query واقعی اولیه به‌عنوان سابقه قبل از Pilot حفظ شده‌اند، اما مرز کنترل‌شده هنوز شروع نشده و پیشرفت معتبر `0/100` است. ادامه Pilot منتظر provision شدن حداقل دو گزینه واقعی، انتخاب آن‌ها، تکمیل Role و رفع stale بودن منبع Sales است و rollout عمومی مجاز نیست

## هدف تصمیم

این Pilot باید مشخص کند آیا Dashboard مدیریتی Sales با تعریف‌های Published، Scope واقعی کاربران و سرعت قابل قبول برای تصمیم روزانه مناسب است یا خیر. خروجی Pilot مجوز حدس‌زدن KPI، target، SLA یا ساخت index/pre-aggregation نیست؛ هر تغییر بعدی باید از شواهد مصرف واقعی پشتیبانی شود.

## خط مبنا و وضعیت جاری

ممیزی read-only دیتابیس `MaliKowsar99` در ۲۰۲۶-۰۹-۳۰ برای بازه ۹۰ روزه، ۲۰ رخداد `sales.summary` پیدا کرد:

- ۱۴ رخداد تعاملی متعلق به هویت‌های smoke/non-operational بود.
- ۶ رخداد از نوع `Async` یا `Schedule` بود.
- هیچ رخداد موفقی از هویت عملیاتی با قالب دقیق `KOWSAR:<numeric>` وجود نداشت.
- خط مبنای صحیح Pilot برابر `0/100` Query واجد شرایط، صفر کاربر واقعی و صفر Scope واقعی است.

ترافیک synthetic، smoke، async و schedule عمداً در پیشرفت Pilot شمرده نمی‌شود. شمارنده در سطح `CentralRef` کاربر محاسبه می‌شود و داده‌ی tenantهای دیگر را مخلوط نمی‌کند.

ممیزی read-only تازه در ۲۰۲۶-۱۰-۰۳ نشان داد `CentralRef=1843` بعد از خط مبنای بالا دارای سابقه عملیاتی زیر است:

- ۱۲ Query موفق عملیاتی از یک Actor و دو Scope متمایز، اما اجراشده پیش از enrollment کامل؛
- failure rate برابر صفر، میانگین `254.50ms`، P95 برابر `1224ms` و بیشینه `1396ms`؛
- هر ۱۲ Query با `BehindSelectedRange` ثبت شده‌اند و در نتیجه Gate freshness رد است؛
- آخرین سند Sales دارای Summary در تنها Department این Central مربوط به `1405/05/19` است؛ Queryهای Pilot در ۲۰۲۶-۱۰-۰۱ اجرا شده‌اند؛
- یک کاربر فعال Kowsar در یک Department، بدون grant فعال `REPORT_VIEWER`؛ در نتیجه `ConfigurationReady=false`؛
- برای DefinitionVersion فعلی (`2`) هنوز هیچ `BiPilotReview` ثبت نشده است.

از ۲۰۲۶-۱۰-۰۶ این ۱۲ Query در `PrePilotEligibleQueries` گزارش می‌شوند و دیگر در پیشرفت یا Guardrailهای Pilot اثر ندارند. preflight واقعی اکنون `EligibleQueries=0`، `PilotEvidenceFrom=null`، `StaleCount=0` و `PrePilotEligibleQueries=12` برمی‌گرداند. Queryهای جدید باید پس از تازه‌شدن منبع و ذخیره دو کاربر واقعی با topology تأییدشده اجرا شوند.

## Preflight پیکربندی Pilot

endpoint آمادگی، قبل از شمردن مصرف واقعی چهار پیش‌نیاز tenant-safe را نیز کنترل می‌کند:

1. انتخاب دو کاربر فعال Kowsar برای personaهای `Manager` و `ReportViewer` در همان `CentralRef`؛
2. متفاوت بودن دو کاربر و عضویت فعال آن‌ها در حداقل دو `Department` متمایز؛
3. اتصال انتخاب به `DefinitionVersion` منتشرشده‌ی جاری؛
4. grant فعال `REPORT_VIEWER` برای همان `CentralRef`.

فیلدهای `AvailablePilotUsers` و `AvailablePilotDepartments` ظرفیت واقعی Central را نشان می‌دهند؛ `SelectedPilotUsers`، `SelectedPilotDepartments`، `HasManagerParticipant`، `HasReportViewerParticipant` و `HasReportViewerRole` انتخاب معتبر و Gate Role را گزارش می‌کنند. `ConfigurationReady` فقط در صورت عبور هم‌زمان همه این شروط `true` می‌شود. شمارش از `DepartmentUser` و `Users` واقعی انجام می‌شود و مقادیر legacy-encoded مربوط به `CentralRef` و `Active` با قرارداد فعلی برنامه decode می‌شوند.

ممیزی read-only در ۲۰۲۶-۱۰-۰۳ این وضعیت را دوباره تأیید کرد: ۲۵ عضویت Kowsar بررسی شد که ۲۰ مورد فعال بودند، اما هر Central فعالِ مشاهده‌شده فقط یک کاربر و یک Department داشت و تعداد Centralهای دارای `ConfigurationReady=true` صفر بود. `CentralRef=1843` با وجود ۱۲ Query واقعی همچنان یک کاربر، یک Department و `HasReportViewerRole=false` دارد. بنابراین ادامه Pilot کنترل‌شده تا provision شدن Central منتخب با دو کاربر در دو Department، grant فعال `REPORT_VIEWER` و تازه‌شدن منبع Sales متوقف است. هیچ حساب، Department یا Role مصنوعی توسط این فاز ایجاد نشد.

برای تکرار امن این بررسی از ریشه Backend دستور زیر را اجرا کنید. ابزار فقط endpointهای `GET` را روی instance موقت فراخوانی می‌کند، هیچ SQL یا API نوشتنی ندارد، نام یا شناسه کاربران را چاپ نمی‌کند و به instance موجود روی پورت `60006` دست نمی‌زند:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\pilot-preflight.ps1 `
  -CentralRef 1843 -TargetDatabase MaliKowsar99 -Port 60007
```

خروجی شامل تعداد گزینه‌های واقعی، کاربران/Departmentهای انتخاب‌شده، وضعیت personaها، Role، Queryهای واجد شرایط، `PrePilotEligibleQueries`، `PilotEvidenceFrom`، freshness، P95، `ConfigurationReady`، `RolloutReady` و فهرست blockerها است. `CentralRef` ورودی اپراتور است و در اسکریپت hardcode نشده است.

در مدل فعلی، Role به `CentralRef` از طریق `CentralRole` تخصیص می‌یابد و Role مستقلی با نام `MANAGER` وجود ندارد. «مدیر» در این Runbook یک persona و Gate دستی تجاری است، نه claim قابل استنتاج از JWT یا audit.

### انتخاب کنترل‌شده شرکت‌کنندگان

کاربر دارای `BI_PILOT_REVIEW` و `REPORT_SALES_VIEW` باید در صفحه `/accounting/gozareshat/bi/operations` بخش «تعیین شرکت‌کنندگان Pilot» را تکمیل کند. گزینه‌ها از API زیر و فقط برای Central موجود در JWT خوانده می‌شوند:

`GET /api/bi/operations/pilot/participants?datasetKey=sales.summary`

ذخیره از API زیر انجام می‌شود و Browser فقط `DatasetKey`، `DefinitionVersion`، `RowVersion` و دو انتخاب `UserRef + DepartmentRef + Persona` را ارسال می‌کند:

`PUT /api/bi/operations/pilot/participants`

هیچ `UserRef`، `DepartmentRef`، `CentralRef` یا Actor در کد یا Runbook ثابت نیست. Backend دوباره عضویت فعال کاربر، Kowsar بودن، Central، Department، یکتایی persona و متفاوت بودن کاربران را کنترل می‌کند. ثبت به نسخه تعریف متصل، با `RowVersion` در برابر تغییر هم‌زمان محافظت و در `BiPilotEnrollmentAudit` به‌صورت metadata-only ممیزی می‌شود.

انتخاب `ReportViewer` در این فرم Role امنیتی ایجاد نمی‌کند. grant فعال `REPORT_VIEWER` همچنان باید مستقل و از مسیر معتبر RBAC برقرار باشد. اگر Central کمتر از دو گزینه واقعی در دو Department دارد، Pilot متوقف می‌ماند و نباید برای عبور از Gate کاربر یا Department مصنوعی ساخته شود.

### Setup Assistant عملیاتی

صفحه Operations شش Gate را به‌ترتیب topology، انتخاب personaها، Role، freshness، مصرف واقعی و sign-off نمایش می‌دهد. وضعیت هر مرحله فقط از قرارداد `BiPilotReadiness` محاسبه می‌شود؛ UI هیچ User، Department، Role، Query یا تصمیمی را فرض نمی‌کند. Admin در صورت نبود `REPORT_VIEWER` به Route تأییدشده `/rbac/centralrole` هدایت می‌شود. چون Route عمومی و معتبر provision کردن User/Department در این فاز تأیید نشده است، برای آن‌ها لینک ساخته نشده و Runbook اپراتور همچنان مرجع اقدام است.

صفحه `/rbac/centralrole` اکنون امکان خواندن و ذخیره Roleهای فعال همان Central احراز هویت‌شده را دارد. قرارداد Backend فقط `EnabledRoleRefs + ExpectedVersion` را می‌پذیرد، Central را از JWT حل می‌کند، Roleهای غیرفعال/نامعتبر را رد می‌کند، تغییر `ADMIN` را نادیده می‌گیرد و در تعارض نسخه پاسخ `409` می‌دهد. پس از فعال‌کردن `REPORT_VIEWER` باید کاربران دوباره Login کنند و readiness بازخوانی شود. این قابلیت ابزار اپراتور است؛ اجرای خودکار preflight همچنان فقط‌خواندنی است و Role را grant نمی‌کند.

بررسی read-only `MaliKowsar99` در ۲۰۲۶-۱۰-۰۴ تأیید کرد که `DepartmentUser` روی `(UserRef, DepartmentRef)` unique است، اما Procedure معتبر provision روزمره در Database یا Web API موجود نیست. `spAux_DoAfterUpdate_16` فقط bootstrap دیتابیس خالی است و نباید برای Pilot اجرا شود. metadata مربوط به `TDepartmentUser` نشان می‌دهد این مسئولیت در محصول Legacy قرار داشته، ولی سورس/قرارداد معتبر آن در repositoryهای فعلی پیدا نشد. بنابراین ایجاد دومین User و عضویت Department یک اقدام بیرونی و نیازمند قرارداد Legacy معتبر است؛ هیچ `INSERT` مستقیمی از Runbook یا BI مجاز نیست.

## ثبت کنترل‌شده Gateهای دستی

از ۲۰۲۶-۱۰-۰۳ دو Gate دستی دیگر مقدار ثابت و غیرقابل‌تکمیل نیستند. کاربر دارای Permission مستقل `BI_PILOT_REVIEW` می‌تواند در صفحه Operations نتیجه پوشش personaها، sign-off کسب‌وکار و تصمیم نهایی را ثبت کند. این Permission در Migration فقط به Role `ADMIN` داده می‌شود و واگذاری آن به Role دیگر باید تصمیم صریح امنیتی باشد.

رکورد بازبینی بر اساس `CentralRef + DatasetKey + DefinitionVersion` یکتا است. Actor از JWT سمت سرور ثبت می‌شود، ویرایش با `RowVersion` و پاسخ `409` در تعارض محافظت می‌شود و هر ثبت یا ویرایش یک سطر metadata-only در `BiPilotReviewAudit` می‌سازد. API نام ثبت‌کننده را در پاسخ readiness افشا نمی‌کند.

`RolloutReady=true` فقط وقتی ممکن است که تمام Gateهای فنی Passed باشند، پوشش نقش و sign-off کسب‌وکار هر دو `Approved` باشند و تصمیم دقیقاً `Approve` باشد. `ApproveWithActions` قابل ثبت است ولی تا بسته‌شدن اقدام‌ها Rollout را باز نمی‌کند. تغییر `DefinitionVersion` نیز review جدید لازم دارد.

## تعریف Query واجد شرایط

یک رخداد فقط وقتی در پیشرفت Pilot شمرده می‌شود که همه‌ی شرایط زیر برقرار باشد:

1. `DatasetKey = sales.summary`؛
2. `QueryMode` یکی از `Sync` یا `Analytics` باشد؛
3. `Status = Succeeded` باشد؛
4. `ActorSubject` دقیقاً هویت عملیاتی `KOWSAR:<numeric>` باشد؛
5. رخداد در همان `CentralRef` کاربر درخواست‌کننده و در پنجره ۹۰ روزه باشد؛
6. `DefinitionVersion` رخداد با نسخه منتشرشده جاری برابر باشد؛
7. رخداد بعد از `PilotEvidenceFrom` اجرا شده باشد. این زمان فقط پس از ذخیره یک `Manager` و یک `ReportViewer` متفاوت از دو Department ثبت می‌شود.

Queryهای موفقی که شرط‌های ۱ تا ۶ را دارند ولی پیش از مرز بند ۷ اجرا شده‌اند حذف نمی‌شوند؛ در `PrePilotEligibleQueries` برای ممیزی نمایش داده می‌شوند و در KPI، latency، failure یا freshness Pilot شمرده نمی‌شوند. تغییر شرکت‌کنندگان `PilotEvidenceFrom` را به زمان ذخیره جدید می‌برد.

API فقط metadata تجمیعی برمی‌گرداند و Actor، filter خام، row data، prompt یا SQL را افشا نمی‌کند:

`GET /api/bi/operations/pilot/readiness?datasetKey=sales.summary&days=90&targetQueries=100`

دسترسی هم‌زمان به `BI_OPERATIONS_VIEW` و `REPORT_SALES_VIEW` الزامی است. پنل همین وضعیت در صفحه Operations نمایش داده می‌شود و برای کاربری که مجوز Sales ندارد بارگذاری نمی‌شود.

## چارچوب KPI و Gate خروج

| نوع | معیار | Gate |
| --- | --- | --- |
| Outcome | Query تعاملی موفق واقعی | حداقل ۱۰۰ |
| Driver | کاربران واقعی متمایز | حداقل ۲ |
| Driver | Scopeهای متمایز | حداقل ۲ |
| Guardrail | Failure rate تعاملی | حداکثر ۱٪ |
| Guardrail | P95 latency تعاملی | حداکثر ۲۰۰۰ms |
| Guardrail | `NoData` یا `BehindSelectedRange` | صفر رخداد واجد شرایط |
| Manual gate | پوشش یک مدیر و یک `REPORT_VIEWER` | تأیید دستی با نام مسئول |
| Manual gate | تعریف KPI، target و freshness SLA | sign-off مالک Sales/Finance |

`RolloutReady` تا زمان عبور تمام معیارهای فنی و دو Gate دستی، `false` باقی می‌ماند. Roleهای JWT عمداً در audit ذخیره نمی‌شوند؛ بنابراین پوشش Role از روی حدس یا ActorSubject تأیید نمی‌شود.

## اجرای Pilot

1. Central منتخب باید حداقل دو کاربر فعال Kowsar در دو Department داشته باشد و grant فعال `REPORT_VIEWER` برای آن برقرار باشد.
2. در بخش «تعیین شرکت‌کنندگان Pilot»، یک مدیر تصمیم‌گیر و یک کاربر گزارش‌گیر متفاوت انتخاب و ذخیره شوند؛ شمارنده انتخاب‌شده‌ها باید `2` کاربر و `2` Department و کارت `PilotEvidenceFrom` باید دارای زمان باشد.
3. هر دو کاربر بعد از این زمان با حساب واقعی خود وارد شوند؛ حساب smoke یا token ساختگی پذیرفته نیست.
4. Dashboard منتشرشده‌ی Sales برای سال مالی جاری و مقایسه با دوره قبل باز شود.
5. هر کاربر حداقل سناریوهای مشاهده Summary، تغییر بازه، تغییر grain، Department مجاز، cross-filter و drill-through را اجرا کند.
6. مالک تجاری اعداد نمونه را با گزارش authoritative برای حداقل دو بازه و دو Scope مقایسه کند.
7. وضعیت روزانه از پنل Operations خوانده شود؛ برای رسیدن سریع‌تر به ۱۰۰ هیچ داده یا audit مصنوعی درج نشود.
8. بعد از رسیدن به ۱۰۰، فقط الگوهای پرتکرار و کند با Query audit واقعی برای index/pre-aggregation بررسی شوند.

## فرم Sign-off تجاری

موارد زیر باید با نام مالک، تاریخ و تصمیم صریح بررسی شوند و نتیجه آن‌ها در فرم نسخه‌دار Operations ثبت شود:

- مالک نهایی تعریف Sales و Return؛
- نحوه‌ی محاسبه مالیات، عوارض و تخفیف در مبلغ فروش؛
- وضعیت سند لغوشده، پیش‌فاکتور و برگشت در numerator/denominator؛
- Scope دقیق Department، Broker و Stack برای هر Role؛
- target هر KPI و freshness SLA قابل قبول؛
- نتیجه reconciliation دو بازه و دو Scope با گزارش authoritative؛
- تصمیم نهایی یکی از `Approve`, `ApproveWithActions` یا `Reject`.

## معیار پایان

Pilot فقط وقتی کامل است که `100/100` مصرف واقعی، دو کاربر، دو Scope، همه Guardrailها، بررسی نقش‌ها و sign-off مالک تجاری هم‌زمان برقرار باشند. تا آن زمان وضعیت «در حال اجرا» است و Phase بعدی بهینه‌سازی یا rollout عمومی شروع نمی‌شود.
