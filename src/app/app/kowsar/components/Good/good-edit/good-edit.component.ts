import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { KowsarWebApiService } from '../../../services/KowsarWebApi.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { operationSuccessful } from 'src/app/app-shell/framework-components/app-messages';
import { Base_Lookup, GoodType_lookup } from '../../../lookup-type';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import * as convert from 'xml-js';
import { LocalStorageService } from 'src/app/app-shell/framework-services/local.storage.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
@Component({
  selector: 'app-good-edit',
  templateUrl: './good-edit.component.html',
})
export class GoodEditComponent extends AgGridBaseComponent implements OnInit {
  title = 'ایجاد نوع داده انتخابی';
  Code: string = '';
  GoodTypeStr: string = '';
  constructor(
    private repo: KowsarWebApiService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private location: Location,
    localStorageService: LocalStorageService,
  ) {
    super(localStorageService);
  }




  Image_list: any[] = [];
  Group_list: any[] = [];
  Stack_list: any[] = [];



  temp_str: string = "";
  SingleItems: any[] = [];
  Propertys: any[] = [];
  GoodCode_str: string = "";
  GoodSubCode_str: string = "";
  GoodType_str: string = "";
  GoodName_str: string = "";


  EditForm_Base = new FormGroup({
    GoodCode: new FormControl(0),
    GoodType: new FormControl(''),
    GoodName: new FormControl(''),
    Type: new FormControl(0),
    UsedGood: new FormControl(0),
    GoodSubCode: new FormControl(0),
    MinSellPrice: new FormControl(0),
    MaxSellPrice: new FormControl(0),
    Isbn: new FormControl(''),
    FirstBarCode: new FormControl(''),
    BarCodePrintState: new FormControl(''),
    SellPriceType: new FormControl(''),
    SellPrice1: new FormControl(0),
    SellPrice2: new FormControl(0),
    SellPrice3: new FormControl(0),
    SellPrice4: new FormControl(0),
    SellPrice5: new FormControl(0),
    SellPrice6: new FormControl(0),
  });
  EditForm_Explain = new FormGroup({
    GoodCode: new FormControl(0),
    GoodSubCode: new FormControl(0),
    GoodName: new FormControl(''),
    GoodExplain1: new FormControl(''),
    GoodExplain2: new FormControl(''),
    GoodExplain3: new FormControl(''),
    GoodExplain4: new FormControl(''),
    GoodExplain5: new FormControl(''),
    GoodExplain6: new FormControl(''),
  });

  EditForm_Complete = new FormGroup({
    GoodCode: new FormControl(0),
    GoodSubCode: new FormControl(0),
    GoodName: new FormControl(''),
    MaxSellPrice: new FormControl(0),
    MinSellPrice: new FormControl(0),
    MinAmount: new FormControl(0),
    MaxAmount: new FormControl(0),
    SefareshPoint: new FormControl(0),
    MinBuyPrice: new FormControl(0),
    MaxBuyPrice: new FormControl(0),
    CriticalPoint: new FormControl(0),
    MayorTax: new FormControl(0),
    Tax: new FormControl(0),
  });

  EditForm_Property = new FormGroup({

    GoodCode: new FormControl(0),
    GoodName: new FormControl(''),
    GoodType: new FormControl(''),
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


  BarCodePrintState_Lookup: Base_Lookup[] = [
    { id: "1", name: "دارد" },
    { id: "0", name: "ندارد" }
  ]

  SellPriceType_Lookup: Base_Lookup[] = [
    { id: "1", name: "نسبی" },
    { id: "0", name: "مطلق" }
  ]

  UsedGood_Lookup: Base_Lookup[] = [
    { id: "True", name: "دست دوم" },
    { id: "False", name: "کالای نو" }
  ]

  Type_Lookup: Base_Lookup[] = [
    { id: "0", name: "واقعی" },
    { id: "1", name: "مجازی" },
    { id: "2", name: "خدماتی" },
  ]


  GoodType_lookup: GoodType_lookup[] = []








  override ngOnInit(): void {
    super.ngOnInit();
    //debugger
    this.GetObjectTypeFromDbSetup()
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.Code = id;
        this.getDetails();
      }
    });


