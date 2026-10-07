import { BiDashboardWidget } from './bi.models';
import { BI_WIDGET_CONFIG_VERSION, migrateBiWidget } from './bi-widget-config';

describe('BI widget config migration', () => {
  const widget = (config: BiDashboardWidget['config'], configVersion = 1): BiDashboardWidget => ({
    widgetCode: 1, widgetKey: 'one', widgetType: 'trend', datasetKey: 'sales.summary', title: 'روند',
    x: 4, y: 2, w: 8, h: 4, sortOrder: 1, configVersion, config,
  });

  it('migrates a v1 widget without changing user layout', () => {
    const result = migrateBiWidget(widget({ schemaVersion: 1, metric: 'sales.invoice_count' }));
    expect(result.migrated).toBeTrue();
    expect(result.widget.configVersion).toBe(BI_WIDGET_CONFIG_VERSION);
    expect(result.widget.config.schemaVersion).toBe(BI_WIDGET_CONFIG_VERSION);
    expect(result.widget.config.metric).toBe('sales.invoice_count');
    expect(result.widget.x).toBe(4);
    expect(result.widget.w).toBe(8);
    expect(result.warning).toContain('ارتقا');
  });

  it('fails safe for a future config and removes unsupported metric keys', () => {
    const result = migrateBiWidget(widget({ schemaVersion: 99, metric: 'unsafe.metric' as any }, 2));
    expect(result.widget.config.metric).toBe('sales.net');
    expect(result.widget.config.schemaVersion).toBe(2);
    expect(result.warning).toContain('نسخه جدیدتری');
  });

  it('normalizes legacy casing for new widget types', () => {
    const result = migrateBiWidget({ ...widget({ schemaVersion: 2, metric: 'sales.net' }, 2), widgetType: 'stackedbar' as any });
    expect(result.widget.widgetType).toBe('stackedBar');
  });

  it('preserves governed Phase 3 semantic metrics during config migration', () => {
    const result = migrateBiWidget({ ...widget({ schemaVersion: 2, metric: 'cash.net_flow' }, 2), datasetKey: 'cash.flow' });
    expect(result.widget.config.metric).toBe('cash.net_flow');
    expect(result.widget.config.numberFormat).toBe('currency');
  });
});
