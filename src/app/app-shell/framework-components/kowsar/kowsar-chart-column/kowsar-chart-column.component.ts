import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var ApexCharts: any;
@Component({
  selector: 'app-kowsar-chart-column',
  templateUrl: './kowsar-chart-column.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class KowsarChartColumnComponent implements OnInit, AfterViewInit, OnChanges {
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

        }

      },
      title: {
        text: this.title, // استفاده از عنوان ورودی
        align: 'center',

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
