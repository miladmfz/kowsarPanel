import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { BrokerAppColumnListComponent } from './components/broker-app-column-list/broker-app-column-list.component';
import { BrokerAppColumnEditComponent } from './components/broker-app-column-edit/broker-app-column-edit.component';
import { BrokerAppMapComponent } from './components/broker-app-map/broker-app-map.component';
import { BrokerAppPanelComponent } from './components/broker-app-panel/broker-app-panel.component';
import { BrokerAppReportComponent } from './components/broker-app-report/broker-app-report.component';
import { BrokerAppSellbrokerListComponent } from './components/broker-app-sellbroker-list/broker-app-sellbroker-list.component';
import { BrokerAppSettingComponent } from './components/broker-app-setting/broker-app-setting.component';
import { ActivatedRoute, Router } from '@angular/router';
import { BrokerWebApiService } from '../../../services/BrokerWebApi.service';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
  selector: 'app-broker-app',
  templateUrl: './broker-app.component.html',
  standalone: true,
  imports: [
    CommonModule,

    BrokerAppColumnListComponent,
    BrokerAppColumnEditComponent,
    BrokerAppMapComponent,
    BrokerAppPanelComponent,
    BrokerAppReportComponent,
    BrokerAppSellbrokerListComponent,
    BrokerAppSettingComponent


  ],

})
export class BrokerAppComponent implements OnInit {

  ObjectRef = '';
  activeTab = 'panel';


  id!: string;
  JobPersonRef: string = '';


  tabs = [
    { id: 'panel', title: 'panel' },
    { id: 'column-edit', title: 'column-edit' },
    { id: 'column-list', title: 'column-list' },
    { id: 'report', title: 'report' },
    { id: 'map', title: 'map' },
    { id: 'sellbroker-list', title: 'sellbroker-list' },

    { id: 'setting', title: 'setting' },

  ];

  constructor() { }

  ngOnInit(): void {
  }



}
