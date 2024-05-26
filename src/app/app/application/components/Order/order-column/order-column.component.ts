import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { OrderWebApiService } from '../../../services/OrderWebApi.service';

@Component({
  selector: 'app-order-column',
  templateUrl: './order-column.component.html',
})
export class OrderColumnComponent implements OnInit {


  constructor(
    private repo: OrderWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder
  ) { }




  Apptype: string = "3";
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
