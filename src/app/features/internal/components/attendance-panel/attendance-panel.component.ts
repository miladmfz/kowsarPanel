/* ===============================================================
   📘 AttendancePanelComponent
   توضیحات کلی:
   این کامپوننت، پنل اصلی مدیریت حضور کارشناسان است که شامل چند بخش کلیدی می‌باشد:
   1️⃣ نمایش گرید حضور و مرخصی کارشناسان  
   2️⃣ نمایش تاریخچه حضور هر کارشناس  
   3️⃣ نمایش و ایجاد تیکت‌ها (Letter Modal)  
   4️⃣ انتخاب مشتری از طریق مودال اختصاصی  

   ساختار کلی:
   - استفاده از سیگنال‌ها (signals) برای مدیریت وضعیت مودال‌ها و داده‌ها
   - ارتباط مستقیم بین کامپوننت‌های داخلی از طریق @ViewChild
   - به‌روزرسانی خودکار داده‌ها از طریق SharedService و NotificationService
   - استفاده از سرویس‌های DashboardWebApiService و ThemeService
   =============================================================== */

import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    inject,
    signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import { AttendanceGridComponent } from './components/attendance-grid/attendance-grid.component';
import { AttendanceHistoryModalComponent } from './components/attendance-history-modal/attendance-history-modal.component';
import { LetterModalComponent } from './components/letter-modal/letter-modal.component';
import { CustomerListModalComponent } from './components/customer-list-modal/customer-list-modal.component';
import { AttendanceCallReportModalComponent } from './components/call-report-modal/attendance-call-report-modal.component';

import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { AutletterWebApiService } from 'src/app/features/automation/services/AutletterWebApi.service';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';

@Component({
    selector: 'app-attendance-panel',
    standalone: true,
    imports: [
        CommonModule,
        AttendanceGridComponent,
        AttendanceHistoryModalComponent,
        LetterModalComponent,
        CustomerListModalComponent,
        AttendanceCallReportModalComponent,
    ],
    templateUrl: './attendance-panel.component.html',
    styles: [`
        :host {
            display: block;
        }

        .attendance-refresh-controls {
            display: flex;
            align-items: center;
            gap: 0.45rem;
            flex-wrap: wrap;
            direction: rtl;
        }

        .attendance-refresh-btn {
            min-height: 34px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.35rem;
            padding: 0.35rem 0.7rem;
            border-radius: 10px;
            font-size: 0.78rem;
            font-weight: 700;
            white-space: nowrap;
            transition: 0.18s ease;
        }

        .attendance-refresh-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
        }

        .attendance-auto-btn.active {
            color: #137a3c;
            background: #eaf9f0;
            border-color: #66cf8b;
        }

        .attendance-auto-btn:not(.active) {
            color: #9a3412;
            background: #fff7ed;
            border-color: #fdba74;
        }

        .attendance-refresh-interval {
            min-height: 34px;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.2rem 0.45rem;
            border: 1px solid #d8e1ec;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.88);
            color: #475569;
            font-size: 0.74rem;
            white-space: nowrap;
        }

        .attendance-refresh-interval select {
            min-width: 92px;
            height: 28px;
            padding: 0 0.4rem;
            border: 0;
            border-radius: 7px;
            background: #f8fafc;
            color: #1e293b;
            font-size: 0.75rem;
            font-weight: 700;
            outline: none;
        }

        .attendance-last-update {
            min-width: 76px;
            color: #64748b;
            font-size: 0.68rem;
            line-height: 1.35;
            text-align: center;
            white-space: nowrap;
        }

        .attendance-last-update strong {
            display: block;
            color: #334155;
            font-size: 0.72rem;
        }


        .bg-dark .attendance-refresh-interval {
            color: #cbd5e1;
            background: rgba(15, 23, 42, 0.65);
            border-color: #475569;
        }

        .bg-dark .attendance-refresh-interval select {
            color: #f8fafc;
            background: #1e293b;
        }

        .bg-dark .attendance-last-update,
        .bg-dark .attendance-last-update strong {
            color: #e2e8f0;
        }

        @media (max-width: 768px) {
            .attendance-refresh-controls {
                width: 100%;
                margin-top: 0.65rem;
            }

            .attendance-refresh-btn span {
                display: none;
            }

            .attendance-last-update {
                display: none;
            }
        }
    `],
})
export class AttendancePanelComponent implements OnInit, AfterViewInit, OnDestroy {
    // ===============================================================
    //   گریدها و ویوها
    // ===============================================================
    @ViewChild('attendanceGrid') attendanceGrid?: AttendanceGridComponent;
    @ViewChild('customerModal') customerModal?: CustomerListModalComponent;
    @ViewChild(LetterModalComponent) letterModal?: LetterModalComponent;

