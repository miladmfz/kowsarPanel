import { Component, OnInit, Renderer2 } from '@angular/core';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { FormControl, FormGroup } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { CellActionAutletterList } from './cell-action-autletter-list';
import { ValidateionStateCellAutletterRenderer } from './validation-state-label-cell-autletter';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';

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
    private readonly notificationService: NotificationService,
    private renderer: Renderer2,


    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }


  records;
  title = 'لیست تیکت های ارسالی ';
  dateValue = new FormControl();
  StartTime = new FormControl();

  EndTime = new FormControl();

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



  EditForm_autletter = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl(''),
    CreationDate: new FormControl(''),
    OwnCentralRef: new FormControl(''),
    PersonInfoCode: new FormControl(''),
    StartTime: new FormControl(''),
    EndTime: new FormControl(''),

  });






  EditForm_autletter_detail = new FormGroup({
    AutLetterRow_PropDescription1: new FormControl(''),
    CreatorCentralRef: new FormControl(''),
    CreatorName: new FormControl(''),
    ExecutorName: new FormControl(''),
    LetterCode: new FormControl(''),
    LetterDate: new FormControl(''),
    LetterDescription: new FormControl(''),
    LetterPriority: new FormControl(''),
    LetterReceiveType: new FormControl(''),
    LetterState: new FormControl(''),
    LetterTitle: new FormControl(''),
    OwnerCentralRef: new FormControl(''),
    OwnerName: new FormControl(''),
    RowExecutorCentralRef: new FormControl(''),
    RowExecutorName: new FormControl(''),
    RowLetterDate: new FormControl(''),
    RowLetterState: new FormControl(''),
    RowsCount: new FormControl(''),
  });



  onInputChange() {
    if (this.searchTerm == "") {
      this.searchTerm = ""
    }
    this.LoadList()
  }


  column_declare() {
    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionAutletterList,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 200,
      },
      {
        field: 'وضعیت',
        cellRenderer: ValidateionStateCellAutletterRenderer,
        cellClass: 'text-center',
        minWidth: 80

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
        field: 'OwnerName',
        headerName: 'مشتری ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 200
      },
      {
        field: 'LetterDescription',
        headerName: 'متن تیکت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        headerClass: 'text-center',
        minWidth: 200
      },




      // {
      //   field: 'LetterTitle',
      //   headerName: 'عنوان تیکت',
      //   filter: 'agSetColumnFilter',
      //   cellClass: 'text-center',
      //   minWidth: 200
      // },
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



    ];
  }

  ngOnDestroy() {

    this.themeSub.unsubscribe();

  }


  override ngOnInit(): void {
    super.ngOnInit();
    this.JobPersonRef = sessionStorage.getItem("JobPersonRef");
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.column_declare()
    this.repo.GetTodeyFromServer().subscribe((data: any) => {

      this.ToDayDate = data[0].TodeyFromServer
      this.getList();
    });


  }


  delete(LetterCode, RowsCount) {

    if (RowsCount > 0) {
      this.notificationService.error1("تیکت دارای ارجاع می باشد");

    } else {

      this.fireDeleteFactor().then((result) => {
        if (result.isConfirmed) {
          this.repo.DeleteAutLetter(LetterCode).subscribe((data: any) => {
            this.notificationService.succeded();
            this.getList()
          });
        } else {
          this.notificationService.warning('اطلاعات تغییری نکرد');

        }
      });


    }

  }



  async fireDeleteFactor() {
    const Swal = (await import('sweetalert2')).default;


    return Swal.fire({
      title: 'آیا از حذف این ردیف اطمینان دارید؟',
      text: 'درصورت حذف دیگر قادر به بازیابی ردیف فوق نخواهید بود.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله، اطمینان دارم.',

      cancelButtonText: 'بستن پنجره',
      customClass: {
        confirmButton: 'btn btn-success mx-2',

        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
  }



  ShowInfo(singel) {


    this.EditForm_autletter_detail.patchValue({
      AutLetterRow_PropDescription1: singel.AutLetterRow_PropDescription1,
      CreatorCentralRef: singel.CreatorCentralRef,
      CreatorName: singel.CreatorName,
      ExecutorName: singel.ExecutorName,
      LetterCode: singel.LetterCode,
      LetterDate: singel.LetterDate,
      LetterDescription: singel.LetterDescription,
      LetterPriority: singel.LetterPriority,
      LetterReceiveType: singel.LetterReceiveType,
      LetterState: singel.LetterState,
      LetterTitle: singel.LetterTitle,
      OwnerCentralRef: singel.OwnerCentralRef,
      OwnerName: singel.OwnerName,
      RowExecutorCentralRef: singel.RowExecutorCentralRef,
      RowExecutorName: singel.RowExecutorName,
      RowLetterDate: singel.RowLetterDate,
      RowLetterState: singel.RowLetterState,
      RowsCount: singel.RowsCount,
    });


    this.detail_dialog_show()
  }



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
      OwnCentralRef: sessionStorage.getItem("CentralRef"),
      StartTime: this.StartTime.value,
      EndTime: this.EndTime.value,

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


  detail_dialog_show() {
    const modal = this.renderer.selectRootElement('#autletterdetail', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  detail_dialog_close() {
    const modal = this.renderer.selectRootElement('#autletterdetail', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



}

