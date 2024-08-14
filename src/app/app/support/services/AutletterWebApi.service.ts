import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AutletterWebApiService {

  constructor(private client: HttpClient) { }



  headers = new HttpHeaders()

    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') + "")


  baseUrl = environment.api_Url + "Support/";


  //////////////////////////////////////////////////////////////////////
  GetTodeyFromServer(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer")
  }


  GetLetterList(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GetLetterList", command, { headers: this.headers })

  }

  GetLetterFromPersoninfo(
    PersonInfoCode: string
  ): Observable<any[]> {
    const params = new HttpParams().append('PersonInfoCode', PersonInfoCode)
    return this.client.get<any[]>(this.baseUrl + "GetLetterFromPersoninfo", { headers: this.headers, params: params })
  }


  LetterInsert(
    LetterDate: string,
    title: string,
    Description: string,
    CentralRef: string
  ): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "LetterInsert", { LetterDate, title, Description, CentralRef }, { headers: this.headers })
  }

  GetLetterRowList(
    LetterRef: string
  ): Observable<any[]> {
    const params = new HttpParams().append('LetterRef', LetterRef)
    return this.client.get<any[]>(this.baseUrl + "GetLetterRowList", { headers: this.headers, params: params })
  }


  GetCentralUser(
  ): Observable<any[]> {
    const params = new HttpParams()
    return this.client.get<any[]>(this.baseUrl + "GetCentralUser", { headers: this.headers });
  }





  AutLetterRowInsert(
    LetterRef: string,
    LetterDate: string,
    Description: string,
    CreatorCentral: string,
    ExecuterCentral: string
  ): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "AutLetterRowInsert", { LetterRef, LetterDate, Description, CreatorCentral, ExecuterCentral }, { headers: this.headers })
  }



  GetAutConversation(
    LetterRef: string
  ): Observable<any[]> {
    const params = new HttpParams().append('LetterRef', LetterRef)
    return this.client.get<any[]>(this.baseUrl + "GetAutConversation", { headers: this.headers, params: params })
  }


  SetAlarmOff(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "SetAlarmOff", command, { headers: this.headers })
  }


  Conversation_Insert(
    LetterRef: string
    , CentralRef: string
    , ConversationText: string
  ): Observable<any[]> {
    const params = new HttpParams().append('LetterRef', LetterRef).append('CentralRef', CentralRef).append('ConversationText', ConversationText)
    return this.client.post<any[]>(this.baseUrl + "Conversation_Insert", { LetterRef, CentralRef, ConversationText }, { headers: this.headers })
  }



  SendImageToServer(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "Conversation_UploadImage", command, { headers: this.headers })
  }



  GetImageFromServer(ObjectRef: string): Observable<any[]> {
    const params = new HttpParams().append('pixelScale', '1000').append('ClassName', 'Aut').append('ObjectRef', ObjectRef)
    return this.client.get<any[]>(this.baseUrl + "GetWebImagess", { headers: this.headers, params: params })

  }


  SetAttachFile(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "SetAttachFile", command, { headers: this.headers })
  }


  GetAttachFileList(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetAttachFileList", command, { headers: this.headers })
  }

  downloadFile(code: string, classname: string, ObjectRef: string): Observable<Blob> {
    const url = `${this.baseUrl}GetAttachFile`;
    const params = { AttachedFileCode: code, ClassName: classname, ObjectRef: ObjectRef };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.client.get(url, {
      params: params,
      headers: headers,
      responseType: 'blob' // Important! This tells HttpClient to parse the response as Blob
    });
  }



}
