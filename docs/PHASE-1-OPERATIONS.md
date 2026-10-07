# مبنای عملیاتی Phase 1

تاریخ بازبینی: ۱۴ شهریور ۱۴۰۵

این سند، سناریوهای حیاتی و وابستگی‌های محیطی پروژه را از روی Routeها، Runtime Configها و APIهای موجود ثبت می‌کند. اولویت‌ها مبنای تست Regression و Release Gate هستند و در صورت تغییر اولویت کسب‌وکار باید همین سند اصلاح شود.

## سناریوهای حیاتی

| اولویت | جریان | نتیجه قابل قبول | حداقل کنترل پیش از انتشار |
| --- | --- | --- | --- |
| P0 | ورود CUSTOMER | پاسخ معتبر `IsUser`، ذخیره Session استاندارد، بارگذاری Permission و ورود به Dashboard | ورود موفق، رمز اشتباه، پاسخ خالی و خطای شبکه |
| P0 | ورود KOWSAR | پاسخ معتبر `KowsarLogin`، تشخیص شعبه/دپارتمان و ورود به Dashboard | کاربر فعال، کاربر غیرفعال، نداشتن دسترسی دپارتمان |
| P0 | Session و خروج | Route محافظت‌شده بدون Session باز نشود؛ Logout همه داده‌های احراز هویت را پاک کند | Refresh صفحه، Logout از Header/Sidebar، پاسخ 401 و 403 |
| P0 | تغییر اجباری رمز | کاربر دارای `NeedChangePassword` پیش از Dashboard به صفحه تغییر رمز هدایت شود | مسیر اجباری، تغییر موفق و خطای Backend |
| P0 | فروش و فاکتور | مشاهده لیست، ایجاد/ویرایش و بازخوانی فاکتور بدون از دست رفتن اقلام یا مبالغ | List، Create، Edit و محاسبه جمع |
| P0 | خرید و موجودی | ایجاد/ویرایش خرید و کالا و بازخوانی نتیجه صحیح باشد | Purchase، Good، Location و انتقال موجودی |
| P1 | اتوماسیون و نامه | لیست، ایجاد و مشاهده نامه و وضعیت Realtime پایدار باشد | Letter list/detail/create و قطع/وصل SignalR |
| P1 | مرخصی و حضور | درخواست، گردش وضعیت و داشبورد با Permission صحیح کار کند | Create، Approve/Reject و دسترسی غیرمجاز |
| P1 | سانترال | گزارش تماس، دفترچه تلفن و WebPhone در دسترس باشند و قطع PBX کل پنل را از کار نیندازد | PHP API، WebSocket، تماس ورودی/خروجی و حالت قطع ارتباط |
| P1 | منوی آنلاین | گروه، کالا و سفارش با PHP API تنظیم‌شده کار کند | بارگذاری منو، سبد و ثبت سفارش |
| P1 | کاتالوگ محصول | فهرست و جزئیات کالا بدون Session اصلی قابل استفاده باشد | List، Detail، تصویر ناموجود و خطای API |

## Release Gate فاز اول

- `npm run verify` باید بدون خطا اجرا شود.
- `dotnet build` و `dotnet test` باید بدون شکست اجرا شوند.
- `/health/live` و `/health/ready` باید پاسخ موفق بدهند.
- سناریوهای P0 بالا باید در محیط مقصد Smoke Test شوند.
- Runtime Config محیط مقصد باید قبل از انتشار اعتبارسنجی و همراه همان Artifact ثبت شود.
- هیچ Credential یا Token واقعی نباید در Log، مستندات یا خروجی CI نمایش داده شود.

## ماتریس محیط و Backend

| Profile | Base path | API اصلی | PHP/Menu | سایر وابستگی‌ها | وضعیت/ریسک |
| --- | --- | --- | --- | --- | --- |
| `config.json` | `/KowsarPanel/` | ASP.NET Core روی LAN، پورت 60007 | Menu و Santral روی localhost پورت 60009؛ Product روی دامنه عمومی | SignalR و PBX WebSocket روی LAN | Profile فعلی؛ `localhost` فقط وقتی PHP روی دستگاه کاربر/Proxy همان میزبان باشد درست است |
| `configs/local.json` | `/` | ASP.NET Core روی LAN، پورت 60006 | PHP Menu روی LAN، پورت 60005 | تنظیمات Santral/SignalR ندارد | محیط توسعه LAN؛ مقدار `production` فعلاً `true` است و باید هنگام استقرار آگاهانه انتخاب شود |
| `configs/itmali.json` | `/KowsarPanel/` | `itmali.ir/webapi` با HTTPS | Menu روی localhost | تنظیمات Santral/SignalR ندارد | HTTPS مناسب است؛ localhost برای Client راه‌دور ریسک عملیاتی دارد |
| `configs/itmaliIp.json` | `/KowsarPanelIp/` | IP عمومی با HTTP، پورت 60005 | Menu روی localhost | تنظیمات Santral/SignalR ندارد | HTTP و localhost برای انتشار عمومی مناسب نیستند و Mixed Content محتمل است |
| `configs/qoqnooscoffee.json` | `/qoqnooscoffee/` | IP عمومی با HTTP، پورت 60005 | PHP Menu روی همان IP | تنظیمات Santral/SignalR ندارد | باید پشت HTTPS/Reverse Proxy قرار گیرد |

## نقشه وابستگی‌ها

| وابستگی | مصرف‌کننده | تنظیم | Health Check فعلی |
| --- | --- | --- | --- |
| KitsApi / ASP.NET Core | بیشتر Serviceهای Angular | `apiUrl` | `/health/live` و `/health/ready` |
| SQL Server | KitsApi | Connection Stringهای Backend | Readiness برای `Web_Connection` و `KowsarIdentityDb` |
| PHP Menu API | Menu Online | `MenuapiUrl` | Smoke Test دستی/HTTP؛ Health endpoint مستقل ندارد |
| PHP Santral API | ماژول Santral | `santralUrl` | Smoke Test CORS/Router؛ Authorization عمداً فعلاً اضافه نشده است |
| SignalR | اعلان/نامه | `signalR.hubUrl` | اتصال Client؛ Health مستقل هنوز ندارد |
| Asterisk/PBX | WebPhone | `santralWebPhone.wsUrl` و تنظیم Backend | Proxy WebSocket؛ وضعیت PBX باید در فاز Observability کامل شود |
| سرویس پیامک | Login CUSTOMER | تنظیم امن Backend | Health عمومی توصیه نمی‌شود؛ خطای ارسال باید کنترل شود |

## قواعد انتخاب Profile

برنامه همیشه `assets/config.json` را در Bootstrap می‌خواند. فایل‌های `assets/configs/*.json` به‌خودی‌خود توسط Angular CLI جایگزین نمی‌شوند؛ فرایند استقرار باید Profile انتخابی را به نام `assets/config.json` منتشر کند. تغییر Profile بدون ثبت مقصد، Base path و Origin مجاز CORS ممنوع است.

