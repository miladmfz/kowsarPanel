import { BiDashboardWidget, BiMetricKey, BiWidgetConfig, BiWidgetType } from './bi.models';

export const BI_WIDGET_CONFIG_VERSION = 2;

const governedMetricPattern = /^(sales|cash|inventory|purchase|operations)\.[a-z][a-z0-9_]*$/;

export interface BiWidgetMigrationResult {
  widget: BiDashboardWidget;
  migrated: boolean;
  warning?: string;
}

export function migrateBiWidget(widget: BiDashboardWidget): BiWidgetMigrationResult {
  const source = widget.config ?? {};
  const sourceVersion = Number(source.schemaVersion ?? widget.configVersion ?? 1);
  const metric = isMetricKey(source.metric) ? source.metric : 'sales.net';
  const type = normalizeWidgetType(widget.widgetType);
  const safeConfig: BiWidgetConfig = {
    schemaVersion: BI_WIDGET_CONFIG_VERSION,
    metric,
    metrics: normalizeMetrics(source.metrics, metric, type),
    numberFormat: normalizeNumberFormat(source.numberFormat, metric),
    groupBy: source.groupBy === 'department' ? 'department' : 'period',
    comparison: ['value', 'percent'].includes(source.comparison ?? '') ? source.comparison : 'none',
    fromDate: validDate(source.fromDate) ? source.fromDate : undefined,
    toDate: validDate(source.toDate) ? source.toDate : undefined,
    departmentRefs: (source.departmentRefs ?? []).filter(value => Number.isInteger(value) && value > 0).slice(0, 20),
    maxItems: clamp(Number(source.maxItems ?? 5), 1, 5),
  };

  const migrated = sourceVersion !== BI_WIDGET_CONFIG_VERSION || widget.configVersion !== BI_WIDGET_CONFIG_VERSION || type !== widget.widgetType;
  const warning = sourceVersion > BI_WIDGET_CONFIG_VERSION
    ? `ویجت «${widget.title}» با نسخه جدیدتری ساخته شده بود و با تنظیمات امن نمایش داده شد.`
    : sourceVersion < BI_WIDGET_CONFIG_VERSION
      ? `تنظیمات ویجت «${widget.title}» از نسخه ${sourceVersion || 1} به نسخه ${BI_WIDGET_CONFIG_VERSION} ارتقا یافت.`
      : undefined;
  return {
    widget: { ...widget, widgetType: type, configVersion: BI_WIDGET_CONFIG_VERSION, config: safeConfig },
    migrated,
    warning,
  };
}

export function defaultBiWidgetConfig(type: BiWidgetType, metric: BiMetricKey = 'sales.net'): BiWidgetConfig {
  return migrateBiWidget({
    widgetCode: 0,
    widgetKey: 'default',
    widgetType: type,
    datasetKey: 'sales.summary',
    title: '',
    x: 0, y: 0, w: 1, h: 1, sortOrder: 0,
    configVersion: BI_WIDGET_CONFIG_VERSION,
    config: { schemaVersion: BI_WIDGET_CONFIG_VERSION, metric },
  }).widget.config;
}

function normalizeWidgetType(value: string): BiWidgetType {
  const normalized = value.toLowerCase();
  if (normalized === 'stackedbar') return 'stackedBar';
  if (normalized === 'summarylist') return 'summaryList';
  if (['kpi', 'trend', 'table', 'donut', 'pivot'].includes(normalized)) return normalized as BiWidgetType;
  return 'kpi';
}

function normalizeMetrics(values: BiMetricKey[] | undefined, metric: BiMetricKey, type: BiWidgetType): BiMetricKey[] {
  const valid = (values ?? []).filter(isMetricKey);
  if (type === 'stackedBar') return unique<BiMetricKey>(valid.length ? valid : [metric]).slice(0, 3);
  return unique<BiMetricKey>(valid.length ? valid : [metric]).slice(0, type === 'table' || type === 'pivot' ? 5 : 1);
}

function normalizeNumberFormat(value: BiWidgetConfig['numberFormat'], metric: BiMetricKey): NonNullable<BiWidgetConfig['numberFormat']> {
  if (value && ['number', 'currency', 'compact', 'percent'].includes(value)) return value;
  if (metric.endsWith('_rate') || metric.endsWith('_ratio')) return 'percent';
  if (metric.endsWith('_count') || metric.endsWith('_quantity')) return 'number';
  return 'currency';
}

function isMetricKey(value: unknown): value is BiMetricKey {
  return typeof value === 'string' && governedMetricPattern.test(value);
}

function validDate(value: string | undefined): boolean {
  return !value || /^\d{4}\/\d{2}\/\d{2}$/.test(value);
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
}