    this.GetColumnTable();

  }

  GetGood_Relations() {

    this.repo.GetGood_Images(this.Code).subscribe((e: any) => {
      this.Image_list = e.Goods;
    });

    this.repo.GetGood_Groups(this.Code).subscribe((e: any) => {
      this.Group_list = e.Goods;
    });


    this.repo.GetGood_Stacks(this.Code).subscribe((e: any) => {
      this.Stack_list = e.Goods;
    });


    // this.repo.GetGoodImages(this.Code).subscribe((data) => {
    //   this.Grouprecords = data;

    // });


    // this.repo.GetGoodImages(this.Code).subscribe((data) => {
    //   this.Stackrecords = data;

    // });

  }


  GetColumnTable() {
    this.columnDefs1 = [
      // {
      //   field: 'عملیات',
      //   pinned: 'left',
      //   cellRenderer: CellActionGoodList,
      //   cellRendererParams: {
      //     editUrl: '/kowsar/good-edit',
      //   },
      //   width: 50,
      // },

      {
        field: 'FileName',
        headerName: 'FileName',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'IsDefaultImage',
        headerName: 'IsDefaultImage',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'KsrImageCode',
        headerName: 'KsrImageCode',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      }
    ];

    this.columnDefs2 = [
      // {
      //   field: 'عملیات',
      //   pinned: 'left',
      //   cellRenderer: CellActionGoodList,
      //   cellRendererParams: {
      //     editUrl: '/kowsar/good-edit',
      //   },
      //   width: 50,
      // },

      {
        field: 'GoodCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'GoodName',
        headerName: 'نام کالا  ',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'MaxSellPrice',
        headerName: ' قیمت ناخالص',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      }, {
        field: 'GoodCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'GoodName',
        headerName: 'نام کالا  ',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'MaxSellPrice',
        headerName: ' قیمت ناخالص',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },

    ];


    this.columnDefs3 = [
      // {
      //   field: 'عملیات',
      //   pinned: 'left',
      //   cellRenderer: CellActionGoodList,
      //   cellRendererParams: {
      //     editUrl: '/kowsar/good-edit',
      //   },
      //   width: 50,
      // },

      {
        field: 'GoodCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'GoodName',
        headerName: 'نام کالا  ',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'MaxSellPrice',
        headerName: ' قیمت ناخالص',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      }, {
        field: 'GoodCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'GoodName',
        headerName: 'نام کالا  ',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'MaxSellPrice',
        headerName: ' قیمت ناخالص',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },

    ];



  }




  GetObjectTypeFromDbSetup() {
    this.repo.GetObjectTypeFromDbSetup("GoodType").subscribe((data: any) => {

      this.GoodType_lookup = data.ObjectTypes


    });



  }





  getDetails() {
    this.repo.GetGood_base(this.Code).subscribe((data: any) => {

      this.EditForm_Base.patchValue({
        GoodCode: data.Goods[0].GoodCode,
        GoodType: data.Goods[0].GoodType,
        GoodName: data.Goods[0].GoodName,
        Type: data.Goods[0].Type,
        UsedGood: data.Goods[0].UsedGood,
        GoodSubCode: data.Goods[0].GoodSubCode,
        MinSellPrice: data.Goods[0].MinSellPrice,
        MaxSellPrice: data.Goods[0].MaxSellPrice,
        Isbn: data.Goods[0].Isbn,
        FirstBarCode: data.Goods[0].FirstBarCode,
        BarCodePrintState: data.Goods[0].BarCodePrintState,
        SellPriceType: data.Goods[0].SellPriceType,
        SellPrice1: data.Goods[0].SellPrice1,
        SellPrice2: data.Goods[0].SellPrice2,
        SellPrice3: data.Goods[0].SellPrice3,
        SellPrice4: data.Goods[0].SellPrice4,
        SellPrice5: data.Goods[0].SellPrice5,
        SellPrice6: data.Goods[0].SellPrice6,
      });

      this.GoodCode_str = data.Goods[0].GoodCode
      this.GoodSubCode_str = data.Goods[0].GoodSubCode
      this.GoodType_str = data.Goods[0].GoodType
      this.GoodName_str = data.Goods[0].GoodName
      this.GetGood_Relations()
    });

    this.repo.GetGood_Explain(this.Code).subscribe((data: any) => {

      this.EditForm_Explain.patchValue({
        GoodCode: data.Goods[0].GoodCode,
        GoodSubCode: data.Goods[0].GoodSubCode,
        GoodName: data.Goods[0].GoodName,
        GoodExplain1: data.Goods[0].GoodExplain1,
        GoodExplain2: data.Goods[0].GoodExplain2,
        GoodExplain3: data.Goods[0].GoodExplain3,
        GoodExplain4: data.Goods[0].GoodExplain4,
        GoodExplain5: data.Goods[0].GoodExplain5,
        GoodExplain6: data.Goods[0].GoodExplain6,
      });
    });



    this.repo.GetGood_Complete(this.Code).subscribe((data: any) => {

      this.EditForm_Complete.patchValue({
        GoodCode: data.Goods[0].GoodCode,
        GoodName: data.Goods[0].GoodName,
        GoodSubCode: data.Goods[0].GoodSubCode,
        MaxSellPrice: data.Goods[0].MaxSellPrice,
        MinSellPrice: data.Goods[0].MinSellPrice,
        MinAmount: data.Goods[0].MinAmount,
        MaxAmount: data.Goods[0].MaxAmount,
        SefareshPoint: data.Goods[0].SefareshPoint,
        MinBuyPrice: data.Goods[0].MinBuyPrice,
        MaxBuyPrice: data.Goods[0].MaxBuyPrice,
        CriticalPoint: data.Goods[0].CriticalPoint,
        MayorTax: data.Goods[0].MayorTax,
        Tax: data.Goods[0].Tax,
      });
    });

    this.repo.GetGood_Propertys(this.Code).subscribe((data: any) => {

      this.GoodTypeStr = data.Goods[0].GoodType;
      this.EditForm_Property.patchValue({
        GoodCode: data.Goods[0].GoodCode,
        GoodName: data.Goods[0].GoodName,
        GoodType: data.Goods[0].GoodType,
        Nvarchar1: data.Goods[0].Nvarchar1,
        Nvarchar2: data.Goods[0].Nvarchar2,
        Nvarchar3: data.Goods[0].Nvarchar3,
        Nvarchar4: data.Goods[0].Nvarchar4,
        Nvarchar5: data.Goods[0].Nvarchar5,
        Nvarchar6: data.Goods[0].Nvarchar6,
        Nvarchar7: data.Goods[0].Nvarchar7,
        Nvarchar8: data.Goods[0].Nvarchar8,
        Nvarchar9: data.Goods[0].Nvarchar9,
        Nvarchar10: data.Goods[0].Nvarchar10,
        Nvarchar11: data.Goods[0].Nvarchar11,
        Nvarchar12: data.Goods[0].Nvarchar12,
        Nvarchar13: data.Goods[0].Nvarchar13,
        Nvarchar14: data.Goods[0].Nvarchar14,
        Nvarchar15: data.Goods[0].Nvarchar15,
        Nvarchar16: data.Goods[0].Nvarchar16,
        Nvarchar17: data.Goods[0].Nvarchar17,
        Nvarchar18: data.Goods[0].Nvarchar18,
        Nvarchar19: data.Goods[0].Nvarchar19,
        Nvarchar20: data.Goods[0].Nvarchar20,
        Int1: data.Goods[0].Int1,
        Int2: data.Goods[0].Int2,
        Int3: data.Goods[0].Int3,
        Int4: data.Goods[0].Int4,
        Int5: data.Goods[0].Int5,
        Int6: data.Goods[0].Int6,
        Int7: data.Goods[0].Int7,
        Int8: data.Goods[0].Int8,
        Int9: data.Goods[0].Int9,
        Int10: data.Goods[0].Int10,
        Float1: data.Goods[0].Float1,
        Float2: data.Goods[0].Float2,
        Float3: data.Goods[0].Float3,
        Float4: data.Goods[0].Float4,
        Float5: data.Goods[0].Float5,
        Float6: data.Goods[0].Float6,
        Float7: data.Goods[0].Float7,
        Float8: data.Goods[0].Float8,
        Float9: data.Goods[0].Float9,
        Float10: data.Goods[0].Float10,
        Text1: data.Goods[0].Text1,
        Text2: data.Goods[0].Text2,
        Text3: data.Goods[0].Text3,
        Text4: data.Goods[0].Text4,
        Text5: data.Goods[0].Text5,
      });

      this.repo.GetProperty(this.GoodTypeStr).subscribe(e => {

        this.Propertys = e;



      });
    });







  }







  // دریافت داده‌ها از طریق HTTP یا محاسبه دیگر
  checkPropertyValueMap(textvalue: string) {
    for (const property of this.Propertys) {
      if (property.PropertyValueMap === textvalue) {
        return true; // اگر مقدار PropertyValueMap برابر با "Nvarchar6" باشد، true را برمی‌گرداند
      }
    }
    return false; // اگر هیچ مقداری مطابقت نداشته باشد، false را برمی‌گرداند
  }



  getDisplayNamesdsd(textvalue: string): string {

    for (var property of this.Propertys) {

      if (property.PropertyValueMap === textvalue) {
        if (textvalue == "Nvarchar20") {
          this.parseXmlToJson(property.PropertySchema)
        }

        return this.getDisplayName(property.PropertySchema);
      }
    }

    return "";

  }


  GetChoicesArray(textvalue: string) {


    for (var property of this.Propertys) {

      if (property.PropertyValueMap === textvalue) {
        const xmlString = property.PropertySchema;
        const options = { compact: true };
        const jsonResult = convert.xml2json(xmlString, options);
        const parsedObject = JSON.parse(jsonResult);
        return parsedObject.Fields.CHOICES.CHOICE;

      }
    }

    return false;




  }


  PropertyHasCHOICES(textvalue: string) {

    for (var property of this.Propertys) {

      if (property.PropertyValueMap === textvalue) {
        const xmlString = property.PropertySchema;
        const options = { compact: true };
        const jsonResult = convert.xml2json(xmlString, options);
        const parsedObject = JSON.parse(jsonResult);
        return ('CHOICES' in parsedObject.Fields);

      }
    }

    return false;

  }






  parseXmlToJson(xml) {

    const xmlString = xml;
    const options = { compact: true };
    const jsonResult = convert.xml2json(xmlString, options);
    const parsedObject = JSON.parse(jsonResult);



  }


  getDisplayName(xml): string {
    const xmlString = xml;
    const options = { compact: true };
    const jsonResult = convert.xml2json(xmlString, options);
    const parsedObject = JSON.parse(jsonResult);

    return parsedObject.Fields.DisplayName._text;
  }





  onSellPriceTypeChange() {

    const maxSellPrice: number = this.EditForm_Base.value.MaxSellPrice;
    const sellPrice1: number = this.EditForm_Base.value.SellPrice1;
    const sellPrice2: number = this.EditForm_Base.value.SellPrice2;
    const sellPrice3: number = this.EditForm_Base.value.SellPrice3;
    const sellPrice4: number = this.EditForm_Base.value.SellPrice4;
    const sellPrice5: number = this.EditForm_Base.value.SellPrice5;
    const sellPrice6: number = this.EditForm_Base.value.SellPrice6;

    if (this.EditForm_Base.value.SellPriceType == "1") {
      this.EditForm_Base.patchValue({
        SellPrice1: ((sellPrice1 * 100) / maxSellPrice),
        SellPrice2: ((sellPrice2 * 100) / maxSellPrice),
        SellPrice3: ((sellPrice3 * 100) / maxSellPrice),
        SellPrice4: ((sellPrice4 * 100) / maxSellPrice),
        SellPrice5: ((sellPrice5 * 100) / maxSellPrice),
        SellPrice6: ((sellPrice6 * 100) / maxSellPrice),
      });
    } else {
      this.EditForm_Base.patchValue({
        SellPrice1: (maxSellPrice * (sellPrice1 / 100)),
        SellPrice2: (maxSellPrice * (sellPrice2 / 100)),
        SellPrice3: (maxSellPrice * (sellPrice3 / 100)),
        SellPrice4: (maxSellPrice * (sellPrice4 / 100)),
        SellPrice5: (maxSellPrice * (sellPrice5 / 100)),
        SellPrice6: (maxSellPrice * (sellPrice6 / 100)),
      });
    }


  }


  onMaxPriceTypeChange() {

    const maxSellPrice: number = this.EditForm_Base.value.MaxSellPrice;
    this.EditForm_Base.patchValue({
      SellPrice1: 0,
      SellPrice2: 0,
      SellPrice3: 0,
      SellPrice4: 0,
      SellPrice5: 0,
      SellPrice6: 0,
    });


  }








  onBtnCancelClick() {
    this.router.navigateByUrl('incident/incident/list');
  }






  submit(action) {

    const command = this.EditForm_Base.value;
    if (action == 'delete') {
      // this.incidentService.delete(command.id).subscribe((id) => {
      //   this.handleCreateEditOps(action, id);
      // });
    }

    if (this.Code != "0") {


      this.repo.Good_Update_base(command).subscribe(e => {


        if (e[0].AppBrokerCustomerCode.length > 0) {

          if (action == 'exit') {
            this.location.back();
          } else if (action == 'new') {
            window.location.reload();
          }
        }

      });



    } else {

      this.repo.Good_Insert(command).subscribe(e => {


        if (e[0].AppBrokerCustomerCode.length > 0) {

          if (action == 'exit') {
            this.location.back();
          } else if (action == 'new') {
            window.location.reload();
          }
        }


      });




    }

  }

  handleCreateEditOps(action, id) {
    //debugger
    //if (action == 'new') {
    this.EditForm_Base.reset();
    //this.title = 'ایجاد کاربر جدید';
    this.Code = '';
    document.getElementById('GoodName').focus();
    //} else if (action == 'exit') {
    //  this.router.navigateByUrl('/user-management/user/list');
    //} else {
    //  this.title = 'ویرایش کاربر';
    //  this.router.navigateByUrl(`/user-management/user/edit/${id}`);
    //}

    this.notificationService.succeded(operationSuccessful);
  }


















}






































