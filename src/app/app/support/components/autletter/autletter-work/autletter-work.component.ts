import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { CellActionAutletterWork } from './cell-action-autletter-work';
import { ValidateionStateCellAutletterWorkRenderer } from './validation-state-label-cell-autletter-work';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { IDatepickerTheme } from 'ng-persian-datepicker';

@Component({
  selector: 'app-autletter-work',
  templateUrl: './autletter-work.component.html',
})
export class AutletterWorkComponent
  extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private router: Router,
    private repo: AutletterWebApiService,
  ) {
    super();
  }

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };

  EditForm_autletter = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl(''),
    CreationDate: new FormControl(''),
    OwnCentralRef: new FormControl(''),
    PersonInfoCode: new FormControl(''),

  });
  loading: boolean = true;

  searchTerm: string = '';
  ToDayDate: string = '';
  records;
  title = 'لیست تیکت های من ';
  dateValue = new FormControl();
  PersonInfoCode: string = '';
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
        cellRenderer: CellActionAutletterWork,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 80,
      },
      {
        field: 'وضعیت تیکت',
        cellRenderer: ValidateionStateCellAutletterWorkRenderer,
        cellClass: 'text-center',
        minWidth: 80

      },
      {
        field: 'RowLetterDate',
        headerName: 'تاریخ ارجاع',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'LetterDescription',
        headerName: 'متن تیکت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 300
      },
      {
        field: 'RowLetterState',
        headerName: ' وضعیت ارجاع',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'AutLetterRow_PropDescription1',
        headerName: 'خلاصه عملکرد	',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 250
      },
      {
        field: 'LetterDate',
        headerName: 'تاریخ تیکت	',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'RowExecutorName',
        headerName: 'کاربر فعلی	',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'LetterTitle',
        headerName: 'عنوان تیکت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 300
      },


    ];

    this.repo.GetTodeyFromServer().subscribe((data: any) => {

      this.ToDayDate = data[0].TodeyFromServer
      this.getList();
    });

  }



  getList() {

    this.loading = true

    this.EditForm_autletter.patchValue({
      SearchTarget: this.searchTerm,
      CentralRef: "0",
      CreationDate: "",
      OwnCentralRef: "0",
      PersonInfoCode: sessionStorage.getItem("PersonInfoRef")
    });

    this.repo.GetAutLetterListByPerson(this.EditForm_autletter.value).subscribe((data) => {
      this.records = data;
      this.loading = false

    });

  }



  LoadList() {


    this.loading = true
    this.EditForm_autletter.patchValue({
      SearchTarget: this.searchTerm,
      CentralRef: "0",
      CreationDate: this.dateValue.value,
      OwnCentralRef: "0",
      PersonInfoCode: sessionStorage.getItem("PersonInfoRef")
    });


    this.repo.GetAutLetterListByPerson(this.EditForm_autletter.value).subscribe((data) => {
      this.records = data;
      this.loading = false

    });

  }




























  navigateToEdit(id) {
    this.router.navigate(['/support/letter-detail', id]);
  }


}





