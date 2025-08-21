import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';
import { OcrWebApiService } from '../../../services/OcrWebApi.service';


@Component({
  selector: 'app-ocr-column',
  templateUrl: './ocr-column.component.html',
})
export class OcrColumnComponent implements OnInit {


  constructor(
    private repo: OcrWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder
  ) { }

  Apptype: string = "2";
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
