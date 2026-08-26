export interface WebPhoneIncomingNotificationPayload {
  number: string;
  name?: string;
  customerName?: string;
  explain?: string;
  lineIndex?: number;
  silent?: boolean;
}

export interface WebPhoneConnectedNotificationPayload extends WebPhoneIncomingNotificationPayload {
  centralRef?: number;
  customerCode?: number;
  customerType?: string;
  manager?: string;
}

export class WebPhoneNotificationManager {
  private incomingNotifications = new Map<string, Notification>();
  private connectedNotifications = new Map<string, Notification>();
  private connectedCloseTimers = new Map<string, ReturnType<typeof setTimeout>>();
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
    if (!this.canShow()) {
      return;
    }

    const key = this.lineKey(payload.lineIndex);
    this.closeIncomingCall(payload.lineIndex);
    this.closeConnectedCall(payload.lineIndex);

    const number = String(payload.number ?? '').trim();
    const name = String(payload.name ?? '').trim();
    const customerName = String(payload.customerName ?? '').trim();
    const explain = String(payload.explain ?? '').trim();
    const lines: string[] = [];

    if (name && name !== number) {
      lines.push(name);
    }
    if (customerName && customerName !== name && customerName !== number) {
      lines.push(`مشتری: ${customerName}`);
    }
    if (number) {
      lines.push(number);
    }
    lines.push(`توضیحات: ${explain || '-----'}`);

    const notification = new Notification('تماس ورودی', {
      body: lines.join('\n') || 'شماره ناشناس',
      tag: `santral-incoming-call-${key}`,
      renotify: payload.silent !== true,
      requireInteraction: true,
      silent: payload.silent === true,
      dir: 'rtl'
    } as NotificationOptions & { renotify?: boolean; requireInteraction?: boolean });

    notification.onclick = () => {
      this.focusWindow();
      this.closeIncomingCall(payload.lineIndex);
    };

    notification.onclose = () => {
      this.incomingNotifications.delete(key);
    };

    this.incomingNotifications.set(key, notification);
  }

  showConnectedCall(payload: WebPhoneConnectedNotificationPayload, autoCloseMs = 8000): void {
    if (!this.canShow()) {
      return;
    }

    const key = this.lineKey(payload.lineIndex);
    this.closeIncomingCall(payload.lineIndex);
    this.closeConnectedCall(payload.lineIndex);

    const number = String(payload.number ?? '').trim();
    const name = String(payload.name ?? '').trim();
    const customerName = String(payload.customerName ?? '').trim();
    const explain = String(payload.explain ?? '').trim();
    const lines: string[] = [];

    if (name && name !== number) {
      lines.push(name);
    }
    if (customerName && customerName !== name && customerName !== number) {
      lines.push(`مشتری: ${customerName}`);
    }
    if (number) {
      lines.push(number);
    }
    lines.push(`توضیحات: ${explain || '-----'}`);
    if (payload.centralRef) {
      lines.push(`CentralRef: ${payload.centralRef}`);
    }
    if (payload.customerCode) {
      lines.push(`CustomerCode: ${payload.customerCode}`);
    }
    if (payload.customerType) {
      lines.push(payload.customerType);
    }

    const notification = new Notification('تماس برقرار شد', {
      body: lines.join(' | ') || 'تماس برقرار شد',
      tag: `santral-connected-call-${key}`,
      renotify: false,
      requireInteraction: false,
      silent: true,
      dir: 'rtl'
    } as NotificationOptions & { renotify?: boolean; requireInteraction?: boolean });

    notification.onclick = () => {
      this.focusWindow();
      this.closeConnectedCall(payload.lineIndex);
    };

    notification.onclose = () => {
      this.connectedNotifications.delete(key);
      this.clearConnectedTimer(key);
    };

    this.connectedNotifications.set(key, notification);

    if (autoCloseMs > 0) {
      const timer = setTimeout(() => {
        this.closeConnectedCall(payload.lineIndex);
      }, autoCloseMs);
      this.connectedCloseTimers.set(key, timer);
    }
  }

  closeIncomingCall(lineIndex?: number): void {
    this.closeNotificationMap(this.incomingNotifications, lineIndex);
  }

  closeConnectedCall(lineIndex?: number): void {
    if (lineIndex === undefined) {
      for (const key of Array.from(this.connectedCloseTimers.keys())) {
        this.clearConnectedTimer(key);
      }
    } else {
      this.clearConnectedTimer(this.lineKey(lineIndex));
    }

    this.closeNotificationMap(this.connectedNotifications, lineIndex);
  }

  dispose(): void {
    this.closeIncomingCall();
    this.closeConnectedCall();
  }

  private canShow(): boolean {
    if (!this.isSupported()) {
      return false;
    }

    if (Notification.permission === 'default') {
      this.requestPermissionIfNeeded();
      return false;
    }

    return Notification.permission === 'granted';
  }

  private lineKey(lineIndex?: number): string {
    return String(lineIndex ?? 'active');
  }

  private closeNotificationMap(map: Map<string, Notification>, lineIndex?: number): void {
    const keys = lineIndex === undefined
      ? Array.from(map.keys())
      : [this.lineKey(lineIndex)];

    for (const key of keys) {
      const notification = map.get(key);
      if (!notification) {
        continue;
      }

      try {
        notification.close();
      } catch { }

      map.delete(key);
    }
  }

  private clearConnectedTimer(key: string): void {
    const timer = this.connectedCloseTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.connectedCloseTimers.delete(key);
    }
  }

  private focusWindow(): void {
    try {
      window.focus();
    } catch { }
  }
}
