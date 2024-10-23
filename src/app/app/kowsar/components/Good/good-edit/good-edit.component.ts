import { Component, OnInit, Renderer2 } from '@angular/core';
import { KowsarWebApiService } from '../../../services/KowsarWebApi.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Base_Lookup, GoodType_lookup } from '../../../lookup-type';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import * as convert from 'xml-js';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { GridOptions } from 'ag-grid-community';
import { CellActionGoodEditImage } from './cell-action-good-edit-image';
import { Observable, tap } from 'rxjs';
import { CellActionGoodImageBtn } from './cell-action-good-edit-image-btn';
import { CellActionGoodGroupBtn } from './cell-action-good-edit-group-btn';

@Component({
  selector: 'app-good-edit',
  templateUrl: './good-edit.component.html',
})
export class GoodEditComponent extends AgGridBaseComponent implements OnInit {

  constructor(
    private notificationService: NotificationService,
    private repo: KowsarWebApiService,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private location: Location,
    private router: Router,
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


  // #region Declare
  title = 'ایجاد نوع داده انتخابی';
  Code: string = '';
  Code_int: number = 0;
  Imageitem: string = '';
  GoodTypeStr: string = '';
  Image_list: any[] = [];
  Group_list: any[] = [];
  base_Group_list: any[] = [];
  base_Group_list1: any[] = [];


  base_Stack_list: any[] = [];

  Stack_list: any[] = [];
  originalValues: any = {};
  changedValues: any = {}; // Object to store changed values



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




  GoodToStack = new FormGroup({
    GoodIndex: new FormControl("1"),
    GoodCode: new FormControl(""),
    StackRef: new FormArray([])
  });

  GoodToGroup = new FormGroup({
    GoodIndex: new FormControl("1"),
    GoodCode: new FormControl(""),
    GoodGroup: new FormArray([])
  });


  GoodToProperty = new FormGroup({
    GoodIndex: new FormControl("1"),
    GoodCode: new FormControl(""),
    PropertyValue: new FormControl("")
  });

  EditForm_Base = new FormGroup({
    GoodIndex: new FormControl("1"),
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


  EditForm_Base_temp = new FormGroup({
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


  propertyDto = new FormGroup({

    ObjectType: new FormControl(''),
    ClassName: new FormControl(''),
    PropertyName: new FormControl(''),
    PropertyType: new FormControl(''),
    PropertyValueMap: new FormControl(''),
  });


  EditForm_Explain_temp = new FormGroup({

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


  EditForm_Explain = new FormGroup({
    GoodIndex: new FormControl("1"),

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
    GoodIndex: new FormControl("1"),

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

  EditForm_Complete_temp = new FormGroup({
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
    GoodIndex: new FormControl("1"),

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


  EditForm_Property_temp = new FormGroup({

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
    this.Loading_Modal_Response_show()

    this.EditForm_Base.reset();
    this.EditForm_Explain.reset();
    this.EditForm_Complete.reset();
    this.EditForm_Property.reset();

    this.LoadData_base()

    this.LoadData_explain()

    this.LoadData_complete()

    this.LoadData_GetStacks()


    this.LoadData_GetGoodsGrp()

    this.LoadData_property()


  }



  LoadData_GetStacks() {

    // Initial data fetch
    this.repo.GetStacks().subscribe((data: any) => {
      this.base_Stack_list = data.Stacks

    });

  }








  // Sample data from the API



  LoadData_base() {




    this.repo.GetGood_base(this.Code).subscribe((data: any) => {
      this.Loading_Modal_Response_close()
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

      this.EditForm_Base_temp.patchValue({
        GoodCode: this.EditForm_Base.value.GoodCode,
        GoodType: this.EditForm_Base.value.GoodType,
        GoodName: this.EditForm_Base.value.GoodName,
        Type: this.EditForm_Base.value.Type,
        UsedGood: this.EditForm_Base.value.UsedGood,
        //GoodSubCode: this.EditForm_Base.value.GoodSubCode,
        //GoodMainCode: this.EditForm_Base.value.GoodMainCode,
        MinSellPrice: this.EditForm_Base.value.MinSellPrice,
        MaxSellPrice: this.EditForm_Base.value.MaxSellPrice,
        Isbn: this.EditForm_Base.value.Isbn,
        FirstBarCode: this.EditForm_Base.value.FirstBarCode,
        BarCodePrintState: this.EditForm_Base.value.BarCodePrintState,
        SellPriceType: this.EditForm_Base.value.SellPriceType,
        SellPrice1: this.EditForm_Base.value.SellPrice1,
        SellPrice2: this.EditForm_Base.value.SellPrice2,
        SellPrice3: this.EditForm_Base.value.SellPrice3,
        SellPrice4: this.EditForm_Base.value.SellPrice4,
        SellPrice5: this.EditForm_Base.value.SellPrice5,
        SellPrice6: this.EditForm_Base.value.SellPrice6,
      });




      this.GoodCode_str = data.Goods[0].GoodCode
      this.GoodSubCode_str = data.Goods[0].GoodSubCode
      this.GoodType_str = data.Goods[0].GoodType
      this.GoodName_str = data.Goods[0].GoodName

      this.GetGood_Stacks_Relations()
      this.GetGood_Images_Relations()
      this.GetGood_Groups_Relations()

      this.EditForm_Base.valueChanges.subscribe((value) => {
        this.trackChanges(value);
      });

      // Initialize the form's original state to compare changes later
      this.originalValues = { ...this.EditForm_Base.value };

      this.changedValues = {};
    });








  }

  LoadData_explain() {
    // Initialize form tracking for changes


    // Initial data fetch
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

      this.EditForm_Explain_temp.patchValue({
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
      this.EditForm_Explain.valueChanges.subscribe((value) => {
        this.trackChanges(value);
      });

      // Initialize the form's original state to compare changes later
      this.originalValues = { ...this.EditForm_Explain.value };
      console.log()
      this.changedValues = {};
    });

  }

  LoadData_complete() {


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


      this.EditForm_Complete_temp.patchValue({
        GoodCode: this.EditForm_Complete.value.GoodCode,
        GoodName: this.EditForm_Complete.value.GoodName,
        GoodSubCode: this.EditForm_Complete.value.GoodSubCode,
        MaxSellPrice: this.EditForm_Complete.value.MaxSellPrice,
        MinSellPrice: this.EditForm_Complete.value.MinSellPrice,
        MinAmount: this.EditForm_Complete.value.MinAmount,
        MaxAmount: this.EditForm_Complete.value.MaxAmount,
        SefareshPoint: this.EditForm_Complete.value.SefareshPoint,
        MinBuyPrice: this.EditForm_Complete.value.MinBuyPrice,
        MaxBuyPrice: this.EditForm_Complete.value.MaxBuyPrice,
        CriticalPoint: this.EditForm_Complete.value.CriticalPoint,
        MayorTax: this.EditForm_Complete.value.MayorTax,
        Tax: this.EditForm_Complete.value.Tax,
      });

      this.EditForm_Complete.valueChanges.subscribe((value) => {
        this.trackChanges(value);
      });

      // Initialize the form's original state to compare changes later
      this.originalValues = { ...this.EditForm_Complete.value };

      this.changedValues = {};
    });


  }

  LoadData_property() {
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


      this.EditForm_Property_temp.patchValue({
        GoodCode: this.EditForm_Property.value.GoodCode,
        GoodName: this.EditForm_Property.value.GoodName,
        GoodType: this.EditForm_Property.value.GoodType,
        Nvarchar1: this.EditForm_Property.value.Nvarchar1,
        Nvarchar2: this.EditForm_Property.value.Nvarchar2,
        Nvarchar3: this.EditForm_Property.value.Nvarchar3,
        Nvarchar4: this.EditForm_Property.value.Nvarchar4,
        Nvarchar5: this.EditForm_Property.value.Nvarchar5,
        Nvarchar6: this.EditForm_Property.value.Nvarchar6,
        Nvarchar7: this.EditForm_Property.value.Nvarchar7,
        Nvarchar8: this.EditForm_Property.value.Nvarchar8,
        Nvarchar9: this.EditForm_Property.value.Nvarchar9,
        Nvarchar10: this.EditForm_Property.value.Nvarchar10,
        Nvarchar11: this.EditForm_Property.value.Nvarchar11,
        Nvarchar12: this.EditForm_Property.value.Nvarchar12,
        Nvarchar13: this.EditForm_Property.value.Nvarchar13,
        Nvarchar14: this.EditForm_Property.value.Nvarchar14,
        Nvarchar15: this.EditForm_Property.value.Nvarchar15,
        Nvarchar16: this.EditForm_Property.value.Nvarchar16,
        Nvarchar17: this.EditForm_Property.value.Nvarchar17,
        Nvarchar18: this.EditForm_Property.value.Nvarchar18,
        Nvarchar19: this.EditForm_Property.value.Nvarchar19,
        Nvarchar20: this.EditForm_Property.value.Nvarchar20,
        Int1: this.EditForm_Property.value.Int1,
        Int2: this.EditForm_Property.value.Int2,
        Int3: this.EditForm_Property.value.Int3,
        Int4: this.EditForm_Property.value.Int4,
        Int5: this.EditForm_Property.value.Int5,
        Int6: this.EditForm_Property.value.Int6,
        Int7: this.EditForm_Property.value.Int7,
        Int8: this.EditForm_Property.value.Int8,
        Int9: this.EditForm_Property.value.Int9,
        Int10: this.EditForm_Property.value.Int10,
        Float1: this.EditForm_Property.value.Float1,
        Float2: this.EditForm_Property.value.Float2,
        Float3: this.EditForm_Property.value.Float3,
        Float4: this.EditForm_Property.value.Float4,
        Float5: this.EditForm_Property.value.Float5,
        Float6: this.EditForm_Property.value.Float6,
        Float7: this.EditForm_Property.value.Float7,
        Float8: this.EditForm_Property.value.Float8,
        Float9: this.EditForm_Property.value.Float9,
        Float10: this.EditForm_Property.value.Float10,
        Text1: this.EditForm_Property.value.Text1,
        Text2: this.EditForm_Property.value.Text2,
        Text3: this.EditForm_Property.value.Text3,
        Text4: this.EditForm_Property.value.Text4,
        Text5: this.EditForm_Property.value.Text5,
      });
      this.EditForm_Property.valueChanges.subscribe((value) => {
        this.trackChanges(value);
      });

      // Initialize the form's original state to compare changes later
      this.originalValues = { ...this.EditForm_Property.value };

      this.changedValues = {};

      this.propertyDto.patchValue({

        ObjectType: this.GoodTypeStr,
      });

      this.repo.GetProperty(this.propertyDto.value).subscribe((data: any) => {

        this.Propertys = data.Propertys;



      });
    });
  }


  GetGood_Stacks_Relations() {
    this.repo.GetGood_Stacks(this.Code).subscribe((e: any) => {
      this.Stack_list = e.Goods;
    });
  }

  GetGood_Images_Relations() {
    this.repo.GetGood_Images(this.Code).subscribe((e: any) => {
      this.Image_list = e.Goods;
    });
  }

  GetGood_Groups_Relations() {
    this.repo.GetGood_Groups(this.Code).subscribe((e: any) => {
      this.Group_list = e.Goods;
    });
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
        field: 'Name',
        headerName: 'نام',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'Amount',
        headerName: 'تعداد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 80
      },
      {
        field: 'ReservedAmount',
        headerName: 'تعداد رزرو',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 80
      },
      {
        field: 'StackRef',
        headerName: 'کد انبار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 80
      },
      {
        field: 'ActiveStack',
        headerName: 'وضعیت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 80
      }
    ];

    this.columnDefs2 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionGoodGroupBtn,
        cellRendererParams: {
          editUrl: '/kowsar/good-edit',
        },
        width: 100
      },
      {
        field: 'Name',
        headerName: 'نام   ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'GoodGroupCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },


    ];


    this.columnDefs3 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionGoodImageBtn,
        cellRendererParams: {
          editUrl: '/kowsar/good-edit',
        },
        width: 150
      },
      {
        field: 'عملیات',
        cellRenderer: CellActionGoodEditImage,
        cellRendererParams: {
          editUrl: '/kowsar/good-edit',
        },
        width: 150
      },
      {
        field: 'ClassName',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'FileName',
        headerName: 'نام فایل  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.columnDefs4 = [
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
        field: 'Name',
        headerName: 'نام انبار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
        checkboxSelection: true,
      },
      {
        field: 'L1',
        headerName: 'L1',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50,
      }, {
        field: 'L2',
        headerName: 'L2',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50,
      }, {
        field: 'L3',
        headerName: 'L3',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50,
      }, {
        field: 'L4',
        headerName: 'L4',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50,
      }, {
        field: 'L5',
        headerName: 'L5',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50,
      },
      {
        field: 'StackCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },


    ];


    this.columnDefs5 = [
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
        field: 'Name',
        headerName: 'نام گروه',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
        checkboxSelection: true,
      },
      {
        field: 'L1',
        headerName: 'L1',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50,
      }, {
        field: 'L2',
        headerName: 'L2',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50,
      }, {
        field: 'L3',
        headerName: 'L3',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50,
      }, {
        field: 'L4',
        headerName: 'L4',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50,
      }, {
        field: 'L5',
        headerName: 'L5',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50,
      },
      {
        field: 'GroupCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },


    ];

    this.columnDefs6 = [
      {
        headerName: 'Group Name',
        field: 'ame', // Adjust according to your data structure
        cellRenderer: 'agGroupCellRenderer', // Use AG Grid's group cell renderer
        cellRendererParams: {
          suppressCount: true, // Optional, if you don't want to show child counts
        },
        checkboxSelection: true,
        getDataPath: this.getDataPath
      },
      // Add additional column definitions as necessary
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


  SetStack() {

    console.log(this.selectedRows);

    this.GoodToStack.patchValue({
      GoodCode: this.Code,
    });

    (this.GoodToStack.get('StackRef') as FormArray).clear();

    // (this.GoodToStack.get('StackRef') as FormArray).push(new FormControl(parseInt(this.selectedRows[0].StackCode, 10)));
    // Assuming selectedRows is an array of objects with a property StackCode
    this.selectedRows.forEach(row => {
      const stackCodeInt = parseInt(row.StackCode, 10);
      (this.GoodToStack.get('StackRef') as FormArray).push(new FormControl(stackCodeInt));
    });


    console.log(this.GoodToStack.value);




    (this.KowsarTemplate.get('Goods') as FormArray).clear();
    (this.KowsarTemplate.get('Goods') as FormArray).push(this.GoodToStack);

    console.log(this.KowsarTemplate.value);


    console.log(JSON.stringify(this.KowsarTemplate.value));

    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate.value)
    });


    console.log(this.JsonForm.value);

    this.Loading_Modal_Response_show()


    this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
      this.Loading_Modal_Response_close()

      if (data.response.Errormessage.length > 0) {
        this.changedValues = {};
        this.GetGood_Stacks_Relations()
        this.selectedRows = []
        this.stack_dialog_close()
      }

      if (data.Goods[0].ErrorMessage == "") {

        this.notificationService.succeded();
        this.GetGood_Stacks_Relations()
        this.selectedRows = []
        this.stack_dialog_close()

      } else {
        this.notificationService.error(data.Goods[0].ErrorMessage);

      }


    });




  }

