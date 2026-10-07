import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { BiWebApiService } from '../../../services/BiWebApi/BiWebApi.service';
import {
  BiAnalyticsResponse, BiCatalog, BiDataset, BiForecastPoint, BiGrain, BiNaturalLanguageResponse, BiObservation,
} from '../../../services/BiWebApi/bi.models';

interface ChartPoint { period: string; value: number; x: number; y: number; forecast: boolean; anomaly: boolean; }

@Component({
  selector: 'app-bi-analytics', standalone: true, imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bi-analytics.component.html', styleUrl: './bi-analytics.component.scss',
})
export class BiAnalyticsComponent {
  private readonly api = inject(BiWebApiService);
  private readonly session = inject(SessionStorageService);
  protected readonly catalog = signal<BiCatalog | null>(null);
  protected readonly result = signal<BiAnalyticsResponse | null>(null);
  protected readonly interpretation = signal<BiNaturalLanguageResponse | null>(null);
  protected readonly activePeriod = signal('');
  protected readonly loading = signal(true);
  protected readonly analyzing = signal(false);
  protected readonly interpreting = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');

  protected datasetKey = 'sales.summary';
  protected metricKey = 'sales.net';
  protected fromDate = '';
  protected toDate = '';
  protected grain: BiGrain = 'month';
  protected departmentRef = 0;
  protected horizon = 3;
  protected sensitivity = 3;
  protected naturalLanguage = 'روند ماهانه فروش خالص را با ناهنجاری‌ها و پیش‌بینی نشان بده';

  protected readonly dataset = computed<BiDataset | undefined>(() => this.catalog()?.datasets.find(item => item.datasetKey === this.datasetKey));
  protected readonly metric = computed(() => this.dataset()?.metrics.find(item => item.metricKey === this.metricKey));
  protected readonly metricOptions = computed(() => this.dataset()?.metrics.filter(item => item.metricKey !== 'data.freshness') ?? []);
  protected readonly focusedObservation = computed(() => {
    const response = this.result();
    if (!response?.observations.length) return null;
    return response.observations.find(item => item.period === this.activePeriod()) ?? response.observations.at(-1) ?? null;
  });
  protected readonly focusedAnomalies = computed(() => {
    const period = this.activePeriod();
    return period ? this.result()?.anomalies.filter(item => item.period === period) ?? [] : this.result()?.anomalies ?? [];
  });
  protected readonly focusedInsights = computed(() => {
    const period = this.activePeriod();
    return this.result()?.insights.filter(item => !period || !item.period || item.period === period) ?? [];
  });
  protected readonly chartPoints = computed<ChartPoint[]>(() => {
    const response = this.result();
    if (!response) return [];
    const observed = response.observations.map(item => ({ ...item, forecast: false }));
    const forecast = response.forecast.points.map(item => ({ period: item.period, value: item.value, forecast: true }));
    const all = [...observed, ...forecast];
    if (!all.length) return [];
    const values = [
      ...all.map(item => item.value),
      ...response.forecast.points.flatMap(item => [item.lowerBound, item.upperBound]),
    ];
    const min = Math.min(...values); const max = Math.max(...values); const span = max - min || 1;
    const anomalyPeriods = new Set(response.anomalies.map(item => item.period));
    return all.map((item, index) => ({ ...item,
      x: all.length === 1 ? 50 : index * 100 / (all.length - 1), y: 88 - (item.value - min) * 72 / span,
      anomaly: anomalyPeriods.has(item.period),
    }));
  });
  protected readonly observedPolyline = computed(() => this.chartPoints().filter(item => !item.forecast).map(item => `${item.x},${item.y}`).join(' '));
  protected readonly forecastPolyline = computed(() => {
    const points = this.chartPoints(); const firstForecast = points.findIndex(item => item.forecast);
    return firstForecast < 0 ? '' : points.slice(Math.max(0, firstForecast - 1)).map(item => `${item.x},${item.y}`).join(' ');
  });