    // ===============================================================
    // 🌗 وضعیت تم و متغیرها
    // ===============================================================
    isDarkMode = false;
    IsCustomerBuild = true;
    LetterCode = signal('')
    ToDayDate = new Date().toLocaleDateString('fa-IR');

    // ===============================================================
    // 🕓 تاریخچه حضور
    // ===============================================================
    Attendance_history_Show_Modal = signal(false);
    Attendance_history_selected = signal<any | null>(null);
    Attendance_history_records = signal<any[]>([])

    // ===============================================================
    // 📬 تیکت‌ها
    // ===============================================================
    showLetterModal = signal(false);
    selectedPerson = signal<any | null>(null);
    Letter_records = signal<any[]>([])

    // ===============================================================
    //   مشتریان
    // ===============================================================
    Customer_Show_Modal = signal(false);
    Customer_selected = signal<any | null>(null);
    Customer_records = signal<any[]>([])

    // ===============================================================
    // ☎️ گزارش تماس داخلی جاری و کارشناسان
    // ===============================================================
    Call_report_Show_Modal = signal(false);
    Call_report_selected = signal<any | null>(null);
    Call_report_extension = signal('');
    Call_report_person_name = signal('');

    // ===============================================================
    // 🔌 اشتراک‌ها
    // ===============================================================
    private themeSub?: Subscription;
    private refreshSub?: Subscription;

    // ===============================================================
    // 🔄 بروزرسانی دستی / خودکار
    // ===============================================================
    autoRefresh = signal(false);
    refreshSeconds = signal(10);
    lastUpdateText = signal('');

    private refreshTimer: ReturnType<typeof setInterval> | null = null;
    private notifyAfterRefresh = false;



    private readonly aut_repo = inject(AutletterWebApiService);
    private readonly base_repo = inject(KowsarBaseWebApi);


    private readonly sharedService = inject(SharedService);
    private readonly notificationService = inject(NotificationService);
    private readonly themeService = inject(ThemeService);
    private readonly config = inject(AppConfigService);
    protected readonly session = inject(SessionStorageService);
    constructor() { }

    // ===============================================================
    // 🔁 Lifecycle Hooks
    // ===============================================================
    ngOnInit(): void {
        this.themeSub = this.themeService.theme$.subscribe(
            mode => (this.isDarkMode = mode === 'dark')
        );

        this.refreshSub = this.sharedService.RefreshAllActions$?.subscribe(action => {
            if (action === 'refresh') this.refreshData(true);
        });


        const apiUrl_temp = this.config.apiUrl;

        this.IsCustomerBuild = !(
            apiUrl_temp === 'http://192.168.1.27:60007/api/' ||
            apiUrl_temp === 'https://itmali.ir/webapi/' ||
            apiUrl_temp === 'http://5.160.152.173:60005/api_book/' ||
            apiUrl_temp === 'http://5.160.152.173:60005/api/'
        );
    }

    ngAfterViewInit(): void {
        // AttendanceGrid بارگذاری اولیه را خودش انجام می‌دهد.
        // اینجا فقط زمان‌بند بروزرسانی خودکار را فعال می‌کنیم تا درخواست تکراری اولیه ایجاد نشود.
        this.startAutoRefresh();
    }

    ngOnDestroy(): void {
        this.themeSub?.unsubscribe();
        this.refreshSub?.unsubscribe();
        this.stopAutoRefresh();
    }

    // ===============================================================
    // 🔁 رفرش داده‌ها
    // ===============================================================
    manualRefresh(): void {
        this.refreshData(true);
    }

    refreshData(showNotification = false): void {
        const grid = this.attendanceGrid;

        // تا پایان درخواست قبلی، درخواست جدید ساخته نشود.
        if (!grid || grid.loading()) {
            return;
        }

        this.notifyAfterRefresh = showNotification;
        grid.refresh();
    }

    onAttendanceRefreshFinished(success: boolean): void {
        if (success) {
            this.lastUpdateText.set(
                new Intl.DateTimeFormat('fa-IR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }).format(new Date())
            );

            if (this.notifyAfterRefresh) {
                this.notificationService.success('اطلاعات حضور بروزرسانی شد.');
            }
        } else if (this.notifyAfterRefresh) {
            this.notificationService.error('خطا در بروزرسانی اطلاعات حضور.');
        }

        this.notifyAfterRefresh = false;
    }

    isRefreshing(): boolean {
        return this.attendanceGrid?.loading() ?? false;
    }

    toggleAutoRefresh(): void {
        this.autoRefresh.update(value => !value);

        if (this.autoRefresh()) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }
    }

    changeRefreshSeconds(value: string | number): void {
        const seconds = Number(value);

        if (!Number.isFinite(seconds)) {
            return;
        }

        this.refreshSeconds.set(Math.min(300, Math.max(5, seconds)));

        if (this.autoRefresh()) {
            this.startAutoRefresh();
        }
    }

