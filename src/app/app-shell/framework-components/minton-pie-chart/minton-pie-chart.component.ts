import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
declare var ApexCharts: any;

@Component({
  selector: 'app-minton-pie-chart',
  templateUrl: './minton-pie-chart.component.html',
})
export class MintOnPieChartComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('chartpie') chartElement: ElementRef;  // استفاده از @ViewChild برای دسترسی به #chart
  @Input() series: any[] = [];
  @Input() labels: string[] = [];
  @Input() title: string = ''; // ورودی برای عنوان نمودار
  chart: any;

  constructor() { }

  ngOnInit(): void { }
  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnChanges(): void {
    if (this.chart) {

      this.chart.updateOptions({
        series: this.series,
        labels: this.labels,
        title: {
          text: this.title, // استفاده از عنوان ورودی
        },
      });
    }
  }




  initChart(): void {

    if (!this.chartElement) return; // بررسی وجود عنصر برای جلوگیری از خطا

    const options = {
      chart: {
        type: 'pie',
        height: 350,
      },
      series: this.series,
      labels: this.labels,
      title: {
        text: this.title,
        align: 'center',
        style: {
          fontFamily: 'Vazir, Tahoma, Arial',
        },
      },
      tooltip: {
        style: {
          fontFamily: 'Vazir, Tahoma, Arial',
        },
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: '100%',
          },
        },
      }],
    };

    this.chart = new ApexCharts(this.chartElement.nativeElement, options);  // استفاده از chartElement.nativeElement
    this.chart.render();
  }
}
