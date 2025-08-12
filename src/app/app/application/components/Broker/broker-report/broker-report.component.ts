import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BrokerWebApiService } from '../../../services/BrokerWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { Location } from '@angular/common';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-broker-report',
  templateUrl: './broker-report.component.html',
})


export class BrokerReportComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private repo: BrokerWebApiService,
    private route: ActivatedRoute,
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



  override ngOnInit(): void {
    super.ngOnInit();
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


    this.repo.GetBrokerDetail(this.BrokerCode).subscribe(e => {
      this.BrokerDetails = e;
      this.fetchImageData();
    });







    this.EditForm_BrokerReport.patchValue({
      Explain: "GetPrefactorBroker",

      Flag: "1",

    });


    this.repo.GetAppBrokerReport(this.EditForm_BrokerReport.value).subscribe(e => {
      this.DPreFactorDates = e;

    });


    this.EditForm_BrokerReport.patchValue({
      Explain: "GetPrefactorBroker",

      Flag: "2",

    });

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

    this.repo.SendImageToServer(data).subscribe((response) => {
      this.fetchImageData();
    });

  }


  fetchImageData() {

    this.repo.GetImageFromServer(this.BrokerDetails[0].CentralRef).subscribe((data: any) => {

      this.Imageitem = `data:${Image};base64,${data.Text}`;

    });
  }






}
