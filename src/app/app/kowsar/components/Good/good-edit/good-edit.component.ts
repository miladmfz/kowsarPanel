import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { KowsarWebApiService } from '../../../services/KowsarWebApi.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { operationSuccessful } from 'src/app/app-shell/framework-components/app-messages';
import { GoodType_lookup, SellPriceType_Lookup } from '../../../lookup-type';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';

@Component({
  selector: 'app-good-edit',
  templateUrl: './good-edit.component.html',
})
export class GoodEditComponent implements OnInit {
  title = 'ایجاد نوع داده انتخابی';
  Code: string = '';
  SingleItems: any[] = [];

  EditForm = new FormGroup({
    GoodCode: new FormControl(0),
    GoodType: new FormControl(''),
    GoodName: new FormControl(''),
    MinSellPrice: new FormControl(0),
    MaxSellPrice: new FormControl(0),
    Isbn: new FormControl(''),
    SellPriceType: new FormControl(''),
    SellPrice1: new FormControl(0),
    SellPrice2: new FormControl(0),
    SellPrice3: new FormControl(0),
    SellPrice4: new FormControl(0),
    SellPrice5: new FormControl(0),
    SellPrice6: new FormControl(0),
    GoodExplain1: new FormControl(''),
    GoodExplain2: new FormControl(''),
    GoodExplain3: new FormControl(''),
    GoodExplain4: new FormControl(''),
    GoodExplain5: new FormControl(''),
    GoodExplain6: new FormControl(''),
  });

  SellPriceType_Lookup: SellPriceType_Lookup[] = [
    { id: "1", name: "نسبی" },
    { id: "0", name: "مطلق" }
  ]

  GoodType_lookup: GoodType_lookup[] = []

  constructor(
    private repo: KowsarWebApiService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private location: Location,
  ) { }


  ngOnInit() {
    //debugger
    this.GetObjectTypeFromDbSetup()
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.Code = id;
        this.getDetails();
      }
    });

  }


  GetObjectTypeFromDbSetup() {
    this.repo.GetObjectTypeFromDbSetup("GoodType").subscribe((data: any) => {

      this.GoodType_lookup = data.ObjectTypes


    });
  }




  getDetails() {
    this.repo.GetGood_base(this.Code).subscribe((data: any) => {

      this.EditForm.patchValue({
        GoodCode: data.Goods[0].GoodCode,
        GoodType: data.Goods[0].GoodType,
        GoodName: data.Goods[0].GoodName,
        MinSellPrice: data.Goods[0].MinSellPrice,
        MaxSellPrice: data.Goods[0].MaxSellPrice,
        Isbn: data.Goods[0].Isbn,
        SellPriceType: data.Goods[0].SellPriceType,
        SellPrice1: data.Goods[0].SellPrice1,
        SellPrice2: data.Goods[0].SellPrice2,
        SellPrice3: data.Goods[0].SellPrice3,
        SellPrice4: data.Goods[0].SellPrice4,
        SellPrice5: data.Goods[0].SellPrice5,
        SellPrice6: data.Goods[0].SellPrice6,
        GoodExplain1: data.Goods[0].GoodExplain1,
        GoodExplain2: data.Goods[0].GoodExplain2,
        GoodExplain3: data.Goods[0].GoodExplain3,
        GoodExplain4: data.Goods[0].GoodExplain4,
        GoodExplain5: data.Goods[0].GoodExplain5,
        GoodExplain6: data.Goods[0].GoodExplain6,
      });
    });
  }


  onSellPriceTypeChange() {

    const maxSellPrice: number = this.EditForm.value.MaxSellPrice;
    const sellPrice1: number = this.EditForm.value.SellPrice1;
    const sellPrice2: number = this.EditForm.value.SellPrice2;
    const sellPrice3: number = this.EditForm.value.SellPrice3;
    const sellPrice4: number = this.EditForm.value.SellPrice4;
    const sellPrice5: number = this.EditForm.value.SellPrice5;
    const sellPrice6: number = this.EditForm.value.SellPrice6;

    if (this.EditForm.value.SellPriceType == "1") {
      this.EditForm.patchValue({
        SellPrice1: ((sellPrice1 * 100) / maxSellPrice),
        SellPrice2: ((sellPrice2 * 100) / maxSellPrice),
        SellPrice3: ((sellPrice3 * 100) / maxSellPrice),
        SellPrice4: ((sellPrice4 * 100) / maxSellPrice),
        SellPrice5: ((sellPrice5 * 100) / maxSellPrice),
        SellPrice6: ((sellPrice6 * 100) / maxSellPrice),
      });
    } else {
      this.EditForm.patchValue({
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

    const maxSellPrice: number = this.EditForm.value.MaxSellPrice;
    this.EditForm.patchValue({
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

    const command = this.EditForm.value;
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
    this.EditForm.reset();
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
  console.log(parseInt(this.id));

  if (parseInt(this.id) > 0) {
    console.log("Update Good");

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
    console.log("insert good");


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

    console.log(this.TagName);
    this.repo.GetGoodEdit(this.id).subscribe(e => {


      this.SingleItems = e
      this.LoadDataSet();
      this.repo.GetActiveGood(e[0].GoodCode).subscribe(e => {

        console.log(e[0].ActiveStack)

        if (e[0].ActiveStack == "True") {
          console.log("true")
          this.btnRadioGroup2.setValue({ activestack: "Active" });

          this.ActiveState = "Active"

        } else {

          this.btnRadioGroup2.setValue({ activestack: "NotActive" });
          console.log("false")
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

      console.log(response)
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

      console.log(Image + " = Image")
      console.log(data.Text + " = data.Text")

      this.Imageitem = `data:${Image};base64,${data.Text}`;
      console.log(this.Imageitem.length + " = lengh")

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