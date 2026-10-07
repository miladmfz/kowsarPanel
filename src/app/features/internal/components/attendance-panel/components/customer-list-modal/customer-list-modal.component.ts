import { CommonModule, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import 'src/app/app-shell/framework-components/ag-grid/ag-grid-enterprise-registration';
import { ColDef } from 'ag-grid-community';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-customer-list-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AgGridModule],
  templateUrl: './customer-list-modal.component.html',
})
export class CustomerListModalComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @ViewChild('dialogElement')
  private dialogRef?: ElementRef<HTMLDialogElement>;

  @Input() visible = false;
  @Input() darkMode = false;
  @Input() records: any[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() selectCustomer = new EventEmitter<any>();
  @Output() searchRequested = new EventEmitter<string>();

  searchForm: FormGroup;
  selectedCustomer = signal<any | null>(null);
  themeClass = 'ag-theme-quartz kowsar-ag-grid';

  columnDefs: ColDef[] = [
    {
      field: 'action',
      headerName: 'انتخاب',
      pinned: 'left',
      width: 100,
      cellRenderer: () =>
        '<button class="btn btn-sm btn-primary">انتخاب</button>',
    },
    {
      field: 'CentralRef',
      headerName: 'کد مشتری',
      width: 120,
      cellClass: 'text-center',
    },
    { field: 'CustName_Small', headerName: 'نام مشتری', flex: 1 },
    {
      field: 'Explain',
      headerName: 'توضیحات',
      width: 180,
      cellClass: 'text-center',
    },
    {
      field: 'Mobile',
      headerName: 'موبایل',
      width: 140,
      cellClass: 'text-center',
    },
    {
      field: 'Phone',
      headerName: 'تلفن',
      width: 140,
      cellClass: 'text-center',
    },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  localeText = {
    noRowsToShow: 'هیچ مشتری‌ای برای نمایش وجود ندارد',
  };

  private searchSub?: Subscription;
  private viewReady = false;

  private readonly fb = inject(FormBuilder);
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.searchForm = this.fb.group({
      query: [''],
    });
  }

  ngOnInit(): void {
    this.searchSub = this.searchForm
      .get('query')!
      .valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
      )
      .subscribe((value: string) => {
        const query = (value ?? '').trim();
        this.searchRequested.emit(query);
      });
  }

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
    this.searchSub?.unsubscribe();

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

    if (this.visible && !dialog.open) {
      dialog.showModal();
    } else if (!this.visible && dialog.open) {
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

  onSearch(): void {
    const query = this.searchForm.get('query')?.value?.trim() ?? '';
    this.searchRequested.emit(query);
  }

  onCellClicked(event: any): void {
    if (event.colDef.field === 'action') {
      this.selectCustomer.emit(event.data);
    }
  }

  onRowDoubleClicked(event: any): void {
    this.selectCustomer.emit(event.data);
  }
}
