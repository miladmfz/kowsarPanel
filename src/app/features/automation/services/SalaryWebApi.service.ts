import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';

@Injectable({
  providedIn: 'root'
})
export class SalaryWebApiService {





  baseUrl: string;
  private readonly headerService = inject(HeaderService);

  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private readonly AutoloadingService = inject(LoadingService);
  protected readonly session = inject(SessionStorageService);
  private withLoading<T>(obs$: Observable<T>): Observable<T> {
    this.AutoloadingService.show();
    return obs$.pipe(finalize(() => this.AutoloadingService.hide()));
  }

  constructor() {
    this.baseUrl = this.config.apiUrl + 'Salary/';




  }



  //////////////////////////////////////////////////////////////////////



  GetEmployee(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetEmployee", command, { headers: this.headerService.headers }))

  }


  GetMonthSummary(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetMonthSummary", command, { headers: this.headerService.headers }))

  }


  GetSalarySummary(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetSalarySummary", command, { headers: this.headerService.headers }))

  }


  UpdateWorkingEmployee(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "UpdateWorkingEmployee", command, { headers: this.headerService.headers }))

  }



  AddSalaryForAllEmployees(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "AddSalaryForAllEmployees", command, { headers: this.headerService.headers }))

  }


  InUp_Employee(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "InUp_Employee", command, { headers: this.headerService.headers }))

  }


  InUp_MonthSummary(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "InUp_MonthSummary", command, { headers: this.headerService.headers }))

  }








  GetEmployeeByCode(EmployeeCode: string): Observable<any[]> {
    const params = new HttpParams().append('EmployeeCode', EmployeeCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetEmployeeByCode", { headers: this.headerService.headers, params: params }))

  }


  GetMonthSummaryByCode(MonthSummaryCode: string): Observable<any[]> {
    const params = new HttpParams().append('MonthSummaryCode', MonthSummaryCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetMonthSummaryByCode", { headers: this.headerService.headers, params: params }))

  }













  /////


}
