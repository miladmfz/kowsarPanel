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
  selector: 'app-kowsar-chart-radial',
  templateUrl: './kowsar-chart-radial.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class KowsarChartRadialComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('chart') chartElement!: ElementRef;

  @Input() percentage: number = 50;
  @Input() label: string = '';
  @Input() height: number = 150;

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
      series: [this.percentage ?? 0],
      labels: [this.label ?? '']
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
        type: 'radialBar',
        height: this.height,
        toolbar: {
          show: false
        },
        fontFamily: 'IRANSans, Vazir, Tahoma, Arial, sans-serif'
      },

      series: [this.percentage ?? 0],

      labels: [this.label ?? ''],

      plotOptions: {
        radialBar: {
          hollow: {
            size: '60%'
          },
          track: {
            background: isDark
              ? 'rgba(255,255,255,.08)'
              : 'rgba(15,23,42,.08)'
          },
          dataLabels: {
            name: {
              offsetY: -10,
              show: false
            },
            value: {
              color: isDark ? '#8ec5ff' : '#0d47a1',
              fontSize: '20px',
              fontWeight: 800,
              show: true
            }
          }
        }
      },

      colors: [
        isDark ? '#8ec5ff' : '#3bafda'
      ],

      stroke: {
        lineCap: 'round'
      },

      tooltip: {
        enabled: false
      },

      theme: {
        mode: isDark ? 'dark' : 'light'
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