import { normalizeFaNumber, toFaNumber } from './santral-format.util';

function div(a: number, b: number): number {
  return ~~(a / b);
}

function isGregorianLeap(gy: number): boolean {
  return (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  jy += 1595;

  let days =
    -355668 +
    365 * jy +
    div(jy, 33) * 8 +
    div((jy % 33) + 3, 4) +
    jd;

  if (jm < 7) {
    days += (jm - 1) * 31;
  } else {
    days += ((jm - 7) * 30) + 186;
  }

  let gy = 400 * div(days, 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * div(--days, 36524);
    days %= 36524;

    if (days >= 365) {
      days++;
    }
  }

  gy += 4 * div(days, 1461);
  days %= 1461;

  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }

  let gd = days + 1;
  const salA = [0, 31, isGregorianLeap(gy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  let gm = 0;
  for (gm = 1; gm <= 12 && gd > salA[gm]; gm++) {
    gd -= salA[gm];
  }

  return { gy, gm, gd };
}

export function gregorianToJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const gDm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;

  const gy2 = gm > 2 ? gy + 1 : gy;

  let days =
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) -
    80 +
    gd +
    gDm[gm - 1];

  jy += 33 * div(days, 12053);
  days %= 12053;

  jy += 4 * div(days, 1461);
  days %= 1461;

  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }

  let jm: number;
  let jd: number;

  if (days < 186) {
    jm = 1 + div(days, 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + div(days - 186, 30);
    jd = 1 + ((days - 186) % 30);
  }

  return { jy, jm, jd };
}

export function gregorianDateToJalaliText(value: string): string {
  if (!value) {
    return '';
  }

  const parts = value.substring(0, 10).split('-');
  if (parts.length !== 3) {
    return '';
  }

  const gy = Number(parts[0]);
  const gm = Number(parts[1]);
  const gd = Number(parts[2]);

  if (!Number.isFinite(gy) || !Number.isFinite(gm) || !Number.isFinite(gd)) {
    return '';
  }

  const j = gregorianToJalali(gy, gm, gd);

  return [
    j.jy,
    String(j.jm).padStart(2, '0'),
    String(j.jd).padStart(2, '0')
  ].join('/');
}

export function jalaliTextToGregorianDate(value: string): string {
  const clean = normalizeFaNumber(value)
    .replace(/-/g, '/')
    .replace(/\s+/g, '')
    .trim();

  const parts = clean.split('/');
  if (parts.length !== 3) {
    return '';
  }

  const jy = Number(parts[0]);
  const jm = Number(parts[1]);
  const jd = Number(parts[2]);

  if (
    !Number.isFinite(jy) ||
    !Number.isFinite(jm) ||
    !Number.isFinite(jd) ||
    jy < 1200 ||
    jy > 1600 ||
    jm < 1 ||
    jm > 12 ||
    jd < 1 ||
    jd > 31
  ) {
    return '';
  }

  const g = jalaliToGregorian(jy, jm, jd);

  return [
    g.gy,
    String(g.gm).padStart(2, '0'),
    String(g.gd).padStart(2, '0')
  ].join('-');
}

export function displayJalaliDate(value: unknown): string {
  const text = String(value ?? '').trim();
  if (!text) {
    return '-';
  }

  const datePart = text.substring(0, 10);
  return toFaNumber(gregorianDateToJalaliText(datePart) || text);
}

export function displayJalaliDateTime(value: unknown): string {
  const text = String(value ?? '').trim();
  if (!text) {
    return '-';
  }

  const datePart = text.substring(0, 10);
  const timePart = text.length >= 16 ? text.substring(11, 16) : '';
  const jalali = gregorianDateToJalaliText(datePart);

  if (!jalali) {
    return toFaNumber(text);
  }

  if (!timePart) {
    return toFaNumber(jalali);
  }

  return `${toFaNumber(jalali)} - ${toFaNumber(timePart)}`;
}