  GetImageFromKsr(pixel, KsrImageCode): Observable<any> {

    return this.repo.GetImageFromServer(pixel, KsrImageCode).pipe(tap((data: any) => { })
    );
  }

  DeleteImagefromGood(KsrImageCode) {
    this.Loading_Modal_Response_show()

    this.repo.DeleteKsrImageCode(KsrImageCode).subscribe(e => {
      this.Loading_Modal_Response_close()

      this.notificationService.succeded();
      this.GetGood_Images_Relations()
    });
  }


  DeleteGroupfromGood(GoodGroupCode) {
    this.Loading_Modal_Response_show()

    this.repo.DeleteGoodGroupCode(GoodGroupCode).subscribe(e => {
      this.Loading_Modal_Response_close()

      this.notificationService.succeded();
      this.GetGood_Groups_Relations()
    });
  }


  ShowImageModal(pixel, KsrImageCode) {
    this.Loading_Modal_Response_show()

    this.repo.GetImageFromServer(pixel, KsrImageCode).subscribe((data: any) => {
      this.Loading_Modal_Response_close()

      this.showimage_dialog_show();
      this.Imageitem = `data:image;base64,${data.Text}`;

    });
  }



  SetGroup() {
    this.Loading_Modal_Response_show()

    console.log(this.selectedRows);

    this.GoodToGroup.patchValue({
      GoodCode: this.Code,
    });

    (this.GoodToGroup.get('GoodGroup') as FormArray).clear();

    // (this.GoodToGroup.get('GoodGroup') as FormArray).push(new FormControl(parseInt(this.selectedRows[0].StackCode, 10)));
    // Assuming selectedRows is an array of objects with a property StackCode
    this.selectedRows.forEach(row => {
      const GroupCodeInt = parseInt(row.GroupCode, 10);
      (this.GoodToGroup.get('GoodGroup') as FormArray).push(new FormControl(GroupCodeInt));
    });


    console.log(this.GoodToGroup.value);




    (this.KowsarTemplate.get('Goods') as FormArray).clear();
    (this.KowsarTemplate.get('Goods') as FormArray).push(this.GoodToGroup);

    console.log(this.KowsarTemplate.value);


    console.log(JSON.stringify(this.KowsarTemplate.value));

    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate.value)
    });


    console.log(this.JsonForm.value);



    this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
      this.Loading_Modal_Response_close()

      if (data.response.Errormessage.length > 0) {
        this.changedValues = {};
        this.GetGood_Groups_Relations()
        this.selectedRows = []
        this.group_dialog_close()
      }

      if (data.Goods[0].ErrorMessage == "") {

        this.notificationService.succeded();
        this.GetGood_Groups_Relations()
        this.selectedRows = []
        this.group_dialog_close()

      } else {
        this.notificationService.error(data.Goods[0].ErrorMessage);

      }


    });




  }


  onBtnCancelClick() {
    this.location.back()
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
        // if (textvalue == "Nvarchar20") {
        //   this.parseXmlToJson(property.PropertySchema)

        // }

        //return property.DisplayName;
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

  trackChanges(value: any) {
    this.changedValues['GoodCode'] = value['GoodCode'];
    // Compare the current form values with the original values
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        if (value[key] !== this.originalValues[key]) {
          this.changedValues[key] = value[key]; // Store the changed value
        } else if (key !== 'GoodCode') {
          // If it matches the original and it's not GoodCode, remove it from changedValues
          delete this.changedValues[key];
        }

      }
    }
  }


  changedValues_show() {
    return Object.keys(this.changedValues).length > 0
  }



  changedValues_cansel_base() {


    this.EditForm_Base.patchValue({
      GoodCode: this.EditForm_Base_temp.value.GoodCode,
      GoodType: this.EditForm_Base_temp.value.GoodType,
      GoodName: this.EditForm_Base_temp.value.GoodName,
      Type: this.EditForm_Base_temp.value.Type,
      UsedGood: this.EditForm_Base_temp.value.UsedGood,
      //GoodSubCode: this.EditForm_Base_temp.value.GoodSubCode,
      //GoodMainCode: this.EditForm_Base_temp.value.GoodMainCode,
      MinSellPrice: this.EditForm_Base_temp.value.MinSellPrice,
      MaxSellPrice: this.EditForm_Base_temp.value.MaxSellPrice,
      Isbn: this.EditForm_Base_temp.value.Isbn,
      FirstBarCode: this.EditForm_Base_temp.value.FirstBarCode,
      BarCodePrintState: this.EditForm_Base_temp.value.BarCodePrintState,
      SellPriceType: this.EditForm_Base_temp.value.SellPriceType,
      SellPrice1: this.EditForm_Base_temp.value.SellPrice1,
      SellPrice2: this.EditForm_Base_temp.value.SellPrice2,
      SellPrice3: this.EditForm_Base_temp.value.SellPrice3,
      SellPrice4: this.EditForm_Base_temp.value.SellPrice4,
      SellPrice5: this.EditForm_Base_temp.value.SellPrice5,
      SellPrice6: this.EditForm_Base_temp.value.SellPrice6,
    });



    this.changedValues = {};


  }

  changedValues_cansel_explain() {
    this.EditForm_Explain.patchValue({
      GoodCode: this.EditForm_Explain_temp.value.GoodCode,
      GoodSubCode: this.EditForm_Explain_temp.value.GoodSubCode,
      GoodName: this.EditForm_Explain_temp.value.GoodName,
      GoodExplain1: this.EditForm_Explain_temp.value.GoodExplain1,
      GoodExplain2: this.EditForm_Explain_temp.value.GoodExplain2,
      GoodExplain3: this.EditForm_Explain_temp.value.GoodExplain3,
      GoodExplain4: this.EditForm_Explain_temp.value.GoodExplain4,
      GoodExplain5: this.EditForm_Explain_temp.value.GoodExplain5,
      GoodExplain6: this.EditForm_Explain_temp.value.GoodExplain6,
    });

    this.changedValues = {};


  }

  changedValues_cansel_property() {



    this.EditForm_Property.patchValue({
      GoodCode: this.EditForm_Property_temp.value.GoodCode,
      GoodName: this.EditForm_Property_temp.value.GoodName,
      GoodType: this.EditForm_Property_temp.value.GoodType,
      Nvarchar1: this.EditForm_Property_temp.value.Nvarchar1,
      Nvarchar2: this.EditForm_Property_temp.value.Nvarchar2,
      Nvarchar3: this.EditForm_Property_temp.value.Nvarchar3,
      Nvarchar4: this.EditForm_Property_temp.value.Nvarchar4,
      Nvarchar5: this.EditForm_Property_temp.value.Nvarchar5,
      Nvarchar6: this.EditForm_Property_temp.value.Nvarchar6,
      Nvarchar7: this.EditForm_Property_temp.value.Nvarchar7,
      Nvarchar8: this.EditForm_Property_temp.value.Nvarchar8,
      Nvarchar9: this.EditForm_Property_temp.value.Nvarchar9,
      Nvarchar10: this.EditForm_Property_temp.value.Nvarchar10,
      Nvarchar11: this.EditForm_Property_temp.value.Nvarchar11,
      Nvarchar12: this.EditForm_Property_temp.value.Nvarchar12,
      Nvarchar13: this.EditForm_Property_temp.value.Nvarchar13,
      Nvarchar14: this.EditForm_Property_temp.value.Nvarchar14,
      Nvarchar15: this.EditForm_Property_temp.value.Nvarchar15,
      Nvarchar16: this.EditForm_Property_temp.value.Nvarchar16,
      Nvarchar17: this.EditForm_Property_temp.value.Nvarchar17,
      Nvarchar18: this.EditForm_Property_temp.value.Nvarchar18,
      Nvarchar19: this.EditForm_Property_temp.value.Nvarchar19,
      Nvarchar20: this.EditForm_Property_temp.value.Nvarchar20,
      Int1: this.EditForm_Property_temp.value.Int1,
      Int2: this.EditForm_Property_temp.value.Int2,
      Int3: this.EditForm_Property_temp.value.Int3,
      Int4: this.EditForm_Property_temp.value.Int4,
      Int5: this.EditForm_Property_temp.value.Int5,
      Int6: this.EditForm_Property_temp.value.Int6,
      Int7: this.EditForm_Property_temp.value.Int7,
      Int8: this.EditForm_Property_temp.value.Int8,
      Int9: this.EditForm_Property_temp.value.Int9,
      Int10: this.EditForm_Property_temp.value.Int10,
      Float1: this.EditForm_Property_temp.value.Float1,
      Float2: this.EditForm_Property_temp.value.Float2,
      Float3: this.EditForm_Property_temp.value.Float3,
      Float4: this.EditForm_Property_temp.value.Float4,
      Float5: this.EditForm_Property_temp.value.Float5,
      Float6: this.EditForm_Property_temp.value.Float6,
      Float7: this.EditForm_Property_temp.value.Float7,
      Float8: this.EditForm_Property_temp.value.Float8,
      Float9: this.EditForm_Property_temp.value.Float9,
      Float10: this.EditForm_Property_temp.value.Float10,
      Text1: this.EditForm_Property_temp.value.Text1,
      Text2: this.EditForm_Property_temp.value.Text2,
      Text3: this.EditForm_Property_temp.value.Text3,
      Text4: this.EditForm_Property_temp.value.Text4,
      Text5: this.EditForm_Property_temp.value.Text5,
    });

    this.changedValues = {};


  }




  changedValues_cansel_complete() {

    this.EditForm_Complete.patchValue({
      GoodCode: this.EditForm_Complete_temp.value.GoodCode,
      GoodName: this.EditForm_Complete_temp.value.GoodName,
      GoodSubCode: this.EditForm_Complete_temp.value.GoodSubCode,
      MaxSellPrice: this.EditForm_Complete_temp.value.MaxSellPrice,
      MinSellPrice: this.EditForm_Complete_temp.value.MinSellPrice,
      MinAmount: this.EditForm_Complete_temp.value.MinAmount,
      MaxAmount: this.EditForm_Complete_temp.value.MaxAmount,
      SefareshPoint: this.EditForm_Complete_temp.value.SefareshPoint,
      MinBuyPrice: this.EditForm_Complete_temp.value.MinBuyPrice,
      MaxBuyPrice: this.EditForm_Complete_temp.value.MaxBuyPrice,
      CriticalPoint: this.EditForm_Complete_temp.value.CriticalPoint,
      MayorTax: this.EditForm_Complete_temp.value.MayorTax,
      Tax: this.EditForm_Complete_temp.value.Tax,
    });

    this.changedValues = {};


  }


  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageData = e.target.result.split(',')[1]; // Get base64 data (remove the header)
        this.sendImageToServer(this.Code, imageData); // Replace '12345' with your barcode value
      };
      reader.readAsDataURL(file);
    }
  }



  sendImageToServer(ObjectCode: string, imageData: string): void {
    this.Loading_Modal_Response_show()

    const data = {
      ClassName: "TGood",
      ObjectCode: ObjectCode,
      image: imageData
    };
    console.log(data)

    this.repo.SendImageToServer(data).subscribe((response) => {
      this.Loading_Modal_Response_close()
      this.notificationService.succeded()
      this.GetGood_Images_Relations();
    });

  }

  // #endregion







  // #region submit

  submit(action) {

    if (action == 'base') {

      this.EditForm_Base.markAllAsTouched();


      if (!this.EditForm_Base.valid) return;

      // (this.KowsarTemplate.get('Goods') as FormArray).clear();
      // (this.KowsarTemplate.get('Goods') as FormArray).push(
      //   this.EditForm_Base
      // );


      if (Object.keys(this.changedValues).length > 0) {


        (this.KowsarTemplate.get('Goods') as FormArray).clear();


        const formGroup = new FormGroup(
          Object.keys(this.changedValues).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues[key]);
            return acc;
          }, {})
        );


        (this.KowsarTemplate.get('Goods') as FormArray).push(formGroup);
        console.log(JSON.stringify(this.KowsarTemplate.value))

        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        this.Loading_Modal_Response_show()

        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.Loading_Modal_Response_close()



          if (data.response.Errormessage.length > 0) {

            this.notificationService.succeded();
            this.changedValues = {};
            this.GetLastGoodData()

          }

          if (data.Goods[0].ErrorMessage == "") {
            this.notificationService.succeded();
            this.changedValues = {};
            this.GetLastGoodData()
          } else {
            this.notificationService.error(data.Goods[0].ErrorMessage);
          }

        });



      }


    } else if (action == 'base_exit') {

      this.EditForm_Base.markAllAsTouched();
      if (!this.EditForm_Base.valid) return;



      // (this.KowsarTemplate.get('Goods') as FormArray).clear();
      // (this.KowsarTemplate.get('Goods') as FormArray).push(
      //   this.EditForm_Base
      // );

      if (Object.keys(this.changedValues).length > 0) {


        (this.KowsarTemplate.get('Goods') as FormArray).clear();


        const formGroup = new FormGroup(
          Object.keys(this.changedValues).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues[key]);
            return acc;
          }, {})
        );


        (this.KowsarTemplate.get('Goods') as FormArray).push(formGroup);

        console.log(JSON.stringify(this.KowsarTemplate.value))

        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        this.Loading_Modal_Response_show()

        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.Loading_Modal_Response_close()

          if (data.response.Errormessage.length > 0) {

            this.notificationService.succeded();
            this.changedValues = {};
            this.location.back()
          }
          if (data.Goods[0].ErrorMessage == "") {
            this.notificationService.succeded();
            this.changedValues = {};
            this.location.back()
          } else {
            this.notificationService.error(data.Goods[0].ErrorMessage);

          }
        });

      }


    } else if (action == 'base_new') {
      this.EditForm_Base.markAllAsTouched();
      if (!this.EditForm_Base.valid) return;


      if (Object.keys(this.changedValues).length > 0) {


        (this.KowsarTemplate.get('Goods') as FormArray).clear();


        const formGroup = new FormGroup(
          Object.keys(this.changedValues).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues[key]);
            return acc;
          }, {})
        );


        (this.KowsarTemplate.get('Goods') as FormArray).push(formGroup);


        // (this.KowsarTemplate.get('Goods') as FormArray).clear();
        // (this.KowsarTemplate.get('Goods') as FormArray).push(
        //   this.EditForm_Base
        // );

        // console.log(JSON.stringify(this.KowsarTemplate.value))

        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        this.Loading_Modal_Response_show()

        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.Loading_Modal_Response_close()

          if (data.response.Errormessage.length > 0) {
            this.changedValues = {};
            this.notificationService.succeded();
            this.EditForm_Base_reset()
          }

          if (data.Goods[0].ErrorMessage == "") {
            this.notificationService.succeded();
            this.changedValues = {};
            this.EditForm_Base_reset()
          } else {
            this.notificationService.error(data.Goods[0].ErrorMessage);

          }


        });

      }

    }







    if (action == 'explain') {
      console.log("0")
      if (Object.keys(this.changedValues).length > 0) {


        (this.KowsarTemplate.get('Goods') as FormArray).clear();


        const formGroup = new FormGroup(
          Object.keys(this.changedValues).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues[key]);
            return acc;
          }, {})
        );


        (this.KowsarTemplate.get('Goods') as FormArray).push(formGroup);


        console.log(JSON.stringify(this.KowsarTemplate.value))

        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        console.log(JSON.stringify(this.KowsarTemplate.value))
        this.Loading_Modal_Response_show()

        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.Loading_Modal_Response_close()

          if (data.response.Errormessage.length > 0) {

            this.notificationService.succeded();
            this.changedValues = {};
          }

          if (data.Goods[0].ErrorMessage == "") {
            this.notificationService.succeded();
            this.changedValues = {};
            location.reload()
          } else {
            this.notificationService.error(data.Goods[0].ErrorMessage);
          }



        });
      } else {
        console.log('No changes detected');
      }


    } else if (action == 'explain_exit') {


      if (Object.keys(this.changedValues).length > 0) {


        (this.KowsarTemplate.get('Goods') as FormArray).clear();


        const formGroup = new FormGroup(
          Object.keys(this.changedValues).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues[key]);
            return acc;
          }, {})
        );


        (this.KowsarTemplate.get('Goods') as FormArray).push(formGroup);



        console.log(JSON.stringify(this.KowsarTemplate.value))

        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        console.log(JSON.stringify(this.KowsarTemplate.value))
        this.Loading_Modal_Response_show()

        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.Loading_Modal_Response_close()

          if (data.response.Errormessage.length > 0) {

            this.notificationService.succeded();
            this.location.back()
            location.reload()
          }


          if (data.Goods[0].ErrorMessage == "") {
            this.notificationService.succeded();
            location.reload()
            this.location.back()
          } else {
            this.notificationService.error(data.Goods[0].ErrorMessage);
          }


        });
      } else {
        console.log('No changes detected');
      }




    }


    if (action == 'complete') {
      console.log("0")
      if (Object.keys(this.changedValues).length > 0) {


        (this.KowsarTemplate.get('Goods') as FormArray).clear();


        const formGroup = new FormGroup(
          Object.keys(this.changedValues).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues[key]);
            return acc;
          }, {})
        );


        (this.KowsarTemplate.get('Goods') as FormArray).push(formGroup);


        console.log(JSON.stringify(this.KowsarTemplate.value))

        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        console.log(JSON.stringify(this.KowsarTemplate.value))
        this.Loading_Modal_Response_show()

        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.Loading_Modal_Response_close()

          if (data.response.Errormessage.length > 0) {

            this.notificationService.succeded();
            this.changedValues = {};
          }

          if (data.Goods[0].ErrorMessage == "") {
            this.notificationService.succeded();
            this.changedValues = {};
            location.reload()
          } else {
            this.notificationService.error(data.Goods[0].ErrorMessage);
          }



        });
      } else {
        console.log('No changes detected');
      }


    } else if (action == 'complete_exit') {


      if (Object.keys(this.changedValues).length > 0) {


        (this.KowsarTemplate.get('Goods') as FormArray).clear();


        const formGroup = new FormGroup(
          Object.keys(this.changedValues).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues[key]);
            return acc;
          }, {})
        );


        (this.KowsarTemplate.get('Goods') as FormArray).push(formGroup);



        console.log(JSON.stringify(this.KowsarTemplate.value))

        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        console.log(JSON.stringify(this.KowsarTemplate.value))
        this.Loading_Modal_Response_show()

        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.Loading_Modal_Response_close()

          if (data.response.Errormessage.length > 0) {

            this.notificationService.succeded();
            this.location.back()
            location.reload()
          }


          if (data.Goods[0].ErrorMessage == "") {
            this.notificationService.succeded();
            location.reload()
            this.location.back()
          } else {
            this.notificationService.error(data.Goods[0].ErrorMessage);
          }


        });
      } else {
        console.log('No changes detected');
      }




    }


    if (action == 'property') {






      if (Object.keys(this.changedValues).length > 0) {

        const formGroup = new FormGroup(
          Object.keys(this.changedValues).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues[key]);
            return acc;
          }, {})
        );

        this.GoodToProperty.patchValue({
          GoodCode: this.Code,
          PropertyValue: JSON.parse(JSON.stringify(formGroup.value)),
        });



        (this.KowsarTemplate.get('Goods') as FormArray).clear();
        (this.KowsarTemplate.get('Goods') as FormArray).push(this.GoodToProperty);



        console.log(JSON.stringify(this.KowsarTemplate.value))

        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        console.log(JSON.stringify(this.KowsarTemplate.value))
        this.Loading_Modal_Response_show()

        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.Loading_Modal_Response_close()

          if (data.response.Errormessage.length > 0) {

            this.notificationService.succeded();
            this.changedValues = {};
          }

          if (data.Goods[0].ErrorMessage == "") {
            this.notificationService.succeded();
            this.changedValues = {};
            location.reload()
          } else {
            this.notificationService.error(data.Goods[0].ErrorMessage);
          }



        });


      } else {
        console.log('No changes detected');
      }


    } else if (action == 'property_exit') {


      if (Object.keys(this.changedValues).length > 0) {

        const formGroup = new FormGroup(
          Object.keys(this.changedValues).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues[key]);
            return acc;
          }, {})
        );

        this.GoodToProperty.patchValue({
          GoodCode: this.Code,
          PropertyValue: JSON.parse(JSON.stringify(formGroup.value)),
        });




        (this.KowsarTemplate.get('Goods') as FormArray).clear();
        (this.KowsarTemplate.get('Goods') as FormArray).push(this.GoodToProperty);



        console.log(JSON.stringify(this.KowsarTemplate.value))

        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        console.log(JSON.stringify(this.KowsarTemplate.value))
        this.Loading_Modal_Response_show()

        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.Loading_Modal_Response_close()

          if (data.response.Errormessage.length > 0) {

            this.notificationService.succeded();
            this.location.back()
            location.reload()
          }


          if (data.Goods[0].ErrorMessage == "") {
            this.notificationService.succeded();
            location.reload()
            this.location.back()
          } else {
            this.notificationService.error(data.Goods[0].ErrorMessage);
          }


        });


      } else {
        console.log('No changes detected');
      }




    }











  }

  // #endregion







  // #region modal

  AddStack() {
    this.stack_dialog_show()
  }
  AddGroup() {
    this.group_dialog_show()

  }


  stack_dialog_show() {
    const modal = this.renderer.selectRootElement('#stacklist', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  stack_dialog_close() {
    const modal = this.renderer.selectRootElement('#stacklist', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  group_dialog_show() {
    const modal = this.renderer.selectRootElement('#grouplist', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  group_dialog_close() {
    const modal = this.renderer.selectRootElement('#grouplist', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  showimage_dialog_show() {
    const modal = this.renderer.selectRootElement('#showimagemodal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  showimage_dialog_close() {
    const modal = this.renderer.selectRootElement('#showimagemodal', true);
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












  public gridOptions: GridOptions;




  getDataPath = (data: Group) => {
    const path: string[] = [];

    // Construct the path based on L1, L2, L3, L4, and L5
    if (data.L1 !== '0') {
      const parentL1 = this.findGroupByCode(data.L1);
      if (parentL1) {
        path.push(parentL1.Name); // Add the L1 parent group name
      }
    }

    if (data.L2 !== '0') {
      const parentL2 = this.findGroupByCode(data.L2);
      if (parentL2) {
        path.push(parentL2.Name); // Add the L2 parent group name
      }
    }

    if (data.L3 !== '0') {
      const parentL3 = this.findGroupByCode(data.L3);
      if (parentL3) {
        path.push(parentL3.Name); // Add the L3 parent group name
      }
    }

    if (data.L4 !== '0') {
      const parentL4 = this.findGroupByCode(data.L4);
      if (parentL4) {
        path.push(parentL4.Name); // Add the L4 parent group name
      }
    }

    // Finally, add the current group's name
    path.push(data.Name);

    return path;
  };

  // Helper method to find a group by its GroupCode
  findGroupByCode(groupCode: string): Group | undefined {
    return this.base_Group_list.find(group => group.GroupCode === groupCode);
  }













  buildTree(groups: Group[]): Group[] {
    const groupMap = new Map<string, Group>();

    // Step 1: Create a map of groups for easy lookup
    for (const group of groups) {
      group.children = [];
      groupMap.set(group.GroupCode, group);
    }

    // Step 2: Build the tree structure
    const tree: Group[] = [];

    for (const group of groups) {
      const { L1, L2, L3, L4, L5, GroupCode } = group;

      // Determine the parent based on the L values
      let parent: Group | undefined;

      if (L1 === '0') {
        // Top-level group (L1 is 0)
        tree.push(group);
      } else {
        // Find the appropriate parent group
        if (L2 === '0') {
          parent = groupMap.get(L1); // Parent is L1
        } else if (L3 === '0') {
          parent = groupMap.get(L2); // Parent is L2
        } else if (L4 === '0') {
          parent = groupMap.get(L3); // Parent is L3
        } else if (L5 === '0') {
          parent = groupMap.get(L4); // Parent is L4
        } else {
          parent = groupMap.get(L5); // Parent is L5
        }

        // If a parent is found, push this group to its children's array
        if (parent) {
          parent.children.push(group);
        }
      }
    }

    return tree;
  }



  onRowSelected(event: any) {
    const selected = event.node.isSelected();
    const groupCode = event.data.GroupCode;

    // Find all children of the selected group
    const childNodes = this.gridApi.getAllNodes().filter(node => node.data.L1 === groupCode);

    // Check or uncheck all child nodes based on the selected state of the parent node
    childNodes.forEach(childNode => {
      childNode.setSelected(selected);
    });
  }







  LoadData_GetGoodsGrp() {

    // Initial data fetch
    this.repo.GetGoodsGrp().subscribe((data: any) => {
      this.base_Group_list = data.GoodsGrps

      const treeStructure = this.buildTree(data.GoodsGrps);
      console.log(JSON.stringify(treeStructure, null, 2));

      // this.gridOptions = {
      //   // Configure your grid options here
      //   getDataPath: this.getDataPath.bind(this),
      //   // Add other options like columnDefs, etc.
      // };

      // // Example data


      // console.log('Row Data:', JSON.stringify(this.buildTree(this.base_Group_list), null, 2)); // Log the row data structure


    });

  }



}







interface Group {
  GroupCode: string;
  L1: string;
  L2: string;
  L3: string;
  L4: string;
  L5: string;
  Name: string;
  children?: Group[];
}




// Example usage:



