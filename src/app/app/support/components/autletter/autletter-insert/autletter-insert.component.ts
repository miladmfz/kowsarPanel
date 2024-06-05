import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { Router } from '@angular/router';
import { IDatepickerTheme } from 'ng-persian-datepicker';

@Component({
  selector: 'app-autletter-insert',
  templateUrl: './autletter-insert.component.html',
})
export class AutletterInsertComponent implements OnInit {

  constructor(private repo: AutletterWebApiService, private router: Router) { }

  EditForm = new FormGroup({
    dateValue: new FormControl(''),
    titleFormControl: new FormControl(''),
    descriptionFormControl: new FormControl(''),
  });

  ToDayDate: string = "";




  CentralRef: string = '';
  ngOnInit() {

    this.repo.GetTodeyFromServer().subscribe((data: any) => {

      this.ToDayDate = data[0].TodeyFromServer

    });

  }

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };




  submit(action) {
    this.CentralRef = sessionStorage.getItem("CentralRef");
    const command = this.EditForm.value;
    if (action == 'delete') {

      // TODO List

    }

    this.repo.LetterInsert(this.ToDayDate, this.EditForm.value.titleFormControl, this.EditForm.value.descriptionFormControl, this.CentralRef).subscribe(e => {
      const intValue = parseInt(e[0].LetterCode, 10);
      if (!isNaN(intValue) && intValue > 0) {
        this.router.navigate(['/support/letter-list']);
      } else {
        console.log("insert nashod")
      }

    });



  }









}
