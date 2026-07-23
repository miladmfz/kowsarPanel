import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SantralWebPhoneConfig {
    wsUrl: string;
    domain: string;
    autoRegister: boolean;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
    private config: any = {};

    constructor(private http: HttpClient) { }

    async loadConfig(): Promise<void> {
        try {
            this.config = await firstValueFrom(
                this.http.get('./assets/config.json')
            );

            console.log('App config loaded:', this.config);

        } catch (err) {
            console.error('Error loading config.json:', err);
        }
    }

    get apiUrl(): string {
        return this.config?.apiUrl ?? '';
    }

    get MenuapiUrl(): string {
        return this.config?.MenuapiUrl ?? '';
    }
    get ProductapiUrl(): string {
        return this.config?.ProductapiUrl ?? '';
    }
    get santralUrl(): string {
        return this.config?.santralUrl ?? '';
    }

    get santralWebPhone(): SantralWebPhoneConfig {
        return this.config?.santralWebPhone ?? {
            wsUrl: '',
            domain: '',
            autoRegister: false
        };
    }

    get AppVersion(): string {
        return this.config?.appVersion ?? '';
    }

    get menuConfig() {
        return this.config?.menuConfig;
    }

    get productConfig() {
        return this.config?.productConfig;
    }


    get menuTheme() {
        return this.config?.menuTheme;
    }

    get all(): any {
        return this.config;
    }
}