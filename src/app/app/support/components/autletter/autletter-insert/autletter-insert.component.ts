import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { Router } from '@angular/router';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { Base_Lookup } from 'src/app/app/kowsar/lookup-type';
import { DbSetup_lookup } from '../../../lookup-type';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { LoadingService } from 'src/app/app-shell/framework-services/loading.service';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';

@Component({
  selector: 'app-autletter-insert',
  templateUrl: './autletter-insert.component.html',
})
export class AutletterInsertComponent extends AgGridBaseComponent
  implements OnInit {


  constructor(
    private repo: AutletterWebApiService,
    private router: Router,
    private readonly notificationService: NotificationService,
    private loadingService: LoadingService,
    private renderer: Renderer2,
    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };
  ToDayDate: string = "";


  Title_Lookup: Base_Lookup[] = [
    { id: "ارتباط با همکاران", name: "ارتباط با همکاران" },
    { id: "پشتیبانی فنی", name: "پشتیبانی فنی" },
    { id: "امور مالی و تمدید پشتیبانی", name: "امور مالی و تمدید پشتیبانی" },
    { id: "حسابداری", name: "حسابداری" },
    { id: "آموزش و سوال نرم افزاری", name: "آموزش و سوال نرم افزاری" },
    { id: "سایت Site", name: "سایت Site" },
    { id: "اپلیکیشن موبایلی mobile Application", name: "اپلیکیشن موبایلی mobile Application" },
    { id: "همسان سازی  Replication", name: "همسان سازی  Replication" },
    { id: "درخواست فاکتور", name: "درخواست فاکتور" },
  ]

  LetterState_lookup: DbSetup_lookup[] = []
  LetterPriority_lookup: DbSetup_lookup[] = []
  JobPersonRef: string = '';
  records_support_central

  CentralRef: string = '';


  loading: boolean = false;
  IsEmploy: boolean = false;

  InOut_Lookup: Base_Lookup[] = [
    { id: "0", name: "وارده" },
    { id: "1", name: "صادره" },
    { id: "2", name: "داخلی" },
  ]


  override ngOnInit(): void {
    super.ngOnInit();
    this.JobPersonRef = sessionStorage.getItem("JobPersonRef");

    this.EditForm_LetterInsert.patchValue({
      OwnerPersonInfoRef: sessionStorage.getItem("PersonInfoRef"),
      CreatorCentral: sessionStorage.getItem("CentralRef"),
    });


    if (sessionStorage.getItem("JobPersonRef").length > 0) {
      this.IsEmploy = true
      this.EditForm_LetterInsert.patchValue({
        OwnerCentral: "",
      });
    } else {
      this.IsEmploy = false

      this.EditForm_LetterInsert.patchValue({
        OwnerCentral: sessionStorage.getItem("CentralRef"),
        OwnerName: sessionStorage.getItem("CustName_Small"),
        InOutFlag: "0",
      });
    }






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


    this.repo.GetTodeyFromServer().subscribe((data: any) => {

      this.ToDayDate = data[0].TodeyFromServer

      this.EditForm_LetterInsert.patchValue({
        LetterDate: this.ToDayDate,
      });

    });

    this.repo.GetObjectTypeFromDbSetup("AutomationLetterState").subscribe((data: any) => {

      this.LetterState_lookup = data.ObjectTypes
    });

    this.repo.GetObjectTypeFromDbSetup("AutomationLetterPriority").subscribe((data: any) => {

      this.LetterPriority_lookup = data.ObjectTypes
    });


  }







  EditForm_LetterInsert = new FormGroup({
    LetterDate: new FormControl(''),
    title: new FormControl('', [Validators.required]),
    Description: new FormControl('', [Validators.required]),
    LetterState: new FormControl(''),
    LetterPriority: new FormControl(''),
    CentralRef: new FormControl(''),
    InOutFlag: new FormControl(''),
    CreatorCentral: new FormControl(''),
    OwnerCentral: new FormControl('', [Validators.required]),
    OwnerPersonInfoRef: new FormControl(''),
    OwnerName: new FormControl(''),
  });

  pipe_function() {
    this.searchSubject_central.pipe(
      debounceTime(1000)  // 1 second debounce time
    ).subscribe(searchText => {
      this.GetCentral();
    });


  }
  private searchSubject_central: Subject<string> = new Subject();
  Searchtarget_central: string = '';

  onInputChange_Customer() {
    this.searchSubject_central.next(this.Searchtarget_central);
  }

  Set_Customer() {


    this.EditForm_LetterInsert.patchValue({
      LetterDate: this.ToDayDate,
      OwnerCentral: this.selectedRows[0].CentralRef,
      OwnerName: this.selectedRows[0].CustName_Small,

    });

    this.selectedRows = []

    this.centrallist_dialog_close()


  }

  GetCentral() {
    this.centrallist_dialog_show()
    this.loading = true;

    this.repo.GetKowsarCustomer(this.Searchtarget_central).subscribe((data: any) => {
      this.records_support_central = data.Customers;
      this.loading = false;

    });
  }

  submit(action) {

    this.CentralRef = sessionStorage.getItem("CentralRef");

    this.EditForm_LetterInsert.markAllAsTouched();
    if (!this.EditForm_LetterInsert.valid) return;

    // this.EditForm.patchValue({
    //   ToDayDate: this.ToDayDate,
    //   CentralRef: this.CentralRef
    // });


    // if (this.EditForm.value.LetterPriority == "") {
    //   this.EditForm.patchValue({
    //     LetterPriority: "عادی",
    //   });

    // }


    this.loadingService.show()
    this.repo.LetterInsert(this.EditForm_LetterInsert.value).subscribe(e => {
      this.loadingService.hide()
      const intValue = parseInt(e[0].LetterCode, 10);
      if (!isNaN(intValue) && intValue > 0) {
        this.notificationService.succeded();
        if (action == '') {
          this.router.navigate(['/support/letter-list']);
        } else if (action == 'detail') {
          this.router.navigate(['/support/letter-detail', e[0].LetterCode]);

        } else {
          // TODO List
        }

      } else {
        //Todo notification erroor
      }

    });



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
