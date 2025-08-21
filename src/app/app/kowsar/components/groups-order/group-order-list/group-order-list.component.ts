import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KowsarWebApiService } from '../../../services/KowsarWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { CellActionGoodOrderList } from '../../goods_order/good-order-list/cell-action-good-order-list';
@Component({
  selector: 'app-group-list',
  templateUrl: './group-order-list.component.html',
})
export class GroupOrderListComponent
  extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: KowsarWebApiService,
  ) {
    super();
  }



  records;
  title = 'لیست کالاها ';


  items: any[] = [];
  TextData: string = '';
  selectedOption: string = '0';
  dateValue = new FormControl();

  Searchtarget: string = '';
  CentralRef: string = '';
  GroupCode_str: string = '0';




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
        cellRenderer: CellActionGoodOrderList,
        cellRendererParams: {
          editUrl: '/kowsar/good-list',
        },
        minWidth: 80
      },

      {
        field: 'GroupCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
      {
        field: 'Name',
        headerName: 'نام کالا  ',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },

    ];

    this.getList();
  }
  getList() {


    // this.repo.GetOrdergroupList(this.GroupCode_str.pipe(
    catchError(error => {
      this.notificationService.error('مشکل در برقراری ارتباط', "خطا");
      return of(null); // یا هر مقدار جایگزین
    })
      .subscribe((data) => {
        //   this.records = data;


        // });


      }

  navigateToEdit(id) {
        this.router.navigate(['/kowsar/good-list', id]);
      }
  }

















/*

implements OnInit {

  constructor(private repo: KowsarWebApiService,) { }

  items: any[] = [];
  TextData: string = '';
  selectedOption: string = '0';
  dateValue = new FormControl();

  Searchtarget: string = '';
  CentralRef: string = '';
  GroupCode_str: string = '0';



  ngOnInit() {



    this.repo.kowsar_info("AppOrder_DefaultGroupCode")
    )(e => {
      this.GroupCode_str = e[0].DataValue

      this.LoadList();
    });


  }


  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = "%"
    }
  }


  LoadList() {

    this.repo.GetOrdergroupList(this.GroupCode_str)
    )(e => {
      this.items = e;
       this.items);

    });

  }

}
*/