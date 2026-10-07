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
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import 'src/app/app-shell/framework-components/ag-grid/ag-grid-enterprise-registration';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-letter-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AgGridModule],
  templateUrl: './letter-modal.component.html',
})
export class LetterModalComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('dialogElement')
  private dialogRef?: ElementRef<HTMLDialogElement>;

  @Input() visible = false;
  @Input() darkMode = false;
  @Input() records: any[] = [];
  @Input() person: any = null;

  @Output() close = new EventEmitter<void>();
  @Output() submitLetter = new EventEmitter<any>();
  @Output() requestSelectCustomer = new EventEmitter<void>();

  isNewLetter = signal(false);
  selectedLetter = signal<any | null>(null);

  form: FormGroup;
  themeClass = 'ag-theme-quartz kowsar-ag-grid';

  column_name_1: ColDef[] = [
    {
      field: 'LetterDate',
      headerName: 'تاریخ',
      width: 130,
      cellClass: 'text-center',
    },
    {
      field: 'RowLetterDescription',
      headerName: 'شرح تیکت',
      flex: 1,
    },
    {
      field: 'OwnerName',
      headerName: 'مشتری',
      width: 160,
      cellClass: 'text-center',
    },
    {
      field: 'RowLetterState',
      headerName: 'وضعیت',
      width: 130,
      cellClass: 'text-center',
    },
    {
      field: 'AutLetterRow_PropDescription1',
      headerName: 'شرح کار',
      flex: 1,
    },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  localeText = {
    noRowsToShow: 'هیچ تیکتی برای نمایش وجود ندارد',
  };

  private viewReady = false;
  private readonly fb = inject(FormBuilder);
  private readonly document = inject(DOCUMENT);

  constructor() {
    this.form = this.fb.group({
      LetterCode: [''],
      OwnerCentral: [''],
      OwnerName: [''],
      ExecuterCentral: [''],
      ExecuterName: [''],
      NumberPhone: [''],
      SendSms: ['0', Validators.required],
      LetterDescriptionText: [''],
      DescriptionText: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['person'] && this.person) {
      this.fillFromPerson(this.person);
    }

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

  private fillFromPerson(person: any): void {
    if (!person) {
      return;
    }

    this.form.patchValue({
      ExecuterCentral: person?.CentralRef ?? '',
      ExecuterName: person?.CentralName ?? person?.FullName ?? '',
      NumberPhone: person?.EconomyCode ?? '',
    });
  }

  startNewLetter(): void {
    this.isNewLetter.set(true);
    this.selectedLetter.set(null);

    this.form.reset({
      LetterCode: '',
      OwnerCentral: '',
      OwnerName: '',
      ExecuterCentral: this.person?.CentralRef ?? '',
      ExecuterName: this.person?.CentralName ?? this.person?.FullName ?? '',
      NumberPhone: this.person?.EconomyCode ?? '',
      SendSms: '0',
      LetterDescriptionText: '',
      DescriptionText: '',
    });
  }

  cancelNewLetter(): void {
    this.isNewLetter.set(false);
    this.selectedLetter.set(null);
    this.form.reset();
    this.fillFromPerson(this.person);
  }

  onRowClicked(event: any): void {
    const row = event.data;

    this.isNewLetter.set(true);
    this.selectedLetter.set(row);

    this.form.patchValue({
      LetterCode: row?.LetterCode ?? '',
      OwnerCentral: row?.OwnerCentral ?? '',
      OwnerName: row?.OwnerName ?? '',
      ExecuterCentral: this.person?.CentralRef ?? '',
      ExecuterName: this.person?.CentralName ?? this.person?.FullName ?? '',
      NumberPhone: this.person?.EconomyCode ?? '',
      SendSms: '0',
      LetterDescriptionText: row?.LetterDescription ?? '',
      DescriptionText: '',
    });
  }

  openCustomerPicker(): void {
    if (this.form.value.LetterCode?.length > 0) {
      return;
    }

    this.requestSelectCustomer.emit();
  }

  public patchSelectedCustomer(customer: any): void {
    if (!customer) {
      return;
    }

    const ownerCentral =
      customer.CentralRef ??
      customer.CustomerRef ??
      customer.OwnerCentral ??
      '';

    const ownerName =
      customer.CustName_Small ??
      customer.Name ??
      customer.OwnerName ??
      '';

    this.form.patchValue({
      OwnerCentral: ownerCentral,
      OwnerName: ownerName,
    });
  }

  sanitizeDescriptionText(event: Event): void {
    const input = event.target as HTMLTextAreaElement;

    if (!input) {
      return;
    }

    const cleaned = input.value.replace(/[<>]/g, '');

    if (cleaned !== input.value) {
      this.form.patchValue(
        { DescriptionText: cleaned },
        { emitEvent: false },
      );
    }
  }

  saveLetter(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitLetter.emit(this.form.getRawValue());
  }
}
