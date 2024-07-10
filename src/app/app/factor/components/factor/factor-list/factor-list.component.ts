import { Component, OnInit, Renderer2 } from '@angular/core';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { FactorWebApiService } from '../../../services/FactorWebApi.service';
import { Router } from '@angular/router';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { FormControl, FormGroup } from '@angular/forms';
import { CellActionFactorList } from './cell-action-factor-list';

@Component({
  selector: 'app-factor-list',
  templateUrl: './factor-list.component.html',
})
export class FactorListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: FactorWebApiService,
    private renderer: Renderer2

  ) {
    super();
  }



  start_dateValue = new FormControl();
  End_dateValue = new FormControl();

  CentralRef: string = '';
  JobPersonRef: string = '';

  Searchtarget: string = '';
  items: any[] = [];
  TextData: string = '';
  selectedOption: string = '0';

  searchTerm: string = '';



  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };



  records;
  title = 'فاکتور فروش';

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
        cellRenderer: CellActionFactorList,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 80,
      },
      {
        field: 'FactorDate',
        headerName: 'تاریخ فاکتور',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'CustomerName',
        headerName: 'نام مشتری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'OwnerName',
        headerName: 'نام پشتیبان',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'starttime',
        headerName: 'شروع',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      }, {
        field: 'Endtime',
        headerName: 'پایان',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      }, {
        field: 'worktime',
        headerName: 'مدت کار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 80
      }, {
        field: 'Barbary',
        headerName: 'شرح',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
    ];

    setTimeout(() => {
      this.getList();
    }, 200);
  }




  getList() {

    this.EditForm_factor.patchValue({
      StartDateTarget: this.start_dateValue.value,
      EndDateTarget: this.End_dateValue.value,
      SearchTarget: this.Searchtarget,
      isShopFactor: "0",
    });

    this.repo.GetFactor(this.EditForm_factor.value).subscribe((data: any) => {
      this.records = data.Factors;

    });


  }



  EditForm_factor = new FormGroup({
    StartDateTarget: new FormControl(''),
    EndDateTarget: new FormControl(''),
    SearchTarget: new FormControl(''),
    isShopFactor: new FormControl('0'),

  });





  EditForm_factor_property = new FormGroup({
    starttime: new FormControl(''),
    Endtime: new FormControl(''),
    worktime: new FormControl(''),
    Barbary: new FormControl(''),
    ObjectRef: new FormControl('0'),

  });







  Edit_factor_Property(FactorCode) {

    this.property_dialog_show()
    this.records.forEach((factor: any) => {

      if (factor.FactorCode == FactorCode) {
        this.EditForm_factor_property.patchValue({
          starttime: factor.starttime,
          Endtime: factor.Endtime,
          worktime: factor.worktime,
          Barbary: factor.Barbary,
          ObjectRef: factor.FactorCode,
        });
      }


    })
  }





  Set_factor_Property() {
    //// send Property to server

    console.log(this.selectedRows)

    this.repo.EditFactorProperty(this.EditForm_factor_property.value).subscribe((data: any) => {
      this.property_dialog_close()
      this.getList()
      this.EditForm_factor_property.reset()
    });



  }


  property_dialog_show() {
    const modal = this.renderer.selectRootElement('#factorproperty', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  property_dialog_close() {
    const modal = this.renderer.selectRootElement('#factorproperty', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


}



