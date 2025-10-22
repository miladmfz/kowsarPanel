import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AttendancePanelComponent } from './component/attendance-panel/attendance-panel.component';
import { SupportPanelComponent } from './component/support-panel/support-panel.component';
import { KowsarReportComponent } from './component/kowsar-report/kowsar-report.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CellActionAttendancePanel } from './component/attendance-panel/cell-action-attendance-panel';
import { CellDateAttendancePanel } from './component/attendance-panel/cell-date-label-attendance-panel';
import { CellNameAttendancePanel } from './component/attendance-panel/cell-name-label-attendance-panel';
import { CellStatusAttendancePanel } from './component/attendance-panel/cell-status-label-attendance-panel';
import { CellWithoutRowsSupportPanel } from './component/support-panel/cell-withoutrows-label-support-panel';
import { CellOpenFactorSupportPanel } from './component/support-panel/cell-openfactor-label-support-panel copy';
import { CellActionAttendanceStatePanel } from './component/support-panel/cell-action-attendance-panel';
import { CellActionKowsarReport } from './component/kowsar-report/cell-action-attendance-panel';
import { CellDateMinDate } from './component/kowsar-report/cell-date-label-attendance-panel';

const routes: Routes = [
    { path: '', component: DashboardComponent }
];

@NgModule({
    declarations: [
        DashboardComponent,
        AttendancePanelComponent,
        SupportPanelComponent,
        KowsarReportComponent,

        CellActionAttendancePanel,
        CellDateAttendancePanel,
        CellNameAttendancePanel,
        CellStatusAttendancePanel,
        CellWithoutRowsSupportPanel,
        CellOpenFactorSupportPanel,
        CellActionAttendanceStatePanel,
        CellActionKowsarReport,
        CellDateMinDate,

    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        AgGridModule,
        NgPersianDatepickerModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,

    ]
})
export class DashboardModule { }
