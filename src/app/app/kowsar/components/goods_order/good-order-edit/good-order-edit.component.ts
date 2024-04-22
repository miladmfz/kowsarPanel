import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environment';

import { KowsarWebApiService } from '../../../services/KowsarWebApi.service';




@Component({
  selector: 'app-good-edit',
  templateUrl: './good-order-edit.component.html',
})
export class GoodOrderEditComponent implements OnInit {

  constructor(
    private repo: KowsarWebApiService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private http: HttpClient,
    private formBuilder: UntypedFormBuilder

  ) { }

  private cache: { [key: string]: any } = {}; // Basic caching object


  @Input() TextData: string = '';

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







