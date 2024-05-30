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

  ngOnInit(): void {
    this.PhFullName = sessionStorage.getItem("PhFullName")
    this.JobPersonRef = sessionStorage.getItem("JobPersonRef")
  }

  logout() {

    sessionStorage.removeItem("ActiveDate")
    location.reload();

  }

}
