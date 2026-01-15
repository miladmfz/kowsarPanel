import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { OcrWebApiService } from 'src/app/features/module/services/OcrWebApi.service';
import { CellActionOcrList } from './cell-action-ocr-list';
import { AgGridModule } from 'ag-grid-angular';

@Component({
  selector: 'app-ocr-app-factor-list',
  templateUrl: './ocr-app-factor-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
  ],
})
export class OcrAppFactorListComponent extends AgGridBaseComponent
  implements OnInit {

  private readonly router = inject(Router);
  private readonly repo = inject(OcrWebApiService);

  constructor() {
    super();
  }


  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }




  records;
  title = 'لیست کالاها ';
  dateValue = new FormControl('');

  Searchtarget: string = '';

  SourceFlag_lookup: Base_Lookup[] = [
    { id: "0", name: "هر دو دیتابیس" },
    { id: "1", name: "دیتابیس اول" },
    { id: "2", name: "دیتابیس دوم" },
  ]

  EditForm_ocr = new FormGroup({
    Searchtarget: new FormControl(''),
    SourceFlag: new FormControl(0),
  });



  onInputChange() {

    this.getList()
  }


  ngOnInit(): void {
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionOcrList,
        cellRendererParams: {
          editUrl: '/application/ocr-factor-detail',
        },
        minWidth: 80,
      },


      {
        field: 'dbname',
        headerName: 'نام دیتابیس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'CustName',
        headerName: 'نام مشتری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 250
      },
      {
        field: 'FactorDate',
        headerName: 'تاریخ فاکتور',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CustomerCode',
        headerName: 'کد مشتری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'توضیحات',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CustomerPath',
        headerName: 'منطقه',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'AppFactorState',
        headerName: 'وضعیت فاکتور',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.getList();
  }
  getList() {

    this.repo.OcrFactorList(this.EditForm_ocr.value.Searchtarget, this.EditForm_ocr.value.SourceFlag + "")
      .subscribe((data) => {
        this.records = data;

      });

  }

  navigateToEdit(id) {
    this.router.navigate(['/application/ocr-factor-detail', id]);
  }
}






