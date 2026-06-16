import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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


  private readonly repo = inject(OrderWebApiService);


  constructor() { }

  Apptype = signal('3');
  BasketColumns = signal<any[]>([])

  ngOnInit() {
    this.GetBasketColumnList()
  }

  GetBasketColumnList() {

    this.repo.GetBasketColumnList(this.Apptype())
      .subscribe(e => {
        this.BasketColumns.set(e)
      });
  }
}
