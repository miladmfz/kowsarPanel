import { computed, signal } from '@angular/core';

export type CrudLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/** Shared, predictable state lifecycle for List/Grid pages. */
export class CrudListState<TItem> {
  readonly records = signal<TItem[]>([]);
  readonly selected = signal<TItem | null>(null);
  readonly status = signal<CrudLoadStatus>('idle');
  readonly errorMessage = signal<string | null>(null);
  readonly loading = computed(() => this.status() === 'loading');

  beginLoad(): void {
    this.status.set('loading');
    this.errorMessage.set(null);
  }

  resolve(items: readonly TItem[]): void {
    this.records.set([...items]);
    this.status.set('loaded');
    this.errorMessage.set(null);
  }

  reject(message: string): void {
    this.records.set([]);
    this.selected.set(null);
    this.status.set('error');
    this.errorMessage.set(message);
  }

  select(item: TItem | null): void {
    this.selected.set(item);
  }

  upsert(item: TItem, matches: (current: TItem) => boolean): void {
    const index = this.records().findIndex(matches);
    if (index < 0) {
      this.records.update(items => [...items, item]);
      return;
    }
    this.records.update(items => items.map((current, i) => i === index ? item : current));
  }

  remove(matches: (current: TItem) => boolean): void {
    this.records.update(items => items.filter(item => !matches(item)));
  }
}
