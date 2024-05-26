import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { CompanyWebApiService } from '../../../services/CompanyWebApi.service';


@Component({
  selector: 'app-company-column',
  templateUrl: './company-column.component.html',
})
export class CompanyColumnComponent implements OnInit {


  constructor(
    private repo: CompanyWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder
  ) { }




  Apptype: string = "0";
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
