import { Injectable } from '@angular/core';

type SwalIcon = 'info' | 'success' | 'error' | 'warning' | 'question';

@Injectable({
  providedIn: 'root'
})
export class SwalService {
  private get Swal(): any {
    return (window as any)?.Swal;
  }

  /** 🔸 پیام عمومی */
  async alert(
    title: string,
    text: string = '',
    icon: SwalIcon = 'info'
  ): Promise<void> {
    const Swal = this.Swal;
    if (Swal) {
      await Swal.fire({
        title,
        text,
        icon,
        confirmButtonText: 'باشه',
        confirmButtonColor: '#3085d6'
      });
    } else {
      window.alert(`${title}\n\n${text}`);
    }
  }

  /**   دیالوگ تأیید */
  async confirm(
    title: string,
    text: string = 'آیا مطمئن هستید؟',
    confirmText: string = 'بله',
    cancelText: string = 'خیر'
  ): Promise<boolean> {
    const Swal = this.Swal;
    if (Swal) {
      const result = await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
      });
      return result.isConfirmed;
    } else {
      return window.confirm(`${title}\n\n${text}`);
    }
  }

  /**   موفقیت */
  success(message: string, title = 'موفقیت'): Promise<void> {
    return this.alert(title, message, 'success');
  }

  /** ❌ خطا */
  error(message: string, title = 'خطا'): Promise<void> {
    return this.alert(title, message, 'error');
  }

  /**   هشدار */
  warning(message: string, title = 'هشدار'): Promise<void> {
    return this.alert(title, message, 'warning');
  }

  /** ℹ️ اطلاع */
  info(message: string, title = 'اطلاع'): Promise<void> {
    return this.alert(title, message, 'info');
  }

  /** 🔔 Toast mode (اختیاری) */
  async toast(
    message: string,
    icon: SwalIcon = 'info',
    duration = 2500,
    position: 'top-end' | 'bottom-end' | 'center' = 'top-end'
  ): Promise<void> {
    const Swal = this.Swal;
    if (Swal) {
      await Swal.fire({
        toast: true,
        position,
        icon,
        title: message,
        showConfirmButton: false,
        timer: duration,
        timerProgressBar: true
      });
    } else {
      console.log(`[${icon}] ${message}`);
    }
  }
}
