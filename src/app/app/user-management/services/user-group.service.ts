import { Injectable } from '@angular/core';
import { HttpService } from '../../../app-shell/framework-services/http.service';
import { ServiceBase } from '../../../app-shell/framework-services/service.base';

@Injectable({
  providedIn: 'root',
})
export class UserGroupService extends ServiceBase {
  constructor(httpService: HttpService) {
    super('UserGroup', httpService);
  }
  fakeUser() {
    const path = `https://jsonplaceholder.typicode.com/comments`;
    return this.httpService.get(path);
  }
  getForPartyCombo() {
    const path = `${this.baseUrl}/GetForPartyCombo`;
    return this.httpService.getAll<any>(path);
  }
}
