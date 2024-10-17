import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';

@Component({
  selector: 'app-autletter-detail',
  templateUrl: './autletter-detail.component.html',
})
export class AutletterDetailComponent implements OnInit {

  constructor(private repo: AutletterWebApiService, private route: ActivatedRoute,) { }

  id!: string;
  JobPersonRef: string = '';

  Autletter_data = new FormGroup({
    OwnerName: new FormControl(''),
    LetterCode: new FormControl(''),
    LetterTitle: new FormControl(''),
    LetterDate: new FormControl(''),
    LetterDescription: new FormControl(''),
    LetterState: new FormControl(''),
    LetterPriority: new FormControl(''),
    CreatorName: new FormControl(''),
    ExecutorName: new FormControl(''),
    RowsCount: new FormControl(''),
  });


  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      var idtemp = params.get('id');
      if (idtemp != null) {
        this.id = idtemp;
        this.JobPersonRef = sessionStorage.getItem("JobPersonRef");
      }
    });

    this.repo.GetAutletterById(this.id).subscribe(e => {

      this.Autletter_data.patchValue({
        OwnerName: e[0].OwnerName,
        LetterCode: e[0].LetterCode,
        LetterTitle: e[0].LetterTitle,
        LetterDate: e[0].LetterDate,
        LetterDescription: e[0].LetterDescription,
        LetterState: e[0].LetterState,
        LetterPriority: e[0].LetterPriority,
        CreatorName: e[0].CreatorName,
        ExecutorName: e[0].ExecutorName,
        RowsCount: e[0].RowsCount,
      });



    });



  }






}
