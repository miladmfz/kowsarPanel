import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { Router } from '@angular/router';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { Base_Lookup } from 'src/app/app/kowsar/lookup-type';
import { DbSetup_lookup } from '../../../lookup-type';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';

@Component({
  selector: 'app-autletter-insert',
  templateUrl: './autletter-insert.component.html',
})
export class AutletterInsertComponent implements OnInit {

  constructor(private repo: AutletterWebApiService, private router: Router, private readonly notificationService: NotificationService,) { }

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


  CentralRef: string = '';
  ngOnInit() {
    this.JobPersonRef = sessionStorage.getItem("JobPersonRef");
    if (!(this.JobPersonRef.length > 0)) {
      this.EditForm.patchValue({
        InOutFlag: "0",
      });
    }


    this.repo.GetTodeyFromServer().subscribe((data: any) => {

      this.ToDayDate = data[0].TodeyFromServer

    });

    this.repo.GetObjectTypeFromDbSetup("AutomationLetterState").subscribe((data: any) => {

      this.LetterState_lookup = data.ObjectTypes
    });

    this.repo.GetObjectTypeFromDbSetup("AutomationLetterPriority").subscribe((data: any) => {

      this.LetterPriority_lookup = data.ObjectTypes
    });


  }


  InOut_Lookup: Base_Lookup[] = [
    { id: "0", name: "وارده" },
    { id: "1", name: "صادره" },
    { id: "2", name: "داخلی" },
  ]


  EditForm = new FormGroup({
    ToDayDate: new FormControl(''),
    dateValue: new FormControl(''),
    title: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    LetterState: new FormControl(''),
    InOutFlag: new FormControl('2'),
    LetterPriority: new FormControl(''),
    CentralRef: new FormControl(''),
  });


  submit(action) {
    this.CentralRef = sessionStorage.getItem("CentralRef");

    this.EditForm.markAllAsTouched();
    if (!this.EditForm.valid) return;

    this.EditForm.patchValue({
      ToDayDate: this.ToDayDate,
      CentralRef: this.CentralRef
    });


    if (this.EditForm.value.LetterPriority == "") {
      this.EditForm.patchValue({
        LetterPriority: "عادی",
      });

    }

    this.repo.LetterInsert(
      this.EditForm.value
    )
      .subscribe(e => {
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









}
