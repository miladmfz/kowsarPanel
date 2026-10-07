# Phase 6 — Advanced Analytics

## دامنه و تصمیم معماری

Phase 6 تحلیل پیشرفته را به Semantic Layer موجود اضافه می‌کند؛ Browser هیچ SQL، نام Table یا expression آزاد ارسال نمی‌کند. تمام داده‌ها از `IBiService.QueryAsync` عبور می‌کنند تا RBAC، Department scope، Dataset handler، cache و audit قبلی بدون مسیر میان‌بر حفظ شوند.

APIهای جدید:

- `POST /api/bi/analytics/analyze`
- `POST /api/bi/analytics/interpret`

هر دو route زیر `[Authorize]` و rate-limit فعلی `bi-query` هستند. `analyze` پیش از خواندن Catalog، permission همان Dataset handler را بررسی می‌کند و فقط Metric موجود در allow-list همان handler و Catalog منتشرشده را می‌پذیرد.

## Anomaly detection

- ورودی: سری دوره‌ای Metric منتشرشده از Query governed.
- baseline هر نقطه: median حداکثر شش دوره قبلی.
- score: robust z-score بر پایه median residual و MAD.
- sensitivity: سطح ۱ تا ۵ با threshold صریح؛ حساسیت بیشتر threshold پایین‌تری دارد.
- خروجی: actual، baseline، deviation، deviation percent، score، confidence، direction و explanation.
- کمتر از شش مشاهده یا پراکندگی صفر، به‌جای anomaly ساختگی خروجی خالی می‌دهد.

این مدل علت رویداد را ادعا نمی‌کند. Guided analysis کاربر را به cross-filter واحد/دوره و گزارش عملیاتی همان دوره هدایت می‌کند.

## Forecasting و backtest

- کمتر از هشت مشاهده: `InsufficientData`.
- gap یا دوره تکراری: `InsufficientData`؛ فاصله‌های نامنظم به‌عنوان دوره مجاور فرض نمی‌شوند.
- سری ماهانه با حداقل ۲۴ مشاهده: `SeasonalNaive` با seasonality صریح `Monthly (12 periods)`.
- سایر سری‌های منظم: `LinearTrend` با seasonality صریح `None`.
- holdout: حدود ۲۰٪ انتهای سری، حداقل ۲ و حداکثر ۶ دوره.
- evidence: `MAE`، `MAPE`، `WAPE`، تعداد train/test و quality برابر High/Medium/Low.
- خروجی آینده: point estimate و interval تقریبی ۹۵٪ بر پایه residual backtest.

Forecast به‌صورت planning evidence نمایش داده می‌شود، نه نتیجه قطعی. quality پایین warning می‌سازد و UI کاربر را به استفاده از interval و بازبینی داده منبع ملزم می‌کند.

## Natural-language query

NLQ یک parser محدود است، نه LLM-to-SQL:

- فقط Dataset و Metricهایی را می‌بیند که برای کاربر قابل مشاهده و `Published` هستند.
- Metric علاوه بر انتشار باید در allow-list handler ثبت‌شده باشد.
- واژگان از title/key منتشرشده و aliasهای کنترل‌شده فارسی/انگلیسی تشکیل می‌شود.
- خروجی فقط یک `BiQueryRequest` قابل بازبینی است و `RequiresConfirmation=true` دارد.
- date range و Department scope از کنترل‌های صریح UI می‌آیند؛ از متن حدس زده نمی‌شوند.
- commandهای SQL، comment و statement separator رد می‌شوند.
- API هیچ SQL تولید یا برنمی‌گرداند.

## Cross-filter و Guided Analysis

صفحه `/accounting/gozareshat/bi/analytics` این موارد را یکجا نمایش می‌دهد:

- observed و forecast در نمودار مشترک؛
- anomaly explanation و confidence؛
- backtest evidence و interval؛
- breakdown واحد سازمانی؛
- guided insights برای anomaly، trend، forecast quality و freshness؛
- period cross-filter برای همگام‌سازی KPI، anomaly و insight؛
- Department cross-filter با اجرای مجدد Query در Backend و کنترل مجدد scope.

Workspace اصلی نیز cross-filter دوره‌ای را میان KPI، trend، bar، pivot و table اعمال می‌کند. Drill واحد همچنان server-side است و تمام Widgetها را با Scope محدودشده به‌روزرسانی می‌کند.

## پایگاه داده و rollback

Migration `20261003_ManagementBI_P6_AdvancedAnalytics.sql` فقط check constraint موجود `CK_BiQueryAudit_QueryMode` را به مقدار `Analytics` گسترش می‌دهد. داده row-level، prompt NLQ یا نتیجه forecast در DB ذخیره نمی‌شود؛ telemetry استاندارد Query فقط metadata موجود را با `QueryMode=Analytics` ثبت می‌کند.

Rollback با SQL بداهه انجام نمی‌شود. در صورت نیاز باید backup تأییدشده Phase 6 restore شود. Migration فقط روی `MaliKowsar99` یا clone نام‌گذاری‌شده `MaliKowsar99_BI_P6_Verify_*` اجرا می‌شود.

## محدودیت‌های آگاهانه

- telemetry پیش از Phase 6 فقط ۲۲ Query داشت و هنوز به Pilot هدف ۱۰۰ نرسیده است؛ این موضوع مانع فنی نیست ولی sign-off عمومی مدل را تا جمع‌آوری evidence Pilot باز نگه می‌دارد.
- anomaly و forecast روی aggregate دوره‌ای عمل می‌کنند؛ causal inference نیستند.
- NLQ تاریخ، target، فرمول جدید، SQL، DAX یا Procedure نمی‌سازد.
- عنوان‌های Seed قدیمی که encoding نامناسب دارند، از alias کنترل‌شده قابل resolve هستند؛ اصلاح متن داده‌های قدیمی خارج از این migration محدود باقی مانده است.

## Release gates

- Backend unit/contract/security test برای engine، gap، permission، allow-list و NLQ.
- Frontend component/service test برای evidence، confirmation و cross-filter.
- `dotnet build webapikits.sln -c Release` و کل test suite.
- `npm run verify` و `npm run build:itmaliIp`.
- backup با `CHECKSUM`، `RESTORE VERIFYONLY`، اجرای دوباره migration روی clone و target.
- smoke واقعی health/auth/analyze/NLQ/injection روی instance موقت `60007`؛ سرویس `60006` نباید متوقف شود.
