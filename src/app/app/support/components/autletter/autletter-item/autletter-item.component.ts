import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { DbSetup_lookup } from '../../../lookup-type';
import { CellActionAutletterRowList } from './cell-action-autletterrow-list';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';

@Component({
  selector: 'app-autletter-item',
  templateUrl: './autletter-item.component.html',
})
export class AutletterItemComponent
  extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private router: Router,
    private repo: AutletterWebApiService,
    private readonly notificationService: NotificationService,
    private renderer: Renderer2
  ) {
    super();
  }



  records: any[] = [];
  title = 'لیست تیکت های ارسالی ';
  CentralRef: string = '';
  JobPersonRef: string = '';
  Searchtarget: string = '';
  items: any[] = [];
  selectedOption: string = '0';

  searchTerm: string = '';


  @Input() TextData: string = '';

  users: any[] = [];


  ToDayDate: string = "";
  LetterState_lookup: DbSetup_lookup[] = []
  LetterPriority_lookup: DbSetup_lookup[] = []


  EditForm = new FormGroup({
    dateValue: new FormControl(''),
    descriptionFormControl: new FormControl('', Validators.required),
    LetterState: new FormControl(''),
    LetterPriority: new FormControl('', Validators.required),
    selectedUserId: new FormControl('', Validators.required),
  });


  set_Alarm = new FormGroup({
    LetterRef: new FormControl(''),
    CentralRef: new FormControl('0'),
  });


  EditForm_explain = new FormGroup({
    ObjectRef: new FormControl('0'),
    LetterRowDescription: new FormControl(''),
    LetterRowState: new FormControl(''),
    AutLetterRow_PropDescription1: new FormControl(''),
  });

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };



  override ngOnInit(): void {
    super.ngOnInit();


    this.JobPersonRef = sessionStorage.getItem("JobPersonRef");
    this.CentralRef = sessionStorage.getItem("CentralRef");



    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionAutletterRowList,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 150,
      },
      {
        field: 'RowExecutorName',
        headerName: 'کاربر',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'RowLetterDate',
        headerName: 'تاریخ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'LetterRowState',
        headerName: 'وضعیت ارجاع',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50
      },


      {
        field: 'AutLetterRow_PropDescription1',
        headerName: 'خلاصه عملکرد	',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 250
      },

      {
        field: 'LetterRowDescription',
        headerName: 'شرح ارجاع',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 250
      },

    ];




    this.set_Alarm.patchValue({
      LetterRef: this.TextData,
      CentralRef: this.CentralRef,
    });



    this.Get_init_Data()
    this.Get_LetterRowList()

  }

  Get_init_Data() {
    this.repo.GetTodeyFromServer().subscribe((data: any) => {
      this.ToDayDate = data[0].TodeyFromServer
    });

    this.repo.GetObjectTypeFromDbSetup("AutomationLetterState").subscribe((data: any) => {
      this.LetterState_lookup = data.ObjectTypes
    });

    this.repo.GetObjectTypeFromDbSetup("AutomationLetterPriority").subscribe((data: any) => {
      this.LetterPriority_lookup = data.ObjectTypes
    });

    this.repo.GetCentralUser().subscribe(e => {
      this.users = e;
    });

  }




  delete(LetterRowCode, AutLetterRow_PropDescription1) {


    if (AutLetterRow_PropDescription1.length > 0) {
      this.notificationService.error1("برای این ارجاع عملکرد ثبت شده است");

    } else {

      this.fireDeleteFactor().then((result) => {
        if (result.isConfirmed) {
          this.Loading_Modal_Response_show()
          this.repo.DeleteAutLetterRows(LetterRowCode).subscribe((data: any) => {
            this.Loading_Modal_Response_close()
            this.notificationService.succeded();
            this.Get_LetterRowList()

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



  Get_LetterRowList() {
    this.Loading_Modal_Response_show()
    this.repo.GetLetterRowList(this.TextData).subscribe((data) => {
      this.Loading_Modal_Response_close()
      this.records = data;
    });

  }




  submit(action) {

    this.EditForm.markAllAsTouched();
    if (!this.EditForm.valid) return;

    if (action == 'delete') {

    }

    this.Loading_Modal_Response_show()
    this.repo.AutLetterRowInsert(
      this.TextData,
      this.ToDayDate,
      this.EditForm.value.descriptionFormControl,
      this.EditForm.value.LetterState,
      this.EditForm.value.LetterPriority,
      this.CentralRef,
      this.EditForm.value.selectedUserId.toString()
    ).subscribe(e => {

      this.Loading_Modal_Response_close()
      const intValue = parseInt(e[0].LetterRef, 10);
      if (!isNaN(intValue) && intValue > 0) {
        this.notificationService.succeded();
        this.router.navigate(['/support/letter-list']);
      } else {
        //Todo notification erroor
      }

    });



  }




  Get_Autletterrow_Property(LetterRowCode, LetterRowState, LetterRowDescription, AutLetterRow_PropDescription1) {

    this.EditForm_explain.patchValue({
      ObjectRef: LetterRowCode,
      LetterRowDescription: LetterRowDescription,
      LetterRowState: LetterRowState,
      AutLetterRow_PropDescription1: AutLetterRow_PropDescription1
    });

    this.explain_dialog_show()
  }




  Set_Autletterrow_Property() {
    this.Loading_Modal_Response_show()
    this.repo.Update_AutletterRow(this.EditForm_explain.value).subscribe((data: any) => {
      this.Loading_Modal_Response_close()
      this.notificationService.succeded();
      this.Get_LetterRowList()
      this.explain_dialog_close()
    });
  }


  explain_dialog_show() {
    const modal = this.renderer.selectRootElement('#autletterrowmodal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  explain_dialog_close() {
    const modal = this.renderer.selectRootElement('#autletterrowmodal', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  Loading_Modal_Response_show() {
    const modal = this.renderer.selectRootElement('#loadingresponse', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  Loading_Modal_Response_close() {
    const modal = this.renderer.selectRootElement('#loadingresponse', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }
}