    private startAutoRefresh(): void {
        this.stopAutoRefresh();

        if (!this.autoRefresh()) {
            return;
        }

        this.refreshTimer = setInterval(() => {
            this.refreshData(false);
        }, this.refreshSeconds() * 1000);
    }

    private stopAutoRefresh(): void {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    // ===============================================================
    // ☎️ گزارش تماس کارشناس
    // ===============================================================
    openCallReport(item: any): void {
        const extension = this.resolvePersonExtension(item);

        if (!extension) {
            this.notificationService.warning('برای این کارشناس داخلی سانترال مشخص نشده است.');
            return;
        }

        this.Call_report_selected.set(item);
        this.Call_report_extension.set(extension);
        this.Call_report_person_name.set(this.resolvePersonName(item));
        this.Call_report_Show_Modal.set(true);
    }

    closeCallReportModal(): void {
        this.Call_report_Show_Modal.set(false);
        this.Call_report_selected.set(null);
        this.Call_report_extension.set('');
        this.Call_report_person_name.set('');
    }

    private resolvePersonExtension(item: any): string {
        const candidates = [
            item?.Manager,
            item?.manager,
            item?.Extension,
            item?.extension,
            item?.ExtensionNo,
            item?.InternalNo,
            item?.PhoneExtension,
            item?.SantralExtension,
            item?.PhAddress3,
        ];

        return this.firstExtension(candidates);
    }

    private resolvePersonName(item: any): string {
        const fullName = String(
            item?.CentralName ||
            item?.FullName ||
            item?.PhFullName ||
            `${item?.PhFirstName ?? ''} ${item?.PhLastName ?? ''}`
        ).trim();

        return fullName || 'کارشناس';
    }

    private firstExtension(values: any[]): string {
        for (const value of values) {
            const extension = String(value ?? '')
                .trim()
                .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
                .replace(/\D+/g, '');

            if (extension.length >= 2 && extension.length <= 8) {
                return extension;
            }
        }

        return '';
    }

    private safeSessionValue(key: string): string {
        try {
            return this.session.getString(key) ?? '';
        } catch {
            return '';
        }
    }

    private safeNativeSessionValue(key: string): string {
        try {
            return sessionStorage.getItem(key) ?? '';
        } catch {
            return '';
        }
    }

    // ===============================================================
    // 🕓 تاریخچه حضور
    // ===============================================================
    openHistory(item: any): void {
        this.Attendance_history_selected.set(item);
        this.Attendance_history_Show_Modal.set(true);
        this.Attendance_history_records.set([]);


        this.base_repo.AttendanceHistory(item?.CentralRef).subscribe({
            next: (data: any) => {

                this.Attendance_history_records.set(data?.Attendances ?? []);
            },
            error: () => {

                this.notificationService.error('❌ خطا در دریافت تاریخچه حضور')
            },
        });
    }

    closeHistoryModal(): void {
        this.Attendance_history_Show_Modal.set(false);
        this.Attendance_history_records.set([]);
        this.Attendance_history_selected.set(null);
    }

    // ===============================================================
    // 📬 تیکت‌ها (Letter)
    // ===============================================================
    openLetter(item: any): void {
        if (!item?.CentralRef) {
            this.notificationService.warning('شناسه کارشناس نامعتبر است.');
            return;
        }

        this.selectedPerson.set(item);
        this.showLetterModal.set(true);
        this.Letter_records.set([]);

        const filter = {
            SearchTarget: '',
            CentralRef: item.CentralRef,
            Flag: '1',
        };

        this.notificationService.info(`📨 در حال دریافت تیکت‌های ${item.FullName}...`);


        this.aut_repo.GetAutLetterListByCentral(filter).subscribe({
            next: (data: any) => {

                this.Letter_records.set(data?.AutLetters ?? []);
                this.notificationService.success('  لیست تیکت‌ها با موفقیت بارگذاری شد.');
                console.log(this.Letter_records())
            },
            error: () => {

                this.notificationService.error('❌ خطا در دریافت لیست تیکت‌ها');
                this.showLetterModal.set(false);
            },
        });
    }

    closeLetterModal(): void {
        this.showLetterModal.set(false);
        this.Letter_records.set([]);
        this.selectedPerson.set(null);
    }

    onSubmitLetter(formData: any): void {
        if (!this.selectedPerson()) {
            this.notificationService.warning('کارشناس انتخاب نشده است.');
            return;
        }

        if (formData.LetterCode?.length > 0) {
            this.SendLetterRow(formData);
        } else {
            this.SendLetterHeader(formData);
        }
    }

    // ===============================================================
    // 📤 ایجاد تیکت جدید (Header)
    // ===============================================================
    private SendLetterHeader(formData: any): void {

        const ownerCentral =
            formData?.CentralRef?.toString().trim() ||
            formData?.OwnerCentral?.toString().trim() ||
            '';

        if (!ownerCentral) {
            this.notificationService.warning('  لطفاً ابتدا مشتری را انتخاب کنید');
            return;
        }

        const payload = {
            LetterDate: this.convertFaToEn(this.ToDayDate),
            title: 'ارتباط با همکاران',
            Description: formData.DescriptionText,
            LetterState: 'منتظراقدام',
            LetterPriority: 'عادی',
            CentralRef: this.session.centralRef,
            InOutFlag: '2',
            CreatorCentral: this.session.centralRef,
            OwnerCentral: ownerCentral,
            OwnerPersonInfoRef: this.session.personInfoRef,
            IsPrivate: '0',
        };


        this.aut_repo.LetterInsert(payload).subscribe({
            next: (data: any) => {

                const intValue = parseInt(data?.AutLetters[0]?.LetterCode ?? 0, 10);

                if (!isNaN(intValue) && intValue > 0) {
                    this.LetterCode = data.AutLetters[0].LetterCode;
                    formData.LetterCode = this.LetterCode;
                    this.SendLetterRow(formData);
                } else {
                    this.notificationService.error('❌ خطا در ایجاد تیکت جدید');
                }
            },
            error: () => {

                this.notificationService.error('❌ خطا در فراخوانی LetterInsert');
            },
        });
    }

    // ===============================================================
    // 📨 ارسال پیام در تیکت (Row)
    // ===============================================================
    private SendLetterRow(formData: any): void {
        const payload = {
            LetterRef: formData.LetterCode,
            LetterDate: this.convertFaToEn(this.ToDayDate),
            Description: formData.DescriptionText,
            LetterState: '',
            LetterPriority: 'عادی',
            CreatorCentral: this.session.centralRef,
            ExecuterCentral: formData.ExecuterCentral ?? this.selectedPerson()?.CentralRef,
        };


        this.aut_repo.AutLetterRowInsert(payload).subscribe({
            next: (data: any) => {

                const intValue = parseInt(data?.AutLetterRows[0]?.LetterRef ?? 0, 10);

                if (!isNaN(intValue) && intValue > 0) {
                    this.notificationService.success('  پیام جدید در تیکت ثبت شد');

                    if (formData.SendSms === '1') {
                        const smsPayload = {
                            CONTACTS: formData.ExecuterName,
                            NumberPhone: formData.NumberPhone,
                        };

                        this.aut_repo.SendSmsAutLetter(smsPayload).subscribe();
                    }

                    this.showLetterModal.set(false);
                    this.reloadLetterList();
                } else {

                    this.notificationService.error('❌ درج پیام در تیکت انجام نشد');
                }
            },
            error: () => {

                this.notificationService.error('❌ خطا در AutLetterRowInsert')
            },
        });
    }

    private reloadLetterList(): void {
        const person = this.selectedPerson();
        if (!person) return;

        const filter = {
            SearchTarget: '',
            CentralRef: person.CentralRef,
            Flag: '1',
        };


        this.aut_repo.GetAutLetterListByCentral(filter).subscribe({
            next: (data: any) => {

                this.Letter_records.set(data?.AutLetters ?? []);

            },
        });
    }
    convertFaToEn(value: string): string {
        const faDigits = '۰۱۲۳۴۵۶۷۸۹';
        const enDigits = '0123456789';

        return value.replace(/[۰-۹]/g, d => enDigits[faDigits.indexOf(d)]);
    }

    // ===============================================================
    //   مشتریان
    // ===============================================================
    openCustomerModal(param?: string | Event): void {
        const query = typeof param === 'string' ? param : '';

        this.Customer_Show_Modal.set(true);
        this.Customer_records.set([]);

        this.notificationService.info('  در حال دریافت لیست مشتریان...');

        const filter: any = {
            SearchTarget: query,
            BrokerRef: this.IsCustomerBuild
                ? this.session.getString('BrokerCode')
                : "0",
            Active: "4",
        };





        this.base_repo.GetKowsarCustomer(filter).subscribe({
            next: (data: any) => {

                this.Customer_records.set(data?.Customers ?? []);
                this.notificationService.success('  لیست مشتریان با موفقیت دریافت شد.');
            },
            error: () => {

                this.notificationService.error('❌ خطا در دریافت لیست مشتریان')
            },
        });
    }

    closeCustomerModal(): void {
        this.Customer_Show_Modal.set(false);
        this.Customer_records.set([]);
        this.Customer_selected.set(null);
    }

    onCustomerSelected(customer: any): void {
        this.Customer_Show_Modal.set(false);
        if (!customer) return;

        this.letterModal?.patchSelectedCustomer({
            CentralRef: customer.CentralRef,
            CustName_Small: customer.CustName_Small,
            Mobile: customer.Mobile,
        });
    }
}
