import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
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

  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(OrderWebApiService);


  constructor() { }

  Apptype: string = "3";
  BasketColumns: any[] = [];

  ngOnInit() {
    this.GetBasketColumnList()
  }

  GetBasketColumnList() {
    this.loadingService.show()
    this.repo.GetBasketColumnList(this.Apptype)
      .subscribe(e => {
        this.BasketColumns = e;
      });
  }
}
