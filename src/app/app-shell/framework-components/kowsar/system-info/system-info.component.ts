import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

interface KeyValueItem {
  key: string;
  value: string;
}

interface InfoCard {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
}

interface ListItem {
  title: string;
  description: string;
  icon: string;
  color?: string;
}

interface RouteItem {
  path: string;
  module: string;
  description: string;
  lazy: string;
}

@Component({
  selector: 'app-system-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-info.component.html',
  styleUrl: './system-info.component.css'
})
export class SystemInfoComponent implements OnInit {

  config: any = null;

  infoCards: InfoCard[] = [
    {
      title: 'Framework',
      value: 'Angular 20.3.7',
      subtitle: 'Standalone + Zoneless Ready',
      icon: 'mdi mdi-angular',
      color: 'danger'
    },
    {
      title: 'Language',
      value: 'TypeScript 5.8.3',
      subtitle: 'Strict Component Architecture',
      icon: 'mdi mdi-language-typescript',
      color: 'primary'
    },
    {
      title: 'Architecture',
      value: 'Lazy Routes',
      subtitle: 'Standalone Components',
      icon: 'mdi mdi-source-branch',
      color: 'purple'
    },
    {
      title: 'UI Framework',
      value: 'Minton RTL',
      subtitle: 'Bootstrap Admin Template',
      icon: 'mdi mdi-bootstrap',
      color: 'indigo'
    }
  ];

  projectInfo: KeyValueItem[] = [
    { key: 'Project Name', value: 'KowsarPanel' },
    { key: 'Package Name', value: 'news' },
    { key: 'Entry Point', value: 'src/main.ts' },
    { key: 'Main Routing', value: 'src/app/app.routes.ts' },
    { key: 'Runtime Config', value: 'src/assets/config.json' },
    { key: 'Build Output', value: 'dist/' },
    { key: 'Architecture Type', value: 'Standalone + Lazy Loading' },
    { key: 'UI Direction', value: 'RTL / Persian Ready' }
  ];

  modules: ListItem[] = [
    {
      title: 'Accounting',
      description: 'فروش، خرید، خزانه، حسابداری، گزارشات، تعاریف پایه، تنظیمات و حقوق و دستمزد',
      icon: 'mdi mdi-calculator-variant-outline',
      color: 'blue'
    },
    {
      title: 'Automation',
      description: 'نامه‌ها، مرخصی، کارمندان، ماه‌های حقوقی، خلاصه حقوق و فرآیندهای اداری',
      icon: 'mdi mdi-file-document-edit-outline',
      color: 'green'
    },
    {
      title: 'Module',
      description: 'Broker App، Order App، OCR App و سرویس‌های مرتبط با اپلیکیشن‌های اندرویدی',
      icon: 'mdi mdi-android',
      color: 'purple'
    },
    {
      title: 'Internal',
      description: 'گزارش‌های داخلی، WorkItem، وب‌سایت‌ها، اپلیکیشن‌ها، حضور و غیاب و ابزارهای شرکت',
      icon: 'mdi mdi-office-building-outline',
      color: 'orange'
    },
    {
      title: 'Menu Online',
      description: 'منوی آنلاین، Basket، سفارش‌گیری، Repository سفارشات و تنظیمات ظاهری منو',
      icon: 'mdi mdi-cart-outline',
      color: 'pink'
    },
    {
      title: 'Auth Kowsar',
      description: 'Login، Register، Change Password و Route جداگانه احراز هویت',
      icon: 'mdi mdi-shield-account-outline',
      color: 'dark'
    }
  ];

  architecture: ListItem[] = [
    {
      title: 'App Shell',
      description: 'Layout، Header، Sidebar، Toolbar، Footer، Dashboard و NotFound',
      icon: 'mdi mdi-application-brackets-outline'
    },
    {
      title: 'Framework Components',
      description: 'AG Grid Base/API/Core/Export/State، Renderers، Tools، D3 Org Chart و Shared Components',
      icon: 'mdi mdi-view-grid-plus-outline'
    },
    {
      title: 'Framework Services',
      description: 'AuthGuard، Interceptors، Storage، Base Services، UI Services، Utility و Shared Services',
      icon: 'mdi mdi-cog-transfer-outline'
    },
    {
      title: 'Features',
      description: 'ماژول‌های مستقل برنامه شامل Accounting، Automation، Internal، Module و Menu Online',
      icon: 'mdi mdi-puzzle-outline'
    }
  ];

  routes: RouteItem[] = [
    { path: '/auth', module: 'Auth Kowsar', description: 'ورود، ثبت نام و تغییر رمز', lazy: 'loadChildren' },
    { path: '/menu', module: 'Menu Online', description: 'منوی آنلاین مشتری/رستوران', lazy: 'loadChildren' },
    { path: '/dashboard', module: 'Dashboard', description: 'داشبورد اصلی بعد از ورود', lazy: 'loadComponent' },
    { path: '/accounting', module: 'Accounting', description: 'ماژول‌های حسابداری', lazy: 'loadChildren' },
    { path: '/automation', module: 'Automation', description: 'اتوماسیون اداری', lazy: 'loadChildren' },
    { path: '/module', module: 'Module', description: 'ماژول‌های اندرویدی', lazy: 'loadChildren' },
    { path: '/internal', module: 'Internal', description: 'ابزارها و گزارش‌های داخلی', lazy: 'loadChildren' },
    { path: '/showtree', module: 'Project Tree', description: 'نمایش ساختار فایل‌ها و پوشه‌ها', lazy: 'loadComponent' },
    { path: '/system-info', module: 'System Info', description: 'مستندات فنی داخل برنامه', lazy: 'loadComponent' }
  ];

