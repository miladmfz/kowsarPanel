import { Injectable } from '@angular/core';
import { HttpService } from '../../../app-shell/framework-services/http.service';
import { ServiceBase } from '../../../app-shell/framework-services/service.base';

@Injectable({
  providedIn: 'root',
})
export class TileService extends ServiceBase {
  constructor(httpService: HttpService) {
    super('Tile', httpService);
  }

  update(body) {
    return this.httpService.post<any>(this.baseUrl, body);
  }

  updateGroup(body) {
    return this.httpService.post(`${this.baseUrl}/UpdateGroup`, body);
  }

  removeUserTile(id) {
    return this.httpService.delete(`${this.baseUrl}/RemoveUserTile/${id}`);
  }

  removeUserTileGroup(id) {
    return this.httpService.delete(`${this.baseUrl}/RemoveUserTileGroup/${id}`);
  }
}
