import { Injectable } from '@angular/core';
import { HttpService } from '../../../app-shell/framework-services/http.service';
import { ServiceBase } from '../../../app-shell/framework-services/service.base';

@Injectable({
  providedIn: 'root',
})
export class FeatureService extends ServiceBase {
  constructor(httpService: HttpService) {
    super('Feature', httpService);
  }

  getUserPermissions() {
    return this.httpService.getAll<any>(`${this.baseUrl}/GetUserPermissions`);
  }

  getTileFeatures(userGroupId) {
    return this.httpService.getAll<any>(
      `${this.baseUrl}/GetTileFeatures/${userGroupId}`
    );
  }

  getUserTiles(userId) {
    return this.httpService.getAll<any>(
      `${this.baseUrl}/GetUserTiles/${userId}`
    );
  }

  getAllReportFeatures() {
    return this.httpService.getAll<any>(`${this.baseUrl}/GetAllReportFeatures`);
  }
}
