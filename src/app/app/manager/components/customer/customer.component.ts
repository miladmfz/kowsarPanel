import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { ManagerWebApiService } from '../../services/ManagerWebApi.service';
import { LocalStorageService } from 'src/app/app-shell/framework-services/local.storage.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
})
export class CustomerComponent
  extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: ManagerWebApiService,
    localStorageService: LocalStorageService
  ) {
    super(localStorageService);
  }



  records;
  title = 'لیست مشتریان کوثر  ';
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
        field: 'CustName_Small',
        headerName: 'نام مشتری  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },
      {
        field: 'Manager',
        headerName: 'مدیریت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },
      {
        field: 'Explain',
        headerName: 'پشتیبانی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },
      {
        field: 'Phone',
        headerName: 'شماره تماس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },

      {
        field: 'Mobile',
        headerName: 'موبایل',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },
    ];

    this.getList();
  }




  getList() {


    this.repo.GetKowsarCustomer(this.Searchtarget).subscribe((data: any) => {
      this.records = data.Customers;

    });


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