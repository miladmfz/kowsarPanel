import { Component, OnInit, Input } from '@angular/core';
import { ManagerWebApiService } from '../../services/ManagerWebApi.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { operationSuccessful } from 'src/app/app-shell/framework-components/app-messages';
@Component({
  selector: 'app-application-form',
  templateUrl: './application-form.component.html',
})

export class ApplicationFormComponent implements OnInit {
  title = 'ایجاد نوع داده انتخابی';
  Code: string = '';
  SingleItems: any[] = [];
  EditForm = new FormGroup({
    AppBrokerCustomerCode: new FormControl(''),
    ActivationCode: new FormControl(''),
    AppType: new FormControl(''),
    DbImageName: new FormControl(''),
    DbName: new FormControl(''),
    EnglishCompanyName: new FormControl(''),
    PersianCompanyName: new FormControl(''),
    MaxDevice: new FormControl(''),
    SQLiteURL: new FormControl(''),
    SecendServerURL: new FormControl(''),
    ServerURL: new FormControl(''),
  });


  constructor(
    private repo: ManagerWebApiService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private location: Location,
  ) { }


  ngOnInit() {
    //debugger
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.Code = id;
        this.getDetails();
      }
    });

  }

  getDetails() {


    this.repo.GetAppBrokerCustomerByCode(this.Code).subscribe(e => {


      this.SingleItems = e;
      this.LoadDataSet();
    });


  }


  LoadDataSet() {
    this.EditForm.patchValue({
      AppBrokerCustomerCode: this.SingleItems[0].AppBrokerCustomerCode,
      ActivationCode: this.SingleItems[0].ActivationCode,
      EnglishCompanyName: this.SingleItems[0].EnglishCompanyName,
      PersianCompanyName: this.SingleItems[0].PersianCompanyName,
      ServerURL: this.SingleItems[0].ServerURL,
      SQLiteURL: this.SingleItems[0].SQLiteURL,
      MaxDevice: this.SingleItems[0].MaxDevice,
      SecendServerURL: this.SingleItems[0].SecendServerURL,
      DbName: this.SingleItems[0].DbName,
      AppType: this.SingleItems[0].AppType,
    });

  }




  onBtnCancelClick() {
    this.router.navigateByUrl('incident/incident/list');
  }






  submit(action) {

    const command = this.EditForm.value;
    if (action == 'delete') {
      // this.incidentService.delete(command.id).subscribe((id) => {
      //   this.handleCreateEditOps(action, id);
      // });
    }

    if (this.Code != "0") {


      this.repo.UpdateAppBrokerCustomer(
        this.EditForm.value.ActivationCode,
        this.EditForm.value.EnglishCompanyName,
        this.EditForm.value.PersianCompanyName,
        this.EditForm.value.ServerURL,
        this.EditForm.value.SQLiteURL,
        this.EditForm.value.MaxDevice,
        this.EditForm.value.SecendServerURL,
        this.EditForm.value.DbName,
        this.EditForm.value.AppType

      ).subscribe(e => {


        if (e[0].AppBrokerCustomerCode.length > 0) {

          if (action == 'exit') {
            this.location.back();
          } else if (action == 'new') {
            window.location.reload();
          }
        }

      });



    } else {

      this.repo.InsertAppBrokerCustomer(
        this.EditForm.value.ActivationCode,
        this.EditForm.value.EnglishCompanyName,
        this.EditForm.value.PersianCompanyName,
        this.EditForm.value.ServerURL,
        this.EditForm.value.SQLiteURL,
        this.EditForm.value.MaxDevice,
        this.EditForm.value.SecendServerURL,
        this.EditForm.value.DbName,
        this.EditForm.value.AppType

      ).subscribe(e => {


        if (e[0].AppBrokerCustomerCode.length > 0) {

          if (action == 'exit') {
            this.location.back();
          } else if (action == 'new') {
            window.location.reload();
          }
        }


      });




    }

  }

  handleCreateEditOps(action, id) {
    //debugger
    //if (action == 'new') {
    this.EditForm.reset();
    //this.title = 'ایجاد کاربر جدید';
    this.Code = '';
    document.getElementById('ActivationCode').focus();
    //} else if (action == 'exit') {
    //  this.router.navigateByUrl('/user-management/user/list');
    //} else {
    //  this.title = 'ویرایش کاربر';
    //  this.router.navigateByUrl(`/user-management/user/edit/${id}`);
    //}

    this.notificationService.succeded(operationSuccessful);
  }
}




















/*

implements OnInit {

  constructor(private repo: ManagerWebApiService, private route: ActivatedRoute, private location: Location, private router: Router) { }



  @Input() TextData: string = '';

  SingleItems: any[] = [];


  formValues: any = {};
  id!: string;





  logFormData() {
    console.log('Form data:', this.formValues);

    if (this.id == "0") {
      console.log(" ersal baraye create ");

      this.router.navigate(['/baseinformation/broker/list']);

      this.repo.InsertAppBrokerCustomer(
        this.formValues.ActivationCode,
        this.formValues.EnglishCompanyName,
        this.formValues.PersianCompanyName,
        this.formValues.ServerURL,
        this.formValues.SQLiteURL,
        this.formValues.MaxDevice,
        this.formValues.SecendServerURL,
        this.formValues.DbName,
        this.formValues.AppType

      ).subscribe(e => {


        if (e[0].AppBrokerCustomerCode.length > 0) {
          this.location.back();

        }



      });


      console.log(this.formValues);

    } else {
     
    }


  }





  LoadFromUrl(id: string) {



    this.repo.GetAppBrokerCustomerByCode(this.id).subscribe(e => {



      this.SingleItems = e;
      console.log(this.SingleItems);
      this.LoadDataSet();
      // Save the updated data to localStorage

    });




  }




  LoadDataSet() {
    this.formValues = {
      ActivationCode: this.SingleItems[0].ActivationCode,
      EnglishCompanyName: this.SingleItems[0].EnglishCompanyName,
      PersianCompanyName: this.SingleItems[0].PersianCompanyName,
      ServerURL: this.SingleItems[0].ServerURL,
      SQLiteURL: this.SingleItems[0].SQLiteURL,
      MaxDevice: this.SingleItems[0].MaxDevice,
      SecendServerURL: this.SingleItems[0].SecendServerURL,
      DbName: this.SingleItems[0].DbName,
      AppType: this.SingleItems[0].AppType,
    };

  }


  EmptyForm() {
    this.formValues = {
      ActivationCode: '',
      EnglishCompanyName: '',
      PersianCompanyName: '',
      ServerURL: '',
      SQLiteURL: '',
      MaxDevice: '',
      SecendServerURL: '',
      DbName: '',
      AppType: '',
    };


  }





  ngOnInit() {
    this.EmptyForm()
    this.id = this.route.snapshot.params['id'];
    this.LoadFromUrl(this.id);

  }




}


*/




