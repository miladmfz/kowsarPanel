export interface WebPhoneIncomingNotificationPayload {
  number: string;
  name?: string;
  lineIndex?: number;
}

export class WebPhoneNotificationManager {
  private incomingNotification: Notification | null = null;
  private permissionRequested = false;

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  requestPermissionIfNeeded(): void {
    if (!this.isSupported()) {
      return;
    }

    if (Notification.permission !== 'default' || this.permissionRequested) {
      return;
    }

    this.permissionRequested = true;

    Notification.requestPermission().catch(() => { });
  }

  showIncomingCall(payload: WebPhoneIncomingNotificationPayload): void {
    if (!this.isSupported()) {
      return;
    }

    if (Notification.permission === 'default') {
      this.requestPermissionIfNeeded();
      return;
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    this.closeIncomingCall();

    const number = String(payload.number ?? '').trim();
    const name = String(payload.name ?? '').trim();

    const title = 'تماس ورودی';
    const body = name && name !== number
      ? `${name} - ${number}`
      : number || 'شماره ناشناس';

    type BrowserNotificationOptions = NotificationOptions & {
      renotify?: boolean;
      requireInteraction?: boolean;
    };

    const options: BrowserNotificationOptions = {
      body,
      tag: `santral-incoming-call-${payload.lineIndex ?? 'active'}`,
      renotify: true,
      requireInteraction: false,
      silent: false,
      dir: 'rtl'
    };

    this.incomingNotification = new Notification(title, options);

    this.incomingNotification.onclick = () => {
      try {
        window.focus();
      } catch { }
      this.closeIncomingCall();
    };
  }

  closeIncomingCall(): void {
    if (!this.incomingNotification) {
      return;
    }

    try {
      this.incomingNotification.close();
    } catch { }

    this.incomingNotification = null;
  }

  dispose(): void {
    this.closeIncomingCall();
  }
}
