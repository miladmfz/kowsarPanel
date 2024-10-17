import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { BrokerWebApiService } from '../../../services/BrokerWebApi.service';

@Component({
  selector: 'app-broker-column',
  templateUrl: './broker-column.component.html',

})
export class BrokerColumnComponent implements OnInit {


  constructor(
    private repo: BrokerWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder
  ) { }




  Apptype: string = "1";
  BasketColumns: any[] = [];

  ngOnInit() {


    this.GetBasketColumnList()




  }




  GetBasketColumnList() {

    this.repo.GetBasketColumnList(this.Apptype).subscribe(e => {
      this.BasketColumns = e;

    });

  }



}
