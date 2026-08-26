import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';

@Component({
  selector: 'cell-action-attendance-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="attendance-action-buttons">
      <button
        type="button"
        class="btn btn-sm btn-outline-primary"
        title="تیکت"
        (click)="setLetterConfig($event)">
        <i class="far fa-list-alt"></i>
      </button>

      @if (showHistoryButton()) {
        <button
          type="button"
          class="btn btn-sm btn-outline-primary"
          title="تاریخچه حضور"
          (click)="showHistory($event)">
          <i class="fas fa-history"></i>
        </button>
      }

      @if (showCallReportButton()) {
        <button
          type="button"
          class="btn btn-sm btn-outline-success"
          [disabled]="!personExtension()"
          [title]="personExtension() ? 'گزارش تماس امروز' : 'داخلی سانترال تعریف نشده است'"
          (click)="showCallReport($event)">
          <i class="fas fa-phone-alt"></i>
        </button>
      }
    </div>
  `,
  styles: [`
    .attendance-action-buttons {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.3rem;
      direction: rtl;
    }

    .attendance-action-buttons .btn {
      width: 29px;
      height: 29px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border-radius: 8px;
      line-height: 1;
    }
  `],
})
export class CellActionAttendancePanel implements ICellRendererAngularComp {
  private params: any;
  private data: any;

  protected readonly session = inject(SessionStorageService);
  protected readonly permissionService = inject(PermissionService);

  showHistoryButton = signal(false);
  showCallReportButton = signal(false);
  personExtension = signal('');

  agInit(params: any): void {
    this.params = params;
    this.data = params?.data ?? {};

    const ownCentralRef = String(this.session.centralRef ?? '').trim();
    const rowCentralRef = String(this.data?.CentralRef ?? '').trim();
    const canSeePersonalActions =
      this.permissionService.canManageRole ||
      (ownCentralRef !== '' && ownCentralRef === rowCentralRef);

    this.personExtension.set(this.resolvePersonExtension(this.data));
    this.showHistoryButton.set(canSeePersonalActions);
    this.showCallReportButton.set(canSeePersonalActions);
  }

  refresh(): boolean {
    return false;
  }

  setLetterConfig(event?: MouseEvent): void {
    event?.stopPropagation();

    if (typeof this.params?.onLetter === 'function') {
      this.params.onLetter(this.data);
      return;
    }

    this.params?.context?.componentParent?.SetLetter_config?.(this.data);
  }

  showHistory(event?: MouseEvent): void {
    event?.stopPropagation();

    if (typeof this.params?.onHistory === 'function') {
      this.params.onHistory(this.data);
      return;
    }

    this.params?.context?.componentParent?.ShowHistory?.(this.data);
  }

  showCallReport(event?: MouseEvent): void {
    event?.stopPropagation();

    if (!this.personExtension()) {
      return;
    }

    if (typeof this.params?.onCallReport === 'function') {
      this.params.onCallReport(this.data);
      return;
    }

    this.params?.context?.componentParent?.ShowCallReport?.(this.data);
  }

  private resolvePersonExtension(item: any): string {
    const candidates = [
      item?.Manager,
      item?.manager,
      item?.Extension,
      item?.extension,
      item?.ExtensionNo,
      item?.InternalNo,
      item?.PhoneExtension,
      item?.SantralExtension,
      item?.PhAddress3,
    ];

    for (const value of candidates) {
      const extension = String(value ?? '')
        .trim()
        .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
        .replace(/\D+/g, '');

      if (extension.length >= 2 && extension.length <= 8) {
        return extension;
      }
    }

    return '';
  }
}
