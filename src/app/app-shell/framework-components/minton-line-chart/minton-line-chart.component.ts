import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Input, OnChanges } from '@angular/core';

declare var ApexCharts: any;

@Component({
    selector: 'app-minton-line-chart',
    templateUrl: './minton-line-chart.component.html',
    standalone: false
})
export class MintOnLineChartComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('chart') chartElement: ElementRef;
  @Input() series: any[] = [];
  @Input() categories: string[] = [];

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
      });
    }
  }

  initChart(): void {
    if (!this.chartElement) return;

    const options = {
      chart: {
        type: 'line',
        height: 350,
        zoom: { enabled: false },
      },
      series: this.series,
      xaxis: {
        categories: this.categories,
      },
      title: {
        text: 'نمودار فروش و هزینه',
        align: 'center',
      },
      stroke: {
        curve: 'smooth',
      },
    };

    this.chart = new ApexCharts(this.chartElement.nativeElement, options);
    this.chart.render();
  }
}
