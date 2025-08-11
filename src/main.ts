import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';

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

    platformBrowserDynamic([{ provide: 'APP_CONFIG', useValue: config }])
      .bootstrapModule(AppModule)
      .catch(err => console.error('Bootstrap error:', err));
  })
  .catch(err => {
    console.error('Could not load config.json:', err);
  });
