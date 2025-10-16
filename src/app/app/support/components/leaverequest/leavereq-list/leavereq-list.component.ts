import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { AutletterWebApiService } from '../../../services/AutletterWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { StateLabelCellLeaveReq } from './state-label-cell-leavereq';
import { LeaveRequestWebApiService } from '../../../services/LeaveRequestWebApi.service';
import { CellActionLeaveReqList } from './cell-action-leavereq-list';
import { Base_Lookup } from '../../../lookup-type';

@Component({
  selector: 'app-leavereq-list',
  templateUrl: './leavereq-list.component.html',
})
export class LeavereqListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private router: Router,
    private repo: LeaveRequestWebApiService,
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
  records_leavedetails;

  title = 'لیست مرخصی ها';
  mdoal_title = 'لیست مرخصی ها';

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

  loading_leavedetail: boolean = true;
  loading: boolean = true;
  isManager: boolean = true;

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };


  WorkFlowStatus_Lookup: Base_Lookup[] = [
    { id: "1", name: "تایید" },
    { id: "2", name: "رد" },
    { id: "3", name: "بررسی مجدد" },
  ]

  EditForm_LeaveRequest_Search = new FormGroup({
    StartDate: new FormControl(''),
    EndDate: new FormControl(''),
    UserRef: new FormControl('0'),
    ManagerRef: new FormControl('0'),
    WorkFlowStatus: new FormControl('0'),

  });

  EditForm_LeaveRequest_detail = new FormGroup({
    StartDate: new FormControl(''),
    EndDate: new FormControl(''),
    UserRef: new FormControl('0'),
    ManagerRef: new FormControl('0'),
    WorkFlowStatus: new FormControl('0'),

  });

  EditForm_LeaveRequest_WorkFlow = new FormGroup({
    LeaveRequestCode: new FormControl(''),
    ManagerRef: new FormControl(''),
    WorkFlowStatus: new FormControl('', Validators.required),
    WorkFlowExplain: new FormControl('', Validators.required),

  });



  EditForm_LeaveRequest = new FormGroup({
    LeaveRequestCode: new FormControl(''),
    UserRef: new FormControl(''),
    LeaveRequestType: new FormControl('', Validators.required),
    LeaveRequestDate: new FormControl('', Validators.required),
    TotalDay: new FormControl('0'),
    WorkDay: new FormControl('0'),
    OffDay: new FormControl('0'),
    LeaveRequestExplain: new FormControl('', Validators.required),
    LeaveStartDate: new FormControl('', Validators.required),
    LeaveEndDate: new FormControl('', Validators.required),
    LeaveStartTime: new FormControl('', Validators.required),
    LeaveEndTime: new FormControl(''),
    ManagerRef: new FormControl(''),
    WorkFlowStatus: new FormControl(''),
    WorkFlowExplain: new FormControl(''),
  });




  column_declare() {
    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionLeaveReqList,
        cellRendererParams: {
          editUrl: '/support/leavereq-edit',
        },
        width: 200,
      }, {
        field: 'CentralName',
        headerName: 'نام',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'LeaveRequestType',
        headerName: 'نوع مرخصی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'LeaveRequestExplain',
        headerName: 'توضیحات',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'LeaveStartDate',
        headerName: 'شروع مرخصی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 80
      }, {
        field: 'TotalDay',
        headerName: 'کل روز',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      }, {
        field: 'WorkDay',
        headerName: 'رور کاری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      }, {
        field: 'وضعیت',
        cellRenderer: StateLabelCellLeaveReq,
        cellClass: 'text-center',
        minWidth: 80
      },
      {
        field: 'WorkFlowExplain',
        headerName: 'توضیحات ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },


    ];


    this.columnDefs2 = [
      {
        field: 'CentralName',
        headerName: 'نام',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'LeaveRequestType',
        headerName: 'نوع مرخصی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'LeaveRequestExplain',
        headerName: 'توضیحات',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'LeaveStartDate',
        headerName: 'شروع مرخصی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 80
      }, {
        field: 'TotalDay',
        headerName: 'روز',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      }, {
        field: 'WorkDay',
        headerName: 'رور کاری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      }, {
        field: 'وضعیت',
        cellRenderer: StateLabelCellLeaveReq,
        cellClass: 'text-center',
        minWidth: 80
      },
      {
        field: 'WorkFlowExplain',
        headerName: 'توضیحات ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
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


    if (sessionStorage.getItem("CentralRef") == '1274' ||
      sessionStorage.getItem("CentralRef") == '1139' ||
      sessionStorage.getItem("CentralRef") == '1843') {

      this.isManager = true

    } else {
      this.isManager = false
    }


    this.column_declare()

    this.repo.GetTodeyFromServer().subscribe((data: any) => {
      this.ToDayDate = data[0].TodeyFromServer
      this.getinitialList();
    });


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

  Getleavedetail(data) {
    this.loading_leavedetail = true

    this.EditForm_LeaveRequest_detail.patchValue({
      StartDate: "",
      EndDate: "",
      UserRef: data.UserRef,
      ManagerRef: "0",
      WorkFlowStatus: "0",
    });

    ////// get leave list by user
    this.repo.GetLeaveRequest(this.EditForm_LeaveRequest_detail.value).subscribe((data: any) => {
      this.records_leavedetails = data.LeaveRequests;
      this.loading_leavedetail = false

    });

  }

  WorkFlow(data) {

    this.records_leavedetails = []
    this.mdoal_title = data.CentralName

    //modal workflow
    this.EditForm_LeaveRequest.patchValue({
      LeaveRequestCode: data.LeaveRequestCode,
      UserRef: data.UserRef,
      LeaveRequestDate: data.LeaveRequestDate,
      TotalDay: data.TotalDay,
      WorkDay: data.WorkDay,
      OffDay: data.OffDay,
      LeaveRequestType: data.LeaveRequestType,
      LeaveRequestExplain: data.LeaveRequestExplain,
      LeaveStartDate: data.LeaveStartDate,
      LeaveEndDate: data.LeaveEndDate,
      LeaveStartTime: data.LeaveStartTime,
      LeaveEndTime: data.LeaveEndTime,
      ManagerRef: data.ManagerRef,
      WorkFlowStatus: data.WorkFlowStatus,
      WorkFlowExplain: data.WorkFlowExplain,
    });
    this.Getleavedetail(data)
    this.leavedetail_dialog_show()

  }

  NavigateToEdit(data) {

    if (data.WorkFlowStatus == "0" || data.WorkFlowStatus == "3") {
      this.router.navigate(['/support/leavereq-edit', data.LeaveRequestCode])

    } else {
      this.notificationService.warning("نمیتوان تغییری ایجاد کرد")

    }


  }


  btnDeleteClicked(data) {

    if (data.WorkFlowStatus == "0") {


      this.fireDeleteFactor().then((result) => {
        if (result.isConfirmed) {
          this.repo.DeleteLeaveRequest(data.LeaveRequestCode).subscribe((data: any) => {
            this.notificationService.succeded();
            this.getinitialList()
          });

        } else {
          this.notificationService.warning('اطلاعات تغییری نکرد');

        }
      });




    } else {
      this.notificationService.warning("دارای نظر می باشد نمی توان حذف کرد")
    }

  }



  getinitialList() {


    if (sessionStorage.getItem("PhAddress3").length > 0) {

      this.EditForm_LeaveRequest_Search.patchValue({
        StartDate: "",
        EndDate: "",
        UserRef: "0",
        ManagerRef: "0",
        WorkFlowStatus: "0",
      });

    } else {

      this.EditForm_LeaveRequest_Search.patchValue({
        StartDate: "",
        EndDate: "",
        UserRef: sessionStorage.getItem("CentralRef"),
        ManagerRef: "0",
        WorkFlowStatus: "0",
      });
    }




    this.loading = true
    this.repo.GetLeaveRequest(this.EditForm_LeaveRequest_Search.value).subscribe((data: any) => {
      this.records = data.LeaveRequests;
      this.loading = false

    });

  }

  LoadList() { }



  submitWorkflow() {

    this.EditForm_LeaveRequest_WorkFlow.patchValue({
      LeaveRequestCode: this.EditForm_LeaveRequest.value.LeaveRequestCode,
      ManagerRef: sessionStorage.getItem("CentralRef"),
      WorkFlowStatus: this.EditForm_LeaveRequest.value.WorkFlowStatus,
      WorkFlowExplain: this.EditForm_LeaveRequest.value.WorkFlowExplain,
    });


    this.repo.LeaveRequest_WorkFlow(this.EditForm_LeaveRequest_WorkFlow.value).subscribe((data: any) => {
      this.leavedetail_dialog_close()
      this.getinitialList();
      this.loading = false

    });


  }




  leavedetail_dialog_show() {
    const modal = this.renderer.selectRootElement('#leavedetail', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  leavedetail_dialog_close() {
    const modal = this.renderer.selectRootElement('#leavedetail', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



}

