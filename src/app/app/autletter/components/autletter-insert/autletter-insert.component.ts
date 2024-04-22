import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AutletterWebApiService } from '../../services/AutletterWebApi.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-autletter-insert',
  templateUrl: './autletter-insert.component.html',
})
export class AutletterInsertComponent implements OnInit {

  constructor(private repo: AutletterWebApiService, private router: Router) { }
  dateValue = new FormControl();
  titleFormControl = new FormControl();
  descriptionFormControl = new FormControl();
  CentralRef: string = '';
  ngOnInit() {
  }


  logFormData(): void {
    // Log the relevant information
    console.log('Date Value:', this.dateValue.value);
    console.log('Title:', this.titleFormControl.value);
    console.log('Description:', this.descriptionFormControl.value);



    this.CentralRef = '4';


    this.repo.LetterInsert(this.dateValue.value, this.titleFormControl.value, this.descriptionFormControl.value, this.CentralRef).subscribe(e => {
      const intValue = parseInt(e[0].LetterCode, 10);
      if (!isNaN(intValue) && intValue > 0) {
        console.log(e)
        this.router.navigate(['/autletter/list']);
      } else {
        console.log("insert nashod")
      }

    });

  }







}
