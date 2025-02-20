import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

declare var ApexCharts: any;

@Component({
  selector: 'app-minton-donut-chart',
  templateUrl: './minton-donut-chart.component.html',
})
export class MintOnDonutChartComponent implements OnInit, AfterViewInit {
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
        type: 'donut',
        height: 350
      },
      series: [35, 40, 25],
      labels: ["بخش A", "بخش B", "بخش C"],
      title: {
        text: "تقسیم‌بندی پروژه‌ها",
        align: "center"
      }
    };

    const chart = new ApexCharts(this.chartElement.nativeElement, options);
    chart.render();
  }
}
