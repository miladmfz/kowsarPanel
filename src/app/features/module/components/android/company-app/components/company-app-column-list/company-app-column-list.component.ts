import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { CompanyWebApiService } from 'src/app/features/module/services/CompanyWebApi.service';

@Component({
  selector: 'app-company-app-column-list',
  templateUrl: './company-app-column-list.component.html',
  standalone: true,
  imports: [
    CommonModule,

    ReactiveFormsModule,
    RouterModule,
  ],
})
export class CompanyAppColumnListComponent implements OnInit {



  private readonly repo = inject(CompanyWebApiService);


  constructor() { }




  Apptype: string = "0";
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
