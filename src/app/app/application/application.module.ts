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

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PhoenixFrameworkModule,
    AgGridModule,
    ApplicationRoutingModule,
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


    OrderSettingComponent,
    OrderDetailComponent,
    OrderColumnComponent,
    OrderColumnEditComponent,
    OrderCustomerComponent,

  ]
})
export class ApplicationModule { }
