import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorHandler, inject, Injectable } from '@angular/core';

import { AppConfigService } from '../../../app-config.service';
import { SessionStorageService } from '../storage/session.storage.service';

@Injectable({ providedIn: 'root' })
export class BrowserErrorMonitoringService {
  private readonly config = inject(AppConfigService);
  private readonly session = inject(SessionStorageService);
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly recentReports = new Map<string, number>();

  report(error: unknown): void {
    const accessToken = this.session.accessToken;
    if (!this.config.all.production || !accessToken) return;

    const message = sanitizeRuntimeError(error);
    const now = Date.now();
    const lastReport = this.recentReports.get(message) ?? 0;
    if (now - lastReport < 30_000) return;
    this.recentReports.set(message, now);

    const report = {
      ErrorLog: message,
      Broker: 'KowsarPanel',
      DeviceId: 'browser',
      ServerName: globalThis.location?.hostname || 'browser',
      VersionName: this.config.AppVersion,
      StrDate: new Date(now).toISOString(),
    };

    this.http.post(`${this.config.apiUrl}Kits/ErrorLog`, report, {
      headers: new HttpHeaders({ Authorization: `Bearer ${accessToken}` }),
      responseType: 'text',
    }).subscribe({
      error: () => undefined,
    });
  }
}

@Injectable()
export class KowsarGlobalErrorHandler implements ErrorHandler {
  private readonly monitoring = inject(BrowserErrorMonitoringService);
  private readonly config = inject(AppConfigService);

  handleError(error: unknown): void {
    this.monitoring.report(error);
    if (this.config.all.production) {
      console.error('Unhandled application error');
    } else {
      console.error('Unhandled application error', error);
    }
  }
}

export function sanitizeRuntimeError(error: unknown): string {
  const candidate = error instanceof Error
    ? `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`
    : typeof error === 'string'
      ? error
      : 'Unknown browser error';

  return candidate
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [redacted]')
    .replace(/([?&](?:access_token|refresh_token|token|password|api[_-]?key)=)[^&\s]+/gi, '$1[redacted]')
    .replace(/([a-z][a-z0-9+.-]*:\/\/)[^/@\s]+:[^/@\s]+@/gi, '$1[credentials-redacted]@')
    .replace(/\b(password|connectionstring|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
    .slice(0, 2000);
}
