import { Component, Input, OnInit } from '@angular/core';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { FormControl, FormGroup } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
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
  ) {
    super();
  }


  EditForm = new FormGroup({
    dateValue: new FormControl(''),
    descriptionFormControl: new FormControl(''),
    selectedUserId: new FormControl(0),
  });
  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };




  records;
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


  override ngOnInit(): void {
    super.ngOnInit();

    this.repo.GetTodeyFromServer().subscribe((data: any) => {

      this.ToDayDate = data[0].TodeyFromServer

    });
    this.JobPersonRef = sessionStorage.getItem("JobPersonRef");



    this.columnDefs = [

      {
        field: 'RowExecutorName',
        headerName: 'کاربر',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'RowLetterDate',
        headerName: 'تاریخ',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'LetterRowDescription',
        headerName: 'شرح	',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },


    ];


    this.CentralRef = sessionStorage.getItem("CentralRef");
    this.repo.GetCentralUser().subscribe(e => {
      this.users = e;

    });



    this.repo.GetLetterRowList(this.TextData).subscribe((data) => {
      this.records = data;
      this.repo.SetAlarmOff(data[0].LetterRowCode).subscribe(e => { });

    });



  }




  submit(action) {

    const command = this.EditForm.value;
    if (action == 'delete') {

    }



    this.repo.AutLetterRowInsert(this.TextData, this.ToDayDate, this.EditForm.value.descriptionFormControl, this.CentralRef, this.EditForm.value.selectedUserId.toString()).subscribe(e => {
      const intValue = parseInt(e[0].LetterRef, 10);
      if (!isNaN(intValue) && intValue > 0) {
        this.router.navigate(['/support/letter-list']);
      } else {
        console.log("insert nashod")
      }

    });



  }




}
