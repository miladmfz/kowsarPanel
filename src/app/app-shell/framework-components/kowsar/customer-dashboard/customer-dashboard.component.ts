import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AttendancePanelComponent } from 'src/app/features/internal/components/attendance-panel/attendance-panel.component';
import { KowsarReportComponent } from 'src/app/features/internal/components/kowsar-report/kowsar-report.component';
import { KowsarCalendarComponent } from '../kowsar-calendar/kowsar-calendar.component';
import { LeaveGridComponent } from 'src/app/features/internal/components/attendance-panel/components/leave-grid/leave-grid.component';
import { AutletterChartComponent } from 'src/app/features/internal/components/autletter-chart/autletter-chart.component';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { FormControl, FormGroup } from '@angular/forms';
import { AutletterWebApiService } from 'src/app/features/automation/services/AutletterWebApi.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,

  ],
})
export class CustomerDashboardComponent implements OnInit {


  LoginType = signal('')
  ToDayDate = signal('')

  doneList = signal<any[]>([]);
  inProgressList = signal<any[]>([]);
  waitingList = signal<any[]>([]);

  doneCount = signal(0);
  inProgressCount = signal(0);
  waitingCount = signal(0);

  EditForm_autletter = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl(''),
    CreationDate: new FormControl(''),
    OwnCentralRef: new FormControl(''),
    PersonInfoCode: new FormControl(''),
    OwnerPersonInfoRef: new FormControl(''),
    StartTime: new FormControl(''),
    EndTime: new FormControl(''),
    SelectedOption: new FormControl('0'),
  });

  private readonly notificationService = inject(NotificationService);
  protected readonly session = inject(SessionStorageService);
  private readonly Aut_repo = inject(AutletterWebApiService);
  private readonly router = inject(Router);

  constructor() { }

  ngOnInit(): void {
    this.initDashboard();

    this.getList()
  }


  private initDashboard(): void {
    this.detectUserInfo();
  }




  private detectUserInfo(): void {

    this.LoginType.set(this.session.loginType)

    if (this.LoginType() !== 'KOWSAR' && this.LoginType() !== 'CUSTOMER') {
      this.notificationService.warning('شناسه کاربر یافت نشد.');
    }

  }

  getList(): void {


    const CentralRef = this.session.centralRef;

    this.EditForm_autletter.patchValue({
      SearchTarget: this.EditForm_autletter.value.SearchTarget?.trim() || '',
      CentralRef: CentralRef,
      OwnCentralRef: CentralRef,
      OwnerPersonInfoRef: this.session.personInfoRef,
    });


    this.Aut_repo.GetAutLetterListForCustomer(this.EditForm_autletter.value).subscribe({
      next: (data: any) => {

        const list = data?.AutLetters || [];

        this.doneCount.set(
          list.filter(x => (x.LetterState || '').trim() === 'تمام شده').length
        );

        this.inProgressCount.set(
          list.filter(x => (x.LetterState || '').trim() === 'درحال انجام').length
        );

        this.waitingCount.set(
          list.filter(x => (x.LetterState || '').trim() === 'منتظراقدام').length
        );

      },
      error: () => {
        this.notificationService.error('❌ خطا در دریافت لیست نامه‌ها');
      }
    });
  }

  openNewTicket() {
    this.router.navigate(['/automation/insert-letter']);

  }



}
