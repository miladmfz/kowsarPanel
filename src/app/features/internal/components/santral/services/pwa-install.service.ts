import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PwaInstallService {

    canInstall = signal(false);
    isInstalled = signal(false);

    private deferredPrompt: any = null;

    constructor() {
        this.init();
    }

    private init(): void {
        if (typeof window === 'undefined') {
            return;
        }

        window.addEventListener('beforeinstallprompt', (event: Event) => {
            event.preventDefault();

            this.deferredPrompt = event;
            this.canInstall.set(true);
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            this.canInstall.set(false);
            this.isInstalled.set(true);
        });

        const standalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        this.isInstalled.set(standalone);
    }

    async install(): Promise<boolean> {
        if (!this.deferredPrompt) {
            return false;
        }

        this.deferredPrompt.prompt();

        const result = await this.deferredPrompt.userChoice;

        this.deferredPrompt = null;
        this.canInstall.set(false);

        return result?.outcome === 'accepted';
    }
}