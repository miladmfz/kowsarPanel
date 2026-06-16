import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarChartRadialComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-radial/kowsar-chart-radial.component';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { OcrWebApiService } from 'src/app/features/module/services/OcrWebApi.service';

@Component({
  selector: 'app-ocr-app-panel',
  templateUrl: './ocr-app-panel.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    KowsarChartRadialComponent

  ],
})
export class OcrAppPanelComponent extends AgGridBaseComponent
  implements OnInit {


  private readonly repo = inject(OcrWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);

  constructor() {
    super();
  }


  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }


  records = signal<any[]>([])

  records_ocr_factors = signal<any[]>([]);
  record_factor_headers = signal<any[]>([]);
  record_factor_rows = signal<any[]>([]);

  ToDayDate = signal('')

  loading1 = signal(true)
  loading2 = signal(true)
  loading3 = signal(true)
  loading4 = signal(true)
  loading5 = signal(true)
  loading6 = signal(true)


  public radial_value_1 = signal(20)
  public radial_value_2 = signal(40)
  public radial_value_3 = signal(60)

  public radial_value_11 = signal(2000)
  public radial_value_22 = signal(4000)
  public radial_value_33 = signal(6000)


  ngOnInit(): void {
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });


    this.column_name_1 = [
      {
        field: 'name',
        headerName: 'نام شخص',

        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'CustName',
        headerName: 'خوانده',

        cellClass: 'text-center',
        minWidth: 250
      },
      {
        field: 'FactorDate',
        headerName: 'کنترل کرده',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CustomerCode',
        headerName: 'بسته بندی',

        cellClass: 'text-center',
        minWidth: 150
      },

    ];


    this.columnDefs2 = [
      {
        field: 'name',
        headerName: 'نام شخص',

        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'CustName',
        headerName: 'نام واحد',

        cellClass: 'text-center',
        minWidth: 250
      },
      {
        field: 'FactorDate',
        headerName: 'تعداد ',

        cellClass: 'text-center',
        minWidth: 150
      },

    ];


    this.columnDefs3 = [
      {
        field: 'dbname',
        headerName: 'نام دیتابیس',

        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'CustName',
        headerName: 'نام مشتری',

        cellClass: 'text-center',
        minWidth: 250
      },
      {
        field: 'FactorDate',
        headerName: 'تاریخ فاکتور',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CustomerCode',
        headerName: 'کد مشتری',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'توضیحات',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CustomerPath',
        headerName: 'منطقه',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'AppFactorState',
        headerName: 'وضعیت فاکتور',

        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.base_repo.GetTodeyFromServer_Days("-1")
      .subscribe(e => {

        this.ToDayDate.set(e[0].TodeyFromServer)
        this.getList();
      });



  }

  getList() {




    this.repo.GetOcrPanel(this.ToDayDate(), this.ToDayDate(), "6")
      .subscribe((data: any) => {

        this.loading1.set(false)
        this.records_ocr_factors.set(data)

      });


    this.repo.GetOcrPanel(this.ToDayDate(), this.ToDayDate(), "6")
      .subscribe((data: any) => {

        this.loading2.set(false)
        this.record_factor_headers.set(data)

      });

    this.repo.GetOcrPanel(this.ToDayDate(), this.ToDayDate(), "6")
      .subscribe((data: any) => {

        this.loading3.set(false)
        this.record_factor_rows.set(data)

      });


    this.repo.GetOcrPanel(this.ToDayDate(), this.ToDayDate(), "6")
      .subscribe((data: any) => {

        this.loading4.set(false)
        this.radial_value_1.set(30);
        this.radial_value_11.set(3000);

      });


    this.repo.GetOcrPanel(this.ToDayDate(), this.ToDayDate(), "6")
      .subscribe((data: any) => {

        this.loading5.set(false)
        this.radial_value_2.set(60);
        this.radial_value_22.set(6000);
      });

    this.repo.GetOcrPanel(this.ToDayDate(), this.ToDayDate(), "6")
      .subscribe((data: any) => {

        this.loading6.set(false)
        this.radial_value_3.set(90);
        this.radial_value_33.set(9000);
      });

  }



}




