import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../framework-services/shared.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  constructor(private sharedService: SharedService,) { }
  ngOnInit(): void {



    this.CallService()
  }

  CallService() {
    this.sharedService.RefreshAllActions$.subscribe(action => {
      if (action === 'refresh') {
        this.refreshpage();
      }
    });
  }

  refreshpage() {

  }


}
