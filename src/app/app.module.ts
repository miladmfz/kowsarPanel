import { NgModule } from '@angular/core';

import { AppConfigService } from './app-config.service';

export function initializeApp(appConfig: AppConfigService) {
  return () => appConfig.loadConfig();
}


@NgModule({
  declarations: [
    // NotFoundComponent
  ],
  exports: [],
  // bootstrap: [], imports: [BrowserModule,
  //   AppRoutingModule,
  //   CommonModule,
  //   RouterModule,
  //   FormsModule,
  //   ReactiveFormsModule,
  //   NotifierModule], providers: [
  //     {
  //       provide: LocationStrategy,
  //       useClass: HashLocationStrategy
  //     },
  //     {
  //       provide: APP_INITIALIZER,
  //       useFactory: initializeApp,
  //       deps: [AppConfigService],
  //       multi: true,
  //     },
  //     // {
  //     //   provide: HTTP_INTERCEPTORS,
  //     //   useClass: ExceptionInterceptor,
  //     //   multi: true,
  //     // },
  //     Title,
  //     provideHttpClient(withInterceptorsFromDi())
  //   ]
})
export class AppModule { }




