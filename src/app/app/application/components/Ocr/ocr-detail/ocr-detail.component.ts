import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { OcrWebApiService } from '../../../services/OcrWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
declare var ApexCharts: any;

@Component({
  selector: 'app-ocr-detail',
  templateUrl: './ocr-detail.component.html',
})
export class OcrDetailComponent extends AgGridBaseComponent
  implements OnInit {
  constructor(
    private repo: OcrWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder
  ) { super(); }

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


  override ngOnInit(): void {
    super.ngOnInit();



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
    this.repo.GetTodeyFromServer("-1").subscribe(e => {

      this.ToDayDate = e[0].TodeyFromServer
      this.getList();
    });



  }

  getList() {



    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "6").subscribe((data) => {

      this.loading1 = false
      //this.records_ocr_factors = data;

    });

    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "6").subscribe((data) => {

      this.loading2 = false
      //this.record_factor_headers = data;

    });
    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "6").subscribe((data) => {

      this.loading3 = false
      //this.record_factor_rows = data;

    });

    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "6").subscribe((data) => {

      this.loading4 = false
      this.radial_value_1 = 30;
      this.radial_value_11 = 3000;

    });

    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "6").subscribe((data) => {

      this.loading5 = false
      this.radial_value_2 = 60;
      this.radial_value_22 = 6000;
    });
    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "6").subscribe((data) => {

      this.loading6 = false
      this.radial_value_3 = 90;
      this.radial_value_33 = 9000;
    });

  }



}




