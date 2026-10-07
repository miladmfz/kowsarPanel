import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { gregorianDateToJalaliText, jalaliTextToGregorianDate } from '../../shared/utils/santral-date.util';


import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { SantralOperatorRankingGroup, SantralOperatorRankingItem, SantralOperatorRankingsResponse, SantralWebApiService } from '../../services/santralapi.service';

import { OperatorRankingHeaderComponent } from './partials/operator-ranking-header.component';
import { OperatorRankingFilterComponent } from './partials/operator-ranking-filter.component';
import { OperatorRankingGroupInfoComponent } from './partials/operator-ranking-group-info.component';
import { OperatorRankingStatsComponent } from './partials/operator-ranking-stats.component';
import { OperatorRankingTableComponent } from './partials/operator-ranking-table.component';

@Component({
  selector: 'app-santral-operator-ranking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    OperatorRankingHeaderComponent,
    OperatorRankingFilterComponent,
    OperatorRankingGroupInfoComponent,
    OperatorRankingStatsComponent,
    OperatorRankingTableComponent
  ],
  templateUrl: './santral-operator-ranking.component.html',
  styleUrl: './santral-operator-ranking.component.css',
  encapsulation: ViewEncapsulation.None
})
export class SantralOperatorRankingComponent {

  readonly vm = this;

  private readonly santralApi = inject(SantralWebApiService);
  private readonly notificationService = inject(NotificationService);

  groups = signal<SantralOperatorRankingGroup[]>([]);
  operators = signal<SantralOperatorRankingItem[]>([]);

  selectedGroup = signal<string>('');

  startdate = signal<string>(this.getDefaultStartDate());
  enddate = signal<string>(this.getToday());

  groupTitle = signal<string>('');
  groupDescription = signal<string>('');
  errDesc = signal<string>('');

  loadingGroups = signal<boolean>(false);
  loadingRanking = signal<boolean>(false);

  hasOperators = computed(() => this.operators().length > 0);

  selectedGroupInfo = computed(() => {
    const group = this.selectedGroup();

    if (!group) {
      return null;
    }

    return this.groups().find(x => String(x.grpnum) === String(group)) ?? null;
  });

  totalCalls = computed(() => {
    return this.operators().reduce((sum, item) => sum + Number(item.total_calls || 0), 0);
  });

  answeredCalls = computed(() => {
    return this.operators().reduce((sum, item) => sum + Number(item.answered_calls || 0), 0);
  });

  missedCalls = computed(() => {
    return this.operators().reduce((sum, item) => sum + Number(item.missed_calls || 0), 0);
  });

  avgAnswerRate = computed(() => {
    const total = this.totalCalls();

    if (total <= 0) {
      return 0;
    }

    return Math.round((this.answeredCalls() / total) * 10000) / 100;
  });

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loadingGroups.set(true);

