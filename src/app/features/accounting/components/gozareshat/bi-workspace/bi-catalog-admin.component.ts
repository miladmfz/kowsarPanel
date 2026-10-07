import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BiWebApiService } from '../../../services/BiWebApi/BiWebApi.service';
import {
  BiAdminCatalog, BiAdminDataset, BiAdminField, BiAdminMetric, BiDatasetUpdateRequest,
  BiFieldUpdateRequest, BiLifecycleStatus, BiMetricUpdateRequest,
} from '../../../services/BiWebApi/bi.models';

@Component({
  selector: 'app-bi-catalog-admin', standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bi-catalog-admin.component.html', styleUrl: './bi-catalog-admin.component.scss',
})
export class BiCatalogAdminComponent implements OnInit {
  private readonly api = inject(BiWebApiService);

  protected readonly catalog = signal<BiAdminCatalog>({ datasets: [] });
  protected readonly selectedDatasetKey = signal('');
  protected readonly selectedMetricKey = signal('');
  protected readonly selectedFieldKey = signal('');
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly dependencyWarning = signal<string[]>([]);

  protected datasetDraft?: BiDatasetUpdateRequest;
  protected metricDraft?: BiMetricUpdateRequest;
  protected fieldDraft?: BiFieldUpdateRequest;

  protected readonly selectedDataset = computed(() => this.catalog().datasets.find(item => item.datasetKey === this.selectedDatasetKey()));
  protected readonly selectedMetric = computed(() => this.selectedDataset()?.metrics.find(item => item.metricKey === this.selectedMetricKey()));
  protected readonly selectedField = computed(() => this.selectedDataset()?.fields.find(item => item.fieldKey === this.selectedFieldKey()));
  protected readonly statuses: BiLifecycleStatus[] = ['Draft', 'Published', 'Deprecated'];

  ngOnInit(): void { this.load(); }

  protected selectDataset(key: string): void {
    this.selectedDatasetKey.set(key); this.selectedMetricKey.set(''); this.selectedFieldKey.set('');
    this.prepareDatasetDraft(); this.metricDraft = undefined; this.fieldDraft = undefined; this.dependencyWarning.set([]);
  }

  protected selectMetric(metric: BiAdminMetric): void {
    this.selectedMetricKey.set(metric.metricKey); this.selectedFieldKey.set(''); this.fieldDraft = undefined; this.dependencyWarning.set([]);
    this.metricDraft = {
      title: metric.title, metricRole: metric.metricRole, definition: metric.definition, formula: metric.formula,
      unit: metric.unit, precision: metric.precision, status: metric.status, sortOrder: metric.sortOrder, rowVersion: metric.rowVersion,
    };
  }

  protected selectField(field: BiAdminField): void {
    this.selectedFieldKey.set(field.fieldKey); this.selectedMetricKey.set(''); this.metricDraft = undefined; this.dependencyWarning.set([]);
    this.fieldDraft = {
      title: field.title, dataType: field.dataType, fieldRole: field.fieldRole, unit: field.unit,
      allowedAggregations: [...field.allowedAggregations], allowedOperators: [...field.allowedOperators],
      isSensitive: field.isSensitive, status: field.status, sortOrder: field.sortOrder,
      confirmDependencyChange: false, rowVersion: field.rowVersion,
    };
  }

  protected saveDataset(): void {
    const dataset = this.selectedDataset(); if (!dataset || !this.datasetDraft) return;
    this.beginSave();
    this.api.updateDataset(dataset.datasetKey, this.datasetDraft).subscribe({
      next: updated => { this.replaceDataset(updated); this.prepareDatasetDraft(); this.finishSave('Dataset با نسخه جدید ذخیره شد.'); },
      error: error => this.fail(error, 'ذخیره Dataset انجام نشد.'),
    });
  }

  protected saveMetric(): void {
    const metric = this.selectedMetric(); if (!metric || !this.metricDraft) return;
    this.beginSave();
    this.api.updateMetric(metric.metricKey, this.metricDraft).subscribe({
      next: updated => {
        this.patchMetric(updated); this.selectMetric(updated);
        this.finishSave(`Metric نسخه ${updated.definitionVersion} ذخیره شد؛ Layout کاربران تغییری نکرد.`);
      },
      error: error => this.fail(error, 'ذخیره Metric انجام نشد.'),
    });
  }

