import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from 'src/app/app-config.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';

export interface CdrKowsarAuditSourceNumber {
  number_raw: string;
  number_normal: string;
  number_key: string;
  call_count: number;
  incoming_count: number;
  outgoing_count: number;
  answered_count: number;
  missed_count: number;
  first_call_date: string;
  last_call_date: string;
  total_duration: number;
  total_billsec: number;
  raw_variants?: string[];
}

export interface CdrKowsarAuditSourceResponse {
  ErrCode: number;
  ErrDesc?: string;
  mode?: 'all_time' | 'range';
  startdate?: string;
  enddate?: string;
  total?: number;
  total_calls?: number;
  first_seen?: string;
  last_seen?: string;
  limit?: number;
  truncated?: number;
  numbers?: CdrKowsarAuditSourceNumber[];
}

@Injectable({ providedIn: 'root' })
export class CdrKowsarAuditService {
  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private readonly headerService = inject(HeaderService);

  private readonly baseUrl = this.normalizeBaseUrl(this.config.santralUrl);

  getExternalNumbers(
    allTime: boolean,
    startdate: string,
    enddate: string,
    limit = 50000
  ): Observable<CdrKowsarAuditSourceResponse> {
    let params = new HttpParams()
      .set('tag', 'getCdrExternalNumbersForKowsar')
      .set('all_time', allTime ? '1' : '0')
      .set('limit', String(limit));

    if (!allTime) {
      params = params
        .set('startdate', startdate)
        .set('enddate', enddate);
    }

    return this.client.get<CdrKowsarAuditSourceResponse>(this.baseUrl, {
      headers: this.headerService.headers,
      params
    });
  }

  private normalizeBaseUrl(url: string): string {
    let value = String(url || '').trim();

    if (!value) {
      return '';
    }

    const tagIndex = value.indexOf('?tag=');
    if (tagIndex >= 0) {
      value = value.substring(0, tagIndex);
    }

    const ampTagIndex = value.indexOf('&tag=');
    if (ampTagIndex >= 0) {
      value = value.substring(0, ampTagIndex);
    }

    if (value.includes('index.php')) {
      return value;
    }

    value = value.replace(/\/+$/, '');
    return `${value}/index.php`;
  }
}
