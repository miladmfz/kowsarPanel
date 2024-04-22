import { Component, OnInit } from '@angular/core';
import { ApplicationWebApiService } from '../../../services/ApplicationWebApi.service';

@Component({
  selector: 'app-broker-list',
  templateUrl: './broker-list.component.html',
})
export class BrokerListComponent implements OnInit {

  constructor(private repo: ApplicationWebApiService,) { }
  items: any[] = [];





  ngOnInit() {


    this.repo.GetBrokers().subscribe(e => {
      this.items = e;

    });



  }

}
