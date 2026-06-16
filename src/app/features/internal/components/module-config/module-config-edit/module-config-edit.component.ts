import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { InternalAppsWebApiService } from '../../../services/InternalAppsWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CellActionModuleValueList } from './cell_action_module_value_list';


@Component({
  selector: 'app-module-config-edit',
  templateUrl: './module-config-edit.component.html',
  standalone: true,

  // مهم‌ترین بخش!
  imports: [
    CommonModule,
    AgGridModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridAngular
  ],
})
export class ModuleConfigEditComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  records = signal<any[]>([])
  title = signal('لیست پیش فرض ')
  loading = signal(false)
  ConfigName = signal("")
  ConfigFCaption = signal("")

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly repo = inject(InternalAppsWebApiService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    super();
  }




  EditForm_ModuleConfig = new FormGroup({
    ModuleConfigCode: new FormControl(''),
    ConfigName: new FormControl(''),
    ConfigFCaption: new FormControl(''),
    ClassName: new FormControl('Web_site'),
    Explain: new FormControl(''),
    IsActive: new FormControl(''),
    ModuleValueCode: new FormControl(''),
    ModuleConfigRef: new FormControl(''),
    ValueName: new FormControl(''),
    ValueFCaption: new FormControl(''),
    Sort: new FormControl(''),
  });

  ngOnInit(): void {

    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.ConfigName.set(id)
        this.getList();
      } else {
        this.ConfigName.set("")
      }
    });



    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionModuleValueList,
        cellRendererParams: {
          editUrl: '/manager/application-form',
        },
        width: 80,
      },


      {
        field: 'ConfigFCaption',
        headerName: 'عنوان پیش فرض ',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ValueName',
        headerName: 'عنوان ',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ValueFCaption',
        headerName: 'توضیح فارسی',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Sort',
        headerName: 'Sort',

        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.getList();
  }

  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    // ذخیره API درست
    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    // فیت کردن ستون‌ها با تأخیر کوتاه
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch { }
    }, 50);
  }


  getList(): void {
    this.EditForm_ModuleConfig.patchValue({ ConfigName: this.ConfigName() })


    this.repo.GetModuleValue(this.EditForm_ModuleConfig.value).subscribe((data: any) => {

      this.records.set(data?.ModuleConfigs ?? [])
      this.ConfigFCaption.set(data?.ModuleConfigs[0].ConfigFCaption)
      this.updateGridData(1, this.records());
    });
  }

  AddNew(): void {

    this.EditForm_ModuleConfig.reset()

    this.EditForm_ModuleConfig.patchValue({
      ConfigName: this.ConfigName(),

      ConfigFCaption: this.ConfigFCaption(),
      ClassName: "Web_site",
      Explain: "",
      IsActive: "",
      ValueName: "",
      ValueFCaption: "",
      Sort: "0",


    })

    this.modulevalue_dialog_show()

  }

  modulevalue_Insert(): void {


    this.EditForm_ModuleConfig.patchValue({
      Sort: this.EditForm_ModuleConfig.value.Sort + "",
    })

    this.repo.ModuleValueInsert(this.EditForm_ModuleConfig.value).subscribe((data: any) => {
      this.modulevalue_dialog_close()
      this.getList()
      this.notificationService.succeded()
    });

  }




  btnDeleteClicked(data: any): void {


    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: 'حذف رکورد',
        text: 'در صورت حذف، قابل بازیابی نخواهد بود.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'بله، حذف شود',
        cancelButtonText: 'انصراف',
        customClass: {
          confirmButton: 'btn btn-success mx-2',
          cancelButton: 'btn btn-danger',
        },
        buttonsStyling: false,
      }).then(result => {
        if (result.isConfirmed) {



          this.repo.DeleteModuleValue(data.ModuleValueCode).subscribe({
            next: () => {
              this.notificationService.succeded()
              setTimeout(() => this.getList(), 10);
            },
            error: () => {

              this.notificationService.error('❌ خطا در حذف رکورد')
            },
          });


        } else {
          this.notificationService.info('عملیات حذف لغو شد');
        }
      });
    });
  }




  private readonly renderer = inject(Renderer2);


  @ViewChild('modulevalue', { static: false }) modulevalue!: ElementRef<HTMLDivElement>;



  modulevalue_dialog_show(): void {
    const modal = this.modulevalue?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  modulevalue_dialog_close(): void {
    const modal = this.modulevalue?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }




}