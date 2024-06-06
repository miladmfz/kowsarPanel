import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  constructor() { }
  userData = null;
  ngOnInit(): void {
    this.getUserData();
  }
  logout() {

  }
  async getUserData() {

  }
}
