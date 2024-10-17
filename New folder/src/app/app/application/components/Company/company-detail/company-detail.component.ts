import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { CompanyWebApiService } from '../../../services/CompanyWebApi.service';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
})
export class CompanyDetailComponent implements OnInit {

  constructor(
    private repo: CompanyWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder
  ) { }


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

    this.repo.BasketColumnCard("ListVisible", this.Apptype).subscribe(e => {
      this.ListVisible_items = e;

    });

  }

  DetailVisible_Card() {
    this.repo.BasketColumnCard("DetailVisible", this.Apptype).subscribe(e => {
      this.DetailVisible_items = e;

    });

  }

  SearchVisible_Card() {
    this.repo.BasketColumnCard("SearchVisible", this.Apptype).subscribe(e => {
      this.SearchVisible_items = e;

    });

  }







}
