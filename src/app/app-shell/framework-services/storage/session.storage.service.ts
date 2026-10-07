import { Injectable } from '@angular/core';
import { ACCESS_TOKEN_NAME } from '../base/configuration';
import { NormalizedAuthUser } from 'src/app/auth-kowsar/auth-api.models';

@Injectable({
    providedIn: 'root',
})
export class SessionStorageService {

    private readonly hasWindow =
        typeof window !== 'undefined';

    // ======================================================
    // String
    // ======================================================

    setString(key: string, value: string): void {
        if (!this.hasWindow) return;

        sessionStorage.setItem(key, value ?? '');
    }

    getString(key: string): string {
        if (!this.hasWindow) return '';

        const value = sessionStorage.getItem(key);

        if (!value) {
            return '';
        }

        return value.replace(/^"(.*)"$/, '$1');
    }

    // ======================================================
    // Object / Array
    // ======================================================

    setItem<T>(key: string, value: T): void {
        if (!this.hasWindow) return;

        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.error(`[SessionStorage] setItem error for key "${key}":`, err);
        }
    }

    getItem<T>(key: string): T | null {
        if (!this.hasWindow) return null;

        try {
            const value = sessionStorage.getItem(key);

            return value
                ? JSON.parse(value) as T
                : null;
        } catch (err) {
            console.error(`[SessionStorage] getItem error for key "${key}":`, err);
            return null;
        }
    }

    // ======================================================
    // Common
    // ======================================================

    exists(key: string): boolean {
        if (!this.hasWindow) return false;

        return sessionStorage.getItem(key) !== null;
    }
    clearSession(): void {
        this.clearAuthentication();
    }
    removeItem(key: string): void {
        if (!this.hasWindow) return;

        sessionStorage.removeItem(key);
    }

    clear(): void {
        if (!this.hasWindow) return;

        sessionStorage.clear();
    }

    clearAuthentication(): void {
        if (!this.hasWindow) return;

        sessionStorage.clear();
        // پاک‌سازی Token نسخه قدیمی که در localStorage نگهداری می‌شد.
        localStorage.removeItem(ACCESS_TOKEN_NAME);
    }

    set accessToken(value: string) {
        this.setString(ACCESS_TOKEN_NAME, value);
    }

    get accessToken(): string {
        return this.getString(ACCESS_TOKEN_NAME);
    }

    set refreshToken(value: string) {
        this.setString('kowsar.refresh_token', value);
    }

    get refreshToken(): string {
        return this.getString('kowsar.refresh_token');
    }

    set authSubject(value: string) {
        this.setString('kowsar.auth_subject', value);
    }

    get authSubject(): string {
        return this.getString('kowsar.auth_subject');
    }

    set authSessionId(value: string) {
        this.setString('kowsar.auth_session_id', value);
    }

    get authSessionId(): string {
        return this.getString('kowsar.auth_session_id');
    }

    set authTokenVersion(value: number) {
        this.setString('kowsar.auth_token_version', String(value));
    }

    get authTokenVersion(): number {
        const value = Number(this.getString('kowsar.auth_token_version'));
        return Number.isFinite(value) && value > 0 ? value : 1;
    }

    get loginRoute(): string {
        if (!this.hasWindow) return '/auth/login-person';

        return localStorage.getItem('UserTypeLogin') === 'KOWSAR'
            ? '/auth/login-kowsar'
            : '/auth/login-person';
    }

    // ======================================================
    // User Session Helpers
    // ======================================================

    get centralRef(): string {
        return this.getString('CentralRef');
    }

    get personInfoRef(): string {
        return this.getString('PersonInfoRef');
    }

    get sessionId(): string {
        return this.getString('SessionId');
    }


    get userId(): string {
        return this.getString('UserId');
    }

    get manager(): string {
        return this.getString('Manager');
    }

    get delegacy(): string {
        return this.getString('Delegacy');
    }


    get oldUserId(): string {
        return this.getString('OldUserId');
    }

    get loginType(): string {
        return this.getString('LoginType');
    }
    get CustomerCode(): string {
        return this.getString('CustomerCode');
    }
    get CustName_Small(): string {
        return this.getString('CustName_Small');
    }


    get userName(): string {
        return this.getString('UserName');
    }

    get displayName(): string {
        return this.getString('DisplayName');
    }

    get departmentCode(): string {
        return this.getString('DepartmentCode');
    }

    get departmentName(): string {
        return this.getString('DepartmentName');
    }

    get brokerCode(): string {
        return this.getString('BrokerCode');
    }

    get brokerName(): string {
        return this.getString('BrokerName');
    }



    get phFullName(): string {
        if (this.loginType == 'KOWSAR') {
            return this.getString('CentralName');

        } else {
            return this.getString('PhFullName');

        }
    }

    get activeDate(): string {
        return this.getString('ActiveDate');
    }
    get IsAdminUser(): string {
        return this.getString('IsAdminUser');
    }

    get currentUser(): Partial<NormalizedAuthUser> | null {
        return this.getItem<Partial<NormalizedAuthUser>>('CurrentUser');
    }

    get permissions(): string[] {
        return this.getItem<string[]>('PermissionKeys') || [];
    }

    get roles(): string[] {
        return this.getItem<string[]>('RoleNames') || [];
    }
}
