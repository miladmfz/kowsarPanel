import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApplicationWebApiService } from '../../../services/ApplicationWebApi.service';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environment';


@Component({
  selector: 'app-broker-report',
  templateUrl: './broker-report.component.html',
})


export class BrokerReportComponent implements OnInit {

  constructor(
    private repo: ApplicationWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient
  ) { }


  id!: string;
  items: any[] = [];
  Imageitem: string = '';
  Broker_Prefactors: any[] = [];
  CDCustNames: any[] = [];

  DPreFactorDates: any[] = [];
  CDCustNames_amount: string[] = [];
  CDCustNames_price: string[] = [];
  CDCustNames_name: string[] = [];
  selectedRadio: string = '';



  @ViewChild('imagePreview') imagePreview: ElementRef | undefined;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageData = e.target.result.split(',')[1]; // Get base64 data (remove the header)
        this.sendImageToServer(this.items[0].CentralRef, imageData); // Replace '12345' with your barcode value
      };
      reader.readAsDataURL(file);
    }
  }




  sendImageToServer(ObjectCode: string, imageData: string): void {

    const data = {
      ClassName: "Central",
      ObjectCode: ObjectCode,
      image: imageData
    };

    this.http.post<any>(environment.baseUrl_KowsarWeb + 'UploadImage', data).subscribe(
      (response) => {

        console.log(response)
        this.fetchImageData();
      },
      (error) => {
        console.error('Error uploading image:', error);
      }
    );
  }








  imageData: string = ''; // Variable to hold the image data



  fetchImageData() {
    const url = environment.baseUrl + 'GetWebImagess?pixelScale=300&ClassName=Central&ObjectRef=' + this.items[0].CentralRef;

    this.http.get<any>(url).subscribe(
      (data: any) => {

        this.Imageitem = `data:${Image};base64,${data.Text}`;

      },
      (error) => {
        console.error('Error occurred while fetching image data:', error);
      }
    );
  }




  showUploadText: boolean = false;




  ngOnInit() {








    this.id = this.route.snapshot.params['id'];

    this.repo.GetBrokerDetail(this.id).subscribe(e => {
      this.items = e;
      this.fetchImageData();
    });


    this.repo.GetPrefactorBroker(this.id, "100").subscribe(e => {
      this.Broker_Prefactors = e;

    });

    this.repo.GetCDCustName(this.id, "100").subscribe(e => {
      this.CDCustNames = e;
      this.CDCustNames_amount = this.CDCustNames.map(item => String(parseFloat(item.SumAmount).toString()));
      this.CDCustNames_price = this.CDCustNames.map(item => String(parseFloat(item.SumPrice).toString()));
      this.CDCustNames_name = this.CDCustNames.map(item => String(item.CustName));

      this.chartBarData1 = {
        labels: this.CDCustNames_name,
        datasets: [
          {
            label: 'CustNames_amount',
            backgroundColor: '#F05941',
            data: this.CDCustNames_amount,
          },
        ],
      };
      this.chartBarData = {
        labels: this.CDCustNames_name,
        datasets: [
          {
            label: 'CustNames_price',
            backgroundColor: '#39A7FF',
            data: this.CDCustNames_price,
          },
        ],
      };

    });


    this.repo.GetCDPreFactorDate(this.id, "100").subscribe(e => {
      this.DPreFactorDates = e;

    });



  }
  // Assuming DPreFactorDates is your existing array of any type


  formRadio1 = new UntypedFormGroup({
    radio1: new UntypedFormControl('Radio0')
  });


  setRadioValue(value: string): void {
    this.formRadio1.setValue({ radio1: value });
    this.selectedRadio = value;
  }




  chartBarData1: any;
  chartBarData: any;



}
