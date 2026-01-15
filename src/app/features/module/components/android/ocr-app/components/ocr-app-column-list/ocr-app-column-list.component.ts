import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OcrWebApiService } from 'src/app/features/module/services/OcrWebApi.service';

@Component({
  selector: 'app-ocr-app-column-list',
  templateUrl: './ocr-app-column-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

  ],
})
export class OcrAppColumnListComponent implements OnInit {

  private readonly repo = inject(OcrWebApiService);

  constructor() { }

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