/*

constructor(
  private repo: KowsarWebApiService,
  private route: ActivatedRoute,
  private location: Location,
  private router: Router,
  private http: HttpClient,
  private formBuilder: UntypedFormBuilder

) { }

private cache: { [key: string]: any } = {}; // Basic caching object



SingleItems: any[] = [];

ActiveFlag: string = "";

formValues: any = {};
id: string = "0";
TagName: string = "";
ActiveState: string = "";

items: any[] = [];
Imageitem: string = '';
Broker_Prefactors: any[] = [];
CDCustNames: any[] = [];

items_Grp: any[] = [];




ngOnInit() {
  this.EmptyForm()
  if (this.route.snapshot.params['id']) {
    this.id = this.route.snapshot.params['id'];
  }
  this.LoadFromUrl(this.id);

}




logFormData() {
   parseInt(this.id));

  if (parseInt(this.id) > 0) {
     "Update Good");

    this.TagName = "Update Good";


    this.repo.Web_UpdateGoodDetail(
      this.formValues.GoodCode,
      this.formValues.GoodName,
      this.formValues.MaxSellprice,
      this.formValues.GoodExplain1,
      this.formValues.GoodExplain2,
      this.formValues.GoodExplain3,
      this.formValues.GoodExplain4,
      this.formValues.GoodExplain5,
      this.formValues.GoodExplain6,
    ).subscribe(e => {


      this.location.back();

    });


  } else {
     "insert good");


    this.repo.Web_InsertGood(
      this.formValues.GoodCode,
      this.formValues.GoodName,
      this.formValues.MaxSellprice,
      this.formValues.GoodExplain1,
      this.formValues.GoodExplain2,
      this.formValues.GoodExplain3,
      this.formValues.GoodExplain4,
      this.formValues.GoodExplain5,
      this.formValues.GoodExplain6
    ).subscribe(e => {

      this.location.back();

    });

  }

}




LoadFromUrl(id: string) {

  if (parseInt(this.id) > 0) {

    this.TagName = "Update Good";

     this.TagName);
    this.repo.GetGoodEdit(this.id).subscribe(e => {


      this.SingleItems = e
      this.LoadDataSet();
      this.repo.GetActiveGood(e[0].GoodCode).subscribe(e => {

         e[0].ActiveStack)

        if (e[0].ActiveStack == "True") {
           "true")
          this.btnRadioGroup2.setValue({ activestack: "Active" });

          this.ActiveState = "Active"

        } else {

          this.btnRadioGroup2.setValue({ activestack: "NotActive" });
           "false")
          this.ActiveState = "NotActive"

        }

      });
    });


  } else {
    this.TagName = "Create Good";
  }

}



LoadDataSet() {
  this.formValues = {
    GoodCode: this.SingleItems[0].GoodCode,
    GoodName: this.SingleItems[0].GoodName,
    MaxSellprice: this.SingleItems[0].MaxSellprice + "",
    GoodExplain1: this.SingleItems[0].GoodExplain1,
    GoodExplain2: this.SingleItems[0].GoodExplain2,
    GoodExplain3: this.SingleItems[0].GoodExplain3,
    GoodExplain4: this.SingleItems[0].GoodExplain4,
    GoodExplain5: this.SingleItems[0].GoodExplain5,
    GoodExplain6: this.SingleItems[0].GoodExplain6,
  };
  this.fetchImageData()



  this.repo.GetGroupFromGood(this.id).subscribe(e => {


    this.items_Grp = e


  });

}





EmptyForm() {
  this.formValues = {
    GoodCode: '',
    GoodName: '',
    MaxSellprice: '',
    GoodExplain1: '',
    GoodExplain2: '',
    GoodExplain3: '',
    GoodExplain4: '',
    GoodExplain5: '',
    GoodExplain6: '',
  };


}


DeleteGoodGroupCode(GoodGroupCode: string) {

  this.repo.DeleteGoodGroupCode(GoodGroupCode).subscribe(e => {
    location.reload();

  });

}




@ViewChild('imagePreview') imagePreview: ElementRef | undefined;

onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const imageData = e.target.result.split(',')[1]; // Get base64 data (remove the header)
      this.sendImageToServer(this.SingleItems[0].GoodCode, imageData); // Replace '12345' with your barcode value
    };
    reader.readAsDataURL(file);
  }
}




sendImageToServer(ObjectCode: string, imageData: string): void {

  const data = {
    ClassName: "TGood",
    ObjectCode: ObjectCode,
    image: imageData
  };
  const baseu = environment.baseUrl_KowsarWeb

  this.http.post<any>(baseu + 'UploadImage', data).subscribe(
    (response) => {

       response)
      location.reload();

    },
    (error) => {
      console.error('Error uploading image:', error);
    }
  );

}








imageData: string = ''; // Variable to hold the image data



fetchImageData() {
  const url = environment.baseUrl + 'GetWebImagess?pixelScale=300&ClassName=TGood&ObjectRef=' + this.SingleItems[0].GoodCode;

  this.http.get<any>(url).subscribe(
    (data: any) => {

       Image + " = Image")
       data.Text + " = data.Text")

      this.Imageitem = `data:${Image};base64,${data.Text}`;
       this.Imageitem.length + " = lengh")

    },
    (error) => {
      console.error('Error occurred while fetching image data:', error);
    }
  );
}




showUploadText: boolean = false;


btnRadioGroup2 = this.formBuilder.group({
  activestack: this.formBuilder.control({ value: '' })
});



setRadioValue(value: string): void {

  if (this.ActiveState != value) {

    this.ActiveState = value
    if (value == "Active") {

      this.ActiveFlag = "1"

    } else {

      this.ActiveFlag = "0"

    }
    this.repo.ChangeGoodActive(this.SingleItems[0].GoodCode, this.ActiveFlag).subscribe(e => {
      location.reload();

    });



  }

}


}







*/