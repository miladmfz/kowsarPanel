import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
    private config: any = {};
    constructor(private http: HttpClient) { }

    /**   لود تنظیمات از فایل config.json */
    async loadConfig(): Promise<void> {
        try {
            this.config = await firstValueFrom(this.http.get('./assets/config.json'));

        } catch (err) {
            console.error('❌ Error loading config.json:', err);
        }
    }

    /**   دریافت آدرس API اصلی */
    get apiUrl(): string {
        return this.config?.apiUrl ?? '';
    }

    get MenuapiUrl(): string {
        return this.config?.MenuapiUrl ?? '';
    }


    get AppVersion(): string {
        return this.config?.appVersion ?? '';
    }
    get menuConfig() {
        return this.config.menuConfig;
    }

    get menuTheme() {
        return this.config.menuTheme;
    }


    /**   دریافت تمام تنظیمات */
    get all(): any {
        return this.config;
    }



}
