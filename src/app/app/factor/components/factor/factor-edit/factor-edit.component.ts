import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { FactorWebApiService } from '../../../services/FactorWebApi.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CellActionFactorRowsEdit } from './cell-action-factorrows-edit';
import Swal from 'sweetalert2';
import { CellActionGoodEdit } from './cell-action-good-edit';
import { CellActionFactorCustomerEdit } from './cell-action-factor-customer-edit';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';

@Component({
  selector: 'app-factor-edit',
  templateUrl: './factor-edit.component.html',
})
export class FactorEditComponent extends AgGridBaseComponent
  implements OnInit {
  myForm: FormGroup;



  selectedfactor: any
  constructor(
    private readonly router: Router,
    private repo: FactorWebApiService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    private readonly notificationService: NotificationService,

  ) {
    super();


  }








  private timeStringToDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0); // set hours, minutes, seconds, and milliseconds
    return date;
  }





  Set_StartFactorTime() {
    this.Loading_Modal_Response_show()

    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;


    this.EditForm_factor_property.patchValue({
      starttime: timeString,

    });

    this.repo.Support_StartFactorTime(this.EditForm_factor_property.value).subscribe((data: any) => {
      this.notificationService.succeded("");
      location.reload();
    });


  }


  Set_EndFactorTime() {
    this.Loading_Modal_Response_show()

    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    this.EditForm_factor_property.patchValue({
      Endtime: timeString,

    });

    const start1 = this.timeStringToDate(this.EditForm_factor_property.value.starttime);
    const end1 = this.timeStringToDate(this.EditForm_factor_property.value.Endtime);
    let duration = (end1.getTime() - start1.getTime()) / 1000 / 60; // duration in minutes
    this.EditForm_factor_property.patchValue({
      worktime: duration + "",

    });

    if (duration < 0) {
      this.EditForm_factor_property.patchValue({
        worktime: "0",

      });
    }


    this.repo.Support_EndFactorTime(this.EditForm_factor_property.value).subscribe((data: any) => {

      location.reload();
    });



  }


  Set_ExplianFactorTime() {

    this.Loading_Modal_Response_show()

    this.repo.Support_ExplainFactor(this.EditForm_factor_property.value).subscribe((data: any) => {

      location.reload();
    });



  }





















  time: Date = new Date();
  onSubmit() {
    console.log(this.myForm.value);
  }
  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };



  AddGoodToBasket(GoodCode) {
    this.Loading_Modal_Response_show()
    this.GoodForm.patchValue({
      FactorRef: this.FactorCode,
      GoodRef: GoodCode,
    });

    this.repo.WebFactorInsertRow(this.GoodForm.value).subscribe((data: any) => {

      this.GetFactorrows()
    });

  }


  Start_FactorTime: string = '';
  End_FactorTime: string = '';


  FactorCode: string = '';
  CentralRef: string = '';
  JobPersonRef: string = '';

  ShowGoodList: boolean = false;

  Searchtarget_customer: string = '';
  Searchtarget_Good: string = '';


  records_good;
  records_factorrows;
  records_customer;

  title = 'فاکتور فروش';

  EditForm_factor_property = new FormGroup({
    starttime: new FormControl(''),
    Endtime: new FormControl(''),
    worktime: new FormControl(''),
    Barbary: new FormControl(''),
    ObjectRef: new FormControl('0'),

  });





  private searchSubject_customer: Subject<string> = new Subject();
  private searchSubject_Good: Subject<string> = new Subject();
  ngOnDestroy(): void {
    this.searchSubject_customer.unsubscribe();
    this.searchSubject_Good.unsubscribe();

  }

  onInputChange_Customer() {

    this.searchSubject_customer.next(this.Searchtarget_customer);
  }


  onInputChange_Good() {

    this.searchSubject_Good.next(this.Searchtarget_Good);


  }



















  override ngOnInit(): void {
    super.ngOnInit();

    this.route.paramMap.subscribe((params: ParamMap) => {
      var idtemp = params.get('id');
      if (idtemp != null) {
        this.FactorCode = idtemp;
        this.JobPersonRef = sessionStorage.getItem("JobPersonRef");
        this.CentralRef = sessionStorage.getItem("CentralRef");
      }
    });



    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionGoodEdit,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 100,
      },
      {
        field: 'GoodName',
        headerName: 'نام آیتم',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
    ];

    this.columnDefs2 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionFactorRowsEdit,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 100,
      },
      {
        field: 'GoodName',
        headerName: ' نام آیتم',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },
    ];

    this.columnDefs3 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionFactorCustomerEdit,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 80,
      },
      {
        field: 'CustName_Small',
        headerName: 'نام مشتری  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
        checkboxSelection: true,
      },
      {
        field: 'Manager',
        headerName: 'مدیریت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'پشتیبانی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
    ];

    if (this.FactorCode.length > 0) {
      this.GetFactor();
    } else {
      this.getdate();

    }



    this.searchSubject_customer.pipe(
      debounceTime(1000)  // 1 second debounce time
    ).subscribe(searchText => {
      this.GetCustomer();
    });



    this.searchSubject_Good.pipe(
      debounceTime(1000)  // 1 second debounce time
    ).subscribe(searchText => {
      this.GetGood();
    });



  }

  GetFactor() {

    this.Loading_Modal_Response_show()


    this.repo.GetWebFactorSupport(this.FactorCode).subscribe((data: any) => {
      this.selectedfactor = data.Factors[0]


      this.EditForm_Factor_Header.patchValue({
        FactorCode: data.Factors[0].FactorCode,
        FactorDate: data.Factors[0].FactorDate,
        CustName: data.Factors[0].CustName,
        CustomerCode: data.Factors[0].CustomerCode,
        Explain: data.Factors[0].Explain,
        BrokerName: data.Factors[0].BrokerName,
        BrokerRef: data.Factors[0].BrokerRef,
      });

      this.EditForm_factor_property.patchValue({
        starttime: data.Factors[0].starttime,
        Endtime: data.Factors[0].Endtime,
        worktime: data.Factors[0].worktime,
        Barbary: data.Factors[0].Barbary,
        ObjectRef: data.Factors[0].FactorCode,
      });


      this.Start_FactorTime = data.Factors[0].starttime
      this.End_FactorTime = data.Factors[0].Endtime




      if (this.Start_FactorTime.length == 0) {
        this.Set_StartFactorTime()
      }


    });



    this.GetFactorrows()

    this.GetGood()
  }
  GetFactorrows() {
    this.repo.GetWebFactorRowsSupport(this.FactorCode).subscribe((data: any) => {

      this.records_factorrows = data.Factors
      this.Loading_Modal_Response_close()

    });
  }


  getdate() {
    this.repo.GetTodeyFromServer().subscribe(e => {
      this.EditForm_Factor_Header.patchValue({
        FactorDate: e[0].TodeyFromServer,
      });
    });
  }




  EditForm_Factor_Header = new FormGroup({
    FactorCode: new FormControl(''),
    FactorDate: new FormControl(''),
    CustName: new FormControl(''),
    CustomerCode: new FormControl('', Validators.required),
    Explain: new FormControl(''),
    BrokerName: new FormControl(''),
    BrokerRef: new FormControl('0'),
  });

  GoodForm = new FormGroup({
    FactorRef: new FormControl(''),
    GoodRef: new FormControl(''),
  });






  Factor_Header_insert() {



    this.EditForm_Factor_Header.markAllAsTouched();
    if (!this.EditForm_Factor_Header.valid) return;
    this.Loading_Modal_Response_show()

    this.EditForm_Factor_Header.patchValue({
      BrokerRef: sessionStorage.getItem("BrokerCode")
    });
    this.repo.WebFactorInsert(this.EditForm_Factor_Header.value).subscribe((data: any) => {
      this.notificationService.succeded();

      this.router.navigate(['/factor/factor-edit', data.Factors[0].FactorCode]);


    });

  }








  GetGood() {
    this.repo.GetGoodListSupport(this.Searchtarget_Good).subscribe((data: any) => {
      this.records_good = data.Goods;
    });
  }
  taggelShowGoodList() {
    this.ShowGoodList = !this.ShowGoodList
  }




  @ViewChild('modalsearch') modalsearch: ElementRef;

  GetCustomer() {
    this.customer_dialog_show()
    this.loading = true;

    this.repo.GetKowsarCustomer(this.Searchtarget_customer).subscribe((data: any) => {
      this.records_customer = data.Customers;
      this.loading = false;

    });
  }

  Set_Customer() {
    console.log(this.selectedRows)
    this.EditForm_Factor_Header.patchValue({
      CustName: this.selectedRows[0].CustName_Small,
      CustomerCode: this.selectedRows[0].CustomerCode,
      BrokerName: sessionStorage.getItem("BrokerName")
    });
    this.selectedRows = []
    this.customer_dialog_close()
  }
  GoBack() {
    this.location.back();

  }



  loading: boolean = true;


  customer_dialog_show() {
    const modal = this.renderer.selectRootElement('#customerlist', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
    this.modalsearch.nativeElement.focus();

  }
  customer_dialog_close() {
    const modal = this.renderer.selectRootElement('#customerlist', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  deleteFactor() {
    if (this.records_factorrows && this.records_factorrows.length > 0) {

      this.notificationService.error('این فاکتور دارای اقلام می باشد');
    } else {
      this.fireDeleteFactor().then((result) => {
        if (result.isConfirmed) {
          this.deletefactorRecord()
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.notificationService.warning('اطلاعات تغییری نکرد');

        }
      });
    }

  }



  fireDeleteFactor() {
    return Swal.fire({
      title: 'آیا از حذف این ردیف اطمینان دارید؟',
      text: 'درصورت حذف دیگر قادر به بازیابی ردیف فوق نخواهید بود.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله، اطمینان دارم.',

      cancelButtonText: 'بستن پنجره',
      customClass: {
        confirmButton: 'btn btn-success mx-2',

        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
  }







  fireDeleteSwal1() {
    return Swal.fire({
      title: 'آیا از حذف این ردیف اطمینان دارید؟',
      text: 'درصورت حذف دیگر قادر به بازیابی ردیف فوق نخواهید بود.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله، اطمینان دارم.',
      cancelButtonText: 'خیر',
      customClass: {
        confirmButton: 'btn btn-success mx-2',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
  }



  delete(id) {
    this.fireDeleteSwal1().then((result) => {
      if (result.isConfirmed) {
        this.deleteRecord(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.notificationService.warning('اطلاعات تغییری نکرد');

      }
    });
  }

  deleteRecord(id) {


    this.repo.DeleteWebFactorRowsSupport(id).subscribe((data: any) => {
      this.GetFactorrows()

      this.notificationService.succeded('ردیف فوق با موفقیت حذف شد.');
    });



  }

  deletefactorRecord() {


    this.repo.DeleteWebFactorSupport(this.FactorCode).subscribe((data: any) => {
      this.notificationService.succeded('ردیف فوق با موفقیت حذف شد.');
      this.location.back();
    });



  }












  Customer_property = new FormGroup({
    AppNumber: new FormControl(''),
    DatabaseNumber: new FormControl(''),
    LockNumber: new FormControl(''),
    Address: new FormControl(''),
    CityName: new FormControl(''),
    OstanName: new FormControl(''),

    ObjectRef: new FormControl('0'),

  });


  Show_Customer_Property(CustomerCode) {

    this.property_dialog_show()
    this.records_customer.forEach((customer: any) => {

      if (customer.CustomerCode == CustomerCode) {
        this.Customer_property.patchValue({
          AppNumber: customer.AppNumber,
          DatabaseNumber: customer.DatabaseNumber,
          LockNumber: customer.LockNumber,
          ObjectRef: customer.CustomerCode,
          Address: customer.Address,
          CityName: customer.CityName,
          OstanName: customer.OstanName,

        });
      }


    })
  }









  property_dialog_show() {
    const modal = this.renderer.selectRootElement('#factorcustomerproperty', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  property_dialog_close() {
    const modal = this.renderer.selectRootElement('#factorcustomerproperty', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  factor_property_dialog_show() {

    // const inputElement1 = document.getElementById('datePickerstart') as HTMLInputElement;
    // inputElement1.value = this.selectedfactor.starttime;

    // const inputElement2 = document.getElementById('datePickerend') as HTMLInputElement;
    // inputElement2.value = this.selectedfactor.Endtime;



    const modal = this.renderer.selectRootElement('#factorproperty', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  factor_property_dialog_close() {
    const modal = this.renderer.selectRootElement('#factorproperty', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  Loading_Modal_Response_show() {
    const modal = this.renderer.selectRootElement('#loadingresponse', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  Loading_Modal_Response_close() {
    const modal = this.renderer.selectRootElement('#loadingresponse', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }






}



