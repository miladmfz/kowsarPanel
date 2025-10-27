import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
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
import { Observable, Subscription, tap } from 'rxjs';
import { CellActionGoodImageBtn } from './cell-action-good-edit-image-btn';
import { CellActionGoodGroupBtn } from './cell-action-good-edit-group-btn';
import Swal from 'sweetalert2';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { LoadingService } from 'src/app/app-shell/framework-services/loading.service';

@Component({
    selector: 'app-good-edit',
    templateUrl: './good-edit.component.html',
    standalone: false
})
export class GoodEditComponent extends AgGridBaseComponent implements OnInit {

  constructor(
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private repo: KowsarWebApiService,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private location: Location,
    private router: Router,
    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }
  ngOnDestroy() {

    this.themeSub.unsubscribe();

  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
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
      } else {

        this.EditForm_Base_reset()
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
  SellPriceType_Str: string = '';

  Errormsg_property: string = '';

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
    GoodMainCode: new FormControl(''),
    GoodSubCode: new FormControl(''),
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
    GoodMainCode: new FormControl(''),
    GoodSubCode: new FormControl(''),
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
    this.loadingService.show()
    this.changedValues = {};
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


  LoadData_GetGoodsGrp() {

    // Initial data fetch
    this.repo.GetGoodsGrp().subscribe((data: any) => {
      this.base_Group_list = data.GoodsGrps

      const treeStructure = this.buildTree_group(data.GoodsGrps);



    });

  }

  LoadData_GetStacks() {

    // Initial data fetch
    this.repo.GetStacks().subscribe((data: any) => {
      this.base_Stack_list = data.Stacks

      const treeStructure = this.buildTree_stack(data.Stacks);

    });

  }








  // Sample data from the API



  LoadData_base() {




    this.repo.GetGood_base(this.Code).subscribe((data: any) => {
      this.loadingService.hide()
      this.SellPriceType_Str = data.Goods[0].SellPriceType

      this.EditForm_Base.patchValue({
        GoodCode: data.Goods[0].GoodCode,
        GoodType: data.Goods[0].GoodType,
        GoodName: data.Goods[0].GoodName,
        Type: data.Goods[0].Type,
        UsedGood: data.Goods[0].UsedGood,
        GoodSubCode: data.Goods[0].GoodSubCode,
        GoodMainCode: data.Goods[0].GoodMainCode,
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
        GoodSubCode: this.EditForm_Base.value.GoodSubCode,
        GoodMainCode: this.EditForm_Base.value.GoodMainCode,
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


  // Assuming this is part of an asynchronous operation or a function
  Checkproperty() {
    if (this.Errormsg_property.length > 0) {
      this.setinitial_property()
    }
  }
  setinitial_property() {


    this.EditForm_Property.valueChanges.subscribe((value) => {
      this.trackChanges(value);
    });

    // Initialize the form's original state to compare changes later
    this.originalValues = { ...this.EditForm_Property.value };
    this.EditForm_Property.patchValue({
      GoodCode: parseInt(this.Code),
      Nvarchar1: "",
    });

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

    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate.value)
    });

    this.loadingService.show()


    this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
      this.loadingService.hide()
      const result = JSON.parse(data.Goods[0].Result);

      if (result.Goods && result.Goods[0].ErrMessage === "") {
        this.notificationService.succeded();
        this.changedValues = {};
        this.LoadData_property()
      } else {
        this.notificationService.error(result.Goods[0].ErrMessage);
      }

    });



  }

  LoadData_property() {
    this.repo.GetGood_Propertys(this.Code).subscribe((data: any) => {
      if (data.response) {
        this.Errormsg_property = data.response.Errormessage
      } else {
        this.Errormsg_property = ""
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
      }

      // this.GoodTypeStr = data.Goods[0].GoodType;
      // this.EditForm_Property.patchValue({
      //   GoodCode: data.Goods[0].GoodCode,
      //   GoodName: data.Goods[0].GoodName,
      //   GoodType: data.Goods[0].GoodType,
      //   Nvarchar1: data.Goods[0].Nvarchar1,
      //   Nvarchar2: data.Goods[0].Nvarchar2,
      //   Nvarchar3: data.Goods[0].Nvarchar3,
      //   Nvarchar4: data.Goods[0].Nvarchar4,
      //   Nvarchar5: data.Goods[0].Nvarchar5,
      //   Nvarchar6: data.Goods[0].Nvarchar6,
      //   Nvarchar7: data.Goods[0].Nvarchar7,
      //   Nvarchar8: data.Goods[0].Nvarchar8,
      //   Nvarchar9: data.Goods[0].Nvarchar9,
      //   Nvarchar10: data.Goods[0].Nvarchar10,
      //   Nvarchar11: data.Goods[0].Nvarchar11,
      //   Nvarchar12: data.Goods[0].Nvarchar12,
      //   Nvarchar13: data.Goods[0].Nvarchar13,
      //   Nvarchar14: data.Goods[0].Nvarchar14,
      //   Nvarchar15: data.Goods[0].Nvarchar15,
      //   Nvarchar16: data.Goods[0].Nvarchar16,
      //   Nvarchar17: data.Goods[0].Nvarchar17,
      //   Nvarchar18: data.Goods[0].Nvarchar18,
      //   Nvarchar19: data.Goods[0].Nvarchar19,
      //   Nvarchar20: data.Goods[0].Nvarchar20,
      //   Int1: data.Goods[0].Int1,
      //   Int2: data.Goods[0].Int2,
      //   Int3: data.Goods[0].Int3,
      //   Int4: data.Goods[0].Int4,
      //   Int5: data.Goods[0].Int5,
      //   Int6: data.Goods[0].Int6,
      //   Int7: data.Goods[0].Int7,
      //   Int8: data.Goods[0].Int8,
      //   Int9: data.Goods[0].Int9,
      //   Int10: data.Goods[0].Int10,
      //   Float1: data.Goods[0].Float1,
      //   Float2: data.Goods[0].Float2,
      //   Float3: data.Goods[0].Float3,
      //   Float4: data.Goods[0].Float4,
      //   Float5: data.Goods[0].Float5,
      //   Float6: data.Goods[0].Float6,
      //   Float7: data.Goods[0].Float7,
      //   Float8: data.Goods[0].Float8,
      //   Float9: data.Goods[0].Float9,
      //   Float10: data.Goods[0].Float10,
      //   Text1: data.Goods[0].Text1,
      //   Text2: data.Goods[0].Text2,
      //   Text3: data.Goods[0].Text3,
      //   Text4: data.Goods[0].Text4,
      //   Text5: data.Goods[0].Text5,
      // });


      // this.EditForm_Property_temp.patchValue({
      //   GoodCode: this.EditForm_Property.value.GoodCode,
      //   GoodName: this.EditForm_Property.value.GoodName,
      //   GoodType: this.EditForm_Property.value.GoodType,
      //   Nvarchar1: this.EditForm_Property.value.Nvarchar1,
      //   Nvarchar2: this.EditForm_Property.value.Nvarchar2,
      //   Nvarchar3: this.EditForm_Property.value.Nvarchar3,
      //   Nvarchar4: this.EditForm_Property.value.Nvarchar4,
      //   Nvarchar5: this.EditForm_Property.value.Nvarchar5,
      //   Nvarchar6: this.EditForm_Property.value.Nvarchar6,
      //   Nvarchar7: this.EditForm_Property.value.Nvarchar7,
      //   Nvarchar8: this.EditForm_Property.value.Nvarchar8,
      //   Nvarchar9: this.EditForm_Property.value.Nvarchar9,
      //   Nvarchar10: this.EditForm_Property.value.Nvarchar10,
      //   Nvarchar11: this.EditForm_Property.value.Nvarchar11,
      //   Nvarchar12: this.EditForm_Property.value.Nvarchar12,
      //   Nvarchar13: this.EditForm_Property.value.Nvarchar13,
      //   Nvarchar14: this.EditForm_Property.value.Nvarchar14,
      //   Nvarchar15: this.EditForm_Property.value.Nvarchar15,
      //   Nvarchar16: this.EditForm_Property.value.Nvarchar16,
      //   Nvarchar17: this.EditForm_Property.value.Nvarchar17,
      //   Nvarchar18: this.EditForm_Property.value.Nvarchar18,
      //   Nvarchar19: this.EditForm_Property.value.Nvarchar19,
      //   Nvarchar20: this.EditForm_Property.value.Nvarchar20,
      //   Int1: this.EditForm_Property.value.Int1,
      //   Int2: this.EditForm_Property.value.Int2,
      //   Int3: this.EditForm_Property.value.Int3,
      //   Int4: this.EditForm_Property.value.Int4,
      //   Int5: this.EditForm_Property.value.Int5,
      //   Int6: this.EditForm_Property.value.Int6,
      //   Int7: this.EditForm_Property.value.Int7,
      //   Int8: this.EditForm_Property.value.Int8,
      //   Int9: this.EditForm_Property.value.Int9,
      //   Int10: this.EditForm_Property.value.Int10,
      //   Float1: this.EditForm_Property.value.Float1,
      //   Float2: this.EditForm_Property.value.Float2,
      //   Float3: this.EditForm_Property.value.Float3,
      //   Float4: this.EditForm_Property.value.Float4,
      //   Float5: this.EditForm_Property.value.Float5,
      //   Float6: this.EditForm_Property.value.Float6,
      //   Float7: this.EditForm_Property.value.Float7,
      //   Float8: this.EditForm_Property.value.Float8,
      //   Float9: this.EditForm_Property.value.Float9,
      //   Float10: this.EditForm_Property.value.Float10,
      //   Text1: this.EditForm_Property.value.Text1,
      //   Text2: this.EditForm_Property.value.Text2,
      //   Text3: this.EditForm_Property.value.Text3,
      //   Text4: this.EditForm_Property.value.Text4,
      //   Text5: this.EditForm_Property.value.Text5,
      // });
      // this.EditForm_Property.valueChanges.subscribe((value) => {
      //   this.trackChanges(value);
      // });

      // // Initialize the form's original state to compare changes later
      // this.originalValues = { ...this.EditForm_Property.value };

      // this.changedValues = {};

      // this.propertyDto.patchValue({

      //   ObjectType: this.GoodTypeStr,
      // });

      // this.repo.GetProperty(this.propertyDto.value).subscribe((data: any) => {

      //   this.Propertys = data.Propertys;



      // });

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

    this.columnDefs5 = [
      {
        headerName: 'Stack Name',
        field: 'ame', // Adjust according to your data structure
        cellRenderer: 'agGroupCellRenderer', // Use AG Grid's group cell renderer
        cellRendererParams: {
          suppressCount: true, // Optional, if you don't want to show child counts
        },
        checkboxSelection: true,
        getDataPath: this.getDataPath_stack
      },
      // Add additional column definitions as necessary
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
        getDataPath: this.getDataPath_group
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

    this.EditForm_Base.valueChanges.subscribe((value) => {
      this.trackChanges(value);
    });

    // Initialize the form's original state to compare changes later
    this.originalValues = { ...this.EditForm_Base.value };

    this.changedValues = {};

    this.EditForm_Base.patchValue({
      GoodCode: 0,
      GoodName: '',
      GoodSubCode: '',
      GoodMainCode: '',
      Isbn: '',
      FirstBarCode: '',
    });


    this.KowsarTemplate.patchValue({
      Goods: []
    });


  }


  // #endregion






  // #region Func


  public gridOptions: GridOptions;
  getDataPath_group = (data: Group) => {
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



  getDataPath_stack = (data: Stack) => {
    const path: string[] = [];

    // Construct the path based on L1, L2, L3, L4, and L5
    if (data.L1 !== '0') {
      const parentL1 = this.findstackByCode(data.L1);
      if (parentL1) {
        path.push(parentL1.Name); // Add the L1 parent group name
      }
    }

    if (data.L2 !== '0') {
      const parentL2 = this.findstackByCode(data.L2);
      if (parentL2) {
        path.push(parentL2.Name); // Add the L2 parent group name
      }
    }

    if (data.L3 !== '0') {
      const parentL3 = this.findstackByCode(data.L3);
      if (parentL3) {
        path.push(parentL3.Name); // Add the L3 parent group name
      }
    }

    if (data.L4 !== '0') {
      const parentL4 = this.findstackByCode(data.L4);
      if (parentL4) {
        path.push(parentL4.Name); // Add the L4 parent group name
      }
    }

    // Finally, add the current group's name
    path.push(data.Name);

    return path;
  };

  // Helper method to find a group by its GroupCode
  findstackByCode(StackCode: string): Group | undefined {
    return this.base_Stack_list.find(stack => stack.StackCode === StackCode);
  }












  buildTree_stack(stacks: Stack[]): Stack[] {
    const stackMap = new Map<string, Stack>();

    for (const stack of stacks) {
      stack.children = [];
      stackMap.set(stack.StackCode, stack);
    }

    // Step 2: Build the tree structure
    const tree: Stack[] = [];

    for (const stack of stacks) {
      const { L1, L2, L3, L4, L5, StackCode } = stack;

      // Determine the parent based on the L values
      let parent: Stack | undefined;

      if (L1 === '0') {
        // Top-level group (L1 is 0)
        tree.push(stack);
      } else {
        // Find the appropriate parent group
        if (L2 === '0') {
          parent = stackMap.get(L1); // Parent is L1
        } else if (L3 === '0') {
          parent = stackMap.get(L2); // Parent is L2
        } else if (L4 === '0') {
          parent = stackMap.get(L3); // Parent is L3
        } else if (L5 === '0') {
          parent = stackMap.get(L4); // Parent is L4
        } else {
          parent = stackMap.get(L5); // Parent is L5
        }

        // If a parent is found, push this group to its children's array
        if (parent) {
          parent.children.push(stack);
        }
      }
    }

    return tree;
  }


  buildTree_group(groups: Group[]): Group[] {
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



  SetStack() {


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


    (this.KowsarTemplate.get('Goods') as FormArray).clear();
    (this.KowsarTemplate.get('Goods') as FormArray).push(this.GoodToStack);

    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate.value)
    });

    this.loadingService.show()



    this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
      this.loadingService.hide()
      const result = JSON.parse(data.Goods[0].Result);

      if (result.Goods && result.Goods[0].ErrMessage === "") {
        this.changedValues = {};
        this.GetGood_Stacks_Relations()
        this.selectedRows = []
        this.stack_dialog_close()
      } else {
        this.notificationService.error(result.Goods[0].ErrMessage);
      }

    });








  }

  GetImageFromKsr(pixel, KsrImageCode): Observable<any> {

    return this.repo.GetImageFromServer(pixel, KsrImageCode).pipe(tap((data: any) => { })
    );
  }

  DeleteImagefromGood(KsrImageCode) {
    this.loadingService.show()

    this.repo.DeleteKsrImageCode(KsrImageCode).subscribe(e => {
      this.loadingService.hide()

      this.notificationService.succeded();
      this.GetGood_Images_Relations()
    });
  }


  DeleteGroupfromGood(GoodGroupCode) {
    this.loadingService.show()

    this.repo.DeleteGoodGroupCode(GoodGroupCode).subscribe(e => {
      this.loadingService.hide()

      this.notificationService.succeded();
      this.GetGood_Groups_Relations()
    });
  }


  ShowImageModal(pixel, KsrImageCode) {
    this.loadingService.show()

    this.repo.GetImageFromServer(pixel, KsrImageCode).subscribe((data: any) => {
      this.loadingService.hide()

      this.showimage_dialog_show();
      this.Imageitem = `data:image;base64,${data.Text}`;

    });
  }



  SetGroup() {
    this.loadingService.show()


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






    (this.KowsarTemplate.get('Goods') as FormArray).clear();
    (this.KowsarTemplate.get('Goods') as FormArray).push(this.GoodToGroup);





    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate.value)
    });




    this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
      this.loadingService.hide()
      const result = JSON.parse(data.Goods[0].Result);

      if (result.Goods && result.Goods[0].ErrMessage === "") {
        this.changedValues = {};
        this.GetGood_Groups_Relations()
        this.selectedRows = []
        this.group_dialog_close()
      } else {
        this.notificationService.error(result.Goods[0].ErrMessage);
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

    this.SellPriceType_Str = this.EditForm_Base.value.SellPriceType
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
      GoodSubCode: this.EditForm_Base_temp.value.GoodSubCode,
      GoodMainCode: this.EditForm_Base_temp.value.GoodMainCode,
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
    this.loadingService.show()

    const data = {
      ClassName: "TGood",
      ObjectCode: ObjectCode,
      image: imageData
    };

    this.repo.SendImageToServer(data).subscribe((response) => {
      this.loadingService.hide()
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

        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        this.loadingService.show()




        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.loadingService.hide()
          const result = JSON.parse(data.Goods[0].Result);

          if (result.Goods && result.Goods[0].ErrMessage === "") {
            this.Code = result.Goods[0].GoodCode;
            this.notificationService.succeded();
            this.getDetails()
            // this.router.navigate(['/kowsar/good-edit', result.Goods[0].GoodCode]);
          } else {
            this.notificationService.error(result.Goods[0].ErrMessage);
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



        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        this.loadingService.show()


        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.loadingService.hide()
          const result = JSON.parse(data.Goods[0].Result);

          if (result.Goods && result.Goods[0].ErrMessage === "") {
            this.notificationService.succeded();
            location.reload()
          } else {
            this.notificationService.error(result.Goods[0].ErrMessage);
          }

        });


      }

    }







    if (action == 'explain') {
      if (Object.keys(this.changedValues).length > 0) {


        (this.KowsarTemplate.get('Goods') as FormArray).clear();


        const formGroup = new FormGroup(
          Object.keys(this.changedValues).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues[key]);
            return acc;
          }, {})
        );


        (this.KowsarTemplate.get('Goods') as FormArray).push(formGroup);



        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        this.loadingService.show()

        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.loadingService.hide()
          const result = JSON.parse(data.Goods[0].Result);

          if (result.Goods && result.Goods[0].ErrMessage === "") {
            this.notificationService.succeded();
            this.getDetails()
          } else {
            this.notificationService.error(result.Goods[0].ErrMessage);
          }

        });





      } else {
      }


    }


    if (action == 'complete') {
      if (Object.keys(this.changedValues).length > 0) {


        (this.KowsarTemplate.get('Goods') as FormArray).clear();


        const formGroup = new FormGroup(
          Object.keys(this.changedValues).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues[key]);
            return acc;
          }, {})
        );


        (this.KowsarTemplate.get('Goods') as FormArray).push(formGroup);



        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        this.loadingService.show()



        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.loadingService.hide()
          const result = JSON.parse(data.Goods[0].Result);

          if (result.Goods && result.Goods[0].ErrMessage === "") {
            this.notificationService.succeded();
            this.getDetails()
          } else {
            this.notificationService.error(result.Goods[0].ErrMessage);
          }

        });


      } else {
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




        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });

        this.loadingService.show()



        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
          this.loadingService.hide()
          const result = JSON.parse(data.Goods[0].Result);

          if (result.Goods && result.Goods[0].ErrMessage === "") {
            this.notificationService.succeded();
            this.getDetails()
          } else {
            this.notificationService.error(result.Goods[0].ErrMessage);
          }

        });


      } else {
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

  barcode_dialog_show() {
    const modal = this.renderer.selectRootElement('#Barcodemodal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  barcode_dialog_close() {
    const modal = this.renderer.selectRootElement('#Barcodemodal', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }





  // #endregion









  barcodeControl = new FormControl('');
  showBarcodeList = false;
  barcodeList = []; // Initialize your barcode array
  selectedBarcode: any = null;

  BarCodeModal(): void {
    this.loadingService.show()
    this.repo.GetBarcodeList(this.Code).subscribe((data: any) => {
      this.barcode_dialog_show()
      console.log(data.Barcodes)

      if (data.Barcodes) {
        console.log("`")
        this.barcodeList = data.Barcodes;  // Store the list of barcode objects

      } else {
        console.log("0")

        this.barcodeList = [];  // Store the list of barcode objects

      }
      this.loadingService.hide()
    });
  }

  addBarcode(): void {
    const newBarcodeValue = this.barcodeControl.value;
    if (newBarcodeValue && !this.barcodeList.some(b => b.BarCode === newBarcodeValue)) {
      const newBarcodeItem: BarcodeItem = {
        BarCodeId: Date.now().toString(), // Generating a temporary ID
        GoodRef: "100",
        BarCode: newBarcodeValue
      };
      this.barcodeList.push(newBarcodeItem);
      this.barcodeControl.reset();
    }
  }

  selectBarcode(barcode: BarcodeItem): void {
    this.barcodeControl.reset();
    this.selectedBarcode = barcode;
  }

  removeSelectedBarcode(): void {
    if (this.selectedBarcode) {
      this.barcodeList = this.barcodeList.filter(b => b.BarCodeId !== this.selectedBarcode?.BarCodeId);
      this.selectedBarcode = null;
    }
  }
  onBarCodeInputChange(): void {
    this.selectedBarcode = null
    // Triggered on each input change to control the visibility of the "Add" button
    // No additional code is needed here if `*ngIf="barcodeControl.value"` is used in the template.
  }

  SetBarCode() {


    this.loadingService.show()



    this.BarCodeToGood.patchValue({
      GoodCode: this.Code,
    });

    (this.BarCodeToGood.get('barcode') as FormArray).clear();

    // (this.BarCodeToGood.get('barcode') as FormArray).push(new FormControl(parseInt(this.selectedRows[0].StackCode, 10)));
    // Assuming selectedRows is an array of objects with a property StackCode
    this.barcodeList.forEach(row => {
      (this.BarCodeToGood.get('barcode') as FormArray).push(new FormControl(row.BarCode));
    });




    (this.KowsarTemplate.get('Goods') as FormArray).clear();
    (this.KowsarTemplate.get('Goods') as FormArray).push(this.BarCodeToGood);

    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate.value)
    });

    this.loadingService.show()



    this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {
      this.loadingService.hide()
      const result = JSON.parse(data.Goods[0].Result);

      if (result.Goods && result.Goods[0].ErrMessage === "") {
        this.changedValues = {};
        this.selectedRows = []
        this.barcode_dialog_close()
      } else {
        this.notificationService.error(result.Goods[0].ErrMessage);
      }

    });






  }

  BarCodeToGood = new FormGroup({
    GoodIndex: new FormControl("1"),
    GoodCode: new FormControl(""),
    barcode: new FormArray([])
  });



  onKeyUp(event: KeyboardEvent): void {

    if (this.Code == "") {
      let query = this.EditForm_Base.value.GoodName;

      // Replace spaces with '%20'
      query = query.replace(/ /g, '%');  // Replace all spaces with '%'


      if (query.length >= 3) {
        this.fetchSuggestions(query);
      } else {
        this.simillar_good = [];
      }
    }


  }


  fetchSuggestions(query: string) {
    // Replace the URL below with your actual API endpoint

    this.repo.GetSimilarGood(query).subscribe(
      (data: any) => {
        this.simillar_good = data.Goods.slice(0, 5); // Limit to top 5 results
        console.log(this.simillar_good);
      },
      (error) => {
        console.error('Error fetching suggestions', error);
      }
    );





  }




  GotoSuggestion(simillar_good): void {

    this.router.navigate(['kowsar/good-edit', simillar_good.GoodCode]);

  }

  selectSuggestion(simillar_good): void {


    this.EditForm_Base.patchValue({
      GoodType: simillar_good.GoodType,
      GoodName: simillar_good.GoodName,
      Type: simillar_good.Type,
      UsedGood: simillar_good.UsedGood,
      MinSellPrice: simillar_good.MinSellPrice,
      MaxSellPrice: simillar_good.MaxSellPrice,
      BarCodePrintState: simillar_good.BarCodePrintState,
      SellPriceType: simillar_good.SellPriceType,
      SellPrice1: simillar_good.SellPrice1,
      SellPrice2: simillar_good.SellPrice2,
      SellPrice3: simillar_good.SellPrice3,
      SellPrice4: simillar_good.SellPrice4,
      SellPrice5: simillar_good.SellPrice5,
      SellPrice6: simillar_good.SellPrice6,
    });




    this.simillar_good = []


  }

  simillar_good: any[] = [];
  @HostListener('document:keydown.delete', ['$event'])
  handleDeleteKey(event: KeyboardEvent) {

    if (this.selectedBarcode) {
      this.removeSelectedBarcode();
    }
  }



  IsbnToBarcode_frm = new FormGroup({
    ErrMessage: new FormControl(""),
    StandardMsg: new FormControl(""),
    StandardMsg2: new FormControl(""),
    ISBN: new FormControl(""),
    DuplicateMsg: new FormControl(""),
    ISBN2: new FormControl(""),
    DuplicateMsg2: new FormControl(""),
  });


  SetBarcodeFromIsbn() {
    if (this.Code.length > 0) {
      this.IsbnToBarcode()
    }
  }


  IsbnToBarcode() {

    this.repo.IsbnToBarcode(this.EditForm_Base.value.Isbn, this.Code).subscribe((data: any) => {
      console.log(data)

      this.IsbnToBarcode_frm.patchValue({
        ErrMessage: data.Goods[0].ErrMessage,
        StandardMsg: data.Goods[0].StandardMsg,
        StandardMsg2: data.Goods[0].StandardMsg2,
        ISBN: data.Goods[0].ISBN,
        DuplicateMsg: data.Goods[0].DuplicateMsg,
        ISBN2: data.Goods[0].ISBN2,
        DuplicateMsg2: data.Goods[0].DuplicateMsg2,
      });


      if (data.Goods[0].ErrMessage.length > 0) {
        this.notificationService.error1(data.Goods[0].ErrMessage)
      } else {
        if (data.Goods[0].StandardMsg.length > 0) {

          this.check_dialog_QA("بارکد از شابک", data.Goods[0].StandardMsg).then((result) => {
            if (result.isConfirmed) {

              this.EditForm_Base.patchValue({
                GoodCode: parseInt(this.Code),
                FirstBarCode: data.Goods[0].ISBN,
              });
              //TODO send addnew
              this.submit('base')
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              this.notificationService.warning('اطلاعات تغییری نکرد');
            }
          });
        }
        if (data.Goods[0].StandardMsg2.length > 0) {
          this.check_dialog_QA("بارکد از شابک", data.Goods[0].StandardMsg2).then((result) => {
            if (result.isConfirmed) {

              this.check_dialog_QA("بارکد از شابک", data.Goods[0].DuplicateMsg).then((result) => {
                if (result.isConfirmed) {

                  this.EditForm_Base.patchValue({
                    GoodCode: parseInt(this.Code),
                    FirstBarCode: data.Goods[0].ISBN,
                  });
                  //TODO send addnew
                  this.submit('base')
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                  this.notificationService.warning('اطلاعات تغییری نکرد');
                }
              });

            } else if (result.dismiss === Swal.DismissReason.cancel) {

              this.check_dialog_QA("بارکد از شابک", data.Goods[0].DuplicateMsg2).then((result) => {
                if (result.isConfirmed) {

                  this.EditForm_Base.patchValue({
                    GoodCode: parseInt(this.Code),
                    FirstBarCode: data.Goods[0].ISBN2,
                  });
                  //TODO send addnew
                  this.submit('base')

                } else if (result.dismiss === Swal.DismissReason.cancel) {
                  this.notificationService.warning('اطلاعات تغییری نکرد');
                }
              });

            }
          });
        }
      }

    });
  }



  check_dialog_QA(title, body) {
    return Swal.fire({
      title: title,
      text: body,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله',
      cancelButtonText: 'خیر',
      customClass: {
        confirmButton: 'btn btn-success mx-2',

        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
  }




}





interface BarcodeItem {
  BarCodeId: string;
  GoodRef: string;
  BarCode: string;
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


interface Stack {
  StackCode: string;
  L1: string;
  L2: string;
  L3: string;
  L4: string;
  L5: string;
  Name: string;
  children?: Stack[];
}









