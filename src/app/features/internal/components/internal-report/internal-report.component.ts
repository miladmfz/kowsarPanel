import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { InternalReportApplicationComponent } from './components/internal-report-application/internal-report-application.component';
import { InternalReportCustomerComponent } from './components/internal-report-customer/internal-report-customer.component';

@Component({
  selector: 'app-internal-report',
  templateUrl: './internal-report.component.html',
  standalone: true,

  imports: [
    CommonModule,
    InternalReportApplicationComponent,
    InternalReportCustomerComponent
  ],
})
export class InternalReportComponent
  extends AgGridBaseComponent
  implements OnInit {

  activeTab = 'customer';

  tabs = [
    { id: 'customer', title: 'گزارش مشتریان' },
    { id: 'application', title: 'گزارش اپلیکیشن' },
  ];

  ngOnInit(): void {
  }



}
