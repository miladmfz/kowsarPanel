/* ===============================================================
   📘 KowsarReportComponent (نسخه جدید - Standalone)
   ---------------------------------------------------------------
   نمایش سه نوع گزارش:
   1️⃣ گزارش کارشناسان (Flag=1)
   2️⃣ جزئیات ارجاعات (Flag=2)
   3️⃣ وضعیت ارجاعات (Flag=3)

   ویژگی‌ها:
   - استفاده از کلاس پایه‌ی جدید AgGridBaseComponent (بدون ماژول)
   - پشتیبانی از تم تیره/روشن
   - مدیریت سه فرم مجزا برای گزارش‌ها
   - مودال جزئیات با انیمیشن fade
   - استفاده از سل‌رندررهای سفارشی
   =============================================================== */

import { CommonModule } from '@angular/common';
import { Component, Renderer2, OnInit, ElementRef, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { Subscription } from 'rxjs';

//   سل‌رنـدررها
import { CellActionKowsarReport } from './cell-action-attendance-panel';
import { CellDateMinDate } from './cell-date-label-attendance-panel';

//   سرویس‌ها
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base/ag-grid-base.component';
import { DashboardWebApiService } from '../../services/DashboardWebApi.service';

//   پایه AG Grid (نسخه Standalone جدید)
// یا اگر alias src کار نمی‌کند، بنویس:
// import { AgGridBaseComponent } from '../../../../../../framework-components/ag-grid/base/ag-grid-base.component';

type Lookup = { id: string; name: string };

@Component({
    selector: 'app-kowsar-report',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AgGridAngular,
    ],
    templateUrl: './kowsar-report.component.html',
})
export class KowsarReportComponent extends AgGridBaseComponent implements OnInit {
    // ===============================================================
    // 🧾 داده‌ها و وضعیت‌ها
    // ===============================================================
    BrokerHistroyName = '';
    records_person: any[] = [];
    records_personletterrow: any[] = [];
    records_letterrowstate: any[] = [];

    loading_person = true;
    loading_letterrowstate = true;

    // ===============================================================
    //   فرم‌ها برای سه نوع گزارش
    // ===============================================================
    EditForm_KowsarReport1 = new FormGroup({
        SearchTarget: new FormControl<string>(''),
        CentralRef: new FormControl<string>('0'),
        LetterRowCode: new FormControl<string>('0'),
        Flag: new FormControl<string>(''),
        DateTarget: new FormControl<string>(''),
    });

    EditForm_KowsarReport2 = new FormGroup({
        SearchTarget: new FormControl<string>(''),
        CentralRef: new FormControl<string>('0'),
        LetterRowCode: new FormControl<string>('0'),
        Flag: new FormControl<string>(''),
        DateTarget: new FormControl<string>(''),
    });

    EditForm_KowsarReport3 = new FormGroup({
        SearchTarget: new FormControl<string>(''),
        CentralRef: new FormControl<string>('0'),
        LetterRowCode: new FormControl<string>('0'),
        Flag: new FormControl<string>(''),
        DateTarget: new FormControl<string>(''),
    });

    // ===============================================================
    // 🔸 وضعیت‌های لوکاپ برای فیلتر گزارش
    // ===============================================================
    LetterState_Lookup: Lookup[] = [
        { id: '', name: 'دیده نشده' },
        { id: 'منتظراقدام', name: 'منتظراقدام' },
        { id: 'درحال انجام', name: 'درحال انجام' },
        { id: 'تمام شده', name: 'تمام شده' },
        { id: 'ابطالی', name: 'ابطالی' },
    ];

    // ===============================================================
    //   سازنده
    // ===============================================================

    private readonly repo = inject(DashboardWebApiService);
    private readonly notify = inject(NotificationService);
    private readonly loading = inject(LoadingService);
    private readonly renderer = inject(Renderer2);
    private readonly theme = inject(ThemeService);

    constructor(theme: ThemeService
    ) {
        super();
        this.childName = 'KowsarReport'; // برای ذخیره state ستون‌ها در localStorage
    }

    // ===============================================================
    // 🚀 lifecycle
    // ===============================================================
    ngOnInit(): void {
        this.initColumns();
        this.getFirstpanel_data();
    }