  buildProfiles: KeyValueItem[] = [
    { key: 'local', value: 'dist/local - baseHref: /' },
    { key: 'itmali', value: 'dist/KowsarPanel - baseHref: /KowsarPanel/' },
    { key: 'itmaliIp', value: 'dist/KowsarPanelIp - baseHref: /KowsarPanelIp/' },
    { key: 'qoqnooscoffee', value: 'dist/qoqnooscoffee - baseHref: /qoqnooscoffee/' }
  ];

  importantFiles: KeyValueItem[] = [
    { key: 'src/main.ts', value: 'Bootstrap اصلی برنامه و ثبت Providerها' },
    { key: 'src/app/app.routes.ts', value: 'Routing اصلی و Lazy Routes' },
    { key: 'src/assets/config.json', value: 'تنظیمات Runtime فعال' },
    { key: 'src/assets/configs/', value: 'تنظیمات محیط‌های مختلف' },
    { key: 'build.js', value: 'اسکریپت Build چندمحیطی' },
    { key: 'build.profiles.json', value: 'تعریف Profileهای Build' },
    { key: 'build-holidays.mjs', value: 'تولید فایل تعطیلات شمسی' },
    { key: 'src/assets/tree/project-structure-paths.txt', value: 'منبع نمایش Tree پروژه در /showtree' }
  ];

  services: ListItem[] = [
    {
      title: 'SecurityInterceptor',
      description: 'مدیریت Token و موارد امنیتی درخواست‌ها',
      icon: 'mdi mdi-shield-lock-outline'
    },
    {
      title: 'ExceptionInterceptor',
      description: 'مدیریت خطاهای API و پاسخ‌های ناموفق',
      icon: 'mdi mdi-alert-circle-outline'
    },
    {
      title: 'AppConfigService',
      description: 'خواندن config.json و ارائه apiUrl، MenuapiUrl، appVersion و تنظیمات منو',
      icon: 'mdi mdi-file-cog-outline'
    },
    {
      title: 'Storage Services',
      description: 'مدیریت LocalStorage، SessionStorage و Permissionها',
      icon: 'mdi mdi-database-outline'
    },
    {
      title: 'UI Services',
      description: 'Loading، Notification، Swal و Theme Service',
      icon: 'mdi mdi-palette-outline'
    }
  ];

  dependencies: KeyValueItem[] = [
    { key: '@angular/*', value: 'هسته Angular' },
    { key: 'ag-grid-angular / enterprise', value: 'جدول‌های پیشرفته' },
    { key: 'bootstrap', value: 'Layout و UI پایه' },
    { key: 'sweetalert2', value: 'Dialog و پیام‌ها' },
    { key: 'd3 / d3-org-chart', value: 'نمودار و چارت سازمانی' },
    { key: 'jalali-moment / jalaali-js', value: 'تاریخ شمسی' },
    { key: 'socket.io-client', value: 'Realtime Communication' },
    { key: 'leaflet', value: 'Map' },
    { key: 'xml-js', value: 'XML Processing' },
    { key: 'ngx-papaparse', value: 'CSV Processing' }
  ];

  developmentNotes: string[] = [
    'Route فعال پروژه در app.routes.ts است، نه app-routing.module.ts.',
    'اکثر صفحات باید به صورت Standalone و Lazy Load ساخته شوند.',
    'برای UI بهتر است از کلاس‌ها و Componentهای Minton استفاده شود.',
    'config.json به صورت Runtime خوانده می‌شود و بهتر است دستی تغییر نکند.',
    'برای Feature جدید، ساختار features/<feature>/components/services/models رعایت شود.',
    'در صورت اضافه کردن Route جدید، بهتر است title و مسیر آن در system-info هم ثبت شود.',
    'برای مشاهده ساختار کلی پروژه از مسیر /showtree استفاده شود.'
  ];

  async ngOnInit(): Promise<void> {
    await this.loadConfig();
  }

  async loadConfig(): Promise<void> {
    try {
      const response = await fetch('/assets/config.json?v=' + Date.now(), {
        cache: 'no-store'
      });

      if (response.ok) {
        this.config = await response.json();
      }
    } catch (error) {
      console.warn('[SystemInfo] config load failed:', error);
    }
  }

  get appVersion(): string {
    return this.config?.appVersion ?? 'Not Loaded';
  }

  get apiUrl(): string {
    return this.config?.apiUrl ?? 'Not Loaded';
  }

  get menuApiUrl(): string {
    return this.config?.MenuapiUrl ?? 'Not Loaded';
  }

  openProjectTree(): void {
    window.location.href = '/showtree';
  }
}