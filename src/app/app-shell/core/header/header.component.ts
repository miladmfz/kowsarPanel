/* ===============================================================
   📘 HeaderComponent
   توضیحات کلی:
   این کامپوننت مسئول نمایش نوار بالای سیستم (Topbar) است.
   شامل مدیریت اعلان‌ها، تغییر تم، تصویر پروفایل و کنترل سایدبار می‌باشد.

   قابلیت‌ها:
   1️⃣ دریافت اعلان‌ها از سرور در بازه‌های زمانی منظم (هر ۱۵ ثانیه)
   2️⃣ بارگذاری تصویر پروفایل از API
   3️⃣ پشتیبانی از حالت تیره و روشن با ذخیره‌سازی در localStorage
   4️⃣ مدیریت خروج از سیستم و پاک‌سازی session
   5️⃣ کنترل باز/بسته شدن سایدبار در حالت دسکتاپ و موبایل
   =============================================================== */

import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, NgZone, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardWebApiService } from '../services/dashboard-web-api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, AfterViewInit {
  // ===============================================================
  //   وضعیت‌ها و متغیرهای اعلان
  // ===============================================================
  isDarkMode = false;
  AlarmActive_Row = 0;
  AlarmActtive_Conversation = 0;
  AlarmActtive_LeaveRequest = 0;
  attendanceInterval!: ReturnType<typeof setInterval>;

  // ===============================================================
  // 👤 اطلاعات کاربر
  // ===============================================================
  Imageitem = '';
  PhFullName = '';
  JobPersonRef = '';
  currentStatus = '';

  // ===============================================================
  //   سازنده
  // ===============================================================
  private readonly zone = inject(NgZone);
  private readonly repo = inject(DashboardWebApiService);


  constructor() { }

  // ===============================================================
  // 🚀 Lifecycle Hooks
  // ===============================================================
  ngOnInit(): void {
    // 🌓 مقداردهی اولیه تم
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    this.isDarkMode = savedTheme === 'dark';

    // 👤 اطلاعات پایه کاربر
    this.PhFullName = sessionStorage.getItem('PhFullName') || '';
    this.JobPersonRef = sessionStorage.getItem('JobPersonRef') || '';

    // 🔔 بروزرسانی اعلان‌ها هر ۱۵ ثانیه
    this.attendanceInterval = setInterval(() => this.Get_Notification(), 15000);
    this.Get_Notification();

    // 📷 دریافت تصویر پروفایل
    this.loadProfileImage();
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
        this.setTheme(savedTheme);
      }, 0);
    });
  }

  // ===============================================================
  // 🖼️ دریافت عکس کاربر از سرور
  // ===============================================================
  private loadProfileImage(): void {
    const centralRef = sessionStorage.getItem('CentralRef');
    if (!centralRef) return;

    this.repo.GetImageFromServer(centralRef).subscribe({
      next: (data: any) => {
        if (data?.Text) {
          this.zone.run(() => {
            this.Imageitem = `data:image/png;base64,${data.Text}`;
          });
        }
      },
      error: () => console.warn('❌ خطا در دریافت تصویر کاربر'),
    });
  }

  // ===============================================================
  // 🔔 دریافت اعلان‌ها از API
  // ===============================================================
  Get_Notification(): void {
    const personRef = sessionStorage.getItem('PersonInfoRef');
    if (!personRef) return;

    this.repo.GetNotification(personRef).subscribe({
      next: (data: any) => {
        const u = data?.users?.[0];
        if (!u) return;

        this.zone.run(() => {
          this.AlarmActive_Row = Number(u.AlarmActive_Row) || 0;
          this.AlarmActtive_Conversation = Number(u.AlarmActtive_Conversation) || 0;

          // فقط برای ادمین‌ها (PhAddress3=100)
          if (sessionStorage.getItem('PhAddress3') === '100') {
            this.AlarmActtive_LeaveRequest = Number(u.AlarmActtive_LeaveRequest) || 0;
          }

          //   ذخیره در session برای سایر بخش‌ها
          sessionStorage.setItem('AlarmActive_Row', this.AlarmActive_Row.toString());
          sessionStorage.setItem('AlarmActtive_Conversation', this.AlarmActtive_Conversation.toString());
          sessionStorage.setItem('AlarmActtive_LeaveRequest', this.AlarmActtive_LeaveRequest.toString());
        });
      },
      error: () => console.warn('  خطا در دریافت اعلان‌ها از سرور'),
    });
  }

  // ===============================================================
  // 🌗 تغییر تم سیستم (Dark / Light)
  // ===============================================================
  toggleTheme(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.isDarkMode = checked;
    this.setTheme(checked ? 'dark' : 'light');
  }

  setTheme(mode: 'light' | 'dark'): void {
    const bsLight = document.getElementById('bs-default-stylesheet') as HTMLLinkElement;
    const appLight = document.getElementById('app-default-stylesheet') as HTMLLinkElement;
    const bsDark = document.getElementById('bs-dark-stylesheet') as HTMLLinkElement;
    const appDark = document.getElementById('app-dark-stylesheet') as HTMLLinkElement;

    if (!bsLight || !appLight || !bsDark || !appDark) return;

    if (mode === 'dark') {
      bsLight.disabled = true;
      appLight.disabled = true;
      bsDark.disabled = false;
      appDark.disabled = false;
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
      bsLight.disabled = false;
      appLight.disabled = false;
      bsDark.disabled = true;
      appDark.disabled = true;
      document.documentElement.setAttribute('data-bs-theme', 'light');
    }

    localStorage.setItem('theme', mode);
  }

  // ===============================================================
  // 🚪 خروج از سیستم
  // ===============================================================
  logout(): void {
    sessionStorage.clear();
    localStorage.removeItem('theme');
    window.location.reload();
  }

  // ===============================================================
  // 📱 باز و بسته کردن سایدبار
  // ===============================================================
  toggleSidebar(): void {
    const body = document.body;
    const width = window.innerWidth;

    if (width >= 993) {
      const isCondensed = body.getAttribute('data-sidebar-size') === 'condensed';
      body.setAttribute('data-sidebar-size', isCondensed ? 'default' : 'condensed');
    } else {
      body.classList.toggle('sidebar-enable');
    }
  }
}
