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
import { Component, OnInit, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';

import { CellActionKowsarReport } from './cell-action-attendance-panel';
import { CellDateMinDate } from './cell-date-label-attendance-panel';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base/ag-grid-base.component';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';

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
    BrokerHistroyName = signal('')
    records_person = signal<any[]>([])
    records_personletterrow = signal<any[]>([])
    records_letterrowstate = signal<any[]>([])

    loadingService_person = signal(true)
    loadingService_letterrowstate = signal(true)

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
    //   وضعیت‌های لوکاپ برای فیلتر گزارش
    // ===============================================================
    LetterState_Lookup: Base_Lookup[] = [
        { id: '', name: 'دیده نشده' },
        { id: 'منتظراقدام', name: 'منتظراقدام' },
        { id: 'درحال انجام', name: 'درحال انجام' },
        { id: 'تمام شده', name: 'تمام شده' },
        { id: 'ابطالی', name: 'ابطالی' },
    ];

    // ===============================================================
    //   سازنده
    // ===============================================================


    private readonly base_repo = inject(KowsarBaseWebApi);



    private readonly notify = inject(NotificationService);
    protected readonly permissionService = inject(PermissionService);

    constructor() {
        super();
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
        this.column_name_1 = [
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
        if (this.permissionService.canManageRole) {
            this.getpaneldata_report1();
            this.getpaneldata_report3();
        }
    }

    // ===============================================================
    //   گزارش کارشناسان (Flag=1)
    // ===============================================================
    public getpaneldata_report1(): void {
        this.EditForm_KowsarReport1.patchValue({ Flag: '1' });



        this.base_repo.GetKowsarReport(this.EditForm_KowsarReport1.value).subscribe({
            next: (data: any) => {


                this.loadingService_person.set(false)
                this.records_person.set(data?.KowsarReports ?? [])

                this.updateGridData(1, this.records_person())
            },
            error: () => {

                this.loadingService_person.set(false)
                this.records_person.set([])
                this.notify.error('❌ خطا در دریافت گزارش کارشناسان');
            },
        });
    }

    // ===============================================================
    // 📈 وضعیت ارجاعات (Flag=3)
    // ===============================================================
    public getpaneldata_report3(): void {
        this.EditForm_KowsarReport3.patchValue({ Flag: '3' });



        this.base_repo.GetKowsarReport(this.EditForm_KowsarReport3.value).subscribe({
            next: (data: any) => {


                this.loadingService_letterrowstate.set(false)
                this.records_letterrowstate.set(data?.KowsarReports ?? [])
                this.updateGridData(3, this.records_letterrowstate())
            },
            error: () => {

                this.loadingService_letterrowstate.set(false)
                this.records_letterrowstate.set([])
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



        this.base_repo.GetKowsarReport(this.EditForm_KowsarReport2.value).subscribe({
            next: (data: any) => {


                this.records_personletterrow.set(data?.KowsarReports ?? [])
                this.BrokerHistroyName.set(this.records_personletterrow()?.[0]?.Name || 'جزئیات ارجاع')
                this.updateGridData(2, this.records_personletterrow());
                this.personletter_dialog_show();
            },
            error: () => {

                this.records_personletterrow.set([])
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
