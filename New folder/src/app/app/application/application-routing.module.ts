import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrokerDetailComponent } from './components/Broker/broker-detail/broker-detail.component';
import { BrokerSettingComponent } from './components/Broker/broker-setting/broker-setting.component';
import { BrokerListComponent } from './components/Broker/broker-list/broker-list.component';
import { BrokerReportComponent } from './components/Broker/broker-report/broker-report.component';
import { BrokerColumnComponent } from './components/Broker/broker-column/broker-column.component';
import { BrokerColumnEditComponent } from './components/Broker/broker-column-edit/broker-column-edit.component';
import { CompanyDetailComponent } from './components/Company/company-detail/company-detail.component';
import { CompanySettingComponent } from './components/Company/company-setting/company-setting.component';
import { CompanyColumnComponent } from './components/Company/company-column/company-column.component';
import { CompanyColumnEditComponent } from './components/Company/company-column-edit/company-column-edit.component';
import { OcrDetailComponent } from './components/Ocr/ocr-detail/ocr-detail.component';
import { OcrListComponent } from './components/Ocr/ocr-list/ocr-list.component';
import { OcrFactorDetailComponent } from './components/Ocr/ocr-factor-detail/ocr-factor-detail.component';
import { OcrSettingComponent } from './components/Ocr/ocr-setting/ocr-setting.component';
import { OcrColumnComponent } from './components/Ocr/ocr-column/ocr-column.component';
import { OcrColumnEditComponent } from './components/Ocr/ocr-column-edit/ocr-column-edit.component';
import { OrderDetailComponent } from './components/Order/order-detail/order-detail.component';
import { OrderSettingComponent } from './components/Order/order-setting/order-setting.component';
import { OrderCustomerComponent } from './components/Order/order-customer/order-customer.component';
import { OrderColumnComponent } from './components/Order/order-column/order-column.component';
import { OrderColumnEditComponent } from './components/Order/order-column-edit/order-column-edit.component';
import { OrderReportComponent } from './components/Order/order-report/order-report.component';
import { OrderGoodComponent } from './components/Order/order-good/order-good.component';
import { OrderGoodEditComponent } from './components/Order/order-good-edit/order-good-edit.component';








const routes: Routes = [
  {
    path: '',
    data: {
      title: 'پنل مدیریت',
    },


    children: [
      {
        path: 'broker-detail',
        component: BrokerDetailComponent,
        data: {
          title: 'پنل بازاریابی',
        },
      },
      {
        path: 'broker-setting',
        component: BrokerSettingComponent,
        data: {
          title: 'تنظیمات بازاریابی',
        },
      },

      {
        path: 'broker-list',
        component: BrokerListComponent,
        data: {
          title: 'لیست بازاریابی',
        },
      },
      {
        path: 'broker-report',
        component: BrokerReportComponent,
        data: {
          title: 'گزارش بازاریابی',
        },
      },
      {
        path: 'broker-report/:id',
        component: BrokerReportComponent,
        data: {
          title: 'گزارش بازاریابی',
        },
      },

      {
        path: 'broker-column',
        component: BrokerColumnComponent,
        data: {
          title: ' تنظیم جدول بازاریابی',
        },
      },

      {
        path: 'broker-column-edit',
        component: BrokerColumnEditComponent,
        data: {
          title: 'اصلاح تنظیم جدول بازاریابی',
        },
      },




      {
        path: 'company-detail',
        component: CompanyDetailComponent,
        data: {
          title: 'پنل مشتریان',
        },
      },

      {
        path: 'company-setting',
        component: CompanySettingComponent,
        data: {
          title: 'تنظیمات مشتریان',
        },
      },


      {
        path: 'company-column',
        component: CompanyColumnComponent,
        data: {
          title: ' تنظیم جدول مشتریان ',
        },
      },

      {
        path: 'company-column-edit',
        component: CompanyColumnEditComponent,
        data: {
          title: 'اصلاح تنظیم جدول مشتریان ',
        },
      },


      {
        path: 'ocr-detail',
        component: OcrDetailComponent,
        data: {
          title: ' پنل توزیع و بایگانی',
        },
      },
      {
        path: 'ocr-list',
        component: OcrListComponent,
        data: {
          title: ' لیست توزیع و بایگانی',
        },
      },
      {
        path: 'ocr-factor-detail/:id',
        component: OcrFactorDetailComponent,
        data: {
          title: 'Factor detail ',
        },
      },
      {
        path: 'ocr-setting',
        component: OcrSettingComponent,
        data: {
          title: ' تنظیمات توزیع و بایگانی',
        },
      },




      {
        path: 'ocr-column',
        component: OcrColumnComponent,
        data: {
          title: ' تنظیم جدول توزیع و بایگانی',
        },
      },

      {
        path: 'ocr-column-edit',
        component: OcrColumnEditComponent,
        data: {
          title: 'اصلاح تنظیم جدول توزیع و بایگانی',
        },
      },




      {
        path: 'order-detail',
        component: OrderDetailComponent,
        data: {
          title: 'پنل سفارشگیر',
        },
      },
      {
        path: 'order-setting',
        component: OrderSettingComponent,
        data: {
          title: 'تنظیمات سفارشگیر',
        },
      },
      {
        path: 'order-customer',
        component: OrderCustomerComponent,
        data: {
          title: '',
        },
      },
      {
        path: 'order-report',
        component: OrderReportComponent,
        data: {
          title: '',
        },
      },
      {
        path: 'order-good',
        component: OrderGoodComponent,
        data: {
          title: '',
        },
      },
      {
        path: 'order-good-edit/:id',
        component: OrderGoodEditComponent,
        data: {
          title: '',
        },
      },




      {
        path: 'order-customer/:id',
        component: OrderCustomerComponent,
        data: {
          title: 'customer سفارشگیر',
        },
      },







      {
        path: 'order-column',
        component: OrderColumnComponent,
        data: {
          title: ' تنظیم جدول سفارشگیر',
        },
      },

      {
        path: 'order-column-edit',
        component: OrderColumnEditComponent,
        data: {
          title: 'اصلاح تنظیم جدول سفارشگیر',
        },
      },


      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: '**', redirectTo: 'list', pathMatch: 'full' },
    ],



  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationRoutingModule { }
