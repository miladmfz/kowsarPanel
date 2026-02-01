import { Component, inject, OnInit, Renderer2, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { AutletterItemComponent } from './components/autletter-item/autletter-item.component';
import { AutletterChatComponent } from './components/autletter-chat/autletter-chat.component';
import { KowsarAttachComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-attach/kowsar-attach.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutletterWebApiService } from '../../../services/AutletterWebApi.service';
import { Location } from '@angular/common';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { CellActionletterFactorList } from './cell-action-letterfactor-list';
import { CellActionletterPreFactorList } from './cell-action-letterprefactor-list';
import { AppConfigService } from 'src/app/app-config.service';
import { AgGridAngular } from 'ag-grid-angular';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';

@Component({
  selector: 'app-autletter-panel',
  standalone: true,
  imports: [
    CommonModule,
    AutletterItemComponent,
    AutletterChatComponent,
    KowsarAttachComponent,
    FormsModule,
    ReactiveFormsModule,
    AgGridAngular
  ],
  templateUrl: './autletter-panel.component.html',
})
export class AutletterPanelComponent extends AgGridBaseComponent implements OnInit {

  LetterRef = '';
  activeTab = 'detail';


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

  CustomerCode = signal('');
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
  EditForm_search = new FormGroup({
    SearchTarget: new FormControl(''),
    ObjectRef: new FormControl(''),
    ClassName: new FormControl(''),

  });
  tabs = [
    { id: 'detail', title: 'روند ارجاع تیکت' },
    { id: 'chat', title: 'مکاتبات' },
    { id: 'attach', title: 'پیوست' }
  ];


  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(AutletterWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly config = inject(AppConfigService);
  private readonly renderer = inject(Renderer2);

  constructor() {
    super();
  }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.LetterRef = id ?? '';

      this.loadingService.show()
      this.repo.GetAutletterById(this.LetterRef).subscribe((data: any) => {
        this.loadingService.hide()

        this.Autletter_data.patchValue({
          OwnerName: data.AutLetters[0].OwnerName,
          OwnerCentralRef: data.AutLetters[0].OwnerCentralRef,
          LetterCode: data.AutLetters[0].LetterCode,
          LetterTitle: data.AutLetters[0].LetterTitle,
          LetterDate: data.AutLetters[0].LetterDate,
          LetterDescription: data.AutLetters[0].LetterDescription,
          LetterState: data.AutLetters[0].LetterState,
          LetterPriority: data.AutLetters[0].LetterPriority,
          CreatorName: data.AutLetters[0].CreatorName,
          ExecutorName: data.AutLetters[0].ExecutorName,
          RowsCount: data.AutLetters[0].RowsCount,
        });



      });
    });

    this.column_declare()

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
        minWidth: 100,
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
          editUrl: '/support/letter-panel',
        },
        minWidth: 100,
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

  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    // ذخیره API درست
    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    // فیت کردن ستون‌ها با تأخیر کوتاه
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch { }
    }, 50);
  }

  onBtnCancelClick() {
    this.location.back()
  }



  private ownerFactorGridApi: any;
  private ownerPreFactorGridApi: any;

  private ownerFactorGridReady = false;
  private ownerPreFactorGridReady = false;







  owner_factor_prefactor() {


    this.loading = true;
    this.loading_cust_factor = true;
    this.loading_cust_prefactor = true;

    // 3) سرچ مرکزی
    const centralPayload = {
      ...this.EditForm_search.value,
      ObjectRef: this.Autletter_data.value.OwnerCentralRef,
    };

    this.OwnerName = this.Autletter_data.value.OwnerName;

    this.loadingService.show()
    this.repo.GetCentralByCode(centralPayload).subscribe((data: any) => {
      this.loadingService.hide()
      this.OwnerCode = data?.Centrals?.[0]?.CentralCode ?? '';
      this.VendorCode = data?.Centrals?.[0]?.VendorCode ?? '0';
      this.CustomerCode.set(data?.Centrals?.[0]?.CustomerCode ?? '0')
      this.ownerfactorlist_dialog_show();

      // --- payload های جدا ---
      const factorPayload = {
        ...this.EditForm_search.value,
        ObjectRef: this.CustomerCode,
        ClassName: 'Factor'
      };

      const prefactorPayload = {
        ...this.EditForm_search.value,
        ObjectRef: this.CustomerCode,
        ClassName: 'PreFactor'
      };

      // 4) فاکتور
      this.loadingService.show()
      this.repo.GetFactorByCustomerCode(factorPayload).subscribe((data: any) => {
        this.loadingService.hide()
        this.loading_cust_factor = false;
        this.records_ownerfactorlist = data?.Factors ?? [];
        this.updateGridData(2, this.records_ownerfactorlist);

      });

      // 5) پیش‌فاکتور
      this.loadingService.show()
      this.repo.GetFactorByCustomerCode(prefactorPayload).subscribe((data: any) => {
        this.loadingService.hide()
        this.loading_cust_prefactor = false;
        this.records_ownerprefactorlist = data?.Factors ?? [];

        this.updateGridData(3, this.records_ownerprefactorlist);

      });

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
