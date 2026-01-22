import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var ApexCharts: any;

@Component({
  selector: 'app-kowsar-chart-area',
  templateUrl: './kowsar-chart-area.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class KowsarChartAreaComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') chartElement: ElementRef;
  @Input() series: any[] = [];
  @Input() categories: string[] = [];

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initChart();
  }

  initChart(): void {
    if (!this.chartElement) return;

    const options = {
      chart: {
        type: 'area',
        height: 350
      },
      series: this.series,
      xaxis: {
        categories: this.categories
      },
      title: {
        text: "روند درآمد ماهانه",
        align: "center"
      }
    };

    const chart = new ApexCharts(this.chartElement.nativeElement, options);
    chart.render();
  }
}
