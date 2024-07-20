import { Component, OnInit } from '@angular/core';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { FormControl, FormGroup } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { CellActionAutletterList } from './cell-action-autletter-list';
import { ValidateionStateCellAutletterRenderer } from './validation-state-label-cell-autletter';

@Component({
  selector: 'app-autletter-list',
  templateUrl: './autletter-list.component.html',
})
export class AutletterListComponent
  extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private router: Router,
    private repo: AutletterWebApiService,
  ) {
    super();
  }



  records;
  title = 'لیست تیکت های ارسالی ';
  dateValue = new FormControl();
  CentralRef: string = '';
  JobPersonRef: string = '';

  items: any[] = [];
  TextData: string = '';
  selectedOption: string = '0';

  searchTerm: string = '';
  ToDayDate: string = '';

  loading: boolean = true;

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };

  onInputChange() {
    if (this.searchTerm == "") {
      this.searchTerm = ""
    }
    this.LoadList()
  }




  override ngOnInit(): void {
    super.ngOnInit();
    this.JobPersonRef = sessionStorage.getItem("JobPersonRef");
    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionAutletterList,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 80,
      },
      {
        field: 'وضعیت',
        cellRenderer: ValidateionStateCellAutletterRenderer,
        cellClass: 'text-center',
        minWidth: 80

      },
      {
        field: 'LetterTitle',
        headerName: 'عنوان تیکت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 200
      },
      {
        field: 'LetterDescription',
        headerName: 'متن تیکت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 200
      },
      {
        field: 'LetterDate',
        headerName: 'تاریخ تیکت	',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'CreatorName',
        headerName: 'ایجاد کننده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150

      },

      {
        field: 'RowsCount',
        headerName: 'تعداد ارجاع',
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
        field: 'RowLetterDate',
        headerName: 'تاریخ ارجاع',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];
    this.repo.GetTodeyFromServer().subscribe((data: any) => {

      this.ToDayDate = data[0].TodeyFromServer
      this.getList();
    });


  }



  EditForm_autletter = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl(''),
    CreationDate: new FormControl(''),
    OwnCentralRef: new FormControl(''),
  });




  getList() {

    this.loading = true



    if (sessionStorage.getItem("JobPersonRef").length > 0) {
      this.searchTerm = ''
      this.CentralRef = ''
      this.EditForm_autletter.patchValue({
        SearchTarget: '',
        CentralRef: '',
        CreationDate: '',
        OwnCentralRef: sessionStorage.getItem("CentralRef")
      });
    } else {
      this.EditForm_autletter.patchValue({
        SearchTarget: '',
        CentralRef: sessionStorage.getItem("CentralRef"),
        CreationDate: this.ToDayDate,
        OwnCentralRef: sessionStorage.getItem("CentralRef")

      });
      this.searchTerm = ''
      this.CentralRef = sessionStorage.getItem("CentralRef");
    }

    this.repo.GetLetterList(this.EditForm_autletter.value).subscribe((data) => {
      this.records = data;
      this.loading = false

    });

  }



  LoadList() {


    this.loading = true
    this.EditForm_autletter.patchValue({
      SearchTarget: this.searchTerm,
      CentralRef: sessionStorage.getItem("CentralRef"),
      CreationDate: this.dateValue.value,
      OwnCentralRef: sessionStorage.getItem("CentralRef")

    });


    if (sessionStorage.getItem("JobPersonRef").length > 0) {
      if (this.selectedOption == '0') {
        this.CentralRef = ''
        this.EditForm_autletter.patchValue({
          CentralRef: this.CentralRef,
        });
      } else {


        this.CentralRef = sessionStorage.getItem("CentralRef");
        this.EditForm_autletter.patchValue({
          CentralRef: this.CentralRef,
        });
      }

    } else {

      this.CentralRef = sessionStorage.getItem("CentralRef");
      this.EditForm_autletter.patchValue({
        CentralRef: this.CentralRef,
      });

    }


    this.repo.GetLetterList(this.EditForm_autletter.value).subscribe((data) => {
      this.records = data;
      this.loading = false

    });


  }




  navigateToEdit(id) {
    this.router.navigate(['/support/letter-detail', id]);
  }
}

