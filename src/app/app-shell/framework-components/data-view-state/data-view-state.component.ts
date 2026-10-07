import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type DataViewState = 'loading' | 'empty' | 'error';

@Component({
  selector: 'app-data-view-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="kws-data-state"
      [class.kws-data-state-compact]="compact"
      [class.kws-data-state-error]="state === 'error'"
      [attr.role]="state === 'error' ? 'alert' : 'status'"
      [attr.aria-live]="state === 'error' ? 'assertive' : 'polite'"
      [attr.aria-busy]="state === 'loading'">
      @if (state === 'loading') {
        <span class="spinner-border" aria-hidden="true"></span>
      } @else {
        <i
          class="mdi"
          [class.mdi-database-off-outline]="state === 'empty'"
          [class.mdi-alert-circle-outline]="state === 'error'"
          aria-hidden="true"></i>
      }

      <strong>{{ title || defaultTitle }}</strong>
      @if (message) {
        <span>{{ message }}</span>
      }
      @if (actionLabel && state !== 'loading') {
        <button type="button" class="btn btn-sm btn-outline-primary" (click)="action.emit()">
          {{ actionLabel }}
        </button>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .kws-data-state {
      min-height: 12rem;
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: .75rem;
      text-align: center;
      color: var(--bs-secondary-color);
      border: 1px dashed var(--bs-border-color);
      border-radius: .75rem;
      background: var(--bs-tertiary-bg);
    }
    .kws-data-state-compact { min-height: 7rem; padding: 1rem; }
    .kws-data-state-error { color: var(--bs-danger-text-emphasis); background: var(--bs-danger-bg-subtle); }
    .kws-data-state .mdi { font-size: 2rem; line-height: 1; }
    .kws-data-state .spinner-border { width: 1.75rem; height: 1.75rem; }
    .kws-data-state span { max-width: 42rem; }
    .kws-data-state .btn:focus-visible { outline: 3px solid var(--bs-primary); outline-offset: 2px; }
    @media (max-width: 575.98px) {
      .kws-data-state { min-height: 9rem; padding: 1.25rem .75rem; }
    }
  `],
})
export class DataViewStateComponent {
  @Input({ required: true }) state: DataViewState = 'loading';
  @Input() title = '';
  @Input() message = '';
  @Input() actionLabel = '';
  @Input() compact = false;
  @Output() action = new EventEmitter<void>();

  get defaultTitle(): string {
    if (this.state === 'empty') return 'اطلاعاتی برای نمایش وجود ندارد';
    if (this.state === 'error') return 'دریافت اطلاعات با خطا مواجه شد';
    return 'در حال دریافت اطلاعات...';
  }
}
