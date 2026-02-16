import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { BrokerWebApiService } from 'src/app/features/module/services/BrokerWebApi.service';

@Component({
  selector: 'app-broker-app-panel',
  templateUrl: './broker-app-panel.component.html',
  standalone: true,
  imports: [
    CommonModule,
  ],
})
export class BrokerAppPanelComponent implements OnInit {

  private readonly repo = inject(BrokerWebApiService);
  constructor() { }


  ListVisible_items: any[] = [];
  DetailVisible_items: any[] = [];
  SearchVisible_items: any[] = [];
  Apptype: string = "1";

  ngOnInit() {


    this.ListVisible_Card()
    this.DetailVisible_Card()
    this.SearchVisible_Card()



  }






  ListVisible_Card() {


    this.repo.BasketColumnCard("ListVisible", this.Apptype)
      .subscribe(e => {
        this.ListVisible_items = e;

      });

  }

  DetailVisible_Card() {

    this.repo.BasketColumnCard("DetailVisible", this.Apptype)
      .subscribe(e => {
        this.DetailVisible_items = e;

      });

  }

  SearchVisible_Card() {

    this.repo.BasketColumnCard("SearchVisible", this.Apptype)
      .subscribe(e => {
        this.SearchVisible_items = e;

      });

  }

















}