    // ===============================================================
    // 📋 تعریف ستون‌ها برای سه گزارش
    // ===============================================================
    private initColumns(): void {
        this.columnDefs1 = [
            { field: 'عملیات', pinned: 'left', cellRenderer: CellActionKowsarReport, minWidth: 100 },
            { field: 'Name', headerName: 'کارشناس', minWidth: 120 },
            { field: 'تاریخ', cellRenderer: CellDateMinDate, minWidth: 120 },
            { field: 'TotalLetters', headerName: 'کل ارجاعات', minWidth: 110 },
            { field: 'Unread', headerName: 'دیده نشده', minWidth: 110 },
            { field: 'WaitingAction', headerName: 'منتظر اقدام', minWidth: 110 },
            { field: 'InProgress', headerName: 'در حال انجام', minWidth: 110 },
            { field: 'Completed', headerName: 'تمام شده', minWidth: 110 },
            { field: 'Status1Minutes', headerName: 'مدت آزاد', minWidth: 110 },
            { field: 'Status2Minutes', headerName: 'مدت کار', minWidth: 110 },
        ];

        this.columnDefs2 = [
            { field: 'RowLetterDate', headerName: 'تاریخ', minWidth: 140 },
            { field: 'LetterRowDescription', headerName: 'توضیحات', minWidth: 220 },
            { field: 'OwnerName', headerName: 'مالکیت', minWidth: 140 },
            { field: 'CreatorName', headerName: 'ایجاد کننده', minWidth: 140 },
            { field: 'RowExecutorName', headerName: 'اقدام کننده', minWidth: 140 },
            { field: 'RowLetterState', headerName: 'وضعیت', minWidth: 120 },
            { field: 'AutLetterRow_PropDescription1', headerName: 'شرح کار', minWidth: 220 },
        ];

        this.columnDefs3 = [...this.columnDefs2];
    }

    // ===============================================================
    // 🟢 بارگذاری اولیه داده‌ها
    // ===============================================================
    public getFirstpanel_data(): void {
        const centralRef = sessionStorage.getItem('CentralRef') ?? '';
        if (['1274', '1139', '1843'].includes(centralRef)) {
            this.getpaneldata_report1();
            this.getpaneldata_report3();
        }
    }

    // ===============================================================
    //   گزارش کارشناسان (Flag=1)
    // ===============================================================
    public getpaneldata_report1(): void {
        this.EditForm_KowsarReport1.patchValue({ Flag: '1' });
        this.loading.show();

        this.repo.GetKowsarReport(this.EditForm_KowsarReport1.value).subscribe({
            next: (data: any) => {
                this.loading.hide();
                this.loading_person = false;
                this.records_person = data?.KowsarReports ?? [];

                this.updateGridData(1, this.records_person);
            },
            error: () => {
                this.loading.hide();
                this.loading_person = false;
                this.records_person = [];
                this.notify.error('❌ خطا در دریافت گزارش کارشناسان');
            },
        });
    }

    // ===============================================================
    // 📈 وضعیت ارجاعات (Flag=3)
    // ===============================================================
    public getpaneldata_report3(): void {
        this.EditForm_KowsarReport3.patchValue({ Flag: '3' });
        this.loading.show();

        this.repo.GetKowsarReport(this.EditForm_KowsarReport3.value).subscribe({
            next: (data: any) => {
                this.loading.hide();
                this.loading_letterrowstate = false;
                this.records_letterrowstate = data?.KowsarReports ?? [];
                this.updateGridData(3, this.records_letterrowstate);
            },
            error: () => {
                this.loading.hide();
                this.loading_letterrowstate = false;
                this.records_letterrowstate = [];
                this.notify.error('❌ خطا در دریافت وضعیت ارجاعات');
            },
        });
    }

    // ===============================================================
    // 📋 جزئیات ارجاعات (Flag=2)
    // ===============================================================
    public getpaneldata_report2(centralRef: string, letterRowCode: string): void {
        this.EditForm_KowsarReport2.patchValue({
            CentralRef: centralRef,
            LetterRowCode: letterRowCode,
            Flag: '2',
        });

        this.loading.show();
        this.repo.GetKowsarReport(this.EditForm_KowsarReport2.value).subscribe({
            next: (data: any) => {
                this.loading.hide();
                this.records_personletterrow = data?.KowsarReports ?? [];
                this.BrokerHistroyName = this.records_personletterrow?.[0]?.Name || 'جزئیات ارجاع';
                this.updateGridData(2, this.records_personletterrow);
                this.personletter_dialog_show();
            },
            error: () => {
                this.loading.hide();
                this.records_personletterrow = [];
                this.notify.error('❌ خطا در دریافت جزئیات ارجاع');
            },
        });
    }

    // ===============================================================
    //   مدیریت مودال جزئیات ارجاعات
    // ===============================================================
    @ViewChild('personletter') modalRef!: ElementRef<HTMLDivElement>;

    /** 🟢 نمایش مودال با انیمیشن fade-in */
    public personletter_dialog_show(): void {
        setTimeout(() => {
            const modal = this.modalRef?.nativeElement;
            if (!modal) return;
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('show'), 10);
        });
    }

    /** 🔴 بستن مودال با fade-out */
    public personletter_dialog_close(): void {
        const modal = this.modalRef?.nativeElement;
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200);
    }
}
