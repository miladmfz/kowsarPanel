import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { OcrWebApiService } from '../../../services/OcrWebApi.service';

@Component({
  selector: 'app-ocr-factor-detail',
  templateUrl: './ocr-factor-detail.component.html',
})
export class OcrFactorDetailComponent implements OnInit {

  constructor(
    private repo: OcrWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private router: Router
    ,) { }


  EditForm_Base = new FormGroup({
    AppBrokerRef: new FormControl(''),
    AppControlDate: new FormControl(''),
    AppControler: new FormControl(''),
    AppDeliverDate: new FormControl(''),
    AppDeliverer: new FormControl(''),
    AppFactorRef: new FormControl(''),
    AppFactorState: new FormControl(''),
    AppIsControled: new FormControl(''),
    AppIsDelivered: new FormControl(''),
    AppIsPacked: new FormControl(''),
    AppOCRFactorCode: new FormControl(''),
    AppPackCount: new FormControl(''),
    AppPackDate: new FormControl(''),
    AppPackDeliverDate: new FormControl(''),
    AppPacker: new FormControl(''),
    AppReader: new FormControl(''),
    AppTcPrintRef: new FormControl(''),
    BrokerName: new FormControl(''),
    CustName: new FormControl(''),
    Ersall: new FormControl(''),
    FactorDate: new FormControl(''),
    FactorPrivateCode: new FormControl(''),
    HasSignature: new FormControl(''),
    IsEdited: new FormControl(''),
    customercode: new FormControl(''),
  });

  items: any[] = [];
  id!: string;



  ngOnInit() {
    this.id = this.route.snapshot.params['id'];


    // Fetch and update the data from your API
    this.repo.ocrGetFactorDetail(this.id).subscribe((e: any) => {
      this.EditForm_Base.patchValue({
        AppBrokerRef: e[0].AppBrokerRef,
        AppControlDate: e[0].AppControlDate,
        AppControler: e[0].AppControler,
        AppDeliverDate: e[0].AppDeliverDate,
        AppDeliverer: e[0].AppDeliverer,
        AppFactorRef: e[0].AppFactorRef,
        AppFactorState: e[0].AppFactorState,
        AppIsControled: e[0].AppIsControled,
        AppIsDelivered: e[0].AppIsDelivered,
        AppIsPacked: e[0].AppIsPacked,
        AppOCRFactorCode: e[0].AppOCRFactorCode,
        AppPackCount: e[0].AppPackCount,
        AppPackDate: e[0].AppPackDate,
        AppPackDeliverDate: e[0].AppPackDeliverDate,
        AppPacker: e[0].AppPacker,
        AppReader: e[0].AppReader,
        AppTcPrintRef: e[0].AppTcPrintRef,
        BrokerName: e[0].BrokerName,
        CustName: e[0].CustName,
        Ersall: e[0].Ersall,
        FactorDate: e[0].FactorDate,
        FactorPrivateCode: e[0].FactorPrivateCode,
        HasSignature: e[0].HasSignature,
        IsEdited: e[0].IsEdited,
        customercode: e[0].customercode,
      });

    });
  }

  ExitDelivery() {
    this.repo.ExitDelivery(this.id).subscribe(e => {
      // Perform the navigation here
    });

    this.repo.ExitDelivery(this.id).subscribe(e => {
      this.router.navigate(['/application/ocr-list']);

    });
  }

}
