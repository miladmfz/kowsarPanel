import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { KowsarChartColumnComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-column/kowsar-chart-column.component';
import { KowsarChartPieComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-pie/kowsar-chart-pie.component';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { OcrWebApiService } from 'src/app/features/module/services/OcrWebApi.service';

@Component({
  selector: 'app-ocr-app-report-chart',
  templateUrl: './ocr-app-report-chart.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    KowsarChartColumnComponent,
    KowsarChartPieComponent
  ],
})
export class OcrAppReportChartComponent implements OnInit {

  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(OcrWebApiService);

  constructor() { }


  GetOcrPanel_frm = new FormGroup({
    StartDate: new FormControl(''),
    EndDate: new FormControl(''),
    State: new FormControl(''),
  });

  ToDayDate: string = '';



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

  series_state3: any
  labels_state3: any

  series_state4: any
  labels_state4: any


  data_state1: any = [];
  data_state2: any = [];
  data_state3: any = [];
  data_state4: any = [];
  data_state5: any = [];
  data_state6: any = [];
  data_state7: any = [];



  LoadList() {

    this.loading1 = true
    this.loading2 = true
    this.loading3 = true
    this.loading4 = true
    this.loading5 = true
    this.loading6 = true
    this.loading7 = true

    this.loadingService.show()
    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "1")
      .subscribe((data: any) => {
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
    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "2")
      .subscribe((data: any) => {
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
    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "3")
      .subscribe((data: any) => {
        this.loading3 = false
        if (data.length > 0) {

          this.data_state3 = data

          const factorKeys = Object.keys(data[0]).filter(key => key !== 'FactorDate' && key !== 'RowsCount');

          this.series_state3 = factorKeys.map(key => (parseInt(data[0][key], 10)));
          console.log("this.series_state3")

          console.log(this.series_state3)
          this.labels_state3 = factorKeys;



        } else {
          this.data_state3 = []
        }
      });


    this.loadingService.show()
    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "4")
      .subscribe((data: any) => {
        this.loading4 = false
        if (data.length > 0) {

          this.data_state4 = data


          const factorKeys = Object.keys(data[0]).filter(key => key !== 'FactorDate' && key !== 'SumAmount');
          this.series_state4 = factorKeys.map(key => (parseInt(data[0][key], 10)));
          this.labels_state4 = factorKeys;


        } else {
          this.data_state4 = []
        }
      });


    this.loadingService.show()
    this.repo.GetOcrPanel(this.ToDayDate, this.ToDayDate, "5")
      .subscribe((data: any) => {
        this.loading5 = false
        if (data.length > 0) {

          this.data_state5 = data

          this.columnChartData_state5 = [
            {
              name: 'کسری',
              data: data.map(item => parseInt(item.ShortageAmount, 10))
            },

          ];

          this.columnChartCategories_state5 = data.map(item => item.GoodExplain4);
        } else {
          this.data_state5 = []
        }
      });



  }


  ngOnInit(): void {

    this.loadingService.show()
    this.repo.GetTodeyFromServer("0")
      .subscribe(e => {

        //this.ToDayDate = e[0].TodeyFromServer
        this.ToDayDate = '1402/07/01'
        this.LoadList();
      });

  }

}
