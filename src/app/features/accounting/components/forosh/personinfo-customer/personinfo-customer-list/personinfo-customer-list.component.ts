import { Component, inject, OnDestroy, OnInit, Renderer2, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { PersonInfoWebApiService } from 'src/app/features/accounting/services/ForoshWebApi/PersonInfoWebApi.service';
import { CellActionPersonInfoCustomerList } from './cell-action-personinfo-list-customer';
import Swal from 'sweetalert2';
import * as bootstrap from 'bootstrap';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    RouterModule,
  ],
  selector: 'app-personinfo-customer-list',
  templateUrl: './personinfo-customer-list.component.html',
})
export class PersoninfoCustomerListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  private readonly repo = inject(PersonInfoWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly renderer = inject(Renderer2);
  private readonly gridMemory_service = inject(AgGridMemoryService);
  protected readonly session = inject(SessionStorageService);

  constructor() {
    super();
  }


  title = signal('مدیریت مشترکین')

  ClassName = signal('PhoneBook')

  records = signal<any[]>([])

  XUserName_selected = signal('')
  PersonInfoCode_selected = signal('')
  mobile_selected = signal('')

  gridMemory1 = new Map<string, any>();
  gridKey = signal('');
  dateValue = new FormControl();
  private searchSubject = new Subject<string>();

  Searchtarget = signal('')

  EditForm_Search = new FormGroup({
    SearchTarget: new FormControl(''),
    ObjectRef: new FormControl(''),
  });


  EditForm_FiscalPeriod = new FormGroup({
    PeriodId: new FormControl(''),
    comment: new FormControl(''),
    FromDate: new FormControl(''),
    ToDate: new FormControl(''),
    State: new FormControl(''),
  });


  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });

    this.getGridSchema();
  }


  onSearchChange() {
    const value = this.EditForm_Search.get('SearchTarget')?.value ?? '';
    this.searchSubject.next(value);
  }

  AddNew() {
    this.router.navigate(['/accounting/forosh/personinfo-customer-edit']);
  }

  getGridSchema() {


    this.base_repo.GetGridSchemaVisible("T" + this.ClassName())
      .subscribe((data: any) => {

        if (data && data.GridSchemas && data.GridSchemas.length > 0) {
          this.column_name_1 = data.GridSchemas.filter(schema => schema.Visible === "True").map(schema => ({
            field: schema.FieldName,
            headerName: schema.Caption,
            cellClass: 'text-center',
            filter: 'agSetColumnFilter',
            sortable: true,
            resizable: true,
            width: parseInt(schema.Width) + 100,
            valueFormatter: schema.Separator === '1' ? this.customNumberFormatter : undefined
          }));

          this.column_name_1.unshift({
            field: 'عملیات',
            pinned: 'left',
            cellRenderer: CellActionPersonInfoCustomerList,

            minWidth: 120,
            sortable: false,
            filter: false,
            // resizable: false
          });
        }
        const memory = this.gridMemory_service.get(this.gridKey());
        if (memory?.rowData) {
          this.records.set(memory.rowData);
        } else {
          this.GetData();
        }

      });
  }


  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    setTimeout(() => {
      if (params.api && !params.api.isDestroyed?.()) {
        params.api.sizeColumnsToFit();
      }
    }, 50);
  }

  override onFirstDataRendered(params: any) {
    const memory = this.gridMemory_service.get(this.gridKey());
    if (!params.api || params.api.isDestroyed?.()) return;

    if (memory?.columnState) {
      params.api.applyColumnState({ state: memory.columnState, applyOrder: true });
    }

    if (memory?.filterState) {
      params.api.setFilterModel(memory.filterState);
    }

    if (memory?.rowData) {
      this.records.set(memory.rowData);
    } else {
      this.GetData();
    }
  }

  onGridStateChanged() {
    const api = this.gridApi1;
    if (!api) return;

    this.gridMemory_service.save(this.gridKey(), {
      columnState: api.getColumnState(),
      filterState: api.getFilterModel()
    });
  }


  GetData() {
    this.EditForm_Search.patchValue({

      ObjectRef: this.session.CustomerCode,

    });


    this.repo.GetPersonInfo_Customer(this.EditForm_Search.value)
      .subscribe((data: any) => {

        this.records.set(data.PersonInfos)
        this.updateGridData(1, this.records());

      });
  }



  ResetXUserPassword(data: any) {




    this.SwalAlarm_ResetXUserPassword().then((result) => {
      if (result.isConfirmed) {
        this.repo.ResetXUserPassword(data.XUserName)
          .subscribe((data: any) => {

            this.notificationService.success

          });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.notificationService.warning('تغییری نکرد');
      }
    });





  }


  SwalAlarm_ResetXUserPassword() {
    return Swal.fire({
      title: 'ریست رمز عبور',
      text: 'رمز عبور کاربر به Aa@123456 تغییر کند  ؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله',
      cancelButtonText: 'خیر',
      customClass: {
        confirmButton: 'btn btn-success mx-2',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
  }




  navigateToEdit(data) {
    this.router.navigate(['/accounting/forosh/personinfo-customer-edit', data.PersonInfoCode]);
  }

  UserConfig(data) {

    this.openUserManageModal(data)

  }


  userManageModal: any;
  isSavingUserManage = signal(false);

  userManageForm = this.fb.group(
    {
      PhFullName: [''],
      XUserName: [''],

      actionType: ['changeStatus'],

      newUserName: [''],
      newPassword: [''],
      confirmPassword: [''],

      isActive: [true],

      smsLoginEnabled: [false],
      mobile: [''],
    },
    {
      validators: [this.userManageValidator()],
    });

  openUserManageModal(data?: any): void {
    const el = document.getElementById('userManageModal');
    if (!el) return;

    document.body.appendChild(el);

    this.userManageForm.reset({

      PhFullName: data?.PhFullName ?? '',
      XUserName: data?.XUserName ?? '',

      actionType: 'changeStatus',


      newUserName: data?.XUserName ?? '',
      newPassword: '',
      confirmPassword: '',

      isActive: data?.Active === true || data?.Active === 'True' || data?.Active === 1,
      smsLoginEnabled: data?.AuthSms === true || data?.AuthSms === 'True' || data?.AuthSms === 1,
      mobile: data?.PhMobile1 ?? data?.Mobile ?? '',
    });

    this.PersonInfoCode_selected.set(data?.PersonInfoCode ?? '')
    this.XUserName_selected.set(data?.XUserName ?? '')
    this.mobile_selected.set(data?.PhMobile1 ?? '')


    if (this.XUserName_selected().length == 0) {
      this.userManageForm.patchValue({
        actionType: 'changeUserName'
      });
    }

    this.userManageForm.markAsPristine();
    this.userManageForm.markAsUntouched();

    this.userManageModal = bootstrap.Modal.getOrCreateInstance(el, {
      backdrop: 'static',
      keyboard: false,
    });

    this.userManageModal.show();
  }
  userManageValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const actionType = form.get('actionType')?.value;

      const newUserName = form.get('newUserName')?.value;
      const newPassword = form.get('newPassword')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;
      const smsLoginEnabled = form.get('smsLoginEnabled')?.value;
      const mobile = form.get('mobile')?.value;

      if (actionType === 'changeUserName' && !newUserName) {
        return { newUserNameRequired: true };
      }

      if (actionType === 'changePassword') {
        if (!newPassword || !confirmPassword) {
          return { passwordRequired: true };
        }

        if (newPassword !== confirmPassword) {
          return { passwordMismatch: true };
        }
      }

      if (actionType === 'smsLogin' && smsLoginEnabled && !mobile) {
        return { mobileRequired: true };
      }

      return null;
    };
  }


  submitUserManage(): void {

    if (this.userManageForm.invalid) {
      this.userManageForm.markAllAsTouched();
      return;
    }

    this.isSavingUserManage.set(true);

    const value = this.userManageForm.value;
    const actionType = value.actionType;


    // =====================================================
    // تغییر / ایجاد نام کاربری
    // =====================================================

    if (actionType === 'changeUserName') {

      // کاربر هنوز XUser ندارد
      if (this.XUserName_selected().length === 0) {

        const payload = {
          PersonInfoRef: this.PersonInfoCode_selected(),
          XUserName: value.newUserName,
          XUserPass: "Aa@123456",
        };

        this.repo.SetPersonInfo_XUserNew(payload).subscribe({

          next: (data: any) => {

            this.isSavingUserManage.set(false);

            this.notificationService.succeded();

            this.userManageModal?.hide();

            this.GetData();
          },

          error: () => {

            this.isSavingUserManage.set(false);

            this.notificationService.error('خطا در ارسال اطلاعات');
          },

        });

        return;
      }


      // کاربر XUser دارد و فقط نام کاربری عوض می‌شود
      const payload = {
        PersonInfoRef: this.PersonInfoCode_selected(),
        XUserName: value.newUserName,
      };

      this.repo.SetPersonInfo_XUserName(payload).subscribe({

        next: (data: any) => {

          this.isSavingUserManage.set(false);

          this.notificationService.succeded();

          this.userManageModal?.hide();

          this.GetData();
        },

        error: () => {

          this.isSavingUserManage.set(false);

          this.notificationService.error('خطا در ارسال اطلاعات');
        },

      });

      return;
    }


    // =====================================================
    // تغییر رمز عبور
    // =====================================================

    if (actionType === 'changePassword') {

      const payload = {
        PersonInfoRef: this.PersonInfoCode_selected(),
        XUserPass: value.newPassword,
      };

      this.repo.SetPersonInfo_XUserPass(payload).subscribe({

        next: (data: any) => {

          this.isSavingUserManage.set(false);

          this.notificationService.succeded();

          this.userManageModal?.hide();
        },

        error: () => {

          this.isSavingUserManage.set(false);

          this.notificationService.error('خطا در ارسال اطلاعات');
        },

      });

      return;
    }


    // اگر actionType هیچکدام نبود
    this.isSavingUserManage.set(false);
  }

  isUserManageInvalid(controlName: string): boolean {
    const control = this.userManageForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }




  onUserActiveChange(): void {

    const isActive = this.userManageForm.get('isActive')?.value ?? false;

    const isActive_str = isActive ? "1" : "0";

    this.repo.SetPersonInfo_XUserActive(
      this.PersonInfoCode_selected(),
      isActive_str
    ).subscribe({
      next: (data: any) => {

        this.notificationService.succeded();

      },
      error: () => {

        this.notificationService.error('خطا در ارسال اطلاعات');

      },
    });

  }

  onSmsLoginChange(event: Event): void {

    const enabled = (event.target as HTMLInputElement).checked;

    const enabled_str = enabled ? "1" : "0";





    this.repo.SetPersonInfo_XUserAuthSms(this.PersonInfoCode_selected(), enabled_str).subscribe({
      next: (data: any) => {

        this.notificationService.succeded();

      },
      error: () => {

        this.notificationService.error('خطا در ارسال اطلاعات');

      },
    });

  }



}
