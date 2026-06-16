import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {

  private readonly hasWindow =
    typeof window !== 'undefined';

  // ======================================================
  // Object / Array
  // ======================================================

  getItem<T>(key: string): T | null {

    if (!this.hasWindow) return null;

    try {

      const value = localStorage.getItem(key);

      return value
        ? JSON.parse(value) as T
        : null;

    } catch (err) {

      console.error(
        `[LocalStorage] getItem error for key "${key}":`,
        err
      );

      return null;
    }
  }

  setItem<T>(key: string, value: T): void {

    if (!this.hasWindow) return;

    try {

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

    } catch (err) {

      console.error(
        `[LocalStorage] setItem error for key "${key}":`,
        err
      );
    }
  }

  exists(key: string): boolean {

    if (!this.hasWindow) return false;

    return localStorage.getItem(key) !== null;
  }

  removeItem(key: string): void {

    if (!this.hasWindow) return;

    localStorage.removeItem(key);
  }

  clear(): void {

    if (!this.hasWindow) return;

    localStorage.clear();
  }
}