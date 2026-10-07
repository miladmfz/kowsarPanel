import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { Observable } from 'rxjs';
import { KowsarChartColumnComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-column/kowsar-chart-column.component';
import { MonthlyGoodSellStateReportBaseComponent } from '../MonthlyGoodSellStateShared/monthly-good-sell-state-report.base';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    NgPersianDatepickerModule,
    KowsarChartColumnComponent,
  ],
  selector: 'app-FactorTypeMonthlyGoodSellStateRpt',
  templateUrl: './FactorTypeMonthlyGoodSellStateRpt.component.html',
})
export class FactorTypeMonthlyGoodSellStateRptComponent extends MonthlyGoodSellStateReportBaseComponent {
  protected override readonly reportForm = 'FactorTypeMonthlyGoodSellStateRpt';
  protected override readonly defaultTitle =
    'گزارش ماهانه فروش کالا بر اساس نوع فاکتور';

  protected override request(payload: unknown): Observable<any> {
    return this.repo.FactorTypeMonthlyGoodSellStateRpt(payload);
  }
}
