import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as jalaali from 'jalaali-js';

interface DayEventItem {
  description: string;
  additional_description: string;
  is_holiday: boolean;
  is_religious: boolean;
}

interface DayEventsInfo {
  is_holiday: boolean;
  events: DayEventItem[];
}

type DaysEventsJson = Record<string, Record<string, DayEventsInfo>>;

interface CalendarDay {
  jYear: number;
  jMonth: number;
  jDay: number;

  gYear: number;
  gMonth: number;
  gDay: number;

  gDate: Date;

  isCurrentMonth: boolean;
  isToday: boolean;
  isFriday: boolean;

  // از JSON
  isHoliday: boolean;
  eventsCount: number;
}

@Component({
  selector: 'app-kowsar-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kowsar-calendar.component.html',
})
export class KowsarCalendarComponent implements OnInit {
  weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  currentJYear!: number;
  currentJMonth!: number;

  headerJalali = signal('')
  headerGregorian = signal('')

  days: CalendarDay[] = [];

  private readonly today = new Date();

  private readonly jalaliMonthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
  ];

  private readonly gregMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // ✅ دیتای همه روزها + رویدادها
  private dayEventsByYear: DaysEventsJson = {};

  // ✅ Tooltip state
  tooltipOpen = false;
  tooltipPinned = false; // وقتی click کنیم pin می‌شود
  tooltipX = 0;
  tooltipY = 0;
  tooltipDateKey = signal('')
  tooltipIsHoliday = false;
  tooltipEvents: DayEventItem[] = [];
  private readonly http = inject(HttpClient);
  constructor() { }

  ngOnInit(): void {
    const jToday = jalaali.toJalaali(this.today);
    this.currentJYear = jToday.jy;
    this.currentJMonth = jToday.jm;

    this.loadDaysEvents(() => {
      this.buildCalendar();
    });

    // کلیک بیرون = بستن (برای حالت pin)
    document.addEventListener('click', (e) => {
      if (!this.tooltipPinned) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('.kcal-tooltip') || target.closest('.kcal-day')) return;
      this.closeTooltip();
    });
  }

  // ===============================================================
  // Load days-events.json
  // ===============================================================
  private loadDaysEvents(done?: () => void): void {
    this.http.get<DaysEventsJson>('./assets/days-events.json').subscribe({
      next: (res) => {
        this.dayEventsByYear = res || {};
        done?.();
      },
      error: () => {
        this.dayEventsByYear = {};
        done?.();
      },
    });
  }

  // ===============================================================
  // Helpers
  // ===============================================================
  private pad2(n: number): string {
    return String(n).padStart(2, '0');
  }

  private makeJalaliKey(y: number, m: number, d: number): string {
    return `${y}/${this.pad2(m)}/${this.pad2(d)}`;
  }

  private getDayInfo(key: string, year: number): DayEventsInfo | null {
    return this.dayEventsByYear?.[String(year)]?.[key] ?? null;
  }

  // ===============================================================
  // Calendar Grid (42 cells)
  // ===============================================================
  private buildCalendar(): void {
    this.days = [];

    const gFirst = jalaali.toGregorian(this.currentJYear, this.currentJMonth, 1);
    const firstDate = new Date(gFirst.gy, gFirst.gm - 1, gFirst.gd);

    const startIndex = this.toSaturdayBasedIndex(firstDate.getDay());
    const daysInMonth = jalaali.jalaaliMonthLength(this.currentJYear, this.currentJMonth);

    const prevJMonth = this.currentJMonth === 1 ? 12 : this.currentJMonth - 1;
    const prevJYear = this.currentJMonth === 1 ? this.currentJYear - 1 : this.currentJYear;
    const prevDays = jalaali.jalaaliMonthLength(prevJYear, prevJMonth);

    for (let i = startIndex - 1; i >= 0; i--) {
      const jd = prevDays - i;
      this.days.push(this.createDay(prevJYear, prevJMonth, jd, false));
    }

    for (let jd = 1; jd <= daysInMonth; jd++) {
      this.days.push(this.createDay(this.currentJYear, this.currentJMonth, jd, true));
    }

    while (this.days.length < 42) {
      const last = this.days[this.days.length - 1];
      const nextG = new Date(last.gDate);
      nextG.setDate(nextG.getDate() + 1);
      const nextJ = jalaali.toJalaali(nextG);
      this.days.push(this.createDay(nextJ.jy, nextJ.jm, nextJ.jd, false));
    }

    this.buildHeaders();
  }

  private createDay(jy: number, jm: number, jd: number, isCurrentMonth: boolean): CalendarDay {
    const g = jalaali.toGregorian(jy, jm, jd);
    const gDate = new Date(g.gy, g.gm - 1, g.gd);

    const isToday = gDate.toDateString() === this.today.toDateString();
    const isFriday = this.toSaturdayBasedIndex(gDate.getDay()) === 6;

    const key = this.makeJalaliKey(jy, jm, jd);
    const info = this.getDayInfo(key, jy);

    const isHoliday = !!info?.is_holiday;
    const eventsCount = info?.events?.length ?? 0;

    return {
      jYear: jy,
      jMonth: jm,
      jDay: jd,
      gYear: g.gy,
      gMonth: g.gm,
      gDay: g.gd,
      gDate,
      isCurrentMonth,
      isToday,
      isFriday,
      isHoliday,
      eventsCount,
    };
  }

  private buildHeaders(): void {
    this.headerJalali.set(`${this.jalaliMonthNames[this.currentJMonth - 1]} ${this.currentJYear}`)

    const gStart = jalaali.toGregorian(this.currentJYear, this.currentJMonth, 1);
    const lastJDay = jalaali.jalaaliMonthLength(this.currentJYear, this.currentJMonth);
    const gEnd = jalaali.toGregorian(this.currentJYear, this.currentJMonth, lastJDay);

    const startName = this.gregMonthNames[gStart.gm - 1];
    const endName = this.gregMonthNames[gEnd.gm - 1];

    this.headerGregorian.set(startName === endName ? `${startName} ${gStart.gy}` : `${startName} - ${endName} ${gEnd.gy}`)
  }

  prevMonth(): void {
    if (this.currentJMonth === 1) {
      this.currentJMonth = 12;
      this.currentJYear--;
    } else {
      this.currentJMonth--;
    }
    this.closeTooltip();
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.currentJMonth === 12) {
      this.currentJMonth = 1;
      this.currentJYear++;
    } else {
      this.currentJMonth++;
    }
    this.closeTooltip();
    this.buildCalendar();
  }

  goToToday(): void {
    const jToday = jalaali.toJalaali(this.today);
    this.currentJYear = jToday.jy;
    this.currentJMonth = jToday.jm;
    this.closeTooltip();
    this.buildCalendar();
  }

  private toSaturdayBasedIndex(jsDay: number): number {
    return (jsDay + 1) % 7;
  }

  // ===============================================================
  // Tooltip logic (hover + click)
  // ===============================================================
  onDayHover(ev: MouseEvent, d: CalendarDay): void {
    if (this.tooltipPinned) return; // وقتی pin شده، hover تغییر نده
    this.openTooltip(ev, d, false);
  }

  onDayLeave(): void {
    if (this.tooltipPinned) return;
    this.closeTooltip();
  }

  onDayClick(ev: MouseEvent, d: CalendarDay): void {
    ev.stopPropagation();
    // اگر روی همون روز دوباره کلیک شد، toggle
    const key = this.makeJalaliKey(d.jYear, d.jMonth, d.jDay);
    if (this.tooltipPinned && this.tooltipDateKey() === key) {
      this.closeTooltip();
      return;
    }
    this.openTooltip(ev, d, true);
  }

  private openTooltip(ev: MouseEvent, d: CalendarDay, pin: boolean): void {
    const k = this.makeJalaliKey(d.jYear, d.jMonth, d.jDay);
    const info = this.getDayInfo(k, d.jYear);

    this.tooltipDateKey.set(k)
    this.tooltipIsHoliday = !!info?.is_holiday;
    this.tooltipEvents = info?.events ?? []

    // موقعیت نزدیک نشانگر (با کمی آفست)
    this.tooltipX = ev.clientX + 12;
    this.tooltipY = ev.clientY + 12;

    this.tooltipPinned = pin;
    this.tooltipOpen = true;
  }

  closeTooltip(): void {
    this.tooltipOpen = false;
    this.tooltipPinned = false;
    this.tooltipDateKey.set("")
    this.tooltipIsHoliday = false;
    this.tooltipEvents = [];
  }
}
