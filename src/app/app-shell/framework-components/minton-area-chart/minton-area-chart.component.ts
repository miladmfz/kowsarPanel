import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

declare var ApexCharts: any;

@Component({
    selector: 'app-minton-area-chart',
    templateUrl: './minton-area-chart.component.html',
    standalone: false
})
export class MintOnAreaChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') chartElement: ElementRef;

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initChart();
  }

  initChart(): void {
    if (!this.chartElement) return;

    const options = {
      chart: {
        type: 'area',
        height: 350
      },
      series: [
        {
          name: "درآمد",
          data: [10, 15, 25, 30, 45, 50, 70]
        }
      ],
      xaxis: {
        categories: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر"]
      },
      title: {
        text: "روند درآمد ماهانه",
        align: "center"
      }
    };

    const chart = new ApexCharts(this.chartElement.nativeElement, options);
    chart.render();
  }
}
