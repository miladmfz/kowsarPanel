import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { BrokerWebApiService } from 'src/app/features/module/services/BrokerWebApi.service';
import { OrderWebApiService } from 'src/app/features/module/services/OrderWebApi.service';

@Component({
  selector: 'app-broker-app-column-list',
  templateUrl: './broker-app-column-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
})
export class BrokerAppColumnListComponent implements OnInit {


  private readonly repo = inject(BrokerWebApiService);

  constructor() { }

  Apptype: string = "1";
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
