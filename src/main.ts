import { ErrorHandler, enableProdMode, importProvidersFrom, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withRouterConfig } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

import { SecurityInterceptor } from './app/app-shell/framework-services/interceptors/security.interceptor.service';
import { ExceptionInterceptor } from './app/app-shell/framework-services/interceptors/exception.interceptor.service';

import { AppConfigService } from './app/app-config.service';
import { configureProductionConsole } from './app/app-shell/framework-services/logging/production-console';
import { KowsarGlobalErrorHandler } from './app/app-shell/framework-services/logging/browser-error-monitoring.service';

import { provideServiceWorker } from '@angular/service-worker';

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
fetch('./assets/config.json', { cache: 'no-store', credentials: 'same-origin' })
  .then(async response => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const config = await response.json();

    const appConfig = new AppConfigService();
    appConfig.initialize(config);

    configureProductionConsole(appConfig.all.production);

    if (appConfig.all.production) enableProdMode();

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
        { provide: ErrorHandler, useClass: KowsarGlobalErrorHandler },

        importProvidersFrom(CommonModule, HttpClientModule),

        // 🔥 مهم: چون بدون Zone کار می‌کنی، tooling درست فعال می‌شود
        provideZonelessChangeDetection(), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
      ],
    });

  })
  .catch(err => console.error('❌ Could not load config.json:', err));
