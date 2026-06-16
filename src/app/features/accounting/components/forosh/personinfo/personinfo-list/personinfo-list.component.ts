import { Component, inject, OnDestroy, OnInit, Renderer2, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { DbSetupWebApiService } from 'src/app/features/accounting/services/TanzimatWebApi/DbSetupWebApi.service';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { Subject } from 'rxjs';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import Swal from 'sweetalert2';
import { PersonInfoWebApiService } from 'src/app/features/accounting/services/ForoshWebApi/PersonInfoWebApi.service';
import { CellActionPersonInfoList } from './cell-action-personinfo-list';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import * as bootstrap from 'bootstrap';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    RouterModule,
  ],
  selector: 'app-personinfo-list',
  templateUrl: './personinfo-list.component.html',
})
export class PersoninfoListComponent extends AgGridBaseComponent
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

  gridMemory1 = new Map<string, any>();
  gridKey = signal('');
  dateValue = new FormControl();
  private searchSubject = new Subject<string>();

  Searchtarget = signal('')

  EditForm_Search = new FormGroup({
    SearchTarget: new FormControl(''),
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
    this.notificationService.develop()
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
            minWidth: parseInt(schema.Width) + 100,
            valueFormatter: schema.Separator === '1' ? this.customNumberFormatter : undefined
          }));

          this.column_name_1.unshift({
            field: 'عملیات',
            pinned: 'left',
            cellRenderer: CellActionPersonInfoList,

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


    this.repo.GetPersonInfo(this.EditForm_Search.value)
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
    this.router.navigate(['/accounting/forosh/personinfo-edit', data.PersonInfoCode]);
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
      smsLoginEnabled: data?.SmsLoginEnabled === true || data?.SmsLoginEnabled === 'True' || data?.SmsLoginEnabled === 1,
      mobile: data?.PhMobile1 ?? data?.Mobile ?? '',
    });

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

    const payload = {
      UName: this.session.userName,
      ActionType: value.actionType,

      NewUserName: value.newUserName,
      NewPassword: value.newPassword,

      IsActive: value.isActive,
      SmsLoginEnabled: value.smsLoginEnabled,
      Mobile: value.mobile,
    };

    this.repo.ChangeXUserInfo(payload).subscribe({
      next: (data: any) => {
        if (data.users?.[0]?.ErrDesc?.length > 0) {
          this.notificationService.error(data.users[0].ErrDesc);
        } else {
          this.notificationService.succeded();
          this.userManageModal?.hide();
        }

        this.isSavingUserManage.set(false);

      },
      error: () => {
        this.isSavingUserManage.set(false);
        this.notificationService.error('خطا در ارسال اطلاعات');

      },
    });
  }
  isUserManageInvalid(controlName: string): boolean {
    const control = this.userManageForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
