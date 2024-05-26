import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderWebApiService } from '../../../services/OrderWebApi.service';

@Component({
  selector: 'app-order-customer',
  templateUrl: './order-customer.component.html',
})
export class OrderCustomerComponent implements OnInit {

  constructor(
    private repo: OrderWebApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  items: any = [];
  Printers: any = [];
  BasketColumns: any = [];


  id: string = "";


  ngOnInit() {

    if (this.route.snapshot.params['id']) {
      this.id = this.route.snapshot.params['id'];
    }
    if (this.id.length > 0) {
      this.GetDetailCustomer();

    } else {
      this.GetCustomer();

    }
  }

  GetCustomer() {

    this.repo.GetCustomerMandeh().subscribe(e => {
      this.items = e;
    });

  }
  GetDetailCustomer() {

    this.repo.GetCustomerlastGood(this.id).subscribe(e => {
      this.items = e;
    });

  }


}
