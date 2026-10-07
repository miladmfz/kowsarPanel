# Kowsar Collaboration Layer — P0/P1

وضعیت پیاده‌سازی: تکمیل و در محیط توسعه تأیید شده است؛ migration پایه و migration تکمیلی Direct Messaging/Notification اجرا شده‌اند و smoke دیتابیس و Realtime در ۲۰۲۶-۰۹-۲۷ عبور کرده است.

این قابلیت یک Messenger عمومی یا Mattermost embed نیست. هر Room می‌تواند مستقل یا متصل به یک Entity مانند `AutLetter`، `Customer`، `Factor`، `SupportFactor`، `LeaveRequest`، تماس سانترال یا رویداد سیستم باشد.

## قابلیت‌های تحویل‌شده

| اولویت | قابلیت | پیاده‌سازی |
|---|---|---|
| P0 | Contextual Room | `RoomType` و `LinkedEntityType/LinkedEntityCode` با workspace یکتای سراسری |
| P0 | Direct Message | Room خصوصی و یکتای دو نفره بر اساس Subjectهای احراز هویت‌شده |
| P0 | User Directory | انتخاب کاربر واقعی از ارتباط `DepartmentUser` و `Users`؛ بدون ورود دستی Subject |
| P0 | Persistent Notification | اعلان Direct/Mention/Reply/Follow/Ack در دیتابیس، Header و SignalR |
| P0 | Thread | `RootPostRef` و `ParentPostRef`، Thread panel و Follow |
| P0 | User Mention | ذخیره Mention بر اساس Subject احراز هویت |
| P0 | Read/Unread | `CollabReadState` و شمارنده Room |
| P0 | Priority | `Standard`، `Important` و `Urgent` |
| P0 | Require Acknowledgement | Ack اتمیک، شمارنده و SignalR محدود به Room |
| P0 | Interactive Action Card | actionهای allow-listed از نوع `Acknowledge`، `OpenRoute` و `InternalEvent` با ثبت idempotent execution |
| P0 | Attachment | فایل ۱ بایت تا ۱۰ MB، نام امن، SHA-256، MIME allow-list و دانلود فقط برای Member |
| P1 | Group Mention | `CollabUserGroup`، member، endpoint و پنل مدیریت گروه |
| P1 | Pin/Bookmark | Room resource bar، bookmark متصل به Room/Post و محدودسازی URL به HTTP(S)/مسیر داخلی |
| P1 | Advanced Search | متن، Room، نویسنده، بازه تاریخ و `HasAttachment` با membership filtering |
| P1 | Reminder | یادآوری شخصی و push از worker به SignalR user group |
| P1 | Scheduled Message | انتشار توسط worker و push به Room/memberها |
| P1 | Playbook/Run | Template، Step، Run، RunStep، Room اختصاصی و تغییر وضعیت مرحله |
| P1 | Webhook/Event | event publish، rule با `EventPattern`، پنل مدیریت، system actor، queue، lease اتمیک، retry نمایی و idempotency |
| P1 | Bot/System Actor | `ActorType` مستقل از User؛ Eventها با System actor ثبت می‌شوند |

## مرز امنیتی

هر عملیات با این چهار لایه محدود می‌شود:

1. JWT معتبر؛
2. permission فعلی Kowsar؛
3. عضویت Subject در Room به‌عنوان مرز دسترسی گفتگو؛
4. محدودیت permission برای عملیات مدیریتی.

`CentralRef` در دیتابیس فعلی شناسه هر کاربر است و tenant مشترک نیست؛ بنابراین دیگر برای فیلتر اعضای یک Room استفاده نمی‌شود. مقدار آن برای سازگاری قراردادهای legacy، audit و integration حفظ شده است.

Frontend صرفاً UX را محدود می‌کند و منبع تصمیم امنیتی Backend است. Action Card نمی‌تواند نام Stored Procedure یا SQL دلخواه دریافت کند. افزودن action تجاری جدید باید به handler allow-listed در Backend متصل شود.

Permissionهای migration:

