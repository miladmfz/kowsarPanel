# Phase 5 — Performance and User Experience

تاریخ checkpoint: ۲۰۲۶-۰۹-۱۵

## محدوده و روش اندازه‌گیری

تحلیل روی Production build واقعی Angular با `--stats-json` انجام شد. اسکریپت `scripts/bundle-audit.mjs` گراف importهای initial را از `stats.json` می‌سازد و علاوه بر حجم، محل انتشار AG Grid، D3، Leaflet و JsSIP را کنترل می‌کند. خروجی audit در `dist/.bundle-audit/bundle-report.json` تولید می‌شود و artifact اندازه‌گیری‌شده همان خروجی قابل انتشار `dist/.bundle-audit/browser` است.

| شاخص | خط مبنا | نتیجه Phase 5 | تغییر |
| --- | ---: | ---: | ---: |
| Initial JS/CSS (raw) | حدود 2,790,000 bytes | 671,898 bytes | 75.9% کاهش |
| Initial estimated transfer | 632.87 kB | 170.11 kB | 73.1% کاهش |
| کل فایل‌های artifact | 2,325 | 475 | 79.6% کاهش |
| حجم کل artifact | 71,373,814 bytes | 31,226,114 bytes | 56.3% کاهش |
| حجم `assets` منتشرشده | 62,842,223 bytes | 22,804,538 bytes | 63.7% کاهش |

اعداد chunk و hash نام فایل ممکن است با تغییر source جابه‌جا شوند؛ budget و audit بر اساس byte و package placement هستند و به نام hash وابسته نیستند.

## Bundle و Lazy Loading

- ثبت سراسری AG Grid از `main.ts` حذف و به boundary مشترک `ag-grid-enterprise-registration.ts` منتقل شد. این boundary فقط همراه صفحات Grid بارگذاری می‌شود و registration همچنان idempotent است.
- AG Grid در build نهایی داخل lazy chunk با اندازه `1,997,544 bytes` قرار دارد و سهم شناسایی‌شده packageهای AG Grid در آن `1,997,281 bytes` است.
- JsSIP/WebPhone در lazy chunk با اندازه `256,263 bytes` قرار دارد؛ سهم JsSIP برابر `228,584 bytes` است.
- Leaflet در lazy chunk صفحه Broker با اندازه `246,948 bytes` قرار دارد؛ سهم شناسایی‌شده Leaflet برابر `149,803 bytes` است.
- D3 در graph خروجی وجود ندارد، چون component فعلی consumer فعال ندارد. فایل component که دارای تغییرات قبلی کاربر است حذف یا بازنویسی نشد؛ audit تضمین می‌کند D3 تا زمان اضافه شدن یک مسیر مصرف‌کننده وارد initial bundle نشود.
- سقف‌های audit برابر `850,000 bytes` برای initial graph، `2,150,000 bytes` برای بزرگ‌ترین lazy chunk و `25,000,000 bytes` برای published assets هستند.
- Budget رسمی Angular برای initial bundle روی warning برابر `750kB` و error برابر `850kB` و برای component style روی `100kB/150kB` تنظیم شد.

## Assetهای انتشار

فایل‌های source حذف نشدند. الگوی publish عمومی، پوشه‌های legacy `assets/libs`، `assets/js`، `assets/configs` و `config_bak.json` را از artifact کنار می‌گذارد. تنها استثناء ثبت‌شده `assets/libs/apexcharts/apexcharts.min.js` است که هنوز runtime consumer دارد. Bundle audit وجود مسیرهای کنارگذاشته‌شده یا libraryهای legacy پیش‌بینی‌نشده را failure در نظر می‌گیرد.

این تصمیم قرارداد Runtime Config را تغییر نمی‌دهد: build profile همچنان فایل انتخاب‌شده را به `assets/config.json` در خروجی کپی می‌کند و فایل‌های profile منبع داخل artifact منتشر نمی‌شوند.

## قرارداد Loading، Empty و Error

`DataViewStateComponent` وضعیت‌های `loading`، `empty` و `error` را با قرارداد واحد زیر ارائه می‌کند:

- `role="status"` و `aria-live="polite"` برای loading/empty؛
- `role="alert"` و `aria-live="assertive"` برای error؛
- retry به‌صورت button واقعی و قابل استفاده با keyboard؛
- styling مشترک RTL و responsive.

این قرارداد در Workforce Absence Type و Accounting Report List اعمال شد. Report List اکنون lifecycle درخواست را با `finalize` مدیریت می‌کند، پیام failure قابل مشاهده دارد و درخواست تکراری `onFirstDataRendered` حذف شده است. Dashboard سانترال نیز stateهای loading/empty/error قابل دسترس، labelهای form و refresh action قابل استفاده با keyboard دارد.

## Accessibility، RTL و Responsive

- wrapper محتوای اصلی به عنصر semantic `main` تبدیل شد.
- headingهای صفحات ورود `h1`/`h2` هستند.
- کنترل نمایش رمز از `span` قابل کلیک به `button type="button"` با `aria-label` و `aria-pressed` تبدیل شد.
- focus-visible، اندازه‌بندی card و محدودیت عرض mobile برای صفحه‌های routed `login-person` و `login-kowsar` اصلاح شد.
- Gridها و toolbarهای مرجع label و region قابل فهم دارند و در عرض کم stack می‌شوند.

