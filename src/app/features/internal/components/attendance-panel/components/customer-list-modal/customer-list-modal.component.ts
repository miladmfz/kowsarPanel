/* ===============================================================
   📘 CustomerListModalComponent
   توضیحات کلی:
   این کامپوننت برای نمایش، جستجو و انتخاب مشتریان در یک مودال طراحی شده است.
   شامل فرم جستجو، گرید داده‌ها، و رویدادهای تعامل با Parent می‌باشد.

   ویژگی‌ها:
   1️⃣ امکان جستجو با ارسال درخواست به Parent (searchRequested)
   2️⃣ انتخاب مشتری از طریق دکمه یا دابل‌کلیک روی ردیف
   3️⃣ پشتیبانی از تم روشن و تیره (darkMode)
   4️⃣ ساختار گرید واکنش‌گرا و قابل فیلتر، مرتب‌سازی و تغییر اندازه
   =============================================================== */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-customer-list-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AgGridModule],
  templateUrl: './customer-list-modal.component.html',
})
export class CustomerListModalComponent implements OnInit, OnDestroy {

  // ===============================================================
  //    ورودی‌ها
  // ===============================================================

  @Input() visible = false;
  @Input() darkMode = false;
  @Input() records: any

  // ===============================================================
  //   خروجی‌ها
  // ===============================================================

  @Output() close = new EventEmitter<void>();
  @Output() selectCustomer = new EventEmitter<any>();
  @Output() searchRequested = new EventEmitter<string>();

  // ===============================================================
  // 🧾 فرم جستجو
  // ===============================================================

  searchForm: FormGroup;

  // برای نگه‌داشتن Subscription مربوط به debounce
  private searchSub?: Subscription;

  // ===============================================================
  // 👤 وضعیت انتخاب مشتری
  // ===============================================================

  selectedCustomer = signal<any | null>(null);
  themeClass = 'ag-theme-quartz kowsar-ag-grid';

  // ===============================================================
  //   تنظیمات گرید
  // ===============================================================

  columnDefs: ColDef[] = [
    {
      field: 'action',
      headerName: 'انتخاب',
      pinned: 'left',
      width: 100,
      cellRenderer: () =>
        `<button class="btn btn-sm btn-primary">انتخاب</button>`,
    },
    { field: 'CentralRef', headerName: 'کد مشتری', width: 120, cellClass: 'text-center' },
    { field: 'CustName_Small', headerName: 'نام مشتری', flex: 1 },
    { field: 'Explain', headerName: 'توضیحات', width: 180, cellClass: 'text-center' },
    { field: 'Mobile', headerName: 'موبایل', width: 140, cellClass: 'text-center' },
    { field: 'Phone', headerName: 'تلفن', width: 140, cellClass: 'text-center' },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  localeText = {
    noRowsToShow: 'هیچ مشتری‌ای برای نمایش وجود ندارد',
  };

  // ===============================================================
  // 🧱 سازنده
  // ===============================================================
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.searchForm = this.fb.group({
      query: [''],
    });
  }

  // ===============================================================
  //   Lifecycle
  // ===============================================================

  ngOnInit(): void {
    // دیباونس روی تغییرات فیلد جستجو
    this.searchSub = this.searchForm.get('query')!
      .valueChanges
      .pipe(
        debounceTime(500),       // ⏱ مکث ۵۰۰ میلی‌ثانیه بین تایپ‌ها
        distinctUntilChanged(),  // فقط اگر مقدار واقعاً تغییر کرده باشد
      )
      .subscribe((value: string) => {
        const query = (value ?? '').trim();
        this.searchRequested.emit(query);
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  // ===============================================================
  //   جستجو (روی Submit فرم / دکمه)
  // ===============================================================

  onSearch(): void {
    const query = this.searchForm.get('query')?.value?.trim() ?? '';
    this.searchRequested.emit(query);
  }

  // ===============================================================
  // 🖱️ انتخاب مشتری از گرید
  // ===============================================================
  onCellClicked(event: any): void {
    if (event.colDef.field === 'action') {
      this.selectCustomer.emit(event.data);
    }
  }

  // ===============================================================
  // 🖱️ دابل کلیک روی ردیف گرید
  // ===============================================================
  onRowDoubleClicked(event: any): void {
    this.selectCustomer.emit(event.data);
  }

  // ===============================================================
  // ❌ بستن مودال
  // ===============================================================

  onCloseClicked(): void {
    this.close.emit();
  }
}
