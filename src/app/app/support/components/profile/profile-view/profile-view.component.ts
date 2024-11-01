import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { ProfileWebApiService } from '../../../services/ProfileWebApi.service';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
})
export class ProfileViewComponent implements OnInit {

  constructor(
    private repo: ProfileWebApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) { }

  CentralRefCustomer: string = '';
  CentralRefJob: string = '';
  PersonInfoRef: string = '';
  JobPersonRef: string = '';
  editform_visible: boolean = false;

  GoodTypeStr: string = '';
  Imageitem: string = '';
  items: any[] = [];

  ProfileForm = new FormGroup({
    PersonInfoCode: new FormControl(''),
    JobPersonCode: new FormControl(''),
    CustomerCode: new FormControl(''),
    CentralRefCustomer: new FormControl(''),
    CentralRefJob: new FormControl(''),
    PhFirstName: new FormControl(''),
    PhLastName: new FormControl(''),
    PhCompanyName: new FormControl(''),
    PhAddress1: new FormControl(''),
    PhTel1: new FormControl(''),
    PhMobile1: new FormControl(''),
    PhEmail: new FormControl(''),
    CustName_Small: new FormControl(''),
    Phone: new FormControl(''),
    Name: new FormControl(''),
  });


  ProfileForm_Edit = new FormGroup({
    PersonInfoCode: new FormControl(''),
    PhFirstName: new FormControl(''),
    PhLastName: new FormControl(''),
    PhCompanyName: new FormControl(''),
    PhAddress1: new FormControl(''),
    PhTel1: new FormControl(''),
    PhMobile1: new FormControl(''),
    PhEmail: new FormControl(''),
  });


  ngOnInit(): void {

    this.getDetails();

  }


  getDetails() {

    this.repo.GetKowsarPersonInfo(sessionStorage.getItem("PersonInfoRef")).subscribe((data: any) => {
      this.CentralRefCustomer = data.users[0].CentralRefCustomer
      this.CentralRefJob = data.users[0].CentralRefJob
      this.PersonInfoRef = data.users[0].PersonInfoCode
      this.JobPersonRef = data.users[0].JobPersonCode

      this.ProfileForm.patchValue({
        PersonInfoCode: data.users[0].PersonInfoCode,
        JobPersonCode: data.users[0].JobPersonCode,
        CustomerCode: data.users[0].CustomerCode,
        CentralRefCustomer: data.users[0].CentralRefCustomer,
        CentralRefJob: data.users[0].CentralRefJob,
        PhFirstName: data.users[0].PhFirstName,
        PhLastName: data.users[0].PhLastName,
        PhCompanyName: data.users[0].PhCompanyName,
        PhAddress1: data.users[0].PhAddress1,
        PhTel1: data.users[0].PhTel1,
        PhMobile1: data.users[0].PhMobile1,
        PhEmail: data.users[0].PhEmail,
        CustName_Small: data.users[0].CustName_Small,
        Phone: data.users[0].Phone,
        Name: data.users[0].Name,
      });

      this.ProfileForm_Edit.patchValue({
        PersonInfoCode: data.users[0].PersonInfoCode,
        PhFirstName: data.users[0].PhFirstName,
        PhLastName: data.users[0].PhLastName,
        PhCompanyName: data.users[0].PhCompanyName,
        PhAddress1: data.users[0].PhAddress1,
        PhTel1: data.users[0].PhTel1,
        PhMobile1: data.users[0].PhMobile1,
        PhEmail: data.users[0].PhEmail,
      });



    });
  }



  onBtnCancelClick() {
    this.router.navigateByUrl('support/central-list');
  }



  taggel_editform_visible() {
    this.editform_visible = !this.editform_visible
  }

  submit(action) {
    const command = this.ProfileForm_Edit.value;
    this.repo.UpdatePersonInfo(command).subscribe((data: any) => {
      location.reload();
    });
  }


}
