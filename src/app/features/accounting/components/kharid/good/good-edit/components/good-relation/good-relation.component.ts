import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, Renderer2, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { GoodWebApiService } from 'src/app/features/accounting/services/KharidWebApi/goodWebApi.service';
import { CellActionGoodEditImage } from './cell-action-good-edit-image';
import { CellActionGoodImageBtn } from './cell-action-good-edit-image-btn';
import { CellActionGoodGroupBtn } from './cell-action-good-edit-group-btn';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-good-relation',
  templateUrl: './good-relation.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular
  ]
})
export class GoodRelationComponent extends AgGridBaseComponent implements OnInit {
  @Input() GoodCode = ""

  private readonly router = inject(Router);
  private readonly repo = inject(GoodWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);

  constructor() {
    super();
  }

  Code = signal('')
  Code_int = signal(0)

  GoodCode_str = signal('')
  GoodName_str = signal('')
  Imageitem = signal('')
  base_Stack_list = signal<any[]>([])

  Stack_list = signal<any[]>([])
  Group_list = signal<any[]>([])
  base_Group_list = signal<any[]>([])
  base_Group_list1 = signal<any[]>([])

  Image_list = signal<any[]>([])


  SearchTarget_frm = new FormGroup({
    SearchTarget: new FormControl(""),
  });


  KowsarTemplate = new FormGroup({
    Good: new FormArray([])
  });


  JsonForm = new FormGroup({
    JsonData: new FormControl(""),
  });

  originalValues: any = {};
  changedValues: any = {};

  GoodToStack = new FormGroup({
    GoodIndex: new FormControl("1"),
    GoodCode: new FormControl(""),
    StackRef: new FormArray([])
  });

  GoodToGroup = new FormGroup({
    GoodIndex: new FormControl("1"),
    GoodCode: new FormControl(""),
    GoodGroup: new FormArray([])
  });

  selectedRows = signal<any[]>([])

  onSelectionChanged_Row(event: any) {
    this.selectedRows.set(event.api.getSelectedRows())


  }

  onSelectionChanged_node(event: any) {

    this.selectedRows.set(event.api.getSelectedNodes())

    console.log(this.selectedRows());



  }

  ngOnInit() {
    this.Code.set(this.GoodCode)
    this.GetColumnTable();
    this.getDetails()


    this.GetGood_Stacks_Relations()
    this.GetGood_Images_Relations()
    this.GetGood_Groups_Relations()
  }


  getDetails() {

    this.changedValues = {};


    this.LoadData_GetStacks()


    this.LoadData_GetGoodsGrp()



  }

  LoadData_GetGoodsGrp() {

    // Initial data fetch



    this.repo.GetGoodsGrp(this.SearchTarget_frm.value).subscribe((data: any) => {

      this.base_Group_list.set(data.GoodsGrps)

    });

  }

  LoadData_GetStacks() {

    // Initial data fetch



    this.repo.GetStacks(this.SearchTarget_frm.value).subscribe((data: any) => {


      this.base_Stack_list.set(data.Stacks)
    });

  }


  GetImageFromKsr(pixel, KsrImageCode): Observable<any> {

    return this.repo.GetImageFromServer(pixel, KsrImageCode).pipe(tap((data: any) => { })
    );
  }

  DeleteImagefromGood(KsrImageCode) {



    this.repo.DeleteKsrImageCode(KsrImageCode).subscribe(e => {


      this.notificationService.succeded();
      this.GetGood_Images_Relations()
    });
  }


  DeleteGroupfromGood(GoodGroupCode) {



    this.repo.DeleteGoodGroupCode(GoodGroupCode).subscribe(e => {


      this.notificationService.succeded();
      this.GetGood_Groups_Relations()
    });
  }


  ShowImageModal(pixel, KsrImageCode) {



    this.repo.GetImageFromServer(pixel, KsrImageCode).subscribe((data: any) => {



      this.showimage_dialog_show();
      this.Imageitem.set(`data:image;base64,${data.Text}`)

    });
  }



