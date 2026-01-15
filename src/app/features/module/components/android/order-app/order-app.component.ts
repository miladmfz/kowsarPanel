import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { OrderAppColumnListComponent } from './components/order-app-column-list/order-app-column-list.component';
import { OrderAppColumnEditComponent } from './components/order-app-column-edit/order-app-column-edit.component';
import { OrderAppPanelComponent } from './components/order-app-panel/order-app-panel.component';
import { OrderAppCustomerComponent } from './components/order-app-customer/order-app-customer.component';
import { OrderAppGoodListComponent } from './components/order-app-good-list/order-app-good-list.component';
import { OrderAppGoodEditComponent } from './components/order-app-good-edit/order-app-good-edit.component';
import { OrderAppSettingComponent } from './components/order-app-setting/order-app-setting.component';
import { OrderAppReportComponent } from './components/order-app-report/order-app-report.component';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderWebApiService } from '../../../services/OrderWebApi.service';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
  selector: 'app-order-app',
  templateUrl: './order-app.component.html',
  standalone: true,
  imports: [
    CommonModule,
    OrderAppColumnListComponent,
    OrderAppColumnEditComponent,
    OrderAppPanelComponent,
    OrderAppCustomerComponent,
    OrderAppGoodListComponent,
    OrderAppGoodEditComponent,
    OrderAppSettingComponent,
    OrderAppReportComponent

  ],
})
export class OrderAppComponent implements OnInit {

  ObjectRef = '';
  activeTab = 'panel';


  id!: string;
  JobPersonRef: string = '';


  tabs = [
    { id: 'panel', title: 'panel' },

    { id: 'column-edit', title: 'column-edit' },
    { id: 'column-list', title: 'column-list' },
    { id: 'customer', title: 'customer' },
    { id: 'good-edit', title: 'good-edit' },
    { id: 'good-list', title: 'good-list' },
    { id: 'report', title: 'report' },
    { id: 'setting', title: 'setting' },

  ];

  constructor() { }

  ngOnInit(): void {
  }



}
