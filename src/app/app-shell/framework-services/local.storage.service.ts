import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {
  getItem(name: string): string {
    return JSON.parse(sessionStorage.getItem(name));
  }

  setItem(name: string, value: string): void {
    if (this.exists(name)) this.removeItem(name);

    sessionStorage.setItem(name, JSON.stringify(value));
  }

  exists(name: string): boolean {
    if (this.getItem(name) == null) return false;
    return true;
  }

  removeItem(name: string): void {
    sessionStorage.removeItem(name);
  }
}
