import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderWebApiService } from 'src/app/features/module/services/OrderWebApi.service';

@Component({
  selector: 'app-order-app-column-list',
  templateUrl: './order-app-column-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
})
export class OrderAppColumnListComponent implements OnInit {

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
    this.repo.GetBasketColumnList(this.Apptype)
      .subscribe(e => {
        this.BasketColumns = e;
      });
  }
}
