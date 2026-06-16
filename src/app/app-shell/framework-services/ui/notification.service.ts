import { Injectable } from '@angular/core';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private readonly defaultDuration = 3000;

    show(
        message: string,
        title: string = '',
        type: ToastType = 'info',
        duration: number = this.defaultDuration
    ): void {

        const swal = (window as any).Swal;

        if (swal) {
            swal.fire({
                toast: true,
                position: 'top-end',
                icon: type,
                // title: title || this.getDefaultTitle(type),
                title: '',
                text: message,
                showConfirmButton: false,
                timer: duration,
                timerProgressBar: true,
                customClass: {
                    popup: 'kowsar-toast-popup',
                    title: 'kowsar-toast-title',
                    htmlContainer: 'kowsar-toast-text'
                }
            });

            return;
        }

        this.basicToast(message, title || this.getDefaultTitle(type), type, duration);
    }

    private basicToast(
        message: string,
        title: string,
        type: ToastType,
        duration: number
    ): void {

        const toast = document.createElement('div');

        toast.className = `kowsar-basic-toast toast-${type}`;

        toast.innerHTML = `
            <div class="kowsar-basic-toast-title">
                ${title}
            </div>
            <div class="kowsar-basic-toast-message">
                ${message}
            </div>
        `;

        Object.assign(toast.style, {
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            minWidth: '260px',
            maxWidth: '360px',
            padding: '14px 16px',
            color: this.getTextColor(type),
            background: this.getBackground(type),
            borderRadius: '18px',
            border: this.getBorder(type),
            boxShadow: '0 18px 45px rgba(15, 23, 42, .18)',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateY(-8px)',
            transition: 'opacity .25s ease, transform .25s ease',
            direction: 'rtl',
            fontFamily: 'inherit'
        });

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-8px)';

            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }

    private getDefaultTitle(type: ToastType): string {
        switch (type) {
            case 'success':
                return 'موفقیت';
            case 'error':
                return 'خطا';
            case 'warning':
                return 'هشدار';
            default:
                return 'اطلاع';
        }
    }

    private getBackground(type: ToastType): string {
        switch (type) {
            case 'success':
                return 'linear-gradient(135deg, #198754, #20c997)';
            case 'error':
                return 'linear-gradient(135deg, #dc3545, #ef4444)';
            case 'warning':
                return 'linear-gradient(135deg, #ffcc33, #d4a800)';
            default:
                return 'linear-gradient(135deg, #0d47a1, #1976d2)';
        }
    }

    private getTextColor(type: ToastType): string {
        return type === 'warning' ? '#10203a' : '#ffffff';
    }

    private getBorder(type: ToastType): string {
        switch (type) {
            case 'warning':
                return '1px solid rgba(255, 204, 51, .35)';
            default:
                return '1px solid rgba(255, 255, 255, .12)';
        }
    }

    success(message: string, title: string = 'موفقیت'): void {
        this.show(message, title, 'success');
    }

    succeeded(title: string = 'موفقیت'): void {
        this.show('عملیات با موفقیت انجام شد', title, 'success');
    }

    succeded(title: string = 'موفقیت'): void {
        this.succeeded(title);
    }

    error(message: string, title: string = 'خطا'): void {
        this.show(message, title, 'error');
    }

    warning(message: string, title: string = 'هشدار'): void {
        this.show(message, title, 'warning');
    }

    info(message: string, title: string = 'اطلاع'): void {
        this.show(message, title, 'info');
    }

    develop(): void {
        this.info('این بخش هنوز کامل نشده است');
    }
}