- `Collaboration.View`
- `Collaboration.Room.Create`
- `Collaboration.Room.Manage`
- `Collaboration.Post.Create`
- `Collaboration.Post.EditOwn`
- `Collaboration.Post.DeleteOwn`
- `Collaboration.Post.Moderate`
- `Collaboration.Playbook.View`
- `Collaboration.Playbook.Manage`
- `Collaboration.Playbook.Run`
- `Collaboration.Integration.Manage`
- `Collaboration.Admin`

Role `ADMIN` و permission `Collaboration.Admin` bypass مدیریتی دارند. پس از assign کردن permissionها، کاربر باید sign out/sign in کند تا claimهای JWT تازه شوند.
Migration تکمیلی، فقط `Collaboration.View` و `Collaboration.Post.Create` را به Roleهای فعال می‌دهد تا همه کاربران داخلی بتوانند پیام مستقیم بفرستند؛ permissionهای ساخت/مدیریت Room، Playbook و Integration همچنان صریح و مدیریتی باقی می‌مانند.

## Runtime configuration

Webhook به‌صورت پیش‌فرض outbound نیست. فقط hostهای HTTPS که در Runtime Config مجاز شده‌اند قابل ثبت و ارسال هستند:

```json
{
  "Collaboration": {
    "AllowedWebhookHosts": [
      "hooks.example.test"
    ]
  }
}
```

این مقدار باید در `appsettings.Runtime.json`، فایل معرفی‌شده با `KITS_CONFIG_PATH` یا environment-specific config قرار گیرد. URL یا secret واقعی نباید commit شود. Payload webhook شامل secret نیست و timeout آن ۱۰ ثانیه است؛ خطا حداکثر پنج مرتبه با backoff retry می‌شود.

## استقرار دیتابیس

فایل migration:

`webapikits/Database/Migrations/20260924_Collaboration_P0_P1.sql`

پس از آن migration تکمیلی Direct Messaging و Notification را اجرا کنید:

`webapikits/Database/Migrations/20260926_Collaboration_DirectMessaging.sql`

فایل grant و verification پس از migration:

`webapikits/Database/Migrations/20260924_Collaboration_P0_P1_PostDeploy.sql`

در فایل Post-Deploy مقدارهای `@RoleName` و `@AccessProfile` را آگاهانه انتخاب کنید. Profileهای مجاز `Viewer`، `Member`، `Manager` و `Admin` هستند. این اسکریپت در `CentralRole` تغییری ایجاد نمی‌کند و فقط permissionهای Collaboration را به Role موجود متصل می‌کند.

پیش از اجرا:

1. مقدار واقعی `Kowsar_Connection` محیط مقصد را کنترل کنید.
2. با `SELECT DB_NAME()` مطمئن شوید مقصد همان دیتابیس عملیاتی موردنظر است.
3. backup معتبر بگیرید.
4. ابتدا migration پایه و سپس migration تکمیلی را با حساب migration اجرا کنید؛ هر دو idempotent هستند.
5. وجود جدول‌های `Collab*` و procedureهای `spCollab_*` را کنترل کنید.
6. permissionها را از صفحه RBAC یا اسکریپت Post-Deploy به Roleهای مناسب assign کنید.
7. Backend و Frontend را deploy و کاربران را وادار به login مجدد کنید.

Preflight فقط‌خواندنی ۲۰۲۶-۰۹-۲۴ روی instance توسعه، مقصد را `MaliKowsar99` و تعداد objectهای فعلی Collaboration را صفر تأیید کرد. آخرین Full Backup ثبت‌شده در `msdb` مربوط به `2026-09-13 14:45:00` بود؛ بنابراین پیش از نصب باید Full Backup تازه و قابل‌بازیابی گرفته شود.

Release gate همان روز با `135/135` تست Angular، `206/206` تست Backend، buildهای Production/Release و vulnerability audit بدون مورد آسیب‌پذیر عبور کرد. Smoke موقت روی `60007` نیز `health/live` و `health/ready` را `200`، دسترسی ناشناس به API و Hub را `401` و فعال‌شدن rate limit مسیر SMS را `429` تأیید کرد؛ instance موقت پس از تست متوقف شد و سرویس `60006` دست‌نخورده باقی ماند.

