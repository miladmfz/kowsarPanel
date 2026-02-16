import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { BrokerWebApiService } from 'src/app/features/module/services/BrokerWebApi.service';
import { CellActionBrokerList } from './cell-action-broker-list';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';

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


  PhAddress3: string = '';

  records;



  ngOnInit(): void {
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionBrokerList,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        minWidth: 80,
      },
      {
        field: 'BrokerNameWithoutType',
        headerName: ' نام بازاریاب',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'RelationType',
        headerName: 'نوع ارتباط',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'توضیحات ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'BrokerCode',
        headerName: 'کد بازاریابی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CentralRef',
        headerName: 'کد اجزای پایه',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];




    this.repo.GetBrokers()
      .subscribe(e => {
        this.records = e;

      });
  }


  navigateToDetail(BrokerCode) {
    this.router.navigate(['/application/broker-report', BrokerCode]);


  }




}
