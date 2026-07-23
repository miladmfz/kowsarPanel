export function cleanSantralText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .trim()
    .replace(/\s+/g, ' ');
}

export function toSantralNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export function toFaNumber(value: unknown): string {
  const fa = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(value ?? '').replace(/\d/g, digit => fa[Number(digit)]);
}

export function normalizeFaNumber(value: unknown): string {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  return String(value ?? '')
    .replace(/[۰-۹]/g, char => String(persian.indexOf(char)))
    .replace(/[٠-٩]/g, char => String(arabic.indexOf(char)));
}

export function secondsToFaText(value: unknown): string {
  const total = Math.max(0, Math.round(toSantralNumber(value)));

  if (total <= 0) {
    return '۰ ثانیه';
  }

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${toFaNumber(hours)} ساعت`);
  }

  if (minutes > 0) {
    parts.push(`${toFaNumber(minutes)} دقیقه`);
  }

  if (seconds > 0 && hours === 0) {
    parts.push(`${toFaNumber(seconds)} ثانیه`);
  }

  return parts.join(' و ');
}

export function secondsToClock(value: unknown): string {
  const total = Math.max(0, Math.round(toSantralNumber(value)));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatGregorianDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToGregorianDate(date: Date, days: number): string {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return formatGregorianDateInput(newDate);
}
