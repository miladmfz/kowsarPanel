import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var ApexCharts: any;
@Component({
  selector: 'app-kowsar-chart-radial',
  templateUrl: './kowsar-chart-radial.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class KowsarChartRadialComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('chart') chartElement: ElementRef;
  @Input() percentage: number = 50; // Default percentage is 50%
  @Input() label: string = ''; // Label for the chart

  chart: any;

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnChanges(): void {
    if (this.chart) {
      this.chart.updateSeries([this.percentage]); // Update the percentage value
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
      colors: ['#3bafda'], // Chart color
    };

    this.chart = new ApexCharts(this.chartElement.nativeElement, options);
    this.chart.render();
  }
}
