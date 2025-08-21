import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KowsarWebApiService } from '../../../services/KowsarWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { CellActionGoodOrderList } from './cell-action-good-order-list';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-good-list',
  templateUrl: './good-order-list.component.html',
})
export class GoodOrderListComponent
  extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: KowsarWebApiService,
    private location: Location,
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
        cellRenderer: CellActionGoodOrderList,
        cellRendererParams: {
          editUrl: '/kowsar/good-order-edit',
        },
        minWidth: 80
      },

      {
        field: 'GoodCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
      {
        field: 'GoodName',
        headerName: 'نام کالا  ',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
      {
        field: 'MaxSellPrice',
        headerName: ' قیمت ناخالص',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },

    ];

    this.getList();
  }
  getList() {


    // this.repo.GetOrderGoodList("30", this.Searchtarget, "0".pipe(
    catchError(error => {
      this.notificationService.error('مشکل در برقراری ارتباط', "خطا");
      return of(null); // یا هر مقدار جایگزین
    })
      .subscribe((data) => {
        //   this.records = data;

        // });


      }

  navigateToEdit(id) {
        this.router.navigate(['/kowsar/good-order-edit', id]);
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
      this.repo.kowsar_info("AppOrder_DefaultGroupCode")
    )(e => {

        this.GroupCode_str = e[0].DataValue
        this.LoadList();
      });
    }



  }


  onInputChange() {

  }


  LoadList() {

    this.repo.GetOrderGoodList("30", this.Searchtarget, this.GroupCode_str)
    )(e => {
      this.items = e;
       this.items);

    });

  }






}
*/