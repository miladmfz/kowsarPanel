/**
 * ⚡ ag-grid-memory-cache.service.ts
 * ---------------------------------
 * کش درون‌حافظه‌ای برای نگهداری داده‌های موقت گریدها.
 * داده‌ها به ازای هر childName ذخیره می‌شوند.
 */

import { inject, Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class AgGridMemoryCacheService {
    private cache = new Map<string, any>();

    /** 🧠 ذخیره داده */
    setCache(key: string, data: any): void {
        this.cache.set(key, data);
    }

    /**   دریافت داده */
    getCache<T>(key: string): T | null {
        return this.cache.get(key) ?? null;
    }

    /** ❌ حذف کش خاص */
    clearCache(key: string): void {
        this.cache.delete(key);
    }

    /** 🧹 پاک‌سازی کل حافظه */
    clearAll(): void {
        this.cache.clear();
    }

    /**   بررسی وجود کش */
    hasCache(key: string): boolean {
        return this.cache.has(key);
    }
}
