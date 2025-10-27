import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Input, OnChanges } from '@angular/core';

declare var ApexCharts: any;

@Component({
    selector: 'app-minton-column-chart',
    templateUrl: './minton-column-chart.component.html',
    standalone: false
})
export class MintOnColumnChartComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('chart') chartElement: ElementRef;
  @Input() series: any[] = [];
  @Input() categories: string[] = [];
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
        xaxis: { categories: this.categories },
        title: {
          text: this.title, // استفاده از عنوان ورودی
        },
      });
    }
  }

  initChart(): void {
    if (!this.chartElement) return;

    const options = {
      chart: {
        type: 'bar',
        height: 350,
      },
      series: this.series,
      xaxis: {
        categories: this.categories, // دسته‌بندی‌ها از ورودی گرفته می‌شود

        labels: {
          rotate: 90, // چرخش برچسب‌ها (اگر نیاز دارید)
          style: {
            fontFamily: 'Vazir, Tahoma, Arial', // فونت فارسی برای عنوان
          },
        }

      },
      title: {
        text: this.title, // استفاده از عنوان ورودی
        align: 'center',
        style: {
          fontFamily: 'Vazir, Tahoma, Arial', // فونت فارسی برای عنوان
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
        },
      },
      tooltip: {
        style: {
          fontFamily: 'Vazir, Tahoma, Arial', // فونت فارسی برای توضیحات
        },
      },
      grid: {
        show: true, // نمایش خطوط شبکه
        borderColor: '#e7e7e7', // رنگ مرزهای خطوط شبکه
      },
    };

    this.chart = new ApexCharts(this.chartElement.nativeElement, options);
    this.chart.render();
  }
}
