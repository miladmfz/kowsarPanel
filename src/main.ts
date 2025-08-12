import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';

function applyInitialTheme() {
  const mode = localStorage.getItem('theme') || 'light';

  const lightCss = [
    document.getElementById('bs-default-stylesheet') as HTMLLinkElement,
    document.getElementById('app-default-stylesheet') as HTMLLinkElement
  ].filter(el => el !== null);

  const darkCss = [
    document.getElementById('bs-dark-stylesheet') as HTMLLinkElement,
    document.getElementById('app-dark-stylesheet') as HTMLLinkElement
  ].filter(el => el !== null);

  if (mode === 'light') {
    lightCss.forEach(l => l.disabled = false);
    darkCss.forEach(l => l.disabled = true);
  } else {
    lightCss.forEach(l => l.disabled = true);
    darkCss.forEach(l => l.disabled = false);
  }
}

fetch(`./assets/config.json`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(config => {
    if (config.production) {
      enableProdMode();
    }

    applyInitialTheme();  // <<< اینجا قبل از بوت‌استرپ تم رو ست می‌کنیم

    platformBrowserDynamic([{ provide: 'APP_CONFIG', useValue: config }])
      .bootstrapModule(AppModule)
      .catch(err => console.error('Bootstrap error:', err));
  })
  .catch(err => {
    console.error('Could not load config.json:', err);
  });
