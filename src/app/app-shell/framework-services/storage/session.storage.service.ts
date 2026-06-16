import { Injectable } from '@angular/core';

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
        sessionStorage.clear();
    }
    removeItem(key: string): void {
        if (!this.hasWindow) return;

        sessionStorage.removeItem(key);
    }

    clear(): void {
        if (!this.hasWindow) return;

        sessionStorage.clear();
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

    get oldUserId(): string {
        return this.getString('OldUserId');
    }

    get loginType(): string {
        return this.getString('LoginType');
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

    get currentUser(): any {
        return this.getItem<any>('CurrentUser');
    }

    get permissions(): string[] {
        return this.getItem<string[]>('PermissionKeys') || [];
    }

    get roles(): string[] {
        return this.getItem<string[]>('RoleNames') || [];
    }
}