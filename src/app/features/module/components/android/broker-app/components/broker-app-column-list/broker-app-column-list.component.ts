import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrokerWebApiService } from 'src/app/features/module/services/BrokerWebApi.service';

@Component({
  selector: 'app-broker-app-column-list',
  templateUrl: './broker-app-column-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
})
export class BrokerAppColumnListComponent implements OnInit {


  private readonly repo = inject(BrokerWebApiService);

  constructor() { }

  Apptype = signal('1');
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
