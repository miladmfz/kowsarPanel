import { Component, OnInit, Renderer2 } from '@angular/core';
import { BrokerWebApiService } from '../../../services/BrokerWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { CellActionBrokerList } from './cell-action-broker-list';

@Component({
  selector: 'app-broker-list',
  templateUrl: './broker-list.component.html',
})
export class BrokerListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: BrokerWebApiService,
    private renderer: Renderer2
  ) {
    super();
  }

  PhAddress3: string = '';

  records;



  override ngOnInit(): void {
    super.ngOnInit();

    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionBrokerList,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 250,
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



    this.repo.GetBrokers().subscribe(e => {
      this.records = e;

    });
  }


  navigateToDetail(BrokerCode) {
    this.router.navigate(['/application/broker-report', BrokerCode]);


  }




}
