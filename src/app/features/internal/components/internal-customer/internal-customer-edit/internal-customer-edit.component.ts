import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { AgGridAngular } from 'ag-grid-angular';
import { CustomerWebApiService } from '../../../services/CustomerWebApi.service';

@Component({
  selector: 'app-internal-customer-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AgGridAngular
  ],
  templateUrl: './internal-customer-edit.component.html',
})
export class InternalCustomerEditComponent extends AgGridBaseComponent implements OnInit {


  private readonly router = inject(Router);

  private readonly repo = inject(CustomerWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  constructor() { super(); }

  title = 'فرم اطلاعات اپلیکیشن';
  SingleItems: any[] = [];
  records_city: any;
  CustomerCode: string = '';

  City_array: any[] = [];

  // فرم‌های صفحه
  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
  });
  private searchSubject = new Subject<string>();

  onSearchChange() {
    const value = this.EditForm_SearchTarget.get('SearchTarget')?.value ?? '';
    this.searchSubject.next(value);
  }
  EditForm_Customer = new FormGroup({
    CustomerCode: new FormControl(''),
    FName: new FormControl('', Validators.required),
    LName: new FormControl('', Validators.required),
    CityCode: new FormControl(''),
    CityName: new FormControl('', Validators.required),
    Address: new FormControl(''),
    Phone: new FormControl('', Validators.required),
    Mobile: new FormControl(''),
    Email: new FormControl(''),
    Explain: new FormControl(''),
    ZipCode: new FormControl(''),
  });


  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const idStr = params.get('id');       // رشته
      this.CustomerCode = idStr
      const idNum = Number(idStr);          // فقط برای مقایسه

      if (!idStr || idNum === 0) {
        // حالت ایجاد
        this.CustomerCode = "0"
        this.title = "ایجاد مشتری جدید";
      } else {
        // حالت اصلاح
        this.CustomerCode = idStr;        // رشته ذخیره می‌شود
        this.getDetails();
        this.title = "اصلاح مشتری";
      }
    });



    this.initialdata()

    this.searchSubject
      .pipe(debounceTime(1000))
      .subscribe(() => this.GetCity());
  }

  initialdata() {

    this.GetCity()
    this.columnDefs3 = [

      {
        field: 'CityCode',
        headerName: 'نام مشتری  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'Name',
        headerName: 'مدیریت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];
  }

  CallCity() {

    this.city_dialog_show()
    this.GetCity()


  }

  Searchtarget_city: string = '';
  selectedRows: any[] = [];


  onInputChange_City() {
    this.searchSubject.next(this.Searchtarget_city);
  }

  onSelectionChanged(event: any) {
    this.selectedRows = event.api.getSelectedRows();
  }

  Set_City() {

    this.EditForm_Customer.patchValue({
      CityCode: this.selectedRows[0].CityCode,
      CityName: this.selectedRows[0].Name,
    });
    this.selectedRows = []
    this.city_dialog_close()
  }

  GetCity() {


    this.EditForm_SearchTarget.patchValue({
      SearchTarget: this.Searchtarget_city,
    });


    this.repo.GetCity(this.EditForm_SearchTarget.value)
      .subscribe((data: any) => {



        this.records_city = data?.Citys ?? [];;
        this.updateGridData(3, this.records_city);

      });

  }

  getDetails() {

    this.repo.GetCustomerByCode(this.CustomerCode)
      .subscribe((data: any) => {

        this.EditForm_Customer.patchValue({
          CustomerCode: data?.Customers[0].CustomerCode,
          FName: data?.Customers[0].FName,
          LName: data?.Customers[0].Name,
          CityCode: data?.Customers[0].CityCode,
          CityName: data?.Customers[0].CityName,
          Address: data?.Customers[0].Address,
          Phone: data?.Customers[0].Phone,
          Mobile: data?.Customers[0].Mobile,
          Email: data?.Customers[0].Email,
          Explain: data?.Customers[0].Explain,

        });
      });
  }

  onBtnCancelClick() {
    this.router.navigate(['/internal/internal-customer-list']);
  }

  submit(action: string) {

    this.EditForm_Customer.markAllAsTouched();
    if (!this.EditForm_Customer.valid) return;

    if (Number(this.CustomerCode) > 0) {
      this.notificationService.warning('اصلاح مشتری غیر فعال می باشد');





      this.repo.CustomerCrud(this.EditForm_Customer.value)
        .subscribe((data: any) => {

          if (data.Customers[0].CustomerCode.length > 0) {
            // this.router.navigate(['/internal/internal-customer-edit', data.Customers[0].CustomerCode]);
            this.router.navigate(['/internal/internal-customer-list']);
            this.notificationService.success('اطلاعات با موفقیت ذخیره شد');
          }
        });


    } else {

      this.EditForm_Customer.patchValue({
        CustomerCode: this.CustomerCode,

      });


      this.repo.CustomerCrud(this.EditForm_Customer.value)
        .subscribe((data: any) => {

          if (data.Customers[0].CustomerCode.length > 0) {
            // this.router.navigate(['/internal/internal-customer-edit', data.Customers[0].CustomerCode]);
            this.router.navigate(['/internal/internal-customer-list']);
            this.notificationService.success('اطلاعات با موفقیت ذخیره شد');
          }
        });


    }
  }


  city_dialog_show() { this.toggleModal('#citylist', true); }
  city_dialog_close() { this.toggleModal('#citylist', false); }



  toggleModal(selector: string, show: boolean) {
    const modal: any = document.querySelector(selector);
    if (!modal) return;

    if (show) {
      // BACKDROP بساز
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade';
      backdrop.id = selector.replace('#', '') + '-backdrop';
      document.body.appendChild(backdrop);

      // کمی تاخیر برای fade
      setTimeout(() => backdrop.classList.add('show'), 10);

      // مودال را باز کن
      modal.classList.add('show', 'd-block');
      modal.removeAttribute('aria-hidden');
      modal.setAttribute('aria-modal', 'true');
      modal.style.display = 'block';

      // بستن با کلیک روی بک‌دراپ
      backdrop.addEventListener('click', () => this.toggleModal(selector, false));
    }
    else {
      // مودال را ببند
      modal.classList.remove('show');
      setTimeout(() => {
        modal.classList.remove('d-block');
        modal.style.display = 'none';
      }, 150);

      modal.setAttribute('aria-hidden', 'true');
      modal.removeAttribute('aria-modal');

      // بک‌دراپ را حذف کن
      const backdrop = document.getElementById(selector.replace('#', '') + '-backdrop');
      if (backdrop) {
        backdrop.classList.remove('show');
        setTimeout(() => backdrop.remove(), 150);
      }
    }
  }
}
