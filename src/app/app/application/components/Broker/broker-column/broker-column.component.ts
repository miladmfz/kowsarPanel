import { Component, OnInit } from '@angular/core';
import { ApplicationWebApiService } from '../../../services/ApplicationWebApi.service';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-broker-column',
  templateUrl: './broker-column.component.html',

})
export class BrokerColumnComponent implements OnInit {


  constructor(
    private repo: ApplicationWebApiService,
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

      console.log(this.BasketColumns)

    });

  }



}
