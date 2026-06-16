import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, Renderer2, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { KowsarAttachComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-attach/kowsar-attach.component';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { CentralWebApiService } from 'src/app/features/accounting/services/TaarifPayeWebApi/CentralWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { CellActionCentralGroupList } from './cell-action-central-group-list';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { CellActionCentralAddressList } from './cell-action-central-address-list';
import { CityWebApiService } from 'src/app/features/accounting/services/TaarifPayeWebApi/CityWebApi.service';
import { KowsarPropertyComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-property/kowsar-property.component';

@Component({
  selector: 'app-central-edit',
  templateUrl: './central-edit.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    AgGridModule,
    RouterModule,
    KowsarPropertyComponent
    // KowsarAttachComponent
  ],
})
export class CentralEditComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {



  private readonly router = inject(Router);

  private readonly repo = inject(CentralWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly repo_city = inject(CityWebApiService);

  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);


  constructor() {
    super();
  }


  title = signal('')
  address_modal_title = signal('')
  CentralCode = signal('')
  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(""),
    ObjectRef: new FormControl(""),
    ClassName: new FormControl(''),
  });

  KowsarTemplate_Address = new FormGroup({
    Address: new FormArray([])
  });

  KowsarTemplate_Central = new FormGroup({
    Central: new FormArray([])
  });

  JsonForm = new FormGroup({
    JsonData: new FormControl(""),
  });






  CentralToProperty = new FormGroup({
    RowIndex: new FormControl("1"),
    CentralCode: new FormControl(""),
    PropertyValue: new FormControl("")
  });



  propertyDto = new FormGroup({

    ObjectType: new FormControl(''),
    ClassName: new FormControl(''),
    PropertyName: new FormControl(''),
    PropertyType: new FormControl(''),
    PropertyValueMap: new FormControl(''),
  });




  originalValues: any = {};
  changedValues = signal<any[]>([])

  EditForm_Property = new FormGroup({
    RowIndex: new FormControl("1"),

    CentralCode: new FormControl(0),
    Nvarchar1: new FormControl(''),
    Nvarchar2: new FormControl(''),
    Nvarchar3: new FormControl(''),
    Nvarchar4: new FormControl(''),
    Nvarchar5: new FormControl(''),
    Nvarchar6: new FormControl(''),
    Nvarchar7: new FormControl(''),
    Nvarchar8: new FormControl(''),
    Nvarchar9: new FormControl(''),
    Nvarchar10: new FormControl(''),
    Nvarchar11: new FormControl(''),
    Nvarchar12: new FormControl(''),
    Nvarchar13: new FormControl(''),
    Nvarchar14: new FormControl(''),
    Nvarchar15: new FormControl(''),
    Nvarchar16: new FormControl(''),
    Nvarchar17: new FormControl(''),
    Nvarchar18: new FormControl(''),
    Nvarchar19: new FormControl(''),
    Nvarchar20: new FormControl(''),
    Int1: new FormControl(0),
    Int2: new FormControl(0),
    Int3: new FormControl(0),
    Int4: new FormControl(0),
    Int5: new FormControl(0),
    Int6: new FormControl(0),
    Int7: new FormControl(0),
    Int8: new FormControl(0),
    Int9: new FormControl(0),
    Int10: new FormControl(0),
    Float1: new FormControl(0),
    Float2: new FormControl(0),
    Float3: new FormControl(0),
    Float4: new FormControl(0),
    Float5: new FormControl(0),
    Float6: new FormControl(0),
    Float7: new FormControl(0),
    Float8: new FormControl(0),
    Float9: new FormControl(0),
    Float10: new FormControl(0),
    Text1: new FormControl(''),
    Text2: new FormControl(''),
    Text3: new FormControl(''),
    Text4: new FormControl(''),
    Text5: new FormControl(''),
  });

  EditForm_Search = new FormGroup({
    SearchTarget: new FormControl('')
  });

  EditForm_Central = new FormGroup({

    CentralCode: new FormControl(''),
    Name: new FormControl('', Validators.required),
    CentralPrivateCode: new FormControl(''),
    RecType: new FormControl('', Validators.required),

    EconomyCode: new FormControl(''),
    Title: new FormControl(''),
    FName: new FormControl(''),
    Manager: new FormControl(''),
    Delegacy: new FormControl(''),

    D_OstanCode: new FormControl(''),
    D_ShahrCode: new FormControl(''),
    D_CodeMelli: new FormControl(''),
    D_RecType: new FormControl('', Validators.required),
    AddCode: new FormControl(''),
    D_CustomerType: new FormControl(''),
    D_VendorType: new FormControl(''),
    D_BranchCode: new FormControl(''),
    PriorCentralPrivateCode: new FormControl(''),

  });



  EditForm_Address = new FormGroup({

    AddressCode: new FormControl(0, Validators.required),
    AddressTitle: new FormControl('', Validators.required),
    CityCode: new FormControl('', Validators.required),
    CentralRef: new FormControl('', Validators.required),
    Address: new FormControl('', Validators.required),

    ZipCode: new FormControl(''),
    PostCode: new FormControl(''),
    Phone: new FormControl(''),
    Fax: new FormControl(''),
    Mobile: new FormControl(''),
    Email: new FormControl(''),
    MobileName: new FormControl(''),

    OstanCode: new FormControl(''),
    CityName: new FormControl(''),
    OstanName: new FormControl(''),
    prePhonenumber: new FormControl(''),
    OstanprePhonenumber: new FormControl(''),

  });











  RecType_str = signal('')
  D_RecType_str = signal('')

  records_address = signal<any[]>([])

  records_CentralGroup = signal<any[]>([])

  records_DaraiiCustomerType = signal<any[]>([])
  records_DaraiiVendorType = signal<any[]>([])
  records_DaraiiRecType = signal<any[]>([])
  records_CentralRecType = signal<any[]>([])

  records_Zone_Ostan = signal<any[]>([])
  records_Zone_Shahr = signal<any[]>([])
  base_city_list = signal<any[]>([])

  show_title = signal(false)
  show_Fname = signal(false)
  show_Manager = signal(false)
  show_Delegacy = signal(false)

  show_D_Customer = signal(false)
  show_D_Vendor = signal(false)
  show_address_form = signal(false)
  show_Property = signal(false)
  show_tafzilybox_relation = signal(false)


  TrueFalse_Lookup: Base_Lookup[] = [
    { id: "0", name: "غیر فعال " },
    { id: "1", name: "فعال" },

  ]

  newtype_Lookup: Base_Lookup[] = [
    { id: "0", name: "کد یکسان" },
    { id: "1", name: "اخرین کد" },

  ]
  moein: Base_Lookup[] = []

  relationForm = new FormGroup({
  });

  options = [
    { key: 'Customer', label: 'معرفی مشتری' },
    { key: 'Vendor', label: 'معرفی فروشنده' },
    { key: 'Cash', label: 'معرفی صندوق' },
    { key: 'Bank', label: 'معرفی بانک' },
    { key: 'Tafzily', label: 'معرفی تفضیلی' }
  ];



  buildForm() {
    this.relationForm.addControl('newtype_Lookup', new FormControl('0'));
    this.relationForm.addControl('moein', new FormControl('0'));
    this.options.forEach(opt => {
      this.relationForm.addControl(opt.key, new FormControl(false));
    });

    // گوش دادن به تغییرات
    this.relationForm.valueChanges.subscribe(val => {
      this.handleChanges(val);
    });
  }

  handleChanges(val: any) {
    this.show_tafzilybox_relation.set(false)
    // مثال:
    if (val.Customer) {
      console.log('Customer فعال شد');
    }

    if (val.Vendor) {
      console.log('Vendor فعال شد');
    }

    if (val.Cash) {
      console.log('Cash فعال شد');
    }

    if (val.Bank) {
      console.log('Bank فعال شد');
    }
    if (val.Tafzily) {
      console.log('Tafzily فعال شد');
      this.show_tafzilybox_relation.set(true)
    }
    console.log(this.relationForm.value)
  }


  ngOnInit(): void {
    this.route.paramMap.subscribe((p: ParamMap) => {
      const id = p.get('id');
      if (id) {
        this.CentralCode.set(id)
        this.loadDetails();
        this.title.set("ویرایش اجزای پایه")
      } else {
        this.title.set("ایجاد اجزای پایه")

      }

      this.Initial_data()
      this.buildForm();
    });
  }

  getDataPath_city = (task: any): string[] => {
    const pathcity: string[] = []
    let current = task;

    while (current) {
      pathcity.unshift(current.Name);
      if (current.CityRef === 0) break;
      current = this.base_city_list().find(t => t.CityCode === current.CityRef);
    }

    return pathcity;
  };
  selectedRows = signal<any[]>([])

  onSelectionChanged_Row(event: any) {
    this.selectedRows.set(event.api.getSelectedRows())


  }


  Initial_data() {


    this.column_name_1 = [
      {
        field: 'عملیات',
        width: 100,
        pinned: 'left',
        cellRenderer: CellActionCentralGroupList
      },

      { field: 'CentralGroupRef', headerName: 'CentralGroupRef', minWidth: 150 },
      { field: 'Name', headerName: 'Name', minWidth: 150 },

    ];


    this.columnDefs2 = [
      {
        field: 'عملیات',
        width: 150,
        pinned: 'left',
        cellRenderer: CellActionCentralAddressList
      },

      { field: 'AddressTitle', headerName: 'AddressTitle', minWidth: 150 },
      { field: 'Address', headerName: 'Address', minWidth: 150 },
      { field: 'Phone', headerName: 'Phone', minWidth: 150 },
      { field: 'Mobile', headerName: 'Mobile', minWidth: 150 },
      { field: 'MobileName', headerName: 'MobileName', minWidth: 150 },
      { field: 'Email', headerName: 'Email', minWidth: 150 },


    ];






    this.base_repo.GetLookup("DaraiiCustomerType")
      .subscribe((data: any) => {


        this.records_DaraiiCustomerType.set(data.Lookups)
      });


    this.base_repo.GetLookup("DaraiiVendorType")
      .subscribe((data: any) => {
        this.records_DaraiiVendorType.set(data.Lookups)

      });


    this.base_repo.GetLookup("DaraiiRecType")
      .subscribe((data: any) => {
        this.records_DaraiiRecType.set(data.Lookups)
      });



    this.base_repo.GetLookup("CentralRecType")
      .subscribe((data: any) => {
        this.records_CentralRecType.set(data.Lookups)
      });


    this.repo.GetZone_Ostan()
      .subscribe((data: any) => {
        this.records_Zone_Ostan.set(data.Zones)
      });

    // this.repo.GetCentralGroup()
    //   .subscribe((data: any) => {
    //     this.records_CentralGroup.set(data.CentralGroups)
    //   });
    this.records_CentralGroup.set([])

  }
  Show_property() {
    this.property_dialog_show()
  }

  GetZone_Shahr() {


    this.repo.GetZone_Shahr(this.EditForm_Central.value.D_OstanCode)
      .subscribe((data: any) => {
        this.records_Zone_Shahr.set(data.Zones)
      });

  }

  loadDetails() {

    this.repo.GetCentralById(this.CentralCode())
      .subscribe((data: any) => {

        this.EditForm_Central.patchValue(data.Centrals[0]);
      });
  }

  loadAddress() {

    this.records_address.set([])

    this.repo.GetAddressByCentral(this.CentralCode())
      .subscribe((data: any) => {
        this.records_address.set(data.Address)
        this.addressmodal_dialog_show()

      });
  }

  edit_address(data: any) {
    this.EditForm_Address.patchValue(data);

    this.show_address_form.set(true)

  }

  Newaddress() {



    this.EditForm_Address.patchValue({

      AddressCode: 0,
      AddressTitle: "",
      CityCode: "",
      CentralRef: this.CentralCode(),
      Address: "",

      ZipCode: "",
      PostCode: "",
      Phone: "",
      Fax: "",
      Mobile: "",
      Email: "",
      MobileName: "",

      OstanCode: "",
      CityName: "",
      OstanName: "",
      prePhonenumber: "",
      OstanprePhonenumber: "",

    });
    this.show_address_form.set(true)


  }

  Setaddress() {

    this.EditForm_Address.markAllAsTouched();
    if (!this.EditForm_Address.valid) return;

    (this.KowsarTemplate_Address.get('Address') as FormArray).clear();
    (this.KowsarTemplate_Address.get('Address') as FormArray).push(this.EditForm_Address);

    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate_Address.value)
    });


    this.repo.AddressCrudService(this.JsonForm.value).subscribe((data: any) => {



      const result = JSON.parse(data.Address[0].Result);

      if (result.Address && result.Address[0].ErrMessage === "") {

        this.notificationService.succeded();
        this.addressmodal_dialog_close()
        this.loadAddress()
      } else {

        this.notificationService.error(result.Address[0].ErrMessage);
      }

    });

  }

  city_modal() {
    this.repo_city.GetCity(this.EditForm_SearchTarget.value)
      .subscribe((data: any) => {

        this.base_city_list.set(data?.Citys ?? [])
        this.updateGridData(5, this.base_city_list());
        this.city_dialog_show();
      });
  }

  SetCity() {
    this.EditForm_Address.patchValue({
      CityCode: this.selectedRows()[0].CityCode,
      CityName: this.selectedRows()[0].Name,
    });
    this.selectedRows.set([])
    this.city_dialog_close();
  }




  onCancel() {
    this.router.navigate(['/accounting/taarif-paye/central-list']);
  }



  onRecTypeChange() {

    this.RecType_str.set(this.EditForm_Central.value.RecType)

    if (this.RecType_str() === "0") {


      this.show_title.set(true)
      this.show_Fname.set(true)
      this.show_Manager.set(false)
      this.show_Delegacy.set(false)

    } else if (this.RecType_str() === "1") {
      this.show_title.set(true)
      this.show_Fname.set(false)
      this.show_Manager.set(true)
      this.show_Delegacy.set(true)

    } else if (this.RecType_str() === "2") {

      this.show_title.set(false)
      this.show_Fname.set(false)
      this.show_Manager.set(false)
      this.show_Delegacy.set(false)
    }


  }

  delete_address(data: any) {
    this.notificationService.develop()
  }

  SetRelation() {
    this.notificationService.develop()
  }

  Show_relations() {
    this.relation_dialog_show();
    this.notificationService.develop()
  }

  Show_Addresss() {
    this.address_modal_title.set(this.EditForm_Central.value.FName + "" + this.EditForm_Central.value.Name)
    this.loadAddress()
  }

  AddCentralGroup() {
    this.notificationService.develop()

  }
  deleteCentralGroup() {
    this.notificationService.develop()

  }

  DaraiiRecType_change() {
    this.D_RecType_str.set(this.EditForm_Central.value.D_RecType)
    if (this.D_RecType_str() === "0") {
      this.show_D_Customer.set(true)
      this.show_D_Vendor.set(true)
    } else if (this.D_RecType_str() === "1") {
      this.show_D_Customer.set(false)
      this.show_D_Vendor.set(false)
    } else if (this.D_RecType_str() === "2") {
      this.show_D_Customer.set(false)
      this.show_D_Vendor.set(false)
    }


  }




  submit_Central() {


    this.EditForm_Central.markAllAsTouched();
    if (!this.EditForm_Central.valid) return;

    (this.KowsarTemplate_Central.get('Central') as FormArray).clear();
    (this.KowsarTemplate_Central.get('Central') as FormArray).push(this.EditForm_Central);

    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate_Central.value)
    });


    this.repo.CentralCrudService(this.JsonForm.value).subscribe((data: any) => {



      const result = JSON.parse(data.Central[0].Result);
      if (result.Central && result.Central[0].ErrMessage === "") {

        this.notificationService.succeded();
        this.router.navigate(['/accounting/taarif-paye/central-edit', result.Central[0].CentralCode]);
      } else {

        this.notificationService.error(result.Central[0].ErrMessage);
      }

    });


  }

  addressmodal_dialog_show() {
    const modal = this.renderer.selectRootElement('#addressmodal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  addressmodal_dialog_close() {
    this.show_address_form.set(false)
    this.EditForm_Address.reset()


    const modal = this.renderer.selectRootElement('#addressmodal', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  city_dialog_show() {
    const modal = this.renderer.selectRootElement('#citylist', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  city_dialog_close() {
    const modal = this.renderer.selectRootElement('#citylist', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  property_dialog_show() {
    this.show_Property.set(true)
    const modal = this.renderer.selectRootElement('#property', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  property_dialog_close() {
    this.show_Property.set(false)
    const modal = this.renderer.selectRootElement('#property', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


  relation_dialog_show() {
    const modal = this.renderer.selectRootElement('#relation', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  relation_dialog_close() {
    const modal = this.renderer.selectRootElement('#relation', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



}
