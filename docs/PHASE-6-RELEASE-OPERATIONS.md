# Phase 6 — Release and Operations

## Version contract

- نسخه‌ی قابل نمایش و artifact از `appVersion` در فایل runtime profile می‌آید.
- همه‌ی profileها باید هنگام release یک `appVersion` یکسان با قالب سه‌بخشی عددی داشته باشند.
- نسخه‌ی `package.json` معادل SemVer همان مقدار و بدون صفرهای ابتدایی segmentها است؛ برای مثال `15.02.05` برابر `15.2.5` است.
- هر نسخه باید پیش از build یک entry متناظر در `CHANGELOG.md` داشته باشد.
- `npm run release:metadata:audit` این قرارداد، یکتایی output profileها و وجود Changelog را fail-fast بررسی می‌کند.

## Release artifact

فرمان هر profile مستقل است؛ برای نمونه:

```powershell
npm run build:itmaliIp
```

خروجی عمومی در مسیر تعریف‌شده‌ی همان profile زیر `dist` ساخته می‌شود. هر خروجی شامل `release.json` است که profile، نسخه، زمان UTC، Git revision، وضعیت dirty source و SHA-256 همه‌ی فایل‌های عمومی را ثبت می‌کند. وجود dirty source در manifest شفاف ثبت می‌شود و چیزی از تغییرات کاربر حذف یا reset نمی‌شود.

Production build، source map مخفی تولید می‌کند. `build.js` نقشه‌ها را پیش از نهایی‌کردن artifact از مسیر عمومی خارج کرده و در مسیر خصوصی زیر نگه می‌دارد:

```text
dist/.source-maps/<profile>/<appVersion>/
```

این پوشه نباید در web root، package عمومی یا repository قرار گیرد. دسترسی آن فقط برای تیم عملیات/خطایابی است. `release-artifact-audit.mjs` نبودن فایل `.map`، نبودن `sourceMappingURL`، عدم انتشار profileهای دیگر و صحت تمام checksumها را کنترل می‌کند.

## Production error monitoring

`KowsarGlobalErrorHandler` خطاهای مدیریت‌نشده‌ی Angular را دریافت می‌کند. فقط در Production و فقط پس از تشکیل session احراز هویت‌شده، گزارش کنترل‌شده با `POST` به endpoint `api/Kits/ErrorLog` ارسال می‌شود. قرارداد `GET` قدیمی برای سازگاری حفظ شده، اما monitoring جدید payload را در URL/access log قرار نمی‌دهد.

- Object دلخواه serialize نمی‌شود؛
- Bearer token، tokenهای query string، password/API key و credential داخل URL حذف می‌شوند؛
- متن حداکثر ۲۰۰۰ کاراکتر است؛
- خطای تکراری تا ۳۰ ثانیه دوباره ارسال نمی‌شود؛
- شکست خود monitoring دوباره وارد interceptor یا UI notification نمی‌شود.

فعال بودن ذخیره‌سازی گزارش به وجود قرارداد معتبر `ErrorLogReport` در `Kits_Connection` وابسته است. endpoint در نبود جدول، بدون افشای جزئیات `503` می‌دهد. Logهای Backend همچنان از Serilog و فایل rolling روزانه استفاده می‌کنند.

## Health contract

| Endpoint | هدف | پاسخ موفق | اثر در deployment |
| --- | --- | --- | --- |
| `/health/live` | زنده بودن process | `200` | اگر fail شد process جایگزین نشود |
| `/health/ready` | دسترسی read-only به Databaseهای پیکربندی‌شده | `200` | در Production باید pass شود |
| `/health/dependencies` | Database به‌علاوه‌ی AMI و WebSocket مربوط به PBX/Realtime | `200` و JSON | پیش از بازکردن traffic باید pass شود |
| `/pbx/health` | تشخیص authenticated قدیمی PBX | قرارداد legacy موجود | قرارداد route/response تغییر نکرده است |

