import { inject, Injectable } from '@angular/core';

import { NotificationService } from '../ui/notification.service';
import { SessionStorageService } from './session.storage.service';

@Injectable({
  providedIn: 'root'
})
export class AgGridStateService {
  protected readonly session = inject(SessionStorageService);
  protected readonly notificationService = inject(NotificationService);
  constructor() { }

  private makeStorageName(name: string): string {
    return `${name}_colState`;
  }

  saveState(gridColumnApi: any, name: string): void {
    const colState = JSON.stringify(gridColumnApi.getColumnState());
    const storageName = this.makeStorageName(name);
    this.session.setItem(storageName, colState);
    this.notificationService.success("حالت جدول با موفقیت ذخیره شد.");
  }

  restoreState(gridColumnApi: any, name: string): boolean {
    const storageName = this.makeStorageName(name);
    const colState = JSON.parse(this.session.getString(storageName));
    if (!colState) {
      return false;
    }

    gridColumnApi.applyColumnState({
      state: colState,
      applyOrder: true,
    });

    return true;
  }

  resetState(gridColumnApi: any, name: string): void {
    gridColumnApi.resetColumnState();
    const storageName = this.makeStorageName(name);
    if (this.session.exists(storageName)) {
      this.session.removeItem(storageName);
    }

    this.notificationService.success("برگشت جدول به حالت پیش فرض با موفقیت انجام شد.");
  }
}