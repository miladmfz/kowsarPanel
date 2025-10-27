import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { Location } from '@angular/common';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { AppConfigService } from 'src/app/app-config.service';
import { CellActionletterFactorList } from './cell-action-letterfactor-list';
import { CellActionletterPreFactorList } from './cell-action-letterprefactor-list';

@Component({
    selector: 'app-autletter-detail',
    templateUrl: './autletter-detail.component.html',
    standalone: false
})
export class AutletterDetailComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private router: Router,
    private repo: AutletterWebApiService,
    private readonly notificationService: NotificationService,
    private renderer: Renderer2,
    private location: Location,
    private config: AppConfigService,
    private route: ActivatedRoute,

    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }
  id!: string;
  JobPersonRef: string = '';

  records;
  records_ownerfactorlist
  records_ownerprefactorlist


  title = 'لیست تیکت های ارسالی ';
  dateValue = new FormControl();
  StartTime = new FormControl();

  EndTime = new FormControl();

  CentralRef: string = '';

  OwnerCode: string = '';
  CustomerCode: string = '';
  VendorCode: string = '';
  OwnerName: string = '';

  items: any[] = [];
  TextData: string = '';
  selectedOption: string = '0';




  searchTerm: string = '';
  ToDayDate: string = '';

  loading: boolean = true;
  loading_cust_factor: boolean = true;
  loading_cust_prefactor: boolean = true;


  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };



  EditForm_autletter = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl(''),
    CreationDate: new FormControl(''),
    OwnCentralRef: new FormControl(''),
    PersonInfoCode: new FormControl(''),
    StartTime: new FormControl(''),
    EndTime: new FormControl(''),

  });






  EditForm_autletter_detail = new FormGroup({
    AutLetterRow_PropDescription1: new FormControl(''),
    CreatorCentralRef: new FormControl(''),
    CreatorName: new FormControl(''),
    ExecutorName: new FormControl(''),
    LetterCode: new FormControl(''),
    LetterDate: new FormControl(''),
    LetterDescription: new FormControl(''),
    LetterPriority: new FormControl(''),
    LetterReceiveType: new FormControl(''),
    LetterState: new FormControl(''),
    LetterTitle: new FormControl(''),
    OwnerCentralRef: new FormControl(''),
    OwnerName: new FormControl(''),
    RowExecutorCentralRef: new FormControl(''),
    RowExecutorName: new FormControl(''),
    RowLetterDate: new FormControl(''),
    RowLetterState: new FormControl(''),
    RowsCount: new FormControl(''),
  });



  onInputChange() {
    if (this.searchTerm == "") {
      this.searchTerm = ""
    }
    //this.LoadList()
  }


  column_declare() {
    this.columnDefs2 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionletterFactorList,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 100,
      },
      {
        field: 'FactorCode',
        headerName: 'کد فاکتور',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'FactorDate',
        headerName: 'تاریخ فاکتور',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'توضیحات',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.columnDefs3 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionletterPreFactorList,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 100,
      },
      {
        field: 'PreFactorCode',
        headerName: 'کد پیش فاکتور',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'PreFactorDate',
        headerName: 'تاریخ پیش فاکتور',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'توضیحات',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];
  }

  ngOnDestroy() {

    this.themeSub.unsubscribe();

  }


  override ngOnInit(): void {
    super.ngOnInit();
    this.JobPersonRef = sessionStorage.getItem("JobPersonRef");
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.column_declare()
    this.route.paramMap.subscribe((params: ParamMap) => {
      var idtemp = params.get('id');
      if (idtemp != null) {
        this.id = idtemp;
        this.JobPersonRef = sessionStorage.getItem("JobPersonRef");
      }
    });

    this.repo.GetAutletterById(this.id).subscribe(e => {

      this.Autletter_data.patchValue({
        OwnerName: e[0].OwnerName,
        OwnerCentralRef: e[0].OwnerCentralRef,
        LetterCode: e[0].LetterCode,
        LetterTitle: e[0].LetterTitle,
        LetterDate: e[0].LetterDate,
        LetterDescription: e[0].LetterDescription,
        LetterState: e[0].LetterState,
        LetterPriority: e[0].LetterPriority,
        CreatorName: e[0].CreatorName,
        ExecutorName: e[0].ExecutorName,
        RowsCount: e[0].RowsCount,
      });



    });



  }


  EditForm_search = new FormGroup({
    SearchTarget: new FormControl(''),
    ObjectRef: new FormControl(''),
    ClassName: new FormControl(''),

  });


  Autletter_data = new FormGroup({
    OwnerName: new FormControl(''),
    OwnerCentralRef: new FormControl(''),
    LetterCode: new FormControl(''),
    LetterTitle: new FormControl(''),
    LetterDate: new FormControl(''),
    LetterDescription: new FormControl(''),
    LetterState: new FormControl(''),
    LetterPriority: new FormControl(''),
    CreatorName: new FormControl(''),
    ExecutorName: new FormControl(''),
    RowsCount: new FormControl(''),
  });




  onBtnCancelClick() {
    this.location.back()
  }


  NavigateToFactor(Code) {

    const api = this.config.apiUrl;

    if (api === 'http://192.168.1.25:60006/api/' || api === 'http://itmali.ir/webapi/' || api === 'http://5.160.152.173:60005/api/') {
      this.router.navigate(['/support/support-factor-edit', Code]);
    } else {
      this.router.navigate(['/factor/factor-edit', Code]);
    }

  }

  NavigateToPreFactor(Code) {

    this.router.navigate(['/factor/prefactor-edit', Code]);

  }



  owner_factor_prefactor() {
    this.ownerfactorlist_dialog_show()


    this.EditForm_search.patchValue({
      ObjectRef: this.Autletter_data.value.OwnerCentralRef,
    });

    this.OwnerName = this.Autletter_data.value.OwnerName



    this.repo.GetCentralByCode(this.EditForm_search.value).subscribe((data: any) => {

      this.OwnerCode = data.Centrals[0].CentralCode
      this.VendorCode = data.Centrals[0].VendorCode
      this.CustomerCode = data.Centrals[0].CustomerCode
      this.loading = false

      // if (+this.VendorCode > 0) {
      //   console.log("VendorCode تعریف شده:", this.VendorCode);

      // }


      if (+this.CustomerCode > 0) {
        console.log("CustomerCode تعریف شده:", this.CustomerCode);
        this.EditForm_search.patchValue({
          ObjectRef: this.CustomerCode,
          ClassName: "Factor"
        });



        this.repo.GetFactorByCustomerCode(this.EditForm_search.value).subscribe((data: any) => {
          this.loading_cust_factor = false

          this.records_ownerfactorlist = data.Factors

        });

        this.EditForm_search.patchValue({
          ObjectRef: this.CustomerCode,
          ClassName: "PreFactor"
        });

        this.repo.GetFactorByCustomerCode(this.EditForm_search.value).subscribe((data: any) => {

          this.loading_cust_prefactor = false

          this.records_ownerprefactorlist = data.Factors
        });


      }

    });



  }


  ownerfactorlist_dialog_show() {
    const modal = this.renderer.selectRootElement('#ownerfactorlist', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  ownerfactorlist_dialog_close() {
    const modal = this.renderer.selectRootElement('#ownerfactorlist', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

}