  protected saveField(confirmDependencyChange = false): void {
    const dataset = this.selectedDataset(); const field = this.selectedField();
    if (!dataset || !field || !this.fieldDraft) return;
    this.beginSave();
    const request = { ...this.fieldDraft, confirmDependencyChange };
    this.api.updateField(dataset.datasetKey, field.fieldKey, request).subscribe({
      next: updated => { this.patchField(updated); this.selectField(updated); this.finishSave(`Field نسخه ${updated.definitionVersion} ذخیره شد.`); },
      error: error => {
        const conflict = error as { status?: number; error?: { code?: string; Code?: string; dependencies?: string[]; Dependencies?: string[]; error?: string; Error?: string } };
        const code = conflict.error?.code ?? conflict.error?.Code;
        if (conflict.status === 409 && code === 'DEPENDENCY_WARNING') {
          this.dependencyWarning.set(conflict.error?.dependencies ?? conflict.error?.Dependencies ?? []);
          this.saving.set(false); this.error.set(conflict.error?.error ?? conflict.error?.Error ?? 'وابستگی‌ها باید بررسی شوند.'); return;
        }
        this.fail(error, 'ذخیره Field انجام نشد.');
      },
    });
  }

  protected setAggregations(value: string): void {
    if (this.fieldDraft) this.fieldDraft.allowedAggregations = this.csv(value);
  }

  protected setOperators(value: string): void {
    if (this.fieldDraft) this.fieldDraft.allowedOperators = this.csv(value);
  }

  protected statusLabel(status: string): string {
    return ({ Draft: 'پیش‌نویس', Published: 'منتشرشده', Deprecated: 'منسوخ' } as Record<string, string>)[status] ?? status;
  }

  private load(): void {
    this.loading.set(true); this.error.set('');
    this.api.getAdminCatalog().subscribe({
      next: catalog => {
        this.catalog.set(catalog); const first = catalog.datasets[0];
        if (first) { this.selectedDatasetKey.set(first.datasetKey); this.prepareDatasetDraft(); }
        this.loading.set(false);
      },
      error: error => this.fail(error, 'بارگذاری کاتالوگ مدیریتی انجام نشد.'),
    });
  }

  private prepareDatasetDraft(): void {
    const item = this.selectedDataset();
    this.datasetDraft = item ? {
      title: item.title, domain: item.domain, description: item.description, status: item.status,
      maxRows: item.maxRows, maxRangeDays: item.maxRangeDays, cacheSeconds: item.cacheSeconds,
      sourceName: item.sourceName, sourceDescription: item.sourceDescription,
      freshnessSlaMinutes: item.freshnessSlaMinutes, sortOrder: item.sortOrder, rowVersion: item.rowVersion,
    } : undefined;
  }

  private replaceDataset(updated: BiAdminDataset): void {
    this.catalog.update(value => ({ datasets: value.datasets.map(item => item.datasetKey === updated.datasetKey ? updated : item) }));
  }

  private patchMetric(updated: BiAdminMetric): void {
    const dataset = this.selectedDataset(); if (!dataset) return;
    this.replaceDataset({ ...dataset, metrics: dataset.metrics.map(item => item.metricKey === updated.metricKey ? updated : item) });
  }

  private patchField(updated: BiAdminField): void {
    const dataset = this.selectedDataset(); if (!dataset) return;
    this.replaceDataset({ ...dataset, fields: dataset.fields.map(item => item.fieldKey === updated.fieldKey ? updated : item) });
  }

  private beginSave(): void { this.saving.set(true); this.error.set(''); this.notice.set(''); this.dependencyWarning.set([]); }
  private finishSave(message: string): void { this.saving.set(false); this.notice.set(message); }
  private fail(error: unknown, fallback: string): void {
    const apiError = error as { error?: { error?: string; Error?: string } };
    this.error.set(apiError.error?.error ?? apiError.error?.Error ?? fallback); this.loading.set(false); this.saving.set(false);
  }
  private csv(value: string): string[] { return value.split(',').map(item => item.trim().toLowerCase()).filter(Boolean); }
}
