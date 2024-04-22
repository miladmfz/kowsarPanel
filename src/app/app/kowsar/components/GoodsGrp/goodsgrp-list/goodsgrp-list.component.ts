import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { KowsarWebApiService } from '../../../services/KowsarWebApi.service';
import { LocalStorageService } from 'src/app/app-shell/framework-services/local.storage.service';
import { SettingService } from 'src/app/app-shell/framework-services/setting.service';
import { FormControl } from '@angular/forms';
import { CellActionGoodList } from '../../Good/good-list/cell-action-good-ist';

@Component({
  selector: 'app-goodsgrp-list',
  templateUrl: './goodsgrp-list.component.html',
})
export class GoodsgrpListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: KowsarWebApiService,
    localStorageService: LocalStorageService,
    settingService: SettingService
  ) {
    super(localStorageService, settingService);
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
        cellRenderer: CellActionGoodList,
        cellRendererParams: {
          editUrl: '/kowsar/good-list',
        },
        width: 50,
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


    this.repo.GetOrdergroupList(this.GroupCode_str).subscribe((data) => {
      this.records = data;


    });


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



  this.repo.kowsar_info("AppOrder_DefaultGroupCode").subscribe(e => {
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

  this.repo.GetOrdergroupList(this.GroupCode_str).subscribe(e => {
    this.items = e;
    console.log(this.items);

  });

}

}
*/