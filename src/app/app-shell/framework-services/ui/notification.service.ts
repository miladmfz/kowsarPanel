import { Injectable } from '@angular/core';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor() { }

    /**
     *   نمایش Toast ساده با Bootstrap یا SweetAlert2 (درصورت وجود)
     * در این نسخه از SweetAlert2 یا Toast Bootstrap استفاده می‌کنیم.
     */
    show(message: string, title: string = '', type: ToastType = 'info', duration: number = 3000): void {
        const hasSweetAlert = (window as any).Swal;

        if (hasSweetAlert) {
            (window as any).Swal.fire({
                toast: true,
                position: 'top-end',
                icon: type,
                title: title || this.getDefaultTitle(type),
                text: message,
                showConfirmButton: false,
                timer: duration,
                timerProgressBar: true,
            });
        } else {
            this.basicToast(message, type);
        }
    }

    /**   نمایش Toast سریع بدون پلاگین خاص */
    private basicToast(message: string, type: ToastType): void {
        const toast = document.createElement('div');
        toast.className = `custom-toast toast-${type}`;
        toast.textContent = message;

        Object.assign(toast.style, {
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            padding: '10px 15px',
            color: '#fff',
            backgroundColor: this.getColor(type),
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 1055,
            opacity: '0',
            transition: 'opacity 0.3s ease',
        });

        document.body.appendChild(toast);
        requestAnimationFrame(() => (toast.style.opacity = '1'));

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    private getDefaultTitle(type: ToastType): string {
        switch (type) {
            case 'success': return 'موفقیت  ';
            case 'error': return 'خطا ❌';
            case 'warning': return 'هشدار  ';
            default: return 'اطلاع 📢';
        }
    }

    private getColor(type: ToastType): string {
        switch (type) {
            case 'success': return '#28a745';
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            default: return '#17a2b8';
        }
    }
    //   متدهای کمکی برای راحتی توسعه‌دهنده
    success(message: string, title: string = 'موفقیت') {
        this.show(message, title, 'success');
    }
    succeded(title: string = 'موفقیت') {
        this.show('عملیات با موفقیت انجام شد', title, 'success');
    }

    error(message: string, title: string = 'خطا') {
        this.show(message, title, 'error');
    }

    warning(message: string, title: string = 'هشدار') {
        this.show(message, title, 'warning');
    }

    info(message: string, title: string = 'اطلاع') {
        this.show(message, title, 'info');
    }

}
