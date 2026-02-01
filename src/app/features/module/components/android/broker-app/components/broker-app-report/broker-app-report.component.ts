import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { BrokerWebApiService } from 'src/app/features/module/services/BrokerWebApi.service';
import { BrokerAppMapComponent } from '../broker-app-map/broker-app-map.component';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';

@Component({
  selector: 'app-broker-app-report',
  templateUrl: './broker-app-report.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    NgPersianDatepickerModule,
    BrokerAppMapComponent
  ],
})
export class BrokerAppReportComponent extends AgGridBaseComponent
  implements OnInit {

  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(BrokerWebApiService);
  private readonly route = inject(ActivatedRoute);


  constructor() {
    super();
  }


  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }



  BrokerCode!: string;
  BrokerDetails: any[] = [];
  Imageitem: string = '';
  Broker_Prefactors: any[] = [];
  CDCustNames: any[] = [];

  DPreFactorDates: any[] = [];
  CDCustNames_amount: string[] = [];
  CDCustNames_price: string[] = [];
  CDCustNames_name: string[] = [];
  selectedRadio: string = '';
  @ViewChild('imagePreview') imagePreview: ElementRef | undefined;






  formRadio1 = new UntypedFormGroup({
    radio1: new UntypedFormControl('Radio0')
  });


  chartBarData1: any;
  chartBarData: any;


  imageData: string = ''; // Variable to hold the image data

  showUploadText: boolean = false;


  setRadioValue(value: string): void {
    this.formRadio1.setValue({ radio1: value });
    this.selectedRadio = value;
  }

  EditForm_BrokerReport = new FormGroup({
    BrokerRef: new FormControl(''),
    StartDate: new FormControl(''),
    EndDate: new FormControl(''),
    Explain: new FormControl(''),
    Flag: new FormControl(''),
  });



  ngOnInit(): void {
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      var idtemp = params.get('id');
      if (idtemp != null) {
        this.BrokerCode = idtemp;
        this.EditForm_BrokerReport.patchValue({
          BrokerRef: this.BrokerCode,
        });
      }
    });
    this.Config_Declare()

    this.getdate()

  }


  Config_Declare() {

    this.columnDefs1 = [ // bar asase moshtari

      {
        field: 'CustName',
        headerName: 'نام مشتری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'SumAmount',
        headerName: 'جمع تعداد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'SumPrice',
        headerName: 'جمع مبلغ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
    ];

    this.columnDefs2 = [ // be tafkik  date


      {
        field: 'ReportDate',
        headerName: 'تاریخ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'SumAmount',
        headerName: 'جمع تعداد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'SumPrice',
        headerName: 'جمع مبلغ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
    ];






  }



  getdate() {


    this.EditForm_BrokerReport.patchValue({
      StartDate: "1404/03/12",
      EndDate: "1404/03/13",
    });


    // flag report
    //   
    //  1- GetCDPreFactorDate
    //  2- GetCDCustName
    //  3- GetPrefactorBroker
    //  4-


    this.loadingService.show()
    this.repo.GetBrokerDetail(this.BrokerCode).subscribe(e => {
      this.BrokerDetails = e;
      this.fetchImageData();
    });







    this.EditForm_BrokerReport.patchValue({
      Explain: "GetPrefactorBroker",

      Flag: "1",

    });


    this.loadingService.show()
    this.repo.GetAppBrokerReport(this.EditForm_BrokerReport.value).subscribe(e => {
      this.DPreFactorDates = e;

    });


    this.EditForm_BrokerReport.patchValue({
      Explain: "GetPrefactorBroker",

      Flag: "2",

    });

    this.loadingService.show()
    this.repo.GetAppBrokerReport(this.EditForm_BrokerReport.value).subscribe(e => {
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

    this.EditForm_BrokerReport.patchValue({
      Explain: "GetPrefactorBroker",

      Flag: "3",

    });
    this.loadingService.show()
    this.repo.GetAppBrokerReport(this.EditForm_BrokerReport.value).subscribe(e => {
      this.Broker_Prefactors = e;
    });


  }



  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageData = e.target.result.split(',')[1]; // Get base64 data (remove the header)
        this.sendImageToServer(this.BrokerDetails[0].CentralRef, imageData); // Replace '12345' with your barcode value
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

    this.loadingService.show()
    this.repo.SendImageToServer(data).subscribe((response) => {
      this.fetchImageData();
    });

  }


  fetchImageData() {

    this.loadingService.show()
    this.repo.GetImageFromServer(this.BrokerDetails[0].CentralRef).subscribe((data: any) => {
      this.loadingService.hide()

      this.Imageitem = `data:${Image};base64,${data.Text}`;

    });
  }






}
