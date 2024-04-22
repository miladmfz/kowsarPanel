import { Injectable } from '@angular/core';
import { HttpService } from '../../../app-shell/framework-services/http.service';
import { ServiceBase } from '../../../app-shell/framework-services/service.base';
import { getServiceUrl } from 'src/environment/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ServiceBase {
  constructor(httpService: HttpService) {
    super('User', httpService);
  }
  fakeUser() {
    const path = `https://jsonplaceholder.typicode.com/comments`;
    return this.httpService.get(path);
  }
  getToken(command) {
    const path = `${this.baseUrl}/GetToken`;
    return this.httpService.put(path, command);
  }

  changePassword(command) {
    const path = `${this.baseUrl}/ChangePassword`;
    return this.httpService.put(path, command);
  }

  changeDateYm(dateYm) {
    const path = `${this.baseUrl}/ChangeDateYm/${dateYm}`;
    return this.httpService.put(path);
  }

  changeCompanyId(companyGuid) {
    const path = `${this.baseUrl}/ChangeCompanyId/${companyGuid}`;
    return this.httpService.put(path);
  }

  healthCheck() {
    const path = `${getServiceUrl()}health`;
    return this.httpService.getWithParams(path, {}, false);
  }
}
