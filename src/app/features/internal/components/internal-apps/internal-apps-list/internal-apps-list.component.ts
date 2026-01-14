import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';


// 🔵 AG Grid
import { AgGridModule } from 'ag-grid-angular';

// 🔵 Renderer های سفارشی
import { CellActionApplicationList } from './cell_action_application_list';
import { LableAppTypeAppActivation } from './lable-apptype-appactivation';

// 🔵 Library
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { LableIsActiveAppActivation } from './lable-isactive-appactivation copy';
import { InternalAppsWebApiService } from '../../../services/InternalAppsWebApi.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './internal-apps-list.component.html',
  standalone: true,

  // مهم‌ترین بخش!
  imports: [
    CommonModule,
    AgGridModule,
    RouterModule,
  ],
})
export class InternalAppsListComponent
  extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  records: any;
  title = 'لیست مشتریان سامانه';
  loading = false;

  constructor(
    private repo: InternalAppsWebApiService,
    private readonly router: Router,
    private notify: NotificationService,

  ) {
    super();
  }


  ngOnInit(): void {



    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionApplicationList,
        cellRendererParams: {
          editUrl: '/manager/application-form',
        },
        minWidth: 150,
      },
      {
        field: 'ActivationCode',
        headerName: 'کد فعال سازی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'PersianCompanyName',
        headerName: 'نام فارسی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ServerIp',
        headerName: 'آدرس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ServerPort',
        headerName: 'پورت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ServerPathApi',
        headerName: 'نام پوشه',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'AppType',
        headerName: 'نوع نرم افزار',
        filter: 'agSetColumnFilter',
        cellRenderer: LableAppTypeAppActivation,
        cellClass: 'text-center',
      },
      {
        field: 'IsActive',
        headerName: 'وضعیت',
        filter: 'agSetColumnFilter',
        cellRenderer: LableIsActiveAppActivation,
        cellClass: 'text-center',
      }
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
    this.repo.GetAppActivation().subscribe((data: any) => {
      this.records = data?.AppActivations ?? [];
      this.updateGridData(1, this.records);
    });
  }

  navigateToEdit(id: any): void {
    this.router.navigate(['/internal/internal-apps-edit', id]);
  }


  btnDeleteClicked(data: any): void {
    if (data.IsActive === "1") {
      this.notify.error('⛔ این آیتم فعال می‌باشد.');
      return;
    }

    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: 'حذف تیکت؟',
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


          this.repo.DeleteAppActivation(data.AppActivationCode).subscribe({
            next: () => {
              this.notify.succeded()
              setTimeout(() => this.getList(), 10);
            },
            error: () => this.notify.error('❌ خطا در حذف رکورد'),
          });


        } else {
          this.notify.info('عملیات حذف لغو شد');
        }
      });
    });
  }



  // CheckPort(data: any): void {
  //   this.loading = true;

  //   const ip = data.ServerURL.match(/\/\/(.*?):/)[1];
  //   const port = data.ServerURL.match(/:(\d+)\//)[1];

  //   this.repo.CheckPort(ip, port).subscribe((e: any) => {
  //     this.loading = false;

  //     if (e.status === "open") {
  //       Swal.fire({
  //         title: data.PersianCompanyName + ' پورت فعال می باشد. ',
  //         icon: 'success',
  //       });
  //     } else {
  //       Swal.fire(
  //         data.PersianCompanyName + ' اتصال پورت برقرار نیست ',
  //         'error'
  //       );
  //     }
  //   });
  // }
}
