import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {
  CommonModule,
  HashLocationStrategy,
  LocationStrategy,
} from '@angular/common';
import { HttpService } from './app-shell/framework-services/http.service';
import { BrowserModule } from '@angular/platform-browser';
import { ExceptionInterceptor } from './app-shell/framework-services/exception.interceptor.service';
import { SecurityInterceptor } from './app-shell/framework-services/security.interceptor.service';
import { AuthConfigModule } from './auth/auth-config.module';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { CallbackComponent } from './auth/callback/callback.component';
import { AppRoutingModule } from './app-routing.module';
import { LocalStorageService } from './app-shell/framework-services/local.storage.service';
import { AuthenticationService } from './app-shell/framework-services/authentication.service';

@NgModule({
  declarations: [AppComponent, UnauthorizedComponent, CallbackComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthConfigModule,
    CommonModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [],
  providers: [
    LocalStorageService,
    AuthenticationService,
    HttpService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ExceptionInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SecurityInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
