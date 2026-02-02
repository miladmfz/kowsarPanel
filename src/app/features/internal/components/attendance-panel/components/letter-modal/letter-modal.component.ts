/* ===============================================================
   📘 LetterModalComponent
   توضیحات کلی:
   این کامپوننت مسئول نمایش، مدیریت و ایجاد تیکت کارشناسان است.
   شامل قابلیت‌های زیر می‌باشد:
   1️⃣ نمایش گرید تیکت‌ها با ag-grid  
   2️⃣ امکان انتخاب، ایجاد یا ادامه‌ی تیکت موجود  
   3️⃣ ارتباط با مودال انتخاب مشتری  
   4️⃣ اعتبارسنجی فرم و ارسال داده‌ها به والد  

   ساختار داخلی:
   - ورودی‌ها: وضعیت نمایش، تم، داده‌های تیکت‌ها، و اطلاعات کارشناس
   - خروجی‌ها: بستن مودال، ارسال فرم تیکت، درخواست انتخاب مشتری
   - سیگنال‌ها: وضعیت تیکت جدید و تیکت انتخاب‌شده
   =============================================================== */

import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-letter-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AgGridModule],
  templateUrl: './letter-modal.component.html',
})
export class LetterModalComponent implements OnChanges {
  // ===============================================================
  //    ورودی‌ها
  // ===============================================================
  @Input() visible = false;
  @Input() darkMode = false;
  @Input() records: any[] = [];
  @Input() person: any = null; // اطلاعات کارشناس از والد (selectedPerson)

  // ===============================================================
  //   خروجی‌ها
  // ===============================================================
  @Output() close = new EventEmitter<void>();
  @Output() submitLetter = new EventEmitter<any>();
  @Output() requestSelectCustomer = new EventEmitter<void>(); // باز کردن مودال مشتری‌ها

  // ===============================================================
  //    وضعیت داخلی
  // ===============================================================
  isNewLetter = signal(false);
  selectedLetter = signal<any | null>(null);
  form: FormGroup;

  // ===============================================================
  //   تنظیمات گرید
  // ===============================================================
  columnDefs: ColDef[] = [
    { field: 'LetterDate', headerName: 'تاریخ', width: 130, cellClass: 'text-center' },
    { field: 'RowLetterDescription', headerName: 'شرح تیکت', flex: 1 },
    { field: 'OwnerName', headerName: 'مشتری', width: 160, cellClass: 'text-center' },
    { field: 'RowLetterState', headerName: 'وضعیت', width: 130, cellClass: 'text-center' },
    { field: 'AutLetterRow_PropDescription1', headerName: 'شرح کار', flex: 1 },
  ];

  defaultColDef: ColDef = { sortable: true, resizable: true, filter: true };
  localeText = { noRowsToShow: 'هیچ تیکتی برای نمایش وجود ندارد' };

  // ===============================================================
  // 🧱 سازنده
  // ===============================================================

  private readonly fb = inject(FormBuilder);

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

  // ===============================================================
  // 🧠 تغییر ورودی person
  // ===============================================================
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['person'] && this.person) this.fillFromPerson(this.person);
  }

  /** 📋 پر کردن فرم از اطلاعات کارشناس انتخاب‌شده */
  private fillFromPerson(p: any): void {
    if (!p) return;
    this.form.patchValue({
      ExecuterCentral: p?.CentralRef ?? '',
      ExecuterName: p?.FullName ?? '',
      NumberPhone: p?.PhMobile1 ?? '',
    });
    console.log(`📋 فرم از person پر شد → ${p.FullName} (${p.CentralRef})`);
  }

  // ===============================================================
  // ➕ ایجاد تیکت جدید
  // ===============================================================
  startNewLetter(): void {
    this.isNewLetter.set(true);
    this.selectedLetter.set(null);

    this.form.reset({
      LetterCode: '',
      OwnerCentral: '',
      OwnerName: '',
      ExecuterCentral: this.person?.CentralRef ?? '',
      ExecuterName: this.person?.FullName ?? '',
      NumberPhone: this.person?.PhMobile1 ?? '',
      SendSms: '0',
      LetterDescriptionText: '',
      DescriptionText: '',
    });
  }

  /** ❌ لغو ساخت تیکت جدید */
  cancelNewLetter(): void {
    this.isNewLetter.set(false);
    this.selectedLetter.set(null);
    this.form.reset();
    this.fillFromPerson(this.person);
  }

  // ===============================================================
  //   انتخاب تیکت از گرید
  // ===============================================================
  onRowClicked(e: any): void {
    const r = e.data;
    this.isNewLetter.set(true);
    this.selectedLetter.set(r);

    this.form.patchValue({
      LetterCode: r?.LetterCode ?? '',
      OwnerCentral: r?.OwnerCentral ?? '',
      OwnerName: r?.OwnerName ?? '',
      ExecuterCentral: this.person?.CentralRef ?? '',
      ExecuterName: this.person?.FullName ?? '',
      NumberPhone: this.person?.PhMobile1 ?? '',
      SendSms: '0',
      LetterDescriptionText: r?.LetterDescription ?? '',
      DescriptionText: '',
    });
  }

  // ===============================================================
  //   مشتریان
  // ===============================================================
  /**   باز کردن مودال انتخاب مشتری */
  openCustomerPicker(): void {
    if (this.form.value.LetterCode?.length > 0) return;
    this.requestSelectCustomer.emit();
  }

  /** 👤 وقتی مشتری از مودال انتخاب شد */
  public patchSelectedCustomer(customer: any): void {
    if (!customer) return;

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

    console.log(`  مشتری انتخاب شد → ${ownerName} (${ownerCentral})`);
  }

  // ===============================================================
  // 🧹 پاکسازی ورودی
  // ===============================================================
  sanitizeDescriptionText(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    if (!input) return;

    const cleaned = input.value.replace(/[<>]/g, '');
    if (cleaned !== input.value) {
      this.form.patchValue({ DescriptionText: cleaned }, { emitEvent: false });
    }
  }

  // ===============================================================
  // 📤 ارسال فرم
  // ===============================================================
  saveLetter(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitLetter.emit(this.form.value);
  }
}
