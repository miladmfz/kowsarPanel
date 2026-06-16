// ===============================================================
// 📘 Autletter Panel Component
// ===============================================================

import { Component, inject, OnInit, Renderer2, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { AutletterItemComponent } from './components/autletter-item/autletter-item.component';
import { AutletterChatComponent } from './components/autletter-chat/autletter-chat.component';

import { KowsarAttachComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-attach/kowsar-attach.component';

import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import { AutletterWebApiService } from '../../../../automation/services/AutletterWebApi.service';

import { Location } from '@angular/common';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';

import { CellActionletterFactorList } from './cell-action-letterfactor-list';
import { CellActionletterPreFactorList } from './cell-action-letterprefactor-list';

import { AppConfigService } from 'src/app/app-config.service';

import { AgGridAngular } from 'ag-grid-angular';

import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';


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

export class AutletterPanelComponent
  extends AgGridBaseComponent
  implements OnInit {

  // ===============================================================
  // 📌 Signals
  // ===============================================================

  LetterRef = signal('')
  activeTab = signal('detail')

  LoginType = signal('')
  PersonInfoRef = signal('')

  records = signal<any[]>([])
  records_ownerfactorlist = signal<any[]>([])
  records_ownerprefactorlist = signal<any[]>([])

  title = signal('لیست تیکت های ارسالی ')

  CentralRef = signal('')
  OwnerCode = signal('')
  CustomerCode = signal('')
  VendorCode = signal('')
  OwnerName = signal('')

  LetterState_str = signal('')

  items = signal<any[]>([])
  TextData = signal('')

  selectedOption = signal('0')
  searchTerm = signal('')

  ToDayDate = signal('')

  loading = signal(true)
  loading_cust_factor = signal(true)
  loading_cust_prefactor = signal(true)

  // ===============================================================
  // 📌 Variables
  // ===============================================================

  id!: string;

  // ===============================================================
  // 📌 Form Controls
  // ===============================================================

  dateValue = new FormControl();

  StartTime = new FormControl();

  EndTime = new FormControl();

  // ===============================================================
  // 📌 Main Form
  // ===============================================================

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

  // ===============================================================
  // 📌 Search Form
  // ===============================================================

  EditForm_search = new FormGroup({
    SearchTarget: new FormControl(''),
    ObjectRef: new FormControl(''),
    ClassName: new FormControl(''),
  });

  // ===============================================================
  // 📌 Tabs
  // ===============================================================

  tabs = [
    { id: 'detail', title: 'روند ارجاع تیکت' },
    { id: 'chat', title: 'مکاتبات' },
    { id: 'attach', title: 'پیوست' }
  ];

  // ===============================================================
  // 📌 Services
  // ===============================================================

  private readonly router = inject(Router);

  private readonly repo = inject(AutletterWebApiService);

  private readonly route = inject(ActivatedRoute);

  private readonly location = inject(Location);

  private readonly config = inject(AppConfigService);

  private readonly renderer = inject(Renderer2);

  private readonly notificationService = inject(NotificationService);
  protected readonly session = inject(SessionStorageService);
  constructor() {
    super();
  }

  // ===============================================================
  // 🔁 Lifecycle
  // ===============================================================

  ngOnInit(): void {

    this.LoginType.set(
      this.session.loginType
    );

    this.CentralRef.set(
      this.session.centralRef
    );

    this.PersonInfoRef.set(
      this.session.personInfoRef
    );

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      this.LetterRef.set(id ?? '');

      this.GetData();
    });

    this.column_declare();
  }

  // ===============================================================
  // 📥 دریافت اطلاعات تیکت
  // ===============================================================

  GetData() {

    this.repo.GetAutletterById(this.LetterRef())
      .subscribe((data: any) => {

        this.Autletter_data.patchValue({
          OwnerName: data.AutLetters[0].OwnerName,
          OwnerCentralRef: data.AutLetters[0].OwnerCentralRef,
          LetterCode: data.AutLetters[0].LetterCode,
          LetterTitle: data.AutLetters[0].LetterTitle,
          LetterDate: data.AutLetters[0].LetterDate,
          LetterDescription: data.AutLetters[0].LetterDescription,
          LetterState: data.AutLetters[0].LetterState,
          LetterPriority: data.AutLetters[0].LetterPriority,
          CreatorName: data.AutLetters[0].PhFullName,
          ExecutorName: data.AutLetters[0].ExecutorName,
          RowsCount: data.AutLetters[0].RowsCount,
        });

        this.LetterState_str.set(
          data.AutLetters[0].LetterState
        );

        // ===============================================================
        // 🔒 Access Control
        // ===============================================================
        if (!this.LoginType() || this.LoginType() == 'KOWSAR') {

          // کاربران KOWSAR نیازی به بررسی دسترسی تیکت ندارند
        } else {
          const letter = data.AutLetters?.[0];

          if (!letter) return;

          const centralRef = Number(this.session.centralRef);

          const ownerCentralRef = Number(letter.OwnerCentralRef);

          const ownerPersonRef = Number(letter.OwnerPersonInfoRef);

          const currentPersonRef = Number(this.PersonInfoRef());

          const isOwner = ownerCentralRef === centralRef;
          const isPersonOwner = ownerPersonRef === currentPersonRef;

          const isPrivate =
            String(letter.IsPrivate).toLowerCase() === 'true' ||
            letter.IsPrivate === 1 ||
            letter.IsPrivate === '1' ||
            letter.IsPrivate === true;

          const hasAccess = isOwner || (isPersonOwner && !isPrivate);

          if (!isOwner) {

            this.Autletter_data.reset();

            this.notificationService.error("شما به این تیکت دسترسی ندارید");

            this.location.back();

          } else {

            if (isPrivate) {

              if (!isPersonOwner) {

                this.Autletter_data.reset();

                this.notificationService.error("شما به این تیکت دسترسی ندارید");

                this.location.back();
              }
            }
          }
        }
      });
  }

  // ===============================================================
  // 📊 Grid Columns
  // ===============================================================

  column_declare() {

    this.columnDefs2 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionletterFactorList,
        cellRendererParams: {
          editUrl: '/automation/letter-detail',
        },
        minWidth: 100,
      },
      {
        field: 'FactorCode',
        headerName: 'کد فاکتور',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'FactorDate',
        headerName: 'تاریخ فاکتور',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'توضیحات',

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
          editUrl: '/automation/letter-panel',
        },
        minWidth: 100,
      },
      {
        field: 'PreFactorCode',
        headerName: 'کد پیش فاکتور',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'PreFactorDate',
        headerName: 'تاریخ پیش فاکتور',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'توضیحات',

        cellClass: 'text-center',
        minWidth: 150
      },
    ];
  }

  // ===============================================================
  // 🚀 Navigate To Factor
  // ===============================================================

  NavigateToFactor(Code) {

    const api = this.config.apiUrl;

    if (
      api === 'http://192.168.1.27:60006/api/' ||
      api === 'https://itmali.ir/webapi/' ||
      api === 'http://5.160.152.173:60005/api/'
    ) {

      this.router.navigate([
        '/internal/internal-factors-edit',
        Code
      ]);

    } else {

      this.router.navigate([
        '/factor/factor-edit',
        Code
      ]);
    }
  }

  // ===============================================================
  // 🚀 Navigate To PreFactor
  // ===============================================================

  NavigateToPreFactor(Code) {

    this.router.navigate([
      '/factor/prefactor-edit',
      Code
    ]);
  }

  // ===============================================================
  // 📊 Grid Ready
  // ===============================================================

  override onGridReady(params: any, index: number) {

    super.onGridReady(params, index);

    if (index >= 1 && index <= 6) {

      (this as any)[`gridApi${index}`] = params.api;
    }

    setTimeout(() => {

      try {

        if (
          params.api &&
          !params.api.isDestroyed?.()
        ) {

          params.api.sizeColumnsToFit();
        }

      } catch { }

    }, 50);
  }

  // ===============================================================
  // 🔙 Back
  // ===============================================================

  onBtnCancelClick() {

    this.location.back();
  }

  // ===============================================================
  // 📌 Grid APIs
  // ===============================================================

  private ownerFactorGridApi: any;

  private ownerPreFactorGridApi: any;

  private ownerFactorGridReady = false;

  private ownerPreFactorGridReady = false;

  // ===============================================================
  // 🔄 Refresh State
  // ===============================================================

  onRefreshState(flag: boolean): void {

    if (flag) {

      this.GetData();
    }
  }

  // ===============================================================
  // 📊 Owner Factor & Prefactor
  // ===============================================================

  owner_factor_prefactor() {

    this.loading.set(true);

    this.loading_cust_factor.set(true);

    this.loading_cust_prefactor.set(true);

    const centralPayload = {
      ...this.EditForm_search.value,
      ObjectRef: this.Autletter_data.value.OwnerCentralRef,
    };

    this.OwnerName.set(
      this.Autletter_data.value.OwnerName
    );

    this.repo.GetCentralByCode(centralPayload)
      .subscribe((data: any) => {

        this.OwnerCode.set(
          data?.Centrals?.[0]?.CentralCode ?? ''
        );

        this.VendorCode.set(
          data?.Centrals?.[0]?.VendorCode ?? '0'
        );

        this.CustomerCode.set(
          data?.Centrals?.[0]?.CustomerCode ?? '0'
        );

        this.ownerfactorlist_dialog_show();

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

        // ===============================================================
        // 📄 Factors
        // ===============================================================

        this.repo.GetFactorByCustomerCode(factorPayload)
          .subscribe((data: any) => {

            this.loading_cust_factor.set(false);

            this.records_ownerfactorlist.set(
              data?.Factors ?? []
            );

            this.updateGridData(
              2,
              this.records_ownerfactorlist()
            );
          });

        // ===============================================================
        // 📄 PreFactors
        // ===============================================================

        this.repo.GetFactorByCustomerCode(prefactorPayload)
          .subscribe((data: any) => {

            this.loading_cust_prefactor.set(false);

            this.records_ownerprefactorlist.set(
              data?.Factors ?? []
            );

            this.updateGridData(
              3,
              this.records_ownerprefactorlist()
            );
          });
      });
  }

  // ===============================================================
  // 📦 Owner Factor Modal
  // ===============================================================

  ownerfactorlist_dialog_show() {

    const modal = this.renderer.selectRootElement(
      '#ownerfactorlist',
      true
    );

    this.renderer.addClass(modal, 'show');

    this.renderer.setStyle(modal, 'display', 'block');

    this.renderer.setAttribute(
      modal,
      'aria-modal',
      'true'
    );

    this.renderer.setAttribute(
      modal,
      'role',
      'dialog'
    );
  }

  ownerfactorlist_dialog_close() {

    const modal = this.renderer.selectRootElement(
      '#ownerfactorlist',
      true
    );

    this.renderer.removeClass(modal, 'show');

    this.renderer.setStyle(modal, 'display', 'none');

    this.renderer.removeAttribute(
      modal,
      'aria-modal'
    );

    this.renderer.removeAttribute(
      modal,
      'role'
    );
  }

}