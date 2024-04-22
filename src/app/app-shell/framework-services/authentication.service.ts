import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, map } from 'rxjs/operators';
import {
  ACCESS_TOKEN_NAME,
  DATABASAE_NAME,
  PERMISSIONS_NAME,
  ROLE_TOKEN_NAME,
  SETTINGS_NAME,
  USER_ID_NAME,
} from './configuration';
import { Papa } from 'ngx-papaparse';
import { LocalStorageService } from './local.storage.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { getIdentityUrl, getServiceUrl } from 'src/environment/environment';
import { IdentityService } from './identity.service';
import { UserService } from '../../app/user-management/services/user.service';
import { SettingService } from './setting.service';
import { FeatureService } from '../../app/user-management/services/feature.service';
import { NotificationService } from './notification.service';

@Injectable()
export class AuthenticationService {
  // private userLoadededEvent: EventEmitter<User> = new EventEmitter<User>();
  // private currentUser: User;
  private authHeaders: Headers;
  // private userManager: UserManager;
  // private loginUrl: string = `${getLoginUrl()}`;
  isLoading$: Observable<boolean>;
  private isLoadingSubject: BehaviorSubject<boolean>;

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private readonly featureService: FeatureService,
    private readonly httpClient: HttpClient,
    private papa: Papa,
    private readonly identityService: IdentityService,
    private readonly userService: UserService,
    private readonly settingService: SettingService,
    private readonly notificationService: NotificationService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  logout() {
    this.localStorageService.removeItem(ACCESS_TOKEN_NAME);
    this.localStorageService.removeItem(ROLE_TOKEN_NAME);
    this.localStorageService.removeItem(USER_ID_NAME);
    this.localStorageService.removeItem(PERMISSIONS_NAME);
    this.localStorageService.removeItem(SETTINGS_NAME);
    this.localStorageService.removeItem(DATABASAE_NAME);
  }

  isLoggedIn() {
    return this.localStorageService.exists(ACCESS_TOKEN_NAME);
  }

  getToken() {
    return this.localStorageService.getItem(ACCESS_TOKEN_NAME);
  }

  checkPermission(neededPermission: string) {
    const userPermissions = this.getPermissions();
    let hasPermission = false;
    if (!userPermissions) return hasPermission;

    this.papa.parse(userPermissions, {
      complete: (result) => {
        if (result.data.length == 0) {
          hasPermission = false;
        }

        if (result.data[0].find((x) => x == neededPermission)) {
          hasPermission = true;
        }
      },
    });
    return hasPermission;
  }

  hasNoAnyPermissions(): boolean {
    const userPermissions = this.getPermissions();
    return userPermissions === '';
  }

  getPermissions() {
    return this.localStorageService.getItem(PERMISSIONS_NAME);
  }
}
