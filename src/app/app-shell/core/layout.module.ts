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
import { NotificationService } from '../framework-services/notification.service';

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

  ],
  declarations: [
    LayoutComponent,
    SidebarComponent,
    HeaderComponent,
    FooterComponent,
    RightSliderComponent,
    ToolbarComponent,
  ],
  providers: [
    { provide: LocationStrategy, useClass: PathLocationStrategy },

    NotificationService,
    // SwalService,
  ],
  exports: [RouterModule],
})
export class LayoutModule { }


