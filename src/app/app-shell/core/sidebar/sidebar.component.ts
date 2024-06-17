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


  apporder: string = '';
  appbroker: string = '';
  appocr: string = '';


  array_applications: any[] = [];


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

    this.repo.GetApplicationForMenu().subscribe((data: any) => {

      if (data.applications != null) {
        this.array_applications = data.applications;
        for (var single_applications of this.array_applications) {

          if (single_applications.KeyValue === 'AppOrder_ActivationCode') {
            this.apporder = single_applications.DataValue
          }
          if (single_applications.KeyValue === 'AppBroker_ActivationCode') {
            this.appbroker = single_applications.DataValue

          }
          if (single_applications.KeyValue === 'AppOcr_ActivationCode') {
            this.appocr = single_applications.DataValue

          }
        }

      }

    });



  }


}
