import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationComponent } from './application.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PhoenixFrameworkModule } from 'src/app/app-shell/framework-components/framework.module';
import { AgGridModule } from 'ag-grid-angular';
import { BrokerDetailComponent } from './components/Broker/broker-detail/broker-detail.component';
import { BrokerReportComponent } from './components/Broker/broker-report/broker-report.component';
import { BrokerListComponent } from './components/Broker/broker-list/broker-list.component';
import { BrokerSettingComponent } from './components/Broker/broker-setting/broker-setting.component';
import { BrokerColumnComponent } from './components/Broker/broker-column/broker-column.component';
import { BrokerColumnEditComponent } from './components/Broker/broker-column-edit/broker-column-edit.component';
import { CompanySettingComponent } from './components/Company/company-setting/company-setting.component';
import { CompanyDetailComponent } from './components/Company/company-detail/company-detail.component';
import { CompanyColumnComponent } from './components/Company/company-column/company-column.component';
import { CompanyColumnEditComponent } from './components/Company/company-column-edit/company-column-edit.component';
import { OcrSettingComponent } from './components/Ocr/ocr-setting/ocr-setting.component';
import { OcrDetailComponent } from './components/Ocr/ocr-detail/ocr-detail.component';
import { OcrColumnComponent } from './components/Ocr/ocr-column/ocr-column.component';
import { OcrColumnEditComponent } from './components/Ocr/ocr-column-edit/ocr-column-edit.component';
import { OcrListComponent } from './components/Ocr/ocr-list/ocr-list.component';
import { OcrFactorDetailComponent } from './components/Ocr/ocr-factor-detail/ocr-factor-detail.component';
import { OrderSettingComponent } from './components/Order/order-setting/order-setting.component';
import { OrderDetailComponent } from './components/Order/order-detail/order-detail.component';
import { OrderColumnComponent } from './components/Order/order-column/order-column.component';
import { OrderColumnEditComponent } from './components/Order/order-column-edit/order-column-edit.component';
import { OrderCustomerComponent } from './components/Order/order-customer/order-customer.component';
import { ApplicationRoutingModule } from './application-routing.module';
import { OrderReportComponent } from './components/Order/order-report/order-report.component';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { OrderGoodComponent } from './components/Order/order-good/order-good.component';
import { OrderCellActionGoodList } from './components/Order/order-good/order-cell-action-good-ist';
import { OrderGoodEditComponent } from './components/Order/order-good-edit/order-good-edit.component';
import { CellActionOcrList } from './components/Ocr/ocr-list/cell-action-ocr-list';
import { D3OrgChartComponent } from 'src/app/app-shell/framework-components/d3-org-chart/d3-org-chart.component';
import { MintOnAreaChartComponent } from 'src/app/app-shell/framework-components/minton-area-chart/minton-area-chart.component';
import { MintOnBarChartComponent } from 'src/app/app-shell/framework-components/minton-bar-chart/minton-bar-chart.component';
import { MintOnDonutChartComponent } from 'src/app/app-shell/framework-components/minton-donut-chart/minton-donut-chart.component';
import { MintOnPieChartComponent } from 'src/app/app-shell/framework-components/minton-pie-chart/minton-pie-chart.component';
import { MintOnLineChartComponent } from 'src/app/app-shell/framework-components/minton-line-chart/minton-line-chart.component';
import { OcrReportListComponent } from './components/Ocr/ocr-report-list/ocr-report-list.component';
import { OcrReportChartComponent } from './components/Ocr/ocr-report-chart/ocr-report-chart.component';
import { CellActionBrokerList } from './components/Broker/broker-list/cell-action-broker-list';
import { BrokerMapComponent } from './components/Broker/broker-map/broker-map.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PhoenixFrameworkModule,
    AgGridModule,
    ApplicationRoutingModule,
    NgPersianDatepickerModule,

  ],
  declarations: [
    ApplicationComponent,
    BrokerDetailComponent,
    BrokerReportComponent,
    BrokerListComponent,
    BrokerSettingComponent,
    BrokerColumnComponent,
    BrokerColumnEditComponent,


    CompanySettingComponent,
    CompanyDetailComponent,
    CompanyColumnComponent,
    CompanyColumnEditComponent,

    OcrSettingComponent,
    OcrDetailComponent,
    OcrColumnComponent,
    OcrColumnEditComponent,
    OcrListComponent,
    OcrFactorDetailComponent,
    OcrReportListComponent,
    OcrReportChartComponent,
    CellActionOcrList,

    OrderSettingComponent,
    OrderDetailComponent,
    OrderColumnComponent,
    OrderColumnEditComponent,
    OrderCustomerComponent,
    OrderReportComponent,
    OrderGoodComponent,
    OrderGoodEditComponent,
    OrderCellActionGoodList,

    CellActionBrokerList,
    BrokerMapComponent


  ]
})
export class ApplicationModule { }
