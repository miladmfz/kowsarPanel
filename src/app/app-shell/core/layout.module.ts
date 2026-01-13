// import { NgModule } from '@angular/core';
// import {
//   CommonModule,
//   PathLocationStrategy,
//   LocationStrategy,
// } from '@angular/common';
// import { LayoutComponent } from './layout.component';
// import { SidebarComponent } from './sidebar/sidebar.component';
// import { HeaderComponent } from './header/header.component';
// import { FooterComponent } from './footer/footer.component';
// import { RightSliderComponent } from './right-slider/right-slider.component';
// import { ToolbarComponent } from './toolbar/toolbar.component';
// import { RouterModule, Routes } from '@angular/router';
// import { Routing } from '../../app/routing';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// const routes: Routes = [
//   {
//     path: '',
//     component: LayoutComponent,
//     children: Routing,
//   },
// ];
// @NgModule({
//   declarations: [
//     LayoutComponent,
//     SidebarComponent,
//     HeaderComponent,
//     FooterComponent,
//     RightSliderComponent,
//     ToolbarComponent,
//   ],
//   exports: [RouterModule], imports: [CommonModule,
//     RouterModule.forChild(routes),
//     FormsModule,
//     ReactiveFormsModule], providers: [
//       { provide: LocationStrategy, useClass: PathLocationStrategy },
//       provideHttpClient(withInterceptorsFromDi()),
//     ]
// })
// export class LayoutModule { }


