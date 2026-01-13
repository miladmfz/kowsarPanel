import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var ApexCharts: any;

@Component({
  selector: 'app-kowsar-chart-bar',
  templateUrl: './kowsar-chart-bar.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class KowsarChartBarComponent implements OnInit, AfterViewInit {
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
        type: 'bar',
        height: 350
      },
      series: [
        {
          name: "فروش",
          data: [10, 20, 30, 40, 50, 60, 70]
        }
      ],
      xaxis: {
        categories: ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"]
      },
      title: {
        text: "نمودار فروش هفتگی",
        align: "center"
      }
    };

    const chart = new ApexCharts(this.chartElement.nativeElement, options);
    chart.render();
  }
}
