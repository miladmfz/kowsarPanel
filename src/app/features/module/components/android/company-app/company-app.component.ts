import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { CompanyAppPanelComponent } from './components/company-app-panel/company-app-panel.component';
import { CompanyAppColumnListComponent } from './components/company-app-column-list/company-app-column-list.component';
import { CompanyAppColumnEditComponent } from './components/company-app-column-edit/company-app-column-edit.component';
import { CompanyAppSettingComponent } from './components/company-app-setting/company-app-setting.component';
import { CompanyWebApiService } from '../../../services/CompanyWebApi.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from 'src/app/app-config.service';

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

  ObjectRef = '';
  activeTab = 'panel';


  id!: string;
  JobPersonRef: string = '';


  tabs = [
    { id: 'panel', title: 'panel' },
    { id: 'column-edit', title: 'column-edit' },
    { id: 'column-list', title: 'column-list' },
    { id: 'setting', title: 'setting' },

  ];

  constructor(

  ) { }

  ngOnInit(): void {
  }



}