  constructor() {
    const current = /^\d{4}\/\d{2}\/\d{2}$/.test(this.session.activeDate) ? this.session.activeDate : this.currentPersianDate();
    this.toDate = current;
    this.fromDate = `${Math.max(1, Number(current.slice(0, 4)) - 2)}/01/01`;
    this.api.getCatalog().subscribe({
      next: catalog => {
        this.catalog.set(catalog);
        const preferred = catalog.datasets.find(item => item.datasetKey === this.datasetKey) ?? catalog.datasets[0];
        if (preferred) { this.datasetKey = preferred.datasetKey; this.metricKey = preferred.metrics.find(item => item.metricKey !== 'data.freshness')?.metricKey ?? ''; }
        this.loading.set(false);
      },
      error: error => this.fail(error, 'کاتالوگ تحلیلی بارگذاری نشد.'),
    });
  }

  protected datasetChanged(): void {
    this.metricKey = this.metricOptions()[0]?.metricKey ?? '';
    this.result.set(null); this.interpretation.set(null); this.activePeriod.set('');
  }

  protected analyze(): void {
    if (!this.validRange() || !this.metricKey) { this.error.set('Metric و بازه تاریخی معتبر الزامی است.'); return; }
    this.analyzing.set(true); this.error.set(''); this.notice.set(''); this.activePeriod.set('');
    this.api.analyze({
      metricKey: this.metricKey, horizon: Number(this.horizon), sensitivity: Number(this.sensitivity),
      query: { datasetKey: this.datasetKey, fromDate: this.fromDate, toDate: this.toDate, grain: this.grain,
        departmentRefs: this.departmentRef > 0 ? [this.departmentRef] : [] },
    }).subscribe({
      next: result => { this.result.set(result); this.analyzing.set(false); this.notice.set('تحلیل با داده و Scope مجاز به‌روزرسانی شد.'); },
      error: error => this.fail(error, 'اجرای تحلیل پیشرفته انجام نشد.'),
    });
  }

  protected interpret(): void {
    if (!this.naturalLanguage.trim() || !this.validRange()) return;
    this.interpreting.set(true); this.error.set(''); this.interpretation.set(null);
    this.api.interpret({ text: this.naturalLanguage.trim(), fromDate: this.fromDate, toDate: this.toDate, grain: this.grain,
      departmentRefs: this.departmentRef > 0 ? [this.departmentRef] : [] }).subscribe({
      next: interpretation => {
        this.interpretation.set(interpretation); this.interpreting.set(false);
        if (interpretation.status === 'ReadyForConfirmation' && interpretation.query && interpretation.metricKey) {
          this.datasetKey = interpretation.query.datasetKey; this.metricKey = interpretation.metricKey;
          this.grain = interpretation.query.grain;
        }
      },
      error: error => this.fail(error, 'تفسیر درخواست انجام نشد.'),
    });
  }

  protected confirmInterpretation(): void { if (this.interpretation()?.status === 'ReadyForConfirmation') this.analyze(); }
  protected selectPeriod(period: string): void { this.activePeriod.set(this.activePeriod() === period ? '' : period); }
  protected isAnomalyPeriod(period: string): boolean { return this.result()?.anomalies.some(item => item.period === period) ?? false; }
  protected selectDepartment(code: number): void { this.departmentRef = this.departmentRef === code ? 0 : code; this.analyze(); }
  protected clearCrossFilters(): void { this.departmentRef = 0; this.activePeriod.set(''); this.analyze(); }
  protected format(value: number | null | undefined, precision = 2): string {
    return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: precision }).format(value ?? 0);
  }
  protected confidence(value: number): string { return `${this.format(value * 100, 1)}٪`; }
  protected forecastBounds(point: BiForecastPoint): string { return `${this.format(point.lowerBound)} تا ${this.format(point.upperBound)}`; }

  private validRange(): boolean { return /^\d{4}\/\d{2}\/\d{2}$/.test(this.fromDate) && /^\d{4}\/\d{2}\/\d{2}$/.test(this.toDate) && this.fromDate <= this.toDate; }
  private currentPersianDate(): string {
    const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? '';
    return `${part('year')}/${part('month')}/${part('day')}`;
  }
  private fail(error: unknown, fallback: string): void {
    const apiError = error as { error?: { error?: string; Error?: string } };
    this.error.set(apiError.error?.error ?? apiError.error?.Error ?? fallback); this.loading.set(false); this.analyzing.set(false); this.interpreting.set(false);
  }
}
