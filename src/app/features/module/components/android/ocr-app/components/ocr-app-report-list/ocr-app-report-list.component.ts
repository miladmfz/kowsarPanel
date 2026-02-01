import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarChartColumnComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-column/kowsar-chart-column.component';
import { KowsarChartPieComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-pie/kowsar-chart-pie.component';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { OcrWebApiService } from 'src/app/features/module/services/OcrWebApi.service';

@Component({
  selector: 'app-ocr-app-report-list',
  templateUrl: './ocr-app-report-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    FormsModule,
    NgPersianDatepickerModule,
    KowsarChartColumnComponent,
    KowsarChartPieComponent
  ],
})
export class OcrAppReportListComponent extends AgGridBaseComponent
  implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(OcrWebApiService);

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.columnDefs1 = [
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
  }


  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
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
  getList() {
    this.loadingService.show()
    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "6").subscribe((data: any) => {
      this.loadingService.hide()

      this.Report_State = this.GetOcrPanel_frm.value.State
      this.loading = false
      this.records = data;

    });

  }


  LoadList_state_0() {
    this.loading = true
    this.loadingService.show()
    this.repo.GetOcrPanel(this.start_dateValue.value, this.End_dateValue.value, "6").subscribe((data: any) => {
      this.loadingService.hide()
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


    this.loadingService.show()
    this.repo.GetOcrPanel(this.start_dateValue.value, this.End_dateValue.value, "1").subscribe((data: any) => {
      this.loadingService.hide()
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


    this.loadingService.show()
    this.repo.GetOcrPanel(this.start_dateValue.value, this.End_dateValue.value, "2").subscribe((data: any) => {
      this.loadingService.hide()
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


    this.loadingService.show()
    this.repo.GetOcrPanel(this.start_dateValue.value, this.End_dateValue.value, "5").subscribe((data: any) => {
      this.loadingService.hide()
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


    this.loadingService.show()
    this.repo.GetOcrPanel(this.start_dateValue.value, this.End_dateValue.value, "3").subscribe((data: any) => {
      this.loadingService.hide()
      this.loadingService.show()
      this.repo.GetOcrPanel("1402/07/08", "1402/07/11", "3").subscribe((data: any) => {
        this.loadingService.hide()

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


      this.loadingService.show()
      this.repo.GetOcrPanel(this.start_dateValue.value, this.End_dateValue.value, "4").subscribe((data: any) => {
        this.loadingService.hide()

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
    });







  }

}

