import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {

    // Global Loading Signal
    private _loading = signal(false);

    // برای استفاده در قالب
    loading = this._loading.asReadonly();

    show(): void {
        this._loading.set(true);
    }

    hide(): void {
        this._loading.set(false);
    }

    isVisible(): boolean {
        return this._loading();
    }
}
