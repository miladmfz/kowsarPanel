import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { InternalAppsWebApiService } from '../../../services/InternalAppsWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { CellActionModuleConfigList } from './cell_action_module_config_list';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-module-config-list',
  templateUrl: './module-config-list.component.html',
  standalone: true,

  // مهم‌ترین بخش!
  imports: [
    CommonModule,
    AgGridModule,
    RouterModule,
  ],
})
export class ModuleConfigListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  records = signal<any[]>([])
  title = signal('لیست پیش فرض سامانه')
  loading = signal(false)

  private readonly router = inject(Router);

  private readonly repo = inject(InternalAppsWebApiService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    super();
  }




  EditForm_ModuleConfig = new FormGroup({
    ModuleConfigCode: new FormControl(''),
    ConfigName: new FormControl(''),
    ConfigFCaption: new FormControl(''),
    ClassName: new FormControl('Web_site'),
    Explain: new FormControl(''),
    IsActive: new FormControl(''),
    ModuleValueCode: new FormControl(''),
    ModuleConfigRef: new FormControl(''),
    ValueName: new FormControl(''),
    ValueFCaption: new FormControl(''),
    Sort: new FormControl(''),
  });

  ngOnInit(): void {



    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionModuleConfigList,
        cellRendererParams: {
          editUrl: '/manager/application-form',
        },
        width: 80,
      },
      {
        field: 'ConfigName',
        headerName: 'عنوان لاتین',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ConfigFCaption',
        headerName: 'نام فارسی',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ClassName',
        headerName: 'دسته بندی',

        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.getList();
  }

  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    // ذخیره API درست
    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    // فیت کردن ستون‌ها با تأخیر کوتاه
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch { }
    }, 50);
  }


  getList(): void {

    this.repo.GetModuleConfig(this.EditForm_ModuleConfig.value).subscribe((data: any) => {

      this.records.set(data?.ModuleConfigs ?? [])
      this.updateGridData(1, this.records());
    });
  }

  navigateToEdit(data: any): void {

    this.router.navigate(['/internal/module-config-edit', data.ConfigName]);
  }


  btnDeleteClicked(data: any): void {


    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: 'حذف رکورئ',
        text: 'در صورت حذف، قابل بازیابی نخواهد بود.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'بله، حذف شود',
        cancelButtonText: 'انصراف',
        customClass: {
          confirmButton: 'btn btn-success mx-2',
          cancelButton: 'btn btn-danger',
        },
        buttonsStyling: false,
      }).then(result => {
        if (result.isConfirmed) {



          this.repo.DeleteModuleValue(data.ModuleValueCode).subscribe({
            next: () => {
              this.notificationService.succeded()
              setTimeout(() => this.getList(), 10);
            },
            error: () => {

              this.notificationService.error('❌ خطا در حذف رکورد')
            },
          });


        } else {
          this.notificationService.info('عملیات حذف لغو شد');
        }
      });
    });
  }

}