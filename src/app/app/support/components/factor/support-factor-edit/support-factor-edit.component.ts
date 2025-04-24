import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { debounceTime, Subject } from 'rxjs';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { CellActionSupportGoodEdit } from './cell-action-support-good-edit';
import { CellActionSupportFactorRowsEdit } from './cell-action-support-factorrows-edit';
import { CellActionSupportFactorCustomerEdit } from './cell-action-support-factor-customer-edit';
import { Location } from '@angular/common';

import Swal from 'sweetalert2';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';

@Component({
  selector: 'app-support-factor-edit',
  templateUrl: './support-factor-edit.component.html',
})
export class SupportFactorEditComponent extends AgGridBaseComponent
  implements OnInit {


  constructor(
    private readonly router: Router,
    private repo: SupportFactorWebApiService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private readonly notificationService: NotificationService,

  ) { super(); }

  changeStatus(status: string) {
    this.sharedService.sendData({
      from: 'dashboard',
      action: 'status-change',
      value: status
    });
  }

  priceInput = new Subject<void>();
  discountInput = new Subject<void>();

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

    this.Config_Declare()
    this.pipe_function()

    if (this.FactorCode.length > 0) {
      this.GetFactor();
    } else {
      this.getdate();

    }
    this.priceInput.pipe(debounceTime(1000)).subscribe(() => {
      this.cal_takhfif_from_price();
    });

    // تنظیم تأخیر برای ورودی تخفیف
    this.discountInput.pipe(debounceTime(1000)).subscribe(() => {
      this.cal_price_from_takhfif();
    });

  }


  // #region Declare


  loading: boolean = true;


  title = 'فاکتور پشتیبانی';
  Start_FactorTime: string = '';
  End_FactorTime: string = '';
  FactorCode: string = '';
  CentralRef: string = '';
  JobPersonRef: string = '';
  Searchtarget_customer: string = '';
  Searchtarget_Good: string = '';

  @ViewChild('modalsearch') modalsearch: ElementRef;



  time: Date = new Date();

  myForm: FormGroup;
  selectedfactor: any

  ShowGoodList: boolean = false;


  records_support_good;
  records_support_factorrows;
  records_support_customer;

  private searchSubject_customer: Subject<string> = new Subject();
  private searchSubject_Good: Subject<string> = new Subject();


  EditForm_supportfactor_property = new FormGroup({
    starttime: new FormControl(''),
    Endtime: new FormControl(''),
    worktime: new FormControl(''),
    Barbary: new FormControl(''),
    ObjectRef: new FormControl('0'),

  });


  Customer_property = new FormGroup({
    AppNumber: new FormControl(''),
    DatabaseNumber: new FormControl(''),
    LockNumber: new FormControl(''),
    Address: new FormControl(''),
    CityName: new FormControl(''),
    OstanName: new FormControl(''),
    ObjectRef: new FormControl('0'),

  });

  EditForm_Factor_Header = new FormGroup({
    FactorCode: new FormControl(''),
    FactorDate: new FormControl(''),
    CustName: new FormControl(''),
    CustomerCode: new FormControl('', Validators.required),
    Explain: new FormControl(''),
    BrokerName: new FormControl(''),
    BrokerRef: new FormControl('0'),
    ClassName: new FormControl('Factor'),
    StackRef: new FormControl('1'),
    isShopFactor: new FormControl('0'),
  });


  EditForm_Factor_Row = new FormGroup({
    FactorRef: new FormControl(''),
    GoodRef: new FormControl(''),
    GoodName: new FormControl(''),
    ClassName: new FormControl('Factor'),
    Amount: new FormControl(''),
    Price: new FormControl(''),
    MustHasAmount: new FormControl('0'),
    MergeFlag: new FormControl('1'),

    maxsellprice: new FormControl('1111111'),
    goodname: new FormControl('goodname'),
    takhfif: new FormControl('0'),
    pricetype: new FormControl('pricetype'),
    totalprice: new FormControl('totalprice'),
    DefaultRatioValue: new FormControl('1'),
    DefaultUnitValue: new FormControl('1'),
  });


  Good_maxsellprice: string = 'Good_maxsellprice';
  Good_goodname: string = 'Good_goodname';
  Good_takhfif: string = 'Good_takhfif';
  Good_pricetype: string = 'Good_pricetype';
  Good_totalprice: string = 'Good_totalprice';


  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };


  EditForm_Attendance = new FormGroup({
    CentralRef: new FormControl(''),
    Status: new FormControl(''),
  });

  Config_Declare() {

    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionSupportGoodEdit,
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
        cellRenderer: CellActionSupportFactorRowsEdit,
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
        cellRenderer: CellActionSupportFactorCustomerEdit,
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



  }


  pipe_function() {
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



  // #endregion






  // #region Func


  NewFactor() {
    this.router.navigate(['/support/support-factor-edit']);
  }



  timeStringToDate(timeString: string): Date {
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


    this.EditForm_supportfactor_property.patchValue({
      starttime: timeString,

    });

    this.repo.Support_StartFactorTime(this.EditForm_supportfactor_property.value).subscribe((data: any) => {


      this.EditForm_Attendance.patchValue({
        CentralRef: sessionStorage.getItem("CentralRef"),
        Status: "2" //busy
      });

      this.repo.ManualAttendance(this.EditForm_Attendance.value).subscribe((data: any) => {
        this.notificationService.succeded();
        this.Loading_Modal_Response_close()
        this.GetFactor()

        this.sharedService.triggerActionAll('refresh');

      });





    });


  }


  Set_EndFactorTime() {


    if (this.records_support_factorrows && this.records_support_factorrows.length > 0) {

      this.Loading_Modal_Response_show()

      const currentTime = new Date();
      const hours = currentTime.getHours().toString().padStart(2, '0');
      const minutes = currentTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      this.EditForm_supportfactor_property.patchValue({
        Endtime: timeString,

      });

      const start1 = this.timeStringToDate(this.EditForm_supportfactor_property.value.starttime);
      const end1 = this.timeStringToDate(this.EditForm_supportfactor_property.value.Endtime);
      let duration = (end1.getTime() - start1.getTime()) / 1000 / 60; // duration in minutes
      this.EditForm_supportfactor_property.patchValue({
        worktime: duration + "",

      });

      if (duration < 0) {
        this.EditForm_supportfactor_property.patchValue({
          worktime: "0",

        });
      }


      this.repo.Support_EndFactorTime(this.EditForm_supportfactor_property.value).subscribe((data: any) => {

        this.EditForm_Attendance.patchValue({
          CentralRef: sessionStorage.getItem("CentralRef"),
          Status: "1" //hozor
        });

        this.repo.ManualAttendance(this.EditForm_Attendance.value).subscribe((data: any) => {
          this.notificationService.succeded();
          this.Loading_Modal_Response_close()
          this.GetFactor()

          this.sharedService.triggerActionAll('refresh');

        });


      });


    } else {
      this.notificationService.error1("هیچ ردیفی برای این فاکتور زده نشده", "اخطار");
    }


  }


  Set_ExplianFactorTime() {

    this.Loading_Modal_Response_show()

    this.repo.Support_ExplainFactor(this.EditForm_supportfactor_property.value).subscribe((data: any) => {

      this.notificationService.succeded();
      this.Loading_Modal_Response_close()
      this.factor_property_dialog_close()
      this.GetFactor()
    });



  }




  insert_FactorRows() {

    this.EditForm_Factor_Row.patchValue({
      Amount: this.EditForm_Factor_Row.value.Amount + "",
      Price: this.EditForm_Factor_Row.value.Price + "",
      takhfif: this.EditForm_Factor_Row.value.takhfif + "",
    });


    this.Loading_Modal_Response_show()

    this.repo.WebFactorInsertRow(this.EditForm_Factor_Row.value).subscribe((data: any) => {


      this.notificationService.succeded();
      this.boxbuy_dialog_close()
      this.Loading_Modal_Response_close()
      this.GetFactor()
    });

  }


  cal_takhfif_from_price() {
    let price = parseFloat(this.EditForm_Factor_Row.value.Price) || 0;
    let maxsellprice = parseFloat(this.EditForm_Factor_Row.value.maxsellprice) || 0;

    if (maxsellprice > 0) {
      let discount = ((maxsellprice - price) / maxsellprice) * 100;
      this.EditForm_Factor_Row.patchValue({
        takhfif: discount.toFixed(2)
      });
    }

    this.cal_totalprice();
  }

  cal_price_from_takhfif() {
    let discount = parseFloat(this.EditForm_Factor_Row.value.takhfif) || 0;
    let maxsellprice = parseFloat(this.EditForm_Factor_Row.value.maxsellprice) || 0;

    if (maxsellprice > 0) {
      let price = maxsellprice * (1 - discount / 100);
      this.EditForm_Factor_Row.patchValue({
        Price: price.toFixed(2)
      });
    }

    this.cal_totalprice();
  }

  cal_totalprice() {
    let Amount_temp = parseFloat(this.EditForm_Factor_Row.value.Amount);
    let Price_temp = parseFloat(this.EditForm_Factor_Row.value.Price);
    let DefaultRatioValue_temp = parseFloat(this.EditForm_Factor_Row.value.DefaultRatioValue);
    let DefaultUnitValue_temp = parseFloat(this.EditForm_Factor_Row.value.DefaultUnitValue);

    let totalPrice_temp = Amount_temp * Price_temp * DefaultRatioValue_temp * DefaultUnitValue_temp

    this.EditForm_Factor_Row.patchValue({
      totalprice: "" + totalPrice_temp,
    });

  }


  AddGoodToBasket(good) {

    this.EditForm_Factor_Row.patchValue({

      FactorRef: this.FactorCode,
      GoodRef: good.GoodCode,

      GoodName: good.GoodName,
      ClassName: 'Factor',
      Amount: '0',
      Price: '0',

      maxsellprice: good.MaxSellPrice,
      goodname: good.GoodName,
      takhfif: '0',
      totalprice: '0',
      DefaultRatioValue: good.DefaultRatioValue,
      DefaultUnitValue: good.DefaultUnitValue
    });


    //this.boxbuy_dialog_show();
    this.insert_FactorRows()
  }



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



  Factor_Header_insert() {



    this.EditForm_Factor_Header.markAllAsTouched();
    if (!this.EditForm_Factor_Header.valid) return;
    this.Loading_Modal_Response_show()

    this.EditForm_Factor_Header.patchValue({
      BrokerRef: sessionStorage.getItem("BrokerCode")
    });



    //this.repo.WebFactorInsert(this.EditForm_Factor_Header.value).subscribe((data: any) => {

    this.repo.WebSupportFactorInsert(this.EditForm_Factor_Header.value).subscribe((data: any) => {
      this.FactorCode = data.Factors[0].FactorCode

      this.notificationService.succeded();

      this.router.navigate(['/support/support-factor-edit', data.Factors[0].FactorCode]);
      //this.Loading_Modal_Response_close()
      //this.GetFactor()

    });

  }


  taggelShowGoodList() {
    this.ShowGoodList = !this.ShowGoodList
  }

  Set_Customer() {
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




  deleteFactor() {
    if (this.records_support_factorrows && this.records_support_factorrows.length > 0) {

      this.notificationService.error('این فاکتور دارای اقلام می باشد', "خطا");


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

        this.repo.DeleteWebFactorRowsSupport(id).subscribe((data: any) => {
          this.GetFactorrows()
          this.notificationService.succeded('ردیف فوق با موفقیت حذف شد.');
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.notificationService.warning('اطلاعات تغییری نکرد');
      }
    });
  }

  deletefactorRecord() {
    this.repo.DeleteWebFactorSupport(this.FactorCode).subscribe((data: any) => {


      this.EditForm_Attendance.patchValue({
        CentralRef: sessionStorage.getItem("CentralRef"),
        Status: "1" //hozor
      });

      this.repo.ManualAttendance(this.EditForm_Attendance.value).subscribe((data: any) => {
        this.notificationService.succeded('ردیف فوق با موفقیت حذف شد.');
        this.location.back();

        this.sharedService.triggerActionAll('refresh');
      });

    });
  }



  Show_Customer_Property(CustomerCode) {

    this.property_dialog_show()
    this.records_support_customer.forEach((customer: any) => {

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
  // #endregion






  // #region Get_Data

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

      this.EditForm_supportfactor_property.patchValue({
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

      this.records_support_factorrows = data.Factors
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


  GetGood() {
    this.repo.GetGoodListSupport(this.Searchtarget_Good).subscribe((data: any) => {
      this.records_support_good = data.Goods;
    });
  }

  GetCustomer() {
    this.customer_dialog_show()
    this.loading = true;

    this.repo.GetKowsarCustomer(this.Searchtarget_customer).subscribe((data: any) => {
      this.records_support_customer = data.Customers;
      this.loading = false;

    });
  }

  // #endregion







  // #region Modal


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



  boxbuy_dialog_show() {

    const modal = this.renderer.selectRootElement('#boxbuymodal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  boxbuy_dialog_close() {
    const modal = this.renderer.selectRootElement('#boxbuymodal', true);
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



  // #endregion








}



