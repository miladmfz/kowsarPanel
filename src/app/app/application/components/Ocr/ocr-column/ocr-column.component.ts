import { Component, OnInit } from '@angular/core';
import { ApplicationWebApiService } from '../../../services/ApplicationWebApi.service';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';


@Component({
  selector: 'app-ocr-column',
  templateUrl: './ocr-column.component.html',
})
export class OcrColumnComponent implements OnInit {


  constructor(
    private repo: ApplicationWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder
  ) { }




  Apptype: string = "2";
  BasketColumns: any[] = [];

  ngOnInit() {


    this.GetBasketColumnList()




  }




  GetBasketColumnList() {

    this.repo.GetBasketColumnList(this.Apptype).subscribe(e => {
      this.BasketColumns = e;

      console.log(this.BasketColumns)

    });

  }



}
