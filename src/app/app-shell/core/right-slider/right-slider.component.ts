import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-right-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './right-slider.component.html',
})
export class RightSliderComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
    // اگر بعداً لازم بود منطق خاصی برای باز/بسته شدن سایدبار اضافه کنیم، اینجا انجام میشه
  }
  toggleDarkMode(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    localStorage.setItem('theme', checked ? 'dark' : 'light');
    location.reload();
  }

  toggleSidebarCompact(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    document.body.setAttribute('data-sidenav-size', checked ? 'sm' : 'default');
  }

}
