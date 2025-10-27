import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { GoodType_lookup } from 'src/app/app/kowsar/lookup-type';
import { KowsarWebApiService } from 'src/app/app/kowsar/services/KowsarWebApi.service';
import { Base_Lookup } from '../../../lookup-type';
import Swal from 'sweetalert2';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { LoadingService } from 'src/app/app-shell/framework-services/loading.service';

@Component({
    selector: 'app-supgood-edit',
    templateUrl: './supgood-edit.component.html',
    standalone: false
})
export class SupgoodEditComponent extends AgGridBaseComponent implements OnInit {

  constructor(
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private repo: SupportFactorWebApiService,
    private route: ActivatedRoute,
    private renderer: Renderer2,
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

      } else {

        this.EditForm_Base_reset()
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

    this.LoadData_base()

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



      this.EditForm_Base.valueChanges.subscribe((value) => {
        this.trackChanges(value);
      });

      // Initialize the form's original state to compare changes later
      this.originalValues = { ...this.EditForm_Base.value };

      this.changedValues = {};
    });

  }



  GetLastGoodData() {
    this.repo.GetLastGoodData().subscribe((data: any) => {
      this.router.navigateByUrl('support/supgood-edit', data.Goods[0].GoodCode);
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



  // #endregion







  // #region submit

  submit(action) {

    if (action == 'base') {

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
            this.Code = result.Goods[0].GoodCode;
            this.notificationService.succeded();
            this.getDetails()
            this.router.navigate(['/support/supgood-edit', result.Goods[0].GoodCode]);
          } else {
            this.notificationService.error(result.Goods[0].ErrMessage);
          }

        });
      }


    }



  }

  // #endregion







  // #region modal




  // #endregion









  barcodeControl = new FormControl('');
  showBarcodeList = false;
  barcodeList = []; // Initialize your barcode array
  selectedBarcode: any = null;




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

    this.router.navigate(['support/supgood-edit', simillar_good.GoodCode]);

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


  IsbnToBarcode_frm = new FormGroup({
    ErrMessage: new FormControl(""),
    StandardMsg: new FormControl(""),
    StandardMsg2: new FormControl(""),
    ISBN: new FormControl(""),
    DuplicateMsg: new FormControl(""),
    ISBN2: new FormControl(""),
    DuplicateMsg2: new FormControl(""),
  });





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