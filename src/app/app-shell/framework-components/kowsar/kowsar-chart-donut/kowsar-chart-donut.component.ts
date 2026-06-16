import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';

/* =========================================================
   ApexCharts Global Loader
   فقط یک بار در کل پروژه لود می‌شود
   ========================================================= */

let apexChartsLoader: Promise<void> | null = null;

@Component({
  selector: 'app-kowsar-chart-donut',
  templateUrl: './kowsar-chart-donut.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class KowsarChartDonutComponent
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('chart') chartElement!: ElementRef;

  @Input() series: any = [];
  @Input() categories: string[] = [];

  @Input() title: string = 'تقسیم‌بندی پروژه‌ها';
  @Input() height: number = 350;

  private chart: any;

  ngOnInit(): void { }

  async ngAfterViewInit(): Promise<void> {
    await this.loadApexCharts();
    this.initChart();
  }

  private loadApexCharts(): Promise<void> {

    if ((window as any).ApexCharts) {
      return Promise.resolve();
    }

    if (apexChartsLoader) {
      return apexChartsLoader;
    }

    apexChartsLoader = new Promise((resolve, reject) => {

      const script = document.createElement('script');

      script.src = 'assets/libs/apexcharts/apexcharts.min.js';
      script.async = true;

      script.onload = () => resolve();

      script.onerror = () =>
        reject('ApexCharts failed to load');

      document.body.appendChild(script);

    });

    return apexChartsLoader;
  }

  private initChart(): void {

    if (!this.chartElement) {
      return;
    }

    const ApexCharts = (window as any).ApexCharts;

    const isDark =
      document.documentElement.getAttribute('data-bs-theme') === 'dark';

    const options = {
      chart: {
        type: 'donut',
        height: this.height,
        toolbar: {
          show: false
        },
        fontFamily: 'IRANSans, Vazir, Tahoma, Arial, sans-serif'
      },

      series: this.series?.length
        ? this.series
        : [35, 40, 25],

      labels: this.categories?.length
        ? this.categories
        : ['بخش A', 'بخش B', 'بخش C'],

      title: {
        text: this.title,
        align: 'center',
        style: {
          color: isDark ? '#f1f5f9' : '#0f172a',
          fontSize: '16px',
          fontWeight: '700'
        }
      },

      dataLabels: {
        enabled: true
      },

      legend: {
        position: 'bottom',
        labels: {
          colors: isDark ? '#e2e8f0' : '#334155'
        }
      },

      tooltip: {
        theme: isDark ? 'dark' : 'light'
      },

      theme: {
        mode: isDark ? 'dark' : 'light'
      },

      stroke: {
        colors: [
          isDark ? '#353e55' : '#ffffff'
        ]
      }
    };

    this.chart = new ApexCharts(
      this.chartElement.nativeElement,
      options
    );

    this.chart.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}