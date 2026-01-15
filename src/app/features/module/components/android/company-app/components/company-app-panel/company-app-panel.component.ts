import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CompanyWebApiService } from 'src/app/features/module/services/CompanyWebApi.service';

@Component({
  selector: 'app-company-app-panel',
  templateUrl: './company-app-panel.component.html',
  standalone: true,
  imports: [
    CommonModule,

    ReactiveFormsModule,
    RouterModule,
  ],
})
export class CompanyAppPanelComponent implements OnInit {

  private readonly repo = inject(CompanyWebApiService);


  constructor() { }


  ListVisible_items: any[] = [];
  DetailVisible_items: any[] = [];
  SearchVisible_items: any[] = [];
  Apptype: string = "0";

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
