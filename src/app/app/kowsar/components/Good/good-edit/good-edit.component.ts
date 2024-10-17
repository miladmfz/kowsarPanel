import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { KowsarWebApiService } from '../../../services/KowsarWebApi.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Base_Lookup, GoodType_lookup } from '../../../lookup-type';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import * as convert from 'xml-js';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-good-edit',
  templateUrl: './good-edit.component.html',
})
export class GoodEditComponent extends AgGridBaseComponent implements OnInit {

  constructor(
    private repo: KowsarWebApiService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private location: Location,
  ) {
    super();
  }



  override ngOnInit(): void {
    super.ngOnInit();












    this.GetObjectTypeFromDbSetup()

    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.Code = id;

        this.Code_int = parseInt(this.Code);
        if (parseInt(this.Code) > 0) {
          this.getDetails();
        } else {
          this.EditForm_Base_reset()
        }

        this.GetColumnTable();
      }
    });


  }




  Add_To_KowsarTemplate() {
    (this.KowsarTemplate.get('Goods') as FormArray).push(
      this.EditForm_Base
    );

    return JSON.stringify(this.KowsarTemplate.value)
  }





  // #region Test

  // #endregion





  // #region Declare
  title = 'ایجاد نوع داده انتخابی';
  Code: string = '';
  Code_int: number = 0;

  GoodTypeStr: string = '';
  Image_list: any[] = [];
  Group_list: any[] = [];
  Stack_list: any[] = [];
  GoodType_lookup: GoodType_lookup[] = []



  temp_str: string = "";
  SingleItems: any[] = [];
  Propertys: any[] = [];
  GoodCode_str: string = "";
  GoodSubCode_str: string = "";
  GoodType_str: string = "";
  GoodName_str: string = "";

  KowsarTemplate = new FormGroup({
    Goods: new FormArray([])
  });




  JsonForm = new FormGroup({
    JsonData: new FormControl(""),
  });

  EditForm_Base = new FormGroup({
    GoodCode: new FormControl(0),
    GoodType: new FormControl(''),
    GoodName: new FormControl('', Validators.required),
    Type: new FormControl(0),
    UsedGood: new FormControl(0),
    // GoodMainCode: new FormControl(''),
    // GoodSubCode: new FormControl(''),
    MinSellPrice: new FormControl(0),
    MaxSellPrice: new FormControl(0),
    Isbn: new FormControl(''),
    FirstBarCode: new FormControl(''),
    BarCodePrintState: new FormControl('ندارد'),
    SellPriceType: new FormControl('1'),
    SellPrice1: new FormControl(0),
    SellPrice2: new FormControl(0),
    SellPrice3: new FormControl(0),
    SellPrice4: new FormControl(0),
    SellPrice5: new FormControl(0),
    SellPrice6: new FormControl(0),
    DefaultRatio: new FormControl(1),
    DefaultRatioValue: new FormControl(1),
    DefaultUnitValue: new FormControl(1),
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
    { id: "0", name: "کالای نو" },
    { id: "1", name: "دست دوم" },
    { id: "2", name: "در حد نو" },

  ]

  Type_Lookup: Base_Lookup[] = [
    { id: "0", name: "واقعی" },
    { id: "1", name: "مجازی" },
    { id: "2", name: "خدماتی" },
  ]



  // #endregion






  // #region Load_data

  getDetails() {
    this.EditForm_Base.reset();
    this.EditForm_Explain.reset();
    this.EditForm_Complete.reset();
    this.EditForm_Property.reset();

    this.repo.GetGood_base(this.Code).subscribe((data: any) => {

      this.EditForm_Base.patchValue({
        GoodCode: data.Goods[0].GoodCode,
        GoodType: data.Goods[0].GoodType,
        GoodName: data.Goods[0].GoodName,
        Type: data.Goods[0].Type,
        UsedGood: data.Goods[0].UsedGood,
        // GoodSubCode: data.Goods[0].GoodSubCode,
        // GoodMainCode: data.Goods[0].GoodMainCode,

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



    // this.repo.GetGood_Complete(this.Code).subscribe((data: any) => {

    //   this.EditForm_Complete.patchValue({
    //     GoodCode: data.Goods[0].GoodCode,
    //     GoodName: data.Goods[0].GoodName,
    //     GoodSubCode: data.Goods[0].GoodSubCode,
    //     MaxSellPrice: data.Goods[0].MaxSellPrice,
    //     MinSellPrice: data.Goods[0].MinSellPrice,
    //     MinAmount: data.Goods[0].MinAmount,
    //     MaxAmount: data.Goods[0].MaxAmount,
    //     SefareshPoint: data.Goods[0].SefareshPoint,
    //     MinBuyPrice: data.Goods[0].MinBuyPrice,
    //     MaxBuyPrice: data.Goods[0].MaxBuyPrice,
    //     CriticalPoint: data.Goods[0].CriticalPoint,
    //     MayorTax: data.Goods[0].MayorTax,
    //     Tax: data.Goods[0].Tax,
    //   });
    // });


    // this.repo.GetGood_Propertys(this.Code).subscribe((data: any) => {

    //   this.GoodTypeStr = data.Goods[0].GoodType;
    //   this.EditForm_Property.patchValue({
    //     GoodCode: data.Goods[0].GoodCode,
    //     GoodName: data.Goods[0].GoodName,
    //     GoodType: data.Goods[0].GoodType,
    //     Nvarchar1: data.Goods[0].Nvarchar1,
    //     Nvarchar2: data.Goods[0].Nvarchar2,
    //     Nvarchar3: data.Goods[0].Nvarchar3,
    //     Nvarchar4: data.Goods[0].Nvarchar4,
    //     Nvarchar5: data.Goods[0].Nvarchar5,
    //     Nvarchar6: data.Goods[0].Nvarchar6,
    //     Nvarchar7: data.Goods[0].Nvarchar7,
    //     Nvarchar8: data.Goods[0].Nvarchar8,
    //     Nvarchar9: data.Goods[0].Nvarchar9,
    //     Nvarchar10: data.Goods[0].Nvarchar10,
    //     Nvarchar11: data.Goods[0].Nvarchar11,
    //     Nvarchar12: data.Goods[0].Nvarchar12,
    //     Nvarchar13: data.Goods[0].Nvarchar13,
    //     Nvarchar14: data.Goods[0].Nvarchar14,
    //     Nvarchar15: data.Goods[0].Nvarchar15,
    //     Nvarchar16: data.Goods[0].Nvarchar16,
    //     Nvarchar17: data.Goods[0].Nvarchar17,
    //     Nvarchar18: data.Goods[0].Nvarchar18,
    //     Nvarchar19: data.Goods[0].Nvarchar19,
    //     Nvarchar20: data.Goods[0].Nvarchar20,
    //     Int1: data.Goods[0].Int1,
    //     Int2: data.Goods[0].Int2,
    //     Int3: data.Goods[0].Int3,
    //     Int4: data.Goods[0].Int4,
    //     Int5: data.Goods[0].Int5,
    //     Int6: data.Goods[0].Int6,
    //     Int7: data.Goods[0].Int7,
    //     Int8: data.Goods[0].Int8,
    //     Int9: data.Goods[0].Int9,
    //     Int10: data.Goods[0].Int10,
    //     Float1: data.Goods[0].Float1,
    //     Float2: data.Goods[0].Float2,
    //     Float3: data.Goods[0].Float3,
    //     Float4: data.Goods[0].Float4,
    //     Float5: data.Goods[0].Float5,
    //     Float6: data.Goods[0].Float6,
    //     Float7: data.Goods[0].Float7,
    //     Float8: data.Goods[0].Float8,
    //     Float9: data.Goods[0].Float9,
    //     Float10: data.Goods[0].Float10,
    //     Text1: data.Goods[0].Text1,
    //     Text2: data.Goods[0].Text2,
    //     Text3: data.Goods[0].Text3,
    //     Text4: data.Goods[0].Text4,
    //     Text5: data.Goods[0].Text5,
    //   });

    //   this.repo.GetProperty(this.GoodTypeStr).subscribe(e => {

    //     this.Propertys = e;



    //   });
    // });







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
      //    minWidth: 80
      // },

      {
        field: 'FileName',
        headerName: 'FileName',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'IsDefaultImage',
        headerName: 'IsDefaultImage',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'KsrImageCode',
        headerName: 'KsrImageCode',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
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
      //    minWidth: 80
      // },

      {
        field: 'GoodCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'GoodName',
        headerName: 'نام کالا  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'MaxSellPrice',
        headerName: ' قیمت ناخالص',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'GoodCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'GoodName',
        headerName: 'نام کالا  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'MaxSellPrice',
        headerName: ' قیمت ناخالص',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
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
      //    minWidth: 80
      // },

      {
        field: 'GoodCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'GoodName',
        headerName: 'نام کالا  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'MaxSellPrice',
        headerName: ' قیمت ناخالص',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'GoodCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'GoodName',
        headerName: 'نام کالا  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'MaxSellPrice',
        headerName: ' قیمت ناخالص',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];



  }

  GetLastGoodData() {
    this.repo.GetLastGoodData().subscribe((data: any) => {
      this.router.navigateByUrl('kowsar/good-edit', data.Goods[0].GoodCode);


    });
  }

  GetObjectTypeFromDbSetup() {
    this.repo.GetObjectTypeFromDbSetup("GoodType").subscribe((data: any) => {

      this.GoodType_lookup = data.ObjectTypes
      data.ObjectTypes.forEach((item: GoodType_lookup) => {
        if (item.IsDefault == "True") {
          this.EditForm_Base.patchValue({
            GoodType: item.aType
          });
        }
      });


    });
  }

  EditForm_Base_reset() {
    this.GetLastGoodData()

    this.repo.GetObjectTypeFromDbSetup("GoodType").subscribe((data: any) => {

      data.ObjectTypes.forEach((item: GoodType_lookup) => {
        if (item.IsDefault == "True") {
          this.EditForm_Base.patchValue({
            GoodType: item.aType
          });
        }
      });


    });



    this.EditForm_Base.patchValue({
      GoodCode: 0,
      GoodName: '',
      // GoodSubCode: '',
      // GoodMainCode: '',
      Isbn: '',
      FirstBarCode: '',
    });


    this.KowsarTemplate.patchValue({
      Goods: []
    });


  }


  // #endregion




  // #region Func

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

  // #endregion





  dismissDeleteSwal1(t) {
    if (t.dismiss === Swal.DismissReason.cancel) {
      Swal.fire('کنسل شد', 'اطلاعات تغییری نکرد', 'error');
    }
  }




  submit(action) {

    if (action == 'base') {

      this.EditForm_Base.markAllAsTouched();


      if (!this.EditForm_Base.valid) return;

      (this.KowsarTemplate.get('Goods') as FormArray).clear();
      (this.KowsarTemplate.get('Goods') as FormArray).push(
        this.EditForm_Base
      );

      console.log(JSON.stringify(this.KowsarTemplate.value))

      this.JsonForm.patchValue({
        JsonData: JSON.stringify(this.KowsarTemplate.value)
      });


      this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {



        if (data.response.Errormessage.length > 0) {

          this.notificationService.succeded();
          this.GetLastGoodData()

        }

        if (data.Goods[0].ErrorMessage == "") {
          this.notificationService.succeded();
          this.GetLastGoodData()
        } else {
          this.notificationService.error(data.Goods[0].ErrorMessage);
        }

      });






    } else if (action == 'base_exit') {

      this.EditForm_Base.markAllAsTouched();
      if (!this.EditForm_Base.valid) return;



      (this.KowsarTemplate.get('Goods') as FormArray).clear();
      (this.KowsarTemplate.get('Goods') as FormArray).push(
        this.EditForm_Base
      );

      console.log(JSON.stringify(this.KowsarTemplate.value))

      this.JsonForm.patchValue({
        JsonData: JSON.stringify(this.KowsarTemplate.value)
      });


      this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
        if (data.response.Errormessage.length > 0) {

          this.notificationService.succeded();
          this.location.back()
        }
        if (data.Goods[0].ErrorMessage == "") {
          this.notificationService.succeded();
          this.location.back()
        } else {
          this.notificationService.error(data.Goods[0].ErrorMessage);

        }
      });




    } else if (action == 'base_new') {
      this.EditForm_Base.markAllAsTouched();
      if (!this.EditForm_Base.valid) return;

      (this.KowsarTemplate.get('Goods') as FormArray).clear();
      (this.KowsarTemplate.get('Goods') as FormArray).push(
        this.EditForm_Base
      );

      console.log(JSON.stringify(this.KowsarTemplate.value))

      this.JsonForm.patchValue({
        JsonData: JSON.stringify(this.KowsarTemplate.value)
      });


      this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
        if (data.response.Errormessage.length > 0) {

          this.notificationService.succeded();
          this.EditForm_Base_reset()
        }

        if (data.Goods[0].ErrorMessage == "") {
          this.notificationService.succeded();

          this.EditForm_Base_reset()
        } else {
          this.notificationService.error(data.Goods[0].ErrorMessage);

        }


      });


    }







    if (action == 'explain') {

      (this.KowsarTemplate.get('Goods') as FormArray).clear();
      (this.KowsarTemplate.get('Goods') as FormArray).push(
        this.EditForm_Explain
      );

      console.log(JSON.stringify(this.KowsarTemplate.value))

      this.JsonForm.patchValue({
        JsonData: JSON.stringify(this.KowsarTemplate.value)
      });

      console.log(JSON.stringify(this.KowsarTemplate.value))

      this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {

        if (data.response.Errormessage.length > 0) {

          this.notificationService.succeded();

        }

        if (data.Goods[0].ErrorMessage == "") {
          this.notificationService.succeded();

          location.reload()
        } else {
          this.notificationService.error(data.Goods[0].ErrorMessage);
        }



      });

    } else if (action == 'explain_exit') {



      (this.KowsarTemplate.get('Goods') as FormArray).clear();
      (this.KowsarTemplate.get('Goods') as FormArray).push(
        this.EditForm_Explain
      );

      console.log(JSON.stringify(this.KowsarTemplate.value))

      this.JsonForm.patchValue({
        JsonData: JSON.stringify(this.KowsarTemplate.value)
      });

      console.log(JSON.stringify(this.KowsarTemplate.value))

      this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {

        if (data.response.Errormessage.length > 0) {

          this.notificationService.succeded();
          this.location.back()
        }


        if (data.Goods[0].ErrorMessage == "") {
          this.notificationService.succeded();
          this.location.back()
        } else {
          this.notificationService.error(data.Goods[0].ErrorMessage);
        }


      });



    }














  }





  handleCreateEditOps(action, id) {

    this.EditForm_Base.reset();
    this.Code = '';
    document.getElementById('GoodName').focus();
    //} else if (action == 'exit') {
    //   
    //} else {
    //  
    //}
  }

  onBtnCancelClick() {
    this.location.back()
  }

  fireAlarm_GoodAdd(text) {
    return Swal.fire({
      title: text,
      icon: 'warning',
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'بستن پنجره',
      customClass: {
        confirmButton: 'btn btn-success mx-2',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
  }


}