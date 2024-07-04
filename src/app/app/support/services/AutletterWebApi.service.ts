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

    .set('content-type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') + "")


  baseUrl = environment.api_Url + "Support/";


  //////////////////////////////////////////////////////////////////////
  GetTodeyFromServer(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer")
  }


  GetLetterList(
    SearchTarget: string,
    CentralRef: string,
    CreationDate: string
  ): Observable<any[]> {
    const params = new HttpParams().append('SearchTarget', SearchTarget).append('CentralRef', CentralRef).append('CreationDate', CreationDate)
    return this.client.get<any[]>(this.baseUrl + "GetLetterList", { params: params })
  }

  GetLetterFromPersoninfo(
    PersonInfoCode: string
  ): Observable<any[]> {
    const params = new HttpParams().append('PersonInfoCode', PersonInfoCode)
    return this.client.get<any[]>(this.baseUrl + "GetLetterFromPersoninfo", { params: params })
  }


  LetterInsert(
    LetterDate: string,
    title: string,
    Description: string,
    CentralRef: string
  ): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "LetterInsert", { LetterDate, title, Description, CentralRef })
  }

  GetLetterRowList(
    LetterRef: string
  ): Observable<any[]> {
    const params = new HttpParams().append('LetterRef', LetterRef)
    return this.client.get<any[]>(this.baseUrl + "GetLetterRowList", { params: params })
  }


  GetCentralUser(
  ): Observable<any[]> {
    const params = new HttpParams()
    return this.client.get<any[]>(this.baseUrl + "GetCentralUser");
  }





  AutLetterRowInsert(
    LetterRef: string,
    LetterDate: string,
    Description: string,
    CreatorCentral: string,
    ExecuterCentral: string
  ): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "AutLetterRowInsert", { LetterRef, LetterDate, Description, CreatorCentral, ExecuterCentral })
  }



  GetAutConversation(
    LetterRef: string
  ): Observable<any[]> {
    const params = new HttpParams().append('LetterRef', LetterRef)
    return this.client.get<any[]>(this.baseUrl + "GetAutConversation", { params: params })
  }


  SetAlarmOff(
    LetterRowCode: string
  ): Observable<any[]> {
    const params = new HttpParams().append('LetterRowCode', LetterRowCode)
    return this.client.get<any[]>(this.baseUrl + "SetAlarmOff", { params: params })
  }


  Conversation_Insert(
    LetterRef: string
    , CentralRef: string
    , ConversationText: string
  ): Observable<any[]> {
    const params = new HttpParams().append('LetterRef', LetterRef).append('CentralRef', CentralRef).append('ConversationText', ConversationText)
    return this.client.post<any[]>(this.baseUrl + "Conversation_Insert", { LetterRef, CentralRef, ConversationText })
  }



  SendImageToServer(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "Conversation_UploadImage", command)
  }



  GetImageFromServer(ObjectRef: string): Observable<any[]> {
    const params = new HttpParams().append('pixelScale', '1000').append('ClassName', 'Aut').append('ObjectRef', ObjectRef)
    return this.client.get<any[]>(this.baseUrl + "GetWebImagess", { params: params })

  }


  SetAttachFile(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "SetAttachFile", command)
  }


  GetAttachFileList(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetAttachFileList", command)
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
