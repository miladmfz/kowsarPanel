import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {

    private activeRequests = 0;
    private _loading = signal(false);

    // برای استفاده در قالب
    loading = this._loading.asReadonly();

    show(): void {
        this.activeRequests++;

        if (this.activeRequests === 1) {
            this._loading.set(true);
        }
    }

    hide(): void {
        this.activeRequests = Math.max(0, this.activeRequests - 1);

        if (this.activeRequests === 0) {
            this._loading.set(false);
        }
    }

    isVisible(): boolean {
        return this._loading();
    }
}