Migration دارای rollback خودکار destructive نیست؛ حذف جدول‌ها بعد از تولید داده باید با backup و برنامه نگهداری مستقل انجام شود.

Checkpoint نهایی محیط توسعه در ۲۰۲۶-۰۹-۲۷:

- مقصد با `SELECT DB_NAME()` برابر `MaliKowsar99` تأیید شد.
- ۲۳ جدول و ۵ Procedure از Collaboration، `DirectKey`، جدول Notification، Indexهای Direct/Notification و ۱۲ Permission وجود دارند.
- هر ۱۰ Role فعال دارای `Collaboration.View` و `Collaboration.Post.Create` است؛ grant مفقود صفر بود.
- یک Direct Room یکتا با دقیقاً دو عضو، دو Post و دو Notification پایدار بررسی شد؛ self-notification و نویسنده/گیرنده خارج از عضویت صفر بود.
- دسترسی کاربر سوم به Postهای Direct Room با خطای امنیتی `51001` رد شد.
- اتصال SignalR با transport اجباری WebSocket روی Backend موقت `60008` برقرار شد و instance موقت پس از تست متوقف شد؛ `60006` و `60007` متوقف نشدند.
- تست‌های متمرکز Angular Collaboration شامل رفتار صفحه در send/reload، پاسخ stale، unread/realtime و reconnect برابر `15/15` موفق بود.

## API و Realtime

Base route: `/api/Collaboration`

Endpointهای اصلی:

- `GET/POST rooms`
- `GET users` و `POST direct`
- `POST rooms/{roomCode}/members|mute|read`
- `GET/POST rooms/{roomCode}/posts`
- `POST posts/{postCode}/acknowledge|follow|reminders|attachments`
- `POST posts/{postCode}/actions/{actionCode}/execute`
- `GET rooms/{roomCode}/bookmarks` و `POST` همان route
- `GET search`
- `GET notifications` و read/read-all
- `GET/POST groups`
- `GET/POST playbooks`
- `GET runs`، start run و update run step
- `GET/POST integrations`
- `POST events`

SignalR hub: `/hubs/collaboration`

Eventهای client:

- `PostCreated`
- `TypingChanged`
- `RoomReadChanged`
- `RoomUnreadChanged`
- `MessageAcknowledged`
- `ReminderDue`
- `RunUpdated`
- `NotificationCreated`
- `RoomChanged`

## Smoke test پس از نصب migration

با JWT کاربر دارای permission:

1. پس از اجرای migration، یک بار sign out/sign in کنید تا permissionهای JWT تازه شوند.
2. `GET /api/Collaboration/users` و `GET /api/Collaboration/rooms` باید `200` بدهند.
3. از دکمه «پیام مستقیم جدید» کاربر دوم را انتخاب کنید؛ هر دو کاربر باید همان Room یکتای Direct را دریافت کنند.
4. با کاربر سوم، دسترسی به همان Room/Post باید رد شود.
5. یک پیام مستقیم بفرستید؛ badge Header و فهرست اعلان کاربر دوم باید به‌صورت realtime به‌روز شود و با باز کردن Room خوانده شود.
6. یک Room عمومی بسازید و عضو دوم را از فهرست کاربران اضافه کنید.
7. پیام Standard، Urgent+Ack، Mention، Thread reply و پیام زمان‌بندی‌شده بسازید.
8. پیوست مجاز زیر ۱۰ MB ارسال و با همان عضو دانلود کنید؛ دانلود کاربر غیرعضو باید رد شود.
9. Read/Ack/Follow/Reminder و Search را کنترل کنید.
10. درخواست بدون JWT باید `401` و درخواست بدون permission باید `403` بگیرد.

## محدودیت آگاهانه P0/P1

- AI Summary، semantic search، Presence/DND و Guest collaboration در P2/P3 هستند.
- تماس صوتی/تصویری و Boards در scope نیستند؛ Direct Message خصوصی تحویل شده است.
- search فعلی Collaboration permission-aware است؛ اتصال آن به Unified Search سراسری KowsarHub مرحله بعدی است.
