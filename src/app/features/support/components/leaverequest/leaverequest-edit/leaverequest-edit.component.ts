/* ===============================================================
  LeaverequestEditComponent
کامپوننت ثبت و ویرایش درخواست مرخصی کاربران
ویژگی‌ها:
- پشتیبانی از مرخصی روزانه و ساعتی
- محاسبه تعداد روزهای کاری و تعطیل
- اعتبارسنجی فرم با تاریخ هجری شمسی
- پشتیبانی از بارگذاری و مشاهده پیوست‌ها
=============================================================== */

import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import moment from 'jalali-moment';

//   اجزای خارجی
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarAttachComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-attach/kowsar-attach.component';
import { LeaveRequestWebApiService } from '../../../services/LeaveRequestWebApi.service';

@Component({
    selector: 'app-leaverequest-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        NgPersianDatepickerModule,
        KowsarAttachComponent,
    ],
    templateUrl: './leaverequest-edit.component.html',
})
export class LeaverequestEditComponent extends AgGridBaseComponent implements OnInit {
    // ---------------------------------------------------------------
    //   سازنده و تزریق سرویس‌ها
    // ---------------------------------------------------------------
    constructor(
        private http: HttpClient,
        private repo: LeaveRequestWebApiService,
        private router: Router,
        private route: ActivatedRoute,
        private notify: NotificationService,
        private loadingService: LoadingService,
        private renderer: Renderer2,
    ) {
        super();
    }

    // ---------------------------------------------------------------
    //   متغیرها و وضعیت‌ها
    // ---------------------------------------------------------------
    private themeSube!: Subscription;

    records: any;
    loading = true;
    show_attachField = false;
    loading_attach = true;
    showTimeFields = false;
    title = 'درخواست مرخصی';
    ToDayDate = '';
    holidaysList: string[] = [];
    LeaveRequestCode = '';
    JobPersonRef = '';
    CentralRef = '';

    // ---------------------------------------------------------------
    // 🎨 تنظیمات تم تقویم شمسی
    // ---------------------------------------------------------------
    customTheme: Partial<IDatepickerTheme> = {
        selectedBackground: '#D68E3A',
        selectedText: '#FFFFFF',
    };

    // ---------------------------------------------------------------
    // 📋 داده‌های Lookup برای نوع مرخصی
    // ---------------------------------------------------------------
    LeaveType_Lookup: Base_Lookup[] = [
        { id: 'مرخصي روزانه', name: 'مرخصي روزانه' },
        { id: 'مرخصي ساعتي', name: 'مرخصي ساعتي' },
    ];

    // ---------------------------------------------------------------
    // 🧾 تعریف فرم درخواست مرخصی
    // ---------------------------------------------------------------
    EditForm_LeaveRequest = new FormGroup({
        LeaveRequestCode: new FormControl(''),
        UserRef: new FormControl(''),
        LeaveRequestDate: new FormControl(''),
        LeaveRequestType: new FormControl('', Validators.required),
        LeaveRequestExplain: new FormControl('', Validators.required),
        TotalDay: new FormControl('0'),
        WorkDay: new FormControl('0'),
        OffDay: new FormControl('0'),
        LeaveStartDate: new FormControl('', Validators.required),
        LeaveEndDate: new FormControl('', Validators.required),
        LeaveStartTime: new FormControl('', Validators.required),
        LeaveEndTime: new FormControl(''),
        ManagerRef: new FormControl('0'),
        WorkFlowStatus: new FormControl('0'),
        WorkFlowExplain: new FormControl(''),
    });

    // ---------------------------------------------------------------
    // 🚀 اجرای اولیه کامپوننت
    // ---------------------------------------------------------------
    ngOnInit(): void {
        // دریافت اطلاعات کاربر از sessionStorage
        this.JobPersonRef = sessionStorage.getItem('JobPersonRef') ?? '';
        this.CentralRef = sessionStorage.getItem('CentralRef') ?? '';

        // تنظیم تم تاریک/روشن
        this.themeSube = this.themeService.theme$.subscribe((mode) => {
            this.isDarkMode = mode === 'dark';
        });

        // دریافت پارامتر از URL برای حالت ویرایش
        this.route.paramMap.subscribe((params: ParamMap) => {
            const id = params.get('id');
            if (id) {
                this.LeaveRequestCode = id;
                this.title = 'اصلاح مرخصی';
                this.getDetail();
            } else {
                this.title = 'ایجاد مرخصی جدید';
            }
        });

        // بارگذاری لیست تعطیلات از فایل JSON
        const currentJYear = moment().format('jYYYY');
        this.http.get<any>('assets/holidays.json').subscribe((res) => {
            this.holidaysList = res[currentJYear] || [];
        });

        // دریافت تاریخ امروز از سرور
        this.repo.GetTodeyFromServer().subscribe((data: any) => {
            this.ToDayDate = data.Text;
            this.EditForm_LeaveRequest.patchValue({ LeaveRequestDate: this.ToDayDate });
        });

        // فعال‌سازی واکنش به تغییر تاریخ‌ها
        this.onLeaveStartDate();
        this.onLeaveEndDate();
    }

