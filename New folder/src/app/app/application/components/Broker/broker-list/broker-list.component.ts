import { Component, OnInit } from '@angular/core';
import { BrokerWebApiService } from '../../../services/BrokerWebApi.service';

@Component({
  selector: 'app-broker-list',
  templateUrl: './broker-list.component.html',
})
export class BrokerListComponent implements OnInit {

  constructor(private repo: BrokerWebApiService,) { }
  items: any[] = [];





  ngOnInit() {


    this.repo.GetBrokers().subscribe(e => {
      this.items = e;

    });



  }

}
