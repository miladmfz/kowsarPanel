/**
 *   AutletterInsertComponent
 * --------------------------------------------------------------
 * فرم ثبت تیکت جدید (نامه خودکار)
 * ویژگی‌ها:
 *  - انتخاب مشتری از لیست مرکزی
 *  - درج اطلاعات تیکت (عنوان، شرح، اولویت و وضعیت)
 *  - اتصال به سرویس‌های Lookup و API
 *  - استفاده از AgGrid برای انتخاب مشتری
 *  - دارای مودال انتخاب مشتری (centrallist)
 */

import {
    Component,
    ElementRef,
    OnInit,
    Renderer2,
    ViewChild,
    CUSTOM_ELEMENTS_SCHEMA,
    inject,
} from '@angular/core';
import {
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { FormsModule } from '@angular/forms';

//   Framework Services
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';

//   Models & Services
import { Base_Lookup, DbSetup_lookup } from 'src/app/app-shell/framework-services/model/lookup-type';

//   AG Grid Base
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { AppConfigService } from 'src/app/app-config.service';
import { AutletterWebApiService } from '../../../services/AutletterWebApi.service';

@Component({
    selector: 'app-autletter-insert',
    standalone: true,
    templateUrl: './autletter-insert.component.html',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        AgGridAngular,
        NgPersianDatepickerModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AutletterInsertComponent extends AgGridBaseComponent implements OnInit {
    // ===============================================================
    // 📍 ViewChilds & عناصر DOM
    // ===============================================================
    @ViewChild('centrallist', { static: false })
    centrallistModal!: ElementRef<HTMLDivElement>;

    // ===============================================================
    //   متغیرهای عمومی
    // ===============================================================
    ToDayDate = '';
    loading = false;
    IsCustomerBuild = true;
    IsEmploy = false;
    JobPersonRef = '';
    CentralRef = '';

    records_support_central: any[] = [];
    selectedRows: any[] = [];
    Searchtarget_central = '';

    private searchSubject_central = new Subject<string>();

    // ===============================================================
    // 📅 تنظیمات و lookup ها
    // ===============================================================
    customTheme: Partial<IDatepickerTheme> = {
        selectedBackground: '#D68E3A',
        selectedText: '#FFFFFF',
    };

    Title_Lookup: Base_Lookup[] = [
        { id: 'ارتباط با همکاران', name: 'ارتباط با همکاران' },
        { id: 'پشتیبانی فنی', name: 'پشتیبانی فنی' },
        { id: 'امور مالی و تمدید پشتیبانی', name: 'امور مالی و تمدید پشتیبانی' },
        { id: 'حسابداری', name: 'حسابداری' },
        { id: 'آموزش و سوال نرم افزاری', name: 'آموزش و سوال نرم افزاری' },
        { id: 'سایت Site', name: 'سایت Site' },
        { id: 'اپلیکیشن موبایلی mobile Application', name: 'اپلیکیشن موبایلی mobile Application' },
        { id: 'همسان سازی Replication', name: 'همسان سازی Replication' },
        { id: 'درخواست فاکتور', name: 'درخواست فاکتور' },
    ];

    LetterState_lookup: DbSetup_lookup[] = [];
    LetterPriority_lookup: DbSetup_lookup[] = [];

    InOut_Lookup: Base_Lookup[] = [
        { id: '0', name: 'وارده' },
        { id: '1', name: 'صادره' },
        { id: '2', name: 'داخلی' },
    ];

    // ===============================================================
    //   فرم‌ها
    // ===============================================================
    EditForm_SearchTarget = new FormGroup({
        SearchTarget: new FormControl(''),
        BrokerRef: new FormControl(''),
    });

    EditForm_LetterInsert = new FormGroup({
        LetterDate: new FormControl(''),
        title: new FormControl('', [Validators.required]),
        Description: new FormControl('', [Validators.required]),
        LetterState: new FormControl(''),
        LetterPriority: new FormControl('', [Validators.required]),
        CentralRef: new FormControl(''),
        InOutFlag: new FormControl('', [Validators.required]),
        CreatorCentral: new FormControl(''),
        OwnerCentral: new FormControl('', [Validators.required]),
        OwnerPersonInfoRef: new FormControl(''),
        OwnerName: new FormControl(''),
    });

    // ===============================================================
    //   سازنده
    // ===============================================================

    private readonly router = inject(Router);

    private readonly repo = inject(AutletterWebApiService);
    private readonly config = inject(AppConfigService);
    private readonly notificationService = inject(NotificationService);
    private readonly renderer = inject(Renderer2);


    constructor() {
        super();
    }

    // ===============================================================
    // 🚀 Lifecycle
    // ===============================================================
    ngOnInit(): void {
        this.initGrid();
        this.initSessionData();
        this.loadLookups();
        this.pipe_function();



        const apiUrl_temp = this.config.apiUrl;

        this.IsCustomerBuild = !(
            apiUrl_temp === 'http://192.168.1.25:60006/api/' ||
            apiUrl_temp === 'http://itmali.ir/webapi/' ||
            apiUrl_temp === 'http://5.160.152.173:60005/api/'
        );
    }

    // ===============================================================
    // 🧱 مقداردهی گرید و ستون‌ها
    // ===============================================================
    private initGrid(): void {
        this.columnDefs1 = [
            { headerName: 'مدیریت', field: 'Manager', minWidth: 120 },
            { headerName: 'نام مشتری', field: 'CustName_Small', minWidth: 250 },
            { headerName: 'پشتیبانی ', field: 'Explain', minWidth: 250 },
        ];
    }

    // ===============================================================
    // 🔧 مقداردهی اولیه از Session
    // ===============================================================
    private initSessionData(): void {
        this.JobPersonRef = sessionStorage.getItem('JobPersonRef') || '';

        this.EditForm_LetterInsert.patchValue({
            OwnerPersonInfoRef: sessionStorage.getItem('PersonInfoRef'),
            CreatorCentral: sessionStorage.getItem('CentralRef'),
        });

        if (this.JobPersonRef.length > 0) {
            this.IsEmploy = true;
            this.EditForm_LetterInsert.patchValue({ OwnerCentral: '' });
        } else {
            this.IsEmploy = false;
            this.EditForm_LetterInsert.patchValue({
                OwnerCentral: sessionStorage.getItem('CentralRef'),
                OwnerName: sessionStorage.getItem('CustName_Small'),
                InOutFlag: '0',
            });
        }
    }

    // ===============================================================
    //   بارگذاری Lookupها
    // ===============================================================
    private loadLookups(): void {

        this.repo.GetTodeyFromServer().subscribe((data: any) => {

            this.ToDayDate = data.Text;
            this.EditForm_LetterInsert.patchValue({ LetterDate: this.ToDayDate });
        });



        this.repo.GetObjectTypeFromDbSetup('AutomationLetterState').subscribe((data: any) => {

            this.LetterState_lookup = data.ObjectTypes;
        });


        this.repo.GetObjectTypeFromDbSetup('AutomationLetterPriority').subscribe((data: any) => {

            this.LetterPriority_lookup = data.ObjectTypes;
        });
    }

    // ===============================================================
    //   جستجوی مشتری
    // ===============================================================
    pipe_function(): void {
        this.searchSubject_central
            .pipe(debounceTime(1000))
            .subscribe(() => this.GetCentral());
    }

    onInputChange_Customer(): void {
        this.searchSubject_central.next(this.Searchtarget_central);
    }

    GetCentral(): void {
        this.clearGrid(1);
        this.centrallist_dialog_show();
        this.loading = true;

        this.EditForm_SearchTarget.patchValue({
            SearchTarget: this.Searchtarget_central,
            BrokerRef: this.IsCustomerBuild
                ? sessionStorage.getItem('BrokerCode')
                : "0",
        });



        this.repo.GetKowsarCustomer(this.EditForm_SearchTarget.value).subscribe({
            next: (data: any) => {

                this.records_support_central = data?.Customers ?? [];
                this.updateGridData(1, this.records_support_central);
                this.loading = false;
            },
            error: () => {
                this.clearGrid(1);
                this.loading = false;
            },
        });
    }

    onSelectionChanged(event: any): void {
        this.selectedRows = event.api.getSelectedRows();
    }

    Set_Customer(): void {
        this.EditForm_LetterInsert.patchValue({
            LetterDate: this.ToDayDate,
            OwnerCentral: this.selectedRows[0].CentralRef,
            OwnerName: this.selectedRows[0].CustName_Small,
        });
        this.selectedRows = [];
        this.centrallist_dialog_close();
    }




    // ===============================================================
    // 💾 ثبت تیکت
    // ===============================================================
    submit(action: string): void {
        this.EditForm_LetterInsert.markAllAsTouched();
        if (!this.EditForm_LetterInsert.valid) return;



        this.repo.LetterInsert(this.EditForm_LetterInsert.value).subscribe((data: any) => {



            const intValue = parseInt(data.AutLetters[0].LetterCode, 10);
            if (!isNaN(intValue) && intValue > 0) {
                this.notificationService.success('  تیکت با موفقیت ثبت شد');

                if (action === '') {
                    this.router.navigate(['/support/letter-list']);
                } else if (action === 'detail') {
                    this.router.navigate(['/support/letter-detail', data.AutLetters[0].LetterCode]);
                }
            }
        });
    }

    // ===============================================================
    //   مدیریت مودال انتخاب مشتری
    // ===============================================================
    centrallist_dialog_show(): void {
        const modal = this.centrallistModal?.nativeElement;
        if (!modal) return;

        this.renderer.addClass(modal, 'show');
        this.renderer.setStyle(modal, 'display', 'block');
        this.renderer.setAttribute(modal, 'aria-modal', 'true');
        this.renderer.setAttribute(modal, 'role', 'dialog');
    }

    centrallist_dialog_close(): void {
        const modal = this.centrallistModal?.nativeElement;
        if (!modal) return;

        this.renderer.removeClass(modal, 'show');
        this.renderer.setStyle(modal, 'display', 'none');
        this.renderer.removeAttribute(modal, 'aria-modal');
        this.renderer.removeAttribute(modal, 'role');
    }
}
