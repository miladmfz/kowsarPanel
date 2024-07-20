import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { FactorWebApiService } from '../../../services/FactorWebApi.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CellActionFactorRowsEdit } from './cell-action-factorrows-edit';
import Swal from 'sweetalert2';
import { CellActionGoodEdit } from './cell-action-good-edit';
import { CellActionFactorCustomerEdit } from './cell-action-factor-customer-edit';
import { Location } from '@angular/common';

@Component({
  selector: 'app-factor-edit',
  templateUrl: './factor-edit.component.html',
})
export class FactorEditComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: FactorWebApiService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private location: Location,
  ) {
    super();
  }


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



  onInputChange_Customer() {
    if (this.Searchtarget_customer == "") {
      this.Searchtarget_customer = ""
    }
    this.GetCustomer()

  }

  onInputChange_Good() {
    if (this.Searchtarget_Good == "") {
      this.Searchtarget_Good = ""
    }
    this.GetGood()

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


  }

  GetFactor() {



    this.repo.GetWebFactorSupport(this.FactorCode).subscribe((data: any) => {
      this.EditForm_Factor_Header.patchValue({
        FactorCode: data.Factors[0].FactorCode,
        FactorDate: data.Factors[0].FactorDate,
        CustName: data.Factors[0].CustName,
        CustomerCode: data.Factors[0].CustomerCode,
        Explain: data.Factors[0].Explain,
        BrokerName: data.Factors[0].BrokerName,
        BrokerRef: data.Factors[0].BrokerRef,
      });
    });



    this.GetFactorrows()

    this.GetGood()
  }
  GetFactorrows() {
    this.repo.GetWebFactorRowsSupport(this.FactorCode).subscribe((data: any) => {

      this.records_factorrows = data.Factors

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

  AddGoodToBasket(GoodCode) {
    this.GoodForm.patchValue({
      FactorRef: this.FactorCode,
      GoodRef: GoodCode,
    });

    this.repo.WebFactorInsertRow(this.GoodForm.value).subscribe((data: any) => {
      this.GetFactorrows()
    });

  }




  Factor_Header_insert() {

    this.EditForm_Factor_Header.markAllAsTouched();
    if (!this.EditForm_Factor_Header.valid) return;

    this.EditForm_Factor_Header.patchValue({
      BrokerRef: sessionStorage.getItem("BrokerCode")
    });
    this.repo.WebFactorInsert(this.EditForm_Factor_Header.value).subscribe((data: any) => {
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

      this.fireAlarmFactorRow().then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          this.dismissDeleteSwal1(result);
        }
      });

    } else {
      this.fireDeleteFactor().then((result) => {
        if (result.isConfirmed) {
          this.deletefactorRecord()
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.dismissDeleteSwal1(result);
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




  fireAlarmFactorRow() {
    return Swal.fire({
      title: 'این فاکتور دارای اقلام می باشد',
      icon: 'warning',
      showCancelButton: false,
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

  fireDeleteSucceededSwal1() {
    Swal.fire({
      title: 'ردیف فوق با موفقیت حذف شد.',
      icon: 'success',
    });
  }

  dismissDeleteSwal1(t) {
    if (t.dismiss === Swal.DismissReason.cancel) {
      Swal.fire('کنسل شد', 'اطلاعات تغییری نکرد', 'error');
    }
  }

  delete(id) {
    this.fireDeleteSwal1().then((result) => {
      if (result.isConfirmed) {
        this.deleteRecord(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.dismissDeleteSwal1(result);
      }
    });
  }

  deleteRecord(id) {


    this.repo.DeleteWebFactorRowsSupport(id).subscribe((data: any) => {
      this.GetFactorrows()

      this.fireDeleteSucceededSwal1();
    });



  }

  deletefactorRecord() {


    this.repo.DeleteWebFactorSupport(this.FactorCode).subscribe((data: any) => {

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




}



