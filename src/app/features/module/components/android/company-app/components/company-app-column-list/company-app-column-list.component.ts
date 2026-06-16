import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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

  Apptype = signal('0');
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
