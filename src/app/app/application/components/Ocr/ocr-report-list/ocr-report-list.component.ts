import { Component, OnInit } from '@angular/core';
import { OcrWebApiService } from '../../../services/OcrWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Base_Lookup } from 'src/app/app/kowsar/lookup-type';
import { IDatepickerTheme } from 'ng-persian-datepicker';

@Component({
  selector: 'app-ocr-report-list',
  templateUrl: './ocr-report-list.component.html',
})
export class OcrReportListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: OcrWebApiService,
  ) {
    super();
  }



  records;
  title = 'لیست کالاها ';
  dateValue = new FormControl('');

  Searchtarget: string = '';

  ReportType_lookup: Base_Lookup[] = [
    { id: "0", name: "لیست" },
    { id: "1", name: "چارت" },
  ]

  EditForm_ocr = new FormGroup({
    Searchtarget: new FormControl(''),
    SourceFlag: new FormControl(0),
  });




  GetOcrPanel_frm = new FormGroup({
    StartDate: new FormControl(''),
    EndDate: new FormControl(''),
    State: new FormControl("0"),
  });

  ToDayDate: string = '';

  loading: boolean = true;

  Report_State: string = '';

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',
  };

  start_dateValue = new FormControl();
  End_dateValue = new FormControl();
  loading1: boolean = true;
  loading2: boolean = true;
  loading3: boolean = true;
  loading4: boolean = true;
  loading5: boolean = true;
  loading6: boolean = true;
  loading7: boolean = true;


  columnChartData_state1: any
  columnChartCategories_state1: any

  columnChartData_state5: any
  columnChartCategories_state5: any


  columnChartData_state6: any
  columnChartCategories_state6: any
  columnChartData_state7: any
  columnChartCategories_state7: any


  series_state2: any
  labels_state2: any


  data_state1: any = [];
  data_state2: any = [];
  data_state5: any = [];
  data_state6: any = [];
  data_state7: any = [];


  onInputChange() {
    this.Report_State = this.GetOcrPanel_frm.value.State
    console.log(this.Report_State)

  }

  LoadList() {

    if (this.Report_State == "0") {
      this.LoadList_state_0()
    } else {
      this.LoadList_state_1()

    }

  }


  LoadList_state_0() {
    this.loading = true
    this.repo.GetOcrPanel(this.start_dateValue.value, this.End_dateValue.value, "6").subscribe((data) => {
      this.loading = false
      this.records = data;

    });

  }
  LoadList_state_1() {

    this.loading1 = true
    this.loading2 = true
    this.loading5 = true
    this.loading6 = true
    this.loading7 = true


    this.repo.GetOcrPanel(this.start_dateValue.value, this.End_dateValue.value, "1").subscribe((data) => {
      this.loading1 = false
      if (data.length > 0) {

        this.data_state1 = data
        this.columnChartData_state1 = [
          {
            name: 'خواننده',
            data: data.map(item => parseInt(item.ReadCount, 10))
          },
          {
            name: 'کنترل کننده',
            data: data.map(item => parseInt(item.ControlCount, 10))
          },
          {
            name: 'بسته بند',
            data: data.map(item => parseInt(item.PackCount, 10))
          }
        ];

        this.columnChartCategories_state1 = data.map(item => item.name);
      } else {
        this.data_state1 = []
      }

    });


    this.repo.GetOcrPanel(this.start_dateValue.value, this.End_dateValue.value, "2").subscribe((data) => {
      this.loading2 = false
      if (data.length > 0) {

        this.data_state2 = data

        this.series_state2 = data.map(item => parseInt(item.FactorCount, 10));
        console.log("this.series_state2")

        console.log(this.series_state2)
        this.labels_state2 = data.map(item => item.AppFactorState || 'نامشخص');

      } else {
        this.data_state2 = []
      }
    });


    this.repo.GetOcrPanel(this.start_dateValue.value, this.End_dateValue.value, "5").subscribe((data) => {
      this.loading5 = false
      if (data.length > 0) {

        this.data_state5 = data



        this.columnChartData_state1 = [
          {
            name: 'کسری',
            data: data.map(item => parseInt(item.ShortageAmount, 10))
          },

        ];

        this.columnChartCategories_state1 = data.map(item => item.GoodExplain4);




      } else {
        this.data_state5 = []
      }
    });



    this.repo.GetOcrPanel(this.start_dateValue.value, this.End_dateValue.value, "3").subscribe((data) => {
      this.loading6 = false
      if (data.length > 0) {

        this.data_state6 = data

        const factorKeys = Object.keys(data[0]).filter(key => key !== 'FactorDate' && key !== 'RowsCount');


        this.columnChartData_state6 = factorKeys.map(key => ({
          name: key,
          data: data.map(item => parseInt(item[key], 10))
        }));

        this.columnChartCategories_state6 = factorKeys;





      } else {
        this.data_state6 = []
      }
    });


    this.repo.GetOcrPanel(this.start_dateValue.value, this.End_dateValue.value, "4").subscribe((data) => {
      this.loading7 = false
      if (data.length > 0) {

        this.data_state7 = data

        const factorKeys = Object.keys(data[0]).filter(key => key !== 'FactorDate' && key !== 'SumAmount');


        this.columnChartData_state7 = factorKeys.map(key => ({
          name: key,
          data: data.map(item => parseInt(item[key], 10))
        }));

        this.columnChartCategories_state7 = factorKeys;


      } else {
        this.data_state7 = []
      }
    });










  }





  override ngOnInit(): void {
    super.ngOnInit();



    this.columnDefs = [
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

      this.Report_State = this.GetOcrPanel_frm.value.State
      this.loading = false
      this.records = data;

    });

  }


}






