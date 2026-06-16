import { inject, Injectable } from '@angular/core';

import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { KowsarBaseWebApi } from './base/KowsarBaseWebApi.service';
import { SessionStorageService } from './storage/session.storage.service';

@Injectable({
    providedIn: 'root'
})
export class DateSyncService {
    private readonly base_repo = inject(KowsarBaseWebApi);
    private readonly notification = inject(NotificationService);
    protected readonly session = inject(SessionStorageService);
    constructor() { }

    /** 
     * 📅 تاریخ را از سرور می‌گیرد و در صورت تغییر، صفحه را ریفرش می‌کند
     * @returns Promise<string | null> مقدار تاریخ از سرور
     */
    public syncDateAndReloadIfChanged(): Promise<string | null> {
        return new Promise((resolve) => {
            this.base_repo.GetTodeyFromServer().pipe(
                catchError((error) => {
                    this.notification.error('❌ خطا در دریافت تاریخ از سرور', 'خطا');
                    resolve(null);
                    return of(null);
                }),
                tap((data: any) => {
                    if (!data) {
                        resolve(null);
                        return;
                    }

                    const today = data.Text ?? '';
                    const activeDate = this.session.activeDate;

                    if (today && today !== activeDate) {
                        //this.session.setItem('ActiveDate', today);
                        this.notification.info('📆 تاریخ جدید از سرور بروزرسانی شد.');
                        // اگر لازم داری reload خودکار:
                        setTimeout(() => location.reload(), 1500);
                    }

                    resolve(today);
                })
            ).subscribe();
        });
    }
}