خروجی health تجمیعی فقط نام و وضعیت checkها و Booleanهای `ami`/`webSocket` را نشان می‌دهد؛ host، port و ConnectionString برگردانده نمی‌شوند. هیچ health check دیتابیس را تغییر نمی‌دهد و query دیتابیس همان `SELECT 1` است.

## Release checklist

1. تغییر نسخه را هم‌زمان در همه‌ی `src/assets/configs/*.json`، `src/assets/config.json` و `package.json` انجام بده و Changelog را اضافه کن.
2. `npm ci` و سپس `npm run verify` را اجرا کن.
3. Backend را با `dotnet build webapikits.sln -c Release` و `dotnet test webapikits.sln` تأیید کن.
4. audit آسیب‌پذیری npm و NuGet باید بدون vulnerability باشد.
5. profile مقصد را با فرمان مستقل خودش بساز.
6. `release.json` و private source-map archive را نگه دار؛ فقط پوشه‌ی عمومی profile را deploy کن.
7. Backend را side-by-side publish کن و فایل runtime config محیط را خارج از package نگه دار.
8. ابتدا instance موقت/slot جدید را بالا بیاور؛ process موجود روی port `60006` نباید برای smoke متوقف شود.
9. smoke را علیه URL واقعی اجرا کن:

   ```powershell
   npm run smoke:post-deploy -- https://example/panel/ https://example/api-root/
   ```

10. فقط پس از pass شدن shell/config/release metadata، liveness، readiness، dependency health، پاسخ `401` مسیر محافظت‌شده، پاسخ `400` login ناقص و پاسخ `401` SignalR negotiate، traffic را منتقل کن.
11. Login واقعی، یک route کلیدی، Dark/Light، PWA update و ثبت error monitoring را بدون ثبت credential بررسی کن.

برای اجرای مستقیم و صریح می‌توان از `node scripts/post-deploy-smoke.mjs --frontend <url> --backend <url>` استفاده کرد. مقدار positional اول Frontend و مقدار دوم Backend است؛ اگر فقط یک URL داده شود Backend در نظر گرفته می‌شود. گزینه‌ی `allow-unready`/`--allow-unready` فقط برای smoke محلی بدون ConnectionString/PBX واقعی است و در release Production مجاز نیست.

## Rollback

1. آخرین artifact سالم Frontend و publish سالم Backend را با `release.json`/version نگه دار.
2. در انتشار، فایل‌های قبلی را درجا overwrite نکن؛ نسخه‌ی جدید را در directory یا deployment slot جدا قرار بده.
3. runtime config، secret store و فایل‌های محیط‌محور را بین نسخه‌ها کپی یا داخل artifact commit نکن؛ همان منبع محافظت‌شده‌ی محیط را به نسخه‌ی انتخاب‌شده متصل کن.
4. اگر smoke یا پایش پس از release شکست خورد، route/reverse-proxy/web-root و Windows Service executable path را به نسخه‌ی قبلی برگردان.
5. service را restart و همان `smoke:post-deploy` را روی نسخه‌ی برگشتی اجرا کن.
6. source map خصوصی نسخه‌ی شکست‌خورده، `release.json`، زمان رخداد و Serilogها را برای تحلیل نگه دار.

Rollback این فاز هیچ rollback دیتابیسی انجام نمی‌دهد. تغییر دیتابیس فقط با برنامه و مجوز مستقل انجام می‌شود.

## Deferred environment gate

Profile `qoqnooscoffee` تا زمان تأمین DNS/TLS یا reverse proxy معتبر قابل Publish عمومی نیست. بعد از آماده‌شدن زیرساخت باید URLهای runtime با مقدار واقعی به HTTPS/WSS تغییر کنند، `npm run config:audit -- src/assets/configs/qoqnooscoffee.json` و probe TLS اجرا شوند و سپس build و smoke نهایی انجام شود. placeholder یا downgrade عمومی HTTP قابل قبول نیست.
