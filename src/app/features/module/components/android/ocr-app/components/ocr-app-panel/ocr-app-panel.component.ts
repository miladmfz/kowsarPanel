import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarChartRadialComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-radial/kowsar-chart-radial.component';
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
  constructor(
    private repo: OcrWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
  ) {
    super();
  }


  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }


  records;

  records_ocr_factors
  record_factor_headers
  record_factor_rows

  ToDayDate: string = '';

  loading1: boolean = true;
  loading2: boolean = true;
  loading3: boolean = true;
  loading4: boolean = true;
  loading5: boolean = true;
  loading6: boolean = true;


  public radial_value_1: number = 20;
  public radial_value_2: number = 40;
  public radial_value_3: number = 60;

  public radial_value_11: number = 2000;
  public radial_value_22: number = 4000;
  public radial_value_33: number = 6000;


  ngOnInit(): void {
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });


    this.columnDefs1 = [
      {
        field: 'name',
        headerName: 'نام شخص',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'CustName',
        headerName: 'خوانده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 250
      },
      {
        field: 'FactorDate',
        headerName: 'کنترل کرده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CustomerCode',
        headerName: 'بسته بندی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];


    this.columnDefs2 = [
      {
        field: 'name',
        headerName: 'نام شخص',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'CustName',
        headerName: 'نام واحد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 250
      },
      {
        field: 'FactorDate',
        headerName: 'تعداد ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];


    this.columnDefs3 = [
      {
        field: 'dbname',
        headerName: 'نام دیتابیس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'CustName',
        headerName: 'نام مشتری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 250
      },
      {
        field: 'FactorDate',
        headerName: 'تاریخ فاکتور',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CustomerCode',
        headerName: 'کد مشتری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'توضیحات',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CustomerPath',
        headerName: 'منطقه',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'AppFactorState',
        headerName: 'وضعیت فاکتور',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];
    this.repo.GetTodeyFromServer("-1")
      .subscribe(e => {

        this.ToDayDate = e[0].TodeyFromServer
        this.getList();
      });



  }

  getList() {



    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "6")
      .subscribe((data) => {

        this.loading1 = false
        this.records_ocr_factors = data;

      });

    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "6")
      .subscribe((data) => {

        this.loading2 = false
        this.record_factor_headers = data;

      });
    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "6")
      .subscribe((data) => {

        this.loading3 = false
        this.record_factor_rows = data;

      });

    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "6")
      .subscribe((data) => {

        this.loading4 = false
        this.radial_value_1 = 30;
        this.radial_value_11 = 3000;

      });

    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "6")
      .subscribe((data) => {

        this.loading5 = false
        this.radial_value_2 = 60;
        this.radial_value_22 = 6000;
      });
    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "6")
      .subscribe((data) => {

        this.loading6 = false
        this.radial_value_3 = 90;
        this.radial_value_33 = 9000;
      });

  }



}




