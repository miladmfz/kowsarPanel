import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AppConfigService } from 'src/app/app-config.service';
@Injectable({
    providedIn: 'root'
})
export class DashboardWebApiService {

    private baseUrl: string;
    private headers: HttpHeaders;



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

    /** 📅 دریافت تاریخ امروز از سرور */
    GetTodeyFromServer(): Observable<any[]> {
        return this.withLoading(this.client.get<any[]>(this.baseUrl + 'GetTodeyFromServer', {
            headers: this.headers,
        }))
    }



    GetKowsarCustomer(command): Observable<any[]> {
        return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetKowsarCustomer", command, { headers: this.headers }))
    }

    AttendanceDashboard(): Observable<any[]> {
        const params = new HttpParams()
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "AttendanceDashboard", { headers: this.headers, params: params }))
    }

    GetLeaveRequestPerson(TargetDate: string): Observable<any[]> {
        const params = new HttpParams().append('TargetDate', TargetDate)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetLeaveRequestPerson", { headers: this.headers, params: params }))
    }



    AttendanceHistory(CentralRef: string): Observable<any[]> {
        const params = new HttpParams().append('CentralRef', CentralRef)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "AttendanceHistory", { headers: this.headers, params: params }))
    }

    GetAutLetterListByPerson(command): Observable<any[]> {

        return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetAutLetterListByPerson", command, { headers: this.headers }))

    }



    LetterInsert(command): Observable<any[]> {

        return this.withLoading(this.client.post<any[]>(this.baseUrl + "LetterInsert", command, { headers: this.headers }))

    }

    AutLetterRowInsert(command): Observable<any[]> {

        return this.withLoading(this.client.post<any[]>(this.baseUrl + "AutLetterRowInsert", command, { headers: this.headers }))

    }
    SendSmsAutLetter(command): Observable<any[]> {
        return this.withLoading(this.client.post<any[]>(this.baseUrl + "SendSmsAutLetter", command, { headers: this.headers }))
    }


    GetImageFromServer(ObjectRef: string): Observable<any[]> {
        const params = new HttpParams().append('pixelScale', '300').append('ClassName', 'Central').append('ObjectRef', ObjectRef)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetWebImagess", { headers: this.headers, params: params }))

    }
    GetNotification(): Observable<any[]> {
        const params = new HttpParams()
        return this.client.get<any[]>(this.baseUrl + "GetNotification", { headers: this.headers, params: params })

    }


    ManualAttendance(command): Observable<any[]> {
        return this.withLoading(this.client.post<any[]>(this.baseUrl + "ManualAttendance", command, { headers: this.headers }))
    }
    GetKowsarReport(command): Observable<any[]> {

        return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetKowsarReport", command, { headers: this.headers }))

    }
}
