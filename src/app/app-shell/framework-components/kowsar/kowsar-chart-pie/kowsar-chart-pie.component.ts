import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  Input,
  OnDestroy,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';

/* =========================================================
   ApexCharts Global Loader
   فقط یک بار در کل پروژه لود می‌شود
   ========================================================= */

let apexChartsLoader: Promise<void> | null = null;

@Component({
  selector: 'app-kowsar-chart-pie',
  templateUrl: './kowsar-chart-pie.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class KowsarChartPieComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('chart') chartElement!: ElementRef;

  @Input() Array_Number: any = [];
  @Input() Array_Title: string[] = [];
  @Input() title: string = '';

  @Input() height: number = 450;

  private chart: any;

  ngOnInit(): void { }

  async ngAfterViewInit(): Promise<void> {
    await this.loadApexCharts();
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (!this.chart) {
      return;
    }

    this.chart.updateOptions({
      series: this.Array_Number ?? [],
      labels: this.Array_Title ?? [],
      title: {
        text: this.title
      }
    });

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
        type: 'pie',
        height: this.height,
        toolbar: {
          show: false
        },
        fontFamily: 'IRANSans, Vazir, Tahoma, Arial, sans-serif'
      },

      series: this.Array_Number ?? [],

      labels: this.Array_Title ?? [],

      title: {
        text: this.title,
        align: 'center',
        style: {
          color: isDark ? '#f1f5f9' : '#0f172a',
          fontSize: '16px',
          fontWeight: '700'
        }
      },

      legend: {
        position: 'bottom',
        labels: {
          colors: isDark ? '#e2e8f0' : '#334155'
        }
      },

      dataLabels: {
        enabled: true
      },

      tooltip: {
        theme: isDark ? 'dark' : 'light',
        style: {
          fontFamily: 'IRANSans, Vazir, Tahoma, Arial, sans-serif'
        }
      },

      theme: {
        mode: isDark ? 'dark' : 'light'
      },

      stroke: {
        colors: [
          isDark ? '#353e55' : '#ffffff'
        ]
      },

      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: '100%'
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
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