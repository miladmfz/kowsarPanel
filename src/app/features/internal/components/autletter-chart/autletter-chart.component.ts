import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, Renderer2, signal } from '@angular/core';
import { KowsarChartColumnComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-column/kowsar-chart-column.component';
import { FormControl, FormGroup } from '@angular/forms';
import { KowsarChartPieComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-pie/kowsar-chart-pie.component';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    KowsarChartColumnComponent,

    KowsarChartPieComponent,
  ],
  selector: 'app-autletter-chart',
  templateUrl: './autletter-chart.component.html',
})
export class AutletterChartComponent implements OnInit {
  @Input() CentralRef = ""


  private readonly base_repo = inject(KowsarBaseWebApi);

  constructor() {

  }

  columnChartData = signal<any[]>([])
  columnChartCategories = signal<any[]>([])


  ChartData_Array_Number = signal<any[]>([])
  ChartData_Array_Title = signal<any[]>([])

  KowsarReports_data = signal<any[]>([])
  Title = signal('')



  EditForm_KowsarReport1 = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl('0'),
    LetterRowCode: new FormControl('0'),
    Flag: new FormControl(''),
    DateTarget: new FormControl(''),
  });

  ngOnInit() {

    console.log(this.CentralRef)

    this.EditForm_KowsarReport1.patchValue({
      CentralRef: this.CentralRef,
      Flag: "4",
    });

    if (this.CentralRef === "0") {

      this.Title.set("وضعیت تیکت ها")
    } else {
      this.Title.set("وضعیت تیکت های من")

    }


    this.Getdata()

  }



  Getdata() {

    this.base_repo.GetKowsarReport(this.EditForm_KowsarReport1.value).subscribe({
      next: (data: any) => {

        this.KowsarReports_data.set(data?.KowsarReports ?? [])


        if (this.CentralRef === "0") {

          this.columnChartData.set([])
          this.columnChartCategories.set([])


          this.columnChartData.set([
            // {
            //   name: 'تعداد کل',
            //   data: this.KowsarReports_data().map(item => parseInt(item.TotalLetters, 10))
            // },
            {
              name: 'دیده نشده',
              data: this.KowsarReports_data().map(item => parseInt(item.Unread, 10))
            },
            {
              name: 'منتظر اقدام',
              data: this.KowsarReports_data().map(item => parseInt(item.WaitingAction, 10))
            },
            {
              name: 'در حال انجام',
              data: this.KowsarReports_data().map(item => parseInt(item.InProgress, 10))
            },

            // {
            //   name: 'تمام شده',
            //   data: this.KowsarReports_data().map(item => parseInt(item.Completed, 10))
            // },



          ])


          this.columnChartCategories.set(this.KowsarReports_data().map(item => item.Name))

        } else {


          this.ChartData_Array_Number.set([
            parseInt(data?.KowsarReports[0].Unread, 10),
            parseInt(data?.KowsarReports[0].WaitingAction, 10),
            parseInt(data?.KowsarReports[0].InProgress, 10),
          ])
          this.ChartData_Array_Title.set(['دیده نشده', 'منتظر اقدام', 'در حال انجام'])

        }


      },
      error: () => {

      },
    });
  }



}
