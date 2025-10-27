import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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
import { AppConfigService } from './app-config.service';
import { NotFoundComponent } from './app-shell/core/not-found/not-found.component';

export function initializeApp(appConfig: AppConfigService) {
  return () => appConfig.loadConfig();
}


@NgModule({ declarations: [AppComponent, NotFoundComponent],
    exports: [],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        AuthConfigModule,
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        NotifierModule], providers: [
        {
            provide: LocationStrategy,
            useClass: HashLocationStrategy
        },
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [AppConfigService],
            multi: true,
        },
        // {
        //   provide: HTTP_INTERCEPTORS,
        //   useClass: ExceptionInterceptor,
        //   multi: true,
        // },
        Title,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }




