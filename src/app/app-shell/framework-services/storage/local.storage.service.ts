import { inject, Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly hasWindow = typeof window !== 'undefined';

  // 🔹 Session Storage -----------------------------------------------------

  /** دریافت مقدار از sessionStorage */
  getItem<T>(key: string): T | null {
    if (!this.hasWindow) return null;
    try {
      const value = sessionStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (err) {
      console.error(`[SessionStorage] getItem error for key "${key}":`, err);
      return null;
    }
  }

  /** ذخیره مقدار در sessionStorage */
  setItem<T>(key: string, value: T): void {
    if (!this.hasWindow) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`[SessionStorage] setItem error for key "${key}":`, err);
    }
  }

  /** بررسی وجود کلید */
  exists(key: string): boolean {
    if (!this.hasWindow) return false;
    return sessionStorage.getItem(key) !== null;
  }

  /** حذف کلید خاص */
  removeItem(key: string): void {
    if (!this.hasWindow) return;
    sessionStorage.removeItem(key);
  }

  /** پاک کردن کامل sessionStorage */
  clear(): void {
    if (!this.hasWindow) return;
    sessionStorage.clear();
  }
}
