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

/**
 * مسیر رسیدن تماس را جدا از جهت تماس نمایش می‌دهد.
 * Dashboard فعلی از این helper استفاده نمی‌کند؛ برای Reportهای جدید/مستقل است.
 */
export function getRouteTypeTitle(value: string): string {
  switch (value) {
    case 'Direct':
      return 'مستقیم';
    case 'RingGroup':
      return 'گروه زنگ';
    case 'Forward':
      return 'فوروارد';
    case 'Transfer':
      return 'انتقال مکالمه';
    case 'IVR':
      return 'منوی صوتی';
    default:
      return value || '-';
  }
}

export function getRouteTypeIcon(value: string): string {
  switch (value) {
    case 'RingGroup':
      return 'mdi mdi-account-group-outline';
    case 'Forward':
      return 'mdi mdi-call-made';
    case 'Transfer':
      return 'mdi mdi-call-split';
    case 'IVR':
      return 'mdi mdi-menu-open';
    default:
      return 'mdi mdi-phone-outline';
  }
}

export function getRouteTypeTextClass(value: string): string {
  switch (value) {
    case 'RingGroup':
      return 'kws-text-info';
    case 'Forward':
      return 'kws-text-gold';
    case 'Transfer':
      return 'kws-text-danger';
    case 'IVR':
      return 'kws-text-purple';
    default:
      return 'kws-text-muted';
  }
}

export function getCallRouteTitle(row: {
  call_type?: string;
  call_type_fa?: string;
  route_type?: string;
  route_display?: string;
  route_from?: string;
  forwarded_from?: string;
  transferred_from?: string;
  ringgroup_number?: string;
  ringgroup_name?: string;
} | null | undefined): string {
  if (!row) {
    return '-';
  }

  const direction = (row.call_type_fa || getCallTypeTitle(row.call_type || '') || '').trim();
  const routeType = (row.route_type || 'Direct').trim();
  const explicit = (row.route_display || '').trim();

  if (explicit) {
    if (routeType === 'Direct' && explicit.includes(direction)) {
      return explicit;
    }

    return direction ? `${direction} - ${explicit}` : explicit;
  }

  if (routeType === 'Forward') {
    const from = (row.forwarded_from || row.route_from || '').trim();
    return direction ? `${direction} - فوروارد${from ? ` از ${from}` : ''}` : `فوروارد${from ? ` از ${from}` : ''}`;
  }

  if (routeType === 'Transfer') {
    const from = (row.transferred_from || row.route_from || '').trim();
    return direction ? `${direction} - انتقال مکالمه${from ? ` از ${from}` : ''}` : `انتقال مکالمه${from ? ` از ${from}` : ''}`;
  }

  if (routeType === 'RingGroup') {
    const group = (row.ringgroup_number || '').trim();
    const name = (row.ringgroup_name || '').trim();
    const suffix = [group, name && name !== group ? name : ''].filter(Boolean).join(' - ');
    return direction ? `${direction} - گروه زنگ${suffix ? ` ${suffix}` : ''}` : `گروه زنگ${suffix ? ` ${suffix}` : ''}`;
  }

  if (routeType === 'IVR') {
    return direction ? `${direction} - منوی صوتی` : 'منوی صوتی';
  }

  return direction ? `${direction} مستقیم` : 'مستقیم';
}
