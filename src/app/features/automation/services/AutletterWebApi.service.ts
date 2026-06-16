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
export class AutletterWebApiService {





  baseUrl: string;
  private readonly headerService = inject(HeaderService);

  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService)
  private readonly AutoloadingService = inject(LoadingService);
  protected readonly session = inject(SessionStorageService);
  private withLoading<T>(obs$: Observable<T>): Observable<T> {
    this.AutoloadingService.show();
    return obs$.pipe(finalize(() => this.AutoloadingService.hide()));
  }

  constructor() {
    this.baseUrl = this.config.apiUrl + 'AutLetter/';


  }



  //////////////////////////////////////////////////////////////////////



  SendSmsAutLetter(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "SendSmsAutLetter", command, { headers: this.headerService.headers }))
  }

  GetAutLetterListForUser(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetAutLetterListForUser", command, { headers: this.headerService.headers }))

  }


  GetAutLetterListForCustomer(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetAutLetterListForCustomer", command, { headers: this.headerService.headers }))

  }



  GetAutLetterListByCentral(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetAutLetterListByCentral", command, { headers: this.headerService.headers }))

  }



  LetterInsert(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "LetterInsert", command, { headers: this.headerService.headers }))

  }



  GetLetterRowList(LetterRef: string): Observable<any[]> {
    const params = new HttpParams().append('LetterRef', LetterRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetLetterRowList", { headers: this.headerService.headers, params: params }))
  }


  AutLetterUpdate(LetterCode: string, State: string): Observable<any[]> {
    const params = new HttpParams().append('LetterCode', LetterCode).append('State', State)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "AutLetterUpdate", { headers: this.headerService.headers, params: params }))
  }

  GetCentralUser(): Observable<any[]> {
    const params = new HttpParams()
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetCentralUser", { headers: this.headerService.headers }))
  }





  AutLetterRowInsert(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "AutLetterRowInsert", command, { headers: this.headerService.headers }))
  }



  GetAutConversation(LetterRef: string): Observable<any[]> {
    const params = new HttpParams().append('LetterRef', LetterRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetAutConversation", { headers: this.headerService.headers, params: params }))
  }

  ConversationSeen(CentralRef: string, LetterRef: string): Observable<any[]> {
    const params = new HttpParams().append('CentralRef', CentralRef).append('LetterRef', LetterRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "ConversationSeen", { headers: this.headerService.headers, params: params }))
  }

  GetAutletterById(
    LetterCode: string
  ): Observable<any[]> {
    const params = new HttpParams().append('LetterCode', LetterCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetAutletterById", { headers: this.headerService.headers, params: params }))
  }



  SetAlarmOff(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "SetAlarmOff", command, { headers: this.headerService.headers }))
  }

  Update_AutletterRow(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "Update_AutletterRow", command, { headers: this.headerService.headers }))
  }



  Conversation_Insert(
    LetterRef: string
    , CentralRef: string
    , ConversationText: string
  ): Observable<any[]> {
    const params = new HttpParams().append('LetterRef', LetterRef).append('CentralRef', CentralRef).append('ConversationText', ConversationText)
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "Conversation_Insert", { LetterRef, CentralRef, ConversationText }, { headers: this.headerService.headers }))
  }




  Conversation_UploadFile(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "Conversation_UploadFile", command, { headers: this.headerService.headers }))
  }




  GetVoiceFileFromAttach(ObjectRef: string): Observable<any[]> {
    const params = new HttpParams().append('pixelScale', '1000').append('ClassName', 'Aut').append('ObjectRef', ObjectRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetVoiceFileFromAttach", { headers: this.headerService.headers, params: params }))

  }


  GetConversationFileFromAttach(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetConversationFileFromAttach", command, { headers: this.headerService.headers }))
  }







  DeleteAutLetter(LetterCode: string): Observable<any[]> {
    const params = new HttpParams().append('LetterCode', LetterCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteAutLetter", { headers: this.headerService.headers, params: params }))
  }


  DeleteAutLetterRows(LetterRowCode: string): Observable<any[]> {
    const params = new HttpParams().append('LetterRowCode', LetterRowCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteAutLetterRows", { headers: this.headerService.headers, params: params }))
  }


  GetCentralByCode(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetCentralByCode", command, { headers: this.headerService.headers }))
  }

  GetFactorByCustomerCode(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetFactorByCustomerCode", command, { headers: this.headerService.headers }))
  }





}
