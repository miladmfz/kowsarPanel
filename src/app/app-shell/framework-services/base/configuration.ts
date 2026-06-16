import { Injectable } from '@angular/core';


/**
 * 🔧 ساختار تنظیمات عمومی برنامه
 */
export interface AppConfiguration {
    apiUrl: string;
    version: string;
    appTitle: string;
    environment: 'development' | 'staging' | 'production';
    defaultLanguage: string;
    retryCount: number;
    logEnabled: boolean;
}

/**
 *   مقادیر ثابت (Global Constants)
 */
export const ACCESS_TOKEN_NAME = '*&^%*((())$';
export const PERMISSIONS_NAME = '%%%%%%%%%%';

/**
 *   سرویس مدیریت تنظیمات برنامه
 * Singleton service - در کل برنامه فقط یک بار ساخته می‌شود.
 */
@Injectable({
    providedIn: 'root',
})
export class ConfigurationService {
    private readonly config: AppConfiguration = {
        apiUrl: 'https://api.kowsarsoft.ir/api/', // مسیر پایه API
        version: '2.0.0',
        appTitle: 'Kowsar Accounting Suite',
        environment: 'development',
        defaultLanguage: 'fa',
        retryCount: 3,
        logEnabled: true,
    };

    /** برگرداندن کل تنظیمات */
    getConfig(): AppConfiguration {
        return this.config;
    }

    /** دریافت مقدار خاص از تنظیمات */
    get<K extends keyof AppConfiguration>(key: K): AppConfiguration[K] {
        return this.config[key];
    }

    /** تغییر مقدار خاص از تنظیمات در زمان اجرا */
    set<K extends keyof AppConfiguration>(key: K, value: AppConfiguration[K]): void {
        (this.config[key] as AppConfiguration[K]) = value;
    }

    /** بررسی محیط جاری */
    isProduction(): boolean {
        return this.config.environment === 'production';
    }

    /** بررسی فعال بودن لاگ */
    loggingEnabled(): boolean {
        return this.config.logEnabled;
    }
}
