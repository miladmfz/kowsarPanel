import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AutletterWebApiService } from '../../services/AutletterWebApi.service';

@Component({
  selector: 'app-autletter-detail',
  templateUrl: './autletter-detail.component.html',
})
export class AutletterDetailComponent implements OnInit {

  constructor(private repo: AutletterWebApiService, private route: ActivatedRoute,) { }

  id!: string;

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    console.log("AutletterDetailComponent=" + this.id);

  }

}
