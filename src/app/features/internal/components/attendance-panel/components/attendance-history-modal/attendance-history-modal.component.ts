import { CommonModule, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { CellStatusAttendanceHistoryPanel } from './cell-status-history-attendance-panel';

@Component({
  selector: 'app-attendance-history-modal',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './attendance-history-modal.component.html',
})
export class AttendanceHistoryModalComponent
  implements OnChanges, AfterViewInit, OnDestroy {

  @ViewChild('dialogElement')
  private dialogRef?: ElementRef<HTMLDialogElement>;

  private _visible = signal(false);
  private _records = signal<any[]>([]);
  private viewReady = false;

  themeClass = 'ag-theme-quartz kowsar-ag-grid';

  @Input() set visible(value: boolean) {
    this._visible.set(value);
  }

  get visibleValue(): boolean {
    return this._visible();
  }

  @Input() set records(records: any[]) {
    this._records.set(records ?? []);
  }

  get recordsValue(): any[] {
    return this._records();
  }

  @Input() title = 'تاریخچه حضور';
  @Input() darkMode = false;

  @Output() close = new EventEmitter<void>();

  totalRecords = computed(() => this._records().length);

  columnDefs: ColDef[] = [
    {
      field: 'AttendanceDate',
      headerName: 'تاریخ و ساعت حضور',
      valueFormatter: this.formatDate,
    },
    {
      field: 'وضعیت حضور',
      cellRenderer: CellStatusAttendanceHistoryPanel,
      cellClass: 'text-center',
      width: 80,
    },
    {
      field: 'PhFirstName',
      headerName: 'نام',
    },
    {
      field: 'PhLastName',
      headerName: 'نام خانوادگی',
    },
  ];

  defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
    cellClass: 'text-center',
  };

  localeText = {
    noRowsToShow: 'هیچ اطلاعاتی برای نمایش وجود ندارد',
  };

  private readonly document = inject(DOCUMENT);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.viewReady) {
      queueMicrotask(() => this.syncDialogState());
    }
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    queueMicrotask(() => this.syncDialogState());
  }

  ngOnDestroy(): void {
    const dialog = this.dialogRef?.nativeElement;

    if (dialog?.open) {
      dialog.close();
    }

    this.refreshBodyScrollLock();
  }

  private syncDialogState(): void {
    const dialog = this.dialogRef?.nativeElement;

    if (!dialog?.isConnected) {
      return;
    }

    if (this.visibleValue && !dialog.open) {
      dialog.showModal();
    } else if (!this.visibleValue && dialog.open) {
      dialog.close();
    }

    this.refreshBodyScrollLock();
  }

  private refreshBodyScrollLock(): void {
    queueMicrotask(() => {
      const hasOpenDialog = Boolean(
        this.document.querySelector('dialog.kowsar-dialog[open]'),
      );

      this.document.body.classList.toggle(
        'kowsar-dialog-open',
        hasOpenDialog,
      );
    });
  }

  requestClose(): void {
    this.close.emit();
  }

  onDialogCancel(event: Event): void {
    event.preventDefault();
    this.requestClose();
  }

  onDialogBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialogRef?.nativeElement) {
      this.requestClose();
    }
  }

  formatDate(params: any): string {
    if (!params.value) {
      return '';
    }

    const date = new Date(params.value);

    return date.toLocaleString('fa-IR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
}
