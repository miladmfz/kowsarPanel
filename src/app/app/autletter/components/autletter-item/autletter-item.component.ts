import { Component, Input, OnInit } from '@angular/core';
import { AutletterWebApiService } from '../../services/AutletterWebApi.service';
import { FormControl } from '@angular/forms';
import { IActiveDate } from 'ng-persian-datepicker';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { Router } from '@angular/router';
@Component({
  selector: 'app-autletter-item',
  templateUrl: './autletter-item.component.html',
})
export class AutletterItemComponent implements OnInit {

  constructor(private repo: AutletterWebApiService, private router: Router) { }
  @Input() TextData: string = '';

  items: any[] = [];
  users: any[] = [];
  selectedOption: string = '0';
  dateValue = new FormControl();

  searchTerm: string = '';
  CentralRef: string = '';
  descriptionFormControl = new FormControl();

  selectedUserId: number = 0;


  ngOnInit() {


    this.CentralRef = "4";


    this.repo.GetCentralUser().subscribe(e => {
      this.users = e;

    });

    const cachedData = sessionStorage.getItem('AutLetterRowCache');

    if (cachedData) {
      this.items = JSON.parse(cachedData);
    }


    this.repo.GetLetterRowList(this.TextData).subscribe(e => {
      this.items = e;
      this.repo.SetAlarmOff(e[0].LetterRowCode).subscribe(e => { });

      sessionStorage.setItem('AutLetterRowCache', JSON.stringify(this.items));
    });



  }


  submitForm(): void {



    console.log('Date Value:', this.dateValue.value);
    console.log('Description:', this.descriptionFormControl.value);





    this.repo.AutLetterRowInsert(this.TextData, this.dateValue.value, this.descriptionFormControl.value, this.CentralRef, this.selectedUserId.toString()).subscribe(e => {
      const intValue = parseInt(e[0].LetterRef, 10);
      if (!isNaN(intValue) && intValue > 0) {
        console.log(e)
        this.router.navigate(['/autletter/list']);
      } else {
        console.log("insert nashod")
      }

    });





  }


}
