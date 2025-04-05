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
import { RouterModule, Routes } from '@angular/router';
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
  ],
  providers: [
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    NotificationService,
    // SwalService,
  ],
  exports: [RouterModule],
})
export class LayoutModule { }


