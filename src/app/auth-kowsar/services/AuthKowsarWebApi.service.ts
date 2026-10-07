import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';
import {
  AuthenticationTokens,
  AuthSessionsResponse,
  AuthLoginRequest,
  CentralPermissionResponse,
  CentralRoleConfiguration,
  CentralRolesResponse,
  CentralUsersResponse,
  CustomerLoginResponse,
  GuestOtpRequest,
  OtpChallengeResponse,
  LoginResponse,
  PermissionsResponse,
  RolePermissionsResponse,
  RolesResponse,
  UpdateCentralRolesRequest,
} from '../auth-api.models';
import { AuthDeviceService } from './auth-device.service';

@Injectable({
  providedIn: 'root'
})
export class AuthKowsarWebApiService {


  baseUrl: string;
  private readonly headerService = inject(HeaderService);

  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private readonly AutoloadingService = inject(LoadingService);
  protected readonly session = inject(SessionStorageService);
  private readonly authDevice = inject(AuthDeviceService);
  private withLoading<T>(obs$: Observable<T>): Observable<T> {
    this.AutoloadingService.show();
    return obs$.pipe(finalize(() => this.AutoloadingService.hide()));
  }

  constructor() {
    this.baseUrl = this.config.apiUrl + 'Auth/';


  }



  ////////////////////////////////////////////////////////////////////



  IsUser(command: AuthLoginRequest): Observable<CustomerLoginResponse> {
    return this.withLoading(this.client.post<CustomerLoginResponse>(
      this.baseUrl + "IsUser",
      this.withDevice(command),
      { headers: this.headerService.headers }
    ));
  }
  KowsarLogin(command: AuthLoginRequest): Observable<LoginResponse> {
    return this.withLoading(this.client.post<LoginResponse>(
      this.baseUrl + "KowsarLogin",
      this.withDevice(command),
      { headers: this.headerService.headers }
    ));
  }

  VerifyOtp(challengeId: string, code: string): Observable<LoginResponse> {
    return this.withLoading(this.client.post<LoginResponse>(
      this.baseUrl + "v2/otp/verify",
      { challengeId, code, deviceId: this.authDevice.deviceId },
      { headers: this.headerService.headers }
    ));
  }

  RequestGuestOtp(command: GuestOtpRequest): Observable<OtpChallengeResponse> {
    return this.withLoading(this.client.post<OtpChallengeResponse>(
      this.baseUrl + 'v2/guest/otp/request',
      command,
      { headers: this.headerService.headers }
    ));
  }

  VerifyGuestOtp(challengeId: string, code: string): Observable<LoginResponse> {
    return this.withLoading(this.client.post<LoginResponse>(
      this.baseUrl + 'v2/guest/otp/verify',
      { challengeId, code, deviceId: this.authDevice.deviceId },
      { headers: this.headerService.headers }
    ));
  }

  RefreshToken(subject: string, refreshToken: string): Observable<AuthenticationTokens> {
    return this.client.post<AuthenticationTokens>(
      this.baseUrl + "v2/refresh",
      { subject, refreshToken, deviceId: this.authDevice.deviceId }
    );
  }

  Logout(subject: string, refreshToken: string): Observable<void> {
    return this.client.post<void>(this.baseUrl + "v2/logout", { subject, refreshToken });
  }

  CentralPermission(CentralRef: string): Observable<CentralPermissionResponse> {
    const params = new HttpParams().append('CentralRef', CentralRef)
    return this.withLoading(this.client.get<CentralPermissionResponse>(this.baseUrl + "CentralPermission", { headers: this.headerService.headers, params: params }))
  }

  GetRoles(): Observable<RolesResponse> {
    const params = new HttpParams()
    return this.withLoading(this.client.get<RolesResponse>(this.baseUrl + "GetRoles", { headers: this.headerService.headers, params: params }))
  }


  GetRoleById(RoleCode: string): Observable<RolesResponse> {
    const params = new HttpParams().append('RoleCode', RoleCode)
    return this.withLoading(this.client.get<RolesResponse>(this.baseUrl + "GetRoleById", { headers: this.headerService.headers, params: params }))
  }

  GetPermissions(): Observable<PermissionsResponse> {
    const params = new HttpParams()
    return this.withLoading(this.client.get<PermissionsResponse>(this.baseUrl + "GetPermissions", { headers: this.headerService.headers, params: params }))
  }


  GetRolePermissions(RoleRef: string): Observable<RolePermissionsResponse> {
    const params = new HttpParams().append('RoleRef', RoleRef)
    return this.withLoading(this.client.get<RolePermissionsResponse>(this.baseUrl + "GetRolePermissions", { headers: this.headerService.headers, params: params }))
  }

  GetCentralRoles(CentralRef: string): Observable<CentralRolesResponse> {
    const params = new HttpParams().append('CentralRef', CentralRef)
    return this.withLoading(this.client.get<CentralRolesResponse>(this.baseUrl + "GetCentralRoles", { headers: this.headerService.headers, params: params }))
  }

  GetCentralUsers(): Observable<CentralUsersResponse> {
    const params = new HttpParams()
    return this.withLoading(this.client.get<CentralUsersResponse>(this.baseUrl + "GetCentralUsers", { headers: this.headerService.headers, params: params }))
  }

  GetCurrentCentralRoleConfiguration(): Observable<CentralRoleConfiguration> {
    return this.withLoading(this.client.get<CentralRoleConfiguration>(
      this.baseUrl + 'v2/central-roles/current',
      { headers: this.headerService.headers },
    ));
  }

  UpdateCurrentCentralRoleConfiguration(request: UpdateCentralRolesRequest): Observable<CentralRoleConfiguration> {
    return this.withLoading(this.client.put<CentralRoleConfiguration>(
      this.baseUrl + 'v2/central-roles/current',
      request,
      { headers: this.headerService.headers },
    ));
  }

  GetAuthSessions(includeInactive = false, take = 200): Observable<AuthSessionsResponse> {
    const params = new HttpParams()
      .set('includeInactive', includeInactive)
      .set('take', take);
    return this.withLoading(this.client.get<AuthSessionsResponse>(
      this.baseUrl + 'v2/sessions',
      { params }
    ));
  }

  RevokeAuthSession(sessionId: string): Observable<void> {
    return this.client.delete<void>(
      `${this.baseUrl}v2/sessions/${encodeURIComponent(sessionId)}`
    );
  }

  RevokeAllAuthSessions(subject: string): Observable<{ subject: string; tokenVersion: number }> {
    return this.client.post<{ subject: string; tokenVersion: number }>(
      this.baseUrl + 'v2/sessions/revoke-all',
      { subject }
    );
  }

  private withDevice(command: AuthLoginRequest): AuthLoginRequest {
    return { ...command, DeviceId: this.authDevice.deviceId };
  }



}



