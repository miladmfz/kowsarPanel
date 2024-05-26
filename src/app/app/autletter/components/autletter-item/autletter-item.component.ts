import { Component, Input, OnInit } from '@angular/core';
import { AutletterWebApiService } from '../../services/AutletterWebApi.service';
import { FormControl, FormGroup } from '@angular/forms';
import { IActiveDate } from 'ng-persian-datepicker';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { LocalStorageService } from 'src/app/app-shell/framework-services/local.storage.service';
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
    localStorageService: LocalStorageService
  ) {
    super(localStorageService);
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
  Searchtarget: string = '';
  items: any[] = [];
  selectedOption: string = '0';

  searchTerm: string = '';




  @Input() TextData: string = '';

  users: any[] = [];




  override ngOnInit(): void {
    super.ngOnInit();



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


    this.CentralRef = "4";


    this.repo.GetCentralUser().subscribe(e => {
      this.users = e;

    });

    const cachedData = sessionStorage.getItem('AutLetterRowCache');

    if (cachedData) {
      this.items = JSON.parse(cachedData);
    }




    this.repo.GetLetterRowList(this.TextData).subscribe((data) => {
      this.records = data;
      this.repo.SetAlarmOff(data[0].LetterRowCode).subscribe(e => { });

      sessionStorage.setItem('AutLetterRowCache', JSON.stringify(this.items));
    });



  }




  submit(action) {

    const command = this.EditForm.value;
    if (action == 'delete') {
      // this.incidentService.delete(command.id).subscribe((id) => {
      //   this.handleCreateEditOps(action, id);
      // });
    }



    this.repo.AutLetterRowInsert(this.TextData, this.EditForm.value.dateValue, this.EditForm.value.descriptionFormControl, this.CentralRef, this.EditForm.value.selectedUserId.toString()).subscribe(e => {
      const intValue = parseInt(e[0].LetterRef, 10);
      if (!isNaN(intValue) && intValue > 0) {
        this.router.navigate(['/autletter/list']);
      } else {
        console.log("insert nashod")
      }

    });



  }




}
