import { NgModule } from '@angular/core';
import {
  CommonModule,
  PathLocationStrategy,
  LocationStrategy,
} from '@angular/common';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RightSliderComponent } from './right-slider/right-slider.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { Routing } from '../../app/routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PhoenixFrameworkModule } from '../framework-components/framework.module';
import { NotificationService } from '../framework-services/notification.service';
import { NotifierModule } from 'angular-notifier';
import { FullCalendarModule } from '@fullcalendar/angular'; // import the main module
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AgGridModule } from 'ag-grid-angular';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AttendancePanelComponent } from './dashboard/component/attendance-panel/attendance-panel.component';
import { SupportPanelComponent } from './dashboard/component/support-panel/support-panel.component';
import { CellActionAttendancePanel } from './dashboard/component/attendance-panel/cell-action-attendance-panel';
import { CellDateAttendancePanel } from './dashboard/component/attendance-panel/cell-date-label-attendance-panel';
import { CellNameAttendancePanel } from './dashboard/component/attendance-panel/cell-name-label-attendance-panel';
import { CellStatusAttendancePanel } from './dashboard/component/attendance-panel/cell-status-label-attendance-panel';
import { CellWithoutRowsSupportPanel } from './dashboard/component/support-panel/cell-withoutrows-label-support-panel';
import { CellOpenFactorSupportPanel } from './dashboard/component/support-panel/cell-openfactor-label-support-panel copy';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: Routing,
  },
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    PhoenixFrameworkModule,
    NotifierModule,
    FullCalendarModule,
    AgGridModule,

  ],
  declarations: [
    LayoutComponent,
    SidebarComponent,
    HeaderComponent,
    FooterComponent,
    RightSliderComponent,
    ToolbarComponent,
    DashboardComponent,
    AttendancePanelComponent,
    SupportPanelComponent,

    CellActionAttendancePanel,
    CellDateAttendancePanel,
    CellNameAttendancePanel,
    CellStatusAttendancePanel,
    CellWithoutRowsSupportPanel,
    CellOpenFactorSupportPanel

  ],
  providers: [
    { provide: LocationStrategy, useClass: PathLocationStrategy },

    NotificationService,
    // SwalService,
  ],
  exports: [RouterModule],
})
export class LayoutModule { }


