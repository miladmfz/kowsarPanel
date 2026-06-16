import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { BrokerWebApiService } from 'src/app/features/module/services/BrokerWebApi.service';
import { CellActionBrokerList } from './cell-action-broker-list';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';

@Component({
  selector: 'app-broker-app-sellbroker-list',
  templateUrl: './broker-app-sellbroker-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    NgPersianDatepickerModule,
  ],
})

export class BrokerAppSellbrokerListComponent extends AgGridBaseComponent
  implements OnInit {

  private readonly router = inject(Router);

  private readonly repo = inject(BrokerWebApiService);

  constructor() {
    super();
  }



  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }



  records = signal<any[]>([])



  ngOnInit(): void {
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionBrokerList,
        cellRendererParams: {
          editUrl: '/automation/letter-detail',
        },
        minWidth: 80,
      },
      {
        field: 'BrokerNameWithoutType',
        headerName: ' نام بازاریاب',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'RelationType',
        headerName: 'نوع ارتباط',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'توضیحات ',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'BrokerCode',
        headerName: 'کد بازاریابی',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CentralRef',
        headerName: 'کد اجزای پایه',

        cellClass: 'text-center',
        minWidth: 150
      },

    ];




    this.repo.GetBrokers()
      .subscribe(e => {
        this.records.set(e)

      });
  }


  navigateToDetail(BrokerCode) {
    this.router.navigate(['/application/broker-report', BrokerCode]);


  }




}
