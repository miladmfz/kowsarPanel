import { Component, OnInit } from '@angular/core';
import { OcrWebApiService } from '../../../services/OcrWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { CellActionOcrList } from './cell-action-ocr-list';
import { Base_Lookup } from 'src/app/app/kowsar/lookup-type';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ocr-list',
  templateUrl: './ocr-list.component.html',
})
export class OcrListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: OcrWebApiService,
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


  override ngOnInit(): void {
    super.ngOnInit();
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionOcrList,
        cellRendererParams: {
          editUrl: '/application/ocr-factor-detail',
        },
        width: 80,
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






