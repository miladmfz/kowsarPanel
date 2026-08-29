import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { PersonInfoWebApiService } from 'src/app/features/accounting/services/ForoshWebApi/PersonInfoWebApi.service';
import { JobPersonWebApiService } from 'src/app/features/accounting/services/TaarifPayeWebApi/JobPersonWebApi.service';
import { CustomerWebApiService } from 'src/app/features/internal/services/CustomerWebApi.service';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    FormsModule,

    // KowsarAttachComponent
  ],
  selector: 'app-personinfo-customer-edit',
  templateUrl: './personinfo-customer-edit.component.html',
})
export class PersoninfoCustomerEditComponent extends AgGridBaseComponent implements OnInit, OnDestroy {



  private readonly router = inject(Router);

  private readonly repo = inject(PersonInfoWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly customer_repo = inject(CustomerWebApiService);
  private readonly Jobperson_repo = inject(JobPersonWebApiService);
  protected readonly session = inject(SessionStorageService);

  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);
  private readonly destroy$ = new Subject<void>();


  private searchSubject_customer: Subject<string> = new Subject();
  private searchSubject_jobperson: Subject<string> = new Subject();


  constructor() {
    super();
  }

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupAllModals();
  }

  cleanupAllModals(): void {

    document
      .querySelectorAll('.modal-backdrop')
      .forEach((item) => item.remove());

    document
      .querySelectorAll('.modal.show')
      .forEach((modal) => {

        const element = modal as HTMLElement;

        element.classList.remove('show');

        element.style.display = 'none';

        element.setAttribute('aria-hidden', 'true');

      });

    document.body.classList.remove('modal-open');

    document.body.style.overflow = '';

    document.body.style.paddingRight = '';
  }


  title = signal('')
  ClassName = signal('PhoneBook')
  loading = signal(false)



  address_modal_title = signal('')
  PersonInfoCode = signal('')

  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(""),
    ObjectRef: new FormControl(""),
    ClassName: new FormControl(''),
    Active: new FormControl('0'),
    BrokerRef: new FormControl(''),
  });


  KowsarTemplate_PersonInfo = new FormGroup({
    PersonInfo: new FormArray([])
  });

  JsonForm = new FormGroup({
    JsonData: new FormControl(""),
  });

  Active_Lookup: Base_Lookup[] = [

    { id: "4", name: "همه" },
    { id: "0", name: "فعال" },
    { id: "1", name: "نيمه فعال" },
    { id: "2", name: "غير فعال" },
  ]



  records_customer = signal<any[]>([])
  records_jobperson = signal<any[]>([])

  originalValues: any = {};
  changedValues = signal<any[]>([])
  selectedRows = signal<any[]>([])

  GridSchemas = signal<any[]>([])


  EditForm_PersonInfo = new FormGroup({
    PersonInfoCode: new FormControl(0),
    PersonInfoPrivateCode: new FormControl(''),

    PhFirstName: new FormControl(''),
    PhLastName: new FormControl(''),
    PhCompanyName: new FormControl(''),

    PhAddress1: new FormControl(''),
    PhAddress2: new FormControl(''),
    PhAddress3: new FormControl(''),

    PhTel1: new FormControl(''),
    PhTel2: new FormControl(''),
    PhTel3: new FormControl(''),

    PhMobile1: new FormControl(''),
    PhMobile2: new FormControl(''),
    PhMobile3: new FormControl(''),

    PhMelliCode: new FormControl(''),



    CustomerRef: new FormControl(null),
    CustomerName: new FormControl(""),
  });

  onSelectionChanged(event: any) {
    this.selectedRows.set(event.api.getSelectedRows())
  }


  ngOnInit(): void {
    this.route.paramMap.subscribe((p: ParamMap) => {
      const id = p.get('id');
      if (id) {
        this.PersonInfoCode.set(id)
        this.loadDetails();
        this.title.set("ویرایش مشترک")
      } else {
        this.title.set("ایجاد مشترک")
        this.EditForm_PersonInfo.patchValue({
          CustomerRef: this.session.CustomerCode,
          CustomerName: this.session.CustName_Small,
        });


      }


    });

    this.Config_Declare()
  }

  Config_Declare() {
    this.columnDefs2 = [

      {
        field: 'CustomerCode',
        headerName: 'CustomerCode',

        cellClass: 'text-center',
        minWidth: 50,

      },
      {
        field: 'CustName_Small',
        headerName: 'CustName_Small',

        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'Explain',
        headerName: 'Explain',

        cellClass: 'text-center',
        minWidth: 150,

      },
    ];

    this.columnDefs3 = [


      {
        field: 'JobPersonCode',
        headerName: 'JobPersonCode',

        cellClass: 'text-center',
        minWidth: 50,

      },
      {
        field: 'PersonName',
        headerName: 'PersonName',

        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'JobTitle',
        headerName: 'JobTitle',

        cellClass: 'text-center',
        minWidth: 150,

      },
    ];

  }



  isVisible(fieldName: string): boolean {
    return this.GridSchemas()?.some(
      x => x.FieldName === fieldName && x.Visible === 'True'
    ) ?? false;
  }



  loadDetails() {

    this.repo.GetPersonInfoById(this.PersonInfoCode())
      .subscribe((data: any) => {

        const personInfo = data.PersonInfos?.[0] ?? data.PersonInfos;

        this.EditForm_PersonInfo.patchValue({
          PersonInfoCode: personInfo.PersonInfoCode ?? 0,
          PersonInfoPrivateCode: personInfo.PersonInfoPrivateCode ?? '',

          PhFirstName: personInfo.PhFirstName ?? '',
          PhLastName: personInfo.PhLastName ?? '',
          PhCompanyName: personInfo.PhCompanyName ?? '',

          PhAddress1: personInfo.PhAddress1 ?? '',
          PhAddress2: personInfo.PhAddress2 ?? '',
          PhAddress3: personInfo.PhAddress3 ?? '',

          PhTel1: personInfo.PhTel1 ?? '',
          PhTel2: personInfo.PhTel2 ?? '',
          PhTel3: personInfo.PhTel3 ?? '',

          PhMobile1: personInfo.PhMobile1 ?? '',
          PhMobile2: personInfo.PhMobile2 ?? '',
          PhMobile3: personInfo.PhMobile3 ?? '',

          PhMelliCode: personInfo.PhMelliCode ?? '',



          CustomerRef: personInfo.CustomerRef ?? 0,
          CustomerName: personInfo.CustName_Small ?? 0,

        });

      });

  }



  onCancel() {
    this.router.navigate(['/accounting/forosh/personinfo-customer-list']);
  }
  submit_PersonInfo() {


    this.EditForm_PersonInfo.markAllAsTouched();
    if (!this.EditForm_PersonInfo.valid) return;

    (this.KowsarTemplate_PersonInfo.get('PersonInfo') as FormArray).clear();
    (this.KowsarTemplate_PersonInfo.get('PersonInfo') as FormArray).push(this.EditForm_PersonInfo);

    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate_PersonInfo.value)
    });


    this.repo.PersonInfoCrudService(this.JsonForm.value).subscribe((data: any) => {



      const result = JSON.parse(data.PersonInfos[0].Result);
      if (result.PersonInfo && result.PersonInfo[0].ErrMessage === "") {

        this.notificationService.succeded();
        this.router.navigate(['/accounting/forosh/personinfo-customer-edit', result.PersonInfo[0].PersonInfoCode]);
      } else {

        this.notificationService.error(result.PersonInfo[0].ErrMessage);
      }

    });


  }


}
