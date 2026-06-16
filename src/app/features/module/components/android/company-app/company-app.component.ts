import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { CompanyAppPanelComponent } from './components/company-app-panel/company-app-panel.component';
import { CompanyAppColumnListComponent } from './components/company-app-column-list/company-app-column-list.component';
import { CompanyAppColumnEditComponent } from './components/company-app-column-edit/company-app-column-edit.component';
import { CompanyAppSettingComponent } from './components/company-app-setting/company-app-setting.component';

@Component({
  selector: 'app-company-app',
  templateUrl: './company-app.component.html',
  standalone: true,
  imports: [
    CommonModule,
    CompanyAppPanelComponent,
    CompanyAppColumnListComponent,
    CompanyAppColumnEditComponent,
    CompanyAppSettingComponent

  ],
})
export class CompanyAppComponent implements OnInit {

  ObjectRef = signal('')
  activeTab = signal('panel')


  id!: string;
  LoginType = signal('')


  tabs = [
    { id: 'panel', title: 'panel' },
    { id: 'column-edit', title: 'column-edit' },
    { id: 'column-list', title: 'column-list' },
    { id: 'setting', title: 'setting' },

  ];

  constructor() { }

  ngOnInit(): void {
  }



}
