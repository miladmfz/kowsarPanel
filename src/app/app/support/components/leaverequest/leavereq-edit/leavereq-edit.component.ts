import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LeaveRequestWebApiService } from '../../../services/LeaveRequestWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { LoadingService } from 'src/app/app-shell/framework-services/loading.service';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { Base_Lookup, DbSetup_lookup } from '../../../lookup-type';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from "jalali-moment";

@Component({
  selector: 'app-leavereq-edit',
  templateUrl: './leavereq-edit.component.html',
})
export class LeavereqEditComponent implements OnInit {

  constructor(
    private repo: LeaveRequestWebApiService,
    private router: Router,
    private route: ActivatedRoute,

    private readonly notificationService: NotificationService,
    private loadingService: LoadingService,
    private renderer: Renderer2,

  ) { }

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };
  ToDayDate: string = "";

  LeaveType_Lookup: Base_Lookup[] = [
    { id: "مرخصي استحقاقي", name: "مرخصي استحقاقي" },
    { id: "مرخصي ساعتي", name: "مرخصي ساعتي" },
    { id: "مرخصي استعلاجي", name: "مرخصي استعلاجي" },
    { id: "مرخصي بدون حقوق", name: "مرخصي بدون حقوق" },

    { id: "مرخصي زايمان", name: "مرخصي زايمان" },
    { id: "مرخصي پدر", name: "مرخصي پدر" },
    { id: "مرخصي ازدواج", name: "مرخصي ازدواج" },
    { id: "مرخصي فوت بستگان", name: "مرخصي فوت بستگان" },
    { id: "مرخصي تحصيلي", name: "مرخصي تحصيلي" },
    { id: "مرخصي اضطراري", name: "مرخصي اضطراري" },
    { id: "مرخصي مأموريت", name: "مرخصي مأموريت" }

  ]

  EditForm_LeaveRequest = new FormGroup({
    LeaveRequestCode: new FormControl(''),
    UserRef: new FormControl(''),
    LeaveRequestDate: new FormControl(''),
    LeaveRequestType: new FormControl('', Validators.required),
    LeaveRequestExplain: new FormControl('', Validators.required),
    LeaveStartDate: new FormControl('', Validators.required),
    LeaveEndDate: new FormControl('', Validators.required),
    LeaveStartTime: new FormControl('', Validators.required),
    LeaveEndTime: new FormControl(''),
    ManagerRef: new FormControl('0'),
    WorkFlowStatus: new FormControl('0'),
    WorkFlowExplain: new FormControl(''),
  });


  title = 'درخواست مرخصي ';

  JobPersonRef: string = '';
  CentralRef: string = '';
  LeaveRequestCode: string = '';





  getdetail() {

    this.repo.GetLeaveRequestById(this.LeaveRequestCode).subscribe((data: any) => {

      this.EditForm_LeaveRequest.patchValue({

        LeaveRequestType: data.LeaveRequests[0].LeaveRequestType,
      });
      this.onLeaveTypeChange()
      this.EditForm_LeaveRequest.patchValue({
        LeaveRequestCode: data.LeaveRequests[0].LeaveRequestCode,
        UserRef: data.LeaveRequests[0].UserRef,
        LeaveRequestDate: data.LeaveRequests[0].LeaveRequestDate,
        LeaveRequestType: data.LeaveRequests[0].LeaveRequestType,
        LeaveRequestExplain: data.LeaveRequests[0].LeaveRequestExplain,
        LeaveStartDate: data.LeaveRequests[0].LeaveStartDate,
        LeaveEndDate: data.LeaveRequests[0].LeaveEndDate,
        LeaveStartTime: data.LeaveRequests[0].LeaveStartTime,
        LeaveEndTime: data.LeaveRequests[0].LeaveEndTime,
        ManagerRef: data.LeaveRequests[0].ManagerRef,
        WorkFlowStatus: data.LeaveRequests[0].WorkFlowStatus,
        WorkFlowExplain: data.LeaveRequests[0].WorkFlowExplain,
      });
    });


  }


  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');

      if (id != null) {
        // update
        this.LeaveRequestCode = id
        this.title = "اصلاح مرخصي "
        this.getdetail()


      } else {
        // new
        this.LeaveRequestCode = ""
        this.title = "ايجاد مرخصي جديد"



      }


    });


    this.repo.GetTodeyFromServer().subscribe((data: any) => {
      this.ToDayDate = data[0].TodeyFromServer

      this.EditForm_LeaveRequest.patchValue({
        LeaveRequestDate: this.ToDayDate,
      });


    });

  }

  showTimeFields: boolean = false;


  onLeaveTypeChange() {
    switch (this.EditForm_LeaveRequest.value.LeaveRequestType) {

      case 'مرخصي ساعتي':
        // نمايش فيلدهاي ساعت شروع و پايان
        this.showTimeFields = true;
        this.EditForm_LeaveRequest.patchValue({
          LeaveStartTime: "",
          LeaveEndTime: "",
        });
        break;
      default:
        // مخفي کردن فيلدهاي ساعت
        this.showTimeFields = false;

        this.EditForm_LeaveRequest.patchValue({
          LeaveStartTime: "00:00",
          LeaveEndTime: "23:59",
        });

        break;
    }
  }


  onLeaveStartDateChange(event: any) {
    console.log("selectedDate")

    const selectedDate = event?.formatted || event;
    this.EditForm_LeaveRequest.patchValue({
      LeaveStartDate: selectedDate,
      LeaveEndDate: selectedDate // اگر تاريخ شروع انتخاب شد، پايان هم برابر بشه
    });
  }

  onLeaveEndDateChange(event: any) {
    const start = this.EditForm_LeaveRequest.value.LeaveStartDate;
    const end = event?.formatted || event;

    // اگر تاريخ پايان قبل از شروع بود → هم‌ارز تاريخ شروع تنظيم بشه
    if (end < start) {
      this.EditForm_LeaveRequest.patchValue({ LeaveEndDate: start });
    } else {
      this.EditForm_LeaveRequest.patchValue({ LeaveEndDate: end });
    }
  }




  submit() {

    this.EditForm_LeaveRequest.patchValue({
      UserRef: sessionStorage.getItem("CentralRef"),
    });

    // this.EditForm_LeaveRequest.markAllAsTouched();
    // if (!this.EditForm_LeaveRequest.valid) return;

    // داده‌هاي فرم
    const formValue = this.EditForm_LeaveRequest.value;
    const leaveType = formValue.LeaveRequestType; // مثلاً "روزانه" يا "ساعتي"
    const startDate = new Date(formValue.LeaveStartDate);
    const endDate = new Date(formValue.LeaveEndDate);
    const startTime = formValue.LeaveStartTime;
    const endTime = formValue.LeaveEndTime;
    const LeaveRequestExplain = formValue.LeaveRequestExplain;


    console.log("----------------------")
    console.log("leaveType", leaveType)
    console.log("startDate", startDate)
    console.log("endDate", endDate)
    console.log("startTime", startTime)
    console.log("endTime", endTime)

    if (!leaveType || leaveType.trim() === '') {
      this.notificationService.error('لطفاً نوع مرخصي را انتخاب کنيد.');
      return;
    }


    // --- 1️⃣ بررسي تاريخ‌ها ---
    if (endDate < startDate) {
      this.notificationService.error('تاريخ پايان نمي‌تواند قبل از تاريخ شروع باشد.');
      return;
    }

    // --- 2️⃣ بررسي ساعت‌ها براي مرخصي ساعتي ---
    if (leaveType === 'مرخصي ساعتي') {
      if (!startTime || !endTime) {
        this.notificationService.error('براي مرخصي ساعتي، ساعت شروع و پايان الزامي است.');
        return;
      }
      if (endTime <= startTime) {
        this.notificationService.error('ساعت پايان بايد بعد از ساعت شروع باشد.');
        return;
      }
    }

    if (!LeaveRequestExplain || LeaveRequestExplain.trim() === '') {
      this.notificationService.error('لطفاً توضيحات مرخصي را وارد کنيد.');
      return;
    }


    this.loadingService.show()



    if (this.LeaveRequestCode.length > 0) {

      // update


      this.repo.LeaveRequest_Update(this.EditForm_LeaveRequest.value).subscribe((data: any) => {
        this.loadingService.hide()
        if (data.LeaveRequests[0].LeaveRequestCode.length > 0) {
          this.notificationService.succeded();

          this.router.navigate(['/support/leavereq-list'])

        } else {
          this.notificationService.error1("s");

        }


      });

    } else {
      // new


      this.repo.LeaveRequest_Insert(this.EditForm_LeaveRequest.value).subscribe((data: any) => {
        this.loadingService.hide()
        if (data.LeaveRequests[0].LeaveRequestCode.length > 0) {
          this.notificationService.succeded();

          this.router.navigate(['/support/leavereq-list'])

        } else {
          this.notificationService.error1("s");

        }

      });


    }






  }



}
