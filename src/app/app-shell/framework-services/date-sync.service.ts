import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { DashboardWebApiService } from '../core/services/dashboard-web-api.service';

@Injectable({
    providedIn: 'root'
})
export class DateSyncService {
    constructor(
        private repo: DashboardWebApiService,
        private notification: NotificationService
    ) { }

    /** 
     * 📅 تاریخ را از سرور می‌گیرد و در صورت تغییر، صفحه را ریفرش می‌کند
     * @returns Promise<string | null> مقدار تاریخ از سرور
     */
    public syncDateAndReloadIfChanged(): Promise<string | null> {
        return new Promise((resolve) => {
            this.repo.GetTodeyFromServer().pipe(
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

                    const today = data[0]?.TodeyFromServer ?? '';
                    const activeDate = sessionStorage.getItem('ActiveDate');

                    if (today && today !== activeDate) {
                        //sessionStorage.setItem('ActiveDate', today);
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
