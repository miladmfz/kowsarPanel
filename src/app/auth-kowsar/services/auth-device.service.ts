import { Injectable } from '@angular/core';

const DEVICE_ID_KEY = 'kowsar.device_id';

@Injectable({ providedIn: 'root' })
export class AuthDeviceService {
  get deviceId(): string {
    if (typeof window === 'undefined') return 'server-rendering';

    const existing = localStorage.getItem(DEVICE_ID_KEY)?.trim();
    if (existing) return existing;

    const generated = typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, generated);
    return generated;
  }
}
