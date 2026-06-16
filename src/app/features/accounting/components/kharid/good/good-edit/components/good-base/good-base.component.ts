import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, Renderer2, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { Base_Lookup, GoodType_lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { GoodWebApiService } from 'src/app/features/accounting/services/KharidWebApi/goodWebApi.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-good-base',
  templateUrl: './good-base.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

  ]
})
export class GoodBaseComponent implements OnInit {
  @Input() GoodCode = ""

  private readonly router = inject(Router);
  private readonly repo = inject(GoodWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);

  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);

  constructor() {

  }


  simillar_good = signal<any[]>([])

  Code = signal('')
  Code_int = signal(0)

  barcodeControl = new FormControl('');
  showBarcodeList = signal(false);
  barcodeList = signal<any[]>([]);
  selectedBarcode: any = null;

  GoodType_lookup: GoodType_lookup[] = []
  SellPriceType_Str = signal('')

  selectedRows = signal<any[]>([])




  KowsarTemplate = new FormGroup({
    Good: new FormArray([])
  });


  JsonForm = new FormGroup({
    JsonData: new FormControl(""),
  });

  originalValues: any = {};
  changedValues = signal<any[]>([])
  EditForm_Base = new FormGroup({
    RowIndex: new FormControl("1"),
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





  trackChanges(value: any) {
    this.changedValues()['GoodCode'] = value['GoodCode'];
    // Compare the current form values with the original values
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        if (value[key] !== this.originalValues[key]) {
          this.changedValues()[key] = value[key]; // Store the changed value
        } else if (key !== 'GoodCode') {
          // If it matches the original and it's not GoodCode, remove it from changedValues
          delete this.changedValues()[key];
        }

      }
    }
  }


  changedValues_show() {

    return Object.keys(this.changedValues()).length > 0
  }



  ngOnInit() {


    this.Code.set(this.GoodCode)
    this.Code_int.set(parseInt(this.GoodCode))


    this.GetObjectTypeFromDbSetup()


  }



  getDetails() {

    this.changedValues.set([])
    this.EditForm_Base.reset();
    this.LoadData_base()

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


  GetObjectTypeFromDbSetup() {

    this.base_repo.GetObjectTypeFromDbSetup("GoodType").subscribe((data: any) => {


      this.GoodType_lookup = data.ObjectTypes
      data.ObjectTypes.forEach((item: GoodType_lookup) => {
        if (item.IsDefault == "True") {
          this.EditForm_Base.patchValue({
            GoodType: item.aType
          });

          if (this.Code_int() > 0) {
            this.getDetails();
          } else {
            this.EditForm_Base_reset()
          }
        }
      });
    });
  }

  GetLastGoodData() {



    this.repo.GetLastGoodData().subscribe((data: any) => {

      this.router.navigateByUrl('accounting/good-edit', data.Goods[0].GoodCode);
    });
  }

  EditForm_Base_reset() {
    this.GetLastGoodData()


    this.base_repo.GetObjectTypeFromDbSetup("GoodType").subscribe((data: any) => {


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

    this.changedValues.set([])

    this.EditForm_Base.patchValue({
      GoodCode: 0,
      GoodName: '',
      GoodSubCode: '',
      GoodMainCode: '',
      Isbn: '',
      FirstBarCode: '',
    });


    this.KowsarTemplate.patchValue({
      Good: []
    });


  }

  LoadData_base() {

    this.repo.GetGood_base(this.Code()).subscribe((data: any) => {

      this.SellPriceType_Str.set(data.Goods[0].SellPriceType)

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






      this.EditForm_Base.valueChanges.subscribe((value) => {
        this.trackChanges(value);
      });

      // Initialize the form's original state to compare changes later
      this.originalValues = { ...this.EditForm_Base.value };

      this.changedValues.set([])
    });



  }

  onKeyUp(event: KeyboardEvent): void {

    if (this.Code() == "") {
      let query = this.EditForm_Base.value.GoodName;

      // Replace spaces with '%20'
      query = query.replace(/ /g, '%');  // Replace all spaces with '%'


      if (query.length >= 3) {
        this.fetchSuggestions(query);
      } else {
        this.simillar_good.set([]);
      }
    }


  }


  fetchSuggestions(query: string) {
    // Replace the URL below with your actual API endpoint


    this.repo.GetSimilarGood(query).subscribe(
      (data: any) => {

        this.simillar_good = data.Goods.slice(0, 5); // Limit to top 5 results
      },
      (error) => {
        console.error('Error fetching suggestions', error);
      }
    );





  }

  GotoSuggestion(simillar_good): void {

    this.router.navigate(['accounting/good-edit', simillar_good.GoodCode]);

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




    this.simillar_good.set([])


  }


  BarCodeModal(): void {


    this.repo.GetBarcodeList(this.Code()).subscribe((data: any) => {

      this.barcode_dialog_show()

      if (data.Barcodes) {

        this.barcodeList.set(data.Barcodes)

      } else {


        this.barcodeList.set([]);

      }

    });
  }

  addBarcode(): void {
    const newBarcodeValue = this.barcodeControl.value;
    if (newBarcodeValue && !this.barcodeList().some(b => b.BarCode === newBarcodeValue)) {
      const newBarcodeItem: BarcodeItem = {
        BarCodeId: Date.now().toString(), // Generating a temporary ID
        GoodRef: "100",
        BarCode: newBarcodeValue
      };
      this.barcodeList().push(newBarcodeItem);
      this.barcodeControl.reset();
    }
  }

  selectBarcode(barcode: BarcodeItem): void {
    this.barcodeControl.reset();
    this.selectedBarcode = barcode;
  }

  removeSelectedBarcode(): void {
    if (this.selectedBarcode) {
      this.barcodeList.set(this.barcodeList().filter(b => b.BarCodeId !== this.selectedBarcode?.BarCodeId))
      this.selectedBarcode = null;
    }
  }
  onBarCodeInputChange(): void {
    this.selectedBarcode = null
    // Triggered on each input change to control the visibility of the "Add" button
    // No additional code is needed here if `*ngIf="barcodeControl.value"` is used in the template.
  }






  BarCodeToGood = new FormGroup({
    RowIndex: new FormControl("1"),
    GoodCode: new FormControl(""),
    barcode: new FormArray([])
  });











  handleDeleteKey(event: KeyboardEvent) {
    if (event.key === 'Delete' && this.selectedBarcode) {
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
    if (this.Code().length > 0) {
      this.IsbnToBarcode()
    }
  }


  IsbnToBarcode() {



    this.repo.IsbnToBarcode(this.EditForm_Base.value.Isbn, this.Code()).subscribe((data: any) => {

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
        this.notificationService.error(data.Goods[0].ErrMessage)
      } else {
        if (data.Goods[0].StandardMsg.length > 0) {

          this.check_dialog_QA("بارکد از شابک", data.Goods[0].StandardMsg).then((result) => {
            if (result.isConfirmed) {

              this.EditForm_Base.patchValue({
                GoodCode: parseInt(this.Code()),
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
                    GoodCode: parseInt(this.Code()),
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
                    GoodCode: parseInt(this.Code()),
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
  onSellPriceTypeChange() {

    this.SellPriceType_Str.set(this.EditForm_Base.value.SellPriceType)
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



    this.changedValues.set([])


  }



  SetBarCode() {






    this.BarCodeToGood.patchValue({
      GoodCode: this.Code(),
    });

    (this.BarCodeToGood.get('barcode') as FormArray).clear();

    // (this.BarCodeToGood.get('barcode') as FormArray).push(new FormControl(parseInt(this.selectedRows[0].StackCode, 10)));
    // Assuming selectedRows is an array of objects with a property StackCode
    this.barcodeList().forEach(row => {
      (this.BarCodeToGood.get('barcode') as FormArray).push(new FormControl(row.BarCode));
    });




    (this.KowsarTemplate.get('Good') as FormArray).clear();
    (this.KowsarTemplate.get('Good') as FormArray).push(this.BarCodeToGood);

    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate.value)
    });






    this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {

      const result = JSON.parse(data.Goods[0].Result);

      if (result.Good && result.Good[0].ErrMessage === "") {
        this.changedValues.set([])
        this.selectedRows.set([])
        this.barcode_dialog_close()
      } else {
        this.notificationService.error(result.Good[0].ErrMessage);
      }

    });






  }

  submit(action) {

    if (action == 'base') {

      this.EditForm_Base.markAllAsTouched();


      if (!this.EditForm_Base.valid) return;

      // (this.KowsarTemplate.get('Goods') as FormArray).clear();
      // (this.KowsarTemplate.get('Goods') as FormArray).push(
      //   this.EditForm_Base
      // );


      if (Object.keys(this.changedValues()).length > 0) {


        (this.KowsarTemplate.get('Good') as FormArray).clear();


        const formGroup = new FormGroup(
          Object.keys(this.changedValues()).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues()[key]);
            return acc;
          }, {})
        );


        (this.KowsarTemplate.get('Good') as FormArray).push(formGroup);

        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });







        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {



          const result = JSON.parse(data.Goods[0].Result);

          if (result.Good && result.Good[0].ErrMessage === "") {

            this.Code.set(result.Good[0].GoodCode + "")
            this.changedValues.set([])
            this.notificationService.succeded();
            this.getDetails()
          } else {

            this.notificationService.error(result.Good[0].ErrMessage);
          }

        });
      }


    } else if (action == 'base_new') {
      this.EditForm_Base.markAllAsTouched();
      if (!this.EditForm_Base.valid) return;


      if (Object.keys(this.changedValues()).length > 0) {


        (this.KowsarTemplate.get('Good') as FormArray).clear();


        const formGroup = new FormGroup(
          Object.keys(this.changedValues()).reduce((acc, key) => {
            acc[key] = new FormControl(this.changedValues()[key]);
            return acc;
          }, {})
        );


        (this.KowsarTemplate.get('Good') as FormArray).push(formGroup);



        this.JsonForm.patchValue({
          JsonData: JSON.stringify(this.KowsarTemplate.value)
        });





        this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {


          const result = JSON.parse(data.Goods[0].Result);


          if (result.Good && result.Good[0].ErrMessage === "") {

            this.changedValues.set([])
            this.notificationService.succeded();
            this.getDetails()
          } else {

            this.notificationService.error(result.Good[0].ErrMessage);
          }

        });


      }

    }

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



}



interface BarcodeItem {
  BarCodeId: string;
  GoodRef: string;
  BarCode: string;
}





