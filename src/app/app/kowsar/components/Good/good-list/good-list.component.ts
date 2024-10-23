import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KowsarWebApiService } from '../../../services/KowsarWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { FormControl } from '@angular/forms';
import { CellActionGoodList } from './cell-action-good-ist';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';

@Component({
  selector: 'app-good-list',
  templateUrl: './good-list.component.html',
})
export class GoodListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: KowsarWebApiService,
    private readonly notificationService: NotificationService,

  ) {
    super();
  }



  records;
  title = 'لیست کالاها ';
  dateValue = new FormControl();

  Searchtarget: string = '';

  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = ""
    }
    this.getList()
  }


  override ngOnInit(): void {
    super.ngOnInit();

    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionGoodList,
        cellRendererParams: {
          editUrl: '/kowsar/good-edit',
        },
        width: 100
      },

      {
        field: 'GoodCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'GoodName',
        headerName: 'نام کالا  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'MaxSellPrice',
        headerName: ' قیمت ناخالص',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'MinSellPrice',
        headerName: ' قیمت خالص',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'GoodType',
        headerName: 'نوع کالا  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'GoodExplain1',
        headerName: ' مشخصه1 ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'GoodExplain2',
        headerName: 'مشخصه2',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'GoodExplain3',
        headerName: 'مشخصه3',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.getList();
  }
  getList() {


    this.repo.GetGoodList().subscribe((data: any) => {
      this.records = data.Goods;

    });




  }

  navigateToEdit(id) {
    this.router.navigate(['/kowsar/good-edit', id]);
  }
}

















































/*

implements OnInit {

constructor(
  private repo: KowsarWebApiService,
  private route: ActivatedRoute,

) { }

items: any[] = [];
TextData: string = '';
selectedOption: string = '0';
dateValue = new FormControl();
id: string = "0";

Searchtarget: string = '';
CentralRef: string = '';
GroupCode_str: string = '0';



ngOnInit() {

  if (this.route.snapshot.params['id']) {
    this.id = this.route.snapshot.params['id'];
  }

  if (parseInt(this.id) > 0) {
    this.GroupCode_str = this.id
    this.LoadList();
  } else {
    this.repo.kowsar_info("AppOrder_DefaultGroupCode").subscribe(e => {

      this.GroupCode_str = e[0].DataValue
      this.LoadList();
    });
  }



}


onInputChange() {

}


LoadList() {

  this.repo.GetOrderGoodList("30", this.Searchtarget, this.GroupCode_str).subscribe(e => {
    this.items = e;
     this.items);

  });

}






}
*/