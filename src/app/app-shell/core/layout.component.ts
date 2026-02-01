import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
  ],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {

  ngOnInit(): void {
    //   موقع اجرا، آخرین تم ذخیره‌شده رو اعمال کن
    const savedTheme = localStorage.getItem('theme') === 'dark';
    this.setTheme(savedTheme);
  }

  // 🔹 تغییر تم (روشن / تاریک)
  setTheme(isDark: boolean): void {
    const lightBootstrap = document.getElementById('bs-default-stylesheet') as HTMLLinkElement;
    const lightApp = document.getElementById('app-default-stylesheet') as HTMLLinkElement;
    const darkBootstrap = document.getElementById('bs-dark-stylesheet') as HTMLLinkElement;
    const darkApp = document.getElementById('app-dark-stylesheet') as HTMLLinkElement;

    if (!lightBootstrap || !darkBootstrap) return; // ایمنی

    if (isDark) {
      // 🔹 حالت تاریک فعال شود
      lightBootstrap.disabled = true;
      lightApp.disabled = true;
      darkBootstrap.disabled = false;
      darkApp.disabled = false;
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      // 🔹 حالت روشن فعال شود
      lightBootstrap.disabled = false;
      lightApp.disabled = false;
      darkBootstrap.disabled = true;
      darkApp.disabled = true;
      document.documentElement.setAttribute('data-bs-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }

  //   توابع قابل استفاده در سایر کامپوننت‌ها (مثلاً Header)
  toggleTheme(): void {
    const isDark = localStorage.getItem('theme') === 'dark';
    this.setTheme(!isDark);
  }
}
