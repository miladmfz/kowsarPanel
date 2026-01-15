import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  /** 🔹 وضعیت منوی کناری (باز/بسته) */
  private sidebarState = new BehaviorSubject<boolean>(false);
  sidebarState$ = this.sidebarState.asObservable();

  /** 🔹 وضعیت تم (روشن/تیره) */
  private themeMode = new BehaviorSubject<'light' | 'dark'>('light');
  themeMode$ = this.themeMode.asObservable();

  /** 🔹 پیام‌های اشتراکی (برای هماهنگی بین کامپوننت‌ها) */
  private messageSource = new BehaviorSubject<string>('');
  message$ = this.messageSource.asObservable();

  /** 🔹 داده موقت برای انتقال بین صفحات */
  private tempData: any = null;

  /** 🔁 رویدادهای عمومی (مثل Refresh) بین بخش‌های مختلف برنامه */
  private refreshAllActionsSource = new Subject<string>();
  RefreshAllActions$ = this.refreshAllActionsSource.asObservable();

  constructor() { }

  // === 🧭 Sidebar ===
  toggleSidebar(): void {
    this.sidebarState.next(!this.sidebarState.value);
  }

  setSidebarState(isOpen: boolean): void {
    this.sidebarState.next(isOpen);
  }

  // === 🎨 Theme ===
  setTheme(mode: 'light' | 'dark'): void {
    this.themeMode.next(mode);
    localStorage.setItem('theme', mode);
  }

  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  }

  // === 💬 Message ===
  sendMessage(message: string): void {
    this.messageSource.next(message);
  }

  clearMessage(): void {
    this.messageSource.next('');
  }

  // ===   Temp data storage ===
  setTempData(data: any): void {
    this.tempData = data;
  }

  getTempData<T = any>(): T | null {
    return this.tempData;
  }

  clearTempData(): void {
    this.tempData = null;
  }

  // === 🔁 Refresh Action ===
  /** 🔔 ارسال رویداد رفرش به سایر کامپوننت‌ها */
  triggerRefresh(action: string = 'refresh'): void {
    this.refreshAllActionsSource.next(action);
  }
  private actionTrigger = new Subject<string>();
  actionTriggered$ = this.actionTrigger.asObservable();

  triggerActionAll(action: string) {
    this.actionTrigger.next(action);
  }

}
