# KowsarPanel

پنل تحت وب کوثر برای مدیریت ماژول‌های حسابداری، اتوماسیون، اپلیکیشن‌های اندرویدی، ابزارهای داخلی شرکت و منوی آنلاین.

---

## Tech Stack

- Angular 20
- TypeScript 5.8
- Standalone Components
- Lazy Loading Routes
- Bootstrap + Minton RTL
- AG Grid Enterprise
- D3 / D3 Org Chart
- Socket.IO
- Jalali Calendar Libraries

---

## Run Project

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm start
```

or

```bash
ng serve
```

Default URL:

```txt
http://localhost:4200
```

---

## Architecture

```txt
src/
├── app/
│   ├── app-shell/
│   ├── auth-kowsar/
│   └── features/
├── assets/
├── environment/
└── main.ts
```

### Core Layers

- App Shell
- Framework Components
- Framework Services
- Features
- Runtime Config

---

## Main Modules

### Accounting
Accounting, Sales, Purchase, Treasury, Reports, Payroll

### Automation
Letters, Leave Requests, Employees, Payroll

### Module
Broker App, OCR App, Order App

### Internal
Internal Tools, Reports, Websites, WorkItems

### Menu Online
Online Menu, Basket, Orders, Customer Interface

### Authentication
Login, Register, Change Password

---

## Routing

Main routing file:

```txt
src/app/app.routes.ts
```

Main routes:

```txt
/auth
/menu
/dashboard
/accounting
/automation
/module
/internal
```

---

## Runtime Configuration

Configuration is loaded from:

```txt
src/assets/config.json
```

Environment profiles:

```txt
src/assets/configs/
```

Important settings:

- apiUrl
- MenuapiUrl
- appVersion
- baseHref
- menuConfig
- menuTheme

---

## Build

Build application:

```bash
npm run build
```

Available profiles:

```bash
npm run build:local
npm run build:itmali
npm run build:itmaliIp
npm run build:qoqnooscoffee
```

Build all profiles:

```bash
npm run all
```

---

## Developer Tools

After running the project:

### Project Structure

```txt
/showtree
```

Interactive tree view of files and folders.

### System Documentation

```txt
/system-info
```

Technical documentation, architecture, routes, services, configuration and development information.

---

## Important Files

```txt
src/main.ts
src/app/app.routes.ts
src/assets/config.json
build.js
build.profiles.json
build-holidays.mjs
```

---

## Development Notes

- Project uses Standalone Architecture.
- Routing is managed through `app.routes.ts`.
- Most pages are Lazy Loaded.
- Runtime configuration is loaded from `config.json`.
- Prefer existing Minton components and styles.
- Avoid unnecessary third-party dependencies.
- New features should follow:

```txt
features/
└── feature-name/
    ├── components/
    ├── services/
    ├── models/
    └── feature.routes.ts
```

---

## Company

KowsarPanel is developed and maintained as part of the Kowsar Software Ecosystem.