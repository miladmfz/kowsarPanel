import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment, getServiceUrl } from 'src/environment/environment';
import { HttpService } from 'src/app/app-shell/framework-services/http.service';
import { ServiceBase } from 'src/app/app-shell/framework-services/service.base';

@Injectable({
  providedIn: 'root'
})
export class KowsarWebApiService {

  constructor(private client: HttpClient) { }




  headers = new HttpHeaders()

    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') + "")

  kowsarWebUrl = environment.api_Url + "kowsarWeb/";




  GetObjectTypeFromDbSetup(ObjectType: string): Observable<any[]> {
    const params = new HttpParams().append('ObjectType', ObjectType)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetObjectTypeFromDbSetup", { headers: this.headers, params: params })
  }


  GetLastGoodData(): Observable<any[]> {
    return this.client.get<any[]>(this.kowsarWebUrl + "GetLastGoodData", { headers: this.headers })
  }






  Good_Insert(command): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GoodInsert", command, { headers: this.headers })
  }

  Good_Update_base(command): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GoodUpdateBase", command, { headers: this.headers })
  }

  Good_Update_Complete(command): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GoodUpdateComplete", command, { headers: this.headers })
  }

  Good_Update_Units(command): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GoodUpdateUnits", command, { headers: this.headers })
  }

  Good_Update_Relations(command): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GoodUpdateRelations", command, { headers: this.headers })
  }




  GetGood_base(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodBase", { headers: this.headers, params: params })
  }

  GetGood_Explain(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodExplain", { headers: this.headers, params: params })
  }
  GetGood_Propertys(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodProperty", { headers: this.headers, params: params })
  }

  GetGood_Complete(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodComplete", { headers: this.headers, params: params })
  }

  GetGood_Units(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodUnits", { headers: this.headers, params: params })
  }

  GetGood_Relations(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodRelations", { headers: this.headers, params: params })
  }



  GetGood_Images(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodImages", { headers: this.headers, params: params })
  }

  GetGood_Groups(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodGroups", { headers: this.headers, params: params })
  }


  GetGood_Stacks(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodStacks", { headers: this.headers, params: params })
  }



  GoodCrudService(command): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GoodCrudService", command, { headers: this.headers })

  }


  GetGoodList(): Observable<any[]> {
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodList", { headers: this.headers })
  }


  GetStacks(): Observable<any[]> {
    return this.client.get<any[]>(this.kowsarWebUrl + "GetStacks", { headers: this.headers })
  }



  GetGoodsGrp(): Observable<any[]> {
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodsGrp", { headers: this.headers })
  }


  GetProperty(command): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GetProperty", command, { headers: this.headers })

  }

  SendImageToServer(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "UploadImage", command, { headers: this.headers })
  }

  GetImageFromServer(Pixel: string, KsrImageCode: string): Observable<any[]> {
    const params = new HttpParams().append('Pixel', Pixel).append('KsrImageCode', KsrImageCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetImageFromKsr", { headers: this.headers, params: params })

  }


  DeleteGoodGroupCode(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.kowsarWebUrl + "DeleteGoodGroupCode", { headers: this.headers, params: params })

  }


  DeleteKsrImageCode(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.kowsarWebUrl + "DeleteKsrImageCode", { headers: this.headers, params: params })

  }

  GetBarcodeList(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetBarcodeList", { headers: this.headers, params: params })

  }


  GetSimilarGood(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetSimilarGood", { headers: this.headers, params: params })

  }



  IsbnToBarcode(Isbn: string, GoodCode: string): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "IsbnToBarcode", { Isbn, GoodCode }, { headers: this.headers })

  }



  GetGoods(Searchtarget: string): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GetGoods", { Searchtarget }, { headers: this.headers })

  }

  GetGridSchema(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)

    return this.client.get<any[]>(this.kowsarWebUrl + "GetGridSchema", { headers: this.headers, params: params })
  }





}









