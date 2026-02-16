import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class SalaryWebApiService {





  baseUrl: string;
  headers: HttpHeaders;

  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private readonly AutoloadingService = inject(LoadingService);

  private withLoading<T>(obs$: Observable<T>): Observable<T> {
    this.AutoloadingService.show();
    return obs$.pipe(finalize(() => this.AutoloadingService.hide()));
  }

  constructor() {
    this.baseUrl = this.config.apiUrl + 'Support/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PIC', sessionStorage.getItem('PersonInfoRef') ?? '')
      .set('SessionId', sessionStorage.getItem('SessionId') ?? '')
      .set('UserName', encodeURIComponent(sessionStorage.getItem('UserName') ?? ''));


  }



  //////////////////////////////////////////////////////////////////////

  GetTodeyFromServer(): Observable<any[]> {
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer"))
  }


  GetEmployee(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetEmployee", command, { headers: this.headers }))

  }


  GetMonthSummary(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetMonthSummary", command, { headers: this.headers }))

  }


  GetSalarySummary(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetSalarySummary", command, { headers: this.headers }))

  }


  UpdateWorkingEmployee(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "UpdateWorkingEmployee", command, { headers: this.headers }))

  }



  AddSalaryForAllEmployees(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "AddSalaryForAllEmployees", command, { headers: this.headers }))

  }


  InUp_Employee(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "InUp_Employee", command, { headers: this.headers }))

  }


  InUp_MonthSummary(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "InUp_MonthSummary", command, { headers: this.headers }))

  }








  GetEmployeeByCode(EmployeeCode: string): Observable<any[]> {
    const params = new HttpParams().append('EmployeeCode', EmployeeCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetEmployeeByCode", { headers: this.headers, params: params }))

  }


  GetMonthSummaryByCode(MonthSummaryCode: string): Observable<any[]> {
    const params = new HttpParams().append('MonthSummaryCode', MonthSummaryCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetMonthSummaryByCode", { headers: this.headers, params: params }))

  }














  GetEmployee1(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetEmploye", command, { headers: this.headers }))

  }

  GetImageFromServer(ObjectRef: string): Observable<any[]> {
    const params = new HttpParams().append('pixelScale', '1000').append('ClassName', 'Aut').append('ObjectRef', ObjectRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetWebImagess", { headers: this.headers, params: params }))

  }
  /////


}
