import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SETTINGS_NAME } from './configuration';
import { LocalStorageService } from './local.storage.service';
import { Location } from '@angular/common';
import { ServiceBase } from './service.base';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class SettingService extends ServiceBase {

    constructor(httpService: HttpService,
        private readonly localStorageService: LocalStorageService,
        private readonly location: Location,
        private readonly router: Router) {
        super("Setting", httpService);
    }

    getSystemAndUserSettings() {
        let path = `${this.baseUrl}/getSystemAndUserSettings`;
        return this.httpService.getAll<any>(path);
    }

    getSettingValue(name: string) {
        const settings = JSON.parse(this.localStorageService.getItem(SETTINGS_NAME))
        const setting = settings.find(x => x.name == name);
        if (setting) {
            return setting.value;
        }
        else {
            return '';
        }
    }

    referesh() {
        this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
            const url = this.location.path();
            this.router.navigate([url]);
        });
    }
}