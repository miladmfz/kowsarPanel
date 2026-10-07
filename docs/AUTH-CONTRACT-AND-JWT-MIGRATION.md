# قرارداد احراز هویت و برنامه مهاجرت به JWT

تاریخ بازبینی: ۱۴ شهریور ۱۴۰۵

## تصمیم معماری

مالک محصول در ۱۵ شهریور ۱۴۰۵ اجازه Cutover به معماری جدید را داد. بنابراین سازگاری دائمی با Clientهای قدیمی الزام نیست و کاربران می‌توانند کار را با Client جدید آغاز کنند. قرارداد Legacy فقط تا زمان آماده‌شدن و پذیرش نسخه جدید فعال می‌ماند؛ پس از آن به‌جای نگهداری دو معماری، endpointهای قدیمی بازنشسته می‌شوند. این تصمیم شامل PHP سانترال نیست و Authorization آن طبق تصمیم فعلی دست‌نخورده می‌ماند.

## قرارداد فعلی Client

### ورود CUSTOMER

- Endpoint: `POST {apiUrl}Auth/IsUser`
- Body فعلی: `UName`، `UPass` و در Client فیلدهای `UserType` و `DepartmentCode`
- Envelope پاسخ: آرایه/شیء `users` که Client عضو اول آن را می‌خواند.
- موفقیت: `ErrCode` برابر `0`.
- احراز دومرحله‌ای فعلی: `AuthSms` و `RandomeCode` در همان پاسخ بررسی می‌شوند.

### ورود KOWSAR

- Endpoint: `POST {apiUrl}Auth/KowsarLogin`
- Body: `UName`، `UPass` و `DepartmentCode`.
- Envelope پاسخ: `users[0]`.
- خطاهای Domain فعلی از طریق `ErrCode`، `ErrDesc` یا `Message` گزارش می‌شوند.

### Permission و Session

- پس از Login، Client از `GET {apiUrl}Auth/CentralPermission?CentralRef=...` استفاده می‌کند.
- Session جاری در `sessionStorage` نگهداری می‌شود؛ از جمله `SessionId`، `UserId`، `CentralRef`، `LoginType`، اطلاعات دپارتمان، `PermissionKeys` و `RoleNames`.
- درخواست‌های API اصلی Headerهای legacy شامل `PIC`، `CR`، `SI`، `UI` و `UN` را ارسال می‌کنند.
- `UserTypeLogin` فقط برای انتخاب صفحه Login در `localStorage` باقی می‌ماند.
- در پاسخ `401` یا `403`، Session و Access Token پاک و کاربر به Login مناسب هدایت می‌شود.

## وضعیت JWT موجود

JWT Bearer validation اکنون در Backend فعال است. Loginهای واقعی CUSTOMER (پس از OTP در صورت نیاز) و KOWSAR فیلد `auth` را برمی‌گردانند، Frontend Tokenها را فقط در `sessionStorage` نگه می‌دارد و `/api/Auth/v2/session` به‌عنوان اولین endpoint محافظت‌شده فعال است. شناسه امنیتی به‌شکل `CUSTOMER:<id>` یا `KOWSAR:<id>` صادر می‌شود تا دو منبع Legacy تداخل نداشته باشند. Refresh Token هفت‌روزه با مقدار تصادفی ۵۱۲ بیتی، Hash دیتابیسی، Rotation اتمیک و جلوگیری از Replay پیاده‌سازی شده و Logout آن را Server-side باطل می‌کند. کد نمونه قدیمی Login/Refresh/Logout همچنان کامنت است و نباید فعال شود.

## قرارداد هدف نسخه جدید

در دوره مهاجرت، پاسخ Login فعلی حفظ می‌شود و فیلد `auth` به آن افزوده می‌شود:

```json
{
  "users": [
    {
      "ErrCode": 0,
      "LoginType": "CUSTOMER",
      "SessionId": "legacy-session-id"
    }
  ],
  "auth": {
    "scheme": "Bearer",
    "accessToken": "<opaque-jwt>",
    "expiresAt": "<utc-iso-8601>",
    "refreshToken": "<opaque-token>"
  }
}
```

Client جدید از `auth` و Bearer Token استفاده می‌کند. Envelope قدیمی `users` فقط در پنجره Cutover حفظ می‌شود و بعد از مهاجرت کاربران حذف خواهد شد. Token یا Refresh Token نباید در Log ثبت شود.

## مراحل مهاجرت

1. تعریف DTOهای نسخه‌دار و تست Contract برای هر دو Login؛ پاسخ فعلی فقط تا پایان Cutover ثابت می‌ماند.
2. انتقال تنظیمات `Jwt:Key` به Secret/Environment و فعال‌کردن validation کامل Issuer، Audience، Lifetime و Signing Key فقط در محیط آزمایشی.
3. ساخت Session/Refresh Token به‌صورت پارامتری؛ Refresh Token در دیتابیس فقط به‌شکل Hash ذخیره شود.
4. افزودن اختیاری `auth` به پاسخ‌های فعلی و ذخیره Access Token توسط Client؛ Headerهای legacy موقتاً حفظ شوند.
5. افزودن endpointهای نسخه‌دار `POST /api/auth/v2/refresh` و `POST /api/auth/v2/logout` و Rotation اجباری Refresh Token.
6. اعمال `[Authorize]` به‌صورت Pilot روی چند endpoint کم‌ریسک و ثبت Telemetry برای Clientهای legacy.
7. مهاجرت Controllerها و حذف Headerهای legacy پس از پذیرش Client جدید؛ ادامه پشتیبانی از Client قدیمی الزام معماری نیست.

## قواعد امنیتی لازم پیش از فعال‌سازی

- Access Token کوتاه‌عمر و Refresh Token قابل ابطال و تک‌مصرف باشد.
- تمام Queryهای Login/Refresh/Logout پارامتری باشند.
- پاسخ خطای Login تفاوت «کاربر وجود ندارد» و «رمز اشتباه» را افشا نکند.
- Endpointهای Login و OTP Rate Limit داشته باشند.
- OTP فقط در Server اعتبارسنجی شود. این مورد اجرا شده است: Challenge یک‌بارمصرف، عمر ۵ دقیقه، حداکثر ۵ تلاش و عدم ارسال کد به Browser.
- فقط HTTPS در محیط‌های بیرونی مجاز باشد.
- Rollback با Feature Flag انجام شود: غیرفعال‌کردن صدور JWT نباید قرارداد `users` را تغییر دهد.

## تست پذیرش مهاجرت

- Client قدیمی با پاسخ توسعه‌یافته همچنان Login می‌کند.
- Client جدید Access Token را روی API اصلی می‌فرستد و Token برای Originهای دیگر ارسال نمی‌شود.
- Token منقضی با Refresh معتبر دقیقاً یک‌بار Rotate می‌شود.
- Logout، Session و Refresh Token را Server-side باطل می‌کند.
- 401/403 داده احراز هویت Client را پاک می‌کند.
- هیچ Password، OTP، Access Token یا Refresh Token در Log وجود ندارد.
