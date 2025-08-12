import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../framework-services/shared.service';
import { ThemeService } from '../../framework-services/theme.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {


  constructor(
    private sharedService: SharedService,
    private themeService: ThemeService
  ) { }


  isDarkMode = false;
  ngOnInit(): void {

    const savedTheme = localStorage.getItem('theme') || 'light';
    this.isDarkMode = savedTheme === 'dark';
    this.setTheme(savedTheme as 'light' | 'dark');
    this.CallService()
  }

  CallService() {
    this.sharedService.RefreshAllActions$.subscribe(action => {
      if (action === 'refresh') {
        this.refreshpage();
      }
    });
  }

  refreshpage() {

  }



  toggleTheme(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.isDarkMode = checked;
    this.setTheme(checked ? 'dark' : 'light');

    location.reload();
  }


  setTheme(mode: 'light' | 'dark') {
    const bsLight = document.getElementById('bs-default-stylesheet') as HTMLLinkElement;
    const appLight = document.getElementById('app-default-stylesheet') as HTMLLinkElement;
    const bsDark = document.getElementById('bs-dark-stylesheet') as HTMLLinkElement;
    const appDark = document.getElementById('app-dark-stylesheet') as HTMLLinkElement;

    if (mode === 'dark') {
      bsLight.disabled = true;
      appLight.disabled = true;
      bsDark.disabled = false;
      appDark.disabled = false;
    } else {
      bsLight.disabled = false;
      appLight.disabled = false;
      bsDark.disabled = true;
      appDark.disabled = true;
    }
    localStorage.setItem('theme', mode);
  }



}
