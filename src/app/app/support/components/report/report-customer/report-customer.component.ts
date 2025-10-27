import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { CellActionReportCustomer } from './cell-action-report-customer-list';
import { LoadingService } from 'src/app/app-shell/framework-services/loading.service';

@Component({
    selector: 'app-report-customer',
    templateUrl: './report-customer.component.html',
    standalone: false
})
export class ReportCustomerComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: SupportFactorWebApiService,
    private renderer: Renderer2,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private themeService: ThemeService,
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;
  private searchSubject: Subject<string> = new Subject();

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }

  title = 'فاکتور پشتیبانی';
  CentralRef: string = '';
  JobPersonRef: string = '';
  Searchtarget: string = '';
  TextData: string = '';
  BrokerRef: string = '';
  BrokerRef_temp: string = '';

  searchTerm: string = '';
  selectedOption: string = '0';


  items: any[] = [];

  start_dateValue = new FormControl();
  End_dateValue = new FormControl();
  loading: boolean = true;

  records_report_customer;
  records_report_customer_bydate;
  records_report_customer_byrow;
  Customer_temp: string = '';


  loading_supportpanel: boolean = true;


  reportData: any[] = [];




  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };

  EditForm_reportCustomer = new FormGroup({
    StartDateTarget: new FormControl(''),
    EndDateTarget: new FormControl(''),
    SearchTarget: new FormControl(''),
    CustomerRef: new FormControl('0'),
    Flag: new FormControl('1'),

  });

  EditForm_reportCustomer_temp = new FormGroup({
    StartDateTarget: new FormControl(''),
    EndDateTarget: new FormControl(''),
    SearchTarget: new FormControl(''),
    CustomerRef: new FormControl('0'),
    Flag: new FormControl('1'),

  });


  submitforsearch() {
    this.EditForm_reportCustomer_temp.patchValue({
      StartDateTarget: this.EditForm_reportCustomer.value.StartDateTarget,
      EndDateTarget: this.EditForm_reportCustomer.value.EndDateTarget,
      CustomerRef: "0",
    });
    this.getlist()
  }

  onInputChange() {

    this.EditForm_reportCustomer_temp.patchValue({
      StartDateTarget: this.EditForm_reportCustomer.value.StartDateTarget,
      EndDateTarget: this.EditForm_reportCustomer.value.EndDateTarget,
      CustomerRef: "0",
    });

    this.searchSubject.next(this.Searchtarget);

  }



  ngOnDestroy(): void {
    this.searchSubject.unsubscribe();
    this.themeSub.unsubscribe();
  }




  override ngOnInit(): void {
    super.ngOnInit();

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    if (sessionStorage.getItem("PhAddress3") == '100') {
      this.BrokerRef = ''

    } else {
      this.BrokerRef = sessionStorage.getItem("BrokerCode")

    }


    this.config()



  }


  getlist_report_customer_bydate(item: any) {
    this.loadingService.show()

    this.EditForm_reportCustomer_temp.patchValue({
      StartDateTarget: this.EditForm_reportCustomer.value.StartDateTarget,
      EndDateTarget: this.EditForm_reportCustomer.value.EndDateTarget,
      CustomerRef: item.CustomerRef,
      Flag: "2"
    });

    this.repo.GetCustomerReport(this.EditForm_reportCustomer_temp.value)
      .subscribe((data: any) => {
        this.Customer_temp = data.KowsarReports[0].CustomerName

        this.records_report_customer_bydate = data.KowsarReports
        this.loadingService.hide()

        this.customerreportbydate_dialog_show()

      });

  }


  getlist_report_customer_byrow(item: any) {
    this.loadingService.show()

    this.EditForm_reportCustomer_temp.patchValue({
      StartDateTarget: this.EditForm_reportCustomer.value.StartDateTarget,
      EndDateTarget: this.EditForm_reportCustomer.value.EndDateTarget,
      CustomerRef: item.CustomerRef,
      Flag: "3"
    });


    this.repo.GetCustomerReport(this.EditForm_reportCustomer_temp.value)
      .subscribe((data: any) => {

        this.records_report_customer_byrow = data.KowsarReports
        this.loadingService.hide()

        this.customerreportbyrow_dialog_show()
      });

  }


  getlist() {


    this.loadingService.show()

    this.repo.GetCustomerReport(this.EditForm_reportCustomer.value)
      .subscribe((data: any) => {
        this.loadingService.hide()

        this.records_report_customer = data.KowsarReports

      });

  }





  config() {

    this.EditForm_reportCustomer.patchValue({
      StartDateTarget: "1404/01/01",
      EndDateTarget: "1405/01/01",
      SearchTarget: "",
      CustomerRef: "0",
      Flag: "1"
    });

    this.EditForm_reportCustomer.get('SearchTarget')?.valueChanges.subscribe(value => {
      this.onInputChange();
    });

    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionReportCustomer,   // نام کلاس ریجستر شده
        cellRendererParams: {
          editUrl: '/support/task-edit',
        },
        width: 250,
      },

      {
        field: 'CustomerName',
        headerName: 'نام مشتری',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'FactorCount',
        headerName: 'تعداد فاکتور',
        cellClass: 'text-center',
        width: 80
      }, {
        field: 'TotalTime',
        headerName: 'مدت زمان',
        cellClass: 'text-center',
        width: 80
      }, {
        field: 'TotalPrice',
        headerName: 'مبلغ کل',
        cellClass: 'text-center',
        width: 80
      },

    ];

    this.columnDefs2 = [
      {
        field: 'FactorCode',
        headerName: 'کد فاکتور',
        cellClass: 'text-center',
        width: 80
      },
      {
        field: 'FactorDate',
        headerName: 'تاریخ',
        cellClass: 'text-center',
        width: 80
      },
      {
        field: 'GoodName',
        headerName: 'نام خدمت ',
        minWidth: 200
      },

    ];



    this.columnDefs3 = [

      {
        field: 'GoodName',
        headerName: 'نام خدمت',
        cellClass: 'text-center',
        minWidth: 200
      },
      {
        field: 'GoodCount',
        headerName: 'تعداد انجام',
        cellClass: 'text-center',
        width: 80
      },

    ];

    this.searchSubject.pipe(
      debounceTime(1000)  // 1 second debounce time
    ).subscribe(searchText => {

      this.getlist();
    });
    this.searchSubject.next(this.Searchtarget);





  }




  customerreportbydate_dialog_show() {
    const modal = this.renderer.selectRootElement('#customerreportbydate', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  customerreportbydate_dialog_close() {
    const modal = this.renderer.selectRootElement('#customerreportbydate', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  customerreportbyrow_dialog_show() {
    const modal = this.renderer.selectRootElement('#customerreportbyrow', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  customerreportbyrow_dialog_close() {
    const modal = this.renderer.selectRootElement('#customerreportbyrow', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


}



