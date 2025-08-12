import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { KowsarWebApiService } from '../../../services/KowsarWebApi.service';
import { FormControl } from '@angular/forms';
import { CellActionGoodList } from '../../Good/good-list/cell-action-good-ist';
import { GridOptions } from 'ag-grid-community';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-goodsgrp-list',
  templateUrl: './goodsgrp-list.component.html',
})
export class GoodsgrpListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: KowsarWebApiService,
    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }
  ngOnDestroy() {

    this.themeSub.unsubscribe();

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
  base_Group_list: any[] = [];




  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = ""
    }
    this.LoadData_GetGoodsGrp()
  }


  override ngOnInit(): void {
    super.ngOnInit();
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });

    this.columnDefs6 = [
      {
        headerName: 'Group Name',
        field: 'ame', // Adjust according to your data structure
        cellRenderer: 'agGroupCellRenderer', // Use AG Grid's group cell renderer
        cellRendererParams: {
          suppressCount: true, // Optional, if you don't want to show child counts
        },
        checkboxSelection: true,
        getDataPath: this.getDataPath_group
      },
      {
        field: 'GroupCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionGoodList,
        cellRendererParams: {
          editUrl: '/kowsar/good-list',
        },
        minWidth: 80
      },
      // Add additional column definitions as necessary
    ];





    this.LoadData_GetGoodsGrp();
  }

  LoadData_GetGoodsGrp() {

    // Initial data fetch
    this.repo.GetGoodsGrp().subscribe((data: any) => {
      this.base_Group_list = data.GoodsGrps

      const treeStructure = this.buildTree_group(data.GoodsGrps);



    });

  }
  buildTree_group(groups: Group[]): Group[] {
    const groupMap = new Map<string, Group>();

    // Step 1: Create a map of groups for easy lookup
    for (const group of groups) {
      group.children = [];
      groupMap.set(group.GroupCode, group);
    }

    // Step 2: Build the tree structure
    const tree: Group[] = [];

    for (const group of groups) {
      const { L1, L2, L3, L4, L5, GroupCode } = group;

      // Determine the parent based on the L values
      let parent: Group | undefined;

      if (L1 === '0') {
        // Top-level group (L1 is 0)
        tree.push(group);
      } else {
        // Find the appropriate parent group
        if (L2 === '0') {
          parent = groupMap.get(L1); // Parent is L1
        } else if (L3 === '0') {
          parent = groupMap.get(L2); // Parent is L2
        } else if (L4 === '0') {
          parent = groupMap.get(L3); // Parent is L3
        } else if (L5 === '0') {
          parent = groupMap.get(L4); // Parent is L4
        } else {
          parent = groupMap.get(L5); // Parent is L5
        }

        // If a parent is found, push this group to its children's array
        if (parent) {
          parent.children.push(group);
        }
      }
    }

    return tree;
  }

  public gridOptions: GridOptions;
  getDataPath_group = (data: Group) => {
    const path: string[] = [];

    // Construct the path based on L1, L2, L3, L4, and L5
    if (data.L1 !== '0') {
      const parentL1 = this.findGroupByCode(data.L1);
      if (parentL1) {
        path.push(parentL1.Name); // Add the L1 parent group name
      }
    }

    if (data.L2 !== '0') {
      const parentL2 = this.findGroupByCode(data.L2);
      if (parentL2) {
        path.push(parentL2.Name); // Add the L2 parent group name
      }
    }

    if (data.L3 !== '0') {
      const parentL3 = this.findGroupByCode(data.L3);
      if (parentL3) {
        path.push(parentL3.Name); // Add the L3 parent group name
      }
    }

    if (data.L4 !== '0') {
      const parentL4 = this.findGroupByCode(data.L4);
      if (parentL4) {
        path.push(parentL4.Name); // Add the L4 parent group name
      }
    }

    // Finally, add the current group's name
    path.push(data.Name);

    return path;
  };

  // Helper method to find a group by its GroupCode
  findGroupByCode(groupCode: string): Group | undefined {
    return this.base_Group_list.find(group => group.GroupCode === groupCode);
  }





  navigateToEdit(id) {
    this.router.navigate(['/kowsar/good-list', id]);
  }
}



interface Group {
  GroupCode: string;
  L1: string;
  L2: string;
  L3: string;
  L4: string;
  L5: string;
  Name: string;
  children?: Group[];
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
     this.items);

  });

}

}
*/