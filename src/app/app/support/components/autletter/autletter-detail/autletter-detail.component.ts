import { Component, OnInit } from '@angular/core';
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

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      var idtemp = params.get('id');
      if (idtemp != null) {
        this.id = idtemp;
        this.JobPersonRef = sessionStorage.getItem("JobPersonRef");
      }
    });
  }

}
