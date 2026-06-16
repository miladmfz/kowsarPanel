import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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

  Apptype = signal('2');
  BasketColumns = signal<any[]>([])

  ngOnInit() {
    this.GetBasketColumnList()
  }

  GetBasketColumnList() {

    this.repo.GetBasketColumnList(this.Apptype())
      .subscribe(e => {
        this.BasketColumns.set(e)
      });
  }

}
