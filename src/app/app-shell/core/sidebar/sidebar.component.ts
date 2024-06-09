import { Component, OnInit } from '@angular/core';
import { CentralWebApiService } from 'src/app/app/support/services/CentralWebApi.service';
declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  constructor(
    private repo: CentralWebApiService,
  ) { }
  PhFullName = '';
  JobPersonRef = '';
  CustName_Small = '';
  Explain = '';
  CentralRef = '';
  imageData: string = '';
  Imageitem: string = '';

  ngOnInit(): void {
    this.PhFullName = sessionStorage.getItem("PhFullName")
    this.JobPersonRef = sessionStorage.getItem("JobPersonRef")
    this.CustName_Small = sessionStorage.getItem("CustName_Small")
    this.Explain = sessionStorage.getItem("Explain")
    this.CentralRef = sessionStorage.getItem("CentralRef")
    this.fetchImageData()
  }

  logout() {

    sessionStorage.removeItem("ActiveDate")
    location.reload();

  }

  // Variable to hold the image data


  fetchImageData() {

    this.repo.GetImageFromServer(this.CentralRef).subscribe((data: any) => {

      this.Imageitem = `data:${Image};base64,${data.Text}`;

    });
  }


}
