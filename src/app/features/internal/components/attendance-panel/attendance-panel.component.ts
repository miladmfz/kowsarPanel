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

import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { AppConfigService } from 'src/app/app-config.service';
import { DashboardWebApiService } from '../../services/DashboardWebApi.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';

@Component({
    selector: 'app-attendance-panel',
    standalone: true,
    imports: [
        CommonModule,
        AttendanceGridComponent,
        AttendanceHistoryModalComponent,
        LetterModalComponent,
        CustomerListModalComponent,
    ],
    templateUrl: './attendance-panel.component.html',
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
    LetterCode = '';
    ToDayDate = new Date().toLocaleDateString('fa-IR');

    // ===============================================================
    // 🕓 تاریخچه حضور
    // ===============================================================
    Attendance_history_Show_Modal = signal(false);
    Attendance_history_selected = signal<any | null>(null);
    Attendance_history_records = signal<any[]>([]);

    // ===============================================================
    // 📬 تیکت‌ها
    // ===============================================================
    showLetterModal = signal(false);
    selectedPerson = signal<any | null>(null);
    Letter_records = signal<any[]>([]);

    // ===============================================================
    //   مشتریان
    // ===============================================================
    Customer_Show_Modal = signal(false);
    Customer_selected = signal<any | null>(null);
    Customer_records = signal<any[]>([]);

    // ===============================================================
    // 🔌 اشتراک‌ها
    // ===============================================================
    private themeSub?: Subscription;
    private refreshSub?: Subscription;



    private readonly repo = inject(DashboardWebApiService);
    private readonly sharedService = inject(SharedService);
    private readonly notificationService = inject(NotificationService);
    private readonly themeService = inject(ThemeService);
    private readonly config = inject(AppConfigService);

    constructor() { }

    // ===============================================================
    // 🔁 Lifecycle Hooks
    // ===============================================================
    ngOnInit(): void {
        this.themeSub = this.themeService.theme$.subscribe(
            mode => (this.isDarkMode = mode === 'dark')
        );

        this.refreshSub = this.sharedService.RefreshAllActions$?.subscribe(action => {
            if (action === 'refresh') this.refreshData();
        });

        const apiUrl_temp = this.config.apiUrl;

        this.IsCustomerBuild = !(
            apiUrl_temp === 'http://192.168.1.25:60006/api/' ||
            apiUrl_temp === 'http://itmali.ir/webapi/' ||
            apiUrl_temp === 'http://5.160.152.173:60005/api_book/' ||
            apiUrl_temp === 'http://5.160.152.173:60005/api/'
        );
    }

    ngAfterViewInit(): void {
        this.refreshData();
    }

    ngOnDestroy(): void {
        this.themeSub?.unsubscribe();
        this.refreshSub?.unsubscribe();
    }

    // ===============================================================
    // 🔁 رفرش داده‌ها
    // ===============================================================
    refreshData(): void {
        this.attendanceGrid?.refresh();
        // this.leaveGrid?.refresh();
        this.notificationService.info('  داده‌ها در حال بروزرسانی هستند...');
    }

    // ===============================================================
    // 🕓 تاریخچه حضور
    // ===============================================================
    openHistory(item: any): void {
        this.Attendance_history_selected.set(item);
        this.Attendance_history_Show_Modal.set(true);
        this.Attendance_history_records.set([]);


        this.repo.AttendanceHistory(item?.CentralRef).subscribe({
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
            PersonInfoCode: item.CentralRef,
            Flag: '1',
        };

        this.notificationService.info(`📨 در حال دریافت تیکت‌های ${item.FullName}...`);


        this.repo.GetAutLetterListByPerson(filter).subscribe({
            next: (data: any) => {

                this.Letter_records.set(data.AutLetters ?? []);
                this.notificationService.success('  لیست تیکت‌ها با موفقیت بارگذاری شد.');
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
        console.log(formData);

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
            LetterState: '',
            LetterPriority: 'عادی',
            CentralRef: sessionStorage.getItem('CentralRef'),
            InOutFlag: '2',
            CreatorCentral: sessionStorage.getItem('CentralRef'),
            OwnerCentral: ownerCentral,
            OwnerPersonInfoRef: sessionStorage.getItem('PersonInfoRef'),
        };


        this.repo.LetterInsert(payload).subscribe({
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
            CreatorCentral: sessionStorage.getItem('CentralRef'),
            ExecuterCentral: formData.ExecuterCentral ?? this.selectedPerson()?.CentralRef,
        };


        this.repo.AutLetterRowInsert(payload).subscribe({
            next: (data: any) => {

                const intValue = parseInt(data?.AutLetterRows[0]?.LetterRef ?? 0, 10);

                if (!isNaN(intValue) && intValue > 0) {
                    this.notificationService.success('  پیام جدید در تیکت ثبت شد');

                    if (formData.SendSms === '1') {
                        const smsPayload = {
                            CONTACTS: formData.ExecuterName,
                            NumberPhone: formData.NumberPhone,
                        };

                        this.repo.SendSmsAutLetter(smsPayload).subscribe();
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
            PersonInfoCode: person.CentralRef,
            Flag: '1',
        };


        this.repo.GetAutLetterListByPerson(filter).subscribe({
            next: (data: any) => {

                this.Letter_records.set(data ?? [])
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
                ? sessionStorage.getItem('BrokerCode')
                : "0",
        };





        this.repo.GetKowsarCustomer(filter).subscribe({
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
