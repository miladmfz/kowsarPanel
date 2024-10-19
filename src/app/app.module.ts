import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {
  CommonModule,
  HashLocationStrategy,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { AuthConfigModule } from './auth/auth-config.module';
import { AppRoutingModule } from './app-routing.module';
import { NotifierModule } from 'angular-notifier';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { ExceptionInterceptor } from './app-shell/framework-services/exception.interceptor.service';



@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthConfigModule,
    CommonModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NotifierModule,
  ],
  exports: [],
  providers: [

    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: ExceptionInterceptor,
    //   multi: true,
    // },
    Title
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
