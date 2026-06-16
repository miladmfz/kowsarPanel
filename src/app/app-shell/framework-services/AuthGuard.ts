import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SessionStorageService } from './storage/session.storage.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    protected readonly session = inject(SessionStorageService);
    protected readonly router = inject(Router);

    canActivate(): boolean | UrlTree {

        const sessionId = this.session.getString('SessionId');
        const savedHostName = this.session.getString('HostName');

        const currentHostName = window.location.hostname.toLowerCase();

        if (!sessionId) {
            return this.logoutAndRedirect();
        }

        if (!savedHostName) {
            return this.logoutAndRedirect();
        }

        if (savedHostName.toLowerCase() !== currentHostName) {
            return this.logoutAndRedirect();
        }

        const needChangePassword =
            this.session.getString('NeedChangePassword')
                ?.toLowerCase() || '0';

        if (
            needChangePassword === '1' ||
            needChangePassword === 'true'
        ) {
            return this.router.createUrlTree(['/auth/change-password']);
        }

        return true;
    }

    private logoutAndRedirect(): UrlTree {
        this.session.clear();
        return this.router.createUrlTree(['/auth/login']);
    }
}