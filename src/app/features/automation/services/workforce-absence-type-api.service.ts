import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';

import { AppConfigService } from 'src/app/app-config.service';
import { HeaderService } from 'src/app/app-shell/framework-services/header.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import {
  WorkforceAbsenceTypeQuery,
  WorkforceAbsenceTypeResponse,
  WorkforceAbsenceTypeSaveRequest,
} from '../models/workforce-absence-type.models';

@Injectable({ providedIn: 'root' })
export class WorkforceAbsenceTypeApiService {
  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private readonly loadingService = inject(LoadingService);
  private readonly headerService = inject(HeaderService);
  private readonly baseUrl = this.config.apiUrl + 'WorkforceAbsence/';

  list(query: WorkforceAbsenceTypeQuery): Observable<WorkforceAbsenceTypeResponse> {
    return this.withLoading(this.client.post<WorkforceAbsenceTypeResponse>(
      this.baseUrl + 'Type_Get', query, { headers: this.headerService.headers },
    ));
  }

  save(command: WorkforceAbsenceTypeSaveRequest): Observable<WorkforceAbsenceTypeResponse> {
    return this.withLoading(this.client.post<WorkforceAbsenceTypeResponse>(
      this.baseUrl + 'Type_Save', command, { headers: this.headerService.headers },
    ));
  }

  private withLoading<T>(request$: Observable<T>): Observable<T> {
    this.loadingService.show();
    return request$.pipe(finalize(() => this.loadingService.hide()));
  }
}
