import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class KowsarWebApiService {



  baseUrl: string;
  headers: HttpHeaders;

  constructor(private client: HttpClient, private config: AppConfigService) {
    this.baseUrl = this.config.apiUrl + 'KowsarWeb/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') ?? '');
  }









  GetObjectTypeFromDbSetup(ObjectType: string): Observable<any[]> {
    const params = new HttpParams().append('ObjectType', ObjectType)
    return this.client.get<any[]>(this.baseUrl + "GetObjectTypeFromDbSetup", { headers: this.headers, params: params })
  }


  GetLastGoodData(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetLastGoodData", { headers: this.headers })
  }






  Good_Insert(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GoodInsert", command, { headers: this.headers })
  }

  Good_Update_base(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GoodUpdateBase", command, { headers: this.headers })
  }

  Good_Update_Complete(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GoodUpdateComplete", command, { headers: this.headers })
  }

  Good_Update_Units(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GoodUpdateUnits", command, { headers: this.headers })
  }

  Good_Update_Relations(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GoodUpdateRelations", command, { headers: this.headers })
  }




  GetGood_base(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.baseUrl + "GetGoodBase", { headers: this.headers, params: params })
  }

  GetGood_Explain(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.baseUrl + "GetGoodExplain", { headers: this.headers, params: params })
  }
  GetGood_Propertys(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.baseUrl + "GetGoodProperty", { headers: this.headers, params: params })
  }

  GetGood_Complete(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.baseUrl + "GetGoodComplete", { headers: this.headers, params: params })
  }

  GetGood_Units(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.baseUrl + "GetGoodUnits", { headers: this.headers, params: params })
  }

  GetGood_Relations(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.baseUrl + "GetGoodRelations", { headers: this.headers, params: params })
  }



  GetGood_Images(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.baseUrl + "GetGoodImages", { headers: this.headers, params: params })
  }

  GetGood_Groups(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.baseUrl + "GetGoodGroups", { headers: this.headers, params: params })
  }


  GetGood_Stacks(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.baseUrl + "GetGoodStacks", { headers: this.headers, params: params })
  }



  GoodCrudService(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GoodCrudService", command, { headers: this.headers })

  }


  GetGoodList(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetGoodList", { headers: this.headers })
  }


  GetStacks(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetStacks", { headers: this.headers })
  }



  GetGoodsGrp(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetGoodsGrp", { headers: this.headers })
  }


  GetProperty(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GetProperty", command, { headers: this.headers })

  }

  SendImageToServer(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "UploadImage", command, { headers: this.headers })
  }

  GetImageFromServer(Pixel: string, KsrImageCode: string): Observable<any[]> {
    const params = new HttpParams().append('Pixel', Pixel).append('KsrImageCode', KsrImageCode)
    return this.client.get<any[]>(this.baseUrl + "GetImageFromKsr", { headers: this.headers, params: params })

  }


  DeleteGoodGroupCode(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.baseUrl + "DeleteGoodGroupCode", { headers: this.headers, params: params })

  }


  DeleteKsrImageCode(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.baseUrl + "DeleteKsrImageCode", { headers: this.headers, params: params })

  }

  GetBarcodeList(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.baseUrl + "GetBarcodeList", { headers: this.headers, params: params })

  }


  GetSimilarGood(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.baseUrl + "GetSimilarGood", { headers: this.headers, params: params })

  }



  IsbnToBarcode(Isbn: string, GoodCode: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "IsbnToBarcode", { Isbn, GoodCode }, { headers: this.headers })

  }



  GetGoods(Searchtarget: string): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GetGoods", { Searchtarget }, { headers: this.headers })

  }

  GetGridSchema(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)

    return this.client.get<any[]>(this.baseUrl + "GetGridSchema", { headers: this.headers, params: params })
  }





}