    // ---------------------------------------------------------------
    // 📆 واکنش به تغییر تاریخ شروع
    // ---------------------------------------------------------------
    onLeaveStartDate(): void {
        const ctrl = this.EditForm_LeaveRequest.get('LeaveStartDate');
        ctrl?.valueChanges.subscribe((value) => {
            this.calculateDays();
            const type = this.EditForm_LeaveRequest.get('LeaveRequestType')?.value;
            if (type === 'مرخصي ساعتي') {
                this.showTimeFields = true;
                this.EditForm_LeaveRequest.patchValue({ LeaveEndDate: value });
            } else {
                this.showTimeFields = false;
                this.EditForm_LeaveRequest.patchValue({
                    LeaveStartTime: '00:00',
                    LeaveEndTime: '23:59',
                });
            }
        });
    }

    // ---------------------------------------------------------------
    // 📆 واکنش به تغییر تاریخ پایان
    // ---------------------------------------------------------------
    onLeaveEndDate(): void {
        const ctrl = this.EditForm_LeaveRequest.get('LeaveEndDate');
        ctrl?.valueChanges.subscribe(() => this.calculateDays());
    }

    // ---------------------------------------------------------------
    //   دریافت جزئیات درخواست مرخصی
    // ---------------------------------------------------------------
    getDetail(): void {
        this.repo.GetLeaveRequestById(this.LeaveRequestCode).subscribe({
            next: (data: any) => {
                const req = data?.LeaveRequests?.[0];
                if (!req) return;

                req.LeaveStartTime = this.cleanTime(req.LeaveStartTime);
                req.LeaveEndTime = this.cleanTime(req.LeaveEndTime);

                this.EditForm_LeaveRequest.patchValue(req);
                this.onLeaveTypeChange();
                this.calculateDays();

                if (!req.LeaveRequestDate) {
                    this.EditForm_LeaveRequest.patchValue({ LeaveRequestDate: this.ToDayDate });
                }
            },
            error: (err) => {
                console.error('❌ Error in getDetail:', err);
            },
        });
    }

    // ---------------------------------------------------------------
    // 🕓 پاک‌سازی مقدار ساعت
    // ---------------------------------------------------------------
    private cleanTime(time: string | null | undefined): string {
        if (!time) return '';
        return time.trim().substring(0, 5);
    }

    // ---------------------------------------------------------------
    //   محاسبه تعداد روزها
    // ---------------------------------------------------------------
    private toEnglishNumber(str: string): string {
        if (!str) return str;
        const persian = '۰۱۲۳۴۵۶۷۸۹';
        return str.replace(/[۰-۹]/g, (d) => persian.indexOf(d).toString());
    }

    calculateDays(): void {
        let startStr = this.EditForm_LeaveRequest.get('LeaveStartDate')?.value;
        let endStr = this.EditForm_LeaveRequest.get('LeaveEndDate')?.value;
        if (!startStr || !endStr) return;

        startStr = this.toEnglishNumber(startStr);
        endStr = this.toEnglishNumber(endStr);

        const start = moment(startStr, 'jYYYY/jM/jD');
        const end = moment(endStr, 'jYYYY/jM/jD');

        if (!start.isValid() || !end.isValid()) return;
        if (end.isBefore(start)) {
            this.notify.error('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.');
            return;
        }

        let total = 0,
            work = 0,
            off = 0;
        let current = start.clone();

        while (current.isSameOrBefore(end, 'day')) {
            total++;
            const dayOfWeek = current.day(); // جمعه = 5
            const isHoliday = this.holidaysList.includes(current.format('jYYYY/jMM/jDD'));
            if (dayOfWeek === 5 || isHoliday) off++;
            else work++;
            current.add(1, 'day');
        }

        this.EditForm_LeaveRequest.patchValue({
            TotalDay: total.toString(),
            WorkDay: work.toString(),
            OffDay: off.toString(),
        });
    }

    // ---------------------------------------------------------------
    //   واکنش به تغییر نوع مرخصی
    // ---------------------------------------------------------------
    onLeaveTypeChange(): void {
        const type = this.EditForm_LeaveRequest.value.LeaveRequestType;
        if (type === 'مرخصي ساعتي') {
            this.showTimeFields = true;
            this.EditForm_LeaveRequest.patchValue({ LeaveStartTime: '', LeaveEndTime: '' });
        } else {
            this.showTimeFields = false;
            this.EditForm_LeaveRequest.patchValue({ LeaveStartTime: '00:00', LeaveEndTime: '23:59' });
        }
    }

    // ---------------------------------------------------------------
    // 💾 ثبت یا ویرایش فرم
    // ---------------------------------------------------------------
    submit(): void {
        this.EditForm_LeaveRequest.patchValue({ UserRef: this.CentralRef });

        if (!this.EditForm_LeaveRequest.valid) {
            this.notify.warning('لطفاً فیلدهای ضروری را تکمیل کنید.');
            return;
        }

        this.loadingService.show();

        const form = this.EditForm_LeaveRequest.value;
        const obs =
            this.LeaveRequestCode.length > 0
                ? this.repo.LeaveRequest_Update(form)
                : this.repo.LeaveRequest_Insert(form);

        obs.subscribe({
            next: (data: any) => {
                this.loadingService.hide();
                const success = data?.LeaveRequests?.[0]?.LeaveRequestCode?.length > 0;
                if (success) {
                    this.notify.success('  اطلاعات با موفقیت ثبت شد');
                    this.router.navigate(['/support/leaverequest-list']);
                } else {
                    this.notify.error('❌ خطا در ثبت اطلاعات');
                }
            },
            error: () => {
                this.loadingService.hide();
                this.notify.error('❌ خطای ارتباط با سرور');
            },
        });
    }
}