    this.santralApi.GetOperatorRankingGroups(false)
      .subscribe({
        next: (res: any) => {
          this.loadingGroups.set(false);

          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت گروه‌های تماس');
            return;
          }

          const items = Array.isArray(res?.groups)
            ? res.groups
            : [];

          this.groups.set(items);

          if (items.length > 0 && !this.selectedGroup()) {
            this.selectedGroup.set(String(items[0].grpnum));
            this.loadRankings();
          }
        },
        error: () => {
          this.loadingGroups.set(false);
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }

  loadRankings(): void {
    const group = this.selectedGroup();

    if (!group) {
      this.notificationService.warning('لطفاً گروه تماس را انتخاب کنید');
      return;
    }

    const startdate = this.toGregorianDateInput(this.startdate());
    const enddate = this.toGregorianDateInput(this.enddate());

    if (!startdate || !enddate) {
      this.notificationService.warning('تاریخ را به‌صورت شمسی وارد کنید. نمونه: ۱۴۰۵/۰۴/۱۰');
      return;
    }

    if (startdate > enddate) {
      this.notificationService.warning('تاریخ شروع نباید بزرگ‌تر از تاریخ پایان باشد');
      return;
    }

    this.loadingRanking.set(true);
    this.operators.set([]);
    this.errDesc.set('');

    this.santralApi.GetOperatorRankings(group, startdate, enddate, false)
      .subscribe({
        next: (res: SantralOperatorRankingsResponse) => {
          this.loadingRanking.set(false);

          if (Number(res?.ErrCode) !== 0) {
            this.errDesc.set(res?.ErrDesc || 'خطا در دریافت رتبه‌بندی اپراتورها');
            this.notificationService.error(this.errDesc());
            return;
          }

          this.groupTitle.set(res?.group?.grpnum || group);
          this.groupDescription.set(res?.group?.description || '');

          const items = Array.isArray(res?.operators)
            ? res.operators
            : [];

          this.operators.set(items);

          if (items.length === 0) {
            this.notificationService.warning('برای این گروه اطلاعاتی یافت نشد');
            return;
          }

          this.notificationService.success('رتبه‌بندی اپراتورها دریافت شد');
        },
        error: () => {
          this.loadingRanking.set(false);
          this.errDesc.set('خطا در ارتباط با سرور');
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }

  onGroupChange(value: string): void {
    this.selectedGroup.set(value);
    this.loadRankings();
  }

  setStartDate(value: string): void {
    this.startdate.set(value);
  }

  setEndDate(value: string): void {
    this.enddate.set(value);
  }

  formatSeconds(value: number | string): string {
    const total = Number(value || 0);

    if (!Number.isFinite(total) || total <= 0) {
      return '۰ ثانیه';
    }

    const rounded = Math.round(total);
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    const seconds = rounded % 60;

    if (hours > 0) {
      return `${this.toFaNumber(hours)} ساعت و ${this.toFaNumber(minutes)} دقیقه`;
    }

    if (minutes > 0) {
      return `${this.toFaNumber(minutes)} دقیقه و ${this.toFaNumber(seconds)} ثانیه`;
    }

    return `${this.toFaNumber(seconds)} ثانیه`;
  }

  formatPercent(value: number | string): string {
    const numberValue = Number(value || 0);

    if (!Number.isFinite(numberValue)) {
      return '۰٪';
    }

    return `${this.toFaNumber(numberValue)}٪`;
  }

  formatScore(value: number | string): string {
    const numberValue = Number(value || 0);

    if (!Number.isFinite(numberValue)) {
      return '۰';
    }

    return this.toFaNumber(numberValue);
  }

  toFaNumber(value: number | string): string {
    const text = String(value);

    return text
      .replace(/0/g, '۰')
      .replace(/1/g, '۱')
      .replace(/2/g, '۲')
      .replace(/3/g, '۳')
      .replace(/4/g, '۴')
      .replace(/5/g, '۵')
      .replace(/6/g, '۶')
      .replace(/7/g, '۷')
      .replace(/8/g, '۸')
      .replace(/9/g, '۹');
  }

  getScoreClass(score: number | string): string {
    const value = Number(score || 0);

    if (value >= 70) {
      return 'kws-score-good';
    }

    if (value >= 40) {
      return 'kws-score-mid';
    }

    if (value > 0) {
      return 'kws-score-low';
    }

    return 'kws-score-zero';
  }

  getRankClass(rank: number | string): string {
    const value = Number(rank || 0);

    if (value === 1) {
      return 'kws-rank-first';
    }

    if (value === 2) {
      return 'kws-rank-second';
    }

    if (value === 3) {
      return 'kws-rank-third';
    }

    return '';
  }

  trackByExtension(index: number, item: SantralOperatorRankingItem): string {
    return item.extension || String(index);
  }

  private getToday(): string {
    const d = new Date();
    return this.toJalaliDateInput(this.toDateInputValue(d));
  }

  private getDefaultStartDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - 30);

    return this.toJalaliDateInput(this.toDateInputValue(d));
  }

  private toJalaliDateInput(gregorianDate: string): string {
    return this.toFaNumber(gregorianDateToJalaliText(gregorianDate) || gregorianDate);
  }

  private toGregorianDateInput(jalaliDate: string): string {
    return jalaliTextToGregorianDate(jalaliDate);
  }

  private toDateInputValue(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }

  getGroupFaName(group: SantralOperatorRankingGroup | null | undefined): string {
    const description = String(group?.description || '').trim();

    const map: Record<string, string> = {
      SalesETS: 'فروش ETS',
      supportETS: 'پشتیبانی ETS',
      Hardware: 'سخت‌افزار',
      SaleSBS: 'فروش SBS',
      SupportSBS: 'پشتیبانی SBS',
      Operator: 'اپراتور',
      SupportSBSFirst: 'پشتیبانی SBS مرحله اول',
      'SupportsBS-Operator': 'پشتیبانی SBS و اپراتور',
      'Sale-Pishran': 'فروش پیشران',
      'Support-Pishran': 'پشتیبانی پیشران',
      'SaleGruop-Pishran': 'گروه فروش پیشران'
    };

    return map[description] || description || 'بدون عنوان';
  }

  getGroupMembersCount(group: SantralOperatorRankingGroup | null | undefined): number {
    const grplist = String(group?.grplist || '').trim();

    if (!grplist) {
      return 0;
    }

    return grplist
      .split(/[-,\s]+/)
      .map(x => x.trim())
      .filter(x => x !== '').length;
  }

  getStrategyFa(strategy: string | null | undefined): string {
    const value = String(strategy || '').trim();

    const map: Record<string, string> = {
      ringall: 'زنگ همزمان برای همه',
      hunt: 'زنگ ترتیبی',
      memoryhunt: 'زنگ ترتیبی با حفظ قبلی‌ها',
      firstavailable: 'اولین داخلی آزاد',
      firstnotonphone: 'اولین داخلی غیرمشغول'
    };

    return map[value] || value || 'نامشخص';
  }

  getGroupOptionLabel(group: SantralOperatorRankingGroup): string {
    const code = this.toFaNumber(group.grpnum);
    const name = this.getGroupFaName(group);
    const count = this.toFaNumber(this.getGroupMembersCount(group));
    const strategy = this.getStrategyFa(group.strategy);
    const time = this.toFaNumber(group.grptime || 0);

    return `${code} - ${name} | ${count} داخلی | ${strategy} | ${time} ثانیه`;
  }
}
