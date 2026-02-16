import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { OrderWebApiService } from 'src/app/features/module/services/OrderWebApi.service';
import { Location } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';

@Component({
  selector: 'app-order-app-good-edit',
  templateUrl: './order-app-good-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    FormsModule
  ],
})
export class OrderAppGoodEditComponent implements OnInit {


  private readonly repo = inject(OrderWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly sharedService = inject(SharedService);
  private readonly formBuilder = inject(UntypedFormBuilder);



  constructor() { }

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


  @ViewChild('imagePreview') imagePreview: ElementRef | undefined;


  imageData: string = ''; // Variable to hold the image data

  showUploadText: boolean = false;


  btnRadioGroup2 = this.formBuilder.group({
    activestack: this.formBuilder.control({ value: '' })
  });


  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.id = id;
        this.LoadFromUrl(this.id);
      }
    });

    this.CallService()
  }

  CallService() {
    this.sharedService.RefreshAllActions$.subscribe(action => {
      if (action === 'refresh') {
        this.refreshpage();
      }
    });
  }

  refreshpage() {
    this.LoadFromUrl(this.id);
  }




  logFormData() {

    if (parseInt(this.id) > 0) {

      this.TagName = "Update Good";



      this.repo.Web_UpdateGoodDetail(
        this.formValues.GoodCode,
        this.formValues.GoodName,
        this.formValues.MaxSellprice + "",
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



      this.repo.GetGoodEdit(this.id).subscribe(e => {


        this.SingleItems = e
        this.LoadDataSet();


        this.repo.GetActiveGood(e[0].GoodCode).subscribe(e => {


          if (e[0].ActiveStack == "True") {
            this.btnRadioGroup2.setValue({ activestack: "Active" });

            this.ActiveState = "Active"

          } else {

            this.btnRadioGroup2.setValue({ activestack: "NotActive" });
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
      this.sharedService.triggerActionAll('refresh');
    });

  }


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


    this.repo.SendImageToServer(data).subscribe((response) => {
      this.sharedService.triggerActionAll('refresh');
    });

  }




  fetchImageData() {


    this.repo.GetImageFromServer(this.SingleItems[0].GoodCode).subscribe((data: any) => {


      this.Imageitem = `data:${Image};base64,${data.Text}`;

    });
  }

  setRadioValue(value: string): void {

    if (this.ActiveState != value) {

      this.ActiveState = value
      if (value == "Active") {

        this.ActiveFlag = "1"

      } else {

        this.ActiveFlag = "0"

      }

      this.repo.ChangeGoodActive(this.SingleItems[0].GoodCode, this.ActiveFlag).subscribe(e => {
        this.sharedService.triggerActionAll('refresh');
      });



    }

  }


}







