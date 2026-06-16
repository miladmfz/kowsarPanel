import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { KowsarChartColumnComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-column/kowsar-chart-column.component';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
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
    // KowsarChartPieComponent
  ],
})
export class OcrAppReportChartComponent implements OnInit {


  private readonly repo = inject(OcrWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);

  constructor() { }


  GetOcrPanel_frm = new FormGroup({
    StartDate: new FormControl(''),
    EndDate: new FormControl(''),
    State: new FormControl(''),
  });

  ToDayDate = signal('')



  loading1 = signal(true)
  loading2 = signal(true)
  loading3 = signal(true)
  loading4 = signal(true)
  loading5 = signal(true)
  loading6 = signal(true)
  loading7 = signal(true)


  columnChartData_state1 = signal<any[]>([])
  columnChartCategories_state1 = signal<any[]>([])

  columnChartData_state5 = signal<any[]>([])
  columnChartCategories_state5 = signal<any[]>([])


  columnChartData_state6 = signal<any[]>([])
  columnChartCategories_state6 = signal<any[]>([])
  columnChartData_state7 = signal<any[]>([])
  columnChartCategories_state7 = signal<any[]>([])


  series_state2 = signal<any[]>([])
  labels_state2 = signal<any[]>([])

  series_state3 = signal<any[]>([])
  labels_state3 = signal<any[]>([])

  series_state4 = signal<any[]>([])
  labels_state4 = signal<any[]>([])


  data_state1 = signal<any[]>([])
  data_state2 = signal<any[]>([])
  data_state3 = signal<any[]>([])
  data_state4 = signal<any[]>([])
  data_state5 = signal<any[]>([])
  data_state6 = signal<any[]>([])
  data_state7 = signal<any[]>([])



  LoadList() {

    this.loading1.set(true)
    this.loading2.set(true)
    this.loading3.set(true)
    this.loading4.set(true)
    this.loading5.set(true)
    this.loading6.set(true)
    this.loading7.set(true)


    this.repo.GetOcrPanel(this.ToDayDate(), this.ToDayDate(), "1")
      .subscribe((data: any) => {
        this.loading1.set(false)
        if (data.length > 0) {

          this.data_state1 = data
          this.columnChartData_state1.set([
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
          ])

          this.columnChartCategories_state1 = data.map(item => item.name);
        } else {
          this.data_state1.set([])
        }

      });



    this.repo.GetOcrPanel(this.ToDayDate(), this.ToDayDate(), "2")
      .subscribe((data: any) => {
        this.loading2.set(false)
        if (data.length > 0) {

          this.data_state2 = data

          this.series_state2 = data.map(item => parseInt(item.FactorCount, 10));

          this.labels_state2 = data.map(item => item.AppFactorState || 'نامشخص');

        } else {
          this.data_state2.set([])
        }
      });



    this.repo.GetOcrPanel(this.ToDayDate(), this.ToDayDate(), "3")
      .subscribe((data: any) => {
        this.loading3.set(false)
        if (data.length > 0) {

          this.data_state3 = data

          const factorKeys = Object.keys(data[0]).filter(key => key !== 'FactorDate' && key !== 'RowsCount');

          this.series_state3.set(factorKeys.map(key => (parseInt(data[0][key], 10))))

          this.labels_state3.set(factorKeys)



        } else {
          this.data_state3.set([])
        }
      });



    this.repo.GetOcrPanel(this.ToDayDate(), this.ToDayDate(), "4")
      .subscribe((data: any) => {
        this.loading4.set(false)
        if (data.length > 0) {

          this.data_state4 = data


          const factorKeys = Object.keys(data[0]).filter(key => key !== 'FactorDate' && key !== 'SumAmount');
          this.series_state4.set(factorKeys.map(key => (parseInt(data[0][key], 10))))
          this.labels_state4.set(factorKeys)


        } else {
          this.data_state4.set([])
        }
      });



    this.repo.GetOcrPanel(this.ToDayDate(), this.ToDayDate(), "5")
      .subscribe((data: any) => {
        this.loading5.set(false)
        if (data.length > 0) {

          this.data_state5 = data

          this.columnChartData_state5.set([
            {
              name: 'کسری',
              data: data.map(item => parseInt(item.ShortageAmount, 10))
            },

          ])

          this.columnChartCategories_state5 = data.map(item => item.GoodExplain4);
        } else {
          this.data_state5.set([])
        }
      });



  }


  ngOnInit(): void {


    this.base_repo.GetTodeyFromServer_Days("0")
      .subscribe(e => {

        //this.ToDayDate = e[0].TodeyFromServer
        this.ToDayDate.set('1402/07/01')
        this.LoadList();
      });

  }

}
