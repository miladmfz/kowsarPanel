import { Component, OnInit } from '@angular/core';
import { ApplicationWebApiService } from '../../../services/ApplicationWebApi.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ocr-factor-detail',
  templateUrl: './ocr-factor-detail.component.html',
})
export class OcrFactorDetailComponent implements OnInit {

  constructor(
    private repo: ApplicationWebApiService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private router: Router
    ,) { }




  items: any[] = [];
  id!: string;



  ngOnInit() {
    this.id = this.route.snapshot.params['id'];


    // Fetch and update the data from your API
    this.repo.ocrGetFactorDetail(this.id).subscribe(e => {
      this.items = e;

    });
  }

  ExitDelivery() {
    this.repo.ExitDelivery(this.id).subscribe(e => {
      // Perform the navigation here
    });

    this.repo.ExitDelivery(this.id).subscribe(e => {
      this.router.navigate(['/application/ocr-list']);

    });
  }

}
