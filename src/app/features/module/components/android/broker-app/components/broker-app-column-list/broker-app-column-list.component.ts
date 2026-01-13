import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
    this.repo.GetBasketColumnList(this.Apptype)
      .subscribe(e => {
        this.BasketColumns = e;
      });
  }

}
