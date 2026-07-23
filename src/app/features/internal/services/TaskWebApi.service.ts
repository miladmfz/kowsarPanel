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
export class TaskWebApiService {


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
    this.baseUrl = this.config.apiUrl + 'InternalTask/';


  }





  GetTasks(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetTasks", command, { headers: this.headerService.headers }))
  }

  InsertTask(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "InsertTask", command, { headers: this.headerService.headers }))
  }

  UpdateTask(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "UpdateTask", command, { headers: this.headerService.headers }))
  }

  DeleteTask(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "DeleteTask", command, { headers: this.headerService.headers }))
  }
  DeleteTaskAll(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "DeleteTaskAll", command, { headers: this.headerService.headers }))
  }








  KowsarTaskDependency_Get(TaskCode: string): Observable<any[]> {
    const params = new HttpParams().append('TaskCode', TaskCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "KowsarTaskDependency_Get", { headers: this.headerService.headers, params: params }))
  }


  KowsarTaskDependency_Delete(DependencyCode: string): Observable<any[]> {
    const params = new HttpParams().append('DependencyCode', DependencyCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "KowsarTaskDependency_Delete", { headers: this.headerService.headers, params: params }))
  }

  KowsarTaskDependency_Save(TaskRef: string, DependencyTaskRef: string): Observable<any[]> {
    const params = new HttpParams().append('TaskRef', TaskRef).append('DependencyTaskRef', DependencyTaskRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "KowsarTaskDependency_Save", { headers: this.headerService.headers, params: params }))
  }























  GetPatterns(): Observable<any[]> {
    const params = new HttpParams()
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetPatterns", { headers: this.headerService.headers, params: params }))
  }




  GetGoodFromPattern(PatternCode: string): Observable<any[]> {
    const params = new HttpParams().append('PatternCode', PatternCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGoodFromPattern", { headers: this.headerService.headers, params: params }))
  }

  Pattern_Crud(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "Pattern_Crud", command, { headers: this.headerService.headers }))
  }


  PatternGood_Add(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PatternGood_Add", command, { headers: this.headerService.headers }))
  }



  PatternGood_Del(PatternGoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('PatternGoodCode', PatternGoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "PatternGood_Del", { headers: this.headerService.headers, params: params }))
  }









  GetTaskFromGood(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetTaskFromGood", { headers: this.headerService.headers, params: params }))
  }


  GoodTask_Add(GoodRef: string, TaskRef: string): Observable<any[]> {
    const params = new HttpParams().append('GoodRef', GoodRef).append('TaskRef', TaskRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GoodTask_Add", { headers: this.headerService.headers, params: params }))
  }

  GoodTask_Del(GoodTaskCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodTaskCode', GoodTaskCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GoodTask_Del", { headers: this.headerService.headers, params: params }))
  }



  GoodTaskRow_Factor_Add(HeaderRef: string): Observable<any[]> {
    const params = new HttpParams().append('HeaderRef', HeaderRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GoodTaskRow_Factor_Add", { headers: this.headerService.headers, params: params }))
  }



  GoodTaskRow_Factor_Del(HeaderRef: string, GoodRef: string): Observable<any[]> {
    const params = new HttpParams().append('HeaderRef', HeaderRef).append('GoodRef', GoodRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GoodTaskRow_Factor_Del", { headers: this.headerService.headers, params: params }))
  }



  GoodTaskRow_Get_ByFactorRow(FactorRowCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorRowCode', FactorRowCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GoodTaskRow_Get_ByFactorRow", { headers: this.headerService.headers, params: params }))
  }



  GoodTaskRow_Get_ByFactor(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GoodTaskRow_Get_ByFactor", { headers: this.headerService.headers, params: params }))
  }



  GoodTaskRow_Edit(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodTaskRow_Edit", command, { headers: this.headerService.headers }))
  }




  GoodTaskRow_EditInfo(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodTaskRow_EditInfo", command, { headers: this.headerService.headers }))
  }


  GoodTaskRow_ChangeState(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodTaskRow_ChangeState", command, { headers: this.headerService.headers }))
  }





  GoodTaskRow_Customer_Add(HeaderRef: string): Observable<any[]> {
    const params = new HttpParams().append('HeaderRef', HeaderRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GoodTaskRow_Customer_Add", { headers: this.headerService.headers, params: params }))
  }



  GoodTaskRow_Customer_Del(HeaderRef: string, GoodRef: string): Observable<any[]> {
    const params = new HttpParams().append('HeaderRef', HeaderRef).append('GoodRef', GoodRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GoodTaskRow_Customer_Del", { headers: this.headerService.headers, params: params }))
  }





  GetCustomerGood(CustomerRef: string): Observable<any[]> {
    const params = new HttpParams().append('CustomerRef', CustomerRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetCustomerGood", { headers: this.headerService.headers, params: params }))
  }




  CustomerGood_AddNew(CustomerRef: string, GoodRef: string): Observable<any[]> {
    const params = new HttpParams().append('CustomerRef', CustomerRef).append('GoodRef', GoodRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "CustomerGood_AddNew", { headers: this.headerService.headers, params: params }))
  }




  CustomerGood_Del(CustomerGoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('CustomerGoodCode', CustomerGoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "CustomerGood_Del", { headers: this.headerService.headers, params: params }))
  }




  GoodTaskRow_Get_ByCustomerRow(CustomerGoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('CustomerGoodCode', CustomerGoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GoodTaskRow_Get_ByCustomerRow", { headers: this.headerService.headers, params: params }))
  }



  GoodTaskRow_Get_ByCustomer(CustomerCode: string): Observable<any[]> {
    const params = new HttpParams().append('CustomerCode', CustomerCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GoodTaskRow_Get_ByCustomer", { headers: this.headerService.headers, params: params }))
  }


}









