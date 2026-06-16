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
  selector: 'app-kowsar-chart-bar',
  templateUrl: './kowsar-chart-bar.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class KowsarChartBarComponent
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('chart') chartElement!: ElementRef;

  @Input() series: any = [];
  @Input() categories: string[] = [];

  @Input() title: string = 'نمودار فروش هفتگی';
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
        type: 'bar',
        height: this.height,
        toolbar: {
          show: false
        },
        fontFamily: 'IRANSans, sans-serif'
      },

      series: this.series?.length
        ? this.series
        : [
          {
            name: 'فروش',
            data: [10, 20, 30, 40, 50, 60, 70]
          }
        ],

      xaxis: {
        categories: this.categories?.length
          ? this.categories
          : [
            'شنبه',
            'یکشنبه',
            'دوشنبه',
            'سه‌شنبه',
            'چهارشنبه',
            'پنج‌شنبه',
            'جمعه'
          ],
        labels: {
          style: {
            colors: isDark ? '#cbd5e1' : '#64748b'
          }
        }
      },

      yaxis: {
        labels: {
          style: {
            colors: isDark ? '#cbd5e1' : '#64748b'
          }
        }
      },

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
        enabled: false
      },

      stroke: {
        curve: 'smooth',
        width: 2
      },

      grid: {
        borderColor: isDark
          ? 'rgba(255,255,255,.08)'
          : 'rgba(15,23,42,.08)'
      },

      tooltip: {
        theme: isDark ? 'dark' : 'light'
      },

      theme: {
        mode: isDark ? 'dark' : 'light'
      },

      legend: {
        labels: {
          colors: isDark ? '#e2e8f0' : '#334155'
        }
      },

      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '45%'
        }
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