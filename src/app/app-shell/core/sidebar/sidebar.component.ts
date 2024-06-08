import { Component, OnInit } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  constructor() { }
  PhFullName = '';
  JobPersonRef = '';
  CustName_Small = '';
  Explain = '';

  ngOnInit(): void {
    this.PhFullName = sessionStorage.getItem("PhFullName")
    this.JobPersonRef = sessionStorage.getItem("JobPersonRef")
    this.CustName_Small = sessionStorage.getItem("CustName_Small")
    this.Explain = sessionStorage.getItem("Explain")


  }

  logout() {

    sessionStorage.removeItem("ActiveDate")
    location.reload();

  }

}
