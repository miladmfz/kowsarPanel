import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { CellActionAutletterWork } from './cell-action-autletter-work';
import { ValidateionStateCellAutletterWorkRenderer } from './validation-state-label-cell-autletter-work';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import * as moment from 'jalali-moment';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';

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
    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
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
  ngOnDestroy() {

    this.themeSub.unsubscribe();

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
        field: 'RowCreationDate',
        headerName: 'تاریخ ارجاع',
        filter: 'agSetColumnFilter',
        minWidth: 200,
        cellClass: 'text-end', // Bootstrap کلاس برای راست‌چین کردن
        valueFormatter: (params) => {
          if (!params.value) return '';
          return moment(params.value).format(' HH:mm -- jYYYY/jMM/jDD ');
        }
      }
      ,

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
        field: 'CreationDate',
        headerName: 'تاریخ تیکت',
        filter: 'agSetColumnFilter',
        minWidth: 200,
        cellClass: 'text-end', // Bootstrap کلاس برای راست‌چین کردن
        valueFormatter: (params) => {
          if (!params.value) return '';
          return moment(params.value).format(' HH:mm -- jYYYY/jMM/jDD ');
        }
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





