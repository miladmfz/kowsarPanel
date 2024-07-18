import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { Router } from '@angular/router';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { Base_Lookup } from 'src/app/app/kowsar/lookup-type';

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

  Title_Lookup: Base_Lookup[] = [
    { id: "پشتیبانی فنی", name: "پشتیبانی فنی" },
    { id: "امور مالی و تمدید پشتیبانی", name: "امور مالی و تمدید پشتیبانی" },
    { id: "حسابداری", name: "حسابداری" },
    { id: "آموزش و سوال نرم افزاری", name: "آموزش و سوال نرم افزاری" },
    { id: "سایت Site", name: "سایت Site" },
    { id: "اپلیکیشن موبایلی mobile Application", name: "اپلیکیشن موبایلی mobile Application" },
    { id: "همسان سازی  Replication", name: "همسان سازی  Replication" },
    { id: "درخواست فاکتور", name: "درخواست فاکتور" },
  ]



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
