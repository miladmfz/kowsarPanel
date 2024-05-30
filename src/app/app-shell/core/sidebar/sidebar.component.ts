import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../../framework-services/local.storage.service';
declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  constructor() { }
  PhFullName = '';
  localStorageService: LocalStorageService
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