  SetGroup() {



    this.GoodToGroup.patchValue({
      GoodCode: this.Code(),
    });

    (this.GoodToGroup.get('GoodGroup') as FormArray).clear();


    // (this.GoodToGroup.get('GoodGroup') as FormArray).push(new FormControl(parseInt(this.selectedRows[0].StackCode, 10)));
    // Assuming selectedRows is an array of objects with a property StackCode




    this.selectedRows().forEach(row => {
      const GroupCodeInt = parseInt(row.GroupCode, 10);
      (this.GoodToGroup.get('GoodGroup') as FormArray).push(new FormControl(GroupCodeInt));
    });





    (this.KowsarTemplate.get('Good') as FormArray).clear();
    (this.KowsarTemplate.get('Good') as FormArray).push(this.GoodToGroup);





    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate.value)
    });





    this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {

      const result = JSON.parse(data.Goods[0].Result);

      if (result.Good && result.Good[0].ErrMessage === "") {
        this.changedValues = {};
        this.GetGood_Groups_Relations()
        this.selectedRows.set([])
        this.group_dialog_close()
      } else {
        this.notificationService.error(result.Good[0].ErrMessage);
      }

    });







  }

  GetGood_Stacks_Relations() {



    this.repo.GetGood_Stacks(this.Code()).subscribe((e: any) => {
      this.Stack_list.set(e.Goods)
    });
  }

  GetGood_Images_Relations() {



    this.repo.GetGood_Images(this.Code()).subscribe((e: any) => {
      this.Image_list.set(e.Goods)
    });
  }

  GetGood_Groups_Relations() {



    this.repo.GetGood_Groups(this.Code()).subscribe((e: any) => {
      this.Group_list.set(e.Goods)
    });
  }


  GetColumnTable() {


    this.column_name_1 = [
      // {
      //   field: 'عملیات',
      //   pinned: 'left',
      //   cellRenderer: CellActionGoodList,
      //   cellRendererParams: {
      //     editUrl: '/kowsar/good-edit',
      //   },
      //    minWidth: 80
      // },

      {
        field: 'Name',
        headerName: 'نام',

        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'Amount',
        headerName: 'تعداد',

        cellClass: 'text-center',
        minWidth: 80
      },
      {
        field: 'ReservedAmount',
        headerName: 'تعداد رزرو',

        cellClass: 'text-center',
        minWidth: 80
      },
      {
        field: 'StackRef',
        headerName: 'کد انبار',

        cellClass: 'text-center',
        minWidth: 80
      },
      {
        field: 'ActiveStack',
        headerName: 'وضعیت',

        cellClass: 'text-center',
        minWidth: 80
      }
    ];

    this.columnDefs2 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionGoodGroupBtn,
        cellRendererParams: {
          editUrl: '/accounting/good-edit',
        },
        minWidth: 100
      },
      {
        field: 'Name',
        headerName: 'نام   ',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'GoodGroupCode',
        headerName: 'کد',

        cellClass: 'text-center',
        minWidth: 150
      },


    ];


    this.columnDefs3 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionGoodImageBtn,
        cellRendererParams: {
          editUrl: '/accounting/good-edit',
        },
        minWidth: 150
      },
      {
        field: 'عملیات',
        cellRenderer: CellActionGoodEditImage,
        cellRendererParams: {
          editUrl: '/accounting/good-edit',
        },
        minWidth: 150
      },
      {
        field: 'ClassName',
        headerName: 'کد',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'FileName',
        headerName: 'نام فایل  ',

        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.columnDefs5 = [
      // {
      //   headerName: 'Stack Name',
      //   field: 'ame', // Adjust according to your data structure
      //   cellRenderer: 'agGroupCellRenderer', // Use AG Grid's group cell renderer
      //   cellRendererParams: {
      //     suppressCount: true, // Optional, if you don't want to show child counts
      //   },
      //   checkboxSelection: true,
      //   getDataPath: this.getDataPath_stack
      // },
      // Add additional column definitions as necessary
    ];

    this.columnDefs6 = [
      // {
      //   headerName: 'Group Name',
      //   field: 'ame', // Adjust according to your data structure
      //   cellRenderer: 'agGroupCellRenderer', // Use AG Grid's group cell renderer
      //   cellRendererParams: {
      //     suppressCount: true, // Optional, if you don't want to show child counts
      //   },
      //   checkboxSelection: true,
      //   getDataPath: this.getDataPath_group
      // },
      // Add additional column definitions as necessary
    ];


  }



  rowSelection = {
    mode: 'multiple',
    headerCheckbox: true,
    checkboxes: true
  };

  autoGroupColumnDef = {
    headerName: 'Group',

    field: 'name',

    checkboxSelection: true,
    showDisabledCheckboxes: true,

    cellRendererParams: {
      suppressCount: true
    }
  };


  groupSelectsChildren: true


  onRowSelected(event: any) {

    const selectedNodes = event.api.getSelectedNodes();

    const result: any[] = [];

    selectedNodes.forEach((node: any) => {

      // child
      if (node.data) {

        result.push({
          type: 'child',
          ...node.data
        });

        // گرفتن parent ها
        let parent = node.parent;

        while (parent && parent.key) {
          const parentData = this.base_Group_list().find((g: any) =>
            g.Name === parent.key
          );

          result.push({
            type: 'parent',
            ...parentData
          });

          parent = parent.parent;
        }


      }

    });

    // حذف duplicate ها
    const unique = Array.from(
      new Map(result.map(r => [JSON.stringify(r), r])).values()
    );


    this.selectedRows.set(unique);

  }

  getDataPath_group = (task: any): string[] => {
    const pathgroup: string[] = []
    let current = task;

    while (current) {
      pathgroup.unshift(current.Name);
      if (current.GroupRef === 0) break;
      current = this.base_Group_list().find(t => t.GroupCode === current.GroupRef);
    }

    return pathgroup;
  };


  getDataPath_stack = (task: any): string[] => {
    const pathstack: string[] = []
    let current = task;

    while (current) {
      pathstack.unshift(current.Name);
      if (current.StackRef === 0) break;
      current = this.base_Stack_list().find(t => t.StackCode === current.StackRef);
    }

    return pathstack;
  };




  SetStack() {


    this.GoodToStack.patchValue({
      GoodCode: this.Code(),
    });

    (this.GoodToStack.get('StackRef') as FormArray).clear();

    // (this.GoodToStack.get('StackRef') as FormArray).push(new FormControl(parseInt(this.selectedRows[0].StackCode, 10)));
    // Assuming selectedRows is an array of objects with a property StackCode
    this.selectedRows().forEach(row => {
      const stackCodeInt = parseInt(row.StackCode, 10);
      (this.GoodToStack.get('StackRef') as FormArray).push(new FormControl(stackCodeInt));
    });


    (this.KowsarTemplate.get('Good') as FormArray).clear();
    (this.KowsarTemplate.get('Good') as FormArray).push(this.GoodToStack);

    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate.value)
    });






    this.repo.GoodCrudService(this.JsonForm.value).subscribe((data: any) => {


      const result = JSON.parse(data.Goods[0].Result);

      if (result.Good && result.Good[0].ErrMessage === "") {
        this.changedValues = {};
        this.GetGood_Stacks_Relations()
        this.selectedRows.set([])
        this.stack_dialog_close()
      } else {
        this.notificationService.error(result.Good[0].ErrMessage);
      }

    });




  }


  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageData = e.target.result.split(',')[1]; // Get base64 data (remove the header)
        this.sendImageToServer(this.Code(), imageData); // Replace '12345' with your barcode value
      };
      reader.readAsDataURL(file);
    }
  }



  sendImageToServer(ObjectCode: string, imageData: string): void {


    const data = {
      ClassName: "TGood",
      ObjectCode: ObjectCode,
      image: imageData
    };


    this.repo.UploadImageForGood(data).subscribe((response) => {

      this.notificationService.succeded()
      this.GetGood_Images_Relations();
    });

  }




  AddStack() {
    this.stack_dialog_show()
  }
  AddGroup() {
    this.group_dialog_show()

  }


  stack_dialog_show() {
    const modal = this.renderer.selectRootElement('#stacklist', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  stack_dialog_close() {
    const modal = this.renderer.selectRootElement('#stacklist', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  group_dialog_show() {
    const modal = this.renderer.selectRootElement('#grouplist', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  group_dialog_close() {
    const modal = this.renderer.selectRootElement('#grouplist', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  showimage_dialog_show() {
    const modal = this.renderer.selectRootElement('#showimagemodal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  showimage_dialog_close() {
    const modal = this.renderer.selectRootElement('#showimagemodal', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
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


interface Stack {
  StackCode: string;
  L1: string;
  L2: string;
  L3: string;
  L4: string;
  L5: string;
  Name: string;
  children?: Stack[];
}

