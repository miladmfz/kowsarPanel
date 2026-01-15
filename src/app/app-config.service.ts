import { inject, Injectable } from '@angular/core';

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
            console.log('  App config loaded:', this.config);
        } catch (err) {
            console.error('❌ Error loading config.json:', err);
        }
    }

    /**   دریافت آدرس API اصلی */
    get apiUrl(): string {
        return this.config?.api_Url ?? '';
    }
    get AppVersion(): string {
        return this.config?.AppVersion ?? '';
    }

    /**   دریافت تمام تنظیمات */
    get all(): any {
        return this.config;
    }
}
