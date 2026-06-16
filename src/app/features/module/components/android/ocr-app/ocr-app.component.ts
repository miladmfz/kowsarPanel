import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2, signal } from '@angular/core';
import { OcrAppColumnListComponent } from './components/ocr-app-column-list/ocr-app-column-list.component';
import { OcrAppColumnEditComponent } from './components/ocr-app-column-edit/ocr-app-column-edit.component';
import { OcrAppFactorDetailComponent } from './components/ocr-app-factor-detail/ocr-app-factor-detail.component';
import { OcrAppFactorListComponent } from './components/ocr-app-factor-list/ocr-app-factor-list.component';
import { OcrAppPanelComponent } from './components/ocr-app-panel/ocr-app-panel.component';
import { OcrAppReportChartComponent } from './components/ocr-app-report-chart/ocr-app-report-chart.component';
import { OcrAppReportListComponent } from './components/ocr-app-report-list/ocr-app-report-list.component';
import { OcrAppSettingComponent } from './components/ocr-app-setting/ocr-app-setting.component';

@Component({
  selector: 'app-ocr-app',
  templateUrl: './ocr-app.component.html',
  standalone: true,
  imports: [
    CommonModule,
    OcrAppColumnListComponent,
    OcrAppColumnEditComponent,
    OcrAppFactorDetailComponent,
    OcrAppFactorListComponent,
    OcrAppPanelComponent,
    OcrAppReportChartComponent,
    OcrAppReportListComponent,
    OcrAppSettingComponent

  ],
})
export class OcrAppComponent implements OnInit {

  ObjectRef = signal('')
  activeTab = signal('panel')


  id!: string;
  LoginType = signal('')


  tabs = [
    { id: 'panel', title: 'panel' },

    { id: 'column-edit', title: 'column-edit' },
    { id: 'column-list', title: 'column-list' },
    { id: 'factor-detail', title: 'factor-detail' },
    { id: 'factor-list', title: 'factor-list' },
    { id: 'report-chart', title: 'report-chart' },
    { id: 'report-list', title: 'report-list' },
    { id: 'setting', title: 'setting' },

  ];

  constructor() { }

  ngOnInit(): void {
  }



}
