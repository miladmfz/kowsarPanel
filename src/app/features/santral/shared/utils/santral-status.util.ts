export function getDispositionTitle(value: string): string {
  switch (value) {
    case 'ANSWERED':
      return 'پاسخ داده شده';
    case 'NO ANSWER':
      return 'بی‌پاسخ';
    case 'BUSY':
      return 'اشغال';
    case 'FAILED':
      return 'ناموفق';
    case 'CONGESTION':
      return 'اختلال';
    default:
      return value || '-';
  }
}

export function getCallTypeTitle(value: string): string {
  switch (value) {
    case 'Incoming':
      return 'ورودی';
    case 'Outgoing':
      return 'خروجی';
    case 'Internal':
      return 'داخلی';
    case 'IVR':
      return 'منوی صوتی';
    case 'RingGroup':
      return 'گروه زنگ';
    case 'Transfer':
      return 'انتقالی';
    default:
      return 'سایر';
  }
}

export function getDispositionTextClass(value: string): string {
  switch (value) {
    case 'ANSWERED':
      return 'kws-text-success';
    case 'NO ANSWER':
      return 'kws-text-warning';
    case 'BUSY':
    case 'FAILED':
    case 'CONGESTION':
      return 'kws-text-danger';
    default:
      return 'kws-text-muted';
  }
}

export function getCallTypeTextClass(value: string): string {
  switch (value) {
    case 'Incoming':
      return 'kws-text-primary';
    case 'Outgoing':
      return 'kws-text-gold';
    case 'Internal':
      return 'kws-text-success';
    case 'IVR':
      return 'kws-text-purple';
    case 'RingGroup':
      return 'kws-text-info';
    case 'Transfer':
      return 'kws-text-danger';
    default:
      return 'kws-text-muted';
  }
}

export function getDispositionIcon(value: string): string {
  switch (value) {
    case 'ANSWERED':
      return 'mdi mdi-check-circle-outline';
    case 'NO ANSWER':
      return 'mdi mdi-phone-missed-outline';
    case 'BUSY':
      return 'mdi mdi-phone-cancel-outline';
    case 'FAILED':
      return 'mdi mdi-alert-circle-outline';
    case 'CONGESTION':
      return 'mdi mdi-network-strength-off-outline';
    default:
      return 'mdi mdi-help-circle-outline';
  }
}

export function getCallTypeIcon(value: string): string {
  switch (value) {
    case 'Incoming':
      return 'mdi mdi-phone-incoming-outline';
    case 'Outgoing':
      return 'mdi mdi-phone-outgoing-outline';
    case 'Internal':
      return 'mdi mdi-office-building-outline';
    case 'IVR':
      return 'mdi mdi-menu-open';
    case 'RingGroup':
      return 'mdi mdi-account-group-outline';
    case 'Transfer':
      return 'mdi mdi-call-split';
    default:
      return 'mdi mdi-phone-outline';
  }
}

export function getDispositionBadgeClass(value: string): string {
  switch (value) {
    case 'ANSWERED':
      return 'kws-badge-success';
    case 'NO ANSWER':
      return 'kws-badge-warning';
    case 'BUSY':
      return 'kws-badge-danger';
    case 'FAILED':
    case 'CONGESTION':
      return 'kws-badge-dark';
    default:
      return 'kws-badge-muted';
  }
}

export function getCallTypeBadgeClass(value: string): string {
  switch (value) {
    case 'Incoming':
      return 'kws-type-incoming';
    case 'Outgoing':
      return 'kws-type-outgoing';
    case 'Internal':
      return 'kws-type-internal';
    case 'IVR':
      return 'kws-type-ivr';
    case 'RingGroup':
      return 'kws-type-ring';
    case 'Transfer':
      return 'kws-type-transfer';
    default:
      return 'kws-type-other';
  }
}
