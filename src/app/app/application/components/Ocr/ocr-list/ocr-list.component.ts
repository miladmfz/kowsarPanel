import { Component, OnInit } from '@angular/core';
import { ApplicationWebApiService } from '../../../services/ApplicationWebApi.service';

@Component({
  selector: 'app-ocr-list',
  templateUrl: './ocr-list.component.html',
})
export class OcrListComponent implements OnInit {

  constructor(private repo: ApplicationWebApiService,) { }




  items: any[] = [];
  Searchtarget: string = "%";





  Searching() {
    this.items = []
    if (this.Searchtarget == "") {
      this.Searchtarget = "%"
    }
    this.repo.OcrFactorList(this.Searchtarget).subscribe(e => {
      this.items = e;

    });
  }

  ngOnInit() {

    // Fetch and update the data from your API
    this.repo.OcrFactorList(this.Searchtarget).subscribe(e => {
      this.items = e;

    });
  }

  onInputChange() {

    if (this.Searchtarget == "") {
      this.Searchtarget = "%"
    }
  }

}
