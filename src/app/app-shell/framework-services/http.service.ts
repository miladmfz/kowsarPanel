import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpService {
  constructor(private readonly http: HttpClient) {
  }

  public setHeaders(loading = false, noValidate = false): HttpHeaders {
    const headersConfig = {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'loading': loading.toString(),
      'noValidate': noValidate.toString()
    };

    return new HttpHeaders(headersConfig);
  }

  private setHeadersForFile(): HttpHeaders {
    const headersConfig = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    };

    return new HttpHeaders(headersConfig);
  }

  getAll<T>(path: string, loading: boolean = false, body = {}) {
    let headers: any = this.setHeaders(loading);
    return this.http.get<T>(`${path}`, { headers: headers });
  }

  get<T>(path: string, id: any = '', loading: boolean = false) {
    let headers: any = this.setHeaders(loading);
    return this.http.get<T>(`${path}/${id}`, { headers: headers });
  }

  getBlob<T>(path: string, id: any = '', loading: boolean = false) {
    let headers: any = this.setHeaders(loading);
    return this.http.get<T>(`${path}/${id}`, { headers: headers, responseType: 'blob' as 'json' });
  }

  getWithParams<T>(path: string, params = {}, loading: boolean = true) {
    let headers: any = this.setHeaders(loading);
    return this.http.get<T>(`${path}`, { headers: headers, params: params });
  }

  put(path: string, body = {}, loading: boolean = false, noValidate = false) {
    let headers = this.setHeaders(loading, noValidate);
    return this.http.put(`${path}`, body, { headers: headers });
  }

  post<T>(path: string, body = {}, loading = true, noValidate = false) {
    let headers = this.setHeaders(loading, noValidate);
    return this.http.post<T>(`${path}`, body, { headers: headers });
  }

  postFormData<T>(path: string, formData) {
    return this.http.post<T>(`${path}`, formData);
  }

  putFormData<T>(path: string, formData) {
    return this.http.put<T>(`${path}`, formData);
  }

  delete(path: string): Observable<any> {
    return this.http.delete(`${path}`, { headers: this.setHeaders() });
  }

  identityGet(ajax_url: string, path: string) {
    return this.http.get<string>(`${ajax_url}${path}`, { headers: this.setHeaders() });
  }
}