import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { AuthenticationTokens } from '../auth-api.models';
import { AuthDeviceService } from './auth-device.service';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly session = inject(SessionStorageService);
  private readonly config = inject(AppConfigService);
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly authDevice = inject(AuthDeviceService);
  private refreshInFlight?: Observable<string>;

  refreshAccessToken(): Observable<string> {
    if (this.refreshInFlight) return this.refreshInFlight;

    const subject = this.session.authSubject;
    const refreshToken = this.session.refreshToken;
    if (!subject || !refreshToken) {
      throw new Error('Refresh credentials are not available.');
    }

    this.refreshInFlight = this.http.post<AuthenticationTokens>(
      `${this.config.apiUrl}Auth/v2/refresh`,
      { subject, refreshToken, deviceId: this.authDevice.deviceId }
    ).pipe(
      tap(auth => {
        this.session.accessToken = auth.accessToken;
        this.session.refreshToken = auth.refreshToken;
        this.session.authSubject = auth.subject;
        this.session.authSessionId = auth.sessionId ?? '';
        this.session.authTokenVersion = auth.tokenVersion ?? 1;
      }),
      map(auth => auth.accessToken),
      finalize(() => this.refreshInFlight = undefined),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    return this.refreshInFlight;
  }

  logout(): Observable<void> {
    const subject = this.session.authSubject;
    const refreshToken = this.session.refreshToken;
    const accessToken = this.session.accessToken;
    if (!subject || !refreshToken || !accessToken) {
      this.session.clearAuthentication();
      return of(undefined);
    }

    return this.http.post<void>(
      `${this.config.apiUrl}Auth/v2/logout`,
      { subject, refreshToken },
      { headers: new HttpHeaders({ Authorization: `Bearer ${accessToken}` }) }
    ).pipe(
      catchError(() => of(undefined)),
      finalize(() => this.session.clearAuthentication())
    );
  }
}
