import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GridStack } from 'gridstack';
import * as jalaali from 'jalaali-js';
import { forkJoin } from 'rxjs';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { BiWebApiService } from '../../../services/BiWebApi/BiWebApi.service';
import {
  BiBookmark, BiBookmarkState, BiBookmarkWidgetState, BiCatalog, BiComparisonMode, BiDashboard, BiDashboardShare,
  BiDashboardVersion, BiDashboardWidget, BiDashboardWriteRequest, BiGrain, BiShareTarget,
  BiMetricKey, BiQueryResponse, BiSalesPoint, BiSalesSegment, BiSalesSummary, BiWidgetConfig, BiWidgetType,
} from '../../../services/BiWebApi/bi.models';
import { BI_WIDGET_CONFIG_VERSION, defaultBiWidgetConfig, migrateBiWidget } from '../../../services/BiWebApi/bi-widget-config';

const SALES_DATASET = 'sales.summary';
const CHART_COLORS = ['#2563eb', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

interface DepartmentSlice { code: number; name: string; value: number; share: number; color: string; }
interface PivotRow { period: string; values: Map<number, number>; total: number; }
type BiBuilderDimension = 'summary' | 'period' | 'department' | 'periodDepartment';
type BiBuilderVisual = 'auto' | BiWidgetType;

@Component({
  selector: 'app-bi-workspace', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bi-workspace.component.html', styleUrl: './bi-workspace.component.scss',
})
export class BiWorkspaceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('grid') private gridElement?: ElementRef<HTMLElement>;

  protected readonly permissions = inject(PermissionService);
  private readonly api = inject(BiWebApiService);
  private readonly session = inject(SessionStorageService);
  private readonly route = inject(ActivatedRoute);

  protected readonly catalog = signal<BiCatalog | null>(null);
  protected readonly dashboards = signal<BiDashboard[]>([]);
  protected readonly dashboard = signal<BiDashboard>(this.newDashboard());
  protected readonly result = signal<BiQueryResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly queryLoading = signal(false);
  protected readonly saving = signal(false);
  protected readonly editing = signal(false);
  protected readonly dirty = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly paletteOpen = signal(false);
  protected readonly selectedWidgetKey = signal('');
  protected readonly compatibilityWarnings = signal<string[]>([]);
  protected readonly governanceOpen = signal(false);
  protected readonly bookmarks = signal<BiBookmark[]>([]);
  protected readonly shares = signal<BiDashboardShare[]>([]);
  protected readonly versions = signal<BiDashboardVersion[]>([]);
  protected readonly shareTargets = signal<BiShareTarget[]>([]);
  protected readonly widgetStates = signal<Record<string, BiBookmarkWidgetState>>({});
  protected readonly crossFilterPeriod = signal('');
  protected readonly builderOpen = signal(false);
  protected readonly interpreting = signal(false);
  protected readonly builderMessage = signal('');

  protected fromDate = '';
  protected toDate = '';
  protected grain: BiGrain = 'month';
  protected departmentRef = 0;
  protected comparisonMode: BiComparisonMode = 'none';
  protected comparisonFromDate = '';
  protected comparisonToDate = '';
  protected bookmarkTitle = '';
  protected publishNote = '';
  protected templateDescription = '';
  protected publishAsTemplate = false;
  protected shareTargetKey = '';
  protected shareAccess: 'View' | 'Copy' | 'Edit' = 'View';
  protected shareDefault = false;
  protected sharePriority = 0;
  protected builderDatasetKey = SALES_DATASET;
  protected builderMetricKeys: BiMetricKey[] = [];
  protected builderDimension: BiBuilderDimension = 'period';
  protected builderVisual: BiBuilderVisual = 'auto';
  protected builderReplaceLayout = true;
  protected builderQuestion = '';

  protected readonly canEdit = computed(() => this.permissions.canEditOwnBiDashboard &&
    (this.dashboard().dashboardCode === 0 || (this.dashboard().accessLevel ?? 'Owner') === 'Owner' || this.dashboard().accessLevel === 'Edit'));
  protected readonly canCopy = computed(() => this.permissions.canEditOwnBiDashboard &&
    ['Owner', 'Edit', 'Copy'].includes(this.dashboard().accessLevel ?? 'Owner'));
  protected readonly canGovern = computed(() => (this.dashboard().isOwner ?? true) &&
    (this.permissions.canPublishBiDashboard || this.permissions.canShareBiDashboard));
  protected readonly canManageCatalog = computed(() => this.permissions.canManageBiCatalog);
  protected readonly widgets = computed(() => this.dashboard().widgets);
  protected readonly activeDatasetKey = computed(() => this.widgets()[0]?.datasetKey ?? SALES_DATASET);
  protected readonly dataset = computed(() => this.catalog()?.datasets.find(item => item.datasetKey === this.activeDatasetKey()));
  protected readonly selectedWidget = computed(() => this.widgets().find(item => item.widgetKey === this.selectedWidgetKey()));
  protected readonly appliedScope = computed(() => (this.result()?.appliedDepartmentRefs ?? []).join('، '));
  protected readonly metricOptions = computed(() => this.dataset()?.metrics.filter(item => item.metricKey !== 'data.freshness') ?? []);

  private grid?: GridStack;
  private viewReady = false;
  private rebuildTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    const activeDate = /^\d{4}\/\d{2}\/\d{2}$/.test(this.session.activeDate) ? this.session.activeDate : this.currentPersianDate();
    this.toDate = activeDate;
    this.fromDate = `${activeDate.slice(0, 4)}/01/01`;
    this.loadWorkspace();
  }

  ngAfterViewInit(): void { this.viewReady = true; this.rebuildGrid(); }
  ngOnDestroy(): void { if (this.rebuildTimer) clearTimeout(this.rebuildTimer); this.grid?.destroy(false); }

  protected selectDashboard(rawCode: string | number): void {
    const dashboardCode = Number(rawCode);
    if (!dashboardCode || dashboardCode === this.dashboard().dashboardCode) return;
    this.loading.set(true); this.error.set('');
    this.api.getDashboard(dashboardCode).subscribe({
      next: dashboard => {
        this.dashboard.set(this.normalizeDashboard(dashboard)); this.applyDashboardFilters(dashboard);
        this.dirty.set(false); this.editing.set(false); this.selectedWidgetKey.set(''); this.loading.set(false);
        this.widgetStates.set({}); this.crossFilterPeriod.set(''); this.rebuildGrid(); this.refreshData(); this.loadGovernance();
      },
      error: error => this.fail(error, 'بارگذاری داشبورد انجام نشد.'),
    });
  }

  protected newPersonalDashboard(): void {
    this.dashboard.set(this.newDashboard()); this.editing.set(true); this.dirty.set(true);
    this.notice.set('داشبورد جدید آماده است؛ عنوان و چیدمان را تنظیم و ذخیره کنید.'); this.rebuildGrid();
  }

  protected refreshData(): void {
    this.error.set(''); this.notice.set('');
    if (!this.validRange(this.fromDate, this.toDate)) {
      this.error.set('بازه اصلی باید با الگوی ۱۴۰۳/۰۱/۰۱ و به ترتیب صحیح وارد شود.'); return;
    }
    const comparison = this.resolveComparisonRange();
    if (this.comparisonMode !== 'none' && !comparison) { this.error.set('بازه مقایسه معتبر نیست.'); return; }
    this.queryLoading.set(true);
    this.api.query({
      datasetKey: this.activeDatasetKey(), fromDate: this.fromDate, toDate: this.toDate, grain: this.grain,
      departmentRefs: this.departmentRef > 0 ? [this.departmentRef] : [],
      comparisonFromDate: comparison?.fromDate ?? '', comparisonToDate: comparison?.toDate ?? '',
    }).subscribe({
      next: result => { this.result.set({ ...result, segments: result.segments ?? [] }); this.queryLoading.set(false); },
      error: error => this.fail(error, 'دریافت داده‌های داشبورد انجام نشد.', true),
    });
  }

  protected toggleEdit(): void {
    if (!this.canEdit()) return;
    this.editing.update(value => !value); this.paletteOpen.set(false);
    if (!this.editing()) this.selectedWidgetKey.set('');
    this.grid?.setStatic(!this.editing());
  }

  protected updateTitle(title: string): void { this.dashboard.update(value => ({ ...value, title })); this.dirty.set(true); }
  protected updateDefault(isDefault: boolean): void { this.dashboard.update(value => ({ ...value, isDefault })); this.dirty.set(true); }

  protected addWidget(type: BiWidgetType, metric?: BiMetricKey): void {
    const selectedMetric = metric ?? this.metricOptions()[0]?.metricKey ?? 'sales.net';
    const titles: Record<BiWidgetType, string> = {
      kpi: 'شاخص فروش', trend: 'روند فروش', table: 'جزئیات دوره‌ای فروش', stackedBar: 'مقایسه فروش و برگشت',
      donut: 'سهم واحدها از فروش', pivot: 'ماتریس فروش دوره و واحد', summaryList: 'خلاصه عملکرد واحدها',
    };
    const widgets = this.widgets();
    const widget: BiDashboardWidget = {
      widgetCode: 0, widgetKey: this.createKey(), widgetType: type, datasetKey: this.activeDatasetKey(),
      title: type === 'kpi' ? this.metricTitle(selectedMetric) : titles[type], x: 0,
      y: widgets.reduce((maximum, item) => Math.max(maximum, item.y + item.h), 0),
      w: type === 'kpi' ? 3 : type === 'donut' || type === 'summaryList' ? 4 : type === 'trend' || type === 'stackedBar' ? 8 : 12,
      h: type === 'kpi' ? 2 : 4, sortOrder: widgets.length, configVersion: BI_WIDGET_CONFIG_VERSION,
      config: defaultBiWidgetConfig(type, selectedMetric),
    };
    this.dashboard.update(value => ({ ...value, widgets: [...value.widgets, widget] }));
    this.dirty.set(true); this.paletteOpen.set(false); this.selectedWidgetKey.set(widget.widgetKey); this.rebuildGrid();
  }

  protected removeWidget(widgetKey: string): void {
    this.dashboard.update(value => ({ ...value, widgets: value.widgets.filter(widget => widget.widgetKey !== widgetKey) }));
    if (this.selectedWidgetKey() === widgetKey) this.selectedWidgetKey.set('');
    this.dirty.set(true); this.rebuildGrid();
  }

  protected openWidgetSettings(widgetKey: string): void { this.selectedWidgetKey.set(this.selectedWidgetKey() === widgetKey ? '' : widgetKey); }
  protected updateWidgetTitle(title: string): void { this.updateSelectedWidget(widget => ({ ...widget, title })); }
  protected updateWidgetConfig<K extends keyof BiWidgetConfig>(key: K, value: BiWidgetConfig[K]): void {
    this.updateSelectedWidget(widget => ({ ...widget, configVersion: BI_WIDGET_CONFIG_VERSION,
      config: { ...widget.config, schemaVersion: BI_WIDGET_CONFIG_VERSION, [key]: value } }));
  }
  protected updateWidgetDepartment(rawValue: string | number): void {
    const value = Number(rawValue); this.updateWidgetConfig('departmentRefs', value > 0 ? [value] : []);
  }

  protected openSmartBuilder(): void {
    this.builderDatasetKey = this.activeDatasetKey();
    const available = this.builderMetrics();
    this.builderMetricKeys = available.some(item => item.metricKey === this.widgets()[0]?.config.metric)
      ? [this.widgets()[0].config.metric!]
      : available.slice(0, 1).map(item => item.metricKey);
    this.builderMessage.set('');
    this.builderOpen.set(true);
    this.paletteOpen.set(false);
  }

  protected closeSmartBuilder(): void {
    this.builderOpen.set(false);
    this.builderMessage.set('');
  }

  protected changeBuilderDataset(datasetKey: string): void {
    this.builderDatasetKey = datasetKey;
    this.builderMetricKeys = this.builderMetrics().slice(0, 1).map(item => item.metricKey);
    this.builderMessage.set('');
  }

  protected builderMetrics() {
    return this.catalog()?.datasets.find(item => item.datasetKey === this.builderDatasetKey)?.metrics
      .filter(item => item.status === 'Published' && item.metricKey !== 'data.freshness') ?? [];
  }

  protected builderMetricSelected(metricKey: BiMetricKey): boolean {
    return this.builderMetricKeys.includes(metricKey);
  }

  protected toggleBuilderMetric(metricKey: BiMetricKey, checked: boolean): void {
    if (checked) {
      if (!this.builderMetricKeys.includes(metricKey) && this.builderMetricKeys.length < 5) {
        this.builderMetricKeys = [...this.builderMetricKeys, metricKey];
      }
    } else {
      this.builderMetricKeys = this.builderMetricKeys.filter(item => item !== metricKey);
    }
    this.builderMessage.set('');
  }

  protected interpretBuilderQuestion(): void {
    const text = this.builderQuestion.trim();
    if (!text) {
      this.builderMessage.set('ابتدا پرسش یا نیاز گزارشی را بنویسید.');
      return;
    }
    this.interpreting.set(true);
    this.builderMessage.set('');
    this.api.interpret({
      text,
      fromDate: this.fromDate,
      toDate: this.toDate,
      grain: this.grain,
      departmentRefs: this.departmentRef > 0 ? [this.departmentRef] : [],
    }).subscribe({
      next: response => {
        this.interpreting.set(false);
        if (response.status !== 'ReadyForConfirmation' || !response.datasetKey || !response.metricKey) {
          this.builderMessage.set(response.warnings?.join(' ') || 'پرسش به Dataset و Metric قابل اجرا نگاشت نشد.');
          return;
        }
        this.builderDatasetKey = response.datasetKey;
        this.builderMetricKeys = [response.metricKey];
        if (response.query?.grain) this.grain = response.query.grain;
        this.builderMessage.set(`پیشنهاد آماده است: ${response.datasetTitle} / ${response.metricTitle}. پیش‌نمایش را بررسی و سپس داشبورد را بسازید.`);
      },
      error: error => {
        this.interpreting.set(false);
        const apiError = error as { error?: { error?: string; Error?: string } };
        this.builderMessage.set(apiError?.error?.error ?? apiError?.error?.Error ?? 'تفسیر پرسش انجام نشد؛ انتخاب دستی همچنان در دسترس است.');
      },
    });
  }

  protected recommendedBuilderVisual(): BiWidgetType {
    if (this.builderVisual !== 'auto') return this.builderVisual;
    switch (this.builderDimension) {
      case 'summary': return 'kpi';
      case 'department': return 'donut';
      case 'periodDepartment': return 'pivot';
      default: return this.builderMetricKeys.length > 1 ? 'stackedBar' : 'trend';
    }
  }

  protected builderXAxis(): string {
    switch (this.builderDimension) {
      case 'summary': return 'بدون محور؛ مقدار تجمیعی بازه';
      case 'department': return 'واحد سازمانی';
      case 'periodDepartment': return `${this.grain === 'day' ? 'روز' : 'ماه'} × واحد سازمانی`;
      default: return this.grain === 'day' ? 'روز' : 'ماه';
    }
  }

  protected builderYAxis(): string {
    const dataset = this.catalog()?.datasets.find(item => item.datasetKey === this.builderDatasetKey);
    return this.builderMetricKeys.map(key => {
      const metric = dataset?.metrics.find(item => item.metricKey === key);
      return `${metric?.title ?? key}${metric?.unit ? ` (${metric.unit})` : ''}`;
    }).join('، ') || 'Metric انتخاب نشده';
  }

  protected builderDefinitions(): string {
    const dataset = this.catalog()?.datasets.find(item => item.datasetKey === this.builderDatasetKey);
    return this.builderMetricKeys.map(key => dataset?.metrics.find(item => item.metricKey === key)?.definition).filter(Boolean).join(' | ');
  }

  protected applySmartBuilder(): void {
    const dataset = this.catalog()?.datasets.find(item => item.datasetKey === this.builderDatasetKey);
    const metrics = this.builderMetricKeys
      .map(key => dataset?.metrics.find(item => item.metricKey === key))
      .filter((item): item is NonNullable<typeof item> => !!item && item.status === 'Published')
      .slice(0, 5);
    if (!dataset || !metrics.length) {
      this.builderMessage.set('حداقل یک Metric منتشرشده انتخاب کنید.');
      return;
    }
    const hasOtherDataset = this.widgets().some(item => item.datasetKey !== dataset.datasetKey);
    if (hasOtherDataset && !this.builderReplaceLayout) {
      this.builderMessage.set('هر داشبورد فعلاً یک Dataset اجرایی دارد؛ برای تغییر Dataset گزینه جایگزینی چیدمان را فعال کنید.');
      return;
    }

    const generated = this.createBuilderWidgets(dataset.datasetKey, metrics.map(item => item.metricKey));
    const replace = this.builderReplaceLayout || hasOtherDataset;
    const baseY = replace ? 0 : this.widgets().reduce((maximum, item) => Math.max(maximum, item.y + item.h), 0);
    const widgets = (replace ? generated : [...this.widgets(), ...generated.map(item => ({ ...item, y: item.y + baseY }))])
      .map((item, index) => ({ ...item, sortOrder: index }));
    this.dashboard.update(value => ({
      ...value,
      title: value.dashboardCode === 0 && replace ? `داشبورد ${dataset.title}` : value.title,
      widgets,
    }));
    this.dirty.set(true);
    this.selectedWidgetKey.set('');
    this.builderOpen.set(false);
    this.notice.set(`چیدمان ${dataset.title} با ${metrics.length} Metric ساخته شد؛ Query از Semantic Layer کنترل‌شده اجرا می‌شود.`);
    this.rebuildGrid();
    this.refreshData();
  }

  protected toggleWidgetMetric(widget: BiDashboardWidget, metricKey: BiMetricKey, checked: boolean): void {
    const maximum = widget.widgetType === 'stackedBar' ? 3 : 5;
    const current = widget.config.metrics ?? (widget.config.metric ? [widget.config.metric] : []);
    const metrics = checked
      ? [...new Set([...current, metricKey])].slice(0, maximum)
      : current.filter(item => item !== metricKey);
    if (!metrics.length) return;
    this.updateSelectedWidget(item => item.widgetKey !== widget.widgetKey ? item : ({
      ...item,
      config: { ...item.config, metric: metrics[0], metrics },
      configVersion: BI_WIDGET_CONFIG_VERSION,
    }));
  }

  protected saveDashboard(): void {
    const current = this.dashboard(); const title = current.title.trim();
    if (!title) { this.error.set('برای داشبورد یک عنوان وارد کنید.'); return; }
    const comparison = this.resolveComparisonRange();
    if (this.comparisonMode !== 'none' && !comparison) { this.error.set('بازه مقایسه معتبر نیست.'); return; }
    this.saving.set(true); this.error.set('');
    const request: BiDashboardWriteRequest = {
      title, isDefault: current.isDefault, rowVersion: current.rowVersion,
      filters: { fromDate: this.fromDate, toDate: this.toDate, grain: this.grain,
        departmentRefs: this.departmentRef > 0 ? [this.departmentRef] : [], comparisonMode: this.comparisonMode,
        comparisonFromDate: comparison?.fromDate ?? '', comparisonToDate: comparison?.toDate ?? '' },
      widgets: current.widgets.map(({ widgetCode: _widgetCode, ...widget }, index) => ({ ...widget, sortOrder: index })),
    };
    const operation = current.dashboardCode > 0 ? this.api.updateDashboard(current.dashboardCode, request) : this.api.createDashboard(request);
    operation.subscribe({
      next: dashboard => {
        const normalized = this.normalizeDashboard(dashboard); this.dashboard.set(normalized); this.upsertDashboard(normalized);
        this.dirty.set(false); this.saving.set(false); this.notice.set('داشبورد شخصی و تنظیمات نسخه‌دار آن ذخیره شد.'); this.rebuildGrid();
      },
      error: error => this.fail(error, 'ذخیره داشبورد انجام نشد.', true),
    });
  }

  protected copyDashboard(): void {
    const dashboardCode = this.dashboard().dashboardCode; if (!dashboardCode || !this.canCopy()) return;
    this.saving.set(true);
    this.api.copyDashboard(dashboardCode).subscribe({
      next: dashboard => {
        const normalized = this.normalizeDashboard(dashboard); this.dashboard.set(normalized); this.upsertDashboard(normalized);
        this.saving.set(false); this.dirty.set(false); this.notice.set('یک نسخه شخصی از داشبورد ساخته شد.'); this.rebuildGrid();
      },
      error: error => this.fail(error, 'کپی داشبورد انجام نشد.', true),
    });
  }

  protected deleteDashboard(): void {
    const current = this.dashboard();
    if (!current.dashboardCode || current.isOwner === false || !confirm(`داشبورد «${current.title}» حذف شود؟`)) return;
    this.saving.set(true);
    this.api.deleteDashboard(current.dashboardCode).subscribe({
      next: () => {
        const remaining = this.dashboards().filter(item => item.dashboardCode !== current.dashboardCode);
        this.dashboards.set(remaining); this.saving.set(false);
        if (remaining.length) this.selectDashboard(remaining[0].dashboardCode); else this.newPersonalDashboard();
      },
      error: error => this.fail(error, 'حذف داشبورد انجام نشد.', true),
    });
  }

  protected widgetRows(widget: BiDashboardWidget, comparison = false): BiSalesPoint[] {
    const segments = this.widgetSegments(widget, comparison);
    if (!segments.length) {
      const resultRows = comparison ? this.result()?.comparison?.rows : this.result()?.rows;
      return (resultRows ?? []).filter(row => this.periodAllowed(row.period, widget));
    }
    return [...new Set(segments.map(item => item.period))].sort().map(period => this.summarizePeriod(period, segments.filter(item => item.period === period)));
  }

  protected displayRows(widget: BiDashboardWidget): BiSalesPoint[] {
    const state = this.widgetStates()[widget.widgetKey];
    const rows = [...this.widgetRows(widget)];
    if (!state?.sortField || !state.sortDirection) return rows;
    const direction = state.sortDirection === 'asc' ? 1 : -1;
    return rows.sort((left, right) => {
      if (state.sortField === 'period') return left.period.localeCompare(right.period) * direction;
      return (this.pointValue(left, state.sortField) - this.pointValue(right, state.sortField)) * direction;
    });
  }

  protected toggleSort(widget: BiDashboardWidget, field: string): void {
    const current = this.widgetStates()[widget.widgetKey];
    const direction = current?.sortField === field && current.sortDirection === 'desc' ? 'asc' : 'desc';
    this.widgetStates.update(states => ({ ...states, [widget.widgetKey]: { ...current, widgetKey: widget.widgetKey, sortField: field, sortDirection: direction } }));
  }

  protected drillDepartment(widget: BiDashboardWidget, slice: DepartmentSlice): void {
    if (slice.code <= 0) return;
    this.departmentRef = slice.code;
    const current = this.widgetStates()[widget.widgetKey];
    this.widgetStates.update(states => ({ ...states, [widget.widgetKey]: { ...current, widgetKey: widget.widgetKey, drillDimension: 'department', drillValue: String(slice.code) } }));
    this.refreshData();
  }

  protected clearDrill(widget: BiDashboardWidget): void {
    const current = this.widgetStates()[widget.widgetKey];
    if (!current) return;
    this.departmentRef = 0;
    this.widgetStates.update(states => ({ ...states, [widget.widgetKey]: { ...current, drillDimension: null, drillValue: null } }));
    this.refreshData();
  }

  protected crossFilterByPeriod(period: string): void {
    this.crossFilterPeriod.set(this.crossFilterPeriod() === period ? '' : period);
  }

  protected clearCrossFilters(): void {
    this.crossFilterPeriod.set('');
    if (this.departmentRef > 0) { this.departmentRef = 0; this.refreshData(); }
  }

  protected setPersonalDefault(): void {
    const current = this.dashboard(); if (!current.dashboardCode) return;
    this.api.setDefault(current.dashboardCode, !current.isDefault).subscribe({
      next: () => { this.dashboards.update(items => items.map(item => ({ ...item, isDefault: item.dashboardCode === current.dashboardCode ? !current.isDefault : false }))); this.dashboard.update(value => ({ ...value, isDefault: !current.isDefault })); },
      error: error => this.fail(error, 'تغییر داشبورد پیش‌فرض انجام نشد.'),
    });
  }

  protected saveBookmark(): void {
    const code = this.dashboard().dashboardCode; const title = this.bookmarkTitle.trim(); if (!code || !title) return;
    const state: BiBookmarkState = { filters: this.currentFilters(), widgets: Object.values(this.widgetStates()) };
    this.api.createBookmark(code, title, state).subscribe({ next: bookmark => { this.bookmarks.update(items => [bookmark, ...items]); this.bookmarkTitle = ''; this.notice.set('Bookmark شخصی ذخیره شد.'); }, error: error => this.fail(error, 'ذخیره Bookmark انجام نشد.') });
  }

  protected applyBookmark(bookmark: BiBookmark): void {
    const filters = bookmark.state.filters; this.fromDate = filters.fromDate; this.toDate = filters.toDate; this.grain = filters.grain;
    this.departmentRef = filters.departmentRefs?.[0] ?? 0; this.comparisonMode = filters.comparisonMode;
    this.comparisonFromDate = filters.comparisonFromDate; this.comparisonToDate = filters.comparisonToDate;
    this.widgetStates.set(Object.fromEntries((bookmark.state.widgets ?? []).map(item => [item.widgetKey, item]))); this.refreshData();
  }

  protected deleteBookmark(bookmark: BiBookmark): void {
    this.api.deleteBookmark(this.dashboard().dashboardCode, bookmark.bookmarkCode).subscribe({ next: () => this.bookmarks.update(items => items.filter(item => item.bookmarkCode !== bookmark.bookmarkCode)), error: error => this.fail(error, 'حذف Bookmark انجام نشد.') });
  }

  protected publishDashboard(): void {
    const code = this.dashboard().dashboardCode; if (!code || this.dashboard().isOwner === false) return;
    this.saving.set(true); this.api.publish(code, { isTemplate: this.publishAsTemplate, templateDescription: this.templateDescription, changeNote: this.publishNote }).subscribe({
      next: dashboard => { const normalized = this.normalizeDashboard(dashboard); this.dashboard.set(normalized); this.upsertDashboard(normalized); this.saving.set(false); this.publishNote = ''; this.notice.set('نسخه جدید منتشر شد.'); this.loadGovernance(); },
      error: error => this.fail(error, 'انتشار داشبورد انجام نشد.', true),
    });
  }

  protected rollback(version: BiDashboardVersion): void {
    if (!confirm(`بازگشت به نسخه ${version.versionNumber} انجام شود؟`)) return;
    this.saving.set(true); this.api.rollback(this.dashboard().dashboardCode, version.versionNumber, `Rollback to v${version.versionNumber}`).subscribe({ next: dashboard => { const normalized = this.normalizeDashboard(dashboard); this.dashboard.set(normalized); this.saving.set(false); this.applyDashboardFilters(normalized); this.rebuildGrid(); this.refreshData(); this.loadGovernance(); }, error: error => this.fail(error, 'Rollback انجام نشد.', true) });
  }

  protected saveShare(): void {
    const target = this.shareTargets().find(item => item.targetKey === this.shareTargetKey); if (!target) return;
    this.api.saveShare(this.dashboard().dashboardCode, { targetType: target.targetType, targetKey: target.targetKey, accessLevel: this.shareAccess, isDefault: this.shareDefault, priority: this.sharePriority }).subscribe({ next: share => { this.shares.update(items => [share, ...items.filter(item => item.shareCode !== share.shareCode)]); this.notice.set('دسترسی اشتراکی ذخیره شد.'); }, error: error => this.fail(error, 'اشتراک‌گذاری انجام نشد.') });
  }

  protected deleteShare(share: BiDashboardShare): void {
    this.api.deleteShare(this.dashboard().dashboardCode, share.shareCode).subscribe({ next: () => this.shares.update(items => items.filter(item => item.shareCode !== share.shareCode)), error: error => this.fail(error, 'حذف دسترسی انجام نشد.') });
  }

  protected widgetSummary(widget: BiDashboardWidget, comparison = false): BiSalesSummary {
    const rows = this.widgetRows(widget, comparison);
    if (!rows.length) {
      const sourceRows = comparison ? this.result()?.comparison?.rows : this.result()?.rows;
      const sourceSegments = comparison ? this.result()?.comparison?.segments : this.result()?.segments;
      const fallback = comparison ? this.result()?.comparison?.summary : this.result()?.summary;
      // Older API responses may only contain summary. Never reuse that global summary when
      // a real result set exists but this widget's own filters intentionally exclude every row.
      if (!(sourceRows?.length) && !(sourceSegments?.length) && fallback) return fallback;
    }
    const values = this.aggregateValues(rows.map(item => item.values));
    const netSales = rows.reduce((sum, item) => sum + item.netSales, 0);
    const grossSales = rows.reduce((sum, item) => sum + item.grossSales, 0);
    const returnAmount = rows.reduce((sum, item) => sum + item.returnAmount, 0);
    const invoiceCount = rows.reduce((sum, item) => sum + item.invoiceCount, 0);
    const quantity = rows.reduce((sum, item) => sum + item.quantity, 0);
    return { netSales, grossSales, returnAmount, invoiceCount, quantity,
      averageInvoiceValue: invoiceCount ? netSales / invoiceCount : 0,
      returnRate: grossSales ? returnAmount * 100 / grossSales : 0, values };
  }

  protected metricValue(widget: BiDashboardWidget, comparison = false): number { return this.valueFromSummary(this.widgetSummary(widget, comparison), widget.config.metric); }
  protected comparisonDelta(widget: BiDashboardWidget): number | null {
    if (widget.config.comparison === 'none' || !this.resultFor(widget)?.comparison) return null;
    const current = this.metricValue(widget); const previous = this.metricValue(widget, true);
    if (widget.config.comparison === 'value') return current - previous;
    return previous === 0 ? null : (current - previous) * 100 / Math.abs(previous);
  }
  protected pointValue(row: BiSalesPoint | BiSalesSegment, metric: BiMetricKey | undefined): number { return this.valueFromSummary(row, metric); }
  protected metricUnit(metric: BiMetricKey | undefined): string {
    return this.dataset()?.metrics.find(item => item.metricKey === metric)?.unit ?? '';
  }
  protected formatWidgetValue(widget: BiDashboardWidget, value: number): string {
    const precision = this.dataset()?.metrics.find(item => item.metricKey === widget.config.metric)?.precision ?? 0;
    if (widget.config.numberFormat === 'compact') return new Intl.NumberFormat('fa-IR', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
    if (widget.config.numberFormat === 'percent') return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: precision || 2 }).format(value)}٪`;
    return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: precision }).format(value ?? 0);
  }
  protected formatNumber(value: number): string { return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 }).format(value ?? 0); }
  protected formatMetricValue(metricKey: BiMetricKey, value: number): string {
    const metric = this.dataset()?.metrics.find(item => item.metricKey === metricKey);
    const formatted = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: metric?.precision ?? 2 }).format(value ?? 0);
    return metricKey.endsWith('_rate') || metricKey.endsWith('_ratio') ? `${formatted}٪` : formatted;
  }
  protected metricColor(index: number): string { return CHART_COLORS[index % CHART_COLORS.length]; }

  protected chartPoints(widget: BiDashboardWidget): string {
    const values = this.widgetRows(widget).map(row => this.pointValue(row, widget.config.metric)); if (!values.length) return '';
    const minimum = Math.min(...values); const maximum = Math.max(...values); const span = maximum - minimum || 1;
    return values.map((value, index) => `${values.length === 1 ? 50 : index / (values.length - 1) * 100},${88 - (value - minimum) / span * 72}`).join(' ');
  }
  protected barWidth(widget: BiDashboardWidget, row: BiSalesPoint, metric: BiMetricKey): number {
    const maximum = Math.max(...this.widgetRows(widget).map(item => Math.max(0, this.pointValue(item, metric))), 1);
    return Math.max(0, this.pointValue(row, metric)) * 100 / maximum;
  }
  protected stackedMetrics(widget: BiDashboardWidget): BiMetricKey[] {
    const configured = widget.config.metrics?.filter(key => this.metricOptions().some(item => item.metricKey === key)) ?? [];
    const primary = widget.config.metric ?? this.metricOptions()[0]?.metricKey;
    const fallback = this.metricOptions().map(item => item.metricKey).filter(key => key !== primary);
    const selected = [...new Set([...(primary ? [primary] : []), ...configured])];
    return configured.length > 1 ? selected.slice(0, 3) : [...selected, ...fallback].slice(0, 2);
  }
  protected tableMetrics(widget: BiDashboardWidget): Array<{ metricKey: string; title: string }> {
    const configured = widget.config.metrics?.length ? widget.config.metrics : widget.config.metric ? [widget.config.metric] : [];
    const selected = configured
      .map(key => this.metricOptions().find(item => item.metricKey === key))
      .filter((item): item is NonNullable<typeof item> => !!item);
    return (selected.length ? selected : this.metricOptions()).slice(0, 5);
  }
  protected donutSlices(widget: BiDashboardWidget): DepartmentSlice[] {
    const totals = new Map<number, { name: string; value: number }>();
    for (const segment of this.widgetSegments(widget)) {
      const current = totals.get(segment.departmentCode) ?? { name: segment.departmentName, value: 0 };
      current.value += Math.max(0, this.pointValue(segment, widget.config.metric)); totals.set(segment.departmentCode, current);
    }
    const limit = Math.min(5, Math.max(1, widget.config.maxItems ?? 5));
    const ordered = [...totals.entries()].sort((a, b) => b[1].value - a[1].value); const visible = ordered.slice(0, limit);
    if (ordered.length > limit) visible.push([-1, { name: 'سایر واحدها', value: ordered.slice(limit).reduce((sum, item) => sum + item[1].value, 0) }]);
    const total = visible.reduce((sum, item) => sum + item[1].value, 0);
    return visible.map(([code, item], index) => ({ code, name: item.name, value: item.value,
      share: total ? item.value * 100 / total : 0, color: CHART_COLORS[index % CHART_COLORS.length] }));
  }
  protected donutBackground(widget: BiDashboardWidget): string {
    let start = 0;
    const stops = this.donutSlices(widget).map(slice => { const end = start + slice.share; const value = `${slice.color} ${start}% ${end}%`; start = end; return value; });
    return stops.length ? `conic-gradient(${stops.join(',')})` : '#e5e7eb';
  }
  protected pivotDepartments(widget: BiDashboardWidget): DepartmentSlice[] { return this.donutSlices({ ...widget, config: { ...widget.config, maxItems: 5 } }); }
  protected pivotRows(widget: BiDashboardWidget): PivotRow[] {
    const departments = new Set(this.pivotDepartments(widget).filter(item => item.code > 0).map(item => item.code));
    const segments = this.widgetSegments(widget);
    return [...new Set(segments.map(item => item.period))].sort().map(period => {
      const values = new Map<number, number>();
      for (const segment of segments.filter(item => item.period === period && departments.has(item.departmentCode)))
        values.set(segment.departmentCode, (values.get(segment.departmentCode) ?? 0) + this.pointValue(segment, widget.config.metric));
      return { period, values, total: [...values.values()].reduce((sum, value) => sum + value, 0) };
    });
  }
  protected widgetKind(type: BiWidgetType): string {
    return ({ kpi: 'شاخص کلیدی', trend: 'روند', table: 'جدول', stackedBar: 'نمودار انباشته', donut: 'ترکیب', pivot: 'Pivot', summaryList: 'خلاصه' })[type];
  }
  protected widgetAxisDescription(widget: BiDashboardWidget): string {
    const metrics = this.tableMetrics(widget).map(item => item.title).join('، ');
    switch (widget.widgetType) {
      case 'kpi': return `مقدار تجمیعی: ${this.metricTitle(widget.config.metric ?? '')}`;
      case 'donut': case 'summaryList': return `دسته: واحد سازمانی · مقدار: ${this.metricTitle(widget.config.metric ?? '')}`;
      case 'pivot': return `سطر: ${this.grain === 'day' ? 'روز' : 'ماه'} · ستون: واحد · مقدار: ${this.metricTitle(widget.config.metric ?? '')}`;
      default: return `X: ${this.grain === 'day' ? 'روز' : 'ماه'} · Y: ${metrics}`;
    }
  }
  protected trackWidget(_index: number, widget: BiDashboardWidget): string { return widget.widgetKey; }

  private loadWorkspace(): void {
    forkJoin({ catalog: this.api.getCatalog(), dashboards: this.api.getDashboards() }).subscribe({
      next: ({ catalog, dashboards }) => {
        this.catalog.set(catalog); this.dashboards.set(dashboards);
        const requestedCode = Number(this.route.snapshot.queryParamMap.get('dashboard'));
        const requested = dashboards.find(item => item.dashboardCode === requestedCode);
        if (!dashboards.length) { this.dashboard.set(this.newDashboard()); this.loading.set(false); this.rebuildGrid(); this.refreshData(); return; }
        const preferred = requested ?? dashboards.find(item => item.isDefault) ?? dashboards[0];
        this.api.getDashboard(preferred.dashboardCode).subscribe({
          next: dashboard => { this.dashboard.set(this.normalizeDashboard(dashboard)); this.applyDashboardFilters(dashboard); this.loading.set(false); this.rebuildGrid(); this.refreshData(); this.loadGovernance(); },
          error: error => this.fail(error, 'بارگذاری داشبورد انجام نشد.'),
        });
      },
      error: error => this.fail(error, 'راه‌اندازی فضای تحلیل انجام نشد.'),
    });
  }

  private rebuildGrid(): void {
    if (!this.viewReady) return; if (this.rebuildTimer) clearTimeout(this.rebuildTimer); this.grid?.destroy(false); this.grid = undefined;
    this.rebuildTimer = setTimeout(() => {
      if (!this.gridElement?.nativeElement) return;
      this.grid = GridStack.init({ column: 12, columnOpts: { breakpoints: [{ w: 720, c: 1 }, { w: 1100, c: 6 }], layout: 'moveScale' },
        cellHeight: 76, margin: 10, mode: 'float', staticGrid: !this.editing(), handle: '.bi-widget-handle', alwaysShowResizeHandle: true }, this.gridElement.nativeElement);
      this.grid.on('change', (_event, nodes) => {
        if (!this.editing()) return; const positions = new Map(nodes.map(node => [String(node.id), node]));
        this.dashboard.update(value => ({ ...value, widgets: value.widgets.map(widget => {
          const node = positions.get(widget.widgetKey); return node ? { ...widget, x: node.x ?? widget.x, y: node.y ?? widget.y, w: node.w ?? widget.w, h: node.h ?? widget.h } : widget;
        }) })); this.dirty.set(true);
      });
    });
  }

  private normalizeDashboard(dashboard: BiDashboard): BiDashboard {
    const migrated = (dashboard.widgets ?? []).map(widget => migrateBiWidget({ ...widget, config: widget.config ?? {} }));
    this.compatibilityWarnings.set(migrated.flatMap(item => item.warning ? [item.warning] : []));
    return { ...dashboard, widgets: migrated.map(item => item.widget) };
  }
  private createBuilderWidgets(datasetKey: string, metrics: BiMetricKey[]): BiDashboardWidget[] {
    const selectedType = this.recommendedBuilderVisual();
    const result: BiDashboardWidget[] = [];
    const make = (type: BiWidgetType, title: string, x: number, y: number, w: number, h: number, selected: BiMetricKey[]): BiDashboardWidget => {
      const metric = selected[0];
      const config = defaultBiWidgetConfig(type, metric);
      return {
        widgetCode: 0,
        widgetKey: this.createKey(),
        widgetType: type,
        datasetKey,
        title,
        x, y, w, h,
        sortOrder: result.length,
        configVersion: BI_WIDGET_CONFIG_VERSION,
        config: {
          ...config,
          metric,
          metrics: selected.slice(0, type === 'stackedBar' ? 3 : type === 'table' || type === 'pivot' ? 5 : 1),
          groupBy: this.builderDimension === 'department' ? 'department' : 'period',
          numberFormat: this.numberFormatForMetric(metric),
        },
      };
    };

    if (this.builderVisual !== 'auto') {
      const title = selectedType === 'kpi' && metrics.length === 1
        ? this.builderMetricTitle(datasetKey, metrics[0])
        : `${this.widgetKind(selectedType)} ${this.builderMetricTitle(datasetKey, metrics[0])}`;
      result.push(make(selectedType, title, 0, 0, selectedType === 'kpi' ? 3 : 12, selectedType === 'kpi' ? 2 : 4, metrics));
      return result;
    }

    metrics.forEach((metric, index) => {
      result.push(make('kpi', this.builderMetricTitle(datasetKey, metric), (index % 4) * 3, Math.floor(index / 4) * 2, 3, 2, [metric]));
    });
    if (this.builderDimension === 'summary') return result;
    const chartY = Math.ceil(metrics.length / 4) * 2;
    if (this.builderDimension === 'period') {
      result.push(make(selectedType, `${this.widgetKind(selectedType)} ${this.builderMetricTitle(datasetKey, metrics[0])}`, 0, chartY, 8, 4, metrics));
      result.push(make('table', 'جدول Metricهای انتخابی', 8, chartY, 4, 4, metrics));
    } else if (this.builderDimension === 'department') {
      result.push(make('donut', `سهم واحدها از ${this.builderMetricTitle(datasetKey, metrics[0])}`, 0, chartY, 6, 4, [metrics[0]]));
      result.push(make('summaryList', `رتبه‌بندی واحدها بر اساس ${this.builderMetricTitle(datasetKey, metrics[0])}`, 6, chartY, 6, 4, [metrics[0]]));
    } else {
      result.push(make('stackedBar', 'روند Metricهای انتخابی', 0, chartY, 7, 4, metrics));
      result.push(make('pivot', `ماتریس دوره و واحد: ${this.builderMetricTitle(datasetKey, metrics[0])}`, 7, chartY, 5, 4, [metrics[0]]));
    }
    return result;
  }

  private builderMetricTitle(datasetKey: string, metricKey: BiMetricKey): string {
    return this.catalog()?.datasets.find(item => item.datasetKey === datasetKey)?.metrics
      .find(item => item.metricKey === metricKey)?.title ?? metricKey;
  }

  private numberFormatForMetric(metricKey: BiMetricKey): NonNullable<BiWidgetConfig['numberFormat']> {
    if (metricKey.endsWith('_rate') || metricKey.endsWith('_ratio')) return 'percent';
    if (metricKey.endsWith('_count') || metricKey.endsWith('_quantity')) return 'number';
    return 'currency';
  }
  private upsertDashboard(dashboard: BiDashboard): void {
    const list = this.dashboards().filter(item => item.dashboardCode !== dashboard.dashboardCode);
    if (dashboard.isDefault) for (const item of list) item.isDefault = false; this.dashboards.set([dashboard, ...list]);
  }
  private applyDashboardFilters(dashboard: BiDashboard): void {
    const filters = dashboard.filters; if (!filters) return;
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(filters.fromDate)) this.fromDate = filters.fromDate;
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(filters.toDate)) this.toDate = filters.toDate;
    if (filters.grain === 'day' || filters.grain === 'month') this.grain = filters.grain;
    this.departmentRef = filters.departmentRefs?.[0] ?? 0; this.comparisonMode = filters.comparisonMode ?? 'none';
    this.comparisonFromDate = filters.comparisonFromDate ?? ''; this.comparisonToDate = filters.comparisonToDate ?? '';
  }
  private currentFilters() {
    const comparison = this.resolveComparisonRange();
    return { fromDate: this.fromDate, toDate: this.toDate, grain: this.grain,
      departmentRefs: this.departmentRef > 0 ? [this.departmentRef] : [], comparisonMode: this.comparisonMode,
      comparisonFromDate: comparison?.fromDate ?? '', comparisonToDate: comparison?.toDate ?? '' };
  }
  private loadGovernance(): void {
    const current = this.dashboard(); if (!current.dashboardCode) { this.bookmarks.set([]); this.shares.set([]); this.versions.set([]); return; }
    this.api.getBookmarks(current.dashboardCode).subscribe({ next: items => this.bookmarks.set(items), error: () => this.bookmarks.set([]) });
    this.api.getVersions(current.dashboardCode).subscribe({ next: items => this.versions.set(items), error: () => this.versions.set([]) });
    if ((current.isOwner ?? true) && this.permissions.canShareBiDashboard) {
      forkJoin({ shares: this.api.getShares(current.dashboardCode), targets: this.api.getShareTargets() }).subscribe({
        next: value => { this.shares.set(value.shares); this.shareTargets.set(value.targets); },
        error: () => { this.shares.set([]); this.shareTargets.set([]); },
      });
    } else { this.shares.set([]); this.shareTargets.set([]); }
    this.publishAsTemplate = current.isTemplate ?? false; this.templateDescription = current.templateDescription ?? '';
  }
  private updateSelectedWidget(mapper: (widget: BiDashboardWidget) => BiDashboardWidget): void {
    const key = this.selectedWidgetKey();
    this.dashboard.update(value => ({ ...value, widgets: value.widgets.map(widget => widget.widgetKey === key ? mapper(widget) : widget) })); this.dirty.set(true);
  }
  private widgetSegments(widget: BiDashboardWidget, comparison = false): BiSalesSegment[] {
    const segments = comparison ? this.result()?.comparison?.segments ?? [] : this.result()?.segments ?? [];
    const departments = new Set(widget.config.departmentRefs ?? []);
    return segments.filter(item => (!departments.size || departments.has(item.departmentCode)) && this.periodAllowed(item.period, widget));
  }
  private periodAllowed(period: string, widget: BiDashboardWidget): boolean {
    const from = widget.config.fromDate?.slice(0, period.length); const to = widget.config.toDate?.slice(0, period.length);
    const crossPeriod = this.crossFilterPeriod();
    return (!crossPeriod || period === crossPeriod) && (!from || period >= from) && (!to || period <= to);
  }
  private summarizePeriod(period: string, rows: BiSalesSegment[]): BiSalesPoint {
    const invoiceCount = rows.reduce((sum, item) => sum + item.invoiceCount, 0); const grossSales = rows.reduce((sum, item) => sum + item.grossSales, 0);
    const returnAmount = rows.reduce((sum, item) => sum + item.returnAmount, 0); const netSales = rows.reduce((sum, item) => sum + item.netSales, 0);
    return { period, invoiceCount, grossSales, returnAmount, netSales, quantity: rows.reduce((sum, item) => sum + item.quantity, 0),
      averageInvoiceValue: invoiceCount ? netSales / invoiceCount : 0, returnRate: grossSales ? returnAmount * 100 / grossSales : 0,
      values: this.aggregateValues(rows.map(item => item.values)) };
  }
  private valueFromSummary(summary: BiSalesSummary, metric: BiMetricKey | undefined): number {
    if (metric && summary.values && Object.prototype.hasOwnProperty.call(summary.values, metric)) return summary.values[metric] ?? 0;
    switch (metric) {
      case 'sales.gross': return summary.grossSales; case 'sales.return_amount': return summary.returnAmount;
      case 'sales.invoice_count': return summary.invoiceCount; case 'sales.quantity': return summary.quantity;
      case 'sales.average_invoice': return summary.averageInvoiceValue; case 'sales.return_rate': return summary.returnRate;
      default: return summary.netSales;
    }
  }
  private resolveComparisonRange(): { fromDate: string; toDate: string } | null {
    if (this.comparisonMode === 'none') return null;
    if (this.comparisonMode === 'custom') return this.validRange(this.comparisonFromDate, this.comparisonToDate) ? { fromDate: this.comparisonFromDate, toDate: this.comparisonToDate } : null;
    if (this.comparisonMode === 'previousYear') {
      const fromDate = this.shiftJalaliYear(this.fromDate, -1); const toDate = this.shiftJalaliYear(this.toDate, -1); return fromDate && toDate ? { fromDate, toDate } : null;
    }
    try {
      const from = this.toGregorianDate(this.fromDate); const to = this.toGregorianDate(this.toDate);
      const duration = Math.round((to.getTime() - from.getTime()) / 86400000) + 1; const previousTo = new Date(from.getTime() - 86400000);
      const previousFrom = new Date(previousTo.getTime() - (duration - 1) * 86400000);
      return { fromDate: this.toJalaliText(previousFrom), toDate: this.toJalaliText(previousTo) };
    } catch { return null; }
  }
  private shiftJalaliYear(value: string, offset: number): string | null {
    const [year, month, day] = value.split('/').map(Number); const targetYear = year + offset;
    if (!jalaali.isValidJalaaliDate(targetYear, month, day)) return null;
    return `${targetYear.toString().padStart(4, '0')}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
  }
  private toGregorianDate(value: string): Date {
    const [year, month, day] = value.split('/').map(Number); if (!jalaali.isValidJalaaliDate(year, month, day)) throw new Error('invalid date');
    const result = jalaali.toGregorian(year, month, day); return new Date(Date.UTC(result.gy, result.gm - 1, result.gd));
  }
  private toJalaliText(value: Date): string {
    const result = jalaali.toJalaali(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
    return `${result.jy.toString().padStart(4, '0')}/${result.jm.toString().padStart(2, '0')}/${result.jd.toString().padStart(2, '0')}`;
  }
  private validRange(fromDate: string, toDate: string): boolean { return /^\d{4}\/\d{2}\/\d{2}$/.test(fromDate) && /^\d{4}\/\d{2}\/\d{2}$/.test(toDate) && fromDate <= toDate; }
  protected metricTitle(metric: BiMetricKey): string { return this.dataset()?.metrics.find(item => item.metricKey === metric)?.title ?? metric; }
  private aggregateValues(sources: Array<Record<string, number> | undefined>): Record<string, number> {
    const values: Record<string, number> = {};
    for (const source of sources) for (const [key, value] of Object.entries(source ?? {})) values[key] = (values[key] ?? 0) + value;
    const percent = (numerator: number, denominator: number) => denominator ? numerator * 100 / denominator : 0;
    const ratio = (numerator: number, denominator: number) => denominator ? numerator / denominator : 0;
    switch (this.activeDatasetKey()) {
      case 'sales.summary': values['sales.average_invoice'] = ratio(values['sales.net'], values['sales.invoice_count']); values['sales.return_rate'] = percent(values['sales.return_amount'], values['sales.gross']); break;
      case 'cash.flow': values['cash.net_flow'] = (values['cash.received_amount'] ?? 0) - (values['cash.paid_amount'] ?? 0); values['cash.inflow_outflow_ratio'] = percent(values['cash.received_amount'], values['cash.paid_amount']); break;
      case 'inventory.flow': values['inventory.net_quantity'] = (values['inventory.receipt_quantity'] ?? 0) - (values['inventory.issue_quantity'] ?? 0); values['inventory.issue_receipt_ratio'] = percent(values['inventory.issue_quantity'], values['inventory.receipt_quantity']); break;
      case 'purchase.summary': values['purchase.net_amount'] = (values['purchase.gross_amount'] ?? 0) - (values['purchase.return_amount'] ?? 0); values['purchase.average_invoice'] = ratio(values['purchase.net_amount'], values['purchase.invoice_count']); values['purchase.return_rate'] = percent(values['purchase.return_amount'], values['purchase.gross_amount']); break;
      case 'operations.quotation': values['operations.unconverted_count'] = (values['operations.quote_count'] ?? 0) - (values['operations.converted_count'] ?? 0); values['operations.conversion_rate'] = percent(values['operations.converted_count'], values['operations.quote_count']); break;
    }
    return values;
  }
  private resultFor(_widget: BiDashboardWidget): BiQueryResponse | null { return this.result(); }
  private fail(error: unknown, fallback: string, keepWorkspace = false): void {
    const apiError = error as { error?: { error?: string; Error?: string }; message?: string };
    this.error.set(apiError?.error?.error ?? apiError?.error?.Error ?? fallback); this.loading.set(false); this.queryLoading.set(false); this.saving.set(false);
    if (!keepWorkspace) this.result.set(null);
  }
  private newDashboard(): BiDashboard {
    return { dashboardCode: 0, title: 'داشبورد فروش من', isDefault: true, isFavorite: false, lastViewedAt: null, packKey: null, createdAt: '', updatedAt: '', rowVersion: '',
      isOwner: true, accessLevel: 'Owner', isTemplate: false, publishState: 'Draft', publishedVersion: 0, scopeAdjusted: false,
      filters: { fromDate: '', toDate: '', grain: 'month', departmentRefs: [], comparisonMode: 'none', comparisonFromDate: '', comparisonToDate: '' },
      widgets: [
        this.defaultWidget('kpi-sales', 'kpi', 'فروش خالص', 0, 0, 3, 2, 'sales.net'),
        this.defaultWidget('kpi-invoices', 'kpi', 'تعداد فاکتور', 3, 0, 3, 2, 'sales.invoice_count'),
        this.defaultWidget('kpi-average', 'kpi', 'میانگین مبلغ فاکتور', 6, 0, 3, 2, 'sales.average_invoice'),
        this.defaultWidget('kpi-returns', 'kpi', 'نرخ برگشت', 9, 0, 3, 2, 'sales.return_rate'),
        this.defaultWidget('sales-trend', 'trend', 'روند فروش خالص', 0, 2, 8, 4, 'sales.net'),
        this.defaultWidget('sales-table', 'table', 'جزئیات دوره‌ای فروش', 8, 2, 4, 4, 'sales.net'),
      ] };
  }
  private defaultWidget(key: string, type: BiWidgetType, title: string, x: number, y: number, w: number, h: number, metric: BiMetricKey): BiDashboardWidget {
    return { widgetCode: 0, widgetKey: key, widgetType: type, datasetKey: SALES_DATASET, title, x, y, w, h,
      sortOrder: y * 12 + x, configVersion: BI_WIDGET_CONFIG_VERSION, config: defaultBiWidgetConfig(type, metric) };
  }
  private createKey(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().replaceAll('-', '') : `widget-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
  private currentPersianDate(): string {
    const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? '';
    return `${value('year')}/${value('month')}/${value('day')}`;
  }
}
