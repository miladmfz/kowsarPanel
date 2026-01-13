import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var ApexCharts: any;
@Component({
  selector: 'app-kowsar-chart-line',
  templateUrl: './kowsar-chart-line.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class KowsarChartLineComponent implements OnInit, AfterViewInit, OnChanges {
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
