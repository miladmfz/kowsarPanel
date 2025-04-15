import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  data: any;
  _dataBS = new BehaviorSubject([]);


  private _sharedData$ = new BehaviorSubject<any>(null);
  sharedData$ = this._sharedData$.asObservable();


  private sidebarActionSubject = new BehaviorSubject<string | null>(null);
  sidebarAction$ = this.sidebarActionSubject.asObservable();


  constructor() {
    this._dataBS.next(this.data);
  }

  setData(data) {
    this.data = data;
    this._dataBS.next(data);
  }

  emptyData() {
    this.data = [];
    this._dataBS.next(this.data);
  }
  sendData(data: any) {
    this._sharedData$.next(data);
  }

  triggerSidebarAction(action: string) {
    this.sidebarActionSubject.next(action);
  }
}