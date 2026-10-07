import { Injectable } from '@angular/core';

export interface SantralWebPhoneConfig {
    wsUrl: string;
    domain: string;
    autoRegister: boolean;
    testUrl?: string;
}

export interface SignalRConfig {
    enabled: boolean;
    hubUrl: string;
    withCredentials: boolean;
    logLevel?: string;
    reconnectDelays?: number[];
}

export interface MenuConfig {
    ShowGroupImage?: boolean;
    ShowProductImage?: boolean;
    ShowSearchImage?: boolean;
    ShowSubGroups?: boolean;
    ShowQuickGroups?: boolean;
    EnableBasketExplain?: boolean;
    EnableAddSound?: boolean;
    EnableFlyToBasket?: boolean;
    EnableBasketPulse?: boolean;
    EnableSearch?: boolean;
    EnableCategoryScroll?: boolean;
    PriceMode?: string;
    SortMode?: string;
    EnableBranchPrice?: boolean;
    EnableCameraUpload?: boolean;
    EnableGalleryUpload?: boolean;
    EnableMenuProfile?: boolean;
    EnableApiSetting?: boolean;
    ShowHeaderTitle?: boolean;
    ShowHeaderSubTitle?: boolean;
    ShowBasketButton?: boolean;
    ShowBasketCount?: boolean;
    ShowBasketAmount?: boolean;
    EnableAddToast?: boolean;
    ShowAddButton?: boolean;
    ShowAddButtonIcon?: boolean;
    ShowProductBadge?: boolean;
    AddButtonText?: string;
    [key: string]: boolean | number | string | undefined;
}

export type ProductConfig = Record<string, boolean | number | string>;

export interface ThemeConfig {
    background?: string;
    surface?: string;
    primary?: string;
    accent?: string;
    text?: string;
    muted?: string;
    [key: string]: string | undefined;
}

export interface AppRuntimeConfig {
    appVersion: string;
    production: boolean;
    apiUrl: string;
    baseHref: string;
    localapiUrl?: string;
    localMenuapiUrl?: string;
    MenuapiUrl?: string;
    ProductapiUrl?: string;
    ProductapiUrl1?: string;
    santralUrl?: string;
    santralWebPhone?: SantralWebPhoneConfig;
    signalR?: SignalRConfig;
    menuConfig?: MenuConfig;
    productConfig?: ProductConfig;
    menuTheme?: ThemeConfig;
    productTheme?: ThemeConfig;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
    private config: AppRuntimeConfig | null = null;
    private readonly endpointKeys = new Set([
        'apiUrl',
        'localapiUrl',
        'localMenuapiUrl',
        'MenuapiUrl',
        'ProductapiUrl',
        'ProductapiUrl1',
        'santralUrl',
        'wsUrl',
        'testUrl',
        'hubUrl',
    ]);

    initialize(value: unknown): void {
        this.config = this.validate(value);
    }

    async loadConfig(): Promise<void> {
        const response = await fetch('./assets/config.json', { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`Runtime config request failed with status ${response.status}.`);
        }

        this.initialize(await response.json());
    }

    get apiUrl(): string {
        return this.current.apiUrl;
    }

    get MenuapiUrl(): string {
        return this.current.MenuapiUrl ?? '';
    }

    get ProductapiUrl(): string {
        return this.current.ProductapiUrl ?? '';
    }

    get santralUrl(): string {
        return this.current.santralUrl ?? '';
    }

    get santralWebPhone(): SantralWebPhoneConfig {
        return this.current.santralWebPhone ?? {
            wsUrl: '',
            domain: '',
            autoRegister: false,
        };
    }

    get AppVersion(): string {
        return this.current.appVersion;
    }

    get menuConfig(): MenuConfig {
        return this.current.menuConfig ?? {};
    }

    get productConfig(): ProductConfig {
        return this.current.productConfig ?? {};
    }

    get menuTheme(): ThemeConfig {
        return this.current.menuTheme ?? {};
    }

    get productTheme(): ThemeConfig {
        return this.current.productTheme ?? {};
    }

    get all(): Readonly<AppRuntimeConfig> {
        return this.current;
    }

    private get current(): AppRuntimeConfig {
        if (!this.config) {
            throw new Error('Runtime config has not been initialized.');
        }

        return this.config;
    }

    private validate(value: unknown): AppRuntimeConfig {
        if (!this.isRecord(value)) {
            throw new Error('Runtime config must be a JSON object.');
        }

        const requiredStrings = ['appVersion', 'apiUrl', 'baseHref'] as const;

        for (const key of requiredStrings) {
            if (typeof value[key] !== 'string' || value[key].trim().length === 0) {
                throw new Error(`Runtime config field "${key}" is required.`);
            }
        }

        if (typeof value['production'] !== 'boolean') {
            throw new Error('Runtime config field "production" must be a boolean.');
        }

        const apiUrl = value['apiUrl'] as string;

        if (!apiUrl.endsWith('/')) {
            throw new Error('Runtime config field "apiUrl" must end with "/".');
        }

        this.validateEndpointUrls(value, value['production'] as boolean);

        return value as unknown as AppRuntimeConfig;
    }

    private validateEndpointUrls(value: Record<string, unknown>, production: boolean, path = ''): void {
        for (const [key, child] of Object.entries(value)) {
            const childPath = path ? `${path}.${key}` : key;

            if (this.endpointKeys.has(key) && typeof child === 'string' && child.trim()) {
                this.validateEndpointUrl(childPath, key, child, production);
                continue;
            }

            if (this.isRecord(child)) {
                this.validateEndpointUrls(child, production, childPath);
            }
        }
    }

    private validateEndpointUrl(path: string, key: string, rawUrl: string, production: boolean): void {
        let url: URL;
        try {
            url = new URL(rawUrl);
        } catch {
            throw new Error(`Runtime config field "${path}" must be an absolute URL.`);
        }

        if (url.username || url.password) {
            throw new Error(`Runtime config field "${path}" must not contain credentials.`);
        }

        const websocketEndpoint = key === 'wsUrl' || key === 'testUrl';
        const allowedProtocols = websocketEndpoint ? ['ws:', 'wss:'] : ['http:', 'https:'];
        if (!allowedProtocols.includes(url.protocol)) {
            throw new Error(`Runtime config field "${path}" uses an invalid protocol.`);
        }

        const secureProtocol = url.protocol === 'https:' || url.protocol === 'wss:';
        if (production && !secureProtocol && !this.isPrivateHost(url.hostname)) {
            throw new Error(`Runtime config field "${path}" must use HTTPS/WSS in production.`);
        }
    }

    private isPrivateHost(hostname: string): boolean {
        return hostname === 'localhost'
            || hostname === '127.0.0.1'
            || hostname === '::1'
            || /^10\./.test(hostname)
            || /^192\.168\./.test(hostname)
            || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
    }

    private isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
}
