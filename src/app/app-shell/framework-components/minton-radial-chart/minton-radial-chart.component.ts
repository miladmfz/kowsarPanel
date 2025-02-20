import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Input, OnChanges } from '@angular/core';

declare var ApexCharts: any;

@Component({
  selector: 'app-minton-radial-chart',
  templateUrl: './minton-radial-chart.component.html',
})
export class MintonRadialChartComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('chart') chartElement: ElementRef;
  @Input() percentage: number = 50; // مقدار پیش‌فرض ۵۰٪
  @Input() label: string = ''; // مقدار لیبل

  chart: any;

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnChanges(): void {
    if (this.chart) {
      this.chart.updateSeries([this.percentage]); // آپدیت مقدار درصدی
    }
  }

  initChart(): void {
    if (!this.chartElement) return;

    const options = {
      chart: {
        type: 'radialBar',
        height: 150,
      },
      series: [this.percentage],
      labels: [this.label],
      plotOptions: {
        radialBar: {
          hollow: {
            size: '60%',
          },
          dataLabels: {
            name: {
              offsetY: -10,
              color: '#888',
              fontSize: '1px',
              show: false,

            },
            value: {
              color: '#3bafda',
              fontSize: '20px',
              show: true,
            }
          }
        }
      },
      colors: ['#3bafda'], // رنگ نمودار
    };

    this.chart = new ApexCharts(this.chartElement.nativeElement, options);
    this.chart.render();
  }
}
