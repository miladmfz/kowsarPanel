import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'jalali-moment';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { SupportFactorWebApiService } from 'src/app/app/support/services/SupportFactorWebApi.service';
import { CellActionAttendancePanel } from './cell-action-attendance-panel';
import { CellDateAttendancePanel } from './cell-date-label-attendance-panel';
import { CellStatusAttendancePanel } from './cell-status-label-attendance-panel';
import { CellNameAttendancePanel } from './cell-name-label-attendance-panel';
import { catchError, debounceTime, of, Subject, Subscription } from 'rxjs';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { AgGridAngular } from 'ag-grid-angular';
import { CellActionLetterCentral } from './cell-action-letter-central';
import { Base_Lookup } from 'src/app/app/kowsar/lookup-type';

@Component({
  selector: 'app-attendance-panel',
  templateUrl: './attendance-panel.component.html',
})
export class AttendancePanelComponent
  extends AgGridBaseComponent
  implements OnInit {




  private searchSubject_central: Subject<string> = new Subject();


  loading_attendance: boolean = true;
  show_newletter: boolean = false;
  loading: boolean = false;

  records
  records_history
  records_letterfromperson
  records_central
  records_support_central

  // EditForm_LetterToEmployer = new FormGroup({
  //   DescriptionText: new FormControl('', Validators.required, Validators.minLength(10)),
  //   LetterDate: new FormControl(''),
  //   ExecuterCentral: new FormControl(''),
  //   CreatorCentral: new FormControl(''),
  //   OwnerCentral: new FormControl('', Validators.required),
  //   OwnerName: new FormControl(''),
  //   LetterCode: new FormControl(''),
  //   LetterDescriptionText: new FormControl(''),
  //   SendSms: new FormControl('0'),

  // });

  EditForm_LetterToEmployer = new FormGroup({
    DescriptionText: new FormControl(
      '',
      [Validators.required, Validators.minLength(10)] // ✅ ولیدیتورها در آرایه
    ),
    LetterDate: new FormControl(''),
    ExecuterCentral: new FormControl(''),
    CreatorCentral: new FormControl(''),
    OwnerCentral: new FormControl('', [Validators.required]),
    OwnerName: new FormControl(''),
    LetterCode: new FormControl(''),
    LetterDescriptionText: new FormControl(''),
    SendSms: new FormControl('0'),
  });


  SendSms_Lookup: Base_Lookup[] = [
    { id: "0", name: "بدون ارسال" },
    { id: "1", name: "sms ارسال شود" },

  ]


  EditForm_LetterInsert = new FormGroup({
    LetterDate: new FormControl(''),
    title: new FormControl(''),
    Description: new FormControl(''),
    LetterState: new FormControl(''),
    LetterPriority: new FormControl(''),
    CentralRef: new FormControl(''),
    InOutFlag: new FormControl(''),
    CreatorCentral: new FormControl(''),
    OwnerCentral: new FormControl(''),
    OwnerPersonInfoRef: new FormControl(''),
  });


  EditForm_AutLetterRowInsert = new FormGroup({

    LetterRef: new FormControl(''),
    LetterDate: new FormControl(''),
    Description: new FormControl(''),
    LetterState: new FormControl(''),
    LetterPriority: new FormControl(''),
    CreatorCentral: new FormControl(''),
    ExecuterCentral: new FormControl(''),

  });


  sanitizeDescriptionText(event: any) {
    const invalidChars = /[!@#$%^&*()|"'<>]/g;
    let value = event.target.value.replace(invalidChars, '');
    this.EditForm_LetterToEmployer.get('DescriptionText')?.setValue(value, { emitEvent: false });
  }


  EditForm_Sms_LetterToEmployer = new FormGroup({
    CONTACTS: new FormControl(''),
    NumberPhone: new FormControl(''),
  });

  EditForm_GetHistory = new FormGroup({
    CentralRef: new FormControl(''),
  });

  Searchtarget_central: string = '';


  BrokerRef: string = '';
  LetterCode: string = '';
  ExecuterCentral: string = '';
  letterexplain_modal_title: string = '';
  ToDayDate: any;
  reportData: any[] = [];
  attendanceInterval: any;


  constructor(
    private repo: SupportFactorWebApiService,
    private sharedService: SharedService,
    private readonly notificationService: NotificationService,
    private renderer: Renderer2,
    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  pipe_function() {
    this.searchSubject_central.pipe(
      debounceTime(1000)  // 1 second debounce time
    ).subscribe(searchText => {
      this.GetCentral();
    });


  }

  onInputChange_Customer() {
    this.searchSubject_central.next(this.Searchtarget_central);
  }

  GetCentral() {
    this.centrallist_dialog_show()
    this.loading = true;

    this.repo.GetKowsarCustomer(this.Searchtarget_central).subscribe((data: any) => {
      this.records_support_central = data.Customers;
      this.loading = false;

    });
  }


  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }
  ngOnDestroy() {
    // پاک کردن interval برای جلوگیری از memory leak
    if (this.attendanceInterval) {
      clearInterval(this.attendanceInterval);
    }
    this.themeSub.unsubscribe();

  }

  EditForm_autletter = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl(''),
    CreationDate: new FormControl(''),
    OwnCentralRef: new FormControl(''),
    PersonInfoCode: new FormControl(''),
    Flag: new FormControl(''),

  });



  Set_Customer() {


    this.EditForm_LetterToEmployer.patchValue({
      LetterDate: this.ToDayDate,
      OwnerCentral: this.selectedRows[0].CentralRef,
      OwnerName: this.selectedRows[0].CustName_Small,

    });

    this.selectedRows = []

    this.centrallist_dialog_close()


  }


  toggel_show_newletter() {

    if (this.show_newletter) {

      this.reset_editform()
    }
    this.show_newletter = !this.show_newletter

  }


  SetLetterforperson(item: any) {
    this.LetterCode = item.LetterCode

    this.EditForm_LetterToEmployer.patchValue({
      DescriptionText: "",
      LetterDate: this.ToDayDate,
      OwnerCentral: item.OwnerCentralRef,
      OwnerName: item.OwnerName,
      LetterCode: item.LetterCode,
      LetterDescriptionText: item.LetterDescription,
      SendSms: "0",

    });
    this.show_newletter = true

  }

  reset_editform() {
    this.EditForm_LetterToEmployer.reset()

    this.EditForm_LetterToEmployer.patchValue({
      LetterDate: this.ToDayDate,
      CreatorCentral: sessionStorage.getItem("CentralRef")
    });

    this.EditForm_autletter.patchValue({
      SearchTarget: "",
      PersonInfoCode: this.ExecuterCentral,
      Flag: "1",
    });
    this.EditForm_LetterToEmployer.patchValue({
      DescriptionText: "",
      ExecuterCentral: this.ExecuterCentral
    });
    this.EditForm_LetterInsert.reset()
    this.EditForm_AutLetterRowInsert.reset()

    this.LetterCode = ""
  }



  SetLetter_config(item: any) {

    this.ExecuterCentral = item.CentralRef

    this.EditForm_autletter.patchValue({
      SearchTarget: "",
      PersonInfoCode: this.ExecuterCentral,
      Flag: "1",
    });

    this.repo.GetAutLetterListByPerson(this.EditForm_autletter.value).subscribe((data) => {
      this.records_letterfromperson = data;


      this.letterexplain_modal_title = " تیکت ارتباط با " + item.FullName
      this.letterexplain_dialog_show()

      this.EditForm_LetterToEmployer.patchValue({
        DescriptionText: "",
        ExecuterCentral: this.ExecuterCentral
      });



      this.EditForm_Sms_LetterToEmployer.patchValue({
        CONTACTS: item.FullName,
        NumberPhone: item.PhMobile1

      });



    });




  }





  override ngOnInit(): void {
    super.ngOnInit();
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });



    if (sessionStorage.getItem("PhAddress3") == '100') {


      this.columnDefs = [
        {
          field: 'عملیات',
          pinned: 'left',
          cellRenderer: CellActionAttendancePanel,
          width: 200,
        },

        {
          field: 'کارشناس',
          filter: 'agSetColumnFilter',
          cellRenderer: CellNameAttendancePanel,
          cellClass: 'text-center',
          minWidth: 70
        },
        {
          field: 'وضعیت حضور',
          cellRenderer: CellStatusAttendancePanel,
          filter: 'agSetColumnFilter',
          cellClass: 'text-center',
          minWidth: 100
        },


        {
          field: 'تاریخ',
          cellRenderer: CellDateAttendancePanel,
          filter: 'agSetColumnFilter',
          cellClass: 'text-center',
          minWidth: 100
        },
        {
          field: 'CustNames',
          headerName: 'مشتری',
          filter: 'agSetColumnFilter',
          cellClass: 'text-center',
          minWidth: 100
        },



      ];

    } else {
      this.columnDefs = [
        {
          field: 'عملیات',
          pinned: 'left',
          cellRenderer: CellActionAttendancePanel,
          width: 200,
        },

        {
          field: 'کارشناس',
          filter: 'agSetColumnFilter',
          cellRenderer: CellNameAttendancePanel,
          cellClass: 'text-center',
          minWidth: 70
        },
        {
          field: 'وضعیت حضور',
          cellRenderer: CellStatusAttendancePanel,
          filter: 'agSetColumnFilter',
          cellClass: 'text-center',
          minWidth: 100
        },


        {
          field: 'CustNames',
          headerName: 'مشتری',
          filter: 'agSetColumnFilter',
          cellClass: 'text-center',
          minWidth: 100
        },



      ];


    }










    this.columnDefs3 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionLetterCentral,
        width: 80,
      },


      {
        field: 'LetterDate',
        headerName: 'تاریخ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'LetterDescription',
        headerName: 'شرح',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'OwnerName',
        headerName: 'مشتری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'RowLetterState',
        headerName: 'وضعیت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },

      {
        field: 'AutLetterRow_PropDescription1',
        headerName: 'شرح کار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },


    ];

    this.columnDefs2 = [

      {
        field: 'گارشناس',
        filter: 'agSetColumnFilter',
        cellRenderer: CellNameAttendancePanel,
        cellClass: 'text-center',
        minWidth: 70
      },
      {
        field: 'وضعیت حضور',
        cellRenderer: CellStatusAttendancePanel,
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },

      {
        field: 'تاریخ',
        cellRenderer: CellDateAttendancePanel,
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },


    ];

    this.columnDefs4 = [

      {
        field: 'CustName_Small',
        headerName: 'نام مشتری  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
        checkboxSelection: true,
      },
      {
        field: 'Manager',
        headerName: 'مدیریت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'پشتیبانی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.pipe_function()


    this.repo.GetTodeyFromServer().pipe(
      catchError(error => {
        this.notificationService.error('مشکل در برقراری ارتباط', "خطا");
        return of(null); // یا هر مقدار جایگزین
      })
    ).subscribe((data: any) => {

      this.ToDayDate = data[0].TodeyFromServer
      this.EditForm_LetterToEmployer.patchValue({
        LetterDate: this.ToDayDate,
        CreatorCentral: sessionStorage.getItem("CentralRef")
      });
      if (this.ToDayDate != sessionStorage.getItem("ActiveDate")) {
        sessionStorage.removeItem("ActiveDate")
        location.reload();
      }

    });


    if (sessionStorage.getItem("PhAddress3") == '100') {
      this.BrokerRef = ''

    } else {
      this.BrokerRef = sessionStorage.getItem("BrokerCode")
    }

    this.getAttendance_data()
    this.attendanceInterval = setInterval(() => {
      this.getAttendance_data();
    }, 15000);
    this.sharedService.RefreshAllActions$.subscribe(action => {
      if (action === 'refresh') {
        this.refreshpage();
      }
    });


  }

  refreshpage() {
    this.getAttendance_data();
  }


  formatToJalali(date: string | null | undefined): string {
    if (!date || date === '0001-01-01T00:00:00') {
      return '—'; // یا هر متنی که دوست داری نشون بده برای حالت‌های خالی
    }

    const m = moment(date);
    if (!m.isValid()) {
      return 'نامعتبر';
    }

    return m.locale('fa').format('jYYYY/jMM/jDD HH:mm');
  }



  getAttendance_data() {

    this.repo.AttendanceDashboard().pipe(
      catchError(error => {
        console.log("sssssssssssssssss", error)
        this.notificationService.error('مشکل در برقراری ارتباط', "خطا");
        return of(null); // یا هر مقدار جایگزین
      })
    ).subscribe((data: any) => {
      this.loading_attendance = false

      this.records = data.Attendances;
      // } else {
      //   this.reportData = data.Panels.filter(panel => panel.BrokerCode === this.BrokerRef);
      // }
    });

    if (this.BrokerRef == '') {

    }


  }

  SendLetterRow() {




    this.EditForm_AutLetterRowInsert.patchValue({

      LetterRef: this.LetterCode,
      LetterDate: this.ToDayDate,
      Description: this.EditForm_LetterToEmployer.value.DescriptionText,
      LetterState: "",
      LetterPriority: "عادی",
      CreatorCentral: sessionStorage.getItem("CentralRef"),
      ExecuterCentral: this.EditForm_LetterToEmployer.value.ExecuterCentral,


    });


    this.repo.AutLetterRowInsert(this.EditForm_AutLetterRowInsert.value).subscribe(e => {
      const intValue = parseInt(e[0].LetterRef, 10);


      if (this.EditForm_LetterToEmployer.value.SendSms == "1") {
        this.repo.SendSmsAutLetter(this.EditForm_Sms_LetterToEmployer.value).subscribe((data: any) => {
          this.loading_attendance = false
          this.notificationService.succeded();

          this.letterexplain_dialog_close()

        });
      }


      if (!isNaN(intValue) && intValue > 0) {
        this.notificationService.succeded();

        this.letterexplain_dialog_close()



      } else {
        //Todo notification erroor
      }
    });


  }

  SendLetterHeader() {

    this.EditForm_LetterInsert.patchValue({

      LetterDate: this.ToDayDate,
      title: "ارتباط با همکاران",
      Description: this.EditForm_LetterToEmployer.value.DescriptionText,
      LetterState: "",
      LetterPriority: "عادی",
      CentralRef: sessionStorage.getItem("CentralRef"),
      InOutFlag: "2",
      CreatorCentral: this.EditForm_LetterToEmployer.value.CreatorCentral,
      OwnerCentral: this.EditForm_LetterToEmployer.value.OwnerCentral,
      OwnerPersonInfoRef: sessionStorage.getItem("PersonInfoRef"),
    });

    this.repo.LetterInsert(this.EditForm_LetterInsert.value).subscribe(e => {

      const intValue = parseInt(e[0].LetterCode, 10);
      if (!isNaN(intValue) && intValue > 0) {

        this.LetterCode = e[0].LetterCode

        this.SendLetterRow()

      } else {
        //Todo notification erroor
      }
    });


  }



  SendLetterToEmployer() {

    this.EditForm_LetterToEmployer.markAllAsTouched();
    if (!this.EditForm_LetterToEmployer.valid) return;

    if (this.LetterCode.length > 0) {
      this.SendLetterRow()
    } else {
      this.SendLetterHeader()
    }

  }




  ShowHistory(item: any) {

    this.EditForm_GetHistory.patchValue({
      CentralRef: item.CentralRef
    });


    this.repo.AttendanceHistory(item.CentralRef).subscribe((data: any) => {
      this.attendancehistory_dialog_show()
      this.records_history = data.Attendances;

    });



  }



  letterexplain_dialog_show() {

    const modal = this.renderer.selectRootElement('#letterexplain', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  letterexplain_dialog_close() {
    const modal = this.renderer.selectRootElement('#letterexplain', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');

    this.show_newletter = false
    this.reset_editform()
  }


  attendancehistory_dialog_show() {

    const modal = this.renderer.selectRootElement('#attendancehistory', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  attendancehistory_dialog_close() {
    const modal = this.renderer.selectRootElement('#attendancehistory', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  centrallist_dialog_show() {

    const modal = this.renderer.selectRootElement('#centrallist', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  centrallist_dialog_close() {
    const modal = this.renderer.selectRootElement('#centrallist', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }




}