گیت `scripts/ui-acceptance.mjs` با Chrome Headless دو viewport زیر را روی Production artifact بررسی می‌کند:

- desktop: `1440x900`؛
- mobile: `390x844`.

هر viewport در هر دو تم `light` و `dark` اجرا می‌شود؛ بنابراین چهار سناریوی مستقل بررسی می‌شوند. در هر سناریو route واقعی `/auth/login-person`، RTL، وجود heading/form، نبود horizontal document overflow، قرارداد accessible password control و فعال شدن آن با Space بررسی می‌شود. علاوه بر این، فعال بودن stylesheetهای درست، مقدار `color-scheme`، روشن/تیره بودن surfaceها و contrast عنوان، توضیح و input با حداقل `4.5:1` کنترل می‌شوند. این تست هنگام توسعه یک overflow واقعی mobile و سپس input سفید صفحه Login در Dark Theme را آشکار کرد که هر دو در CSS صفحه routed اصلاح شدند.

## ممیزی کامل Dark Theme

در extension نهایی Phase 5 در تاریخ ۲۰۲۶-۰۹-۱۶، تمام styleهای source شامل `217` فایل CSS/SCSS و `23` بلوک inline داخل componentهای Angular، در مجموع `208,930` خط، با `scripts/dark-theme-audit.mjs` parse و بررسی شدند. فایل‌های vendor تغییر نکردند، ولی parse شدن آن‌ها و وجود assetهای RTL روشن/تاریک جزو gate است.

- `31` فایل component-scoped و `42` فایل global ناشی از `ViewEncapsulation.None` به‌صورت جداگانه شناسایی می‌شوند.
- `26` selector ریشه‌ای نامعتبر در پنج فایل scoped، از `[data-bs-theme="dark"] ...` به `:host-context(...)` مهاجرت کردند؛ این selectorها پیش‌تر بعد از Angular encapsulation به HTML واقعی match نمی‌شدند.
- tokenهای ثابت `--kws-dark-*` و قرارداد `color-scheme` برای background، surface، text، muted و border تعریف شدند.
- overrideهای نهایی framework برای Card، Table، Form، disabled/readonly/autofill، Dropdown، Nav/Tab، Pagination، Accordion، Modal، Toast، SweetAlert، utility colorها و focus-visible اضافه شدند.
- surfaceهای اختصاصی Login، Customer Dashboard، System Info، Project Tree، Attendance، Workforce Absence، Autletter Chat و مجموعه‌های Santral شامل Phonebook، Live List، Extension Monitor، Dashboard Audio و Call Report پوشش dark مستقل دارند.
- دو مورد contrast زیر `4.5:1` در دکمه Favorite سانترال اصلاح شدند. نتیجه نهایی audit برابر صفر parse error، صفر selector خراب، صفر contrast زیر `4.5:1` و صفر component دارای light surface بدون پوشش dark است.
- خروجی machine-readable در `dist/dark-theme-audit-report.json` نوشته می‌شود و `npm run theme:audit` بخشی از `npm run verify` است.

## Cache و Service Worker

- `assets/config.json` با `fetch` دارای `cache: 'no-store'` و `credentials: 'same-origin'` خوانده می‌شود.
- Runtime Config در hash table سرویس‌ورکر قرار نمی‌گیرد.
- navigation shell از strategy برابر `freshness` استفاده می‌کند.
- JavaScript/CSS و assetهای تصویری/font به‌صورت lazy cache می‌شوند.
- هیچ `dataGroup` برای Login، Token، Auth، API، Factor یا Report تعریف نشده است.
- audit تولید واقعی `ngsw.json`، نام asset groupها و وجود هر ۸ icon manifest را کنترل می‌کند.

## Quality Gates

فرمان کامل `npm run verify` اکنون علاوه بر audit امنیت و config، typecheck، unit test و development build، این زنجیره را نیز اجرا می‌کند:

1. Production build با stats؛
2. bundle size/package-placement audit؛
3. generated service-worker/manifest audit؛
4. desktop/mobile UI acceptance با Chrome Headless.

فرمان‌های مستقل نیز عبارت‌اند از `npm run theme:audit`، `npm run bundle:check`، `npm run bundle:audit`، `npm run pwa:audit` و `npm run ui:acceptance`.

## موارد موکول‌شده و استثناءها

- پذیرش صفحات محافظت‌شده با داده و credential واقعی به محیط deployment مربوط است؛ Phase 5 قرارداد UI مشترک و route عمومی ورود را بدون hardcode کردن credential پوشش می‌دهد.
- URL واقعی `qoqnooscoffee` و readiness متصل به دیتابیس واقعی همچنان مطابق checkpoint قبلی در deployment بررسی می‌شوند.
- هشدارهای CommonJS مربوط به کتابخانه‌های legacy موجودند، اما AG Grid/Leaflet/JsSIP از initial graph خارج شده‌اند و budget فعلی را نمی‌شکنند. جایگزینی این کتابخانه‌ها تغییر مستقل و پرریسک‌تری است و قرارداد Phase 5 را مسدود نمی‌کند.
