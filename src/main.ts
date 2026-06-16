import { enableProdMode, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withRouterConfig } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

import { SecurityInterceptor } from './app/app-shell/framework-services/interceptors/security.interceptor.service';
import { ExceptionInterceptor } from './app/app-shell/framework-services/interceptors/exception.interceptor.service';

import { AppConfigService } from './app/app-config.service';

import { ModuleRegistry } from 'ag-grid-community';
import {
  AllCommunityModule,
  AllEnterpriseModule,
  LicenseManager,
} from 'ag-grid-enterprise';

// ✔ مجوز AG-Grid
LicenseManager.setLicenseKey("MjAwMDAwMDAwMDAwMA==5a5ea3be8a8aaa9b54ce7186663066431");
ModuleRegistry.registerModules([
  AllCommunityModule,
  AllEnterpriseModule,
]);

// import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// ModuleRegistry.registerModules([
//   AllCommunityModule,
// ]);

// 🌗 تم اولیه
function applyInitialTheme() {
  const mode = localStorage.getItem('theme') || 'light';

  const lightCss = [
    document.getElementById('bs-default-stylesheet') as HTMLLinkElement,
    document.getElementById('app-default-stylesheet') as HTMLLinkElement,
  ].filter(Boolean);

  const darkCss = [
    document.getElementById('bs-dark-stylesheet') as HTMLLinkElement,
    document.getElementById('app-dark-stylesheet') as HTMLLinkElement,
  ].filter(Boolean);

  if (mode === 'light') {
    lightCss.forEach(l => (l.disabled = false));
    darkCss.forEach(l => (l.disabled = true));
  } else {
    lightCss.forEach(l => (l.disabled = true));
    darkCss.forEach(l => (l.disabled = false));
  }

  document.documentElement.setAttribute('data-bs-theme', mode);
  document.documentElement.setAttribute('data-layout-color', mode);
  document.body?.setAttribute('data-layout-color', mode);
}

// ⭐ لود تنظیمات برنامه + Bootstrap Angular
fetch('./assets/config.json')
  .then(async response => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const config = await response.json();

    const appConfig = new AppConfigService({} as any);
    appConfig['config'] = config;

    if (config.production) enableProdMode();

    applyInitialTheme();

    await bootstrapApplication(AppComponent, {
      providers: [

        // ⭐ نسخه رسمی و بدون deprecated
        provideRouter(
          routes,
          withRouterConfig({
            // اگر navigate به همان آدرس (با پارامتر متفاوت) باشد
            // کامپوننت را مجدداً reload می‌کند
            onSameUrlNavigation: 'reload',
          })
        ),


        provideHttpClient(
          withInterceptors([SecurityInterceptor, ExceptionInterceptor]),
          withFetch()
        ),

        { provide: AppConfigService, useValue: appConfig },

        importProvidersFrom(CommonModule, HttpClientModule),

        // 🔥 مهم: چون بدون Zone کار می‌کنی، tooling درست فعال می‌شود
        provideZonelessChangeDetection(),
      ],
    });

  })
  .catch(err => console.error('❌ Could not load config.json:', err));
